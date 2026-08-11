import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useAuth } from '../auth/AuthContext'
import { socket } from '../socket'

// Fica montado ACIMA do router (ver main.jsx) — ao contrário do OnlineBadge e do chat de lobby
// (que viviam dentro de telas que desmontam ao navegar), este provider nunca some, então o
// contador de online e o histórico do chat sobrevivem a "menu -> catálogo -> menu" etc.
// Contador e chat são dois contexts SEPARADOS de propósito: um único context faria qualquer
// mensagem de chat re-renderizar todo mundo que só lê o contador (inclusive o tabuleiro de uma
// partida em andamento, que não tem nada a ver com o chat do lobby).
const OnlineCountContext = createContext(null)
const LobbyChatContext = createContext(null)

const LOBBY_CHAT_MAX_CLIENT = 300 // teto de retenção no cliente — nunca guardamos histórico ilimitado

export function LiveProvider({ children }) {
  const { user } = useAuth()
  const [onlineCount, setOnlineCount] = useState(null)
  const [messages, setMessages] = useState([])
  const [chatError, setChatError] = useState('')
  const chatErrorTimerRef = useRef(null)

  useEffect(() => {
    const onCount = (n) => setOnlineCount(n)
    const onHistory = (history) => setMessages(history.slice(-LOBBY_CHAT_MAX_CLIENT))
    const onMessage = (msg) => setMessages(prev => [...prev, msg].slice(-LOBBY_CHAT_MAX_CLIENT))
    const onChatError = ({ message }) => {
      setChatError(message)
      clearTimeout(chatErrorTimerRef.current)
      chatErrorTimerRef.current = setTimeout(() => setChatError(''), 3000)
    }
    // Reconexão de socket (ex.: servidor reiniciou) — pede tudo de novo em vez de esperar o
    // servidor reemitir sozinho.
    const onConnect = () => {
      socket.emit('online:requestCount')
      socket.emit('lobbyChat:requestHistory')
    }

    socket.on('online:count', onCount)
    socket.on('lobbyChat:history', onHistory)
    socket.on('lobbyChat:message', onMessage)
    socket.on('lobbyChat:error', onChatError)
    socket.on('connect', onConnect)

    socket.emit('online:requestCount')
    socket.emit('lobbyChat:requestHistory')

    return () => {
      clearTimeout(chatErrorTimerRef.current)
      socket.off('online:count', onCount)
      socket.off('lobbyChat:history', onHistory)
      socket.off('lobbyChat:message', onMessage)
      socket.off('lobbyChat:error', onChatError)
      socket.off('connect', onConnect)
    }
  }, [])

  // O histórico do chat exige login no servidor (lobbyChat:requestHistory fica dentro do bloco
  // autenticado) — ao logar sem recarregar a página, pede de novo pra não ficar vazio até a
  // próxima reconexão de socket.
  useEffect(() => {
    if (user) socket.emit('lobbyChat:requestHistory')
  }, [user])

  const sendMessage = useCallback((text) => {
    const trimmed = text.trim()
    if (!trimmed) return
    socket.emit('lobbyChat:send', { text: trimmed })
  }, [])

  const onlineCountValue = useMemo(() => ({ onlineCount }), [onlineCount])
  const lobbyChatValue = useMemo(() => ({ messages, chatError, sendMessage }), [messages, chatError, sendMessage])

  return (
    <OnlineCountContext.Provider value={onlineCountValue}>
      <LobbyChatContext.Provider value={lobbyChatValue}>
        {children}
      </LobbyChatContext.Provider>
    </OnlineCountContext.Provider>
  )
}

export function useOnlineCount() {
  const ctx = useContext(OnlineCountContext)
  if (!ctx) throw new Error('useOnlineCount must be used within a LiveProvider')
  return ctx
}

export function useLobbyChat() {
  const ctx = useContext(LobbyChatContext)
  if (!ctx) throw new Error('useLobbyChat must be used within a LiveProvider')
  return ctx
}
