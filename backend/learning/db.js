// Banco SQLite dedicado ao /learning — de propósito separado de palworld.db (ver decisão no plano:
// o /learning é um produto à parte hospedado no mesmo app; um problema aqui nunca deve afetar o
// banco do jogo). *.db já está no .gitignore da raiz do projeto.
const path = require('path');
const Database = require('better-sqlite3');

const db = new Database(path.join(__dirname, 'learning.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS lesson_progress (
    player_id INTEGER NOT NULL,
    lesson_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'in_progress',
    best_score INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 0,
    attempts INTEGER NOT NULL DEFAULT 0,
    xp_awarded INTEGER NOT NULL DEFAULT 0,
    first_completed_at TEXT,
    last_attempt_at TEXT,
    PRIMARY KEY (player_id, lesson_id)
  );

  CREATE TABLE IF NOT EXISTS learner_stats (
    player_id INTEGER PRIMARY KEY,
    total_xp INTEGER NOT NULL DEFAULT 0,
    current_streak INTEGER NOT NULL DEFAULT 0,
    best_streak INTEGER NOT NULL DEFAULT 0,
    last_practice_date TEXT,
    lessons_completed INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS lesson_session (
    id TEXT PRIMARY KEY,
    player_id INTEGER,        -- NULL para sessão de visitante (1ª lição, sem login)
    lesson_id TEXT NOT NULL,
    started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    correct_count INTEGER NOT NULL DEFAULT 0,
    answered TEXT NOT NULL DEFAULT '[]',
    finished_at TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_lesson_session_player ON lesson_session(player_id, lesson_id);
`);

// Retenção: nada de manter sessão de resposta indefinidamente (o texto digitado nunca é gravado
// aqui, mas os ids de questão respondidas ficam em `answered` — 30 dias é mais que suficiente
// pro fluxo de completar uma lição, que dura minutos).
db.prepare("DELETE FROM lesson_session WHERE started_at < date('now', '-30 days')").run();

module.exports = db;
