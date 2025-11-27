const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { getDb, isBase64Image } = require('./db');

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

// Allowed image extensions whitelist
const ALLOWED_EXTENSIONS = ['jpeg', 'jpg', 'png', 'gif', 'webp'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB max file size

// POST /api/upload-image - Upload an image
app.post('/api/upload-image', async (req, res) => {
  const { billId, imageData } = req.body;
  if (!billId || !imageData) {
    return res.status(400).json({ error: 'Bill ID and image data are required' });
  }

  // Validate billId to prevent path traversal attacks
  if (billId.includes('/') || billId.includes('\\') || billId.includes('..')) {
    return res.status(400).json({ error: 'Invalid bill ID' });
  }

  try {
    // Use a more robust regex pattern for MIME types
    const matches = imageData.match(/^data:image\/([a-z0-9\-\+]+);base64,/i);
    let extension = matches ? matches[1].toLowerCase() : 'jpeg';
    
    // Normalize jpeg variations
    if (extension === 'jpg') extension = 'jpeg';
    
    // Validate extension against whitelist
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return res.status(400).json({ error: 'Invalid image format. Allowed formats: ' + ALLOWED_EXTENSIONS.join(', ') });
    }

    const base64Data = imageData.replace(/^data:image\/[a-z0-9\-\+]+;base64,/i, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Validate file size
    if (imageBuffer.length > MAX_IMAGE_SIZE) {
      return res.status(400).json({ error: 'Image size exceeds maximum allowed size of 10MB' });
    }

    // Check for existing files and remove them to prevent orphaned files
    const existingFiles = fs.readdirSync(imagesDir).filter(f => f.startsWith(billId + '.'));
    existingFiles.forEach(f => fs.unlinkSync(path.join(imagesDir, f)));

    const imageName = `${billId}.${extension}`;
    const imagePath = path.join(imagesDir, imageName);

    // Use async file operations to avoid blocking the event loop
    await fs.promises.writeFile(imagePath, imageBuffer);

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
    // Parse lineItems from JSON string and handle backward compatibility for imagePath
    const parsedBills = bills.map(bill => {
      const parsed = {
        ...bill,
        lineItems: bill.lineItems ? JSON.parse(bill.lineItems) : []
      };
      // Handle backward compatibility: if imagePath looks like base64, use it as imageData for display
      // New records will have file paths; old records may have base64 in imagePath field
      if (isBase64Image(parsed.imagePath)) {
        parsed.imageData = parsed.imagePath;
        parsed.imagePath = null;
      }
      return parsed;
    });
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
    // Handle backward compatibility: if imagePath looks like base64, use it as imageData for display
    if (isBase64Image(bill.imagePath)) {
      bill.imageData = bill.imagePath;
      bill.imagePath = null;
    }
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
  // Validate imagePath is provided
  if (!bill.imagePath) {
    return res.status(400).json({ error: 'Image path is required' });
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
    const billId = req.params.id;
    
    // Delete associated image files
    const existingFiles = fs.readdirSync(imagesDir).filter(f => f.startsWith(billId + '.'));
    existingFiles.forEach(f => {
      try {
        fs.unlinkSync(path.join(imagesDir, f));
      } catch (e) {
        console.error('Error deleting image file:', e);
      }
    });
    
    await db.run('DELETE FROM bills WHERE id = ?', billId);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting bill:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/delete-image/:billId - Delete an orphaned image (for cleanup when saveBill fails)
app.delete('/api/delete-image/:billId', async (req, res) => {
  const { billId } = req.params;
  
  // Validate billId to prevent path traversal attacks
  if (billId.includes('/') || billId.includes('\\') || billId.includes('..')) {
    return res.status(400).json({ error: 'Invalid bill ID' });
  }
  
  try {
    const existingFiles = fs.readdirSync(imagesDir).filter(f => f.startsWith(billId + '.'));
    existingFiles.forEach(f => fs.unlinkSync(path.join(imagesDir, f)));
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting image:', err);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
