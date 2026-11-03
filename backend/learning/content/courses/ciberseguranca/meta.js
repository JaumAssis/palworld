// Metadados do curso de Cibersegurança — usados no catálogo e no cabeçalho da trilha. `id` precisa
// bater com o nome desta pasta (courses/ciberseguranca), checado no boot por validateAll em
// ../../index.js. order: 13 — depois do OWASP no catálogo (a ordem visual é manual, ver
// LearningCatalog.jsx). Curso defensivo e educacional: nenhum exploit, payload ou malware funcional.
module.exports = {
  id: 'ciberseguranca',
  order: 13,
  title: 'Cibersegurança',
  subtitle: 'Fundamentos de proteção de pessoas, sistemas, redes e dados: do hábito seguro à defesa, detecção e resposta a incidentes.',
  accent: '#0ea5e9'
};
