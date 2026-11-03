// Metadados do curso de Node.js — usados no catálogo e no cabeçalho da trilha. `id` precisa bater
// com o nome desta pasta (courses/nodejs), checado no boot por validateAll em ../../index.js.
// order: 14 — depois de Cibersegurança no catálogo (a ordem visual é manual, ver
// LearningCatalog.jsx). Não há curso de JavaScript separado: o nível iniciante ensina o JavaScript
// necessário antes do Node em si.
module.exports = {
  id: 'nodejs',
  order: 14,
  title: 'Node.js',
  subtitle: 'JavaScript no back-end: do primeiro script a APIs, tempo real, bancos de dados e operação em produção.',
  accent: '#16a34a'
};
