import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from './i18n/LanguageContext'
import { apiFetch, apiJson } from './api'

// Mesma paleta de brilho por raridade usada no Shop.jsx (revelação de booster) — duplicada aqui de
// propósito (não exportada de lá) pra não criar um acoplamento entre os 2 arquivos por causa de uma
// constante pequena.
const RARITY_GLOW = {
  C: '#9e9e9e', U: '#43a047', R: '#1e88e5', RR: '#8e24aa',
  SR: '#f9a825', SP: '#e91e63', OSR: '#ff6f00', SSP: '#00bcd4', TSR: '#e53935'
}

const FISH_COUNT = 5
const FISH_STEP_PCT = 0.6 // o quanto cada peixe anda por tick (120ms) em direção ao alvo
const PROGRESS_PER_CLICK = 14
const PROGRESS_DECAY_PER_TICK = 5
const DECAY_TICK_MS = 400
const HOOK_START_PROGRESS = 30 // começa com folga — sem isso o 1º tick de decaimento quase sempre escapava na hora
const BITE_MIN_DELAY_MS = 700
const BITE_MAX_DELAY_MS = 2600

// ---------- Lançar a linha: mini-jogo de 2 etapas (ângulo + força), estilo jogo de pesca clássico ----------
// Etapa 1: uma linha "gira" num arco de 90° (±45° a partir de reto pra cima); o jogador clica pra
// travar o ângulo. Etapa 2: com o ângulo já travado, a MESMA linha estica/encolhe (0 até o alcance
// máximo); o jogador clica nesse momento e a distância decide onde o anzol cai na água.
const CAST_ORIGIN = { x: 50, y: 96 } // base da vara, no fundo da água — origem do ângulo/força
const CAST_ANGLE_MAX_DEG = 45 // sweep total de 90°: de -45° a +45° em torno de "reto pra cima"
const CAST_TICK_MS = 30
const CAST_ANGLE_OMEGA = 0.07 // velocidade do vai-e-vem do ângulo (rad por tick, dentro do seno)
const CAST_POWER_OMEGA = 0.055 // velocidade do vai-e-vem da força
const CAST_AIM_LENGTH_PCT = 32 // comprimento fixo da linha durante a etapa de mirar (ângulo)
const CAST_MAX_DISTANCE_PCT = 80 // até onde o anzol viaja com força 100%

function randomPct() { return 8 + Math.random() * 84 } // margem pra não nascer/mirar colado na borda da água

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)) }

// Vetor unitário (dx, dy) de uma direção em graus, onde 0° aponta reto "pra cima" (y menor) e
// ângulos positivos giram pra direita — usado tanto pra desenhar a linha de mira quanto pra
// calcular onde o anzol cai de verdade.
function angleToVector(deg) {
  const rad = (deg * Math.PI) / 180
  return { dx: Math.sin(rad), dy: -Math.cos(rad) }
}

function makeFish(id) {
  const x = randomPct()
  const y = randomPct()
  return { id, x, y, targetX: randomPct(), targetY: randomPct() }
}

// Vara de pesca desenhada em SVG (sem asset de imagem — não temos gerador de imagem disponível
// nessa sessão): cabo de madeira na diagonal, guias metálicas, linha ondulada até um anzol simples.
// Puramente decorativo, fica ancorada no canto — a linha "de verdade" (a que o jogador lança na
// água) é o marcador desenhado em cima do ponto clicado, mais abaixo.
function FishingRodIcon({ style }) {
  return (
    <svg viewBox="0 0 140 200" width="90" height="128" style={style}>
      <line x1="20" y1="190" x2="110" y2="15" stroke="#8a5a2b" strokeWidth="7" strokeLinecap="round" />
      <line x1="20" y1="190" x2="110" y2="15" stroke="#c99a4e" strokeWidth="2" strokeLinecap="round" />
      <circle cx="30" cy="176" r="9" fill="#5c3418" />
      <circle cx="30" cy="176" r="4" fill="#2b160a" />
      {[[48, 148], [66, 108], [84, 68], [100, 32]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.5" fill="none" stroke="#2b160a" strokeWidth="1.6" />
      ))}
      <path d="M 108 18 Q 95 90 70 150 Q 55 180 60 195" fill="none" stroke="#e8e8e8" strokeWidth="1.4" opacity="0.85" />
      <path d="M 60 195 q -4 10 6 12 q 8 2 6 -8" fill="none" stroke="#888" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function Fishing({ onClose } = {}) {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [fish, setFish] = useState(() => Array.from({ length: FISH_COUNT }, (_, i) => makeFish(i)))
  const [hookPos, setHookPos] = useState(null) // { x, y } em % — onde a linha foi lançada, esperando fisgar
  const [hookedId, setHookedId] = useState(null)
  const [progress, setProgress] = useState(0)
  const [reward, setReward] = useState(null)
  const [baitCount, setBaitCount] = useState(null) // null = ainda carregando
  const [castError, setCastError] = useState('')
  // Etapas do lance: 'idle' (botão "Lançar a Linha"), 'angle' (travar o ângulo), 'power' (travar a
  // força/distância). castTick é o único estado que realmente muda a cada tick (updater puro,
  // t => t+1); ângulo/força ao vivo são DERIVADOS dele no corpo do render via Math.sin — nada de
  // efeito reagindo a eles, nada de setState aninhado.
  const [castStage, setCastStage] = useState('idle')
  const [castTick, setCastTick] = useState(0)
  const [lockedAngle, setLockedAngle] = useState(0)
  const nextIdRef = useRef(FISH_COUNT)
  const catchingRef = useRef(false) // trava reentrância (double-click) na chamada da API de fisgar
  const biteTimeoutRef = useRef(null)
  // Espelham o estado mais recente pra callbacks assíncronos (setTimeout/setInterval) lerem sem
  // precisar recriar o timer a cada mudança — escrita de ref sempre DENTRO de um efeito (fase de
  // commit), nunca durante o render em si (isso sim seria o padrão de ref-durante-render a evitar).
  const progressRef = useRef(0)
  useEffect(() => { progressRef.current = progress }, [progress])
  const fishRef = useRef(fish)
  useEffect(() => { fishRef.current = fish }, [fish])

  // Relógio único do mini-jogo de lançar a linha — só incrementa (updater puro) enquanto alguma das
  // 2 etapas estiver ativa. Ângulo/força ao vivo são calculados a partir dele logo abaixo, no corpo
  // do componente (não dentro de nenhum efeito).
  useEffect(() => {
    if (castStage !== 'angle' && castStage !== 'power') return
    const tick = setInterval(() => setCastTick(v => v + 1), CAST_TICK_MS)
    return () => clearInterval(tick)
  }, [castStage])
  const liveAngle = CAST_ANGLE_MAX_DEG * Math.sin(castTick * CAST_ANGLE_OMEGA)
  const livePower = 50 + 50 * Math.sin(castTick * CAST_POWER_OMEGA)

  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 100)
    apiFetch('/api/player').then(r => r.json()).then(p => setBaitCount(p.bait_count))
    return () => { clearTimeout(timer); clearTimeout(biteTimeoutRef.current) }
  }, [])

  // Movimento dos peixes: anda até um alvo aleatório, escolhe outro ao chegar perto. O peixe
  // fisgado (hookedId) fica parado — senão ele "fugiria andando" enquanto o jogador tenta puxar.
  useEffect(() => {
    const tick = setInterval(() => {
      setFish(prev => prev.map(f => {
        if (f.id === hookedId) return f
        const dx = f.targetX - f.x
        const dy = f.targetY - f.y
        const dist = Math.hypot(dx, dy)
        if (dist < 2) return { ...f, targetX: randomPct(), targetY: randomPct() }
        return { ...f, x: f.x + (dx / dist) * FISH_STEP_PCT, y: f.y + (dy / dist) * FISH_STEP_PCT }
      }))
    }, 120)
    return () => clearInterval(tick)
  }, [hookedId])

  // Decaimento da barra enquanto fisgado — dá tensão: parar de clicar deixa o peixe escapar antes
  // de completar. As 2 chamadas de setState abaixo rodam dentro do callback do setInterval (nunca
  // sincronamente no corpo do efeito em si, e nunca uma aninhada dentro do updater da outra) — evita
  // tanto "setState dentro de efeito" quanto "setState impuro dentro de outro updater".
  useEffect(() => {
    if (hookedId == null) return
    const timer = setInterval(() => {
      const next = Math.max(0, progressRef.current - PROGRESS_DECAY_PER_TICK)
      setProgress(next)
      if (next <= 0) setHookedId(null) // peixe escapou
    }, DECAY_TICK_MS)
    return () => clearInterval(timer)
  }, [hookedId])

  // Chamado só a partir do clique real em "Puxar!" (reel, mais abaixo) — nunca de dentro de um
  // efeito ou de um updater de setState, então pode fazer o que quiser livremente aqui.
  const completeCatch = (caughtId) => {
    if (catchingRef.current) return
    catchingRef.current = true
    setHookedId(null)
    setProgress(0)
    setFish(prev => prev.filter(f => f.id !== caughtId))
    apiJson('/api/fishing/catch', { method: 'POST' })
      .then(setReward)
      .catch(() => {}) // cooldown/erro de rede — sem penalidade, só não mostra recompensa dessa vez
      .finally(() => {
        catchingRef.current = false
        setTimeout(() => setFish(prev => [...prev, makeFish(nextIdRef.current++)]), 1200)
      })
  }

  // Etapa 0: gasta 1 Isca (cobrado no SERVIDOR, ver /api/fishing/cast — se não tiver isca disponível,
  // nem entra na etapa de mirar) e começa a etapa de ângulo.
  const startCast = () => {
    if (hookedId != null || castStage !== 'idle' || baitCount <= 0) return
    apiJson('/api/fishing/cast', { method: 'POST' })
      .then(data => {
        setCastError('')
        setBaitCount(data.baitCount)
        setCastTick(0)
        setCastStage('angle')
      })
      .catch(err => setCastError(err.message))
  }

  // Etapa 1: trava o ângulo lido AGORA de `liveAngle` (valor do render atual, handler síncrono de
  // clique — sem risco de desatualização) e passa pra etapa de força.
  const lockAngle = () => {
    if (castStage !== 'angle') return
    setLockedAngle(liveAngle)
    setCastTick(0)
    setCastStage('power')
  }

  // Etapa 2: trava a força lida AGORA de `livePower`, calcula onde o anzol cai (ângulo já travado +
  // essa distância) e retoma exatamente o mesmo fluxo de espera-de-fisgada de antes.
  const lockPowerAndCast = () => {
    if (castStage !== 'power') return
    const { dx, dy } = angleToVector(lockedAngle)
    const distance = (livePower / 100) * CAST_MAX_DISTANCE_PCT
    const x = clamp(CAST_ORIGIN.x + dx * distance, 5, 95)
    const y = clamp(CAST_ORIGIN.y + dy * distance, 5, 95)

    setCastStage('idle')
    clearTimeout(biteTimeoutRef.current)
    setHookPos({ x, y })

    const delay = BITE_MIN_DELAY_MS + Math.random() * (BITE_MAX_DELAY_MS - BITE_MIN_DELAY_MS)
    biteTimeoutRef.current = setTimeout(() => {
      const pool = fishRef.current
      if (pool.length === 0) return
      let nearest = pool[0]
      let nearestDist = Infinity
      for (const f of pool) {
        const dist = Math.hypot(f.x - x, f.y - y)
        if (dist < nearestDist) { nearestDist = dist; nearest = f }
      }
      setHookedId(nearest.id)
      setProgress(HOOK_START_PROGRESS)
      setHookPos(null)
    }, delay)
  }

  // Lê `progress` direto do escopo do render (handler de clique síncrono, sem risco de valor
  // desatualizado) pra decidir ALI MESMO se completou — evita depender de um efeito reagindo à
  // mudança de progress só pra chamar completeCatch.
  const reel = () => {
    if (hookedId == null) return
    const next = Math.min(100, progress + PROGRESS_PER_CLICK)
    setProgress(next)
    if (next >= 100) completeCatch(hookedId)
  }

  const hookedFish = fish.find(f => f.id === hookedId)

  return (
    <div style={{
      minHeight: '100vh', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: onClose ? 'transparent' : '#1a1a2e'
    }}>
      <div style={{
        width: 'min(460px, 94vw)', height: 'min(760px, 92vh)', background: '#0d1b2a', borderRadius: '22px',
        border: '10px solid #1a1a1a', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column',
        overflow: 'hidden', transform: isOpen ? 'scale(1)' : 'scale(0.92)', opacity: isOpen ? 1 : 0, transition: 'transform 0.25s ease, opacity 0.25s ease'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--sp-md) var(--sp-lg)', flexShrink: 0 }}>
          <h2 style={{ margin: 0, fontSize: 'var(--fs-lg)', color: '#cfe8ff' }}>🎣 {t('fishingTitle')}</h2>
          {onClose
            ? <button onClick={onClose} style={{ fontSize: 'var(--fs-sm)', color: '#cfe8ff', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>{t('exit')}</button>
            : <Link to="/" style={{ fontSize: 'var(--fs-sm)', color: '#cfe8ff', fontWeight: 600 }}>{t('exit')}</Link>}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 var(--sp-lg) var(--sp-sm)' }}>
          <p style={{ margin: 0, fontSize: 'var(--fs-2xs)', color: '#8fb3d9' }}>{t('fishingHint')}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            <img src="/Simple_Bait_icon.webp" alt="Isca" style={{ width: '20px', height: '20px' }} />
            <strong style={{ color: '#cfe8ff', fontSize: 'var(--fs-sm)' }}>{baitCount ?? '—'}</strong>
          </div>
        </div>
        {castError && <p style={{ margin: '0 var(--sp-lg) var(--sp-sm)', fontSize: 'var(--fs-2xs)', color: '#ff8a8a' }}>{castError}</p>}

        {/* ---------- ÁGUA (visão de cima) ---------- */}
        <div
          style={{
            position: 'relative', margin: '0 var(--sp-lg)', flex: 1, borderRadius: '16px', overflow: 'hidden',
            background: 'radial-gradient(ellipse at center, #1d6fa5 0%, #0d3f63 70%, #062a40 100%)',
            border: '3px solid #06283d'
          }}
        >
          {fish.map(f => {
            const isHooked = f.id === hookedId
            return (
              <div
                key={f.id}
                style={{
                  position: 'absolute', left: `${f.x}%`, top: `${f.y}%`, transform: 'translate(-50%, -50%)',
                  width: isHooked ? '22px' : '16px', height: isHooked ? '22px' : '16px', borderRadius: '50%',
                  background: 'rgba(10,15,20,0.55)', boxShadow: isHooked ? '0 0 14px 4px rgba(255,255,255,0.35)' : 'none',
                  pointerEvents: 'none', transition: 'left 0.12s linear, top 0.12s linear, width 0.15s, height 0.15s'
                }}
              />
            )
          })}

          {/* ---------- MARCADOR: onde a linha caiu, esperando fisgar ---------- */}
          {hookPos && hookedId == null && (
            <div style={{
              position: 'absolute', left: `${hookPos.x}%`, top: `${hookPos.y}%`, transform: 'translate(-50%, -50%)',
              pointerEvents: 'none'
            }}>
              <div style={{
                width: '10px', height: '10px', borderRadius: '50%', background: '#fff',
                boxShadow: '0 0 0 0 rgba(255,255,255,0.6)', animation: 'fishingRipple 1.4s ease-out infinite'
              }} />
            </div>
          )}

          {/* ---------- MIRA: etapa de ângulo (comprimento fixo, gira) ou força (ângulo travado, estica/encolhe) ---------- */}
          {(castStage === 'angle' || castStage === 'power') && (() => {
            const angle = castStage === 'angle' ? liveAngle : lockedAngle
            const length = castStage === 'angle' ? CAST_AIM_LENGTH_PCT : (livePower / 100) * CAST_MAX_DISTANCE_PCT
            const { dx, dy } = angleToVector(angle)
            const tipX = CAST_ORIGIN.x + dx * length
            const tipY = CAST_ORIGIN.y + dy * length
            return (
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                <line x1={CAST_ORIGIN.x} y1={CAST_ORIGIN.y} x2={tipX} y2={tipY} stroke="#fff" strokeWidth="0.6" vectorEffect="non-scaling-stroke" opacity="0.9" />
                <circle cx={tipX} cy={tipY} r="1.6" fill="#ffd76a" vectorEffect="non-scaling-stroke" />
              </svg>
            )
          })()}

          <FishingRodIcon style={{ position: 'absolute', bottom: '4px', left: '50%', transform: 'translateX(-50%)', opacity: 0.9, pointerEvents: 'none' }} />

          <style>{`
            @keyframes fishingRipple {
              0% { box-shadow: 0 0 0 0 rgba(255,255,255,0.55); }
              100% { box-shadow: 0 0 0 18px rgba(255,255,255,0); }
            }
          `}</style>
        </div>

        {/* ---------- BARRA DE FISGAR (só aparece com um peixe fisgado) ---------- */}
        {hookedFish && (
          <div style={{ padding: 'var(--sp-md) var(--sp-lg)', flexShrink: 0 }}>
            <p style={{ margin: '0 0 6px', fontSize: 'var(--fs-2xs)', color: '#cfe8ff', textAlign: 'center' }}>{t('fishingReelHint')}</p>
            <div style={{ width: '100%', height: '18px', background: 'rgba(255,255,255,0.15)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{
                width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #4fc3f7, #29b6f6)',
                transition: 'width 0.1s linear'
              }} />
            </div>
            <button
              className="sign-button sign-button-fluid" onClick={reel}
              style={{ width: '100%', marginTop: '10px' }}
            >
              {t('fishingReelButton')}
            </button>
          </div>
        )}

        {/* ---------- CONTROLE DO LANCE (esconde durante a fisgada/puxada, que tem sua própria barra) ---------- */}
        {!hookedFish && (
          <div style={{ padding: 'var(--sp-md) var(--sp-lg)', flexShrink: 0 }}>
            {castStage === 'idle' && (
              <button
                className="sign-button sign-button-fluid" onClick={startCast}
                disabled={baitCount <= 0} style={{ width: '100%', opacity: baitCount > 0 ? 1 : 0.5 }}
              >
                {t('fishingCastButton')}
              </button>
            )}
            {castStage === 'angle' && (
              <>
                <p style={{ margin: '0 0 6px', fontSize: 'var(--fs-2xs)', color: '#cfe8ff', textAlign: 'center' }}>{t('fishingAngleHint')}</p>
                <button className="sign-button sign-button-fluid" onClick={lockAngle} style={{ width: '100%' }}>{t('fishingStopButton')}</button>
              </>
            )}
            {castStage === 'power' && (
              <>
                <p style={{ margin: '0 0 6px', fontSize: 'var(--fs-2xs)', color: '#cfe8ff', textAlign: 'center' }}>{t('fishingPowerHint')}</p>
                <button className="sign-button sign-button-fluid" onClick={lockPowerAndCast} style={{ width: '100%' }}>{t('fishingStopButton')}</button>
              </>
            )}
          </div>
        )}
      </div>

      {/* ---------- REVELAÇÃO DA RECOMPENSA ---------- */}
      {reward && (
        <div onClick={() => setReward(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, cursor: 'pointer'
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#fff', borderRadius: '16px', padding: 'var(--sp-lg)', textAlign: 'center', width: 'var(--panel-w-xs)', maxWidth: '90vw'
          }}>
            <h3 style={{ margin: '0 0 12px', color: '#222', fontSize: 'var(--fs-lg)' }}>{t('fishingCaughtTitle')}</h3>

            {reward.type === 'card' && (
              <>
                <img src={reward.card.image_url} alt={reward.card.name} style={{
                  width: '140px', borderRadius: '10px',
                  border: `3px solid ${RARITY_GLOW[reward.card.rarity] || '#999'}`,
                  boxShadow: `0 0 20px 4px ${RARITY_GLOW[reward.card.rarity] || '#999'}`
                }} />
                <p style={{ margin: '10px 0 0', color: '#222', fontWeight: 700 }}>{reward.card.name}</p>
                {reward.fluidGained > 0 && (
                  <p style={{ margin: '4px 0 0', color: '#777', fontSize: 'var(--fs-2xs)' }}>
                    {t('fishingOverflowToFluid', { amount: reward.fluidGained })}
                  </p>
                )}
              </>
            )}

            {reward.type === 'nothing' && (
              <p style={{ fontSize: 'var(--fs-md)', color: '#666' }}>🥾 {t('fishingNothingCaught')}</p>
            )}

            {reward.type === 'booster' && (
              <>
                <img src="/booster-bp01.png" alt="Booster" style={{ width: '110px' }} />
                <p style={{ margin: '10px 0 0', color: '#222', fontWeight: 700, fontSize: 'var(--fs-sm)' }}>{t('fishingBoosterCaught')}</p>
              </>
            )}

            {reward.type === 'gold' && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <img src="/gold-coin.png" alt="Gold" style={{ width: '40px', height: '40px' }} />
                <span style={{ fontSize: 'var(--fs-lg)', color: '#222', fontWeight: 700 }}>+{reward.amount}</span>
              </div>
            )}

            {reward.type === 'pal_fluid' && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <img src="/pal-fluid.png" alt={t('palFluidAlt')} style={{ width: '40px', height: '40px' }} />
                <span style={{ fontSize: 'var(--fs-lg)', color: '#222', fontWeight: 700 }}>+{reward.amount}</span>
              </div>
            )}

            {reward.type === 'ingredient' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                <div style={{ fontSize: 'var(--fs-md)', color: '#222', fontWeight: 700 }}>{t('wheatLabel')} +{reward.amount}</div>
                <div style={{ fontSize: 'var(--fs-md)', color: '#222', fontWeight: 700 }}>{t('lettuceLabel')} +{reward.amount}</div>
                <div style={{ fontSize: 'var(--fs-md)', color: '#222', fontWeight: 700 }}>{t('tomatoLabel')} +{reward.amount}</div>
              </div>
            )}

            <button className="sign-button" onClick={() => setReward(null)} style={{ marginTop: '16px' }}>{t('close')}</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Fishing
