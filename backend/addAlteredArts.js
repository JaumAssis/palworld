const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const db = new Database(path.join(__dirname, 'palworld.db'));

const bp01Variants = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'bp01_variants.json'), 'utf-8'));
const td01Variants = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'td01_variants.json'), 'utf-8'));
const td02Variants = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'td02_variants.json'), 'utf-8'));
const allVariants = [...bp01Variants, ...td01Variants, ...td02Variants];

const insert = db.prepare(`
  INSERT OR REPLACE INTO cards
  (card_number, set_code, name, pal_name, card_type, subtype, colors, cost, power, strike, rarity, keywords, is_lucky, image_path)
  VALUES (@card_number, @set_code, @name, @pal_name, @card_type, @subtype, @colors, @cost, @power, @strike, @rarity, @keywords, @is_lucky, @image_path)
`);

const insertMany = db.transaction((cards) => {
  for (const c of cards) {
    insert.run({
      card_number: c.card_number,
      set_code: c.set_code,
      name: c.name,
      pal_name: c.pal_name || null,
      card_type: c.card_type,
      subtype: c.subtype || null,
      colors: JSON.stringify(c.color || []),
      cost: c.cost ?? null,
      power: c.power ?? null,
      strike: c.strike ?? null,
      rarity: c.rarity || null,
      keywords: JSON.stringify(c.keywords || []),
      is_lucky: c.is_lucky ? 1 : 0,
      image_path: `cardart/${c.card_number}.png` // baixe as imagens dessas variantes igual fizemos com as bases
    });
  }
});

insertMany(allVariants);
console.log(`Concluído: ${allVariants.length} variantes Altered Art inseridas (${bp01Variants.length} do BP01, ${td01Variants.length} do TD01, ${td02Variants.length} do TD02).`);
console.log('Lembre-se de baixar as imagens dessas variantes pra Assets/CardArt (ou public/cardart) usando o mesmo padrão de nome: CARD_NUMBER.png');

db.close();