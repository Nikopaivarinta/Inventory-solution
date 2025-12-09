const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/', limiter);

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
        { name: 'TaylorMade Driver', description: 'High-performance titanium driver with adjustable loft', category: 'Clubs', quantity: 15, price: 499.99, image: '⛳' },
        { name: 'Callaway Iron Set', description: 'Premium forged iron set (4-PW)', category: 'Clubs', quantity: 8, price: 899.99, image: '🏌️' },
        { name: 'Titleist Pro V1', description: 'Professional tour golf balls (1 dozen)', category: 'Balls', quantity: 125, price: 54.99, image: '⚪' },
        { name: 'Odyssey Putter', description: 'Blade putter with alignment technology', category: 'Clubs', quantity: 22, price: 279.99, image: '🏑' },
        { name: 'Hybrid Club 3H', description: 'Versatile hybrid club for long shots', category: 'Clubs', quantity: 18, price: 189.99, image: '🏌️' },
        { name: 'Golf Glove', description: 'Premium leather golf glove - left hand', category: 'Apparel', quantity: 67, price: 24.99, image: '🧤' },
        { name: 'Golf Shoes', description: 'Waterproof spiked golf shoes', category: 'Apparel', quantity: 34, price: 159.99, image: '👟' },
        { name: 'Golf Polo Shirt', description: 'Moisture-wicking performance polo', category: 'Apparel', quantity: 89, price: 69.99, image: '👕' },
        { name: 'Golf Balls - Distance', description: 'Long distance golf balls (1 dozen)', category: 'Balls', quantity: 156, price: 29.99, image: '⚪' },
        { name: 'Stand Bag', description: 'Lightweight stand bag with 6 pockets', category: 'Bags', quantity: 12, price: 189.99, image: '🎒' },
        { name: 'Cart Bag', description: 'Full-size cart bag with 14-way divider', category: 'Bags', quantity: 9, price: 249.99, image: '🎒' },
        { name: 'Range Finder', description: 'Laser rangefinder with slope technology', category: 'Accessories', quantity: 28, price: 299.99, image: '📡' },
        { name: 'Golf Tees', description: 'Wooden tees pack of 100', category: 'Accessories', quantity: 234, price: 9.99, image: '📌' },
        { name: 'Ball Markers', description: 'Magnetic ball markers set of 3', category: 'Accessories', quantity: 145, price: 12.99, image: '🔘' },
        { name: 'Golf Umbrella', description: '62" wind-resistant golf umbrella', category: 'Accessories', quantity: 41, price: 39.99, image: '☂️' },
        { name: 'Golf Towel', description: 'Microfiber golf towel with clip', category: 'Accessories', quantity: 73, price: 19.99, image: '🧺' },
        { name: 'Practice Net', description: 'Portable golf practice net with target', category: 'Accessories', quantity: 15, price: 129.99, image: '🥅' },
        { name: 'Wedge Set', description: 'Gap, sand, and lob wedge set', category: 'Clubs', quantity: 11, price: 349.99, image: '🏌️' },
        { name: 'Golf Cap', description: 'Adjustable performance golf cap', category: 'Apparel', quantity: 92, price: 29.99, image: '🧢' },
        { name: 'Divot Tool', description: 'Stainless steel divot repair tool', category: 'Accessories', quantity: 187, price: 14.99, image: '🔧' }
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
