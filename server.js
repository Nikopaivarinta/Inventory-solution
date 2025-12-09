const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database('./inventory.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database with schema and seed data
function initializeDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT,
      quantity INTEGER NOT NULL DEFAULT 0,
      price REAL NOT NULL,
      image TEXT
    )
  `, (err) => {
    if (err) {
      console.error('Error creating table:', err);
    } else {
      seedDatabase();
    }
  });
}

// Seed database with 20 products
function seedDatabase() {
  db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
    if (err) {
      console.error('Error checking products:', err);
      return;
    }
    
    if (row.count === 0) {
      const products = [
        { name: 'Wireless Mouse', description: 'Ergonomic wireless mouse with 2.4GHz connection', category: 'Electronics', quantity: 45, price: 29.99, image: '🖱️' },
        { name: 'Mechanical Keyboard', description: 'RGB mechanical gaming keyboard', category: 'Electronics', quantity: 23, price: 89.99, image: '⌨️' },
        { name: 'USB-C Hub', description: '7-in-1 USB-C hub with HDMI and card reader', category: 'Electronics', quantity: 67, price: 45.50, image: '🔌' },
        { name: 'Laptop Stand', description: 'Aluminum adjustable laptop stand', category: 'Accessories', quantity: 34, price: 39.99, image: '💻' },
        { name: 'Webcam HD', description: '1080p webcam with built-in microphone', category: 'Electronics', quantity: 12, price: 79.99, image: '📷' },
        { name: 'Phone Case', description: 'Shockproof protective phone case', category: 'Accessories', quantity: 156, price: 15.99, image: '📱' },
        { name: 'Screen Protector', description: 'Tempered glass screen protector', category: 'Accessories', quantity: 89, price: 9.99, image: '🛡️' },
        { name: 'Wireless Charger', description: 'Fast wireless charging pad', category: 'Electronics', quantity: 41, price: 25.99, image: '🔋' },
        { name: 'Bluetooth Speaker', description: 'Portable waterproof Bluetooth speaker', category: 'Electronics', quantity: 28, price: 59.99, image: '🔊' },
        { name: 'Headphones', description: 'Noise-canceling over-ear headphones', category: 'Electronics', quantity: 19, price: 149.99, image: '🎧' },
        { name: 'Monitor 24"', description: '24-inch Full HD IPS monitor', category: 'Electronics', quantity: 15, price: 199.99, image: '🖥️' },
        { name: 'Office Chair', description: 'Ergonomic mesh office chair', category: 'Furniture', quantity: 8, price: 299.99, image: '🪑' },
        { name: 'Desk Lamp', description: 'LED desk lamp with adjustable brightness', category: 'Furniture', quantity: 52, price: 34.99, image: '💡' },
        { name: 'Cable Organizer', description: 'Desktop cable management box', category: 'Accessories', quantity: 73, price: 12.99, image: '📦' },
        { name: 'Mouse Pad', description: 'Extended gaming mouse pad', category: 'Accessories', quantity: 94, price: 19.99, image: '🎯' },
        { name: 'External SSD 1TB', description: 'Portable solid-state drive 1TB', category: 'Electronics', quantity: 31, price: 119.99, image: '💾' },
        { name: 'Power Bank', description: '20000mAh portable power bank', category: 'Electronics', quantity: 48, price: 39.99, image: '🔌' },
        { name: 'HDMI Cable', description: '6ft HDMI 2.1 cable 4K support', category: 'Accessories', quantity: 127, price: 14.99, image: '🔗' },
        { name: 'Microphone', description: 'USB condenser microphone for streaming', category: 'Electronics', quantity: 22, price: 89.99, image: '🎤' },
        { name: 'Desk Organizer', description: 'Bamboo desk organizer with compartments', category: 'Furniture', quantity: 36, price: 24.99, image: '📐' }
      ];

      const stmt = db.prepare('INSERT INTO products (name, description, category, quantity, price, image) VALUES (?, ?, ?, ?, ?, ?)');
      
      products.forEach(product => {
        stmt.run(product.name, product.description, product.category, product.quantity, product.price, product.image);
      });
      
      stmt.finalize((err) => {
        if (err) {
          console.error('Error seeding database:', err);
        } else {
          console.log('Database seeded with 20 products');
        }
      });
    }
  });
}

// API Routes

// Get all products
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products ORDER BY name', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get single product
app.get('/api/products/:id', (req, res) => {
  db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(row);
  });
});

// Add new product
app.post('/api/products', (req, res) => {
  const { name, description, category, quantity, price, image } = req.body;
  
  if (!name || quantity === undefined || !price) {
    res.status(400).json({ error: 'Name, quantity, and price are required' });
    return;
  }

  db.run(
    'INSERT INTO products (name, description, category, quantity, price, image) VALUES (?, ?, ?, ?, ?, ?)',
    [name, description || '', category || 'General', quantity, price, image || '📦'],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json({ id: this.lastID, name, description, category, quantity, price, image });
    }
  );
});

// Update product quantity
app.put('/api/products/:id', (req, res) => {
  const { quantity, name, description, category, price, image } = req.body;
  const updates = [];
  const values = [];

  if (quantity !== undefined) {
    updates.push('quantity = ?');
    values.push(quantity);
  }
  if (name !== undefined) {
    updates.push('name = ?');
    values.push(name);
  }
  if (description !== undefined) {
    updates.push('description = ?');
    values.push(description);
  }
  if (category !== undefined) {
    updates.push('category = ?');
    values.push(category);
  }
  if (price !== undefined) {
    updates.push('price = ?');
    values.push(price);
  }
  if (image !== undefined) {
    updates.push('image = ?');
    values.push(image);
  }

  if (updates.length === 0) {
    res.status(400).json({ error: 'No fields to update' });
    return;
  }

  values.push(req.params.id);

  db.run(
    `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
    values,
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }
      res.json({ message: 'Product updated successfully' });
    }
  );
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
  db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json({ message: 'Product deleted successfully' });
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});
