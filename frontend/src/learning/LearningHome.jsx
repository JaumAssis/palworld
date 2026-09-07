import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiJson } from '../api'
import { useLearningT } from './learningI18n'
import { TerminalTopBar, LessonNode, Spinner, ErrorNotice } from './LearningUI'
import './learning.css'

export default function LearningHome() {
  const t = useLearningT()
  const navigate = useNavigate()
  const [track, setTrack] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    apiJson('/api/learning/track?course=python')
      .then(setTrack)
      .catch(() => setError(t('trackLoadError')))
  }, [])

  return (
    <div className="learn-page">
      <div className="learn-container">
        <TerminalTopBar promptPath="trilha-python">
          <Link to="/learning" className="learn-back-link">{t('backToCatalogButton')}</Link>
        </TerminalTopBar>

        <header className="learn-hero">
          <h1 className="learn-hero-title">{t('trackTitle')}</h1>
          <p className="learn-hero-subtitle">{t('trackSubtitle')}</p>
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
                      onClick={() => lesson.status !== 'locked' && navigate(`/learning/python/${lesson.id}`)}
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
