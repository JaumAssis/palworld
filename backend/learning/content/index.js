// Carrega o currículo do /learning: cada pasta em courses/<curso>/ é um curso independente
// (meta.js + arquivos `NN-slug.js`, cada um um módulo com suas lições), validado tudo no boot.
// Adicionar lição/módulo = editar/criar um arquivo dentro do curso; adicionar curso novo = criar
// uma pasta nova em courses/ com seu meta.js — nenhuma mudança de lógica em nenhum dos casos.
// Gabarito (answer/accept) só existe aqui e no processo do servidor — nunca é serializado direto
// para o cliente (ver publicQuestion em ../routes.js). Conteúdo só em português (sem i18n) —
// decisão específica desta feature.
const fs = require('fs');
const path = require('path');

const MODULE_FILE_RE = /^\d\d-.+\.js$/;
const COURSES_DIR = path.join(__dirname, 'courses');
const LEVEL_KEYS = ['beginner', 'intermediate', 'advanced'];

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function checkText(value, where, errors) {
  if (!isNonEmptyString(value)) errors.push(`${where}: texto ausente ou vazio`);
}

// Confere o padrão fixo do produto: a cada 4 questões, as 3 primeiras são múltipla escolha e a
// 4ª é preencher lacuna (kind 'fill'). Checado por posição (não por contagem), pra pegar currículo
// fora de ordem também, não só fora de proporção.
function checkQuestionPattern(questions, lessonId, errors) {
  if (!Array.isArray(questions) || questions.length === 0 || questions.length % 4 !== 0) {
    errors.push(`lição "${lessonId}": precisa de um número de questões múltiplo de 4 (tem ${questions?.length ?? 0})`);
    return;
  }
  questions.forEach((q, i) => {
    const expectedKind = (i + 1) % 4 === 0 ? 'fill' : 'mcq';
    if (q.kind !== expectedKind) {
      errors.push(`lição "${lessonId}", questão ${i + 1} (id "${q.id}"): esperado kind "${expectedKind}", veio "${q.kind}"`);
    }
  });
}

function checkQuestion(q, lessonId, errors) {
  const where = `lição "${lessonId}", questão "${q.id}"`;
  if (!isNonEmptyString(q.id)) errors.push(`${where}: id ausente`);
  checkText(q.prompt, `${where}.prompt`, errors);
  checkText(q.explanation, `${where}.explanation`, errors);

  if (q.kind === 'mcq') {
    if (!Array.isArray(q.choices) || q.choices.length < 2) {
      errors.push(`${where}: mcq precisa de pelo menos 2 alternativas`);
    } else {
      const ids = new Set();
      for (const c of q.choices) {
        if (!isNonEmptyString(c.id)) errors.push(`${where}: alternativa sem id`);
        if (ids.has(c.id)) errors.push(`${where}: alternativa duplicada "${c.id}"`);
        ids.add(c.id);
        checkText(c.text, `${where}.choices[${c.id}].text`, errors);
      }
      if (!isNonEmptyString(q.answer) || !ids.has(q.answer)) {
        errors.push(`${where}: answer "${q.answer}" não corresponde a nenhuma alternativa`);
      }
    }
  } else if (q.kind === 'fill') {
    if (!Array.isArray(q.accept) || q.accept.length === 0 || !q.accept.every(isNonEmptyString)) {
      errors.push(`${where}: fill precisa de "accept" (lista de strings não vazia)`);
    }
    if (!isNonEmptyString(q.code) || !q.code.includes('___')) {
      errors.push(`${where}: fill precisa de "code" contendo o marcador de lacuna "___"`);
    }
  } else {
    errors.push(`${where}: kind desconhecido "${q.kind}" (esperado "mcq" ou "fill")`);
  }
}

function loadCourseDir(courseId) {
  const courseDir = path.join(COURSES_DIR, courseId);
  const meta = require(path.join(courseDir, 'meta.js'));
  const moduleFiles = fs.readdirSync(courseDir)
    .filter(f => MODULE_FILE_RE.test(f))
    .sort()
    .map(f => ({ file: `${courseId}/${f}`, mod: require(path.join(courseDir, f)) }));
  return { courseId, meta, moduleFiles };
}

function loadAllCourses() {
  return fs.readdirSync(COURSES_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => loadCourseDir(d.name));
}

function checkCourseMeta(meta, courseId, errors) {
  if (!isNonEmptyString(meta.id) || meta.id !== courseId) {
    errors.push(`curso na pasta "${courseId}": meta.id ("${meta.id}") precisa ser igual ao nome da pasta`);
  }
  if (!Number.isInteger(meta.order)) errors.push(`curso "${courseId}": order ausente ou inválido`);
  checkText(meta.title, `curso "${courseId}".title`, errors);
  checkText(meta.subtitle, `curso "${courseId}".subtitle`, errors);
  if (!isNonEmptyString(meta.accent)) errors.push(`curso "${courseId}": accent ausente`);
}

// Valida o currículo inteiro (todos os cursos) e derruba o boot (com mensagem clara) se algo
// estiver errado — conteúdo quebrado nunca deve ir para o ar em silêncio. ids de lição são únicos
// GLOBALMENTE (entre todos os cursos), porque o banco (lesson_progress/lesson_session) chaveia só
// por lesson_id, sem coluna de curso — mais simples, e não há necessidade real de repetir um id.
function validateAll(rawCourses) {
  const errors = [];
  const courseIds = new Set();
  const moduleIds = new Set();
  const lessonIds = new Set();

  const courses = rawCourses.map(({ courseId, meta, moduleFiles }) => {
    checkCourseMeta(meta, courseId, errors);
    if (courseIds.has(meta.id)) errors.push(`curso duplicado: "${meta.id}"`);
    courseIds.add(meta.id);

    const modules = [];
    for (const { file, mod } of moduleFiles) {
      if (!isNonEmptyString(mod.id)) errors.push(`${file}: módulo sem id`);
      if (moduleIds.has(mod.id)) errors.push(`${file}: módulo com id duplicado "${mod.id}"`);
      moduleIds.add(mod.id);

      if (!LEVEL_KEYS.includes(mod.levelKey)) errors.push(`módulo "${mod.id}": levelKey inválido "${mod.levelKey}"`);
      checkText(mod.title, `módulo "${mod.id}".title`, errors);
      checkText(mod.subtitle, `módulo "${mod.id}".subtitle`, errors);
      if (!isNonEmptyString(mod.accent)) errors.push(`módulo "${mod.id}": accent ausente`);

      if (!Array.isArray(mod.lessons) || mod.lessons.length === 0) {
        errors.push(`módulo "${mod.id}": sem lições`);
        continue;
      }

      for (const lesson of mod.lessons) {
        if (!isNonEmptyString(lesson.id)) { errors.push(`módulo "${mod.id}": lição sem id`); continue; }
        if (lessonIds.has(lesson.id)) errors.push(`lição com id duplicado globalmente: "${lesson.id}"`);
        lessonIds.add(lesson.id);

        checkText(lesson.title, `lição "${lesson.id}".title`, errors);
        checkText(lesson.goal, `lição "${lesson.id}".goal`, errors);
        if (lesson.xp !== undefined && !(Number.isInteger(lesson.xp) && lesson.xp > 0)) {
          errors.push(`lição "${lesson.id}": xp precisa ser inteiro positivo`);
        }
        if (lesson.intro) checkText(lesson.intro.body, `lição "${lesson.id}".intro.body`, errors);

        const questionIds = new Set();
        for (const q of lesson.questions || []) {
          if (questionIds.has(q.id)) errors.push(`lição "${lesson.id}": questão com id duplicado "${q.id}"`);
          questionIds.add(q.id);
          checkQuestion(q, lesson.id, errors);
        }
        checkQuestionPattern(lesson.questions, lesson.id, errors);
      }

      modules.push(mod);
    }

    modules.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return { ...meta, modules };
  });

  if (errors.length > 0) {
    throw new Error(
      `Currículo do /learning inválido (${errors.length} problema(s)):\n - ${errors.join('\n - ')}`
    );
  }

  return courses.sort((a, b) => a.order - b.order);
}

// Índice único: lessonId -> { course, module, lesson, index, prevLessonId, nextLessonId, isFirst },
// onde index/prevLessonId/nextLessonId/isFirst são relativos à sequência do PRÓPRIO curso (cada
// curso destrava suas lições de forma independente dos demais).
function buildLessonIndex(courses) {
  const lessonById = new Map();
  for (const course of courses) {
    const flat = [];
    for (const mod of course.modules) {
      for (const lesson of mod.lessons) flat.push({ module: mod, lesson });
    }
    flat.forEach(({ module, lesson }, index) => {
      lessonById.set(lesson.id, {
        course,
        module,
        lesson,
        index,
        prevLessonId: index > 0 ? flat[index - 1].lesson.id : null,
        nextLessonId: flat[index + 1]?.lesson.id ?? null,
        isFirst: index === 0
      });
    });
  }
  return lessonById;
}

const courses = validateAll(loadAllCourses());
const lessonById = buildLessonIndex(courses);

module.exports = {
  courses,
  getCourse(courseId) {
    return courses.find(c => c.id === courseId) || null;
  },
  getLessonEntry(lessonId) {
    return lessonById.get(lessonId) || null;
  }
};
