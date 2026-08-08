const express = require('express');
const rateLimit = require('express-rate-limit');
const { hashPassword, verifyPassword } = require('./passwords');

const USERNAME_RE = /^[a-zA-Z0-9_]{3,24}$/;

// Rejeita tentativas erradas de login/cadastro em excesso — dificulta força bruta.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'too_many_attempts' }
});

function safeUser(row) {
  return { id: row.id, username: row.username };
}

// onUserCreated(userId) é chamado logo após o registro pra que o server.js (que é quem
// conhece a tabela `players`) crie/vincule o perfil de jogo — o módulo de auth não precisa
// saber nada sobre gold_coins, cartas, etc.
// Sem e-mail de propósito: só usuário + senha, pra não guardar dado pessoal (e-mail) que
// não é usado pra nada no jogo — menos exposição em caso de vazamento.
function createAuthRouter(db, { onUserCreated }) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  // Upgrade de banco já existente: schema antigo tinha e-mail obrigatório. Reconstrói a
  // tabela sem essa coluna (usuários já criados são preservados, só perdem o e-mail salvo).
  // Cuidado: `players.user_id` referencia `users(id)` — renomear a tabela `users` faz o
  // SQLite reescrever essa referência automaticamente pro nome temporário, e ela fica
  // "perdida" depois. Por isso construímos a tabela nova com outro nome e só ela é renomeada
  // (nada referencia `users_new`, então não tem o que o SQLite reescrever).
  const hasEmailColumn = !!db.prepare('SELECT 1 FROM pragma_table_info(?) WHERE name = ?').get('users', 'email');
  if (hasEmailColumn) {
    db.exec(`
      CREATE TABLE users_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    db.exec('INSERT INTO users_new (id, username, password_hash, created_at) SELECT id, username, password_hash, created_at FROM users');
    db.exec('DROP TABLE users');
    db.exec('ALTER TABLE users_new RENAME TO users');
  }

  const router = express.Router();

  router.post('/register', authLimiter, async (req, res, next) => {
    try {
      const { username, password } = req.body || {};

      if (typeof username !== 'string' || !USERNAME_RE.test(username)) {
        return res.status(400).json({ error: 'invalid_username' });
      }
      if (typeof password !== 'string' || password.length < 8) {
        return res.status(400).json({ error: 'invalid_password' });
      }

      const passwordHash = await hashPassword(password);

      // Insere o usuário e vincula o perfil de jogo (onUserCreated) na mesma transação —
      // se a 2ª parte falhar, a 1ª também é desfeita (sem usuário "órfão" sem perfil).
      const registerTx = db.transaction(() => {
        const result = db.prepare(
          'INSERT INTO users (username, password_hash) VALUES (?, ?)'
        ).run(username, passwordHash);
        onUserCreated(result.lastInsertRowid);
        return result.lastInsertRowid;
      });

      let userId;
      try {
        userId = registerTx();
      } catch (err) {
        if (String(err.message).includes('users.username')) {
          return res.status(409).json({ error: 'username_taken' });
        }
        throw err;
      }

      req.session.regenerate((err) => {
        if (err) return next(err);
        req.session.userId = userId;
        res.json({ user: { id: userId, username } });
      });
    } catch (err) {
      next(err);
    }
  });

  router.post('/login', authLimiter, async (req, res, next) => {
    try {
      const { username, password } = req.body || {};
      if (typeof username !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ error: 'invalid_credentials' });
      }

      const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

      // Mesma resposta de erro tanto pra "usuário não existe" quanto "senha errada" — não
      // dá pra um atacante distinguir as duas coisas.
      if (!user) return res.status(401).json({ error: 'invalid_credentials' });

      const valid = await verifyPassword(password, user.password_hash);
      if (!valid) return res.status(401).json({ error: 'invalid_credentials' });

      req.session.regenerate((err) => {
        if (err) return next(err);
        req.session.userId = user.id;
        res.json({ user: safeUser(user) });
      });
    } catch (err) {
      next(err);
    }
  });

  router.post('/logout', (req, res, next) => {
    req.session.destroy((err) => {
      if (err) return next(err);
      res.clearCookie('connect.sid');
      res.json({ loggedOut: true });
    });
  });

  router.get('/me', (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'not_authenticated' });
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId);
    if (!user) return res.status(401).json({ error: 'not_authenticated' });
    res.json({ user: safeUser(user) });
  });

  return router;
}

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'not_authenticated' });
  next();
}

module.exports = { createAuthRouter, requireAuth };
