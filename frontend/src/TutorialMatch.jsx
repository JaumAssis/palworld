import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from './i18n/LanguageContext'
import { useTheme } from './theme/ThemeContext'

// Tutorial 100% roteirizado (sem backend/socket): um estado de tabuleiro fixo por passo, escolhido
// à mão para garantir que TODO conceito importante (deploy, ataque, bloqueio, Quick/Interrupt,
// destruição, keywords, vitória) apareça na ordem certa — nunca depende do RNG do bot de verdade.
// Cartas reais (imagens públicas do Supabase, mesmas do catálogo) só para dar contexto visual real.
const CARDS = {
  lamball: { name: 'Lamball – My First Pal', imageUrl: 'https://sqftyennjqxlnfpoidah.supabase.co/storage/v1/object/public/card-images/official/TD01/TD01-023.png' },
  ribbuny: { name: 'Ribbuny – Little Princess', imageUrl: 'https://sqftyennjqxlnfpoidah.supabase.co/storage/v1/object/public/card-images/official/TD01/TD01-024.png' },
  jolthog: { name: 'Jolthog – Shocking Yet Innocent', imageUrl: 'https://sqftyennjqxlnfpoidah.supabase.co/storage/v1/object/public/card-images/official/TD01/TD01-002.png' },
  stonepit: { name: 'Stone Pit', imageUrl: 'https://sqftyennjqxlnfpoidah.supabase.co/storage/v1/object/public/card-images/official/TD01/TD01-008.png' },
  harness: { name: "Foxparks' Harness", imageUrl: 'https://sqftyennjqxlnfpoidah.supabase.co/storage/v1/object/public/card-images/official/BP01/BP01-019.png' },
  ignisBreath: { name: 'Ignis Breath', imageUrl: 'https://sqftyennjqxlnfpoidah.supabase.co/storage/v1/object/public/card-images/official/TD01/TD01-011.png' },
  menasting: { name: 'Menasting – Darkness-Dwelling Scorpion', imageUrl: 'https://sqftyennjqxlnfpoidah.supabase.co/storage/v1/object/public/card-images/official/BP01/BP01-084.png' }
}

const HAND_FULL = [CARDS.lamball, CARDS.ribbuny, CARDS.stonepit, CARDS.harness, CARDS.ignisBreath]

function palView(card, { standing = true, damage = 0 } = {}) {
  return { name: card.name, imageUrl: card.imageUrl, isStanding: standing, damageMarked: damage }
}

const EMPTY_SIDE = { life: 10, deckCount: 33, graveyardCount: 0, soulsStanding: 0, soulsRested: 0, material: 0, ingredient: 0, basePals: [] }

const BOARD_PREMATCH = { turnNumber: null, isPlayerTurn: null, player: { ...EMPTY_SIDE }, bot: { ...EMPTY_SIDE }, hand: HAND_FULL }

const BOARD_TURN1_MAIN = {
  ...BOARD_PREMATCH, turnNumber: 1, isPlayerTurn: true,
  player: { ...EMPTY_SIDE, soulsStanding: 2 }
}

const BOARD_AFTER_DEPLOY = {
  ...BOARD_TURN1_MAIN,
  hand: [CARDS.ribbuny, CARDS.stonepit, CARDS.harness, CARDS.ignisBreath],
  player: { ...EMPTY_SIDE, soulsStanding: 0, soulsRested: 2, basePals: [palView(CARDS.lamball)] }
}

const BOARD_AFTER_ATTACK = {
  ...BOARD_AFTER_DEPLOY,
  bot: { ...EMPTY_SIDE, life: 9, deckCount: 32, graveyardCount: 1 },
  player: { ...BOARD_AFTER_DEPLOY.player, basePals: [palView(CARDS.lamball, { standing: false })] }
}

const BOARD_TURN2_BOT = {
  ...BOARD_AFTER_ATTACK, turnNumber: 2, isPlayerTurn: false,
  bot: { ...BOARD_AFTER_ATTACK.bot, soulsStanding: 3, basePals: [palView(CARDS.jolthog)] }
}

const BOARD_DAMAGE_MARKED = {
  ...BOARD_TURN2_BOT,
  player: { ...BOARD_TURN2_BOT.player, basePals: [palView(CARDS.lamball, { standing: false, damage: 300 })] }
}

const BOARD_AFTER_DESTROY = {
  ...BOARD_TURN2_BOT,
  player: { ...BOARD_TURN2_BOT.player, basePals: [], graveyardCount: 1 },
  bot: { ...BOARD_TURN2_BOT.bot, basePals: [palView(CARDS.jolthog, { standing: false })] }
}

// Salto narrado pro turno seguinte do jogador — não encadeia estritamente todo o "custo" da
// partida anterior (é um tutorial roteirizado, não uma simulação contínua): cada vinheta é
// consistente por si só, mesmo que o total de Souls gastos não "feche a conta" turno a turno.
const BOARD_AFTER_SOULDRAW = {
  turnNumber: 3, isPlayerTurn: true,
  player: { ...BOARD_AFTER_DESTROY.player, soulsStanding: 1, soulsRested: 3, deckCount: 31 },
  bot: { ...BOARD_AFTER_DESTROY.bot },
  hand: [CARDS.ribbuny, CARDS.stonepit, CARDS.harness, CARDS.ignisBreath, CARDS.menasting]
}

const BOARD_AFTER_ASSIGN = {
  turnNumber: 4, isPlayerTurn: true,
  player: { ...BOARD_AFTER_SOULDRAW.player, soulsStanding: 0, soulsRested: 0, material: 3, deckCount: 28,
    basePals: [palView(CARDS.stonepit), palView(CARDS.ribbuny, { standing: false })] },
  bot: { ...BOARD_AFTER_SOULDRAW.bot },
  hand: [CARDS.harness, CARDS.ignisBreath, CARDS.menasting]
}

const BOARDS = {
  PREMATCH: BOARD_PREMATCH,
  TURN1_MAIN: BOARD_TURN1_MAIN,
  AFTER_DEPLOY: BOARD_AFTER_DEPLOY,
  AFTER_ATTACK: BOARD_AFTER_ATTACK,
  TURN2_BOT: BOARD_TURN2_BOT,
  DAMAGE_MARKED: BOARD_DAMAGE_MARKED,
  AFTER_DESTROY: BOARD_AFTER_DESTROY,
  AFTER_SOULDRAW: BOARD_AFTER_SOULDRAW,
  AFTER_ASSIGN: BOARD_AFTER_ASSIGN
}

const STEPS = [
  { id: 'welcome', board: 'PREMATCH' },
  { id: 'objective', board: 'PREMATCH', highlight: 'life' },
  { id: 'zonesHand', board: 'PREMATCH', highlight: 'hand' },
  { id: 'zonesDeckGrave', board: 'PREMATCH', highlight: 'deckGrave' },
  { id: 'zonesSouls', board: 'PREMATCH', highlight: 'souls' },
  { id: 'zonesBase', board: 'PREMATCH', highlight: 'base' },
  { id: 'preRps', board: 'PREMATCH' },
  { id: 'preMulligan', board: 'PREMATCH', highlight: 'hand' },
  { id: 'turnPhases', board: 'TURN1_MAIN', highlight: 'turnLabel' },
  { id: 'deployPal', board: 'AFTER_DEPLOY', highlight: 'playerPal0' },
  { id: 'effectTypes', board: 'AFTER_DEPLOY', highlight: 'hand' },
  { id: 'cardStats', board: 'AFTER_DEPLOY', highlight: 'playerPal0' },
  { id: 'attackDirect', board: 'AFTER_ATTACK', highlight: 'botLife' },
  { id: 'luckyPals', board: 'AFTER_ATTACK', highlight: 'botDeck' },
  { id: 'endTurn', board: 'AFTER_ATTACK', highlight: 'endTurnBtn' },
  { id: 'botTurn', board: 'TURN2_BOT', highlight: 'botPal0' },
  { id: 'blockStep', board: 'TURN2_BOT', highlight: 'playerPal0' },
  { id: 'quickInterrupt', board: 'TURN2_BOT', highlight: 'handQuick' },
  { id: 'damageResolution', board: 'DAMAGE_MARKED', highlight: 'playerPal0' },
  { id: 'afterDestroy', board: 'AFTER_DESTROY', highlight: 'playerGrave' },
  { id: 'soulDraw', board: 'AFTER_SOULDRAW', highlight: 'drawSoulsBtn' },
  { id: 'resourcesIntro', board: 'AFTER_SOULDRAW', highlight: 'material' },
  { id: 'assignStructure', board: 'AFTER_ASSIGN', highlight: 'playerPal1' },
  { id: 'keywords', board: 'AFTER_ASSIGN' },
  { id: 'winCondition', board: 'AFTER_ASSIGN', highlight: 'botDeck' },
  { id: 'wrapUp', board: 'AFTER_ASSIGN' }
]

const HIGHLIGHT_STYLE = { outline: '3px solid #6cf25a', outlineOffset: '3px', boxShadow: '0 0 14px rgba(108,242,90,0.75)', borderRadius: '10px' }

function MiniPal({ pal, highlighted }) {
  return (
    <div style={{
      width: '72px', position: 'relative',
      transform: pal.isStanding ? 'rotate(0deg)' : 'rotate(90deg)', transition: 'transform 0.25s ease',
      ...(highlighted ? HIGHLIGHT_STYLE : {})
    }}>
      <img src={pal.imageUrl} alt={pal.name} title={pal.name} style={{ width: '100%', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }} />
      {pal.damageMarked > 0 && (
        <span style={{
          position: 'absolute', top: '4px', right: '4px', background: 'rgba(200,0,0,0.85)',
          color: '#fff', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '6px'
        }}>-{pal.damageMarked}</span>
      )}
    </div>
  )
}

function MiniHandCard({ card, highlighted }) {
  return (
    <div style={{ width: '74px', height: '104px', borderRadius: '6px', overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.4)', flexShrink: 0, ...(highlighted ? HIGHLIGHT_STYLE : {}) }}>
      <img src={card.imageUrl} alt={card.name} title={card.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  )
}

function MiniSoulRow({ standing, rested, highlighted }) {
  return (
    <div style={{ display: 'flex', gap: '3px', alignItems: 'center', padding: '2px', ...(highlighted ? HIGHLIGHT_STYLE : {}) }}>
      {Array.from({ length: standing }).map((_, i) => (
        <div key={'s' + i} style={{ width: '14px', height: '20px', background: '#ffd54a', border: '1px solid #b8860b', borderRadius: '3px' }} />
      ))}
      {Array.from({ length: rested }).map((_, i) => (
        <div key={'r' + i} style={{ width: '14px', height: '20px', background: '#7a7a7a', border: '1px solid #444', borderRadius: '3px', transform: 'rotate(90deg)' }} />
      ))}
      {standing === 0 && rested === 0 && <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>—</span>}
    </div>
  )
}

function TutorialMatch() {
  const { t } = useLanguage()
  const { isNight } = useTheme()
  const [stepIndex, setStepIndex] = useState(0)

  const step = STEPS[stepIndex]
  const board = BOARDS[step.board]
  const hl = step.highlight
  const total = STEPS.length
  const isFirst = stepIndex === 0
  const isLast = stepIndex === total - 1

  const next = () => setStepIndex(i => Math.min(i + 1, total - 1))
  const prev = () => setStepIndex(i => Math.max(i - 1, 0))

  return (
    <div style={{
      minHeight: '100vh', boxSizing: 'border-box', display: 'flex', flexDirection: 'column',
      background: `url(${isNight ? '/night.png' : '/ambient.webp'}) center / cover no-repeat fixed`
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px' }}>
        <Link to="/tutorial"><button style={{ fontSize: '12px' }}>{t('tutorialExit')}</button></Link>
        <div style={{ color: '#fff', fontWeight: 600, fontSize: '13px', textShadow: '0 1px 3px rgba(0,0,0,0.7)' }}>
          {t('tutorialStepCounter', { current: stepIndex + 1, total })}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', padding: '0 20px', maxWidth: '900px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        {/* ---------- BOT ---------- */}
        <div style={{ background: 'rgba(10,15,25,0.45)', backdropFilter: 'blur(4px)', borderRadius: '12px', padding: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <strong style={{ color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.6)', fontSize: '13px' }}>🤖 Bot</strong>
            <div style={{ ...(hl === 'deckGrave' ? HIGHLIGHT_STYLE : {}), ...(hl === 'botDeck' ? HIGHLIGHT_STYLE : {}), display: 'flex', gap: '8px' }}>
              <span style={{ color: '#fff', fontSize: '11px' }}>{t('gbDeckCount', { n: board.bot.deckCount })}</span>
              <span style={{ color: '#fff', fontSize: '11px' }}>{t('gbGraveyard', { n: board.bot.graveyardCount })}</span>
            </div>
            <MiniSoulRow standing={board.bot.soulsStanding} rested={board.bot.soulsRested} highlighted={hl === 'souls'} />
            <span style={{ color: '#fff', fontSize: '13px', textShadow: '0 1px 3px rgba(0,0,0,0.6)', ...(hl === 'botLife' ? HIGHLIGHT_STYLE : {}) }}>❤️ {board.bot.life}</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', minHeight: '90px', marginTop: '8px' }}>
            {board.bot.basePals.length === 0
              ? <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>—</span>
              : board.bot.basePals.map((p, i) => <MiniPal key={i} pal={p} highlighted={hl === `botPal${i}`} />)}
          </div>
        </div>

        {/* ---------- TURNO ---------- */}
        <div style={{ textAlign: 'center', color: '#f3e2b3', fontFamily: "'Rye', Georgia, serif", fontSize: '15px', textShadow: '1px 1px 0 #000', padding: '2px', ...(hl === 'turnLabel' ? HIGHLIGHT_STYLE : {}) }}>
          {board.turnNumber ? t('gbTurn', { n: board.turnNumber, whoseTurn: board.isPlayerTurn ? t('gbYourTurn') : t('gbBotTurn') }) : t('tutorialBeforeMatch')}
        </div>

        {/* ---------- JOGADOR ---------- */}
        <div style={{ background: 'rgba(10,15,25,0.45)', backdropFilter: 'blur(4px)', borderRadius: '12px', padding: '10px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', minHeight: '90px' }}>
            {board.player.basePals.length === 0
              ? (hl === 'base' ? <div style={{ ...HIGHLIGHT_STYLE, width: '72px', height: '4px' }} /> : <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>—</span>)
              : board.player.basePals.map((p, i) => <MiniPal key={i} pal={p} highlighted={hl === `playerPal${i}`} />)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
            <strong style={{ color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.6)', fontSize: '13px' }}>🧑 {t('youLabel')}</strong>
            <div style={{ ...(hl === 'deckGrave' ? HIGHLIGHT_STYLE : {}), display: 'flex', gap: '8px' }}>
              <span style={{ color: '#fff', fontSize: '11px' }}>{t('gbDeckCount', { n: board.player.deckCount })}</span>
              <span style={{ color: '#fff', fontSize: '11px', ...(hl === 'playerGrave' ? HIGHLIGHT_STYLE : {}) }}>{t('gbGraveyard', { n: board.player.graveyardCount })}</span>
            </div>
            <MiniSoulRow standing={board.player.soulsStanding} rested={board.player.soulsRested} highlighted={hl === 'souls'} />
            <span style={{ color: '#fff', fontSize: '11px', textShadow: '0 1px 3px rgba(0,0,0,0.6)', ...(hl === 'material' ? HIGHLIGHT_STYLE : {}) }}>
              {t('gbMaterial', { n: board.player.material })} · {t('gbIngredient', { n: board.player.ingredient })}
            </span>
            <span style={{ color: '#fff', fontSize: '13px', textShadow: '0 1px 3px rgba(0,0,0,0.6)', ...(hl === 'life' ? HIGHLIGHT_STYLE : {}) }}>❤️ {board.player.life}</span>
          </div>
        </div>

        {/* ---------- BOTÕES ILUSTRATIVOS DE AÇÃO DA MAIN PHASE ---------- */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <button disabled style={{ padding: '6px 14px', fontSize: '12px', ...(hl === 'drawSoulsBtn' ? HIGHLIGHT_STYLE : {}) }}>
            {t('gbDrawWithSouls')}
          </button>
          <button disabled style={{ padding: '6px 20px', fontSize: '13px', ...(hl === 'endTurnBtn' ? HIGHLIGHT_STYLE : {}) }}>
            {t('gbEndTurn')}
          </button>
        </div>

        {/* ---------- MÃO ---------- */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', flexWrap: 'nowrap', paddingBottom: '10px' }}>
          {board.hand.map((card, i) => (
            <MiniHandCard key={i} card={card}
              highlighted={hl === 'hand' || (hl === 'handQuick' && card === CARDS.ignisBreath)} />
          ))}
        </div>
      </div>

      {/* ---------- PAINEL DE NARRAÇÃO ---------- */}
      <div style={{
        background: 'linear-gradient(155deg, #ecdcb2 0%, #d8bd86 55%, #c5a468 100%)',
        borderTop: '3px solid #8a5a2e', padding: '16px 20px', boxShadow: '0 -8px 30px rgba(0,0,0,0.4)'
      }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Rye', Georgia, serif", color: '#3a2210', fontSize: '19px', margin: '0 0 8px' }}>
            {t(`tutorialStep_${step.id}_title`)}
          </h2>
          <p style={{ color: '#4a3220', fontSize: '14px', lineHeight: 1.5, margin: 0 }}>
            {t(`tutorialStep_${step.id}_body`)}
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', gap: '10px', flexWrap: 'wrap' }}>
            <button className="sign-button" onClick={prev} disabled={isFirst} style={{ opacity: isFirst ? 0.5 : 1 }}>
              {t('tutorialPrev')}
            </button>

            {isLast ? (
              <div style={{ display: 'flex', gap: '10px' }}>
                <Link to="/"><button className="sign-button">{t('backToMenu')}</button></Link>
                <Link to="/game"><button className="sign-button">{t('tutorialPlayReal')}</button></Link>
              </div>
            ) : (
              <button className="sign-button" onClick={next}>{t('tutorialNext')}</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TutorialMatch
