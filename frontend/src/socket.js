import { io } from 'socket.io-client'
import { API_URL } from './api'

// Conexão única e persistente durante toda a vida da aba, compartilhada por GameBoard.jsx (partida
// vs Bot) e FindMatchDeckSelect.jsx (partida online). Importante: socket.io-client NÃO deduplica
// sozinho 2 chamadas io(mesmaUrl) — se o namespace padrão ("/") já estiver conectado, a 2ª chamada
// força uma conexão NOVA em vez de reaproveitar (ver lookup() no pacote). Por isso o io(...) só
// pode ser chamado 1x no app inteiro, aqui — nunca direto dentro de um componente/página.
export const socket = io(API_URL, { withCredentials: true })
