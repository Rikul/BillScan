const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

let dbInstance = null;

/**
 * Check if a string looks like a base64-encoded image data URL.
 * Used for backward compatibility with old records that stored base64 images.
 */
function isBase64Image(value) {
  if (!value || typeof value !== 'string') return false;
  return value.startsWith('data:image/');
}

async function getDb() {
  if (!dbInstance) {
    // Use DATA_DIR environment variable if set, otherwise use current directory
    const dataDir = process.env.DATA_DIR || __dirname;
    dbInstance = await open({
      filename: path.join(dataDir, 'bills.db'),
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
        imagePath TEXT,
        createdAt TEXT,
        lineItems TEXT
      )
    `);
  }
  return dbInstance;
}

module.exports = { getDb, isBase64Image };
