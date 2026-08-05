const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const db = new Database(path.join(__dirname, 'palworld.db'));

// Cria a tabela de cartas (se não existir)
db.exec(`
  CREATE TABLE IF NOT EXISTS cards (
    card_number TEXT PRIMARY KEY,
    set_code TEXT,
    name TEXT,
    pal_name TEXT,
    card_type TEXT,
    subtype TEXT,
    colors TEXT,        -- salvo como JSON string, ex: '["Red"]'
    cost INTEGER,
    power INTEGER,
    strike INTEGER,
    rarity TEXT,
    keywords TEXT,      -- salvo como JSON string
    is_lucky INTEGER,
    image_path TEXT      -- caminho local, ex: 'cardart/BP01-001.png'
  )
`);

function seed() {
  const jsonPath = path.join(__dirname, 'data', 'palworld_all_cards.json');
  const cards = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  const insert = db.prepare(`
    INSERT OR REPLACE INTO cards
    (card_number, set_code, name, pal_name, card_type, subtype, colors, cost, power, strike, rarity, keywords, is_lucky, image_path)
    VALUES (@card_number, @set_code, @name, @pal_name, @card_type, @subtype, @colors, @cost, @power, @strike, @rarity, @keywords, @is_lucky, @image_path)
  `);

  const insertMany = db.transaction((cardsList) => {
    for (const c of cardsList) {
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
        image_path: `cardart/${c.card_number}.png`
      });
    }
  });

  insertMany(cards);
  console.log(`Seed concluído: ${cards.length} cartas inseridas no banco.`);
}

seed();
db.close();