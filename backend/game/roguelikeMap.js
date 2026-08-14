const { shuffle } = require('./PlayerState')

// Tamanho de expedição escolhido junto com o deck-personagem — número de camadas comuns antes do
// Boss (sempre 3 trilhas por camada, ver NODES_PER_LAYER). Curta ~12 nós+Boss, Média ~18 nós+Boss
// (era o único tamanho antes disso existir), Longa ~27 nós+Boss.
const EXPEDITION_LENGTHS = { short: 4, medium: 6, long: 9 }
const DEFAULT_EXPEDITION_LENGTH = 'medium'
const NODES_PER_LAYER = 3
const NODE_TYPES = ['battle', 'medicine_bench', 'shop', 'event']

// Pesos por PROGRESSO na expedição (0 = primeira camada, 1 = última camada comum, pré-Boss) em vez
// de por índice fixo de camada — assim funciona igual pra qualquer tamanho de expedição. Early
// favorece Battle/Event, tardio favorece Shop/Medicine Bench (última chance de preparar o deck).
function weightsForProgress(progress) {
  return {
    battle: 45 - 15 * progress,
    event: 35 - 15 * progress,
    shop: 10 + 15 * progress,
    medicine_bench: 10 + 15 * progress
  }
}

function weightedNodeType(weights) {
  const total = Object.values(weights).reduce((sum, w) => sum + w, 0)
  let roll = Math.random() * total
  for (const type of NODE_TYPES) {
    roll -= weights[type]
    if (roll <= 0) return type
  }
  return NODE_TYPES[NODE_TYPES.length - 1]
}

function nodesInLayer(count, layerIndex, progress) {
  const weights = weightsForProgress(progress)
  const nodes = []
  for (let i = 0; i < count; i++) {
    nodes.push({
      id: `L${layerIndex}N${i}`,
      layer: layerIndex,
      lane: i, // posição da trilha dentro da camada (0=topo, count-1=base) — só usado pro layout/braiding
      type: weightedNodeType(weights),
      edgesTo: [],
      status: layerIndex === 0 ? 'available' : 'locked'
    })
  }
  return nodes
}

// Liga cada nó da camada anterior a 1-2 nós da próxima, com viés pra trilha VIZINHA (mesmo índice
// ou adjacente) em vez de qualquer nó aleatório — é isso que faz as 3 trilhas se entrelaçarem
// visualmente (cruzam ocasionalmente pra vizinha) sem virar uma teia de linhas cruzando a tela
// inteira. Depois garante que todo nó da próxima camada tenha pelo menos 1 aresta entrando — sem
// isso um nó do meio poderia ficar inalcançável. Caminhos podem convergir (2 nós de origem
// apontando pro mesmo destino), igual Slay the Spire.
function connectLayers(fromNodes, toNodes) {
  for (const from of fromNodes) {
    const preferredLane = Math.round((from.lane / Math.max(1, fromNodes.length - 1)) * (toNodes.length - 1))
    const neighborLanes = [preferredLane - 1, preferredLane, preferredLane + 1].filter(lane => lane >= 0 && lane < toNodes.length)
    const numTargets = 1 + (Math.random() < 0.5 ? 1 : 0)
    const chosenLanes = shuffle(neighborLanes).slice(0, Math.min(numTargets, neighborLanes.length))
    from.edgesTo = chosenLanes.map(lane => toNodes[lane].id)
  }
  // Fallback pra garantir que todo nó da próxima camada tenha ao menos 1 entrada — também com
  // viés de trilha vizinha (o nó de origem com lane mais próxima do alvo), senão esse fallback
  // sozinho já reintroduzia saltos longos que iam contra o objetivo do entrelaçamento local.
  const reached = new Set(fromNodes.flatMap(f => f.edgesTo))
  for (const to of toNodes) {
    if (!reached.has(to.id)) {
      const closest = [...fromNodes].sort((a, b) => Math.abs(a.lane - to.lane) - Math.abs(b.lane - to.lane))[0]
      closest.edgesTo.push(to.id)
    }
  }
}

// Garante pelo menos 1 Shop e 1 Medicine Bench em algum lugar do mapa antes do Boss — sem isso
// uma run azarada poderia nunca ver loja nem bancada de remédios. Converte um Battle/Event
// sorteado (preferindo camadas mais tardias) se nenhum apareceu organicamente.
function guaranteeUtilityNodes(commonNodes) {
  for (const requiredType of ['shop', 'medicine_bench']) {
    if (commonNodes.some(n => n.type === requiredType)) continue
    const candidates = commonNodes.filter(n => n.type === 'battle' || n.type === 'event')
    const sortedByLayerDesc = candidates.sort((a, b) => b.layer - a.layer)
    if (sortedByLayerDesc.length > 0) sortedByLayerDesc[0].type = requiredType
  }
}

// Gera o grafo inteiro de uma run nova pro tamanho de expedição escolhido (curta/média/longa, ver
// EXPEDITION_LENGTHS — cai pra 'medium' se vier um valor inválido/ausente). Devolve
// { nodes: {id: node}, expeditionLength, commonLayerCount } — os 2 últimos campos viajam junto na
// coluna JSON `map` e são usados por getDepthTier (roguelikeBattle.js) pra escalar a dificuldade
// do bot proporcionalmente ao tamanho de CADA run, não a um número fixo de camadas.
function generateMap(expeditionLength) {
  const nodeLayers = EXPEDITION_LENGTHS[expeditionLength] || EXPEDITION_LENGTHS[DEFAULT_EXPEDITION_LENGTH]
  const resolvedLength = EXPEDITION_LENGTHS[expeditionLength] ? expeditionLength : DEFAULT_EXPEDITION_LENGTH

  const layers = []
  for (let i = 0; i < nodeLayers; i++) {
    const progress = nodeLayers <= 1 ? 1 : i / (nodeLayers - 1)
    layers.push(nodesInLayer(NODES_PER_LAYER, i, progress))
  }
  for (let i = 0; i < layers.length - 1; i++) connectLayers(layers[i], layers[i + 1])

  const commonNodes = layers.flat()
  guaranteeUtilityNodes(commonNodes)

  const bossNode = { id: 'BOSS', layer: nodeLayers, lane: 0, type: 'boss', edgesTo: [], status: 'locked' }
  for (const node of layers[layers.length - 1]) node.edgesTo = [bossNode.id]

  const nodes = {}
  for (const node of [...commonNodes, bossNode]) nodes[node.id] = node
  return { nodes, expeditionLength: resolvedLength, commonLayerCount: nodeLayers }
}

function getAvailableNodeIds(map) {
  return Object.values(map.nodes).filter(n => n.status === 'available').map(n => n.id)
}

function canEnterNode(map, nodeId) {
  const node = map.nodes[nodeId]
  return !!node && node.status === 'available'
}

// Marca o nó como concluído, libera os nós que ele aponta, e tranca de vez qualquer outro nó ainda
// 'available' na mesma camada ou antes — sem isso o jogador conseguia "voltar atrás" e escolher uma
// opção de uma camada que ele já deixou pra trás (ex: o outro nó inicial, depois de já ter avançado
// pra camada 2). Como toda aresta só liga camada N à N+1, a camada do nó limpo agora É a fronteira:
// nada com layer <= a dele continua alcançável depois disso.
function markNodeCleared(map, nodeId) {
  const node = map.nodes[nodeId]
  if (!node) return map
  node.status = 'cleared'
  for (const targetId of node.edgesTo) {
    const target = map.nodes[targetId]
    if (target && target.status === 'locked') target.status = 'available'
  }
  for (const other of Object.values(map.nodes)) {
    if (other.id !== nodeId && other.layer <= node.layer && other.status === 'available') {
      other.status = 'locked'
    }
  }
  return map
}

module.exports = {
  EXPEDITION_LENGTHS,
  DEFAULT_EXPEDITION_LENGTH,
  NODES_PER_LAYER,
  NODE_TYPES,
  generateMap,
  getAvailableNodeIds,
  canEnterNode,
  markNodeCleared
}
