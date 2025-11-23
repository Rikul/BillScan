const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

let dbInstance = null;

async function getDb() {
  if (!dbInstance) {
    dbInstance = await open({
      filename: path.join(__dirname, 'bills.db'),
      driver: sqlite3.Database
    });

    await dbInstance.exec(`
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
  }
  return dbInstance;
}

module.exports = { getDb };
