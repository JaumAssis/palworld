import { useEffect, useState } from 'react'
import { socket } from './socket'

// Contador de "gente online" — atualizado via evento online:count do servidor (ver
// broadcastOnlineCount em server.js), emitido a cada conexão/desconexão de qualquer socket
// (inclusive visitante sem login, só na tela inicial). null enquanto o socket não conectou
// ainda (evita mostrar "0" por um instante ao carregar a página).
export default function OnlineBadge() {
  const [count, setCount] = useState(null)

  useEffect(() => {
    const onCount = (n) => setCount(n)
    socket.on('online:count', onCount)
    return () => socket.off('online:count', onCount)
  }, [])

  if (count === null) return null

  return (
    <div className="currency-badge online-badge" title="Jogadores online agora">
      <span className="online-dot" />
      {count}
    </div>
  )
}
