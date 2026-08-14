const { shuffle } = require('./PlayerState')

// 5 camadas de nós comuns + 1 camada final só com o Boss — mapa curto (~15-16 nós antes do Boss).
// Cada camada comum sempre tem exatamente 3 nós ("três caminhos" pedidos pelo usuário) — 3 trilhas
// que se cruzam ocasionalmente (ver connectLayers), em vez de um número variável por camada.
const NODE_LAYERS = 5
const NODES_PER_LAYER = 3
const NODE_TYPES = ['battle', 'medicine_bench', 'shop', 'event']

// Pesos por camada — early favorece Battle/Event, mid introduz Shop/Medicine Bench com mais
// força, pre-boss (última camada comum) dá a maior chance de Shop/Medicine Bench (última
// chance de preparar o deck antes do chefe).
const LAYER_WEIGHTS = [
  { battle: 45, event: 35, shop: 10, medicine_bench: 10 },
  { battle: 45, event: 35, shop: 10, medicine_bench: 10 },
  { battle: 35, event: 30, shop: 20, medicine_bench: 15 },
  { battle: 35, event: 30, shop: 20, medicine_bench: 15 },
  { battle: 30, event: 20, shop: 25, medicine_bench: 25 }
]

function weightedNodeType(weights) {
  const total = Object.values(weights).reduce((sum, w) => sum + w, 0)
  let roll = Math.random() * total
  for (const type of NODE_TYPES) {
    roll -= weights[type]
    if (roll <= 0) return type
  }
  return NODE_TYPES[NODE_TYPES.length - 1]
}

function nodesInLayer(count, layerIndex) {
  const nodes = []
  for (let i = 0; i < count; i++) {
    nodes.push({
      id: `L${layerIndex}N${i}`,
      layer: layerIndex,
      lane: i, // posição da trilha dentro da camada (0=topo, count-1=base) — só usado pro layout/braiding
      type: weightedNodeType(LAYER_WEIGHTS[layerIndex]),
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

// Gera o grafo inteiro de uma run nova. Devolve { nodes: {id: node} } — formato indexado por id
// pra facilitar lookup/mutação nas rotas, mesmo formato que vai direto pra coluna JSON `map`.
function generateMap() {
  const layers = []
  for (let i = 0; i < NODE_LAYERS; i++) layers.push(nodesInLayer(NODES_PER_LAYER, i))
  for (let i = 0; i < layers.length - 1; i++) connectLayers(layers[i], layers[i + 1])

  const commonNodes = layers.flat()
  guaranteeUtilityNodes(commonNodes)

  const bossNode = { id: 'BOSS', layer: NODE_LAYERS, lane: 0, type: 'boss', edgesTo: [], status: 'locked' }
  for (const node of layers[layers.length - 1]) node.edgesTo = [bossNode.id]

  const nodes = {}
  for (const node of [...commonNodes, bossNode]) nodes[node.id] = node
  return { nodes }
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
  NODE_LAYERS,
  NODES_PER_LAYER,
  NODE_TYPES,
  generateMap,
  getAvailableNodeIds,
  canEnterNode,
  markNodeCleared
}
