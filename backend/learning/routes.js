// Rotas do /learning (trilha de Python). Módulo autocontido: usa seu próprio banco (./db.js) e só
// lê `req.playerId`, já anexado a toda requisição pelo middleware global do server.js — nenhuma
// dependência do resto do jogo.
//
// Segurança: NUNCA execute código enviado pelo usuário aqui (nem eval, nem Function, nem
// child_process). Toda correção é comparação de string contra um gabarito fixo definido no
// currículo (ver ./content e ./answerMatching) — se um dia isso mudar para rodar código Python de
// verdade, vai exigir uma sandbox dedicada, não um atalho aqui.
const express = require('express');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');

const db = require('./db');
const content = require('./content');
const { checkFill } = require('./answerMatching');

const DEFAULT_XP = 20;
const PASS_RATIO = 0.7;
const ID_RE = /^[a-zA-Z0-9_-]{1,64}$/;
const CHOICE_ID_RE = /^[a-zA-Z0-9_-]{1,16}$/;

const answerLimiter = rateLimit({
  windowMs: 60 * 1000, max: 120, standardHeaders: true, legacyHeaders: false,
  message: { error: 'too_many_requests' }
});
const sessionLimiter = rateLimit({
  windowMs: 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false,
  message: { error: 'too_many_requests' }
});

function todayString() {
  return new Date().toISOString().slice(0, 10);
}
function yesterdayString() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

// Constrói o payload público de uma questão campo a campo — nunca espalha (`...q`) o objeto de
// conteúdo, que é onde vive o gabarito (`answer`/`accept`). É a única função que deveria mudar se
// um novo campo de conteúdo precisar ser exposto ao cliente.
function publicQuestion(q) {
  const base = {
    id: q.id,
    kind: q.kind,
    prompt: q.prompt,
    code: q.code || null
  };
  if (q.kind === 'mcq') {
    base.choices = q.choices.map(c => ({ id: c.id, text: c.text }));
  } else {
    base.blankHint = q.blankHint || null;
  }
  return base;
}

// Normaliza os dois formatos de intro aceitos pelo currículo (ver checkIntro em ./content/index.js)
// pro mesmo formato de saída — o front só lida com "slides", nunca precisa saber se a lição foi
// escrita no formato novo (multi-slide) ou no legado (um bloco só, usado hoje pelo curso de Python).
function normalizeIntro(lesson) {
  if (!lesson.intro) return null;
  if (Array.isArray(lesson.intro.slides)) {
    return { slides: lesson.intro.slides.map(s => ({ title: s.title, body: s.body, code: s.code || null })) };
  }
  return { slides: [{ title: lesson.title, body: lesson.intro.body, code: lesson.intro.code || null }] };
}

const getProgressStmt = db.prepare('SELECT * FROM lesson_progress WHERE player_id = ? AND lesson_id = ?');

function getLessonStatus(playerId, entry) {
  if (!playerId) return entry.isFirst ? 'available' : 'locked';
  const progress = getProgressStmt.get(playerId, entry.lesson.id);
  if (progress && progress.status === 'completed') return 'completed';
  if (entry.isFirst) return 'available';
  const prevProgress = getProgressStmt.get(playerId, entry.prevLessonId);
  return prevProgress && prevProgress.status === 'completed' ? 'available' : 'locked';
}

function getOrCreateStats(playerId) {
  let row = db.prepare('SELECT * FROM learner_stats WHERE player_id = ?').get(playerId);
  if (!row) {
    db.prepare('INSERT INTO learner_stats (player_id) VALUES (?)').run(playerId);
    row = db.prepare('SELECT * FROM learner_stats WHERE player_id = ?').get(playerId);
  }
  return row;
}

// learner_stats é UMA linha por jogador, não por curso — XP e sequência são globais (praticar
// qualquer curso conta pra mesma sequência), por isso este payload não depende de course.
function buildStatsPayload(req) {
  const loggedIn = !!req.playerId;
  const stats = loggedIn
    ? getOrCreateStats(req.playerId)
    : { total_xp: 0, current_streak: 0, best_streak: 0, lessons_completed: 0 };
  return {
    totalXp: stats.total_xp,
    currentStreak: stats.current_streak,
    bestStreak: stats.best_streak,
    lessonsCompleted: stats.lessons_completed,
    loggedIn
  };
}

function createLearningRouter() {
  const router = express.Router();

  // Estatísticas globais do aluno (XP total, sequência de dias) — mostradas só no catálogo, por
  // pedido do usuário, em vez de repetidas em cada curso.
  router.get('/stats', (req, res) => {
    res.json(buildStatsPayload(req));
  });

  // Trilha completa de UM curso: módulos, lições (com status de trava/conclusão) e estatísticas do
  // aluno. ?course= é obrigatório — cada curso destrava suas próprias lições de forma independente
  // dos demais (ver isFirst/prevLessonId em ../content/index.js, escopados por curso).
  router.get('/track', (req, res) => {
    const course = content.getCourse(req.query.course);
    if (!course) return res.status(400).json({ error: 'invalid_payload' });

    const loggedIn = !!req.playerId;
    const modules = course.modules.map(mod => ({
      id: mod.id,
      levelKey: mod.levelKey,
      title: mod.title,
      subtitle: mod.subtitle,
      accent: mod.accent,
      lessons: mod.lessons.map(lesson => {
        const entry = content.getLessonEntry(lesson.id);
        const progress = loggedIn ? getProgressStmt.get(req.playerId, lesson.id) : null;
        return {
          id: lesson.id,
          title: lesson.title,
          goal: lesson.goal,
          xp: lesson.xp || DEFAULT_XP,
          questionCount: lesson.questions.length,
          status: getLessonStatus(req.playerId, entry),
          bestScore: progress?.best_score ?? 0
        };
      })
    }));

    res.json({
      course: { id: course.id, title: course.title, subtitle: course.subtitle },
      stats: buildStatsPayload(req),
      modules
    });
  });

  // Abre uma sessão de tentativa e devolve as questões SEM gabarito nem explicação. Visitante
  // (sem login) só consegue abrir a 1ª lição da trilha inteira — as demais exigem conta.
  router.post('/lessons/:lessonId/start', sessionLimiter, (req, res) => {
    const { lessonId } = req.params;
    if (!ID_RE.test(lessonId)) return res.status(400).json({ error: 'invalid_payload' });

    const entry = content.getLessonEntry(lessonId);
    if (!entry) return res.status(404).json({ error: 'lesson_not_found' });

    const status = getLessonStatus(req.playerId, entry);
    if (status === 'locked') return res.status(403).json({ error: 'lesson_locked' });

    if (req.playerId) {
      db.prepare('DELETE FROM lesson_session WHERE player_id = ? AND lesson_id = ? AND finished_at IS NULL')
        .run(req.playerId, lessonId);
    }

    const sessionId = crypto.randomUUID();
    db.prepare('INSERT INTO lesson_session (id, player_id, lesson_id) VALUES (?, ?, ?)')
      .run(sessionId, req.playerId, lessonId);

    res.json({
      sessionId,
      lesson: {
        id: entry.lesson.id,
        title: entry.lesson.title,
        goal: entry.lesson.goal,
        xpReward: entry.lesson.xp || DEFAULT_XP,
        intro: normalizeIntro(entry.lesson),
        questions: entry.lesson.questions.map(q => publicQuestion(q))
      }
    });
  });

  // Corrige uma resposta e devolve feedback imediato. Idempotente: responder a mesma questão de
  // novo na mesma sessão só repete o resultado já registrado, sem recontar.
  router.post('/sessions/:sessionId/answer', answerLimiter, (req, res) => {
    const { sessionId } = req.params;
    const { questionId, choiceId, text } = req.body || {};
    if (!ID_RE.test(sessionId) || typeof questionId !== 'string' || !ID_RE.test(questionId)) {
      return res.status(400).json({ error: 'invalid_payload' });
    }

    // player_id IS ? é null-safe: casa tanto sessão de visitante (player_id NULL) quanto de
    // usuário logado, sem deixar um jogador ler/responder a sessão de outro (ver ./db.js).
    const session = db.prepare('SELECT * FROM lesson_session WHERE id = ? AND player_id IS ?').get(sessionId, req.playerId);
    if (!session) return res.status(404).json({ error: 'session_not_found' });
    if (session.finished_at) return res.status(400).json({ error: 'session_finished' });

    const entry = content.getLessonEntry(session.lesson_id);
    const question = entry?.lesson.questions.find(q => q.id === questionId);
    if (!question) return res.status(400).json({ error: 'unknown_question' });

    const answered = JSON.parse(session.answered);
    const already = answered.find(a => a.id === questionId);

    if (already) {
      return res.json({
        correct: already.correct,
        alreadyAnswered: true,
        correctChoiceId: question.kind === 'mcq' ? question.answer : undefined,
        canonicalAnswer: question.kind === 'fill' ? question.accept[0] : undefined,
        explanation: question.explanation,
        progress: { answered: answered.length, total: entry.lesson.questions.length, correct: session.correct_count }
      });
    }

    let correct = false;
    let caseWarning = false;
    if (question.kind === 'mcq') {
      if (typeof choiceId !== 'string' || !CHOICE_ID_RE.test(choiceId)) return res.status(400).json({ error: 'invalid_payload' });
      correct = choiceId === question.answer;
    } else {
      if (typeof text !== 'string') return res.status(400).json({ error: 'invalid_payload' });
      const match = checkFill(text, question);
      correct = match.correct;
      caseWarning = !!match.caseWarning;
    }

    answered.push({ id: questionId, correct });
    const newCorrectCount = session.correct_count + (correct ? 1 : 0);
    db.prepare('UPDATE lesson_session SET answered = ?, correct_count = ? WHERE id = ?')
      .run(JSON.stringify(answered), newCorrectCount, sessionId);

    res.json({
      correct,
      caseWarning,
      correctChoiceId: question.kind === 'mcq' ? question.answer : undefined,
      canonicalAnswer: question.kind === 'fill' ? question.accept[0] : undefined,
      explanation: question.explanation,
      progress: { answered: answered.length, total: entry.lesson.questions.length, correct: newCorrectCount }
    });
  });

  // Fecha a sessão ativa da lição e credita XP/streak. Exige login (visitante recebe login_required
  // e a tela convida a criar conta) — sem isso não haveria onde persistir o progresso. A nota vem
  // inteira da sessão gravada no servidor; nada enviado pelo cliente é usado para pontuar.
  router.post('/lessons/:lessonId/complete', sessionLimiter, (req, res) => {
    const { lessonId } = req.params;
    if (!ID_RE.test(lessonId)) return res.status(400).json({ error: 'invalid_payload' });
    if (!req.playerId) return res.status(401).json({ error: 'login_required' });

    const entry = content.getLessonEntry(lessonId);
    if (!entry) return res.status(404).json({ error: 'lesson_not_found' });

    const session = db.prepare(
      'SELECT * FROM lesson_session WHERE player_id = ? AND lesson_id = ? AND finished_at IS NULL ORDER BY started_at DESC LIMIT 1'
    ).get(req.playerId, lessonId);
    if (!session) return res.status(404).json({ error: 'session_not_found' });

    const total = entry.lesson.questions.length;
    const answered = JSON.parse(session.answered);
    if (answered.length < total) return res.status(400).json({ error: 'lesson_incomplete' });

    const score = session.correct_count;
    const passed = score / total >= PASS_RATIO;
    const nowIso = new Date().toISOString();
    const today = todayString();

    const result = db.transaction(() => {
      db.prepare('UPDATE lesson_session SET finished_at = ? WHERE id = ?').run(nowIso, session.id);

      const progress = db.prepare('SELECT * FROM lesson_progress WHERE player_id = ? AND lesson_id = ?')
        .get(req.playerId, lessonId);
      // XP integral só na 1ª conclusão aprovada de cada lição (xp_awarded funciona como um recibo
      // por lição) — repetir a lição atualiza a melhor nota e o streak, mas não paga XP de novo.
      const isFirstCompletionEver = passed && (!progress || progress.xp_awarded === 0);
      const xpGained = isFirstCompletionEver ? (entry.lesson.xp || DEFAULT_XP) : 0;

      if (!progress) {
        db.prepare(`
          INSERT INTO lesson_progress
            (player_id, lesson_id, status, best_score, total_questions, attempts, xp_awarded, first_completed_at, last_attempt_at)
          VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)
        `).run(req.playerId, lessonId, passed ? 'completed' : 'in_progress', score, total, xpGained, passed ? nowIso : null, nowIso);
      } else {
        db.prepare(`
          UPDATE lesson_progress
          SET status = ?, best_score = ?, total_questions = ?, attempts = attempts + 1,
              xp_awarded = ?, first_completed_at = ?, last_attempt_at = ?
          WHERE player_id = ? AND lesson_id = ?
        `).run(
          passed ? 'completed' : progress.status,
          Math.max(progress.best_score, score), total,
          progress.xp_awarded + xpGained,
          progress.first_completed_at || (passed ? nowIso : null),
          nowIso, req.playerId, lessonId
        );
      }

      const stats = getOrCreateStats(req.playerId);
      let { current_streak: currentStreak, best_streak: bestStreak, last_practice_date: lastPracticeDate, lessons_completed: lessonsCompleted, total_xp: totalXp } = stats;
      let streakIncreasedToday = false;

      if (passed) {
        if (lastPracticeDate !== today) {
          currentStreak = lastPracticeDate === yesterdayString() ? currentStreak + 1 : 1;
          bestStreak = Math.max(bestStreak, currentStreak);
          lastPracticeDate = today;
          streakIncreasedToday = true;
        }
        if (isFirstCompletionEver) lessonsCompleted += 1;
      }
      totalXp += xpGained;

      db.prepare(`
        UPDATE learner_stats
        SET total_xp = ?, current_streak = ?, best_streak = ?, last_practice_date = ?, lessons_completed = ?
        WHERE player_id = ?
      `).run(totalXp, currentStreak, bestStreak, lastPracticeDate, lessonsCompleted, req.playerId);

      return {
        score, total, passed, xpGained,
        firstCompletion: isFirstCompletionEver,
        streakIncreasedToday,
        nextLessonId: passed ? entry.nextLessonId : null,
        stats: { totalXp, currentStreak, bestStreak, lessonsCompleted, loggedIn: true }
      };
    })();

    res.json(result);
  });

  return router;
}

module.exports = { createLearningRouter };
