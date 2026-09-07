// Normalização e comparação de respostas digitadas (questões "fill"). Isto NUNCA executa código:
// é comparação de string contra uma lista de variantes aceitas, definida por quem escreve o
// currículo (ver content/*.js). Não adicionar eval/Function/child_process aqui.

const MAX_INPUT_LENGTH = 200;

// Aspas tipográficas (que teclados de celular colocam sozinhos) viram aspas retas — maior causa
// de "falso erro" numa resposta que o aluno digitou certo.
const QUOTE_MAP = { '“': '"', '”': '"', '‘': "'", '’': "'" };

function normalize(raw, { stripSpaces = false } = {}) {
  if (typeof raw !== 'string') return null;
  if (raw.length > MAX_INPUT_LENGTH) return null;

  let s = raw.normalize('NFKC');
  for (const [from, to] of Object.entries(QUOTE_MAP)) s = s.split(from).join(to);
  s = s.trim().replace(/\s+/g, ' ');
  if (stripSpaces) s = s.replace(/\s+/g, '');
  return s;
}

// Pré-computa (no boot) as variantes aceitas já normalizadas, pra não normalizar de novo a cada
// requisição.
function buildAcceptSet(accept, matching) {
  return accept.map(a => normalize(a, matching)).filter(Boolean);
}

// question precisa trazer: accept (array de strings, já validado em content/index.js) e,
// opcionalmente, matching: { caseSensitive, stripSpaces }.
function checkFill(rawInput, question) {
  const matching = question.matching || {};
  const normalizedInput = normalize(rawInput, matching);
  if (normalizedInput === null) return { correct: false, canonicalAnswer: question.accept[0] };

  const acceptedSet = buildAcceptSet(question.accept, matching);
  const canonicalAnswer = question.accept[0];

  if (acceptedSet.includes(normalizedInput)) {
    return { correct: true, canonicalAnswer };
  }

  if (matching.caseSensitive) {
    return { correct: false, canonicalAnswer };
  }

  // Só bateu ignorando maiúsculas/minúsculas — aceita, mas avisa (Python diferencia caixa de
  // verdade, ex: True vs true). É o comportamento "typo aceito" do Duolingo: não pune quem
  // acertou o conceito por um detalhe de digitação.
  const lowerInput = normalizedInput.toLowerCase();
  const lowerMatch = acceptedSet.some(a => a.toLowerCase() === lowerInput);
  if (lowerMatch) {
    return { correct: true, canonicalAnswer, caseWarning: true };
  }

  return { correct: false, canonicalAnswer };
}

module.exports = { normalize, checkFill, MAX_INPUT_LENGTH };
