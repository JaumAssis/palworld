const session = require('express-session');

const DEFAULT_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7; // 7 dias

// Store próprio em cima do better-sqlite3 já usado no resto do projeto — evita depender do
// pacote better-sqlite3-session-store (GPL-3.0 e pouco mantido) só pra um get/set/destroy simples.
class SqliteSessionStore extends session.Store {
  constructor(db) {
    super();
    this.db = db;

    db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        expires INTEGER NOT NULL
      )
    `);

    this._get = db.prepare('SELECT data, expires FROM sessions WHERE sid = ?');
    this._upsert = db.prepare(`
      INSERT INTO sessions (sid, data, expires) VALUES (?, ?, ?)
      ON CONFLICT(sid) DO UPDATE SET data = excluded.data, expires = excluded.expires
    `);
    this._destroy = db.prepare('DELETE FROM sessions WHERE sid = ?');
    this._touch = db.prepare('UPDATE sessions SET expires = ? WHERE sid = ?');

    db.prepare('DELETE FROM sessions WHERE expires < ?').run(Date.now());
  }

  get(sid, callback) {
    try {
      const row = this._get.get(sid);
      if (!row || row.expires < Date.now()) return callback(null, null);
      callback(null, JSON.parse(row.data));
    } catch (err) {
      callback(err);
    }
  }

  set(sid, sessionData, callback) {
    try {
      const expires = Date.now() + (sessionData.cookie?.maxAge ?? DEFAULT_MAX_AGE_MS);
      this._upsert.run(sid, JSON.stringify(sessionData), expires);
      callback(null);
    } catch (err) {
      callback(err);
    }
  }

  destroy(sid, callback) {
    try {
      this._destroy.run(sid);
      callback(null);
    } catch (err) {
      callback(err);
    }
  }

  touch(sid, sessionData, callback) {
    try {
      const expires = Date.now() + (sessionData.cookie?.maxAge ?? DEFAULT_MAX_AGE_MS);
      this._touch.run(expires, sid);
      callback(null);
    } catch (err) {
      callback(err);
    }
  }
}

module.exports = SqliteSessionStore;
