// Predicado de busca compartilhado pelo Catálogo (CardGrid) e pelo Montar Decks (DeckBuilder) —
// além do nome, casa texto de efeito e work keywords (ex: buscar "Kindling" acha os Pals que têm
// essa keyword, buscar um trecho do efeito acha a carta mesmo sem saber o nome exato).
export function cardMatchesSearch(card, query) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  if (card.name.toLowerCase().includes(q)) return true
  if (card.effect_text && card.effect_text.toLowerCase().includes(q)) return true
  if ((card.work_keywords || []).some(k => k.toLowerCase().includes(q))) return true
  return false
}
