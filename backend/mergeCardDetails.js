const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const db = new Database(path.join(__dirname, 'palworld.db'));

// Coluna nova pra guardar TUDO que a API devolver por carta (efeito, elemento, work suitability, etc)
try { db.exec('ALTER TABLE cards ADD COLUMN extra_data TEXT'); } catch (e) {
  console.log('Coluna extra_data já existe, seguindo...');
}

const detailsPath = path.join(__dirname, 'data', 'palworld_card_details.json');
const details = JSON.parse(fs.readFileSync(detailsPath, 'utf-8'));

const update = db.prepare('UPDATE cards SET extra_data = ? WHERE card_number = ?');
let updated = 0;

for (const [cardNumber, fullData] of Object.entries(details)) {
  const result = update.run(JSON.stringify(fullData), cardNumber);
  if (result.changes > 0) updated++;
}

console.log(`Concluído: ${updated} cartas atualizadas com dados completos.`);

// Mostra um exemplo dos campos que vieram, pra confirmar o que temos disponível agora
const sample = db.prepare('SELECT card_number, extra_data FROM cards WHERE extra_data IS NOT NULL LIMIT 1').get();
if (sample) {
  console.log(`\nExemplo (${sample.card_number}):`);
  console.log(JSON.stringify(JSON.parse(sample.extra_data), null, 2));
}

db.close();