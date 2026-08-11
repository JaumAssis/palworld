const crypto = require('crypto')

// Objeto mínimo com a mesma superfície que onlineSessions/startOnlineMatch/emitMatchState esperam
// de um socket de verdade — só .emit()/.join()/.id/.connected são usados de fato (nada no
// matchmaking usa io.to(roomId), só socket.join()+.emit() direto em cada lado). Usado só pra dar
// ao substituto de bot na fila (ver BOT_QUEUE_FALLBACK_MS em server.js) uma identidade que se
// encaixa em `session.sides.B` sem precisar de nenhuma mudança no resto do matchmaking online.
//
// onEvent(event, payload) É o driver do bot: toda vez que o servidor "manda uma mensagem pro
// bot" (ex.: session.sides.B.socket.emit('match:rpsPrompt', ...)), na prática é este emit() que
// intercepta e entrega pro driver decidir o que fazer. setImmediate é estrutural, não só
// otimização: garante que o driver nunca rode DENTRO da mesma call stack de quem chamou emit(),
// então nunca muta o estado da partida de forma reentrante no meio de um loop de emissão do servidor.
function createBotSocketShim(onEvent) {
  return {
    id: `bot_${crypto.randomUUID()}`,
    connected: true,
    join() {},
    leave() {},
    on() {},
    off() {},
    removeAllListeners() {},
    emit(event, payload) {
      setImmediate(() => onEvent(event, payload))
    }
  }
}

module.exports = { createBotSocketShim }
