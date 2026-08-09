import { useLanguage } from './i18n/LanguageContext'

// Componentes/estilos visuais do tabuleiro, compartilhados entre a partida contra o Bot (GameBoard)
// e a partida online (FindMatchDeckSelect) — extraídos pra um módulo só pra não duplicar ~250 linhas
// de UI entre os 2 fluxos, que só diferem em COMO o estado do jogo é obtido (bot: vs match:).

export function CardSlot({ label, width = '80px', height = '112px', highlight = false, imageUrl, onClick }) {
  return (
    <div onClick={onClick ? (e) => { e.stopPropagation(); onClick() } : undefined} style={{
      width, height, overflow: 'hidden', cursor: onClick ? 'pointer' : 'default',
      border: highlight ? '2px solid #ffd54a' : '1px solid rgba(255,255,255,0.5)',
      borderRadius: '10px',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      color: '#fff', fontSize: '11px', fontWeight: 600,
      background: imageUrl ? `url('${imageUrl}') center / cover no-repeat` : 'rgba(255,255,255,0.12)',
      backdropFilter: imageUrl ? 'none' : 'blur(3px)',
      textShadow: '0 1px 3px rgba(0,0,0,0.6)'
    }}>
      <span style={{
        width: '100%', textAlign: 'center',
        background: imageUrl ? 'rgba(0,0,0,0.55)' : 'transparent',
        padding: imageUrl ? '2px 0' : 0
      }}>{label}</span>
    </div>
  )
}

export function AbilityBadge({ onClick }) {
  const { t } = useLanguage()
  return (
    <button onClick={e => { e.stopPropagation(); onClick() }} title={t('gbActivateAbility')} style={{
      position: 'absolute', bottom: '2px', left: '2px', width: '20px', height: '20px',
      borderRadius: '50%', border: 'none', background: '#ffd54a', color: '#3a2a00',
      fontSize: '11px', fontWeight: 700, cursor: 'pointer', lineHeight: '20px', padding: 0,
      boxShadow: '0 1px 4px rgba(0,0,0,0.5)', zIndex: 2
    }}>⚡</button>
  )
}

export function PalCard({ pal, width = '78px', selected = false, onClick, clickable = false, onActivate, onHoverStart, onHoverEnd }) {
  return (
    <div onClick={onClick ? (e) => { e.stopPropagation(); onClick(e) } : undefined}
         onMouseEnter={() => onHoverStart && onHoverStart(pal.imageUrl, pal.name)} onMouseLeave={() => onHoverEnd && onHoverEnd()} style={{
      width, cursor: clickable ? 'pointer' : 'default',
      transform: pal.isStanding ? 'rotate(0deg)' : 'rotate(90deg)',
      transition: 'transform 0.25s ease',
      filter: selected ? 'drop-shadow(0 0 8px #ffd54a)' : 'none',
      position: 'relative'
    }}>
      <img src={pal.imageUrl} alt={pal.name} style={{ width: '100%', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }} />
      {pal.damageMarked > 0 && (
        <span style={{
          position: 'absolute', top: '4px', right: '4px', background: 'rgba(200,0,0,0.85)',
          color: '#fff', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '6px'
        }}>-{pal.damageMarked}</span>
      )}
      {!!pal.powerBonus && (
        <span title="Power" style={{
          position: 'absolute', top: '4px', left: '4px',
          background: pal.powerBonus > 0 ? 'rgba(52,199,89,0.9)' : 'rgba(255,149,0,0.9)',
          color: '#fff', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '6px'
        }}>{pal.powerBonus > 0 ? `+${pal.powerBonus}` : pal.powerBonus}</span>
      )}
      {onActivate && pal.acts?.length > 0 && <AbilityBadge onClick={onActivate} />}
    </div>
  )
}

export function StructureGearRow({
  structures, gear, cardWidth = '70px', cardHeight = '98px', onActivateStructure, onActivateGear,
  onHoverCard, onHoverEnd, onDropStructure, dragActive
}) {
  if (structures.length === 0 && gear.length === 0) return null
  // A arte de Structure já vem deitada no arquivo original (orientation: 'landscape') — não giramos,
  // só invertemos largura/altura pra ocupar o mesmo "tamanho" de área que um Pal, na horizontal. Gear
  // é retrato (orientation: 'portrait'), igual Pal/Event — usa as dimensões normais, sem inverter.
  const landscapeWidth = cardHeight
  const landscapeHeight = cardWidth
  return (
    <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto', alignItems: 'flex-end' }}>
      {structures.map((s, i) => {
        // Structure pode ser atacada em qualquer estado (em pé ou descansada) — diferente de Pal, ela
        // não tem "estado de combate"; isStanding nela só importa pro custo das próprias ACTs dela.
        const isDropTarget = !!onDropStructure
        return (
          <div key={'s' + i} style={{ position: 'relative', width: landscapeWidth, height: landscapeHeight }}
               onMouseEnter={() => onHoverCard && onHoverCard(s.imageUrl, s.name)}
               onMouseLeave={() => onHoverEnd && onHoverEnd()}
               onDragOver={e => isDropTarget && e.preventDefault()}
               onDrop={() => isDropTarget && onDropStructure(i)}>
            <img src={s.imageUrl} alt={s.name} title={s.name}
                 style={{
                   width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                   outline: (isDropTarget && dragActive) ? '2px dashed #ffd54a' : 'none'
                 }} />
            {s.damageMarked > 0 && (
              <span style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(200,0,0,0.85)', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '6px' }}>
                -{s.damageMarked}
              </span>
            )}
            {onActivateStructure && s.acts?.length > 0 && <AbilityBadge onClick={() => onActivateStructure(i)} />}
          </div>
        )
      })}
      {gear.map((g, i) => (
        <div key={'g' + i} style={{ position: 'relative', width: cardWidth, height: cardHeight }}
             onMouseEnter={() => onHoverCard && onHoverCard(g.imageUrl, g.name)}
             onMouseLeave={() => onHoverEnd && onHoverEnd()}>
          <img src={g.imageUrl} alt={g.name} title={g.name}
               style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }} />
          {onActivateGear && g.acts?.length > 0 && <AbilityBadge onClick={() => onActivateGear(i)} />}
        </div>
      ))}
    </div>
  )
}

// Popout de "escolher carta revelada" (topo do deck / cemitério / mão) — mesmo estilo visual do
// popup de missões diárias: fundo escurecido + card branco centralizado.
export function CardChoiceModal({ pendingEffect, onChoose, onSkip, t }) {
  return (
    <div onClick={pendingEffect.optional ? onSkip : undefined} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '440px', maxWidth: '92vw', maxHeight: '80vh', overflowY: 'auto',
        background: '#fff', borderRadius: '20px', padding: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <h2 style={{ margin: 0, color: '#222', fontSize: '16px' }}>{pendingEffect.sourceCardName}</h2>
          {pendingEffect.optional && <button onClick={onSkip} style={{ padding: '4px 10px' }}>✕</button>}
        </div>
        <p style={{ color: '#555', fontSize: '13px', marginTop: '4px' }}>{t('gbCardChoicePrompt', { name: pendingEffect.sourceCardName })}</p>
        <p style={{ color: '#999', fontSize: '11px', marginTop: '0' }}>{pendingEffect.description}</p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '12px' }}>
          {pendingEffect.cards.map((c, i) => (
            <img key={i} src={c.imageUrl} alt={c.name}
                 title={c.selectable ? c.name : `${c.name} (${t('gbCardChoiceNotEligible')})`}
                 onClick={() => c.selectable && onChoose(i)}
                 style={{
                   width: '96px', borderRadius: '6px', cursor: c.selectable ? 'pointer' : 'default',
                   border: c.selectable ? '3px solid #34c759' : '3px solid transparent',
                   boxShadow: c.selectable ? '0 0 10px rgba(52,199,89,0.7)' : 'none',
                   filter: c.selectable ? 'none' : 'grayscale(85%) brightness(0.65)',
                   opacity: c.selectable ? 1 : 0.65
                 }} />
          ))}
        </div>
        {pendingEffect.optional && (
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button onClick={onSkip} style={{ padding: '6px 16px', fontSize: '13px' }}>{t('gbEffectSkip')}</button>
          </div>
        )}
      </div>
    </div>
  )
}

// Popout informativo: cartas reveladas do deck como checagem de dano de vida, indo pro cemitério —
// mesmo estilo visual das missões, mas fecha sozinho (não exige decisão do jogador).
export function DamageRevealModal({ reveal, onClose, t }) {
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '440px', maxWidth: '92vw', maxHeight: '80vh', overflowY: 'auto', textAlign: 'center',
        background: '#fff', borderRadius: '20px', padding: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <h2 style={{ margin: 0, color: '#222', fontSize: '15px' }}>
            {t('gbDamageRevealTitle', { attacker: reveal.attackerName, defender: reveal.defenderName })}
          </h2>
          <button onClick={onClose} style={{ padding: '4px 10px' }}>✕</button>
        </div>
        <p style={{ color: '#555', fontSize: '13px', marginTop: '4px' }}>
          {reveal.canceled ? t('gbDamageRevealCanceled') : t('gbDamageRevealDealt', { n: reveal.damageDealt })}
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px' }}>
          {reveal.cards.map((c, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <img src={c.imageUrl} alt={c.name} title={c.name}
                   style={{ width: '80px', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }} />
              {c.isLucky && <span style={{ position: 'absolute', top: '2px', right: '2px', fontSize: '16px' }}>🍀</span>}
            </div>
          ))}
        </div>
        <p style={{ color: '#999', fontSize: '11px', marginTop: '10px', marginBottom: 0 }}>{t('gbDamageRevealToGraveyard')}</p>
      </div>
    </div>
  )
}

// Popout informativo: cartas que estão no cemitério de um dos jogadores — cemitério é informação
// pública (cartas descartadas ficam viradas pra cima), então dá pra ver o cemitério de qualquer lado.
export function GraveyardModal({ view, onClose, t }) {
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '440px', maxWidth: '92vw', maxHeight: '80vh', overflowY: 'auto',
        background: '#fff', borderRadius: '20px', padding: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <h2 style={{ margin: 0, color: '#222', fontSize: '15px' }}>{t('gbGraveyardTitle', { name: view.ownerName })}</h2>
          <button onClick={onClose} style={{ padding: '4px 10px' }}>✕</button>
        </div>
        {view.cards.length === 0 ? (
          <p style={{ color: '#999', fontSize: '13px', textAlign: 'center', marginTop: '16px' }}>{t('gbGraveyardEmpty')}</p>
        ) : (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px' }}>
            {view.cards.map((c, i) => (
              <img key={i} src={c.imageUrl} alt={c.name} title={c.name}
                   style={{ width: '80px', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Card temático (pergaminho/madeira, mesma linguagem visual do menu principal) usado nas telas de
// abertura de partida (Jokenpô, escolher ordem, mulligan, vitória/derrota). `accent` colore o brilho
// da borda pra dar feedback imediato (verde = vitória, vermelho = derrota, dourado = neutro).
export const OVERLAY_ACCENTS = {
  win: { border: '#3f7a2e', glow: 'rgba(86,196,79,0.55)' },
  lose: { border: '#7a2e2e', glow: 'rgba(214,70,70,0.5)' },
  neutral: { border: '#8a5a2e', glow: 'rgba(201,154,78,0.45)' }
}

// Estilos de texto pra dentro do card de pergaminho — sempre escuros/legíveis, nunca dependem da
// cor de tema claro/escuro do sistema (o card em si é sempre claro).
export const THEMED_H2 = { fontFamily: "'Rye', Georgia, serif", color: '#3a2210', fontSize: '22px', margin: '0 0 10px', textShadow: '0 1px 0 rgba(255,255,255,0.35)' }
export const THEMED_P = { color: '#4a3220', fontSize: '14px', lineHeight: 1.5, margin: 0 }
export const THEMED_RESULT_WIN = { fontFamily: "'Rye', Georgia, serif", color: '#2e5f1f', fontSize: '20px', margin: '8px 0 0', textShadow: '0 1px 0 rgba(255,255,255,0.4)' }
export const THEMED_RESULT_LOSE = { fontFamily: "'Rye', Georgia, serif", color: '#7a2e2e', fontSize: '20px', margin: '8px 0 0', textShadow: '0 1px 0 rgba(255,255,255,0.3)' }
export const THEMED_RESULT_NEUTRAL = { color: '#6b4d20', fontWeight: 700, fontSize: '15px', margin: '8px 0 0' }

// Texto claro pra usar direto sobre o fundo de madeira escura (fora do card de pergaminho).
export const WOOD_H2 = { fontFamily: "'Rye', Georgia, serif", color: '#f3e2b3', fontSize: '26px', textShadow: '1px 1px 0 #000, 0 0 10px rgba(255,200,110,0.25)' }
export const WOOD_P = { color: '#d8c6a0', fontSize: '14px' }

// Fundo de madeira escura, reaproveitado em toda tela "fora do tabuleiro" (seleção de deck, Jokenpô,
// escolher ordem, mulligan, vitória/derrota) pra dar uma identidade visual única antes da partida.
export const WOOD_PAGE_BACKGROUND = 'radial-gradient(ellipse at 50% -10%, rgba(255,200,120,0.08), transparent 55%), linear-gradient(160deg, #3f2612 0%, #2b1608 60%, #1c0f06 100%)'

export function Overlay({ children, accent = 'neutral' }) {
  const a = OVERLAY_ACCENTS[accent] || OVERLAY_ACCENTS.neutral
  return (
    <div style={{
      position: 'fixed', inset: 0, background: WOOD_PAGE_BACKGROUND,
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.28), transparent 60%), linear-gradient(155deg, #ecdcb2 0%, #d8bd86 55%, #c5a468 100%)',
        border: `3px solid ${a.border}`,
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '440px',
        textAlign: 'center',
        color: '#2b1608',
        boxShadow: `inset 0 0 0 2px #8a5a2e, inset 0 0 0 5px #2b160a, inset 0 2px 6px rgba(255,255,255,0.35), 0 0 44px ${a.glow}, 0 16px 50px rgba(0,0,0,0.55)`
      }}>
        {children}
      </div>
    </div>
  )
}

// Tabuleiro desenhado pra um "canvas" de tamanho fixo e escalado (CSS transform) pra caber em
// qualquer resolução — em vez de deixar cada linha "esparramar" via flex conforme a largura da
// janela, todo mundo vê exatamente a mesma proporção/composição, só maior ou menor.
export const BOARD_WIDTH = 1360
export const BOARD_HEIGHT = 740
