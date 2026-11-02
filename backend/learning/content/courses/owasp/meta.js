// Metadados do curso Segurança de Aplicações Web (OWASP) — usados no catálogo e no cabeçalho da
// trilha. `id` precisa bater com o nome desta pasta (courses/owasp), checado no boot por
// validateAll em ../../index.js. order: 12 — depois do Linux no catálogo (a ordem visual do
// catálogo é manual, ver LearningCatalog.jsx). Curso defensivo e educacional: exemplos de ataque
// só em laboratório local com código fictício, sempre junto da correção.
module.exports = {
  id: 'owasp',
  order: 12,
  title: 'Segurança de Aplicações Web (OWASP)',
  subtitle: 'As vulnerabilidades mais comuns em aplicações web e como prevenir, testar e detectar cada uma.',
  accent: '#dc2626'
};
