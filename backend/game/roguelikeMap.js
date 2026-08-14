const { shuffle } = require('./PlayerState')

// 5 camadas de nós comuns + 1 camada final só com o Boss — mapa curto (~10-12 nós antes do
// Boss), igual combinado com o usuário. Cada camada sorteia 2 ou 3 nós (viés pra 2, pra manter
// a média perto de ~11 nós no total).
const NODE_LAYERS = 5
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
      type: weightedNodeType(LAYER_WEIGHTS[layerIndex]),
      edgesTo: [],
      status: layerIndex === 0 ? 'available' : 'locked'
    })
  }
  return nodes
}

// Liga cada nó da camada anterior a 1-2 nós da próxima (aleatório), depois garante que todo nó
// da próxima camada tenha pelo menos 1 aresta entrando — sem isso um nó do meio poderia ficar
// inalcançável. Caminhos podem convergir (2 nós de origem apontando pro mesmo destino), igual
// Slay the Spire.
function connectLayers(fromNodes, toNodes) {
  for (const from of fromNodes) {
    const targets = shuffle(toNodes).slice(0, 1 + (Math.random() < 0.5 ? 1 : 0))
    from.edgesTo = targets.map(t => t.id)
  }
  const reached = new Set(fromNodes.flatMap(f => f.edgesTo))
  for (const to of toNodes) {
    if (!reached.has(to.id)) {
      const from = shuffle(fromNodes)[0]
      from.edgesTo.push(to.id)
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
  for (let i = 0; i < NODE_LAYERS; i++) {
    const count = Math.random() < 0.8 ? 2 : 3
    layers.push(nodesInLayer(count, i))
  }
  for (let i = 0; i < layers.length - 1; i++) connectLayers(layers[i], layers[i + 1])

  const commonNodes = layers.flat()
  guaranteeUtilityNodes(commonNodes)

  const bossNode = { id: 'BOSS', layer: NODE_LAYERS, type: 'boss', edgesTo: [], status: 'locked' }
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

// Marca o nó como concluído e libera os nós que ele aponta (sem rebaixar quem já estava
// 'available' ou 'cleared' por outro caminho que já tenha convergido ali).
function markNodeCleared(map, nodeId) {
  const node = map.nodes[nodeId]
  if (!node) return map
  node.status = 'cleared'
  for (const targetId of node.edgesTo) {
    const target = map.nodes[targetId]
    if (target && target.status === 'locked') target.status = 'available'
  }
  return map
}

module.exports = {
  NODE_LAYERS,
  NODE_TYPES,
  generateMap,
  getAvailableNodeIds,
  canEnterNode,
  markNodeCleared
}
