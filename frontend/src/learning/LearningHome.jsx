import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiJson } from '../api'
import { useLearningT } from './learningI18n'
import { TerminalTopBar, LessonNode, Spinner, ErrorNotice } from './LearningUI'
import './learning.css'

// Trilha de UM curso — courseId vem da rota (ver LearningApp.jsx). Título/subtítulo exibidos vêm
// da própria API (data.course), não de texto fixo aqui, porque este componente serve qualquer
// curso (Python, Lógica de Programação, etc.), não só Python.
export default function LearningHome({ courseId }) {
  const t = useLearningT()
  const navigate = useNavigate()
  const [track, setTrack] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    apiJson(`/api/learning/track?course=${encodeURIComponent(courseId)}`)
      .then(setTrack)
      .catch(() => setError(t('trackLoadError')))
  }, [courseId])

  return (
    <div className="learn-page">
      <div className="learn-container">
        <TerminalTopBar promptPath={`trilha-${courseId}`}>
          <Link to="/learning/catalogo" className="learn-back-link">{t('backToCatalogButton')}</Link>
        </TerminalTopBar>

        <header className="learn-hero">
          <h1 className="learn-hero-title">{track?.course.title ?? t('trackLoading')}</h1>
          {track && <p className="learn-hero-subtitle">{track.course.subtitle}</p>}
        </header>

        {error && <ErrorNotice>{error}</ErrorNotice>}
        {!track && !error && <Spinner label={t('trackLoading')} />}

        {track && (
          <>
            {track.modules.map(mod => (
              <section key={mod.id} className="learn-module" style={{ '--module-accent': mod.accent }}>
                <div className="learn-module-header">
                  <span className="learn-module-level">{t(`levelName_${mod.levelKey}`)}</span>
                  <h2 className="learn-module-title">{mod.title}</h2>
                  <p className="learn-module-subtitle">{mod.subtitle}</p>
                </div>
                <div className="learn-lesson-list">
                  {mod.lessons.map(lesson => (
                    <LessonNode
                      key={lesson.id}
                      lesson={{
                        ...lesson,
                        goal: lesson.status === 'locked' ? t('lessonLockedHint') : lesson.goal
                      }}
                      onClick={() => lesson.status !== 'locked' && navigate(`/learning/${courseId}/${lesson.id}`)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
