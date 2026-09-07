// Primitivos visuais do /learning — pele "digital/dev", separada do tema western do jogo (ver
// learning.css, classes com prefixo learn-). Mesmo padrão de GameBoardUI.jsx: named exports,
// componentes pequenos e sem estado próprio, recebendo tudo via props.
import './learning.css'

// promptPath muda conforme o curso atual — "trilha" no catálogo, "trilha-python" dentro do curso
// de Python, "trilha-<curso>" quando outros cursos existirem.
export function TerminalTopBar({ children, promptPath = 'trilha' }) {
  return (
    <div className="learn-topbar">
      <span className="learn-prompt">~/{promptPath} $<span className="learn-caret" /></span>
      <div className="learn-topbar-actions">{children}</div>
    </div>
  )
}

export function CodeBlock({ code }) {
  if (!code) return null
  return <pre className="learn-code"><code>{code}</code></pre>
}

export function ProgressBar({ current, total }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0
  return (
    <div className="learn-progress-bar" role="progressbar" aria-valuenow={current} aria-valuemin={0} aria-valuemax={total}>
      <div className="learn-progress-bar-fill" style={{ width: `${pct}%` }} />
    </div>
  )
}

const STATUS_ICON = { completed: '✓', available: '▶', locked: '🔒' }

export function LessonNode({ lesson, onClick }) {
  const disabled = lesson.status === 'locked'
  return (
    <button
      className={`learn-node learn-node--${lesson.status}`}
      onClick={onClick}
      disabled={disabled}
      title={disabled ? 'Complete a lição anterior para desbloquear.' : undefined}
    >
      <span className="learn-node-icon">{STATUS_ICON[lesson.status]}</span>
      <span className="learn-node-body">
        <span className="learn-node-title">{lesson.title}</span>
        <span className="learn-node-goal">{lesson.goal}</span>
      </span>
    </button>
  )
}

export function FeedbackBanner({ correct, children }) {
  return (
    <div className={`learn-feedback learn-feedback--${correct ? 'correct' : 'wrong'}`}>
      {children}
    </div>
  )
}

export function Spinner({ label }) {
  return <p className="learn-loading">{label}</p>
}

export function ErrorNotice({ children }) {
  return <p className="learn-error">{children}</p>
}
