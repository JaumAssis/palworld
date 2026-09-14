// Metadados do curso Rust — usados no catálogo e no cabeçalho da trilha. `id` precisa bater com
// o nome desta pasta (courses/rust), checado no boot por validateAll em ../../index.js. order: 3
// — logo abaixo do Python no catálogo, por pedido do usuário (GameMaker e SPED foram renumerados
// para 4 e 5 para manter a sequência coerente).
module.exports = {
  id: 'rust',
  order: 3,
  title: 'Rust',
  subtitle: 'Ownership, borrowing e a segurança de memória sem garbage collector.',
  accent: '#ce422b'
};
