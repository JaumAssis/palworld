/// IA bem simples: joga o primeiro Pal que couber no Soul disponível, depois ataca com tudo que estiver Standing
function playBotMainPhase(turnManager, botPlayer) {
  const actions = []

  // Tenta deployar Pals da mão enquanto tiver Soul suficiente
  let deployedSomething = true
  while (deployedSomething) {
    deployedSomething = false
    const playablePal = botPlayer.hand.find(
      c => c.card_type === 'Pal' && c.cost <= botPlayer.soulsStanding
    )
    if (playablePal) {
      const result = botPlayer.tryDeployPal(playablePal)
      if (result.success) {
        actions.push({ type: 'deploy', card: playablePal.name })
        deployedSomething = true
      }
    }
  }

  // Ataca com todos os Pals Standing
  for (const pal of [...botPlayer.basePals]) {
    if (pal.isStanding) {
      const result = turnManager.attackPlayer(pal)
      actions.push({ type: 'attack', card: pal.data.name, result })
      if (result.gameEnded) break
    }
  }

  return actions
}

module.exports = { playBotMainPhase }