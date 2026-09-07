import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { apiJson } from '../api'
import { useAuth } from '../auth/AuthContext'
import { useLearningT } from './learningI18n'
import { TerminalTopBar, CodeBlock, ProgressBar, FeedbackBanner, Spinner, ErrorNotice } from './LearningUI'
import './learning.css'

// Estados possíveis do fluxo de uma tentativa: carregando -> (teoria opcional) -> pergunta ->
// feedback (repete até a última) -> resultado. A correção de cada pergunta SEMPRE vem do servidor
// (feedback.correct) — nada aqui decide certo/errado no cliente.
export default function LearningLesson({ courseId }) {
  const t = useLearningT()
  const navigate = useNavigate()
  const { lessonId } = useParams()
  const { user } = useAuth()
  const loggedIn = !!user

  const [phase, setPhase] = useState('loading')
  const [fatalError, setFatalError] = useState(null)
  const [session, setSession] = useState(null)
  const [slideIndex, setSlideIndex] = useState(0)
  const [index, setIndex] = useState(0)
  const [selectedChoiceId, setSelectedChoiceId] = useState(null)
  const [typedText, setTypedText] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [runningScore, setRunningScore] = useState({ correct: 0, total: 0 })
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const errorMessage = (err) => t(`learningError_${err.code || 'unknown'}`)

  // Só o fetch inicial — nenhum setState síncrono no corpo do efeito, só dentro do .then/.catch
  // (mesmo padrão já usado em RankPopup/RankBoard no App.jsx do jogo). O reset de estado pra uma
  // nova tentativa da MESMA lição é feito por retry() abaixo, chamado de um clique (não de um
  // efeito) — trocar de lição já remonta o componente inteiro via key={lessonId} em LearningApp.
  useEffect(() => {
    apiJson(`/api/learning/lessons/${lessonId}/start`, { method: 'POST' })
      .then(data => {
        setSession(data)
        setPhase(data.lesson.intro ? 'intro' : 'question')
      })
      .catch(err => setFatalError(errorMessage(err)))
  }, [lessonId])

  const retry = () => {
    setPhase('loading')
    setFatalError(null)
    setSlideIndex(0)
    setIndex(0)
    setSelectedChoiceId(null)
    setTypedText('')
    setFeedback(null)
    setResult(null)
    setRunningScore({ correct: 0, total: 0 })

    apiJson(`/api/learning/lessons/${lessonId}/start`, { method: 'POST' })
      .then(data => {
        setSession(data)
        setPhase(data.lesson.intro ? 'intro' : 'question')
      })
      .catch(err => setFatalError(errorMessage(err)))
  }

  const currentQuestion = session?.lesson.questions[index]
  const total = session?.lesson.questions.length ?? 0
  const isLastQuestion = index === total - 1

  const submitAnswer = () => {
    if (submitting) return
    const body = currentQuestion.kind === 'mcq'
      ? { questionId: currentQuestion.id, choiceId: selectedChoiceId }
      : { questionId: currentQuestion.id, text: typedText }

    setSubmitting(true)
    apiJson(`/api/learning/sessions/${session.sessionId}/answer`, { method: 'POST', body: JSON.stringify(body) })
      .then(data => {
        setFeedback(data)
        setRunningScore({ correct: data.progress.correct, total: data.progress.total })
        setPhase('feedback')
      })
      .catch(err => setFatalError(errorMessage(err)))
      .finally(() => setSubmitting(false))
  }

  const finishLesson = () => {
    if (!loggedIn) {
      // Sem conta: mostra o resultado calculado a partir do feedback já revelado pelo servidor a
      // cada pergunta (nada inventado no cliente), mas nunca chega a chamar /complete — ela exige
      // login (é onde XP/streak seriam persistidos, e não há onde guardar isso pra visitante).
      setResult({ visitorOnly: true, score: runningScore.correct, total: runningScore.total, passed: runningScore.correct / runningScore.total >= 0.7 })
      setPhase('result')
      return
    }
    setSubmitting(true)
    apiJson(`/api/learning/lessons/${lessonId}/complete`, { method: 'POST', body: '{}' })
      .then(data => { setResult(data); setPhase('result') })
      .catch(err => setFatalError(errorMessage(err)))
      .finally(() => setSubmitting(false))
  }

  const goNext = () => {
    if (isLastQuestion) { finishLesson(); return }
    setIndex(i => i + 1)
    setSelectedChoiceId(null)
    setTypedText('')
    setFeedback(null)
    setPhase('question')
  }

  if (fatalError) {
    return (
      <div className="learn-page">
        <div className="learn-container">
          <TerminalTopBar promptPath={`trilha-${courseId}`}><Link to={`/learning/${courseId}`} className="learn-back-link">{t('backToTrackButton')}</Link></TerminalTopBar>
          <ErrorNotice>{fatalError}</ErrorNotice>
        </div>
      </div>
    )
  }

  if (phase === 'loading') {
    return (
      <div className="learn-page">
        <div className="learn-container"><Spinner label={t('lessonLoading')} /></div>
      </div>
    )
  }

  return (
    <div className="learn-page">
      <div className="learn-container">
        <TerminalTopBar promptPath={`trilha-${courseId}`}>
          <button
            className="learn-back-link"
            onClick={() => { if (phase === 'result' || window.confirm(t('exitLessonConfirm'))) navigate(`/learning/${courseId}`) }}
          >
            {t('backToTrackButton')}
          </button>
        </TerminalTopBar>

        {phase === 'intro' && (() => {
          const slides = session.lesson.intro.slides
          const slide = slides[slideIndex]
          const isLastSlide = slideIndex === slides.length - 1
          return (
            <div className="learn-panel learn-intro">
              <h1 className="learn-intro-title">{session.lesson.title}</h1>
              {slides.length > 1 && (
                <p className="learn-question-counter">{t('introSlideCounter', { n: slideIndex + 1, total: slides.length })}</p>
              )}

              <h2 className="learn-slide-title">{slide.title}</h2>
              <p className="learn-intro-body">{slide.body}</p>
              <CodeBlock code={slide.code} />

              {slides.length > 1 && (
                <div className="learn-slide-dots">
                  {slides.map((_, i) => (
                    <span key={i} className={`learn-slide-dot${i === slideIndex ? ' learn-slide-dot--active' : ''}`} />
                  ))}
                </div>
              )}

              <div className="learn-panel-actions">
                {slideIndex > 0 && (
                  <button className="learn-btn learn-btn--ghost" onClick={() => setSlideIndex(i => i - 1)}>
                    {t('introPrevButton')}
                  </button>
                )}
                {isLastSlide ? (
                  <button className="learn-btn" onClick={() => setPhase('question')}>{t('introStartButton')}</button>
                ) : (
                  <button className="learn-btn" onClick={() => setSlideIndex(i => i + 1)}>{t('introNextButton')}</button>
                )}
              </div>
            </div>
          )
        })()}

        {(phase === 'question' || phase === 'feedback') && currentQuestion && (
          <div className="learn-panel">
            <ProgressBar current={index + (phase === 'feedback' ? 1 : 0)} total={total} />
            <p className="learn-question-counter">{t('questionCounter', { n: index + 1, total })}</p>
            <p className="learn-question-prompt">{currentQuestion.prompt}</p>
            <CodeBlock code={currentQuestion.code} />

            {currentQuestion.kind === 'mcq' ? (
              <div className="learn-choices">
                {currentQuestion.choices.map(choice => {
                  let stateClass = ''
                  if (phase === 'feedback') {
                    if (choice.id === feedback.correctChoiceId) stateClass = 'learn-choice--correct'
                    else if (choice.id === selectedChoiceId) stateClass = 'learn-choice--wrong'
                  } else if (choice.id === selectedChoiceId) {
                    stateClass = 'learn-choice--selected'
                  }
                  return (
                    <button
                      key={choice.id}
                      className={`learn-choice ${stateClass}`}
                      disabled={phase === 'feedback'}
                      onClick={() => setSelectedChoiceId(choice.id)}
                    >
                      {choice.text}
                    </button>
                  )
                })}
              </div>
            ) : (
              <input
                className="learn-fill-input"
                type="text"
                value={typedText}
                disabled={phase === 'feedback'}
                placeholder={currentQuestion.blankHint || t('fillPlaceholder')}
                onChange={e => setTypedText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && phase === 'question' && typedText.trim()) submitAnswer() }}
                autoFocus
              />
            )}

            {phase === 'feedback' && (
              <FeedbackBanner correct={feedback.correct}>
                <strong>{feedback.correct ? t('feedbackCorrect') : t('feedbackWrong')}</strong>
                {feedback.caseWarning && <p>{t('feedbackCaseWarning', { answer: feedback.canonicalAnswer })}</p>}
                {!feedback.correct && (
                  <p>{t('feedbackCorrectAnswerWas', {
                    answer: currentQuestion.kind === 'mcq'
                      ? currentQuestion.choices.find(c => c.id === feedback.correctChoiceId)?.text
                      : feedback.canonicalAnswer
                  })}</p>
                )}
                <p>{feedback.explanation}</p>
              </FeedbackBanner>
            )}

            <div className="learn-panel-actions">
              {phase === 'question' ? (
                <button
                  className="learn-btn"
                  disabled={submitting || (currentQuestion.kind === 'mcq' ? !selectedChoiceId : !typedText.trim())}
                  onClick={submitAnswer}
                >
                  {t('checkButton')}
                </button>
              ) : (
                <button className="learn-btn" disabled={submitting} onClick={goNext}>
                  {isLastQuestion ? t('finishButton') : t('nextButton')}
                </button>
              )}
            </div>
          </div>
        )}

        {phase === 'result' && result && (
          <div className="learn-panel learn-result-card">
            <h1 className="learn-intro-title">{(result.passed) ? t('resultTitlePassed') : t('resultTitleFailed')}</h1>
            <p className="learn-result-score">{t('resultScore', { correct: result.score, total: result.total })}</p>

            {!result.passed && <p>{t('resultFailedHint')}</p>}

            <div className="learn-panel-actions">
              {!result.passed && <button className="learn-btn" onClick={retry}>{t('retryButton')}</button>}
              {result.passed && !result.visitorOnly && result.nextLessonId && (
                <button className="learn-btn" onClick={() => navigate(`/learning/${courseId}/${result.nextLessonId}`)}>
                  {t('nextLessonButton')}
                </button>
              )}
              <button className="learn-btn learn-btn--ghost" onClick={() => navigate(`/learning/${courseId}`)}>{t('backToTrackButton')}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
