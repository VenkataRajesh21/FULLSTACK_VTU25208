-- SQL Queries for ShopEasy E-commerce
-- Using SQLite syntax (compatible with PostgreSQL/MySQL with minor changes)
-- Equivalent to SF SOQL: SELECT Id, Name, ProductCode__c, ListPrice, Stock__c FROM Product2 LIMIT 20

-- 1. CREATE TABLES
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

-- 2. INSERT SAMPLE DATA (matching defaultProducts)
INSERT OR IGNORE INTO products (id, name, product_code, list_price, stock, image) VALUES
('d1', 'Smartphone', 'SP001', 15000, 10, 'images/smartphone.webp'),
('d2', 'Headphones', 'HP001', 2000, 15, 'images/Headphones.webp'),
('d3', 'Laptop', 'LT001', 55000, 5, 'images/Laptop.webp'),
('d4', 'Smart Watch', 'SW001', 3000, 20, 'images/SmartWatch.webp');

-- 3. CORE QUERIES

-- Fetch products (SOQL equivalent)
SELECT id, name, product_code, list_price, stock FROM products LIMIT 20;

-- Search products
SELECT * FROM products WHERE name LIKE '%smart%' OR product_code LIKE '%smart%';

-- Low stock alert
SELECT name, stock FROM products WHERE stock <= 5;

-- Update stock after order
UPDATE products SET stock = stock - ? WHERE id = ?;

-- Insert new product (admin)
INSERT INTO products (id, name, product_code, list_price, stock, image)
VALUES ('new1', 'New Item', 'NI001', 10000, 10, 'images/new.jpg');

-- Create order
INSERT INTO orders (customer_name, customer_address, customer_phone, total)
VALUES ('John Doe', '123 Main St', '1234567890', 25000);

-- Get last order details
SELECT * FROM orders ORDER BY id DESC LIMIT 1;

-- Order items
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (1, 'd1', 1, 15000);

-- View order with items
SELECT o.*, p.name, oi.quantity, oi.price
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
ORDER BY o.id DESC;

