const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { getDb } = require('./db');

const app = express();
const PORT = 3000;

// Increase limit for image uploads
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cors());

// Serve receipt images statically
const imagesDir = path.join(__dirname, 'receipts-images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
}
app.use('/receipts-images', express.static(imagesDir));

// POST /api/upload-image - Upload an image
app.post('/api/upload-image', (req, res) => {
  const { billId, imageData } = req.body;
  if (!billId || !imageData) {
    return res.status(400).json({ error: 'Bill ID and image data are required' });
  }

  try {
    const matches = imageData.match(/^data:image\/(\w+);base64,/);
    const extension = matches ? matches[1] : 'jpeg';
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    const imageName = `${billId}.${extension}`;
    const imagePath = path.join(imagesDir, imageName);

    fs.writeFileSync(imagePath, imageBuffer);

    const imageUrl = `/receipts-images/${imageName}`;
    res.json({ success: true, imagePath: imageUrl });
  } catch (err) {
    console.error('Error saving image:', err);
    res.status(500).json({ error: 'Failed to save image' });
  }
});

// GET /api/bills - Fetch all bills
app.get('/api/bills', async (req, res) => {
  try {
    const db = await getDb();
    const bills = await db.all('SELECT * FROM bills ORDER BY date DESC');
    // Parse lineItems from JSON string
    const parsedBills = bills.map(bill => ({
      ...bill,
      lineItems: bill.lineItems ? JSON.parse(bill.lineItems) : []
    }));
    res.json(parsedBills);
  } catch (err) {
    console.error('Error fetching bills:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bills/:id - Fetch a specific bill
app.get('/api/bills/:id', async (req, res) => {
  try {
    const db = await getDb();
    const bill = await db.get('SELECT * FROM bills WHERE id = ?', req.params.id);
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    bill.lineItems = bill.lineItems ? JSON.parse(bill.lineItems) : [];
    res.json(bill);
  } catch (err) {
    console.error('Error fetching bill:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bills - Create or Update a bill
app.post('/api/bills', async (req, res) => {
  const bill = req.body;
  if (!bill.id) {
    return res.status(400).json({ error: 'Bill ID is required' });
  }
  // Validate numeric fields
  if (
    typeof bill.subtotal !== 'number' ||
    typeof bill.tax !== 'number' ||
    typeof bill.total !== 'number' ||
    isNaN(bill.subtotal) ||
    isNaN(bill.tax) ||
    isNaN(bill.total)
  ) {
    return res.status(400).json({ error: 'Invalid numeric fields', subtotal: bill.subtotal, tax: bill.tax, total: bill.total });
  }
  // Validate required fields
  if (!bill.storeName || !bill.date || !bill.currency) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const db = await getDb();
    const lineItemsStr = JSON.stringify(bill.lineItems || []);

    // Check if exists
    const existing = await db.get('SELECT id FROM bills WHERE id = ?', bill.id);

    if (existing) {
      await db.run(
        `UPDATE bills SET
         storeName = ?, date = ?, subtotal = ?, tax = ?, total = ?,
         currency = ?, imagePath = ?, createdAt = ?, lineItems = ?
         WHERE id = ?`,
        [
          bill.storeName, bill.date, bill.subtotal, bill.tax, bill.total,
          bill.currency, bill.imagePath, bill.createdAt, lineItemsStr,
          bill.id
        ]
      );
    } else {
      await db.run(
        `INSERT INTO bills (id, storeName, date, subtotal, tax, total, currency, imagePath, createdAt, lineItems)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          bill.id, bill.storeName, bill.date, bill.subtotal, bill.tax, bill.total,
          bill.currency, bill.imagePath, bill.createdAt, lineItemsStr
        ]
      );
    }
    res.json({ success: true, id: bill.id });
  } catch (err) {
    console.error('Error saving bill:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/bills/:id - Delete a bill
app.delete('/api/bills/:id', async (req, res) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM bills WHERE id = ?', req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting bill:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
