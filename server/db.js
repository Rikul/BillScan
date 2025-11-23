const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function getDb() {
  const db = await open({
    filename: path.join(__dirname, 'bills.db'),
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS bills (
      id TEXT PRIMARY KEY,
      storeName TEXT,
      date TEXT,
      subtotal REAL,
      tax REAL,
      total REAL,
      currency TEXT,
      imageData TEXT,
      createdAt TEXT,
      lineItems TEXT
    )
  `);

  return db;
}

module.exports = { getDb };
