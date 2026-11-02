// Textos de interface do /learning — só em português (decisão específica desta feature, sem pt/en).
// De propósito separado de ../i18n/translations.js: o /learning é um produto à parte, não deveria
// exigir tocar em arquivo do jogo pra crescer seu próprio texto.
const t = {
  brandName: 'python.trilha',

  // ---------- tela inicial do /learning (2 quadrados) ----------
  landingTitle: 'GameBox Learning',
  landingSubtitle: 'Biblioteca gratuita de conhecimento',
  landingCatalogTitle: 'Catálogo',
  landingInstallTitle: 'Instalação',
  landingMinigamesTitle: 'Minigames',
  landingComingSoonTag: 'Em breve',

  // ---------- catálogo (/learning/catalogo) ----------
  backToLandingButton: 'Voltar à tela inicial',
  catalogTitle: 'Trilhas de Aprendizado',
  catalogSubtitle: 'Escolha um curso para começar.',
  xpLabel: 'XP',
  streakLabel: ({ n }) => `${n} dia${n === 1 ? '' : 's'} seguido${n === 1 ? '' : 's'}`,
  streakLabelZero: 'Comece sua sequência hoje',
  catalogVisitorBanner: 'Crie uma conta ou entre para salvar seu progresso em qualquer curso.',
  catalogLoginCta: 'Entrar',
  catalogRegisterCta: 'Criar conta',
  catalogAvailableTag: 'Disponível',
  courseLogicaTitle: 'Lógica de Programação',
  courseLogicaDescription: 'Algoritmos, fluxogramas e pseudocódigo — a base antes de qualquer linguagem.',
  coursePythonTitle: 'Python',
  coursePythonDescription: 'Do zero ao avançado, uma lição de cada vez.',
  courseRustTitle: 'Rust',
  courseRustDescription: 'Ownership, borrowing e a segurança de memória sem garbage collector.',
  courseArduinoTitle: 'Arduino',
  courseArduinoDescription: 'Eletrônica e programação de microcontroladores: do primeiro LED ao firmware profissional.',
  courseGamemakerTitle: 'Desenvolvimento de Jogos (GameMaker)',
  courseGamemakerDescription: 'Sprites, objetos, eventos e a lógica por trás dos seus primeiros jogos.',
  courseSpedTitle: 'SPED: Escrituração Fiscal e Contábil',
  courseSpedDescription: 'Os jargões e a lógica por trás da ECD, ECF, EFD Fiscal e EFD Contribuições.',
  courseContainersTitle: 'Containers (Docker)',
  courseContainersDescription: 'Imagens, Dockerfile, Compose e a operação segura de containers: do primeiro run à produção.',
  courseRedesTitle: 'Redes de Computadores',
  courseRedesDescription: 'Do cabo e do endereço IP até roteamento, segurança e a arquitetura da internet.',
  courseCsharpTitle: 'C# e .NET',
  courseCsharpDescription: 'Da primeira linha de C# a APIs, nuvem e performance na plataforma .NET.',
  courseDistribuidaTitle: 'Computação Distribuída',
  courseDistribuidaDescription: 'Como sistemas em várias máquinas funcionam, falham e escalam: do básico ao consenso e à operação em escala.',
  courseLinuxTitle: 'Linux',
  courseLinuxDescription: 'Do primeiro comando no terminal à administração e aos internals do sistema.',
  courseOwaspTitle: 'Segurança de Aplicações Web (OWASP)',
  courseOwaspDescription: 'As vulnerabilidades mais comuns em aplicações web e como prevenir, testar e detectar cada uma.',

  // ---------- catálogo: cursos "em breve" (só visual, sem conteúdo/rota por trás) ----------
  comingSoon_cybersecurity_title: 'Cibersegurança',
  comingSoon_cybersecurity_desc: 'Fundamentos de proteção de sistemas, redes e dados contra ataques.',
  comingSoon_nodejs_title: 'Node.js',
  comingSoon_nodejs_desc: 'JavaScript no back-end: servidores, APIs e aplicações em tempo real.',
  comingSoon_frontend_title: 'Frameworks Frontend (React, Angular, Vue)',
  comingSoon_frontend_desc: 'Construindo interfaces modernas com os frameworks mais usados do mercado.',
  comingSoon_php_title: 'PHP',
  comingSoon_php_desc: 'Uma das linguagens mais usadas para desenvolvimento web no back-end.',
  comingSoon_bigdata_title: 'Big Data',
  comingSoon_bigdata_desc: 'Processar e analisar grandes volumes de dados.',
  comingSoon_nuvemModelos_title: 'Modelos de Nuvem (SaaS, IaaS, PaaS)',
  comingSoon_nuvemModelos_desc: 'As diferentes formas de consumir software e infraestrutura como serviço.',
  comingSoon_iac_title: 'Infraestrutura como Código',
  comingSoon_iac_desc: 'Provisionar e gerenciar servidores e redes através de código.',
  comingSoon_cloud_title: 'Computação em Nuvem',
  comingSoon_cloud_desc: 'Fundamentos de serviços de nuvem: armazenamento, servidores e escalabilidade.',

  // ---------- trilha (qualquer curso) ----------
  backToCatalogButton: 'Voltar aos cursos',
  trackLoading: 'Carregando trilha...',
  trackLoadError: 'Não foi possível carregar a trilha. Tente recarregar a página.',
  levelName_beginner: 'Iniciante',
  levelName_intermediate: 'Intermediário',
  levelName_advanced: 'Avançado',
  lessonStatusCompleted: 'Concluída',
  lessonStatusAvailable: 'Disponível',
  lessonStatusLocked: 'Bloqueada',
  lessonLockedHint: 'Complete a lição anterior para desbloquear.',
  lessonXpBadge: ({ xp }) => `+${xp} XP`,
  lessonStart: 'Começar',
  lessonReview: 'Revisar',

  // ---------- lição (fluxo de questões) ----------
  lessonLoading: 'Preparando a lição...',
  lessonLoadError: 'Não foi possível abrir esta lição.',
  introStartButton: 'Começar perguntas',
  introPrevButton: 'Voltar',
  introNextButton: 'Próximo',
  introSlideCounter: ({ n, total }) => `${n}/${total}`,
  questionCounter: ({ n, total }) => `Pergunta ${n} de ${total}`,
  fillPlaceholder: 'Digite a resposta...',
  checkButton: 'Corrigir',
  nextButton: 'Continuar',
  finishButton: 'Ver resultado',
  feedbackCorrect: 'Certo!',
  feedbackWrong: 'Não foi dessa vez.',
  feedbackCaseWarning: ({ answer }) => `Aceito — mas repare: Python diferencia maiúsculas de minúsculas. O certo é "${answer}".`,
  feedbackCorrectAnswerWas: ({ answer }) => `A resposta certa era "${answer}".`,
  exitLessonConfirm: 'Sair agora? Seu progresso nesta tentativa será perdido.',
  exitLessonConfirmYes: 'Sair',
  exitLessonConfirmNo: 'Continuar lição',

  // ---------- resultado da lição ----------
  resultTitlePassed: 'Lição concluída!',
  resultTitleFailed: 'Quase lá',
  resultScore: ({ correct, total }) => `${correct} de ${total} corretas`,
  resultFailedHint: 'Você precisa acertar pelo menos 70% para concluir. Tente de novo!',
  retryButton: 'Tentar de novo',
  nextLessonButton: 'Próxima lição',
  backToTrackButton: 'Voltar à trilha',

  // ---------- login / criar conta (caixa própria do /learning) ----------
  authModalLoginTitle: 'Entrar',
  authModalRegisterTitle: 'Criar conta',
  authModalClose: 'Fechar',
  authUsernamePlaceholder: 'Usuário',
  authPasswordPlaceholder: 'Senha',
  authConfirmPasswordPlaceholder: 'Confirmar senha',
  authLoginBtn: 'Entrar',
  authRegisterBtn: 'Criar conta',
  authSwitchToRegister: 'Não tem conta? Criar uma',
  authSwitchToLogin: 'Já tem conta? Entrar',
  authRegisterConfirmMsg: 'No momento não temos integração com e-mail. Escolha uma senha forte e anote-a — perdê-la significa perder o acesso à conta. Deseja continuar?',
  authRegisterConfirmYes: 'Sim',
  authRegisterConfirmNo: 'Não',
  authError_password_mismatch: 'As senhas não coincidem.',
  authError_invalid_username: 'Usuário deve ter 3-24 letras, números ou _.',
  authError_invalid_password: 'Senha deve ter no mínimo 8 caracteres.',
  authError_username_taken: 'Esse usuário já existe.',
  authError_invalid_credentials: 'Usuário ou senha incorretos.',
  authError_too_many_attempts: 'Muitas tentativas. Aguarde um pouco e tente de novo.',
  authError_not_authenticated: 'Faça login pra continuar.',
  authError_unknown: 'Não foi possível completar a ação. Tente de novo.',

  // ---------- erros da API ----------
  learningError_lesson_locked: 'Essa lição ainda está bloqueada.',
  learningError_lesson_not_found: 'Lição não encontrada.',
  learningError_session_not_found: 'Sua sessão expirou. Volte à trilha e comece de novo.',
  learningError_session_finished: 'Essa tentativa já foi encerrada.',
  learningError_lesson_incomplete: 'Responda todas as perguntas antes de continuar.',
  learningError_login_required: 'Crie uma conta para salvar seu progresso.',
  learningError_invalid_payload: 'Algo deu errado com a sua resposta. Tente de novo.',
  learningError_too_many_requests: 'Muitas tentativas em pouco tempo. Espere um instante.',
  learningError_unknown: 'Não foi possível completar a ação. Tente de novo.'
};

export function useLearningT() {
  return (key, params) => {
    const entry = t[key];
    if (entry === undefined) return key;
    return typeof entry === 'function' ? entry(params) : entry;
  };
}
