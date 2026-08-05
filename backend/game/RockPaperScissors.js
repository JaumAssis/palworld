const CHOICES = ['rock', 'paper', 'scissors']

function randomChoice() {
  return CHOICES[Math.floor(Math.random() * CHOICES.length)]
}

/// Retorna 'p1', 'p2' ou 'draw'
function resolveRPS(p1Choice, p2Choice) {
  if (p1Choice === p2Choice) return 'draw'

  const beats = { rock: 'scissors', paper: 'rock', scissors: 'paper' }
  return beats[p1Choice] === p2Choice ? 'p1' : 'p2'
}

module.exports = { resolveRPS, randomChoice, CHOICES }