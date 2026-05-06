# SQL Query Code Implementation - TODO

## Approved Plan Breakdown
**Goal**: Add standard SQL (SQLite) for products/orders, replace SF SOQL with backend API.

### Step 1: Create SQL schema and queries file ✅\n- Created `sql_queries.sql` with schema, sample data, queries (SOQL equivalent + more).\n\n### Step 2: Setup backend ✅\n- Updated `backend/package.json` with deps.\n- Created `backend/server.js` with SQLite, /api/products, /api/orders.\n- Run manually: Open new terminal in `backend/`, run `npm install` then `npm start`.\n\n### Step 3: Update frontend ✅\n- Edited `script.js`: Removed SF/default, added API fetch to loadProducts(). Minor TS lint warnings ignored (JS file).\n\n### Step 4: Test [PENDING]\n- `cd backend && npm start`\n- Open index.html, login (admin/1234), verify products from DB, cart/checkout.\n\n### Step 5: Complete [PENDING]

### Step 4: Test [PENDING]
- Run `node backend/server.js`
- Refresh index.html, verify products load from DB.
- Test add to cart, checkout.

### Step 5: Complete [PENDING]
- Mark done, provide run instructions.

