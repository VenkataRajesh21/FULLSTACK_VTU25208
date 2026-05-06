const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;
const dbPath = path.join(__dirname, 'database.db');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..'))); // Serve frontend

// Init DB
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('DB Error:', err);
  else console.log('SQLite DB connected');
  
  // Create tables & sample data
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      product_code TEXT UNIQUE,
      list_price REAL NOT NULL,
      stock INTEGER DEFAULT 0,
      image TEXT
    );
    
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      customer_address TEXT,
      customer_phone TEXT,
      total REAL NOT NULL,
      order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'pending'
    );
    
    CREATE TABLE IF NOT EXISTS order_items (
      order_id INTEGER,
      product_id TEXT,
      quantity INTEGER,
      price REAL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    INSERT OR IGNORE INTO products (id, name, product_code, list_price, stock, image) VALUES
    ('d1', 'Smartphone', 'SP001', 15000, 10, 'images/smartphone.webp'),
    ('d2', 'Headphones', 'HP001', 2000, 15, 'images/Headphones.webp'),
    ('d3', 'Laptop', 'LT001', 55000, 5, 'images/Laptop.webp'),
    ('d4', 'Smart Watch', 'SW001', 3000, 20, 'images/SmartWatch.webp');
  `, (err) => {
    if (err) console.error('Schema Error:', err);
  });
});

// API Routes

// GET /api/products - List products (SOQL equivalent)
app.get('/api/products', (req, res) => {
  db.all('SELECT id, name, product_code AS ProductCode__c, list_price AS ListPrice, stock AS Stock__c FROM products LIMIT 20', [], (err, rows) => {
    if (err) {
      res.status(500).json({error: err.message});
    } else {
      res.json({records: rows});
    }
  });
});

// POST /api/products - Add product (admin)
app.post('/api/products', (req, res) => {
  const {id, name, product_code, list_price, stock, image} = req.body;
  db.run(
    'INSERT OR REPLACE INTO products (id, name, product_code, list_price, stock, image) VALUES (?, ?, ?, ?, ?, ?)',
    [id, name, product_code, list_price, stock, image],
    function(err) {
      if (err) {
        res.status(500).json({error: err.message});
      } else {
        res.json({id: this.lastID, changes: this.changes});
      }
    }
  );
});

// POST /api/orders - Place order
app.post('/api/orders', (req, res) => {
  const {customer_name, customer_address, customer_phone, total, items} = req.body;
  
  db.run(
    'INSERT INTO orders (customer_name, customer_address, customer_phone, total) VALUES (?, ?, ?, ?)',
    [customer_name, customer_address, customer_phone, total],
    function(err) {
      if (err) {
        res.status(500).json({error: err.message});
      } else {
        const orderId = this.lastID;
        // Insert items & update stock
        const stmt = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
        items.forEach(item => {
          stmt.run(orderId, item.id, item.qty, item.price);
          // Update stock
          db.run('UPDATE products SET stock = stock - ? WHERE id = ?', [item.qty, item.id]);
        });
        stmt.finalize();
        res.json({orderId, message: 'Order placed!'});
      }
    }
  );
});

// Health check
app.get('/api/health', (req, res) => res.json({status: 'OK', db: dbPath}));

app.listen(PORT, () => {
  console.log(`🚀 Backend running: http://localhost:${PORT}`);
  console.log(`📊 API: http://localhost:${PORT}/api/products`);
});

