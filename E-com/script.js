let total = 0;
let products = [];

/* ================= DEFAULT PRODUCTS (FALLBACK) ================= */
const defaultProducts = [
    { id: "d1", name: "Smartphone", price: 15000, stock: 10, image: "images/smartphone.webp" },
    { id: "d2", name: "Headphones", price: 2000, stock: 15, image: "images/headphones.webp" },
    { id: "d3", name: "Laptop", price: 55000, stock: 5, image: "images/laptop.webp" },
    { id: "d4", name: "Smart Watch", price: 3000, stock: 20, image: "images/smartwatch.webp" }
];

/* ================= LOAD PRODUCTS FROM API ================= */
async function loadProducts() {
    try {
        const response = await fetch('http://localhost:3000/api/products');
        if (!response.ok) throw new Error('API error');
        const data = await response.json();
        // Map API fields to frontend format
        products = data.records.map(p => ({
            id: p.id,
            name: p.name,
            price: p.ListPrice,
            stock: p.Stock__c,
            image: p.image || 'images/no-image.png'
        }));
        console.log('Products loaded from API:', products);
    } catch (err) {
        console.warn('API load failed, using defaults:', err);
        products = defaultProducts;
    }
    displayProducts();
}

/* ================= CART ================= */
let cart = JSON.parse(localStorage.getItem("cart")) || [];

/* ================= DOM ================= */
const productList   = document.getElementById("product-list");
const cartItems     = document.getElementById("cart-items");
const totalPriceEl  = document.getElementById("total-price");
const cartCountEl   = document.getElementById("cart-count");

/* ================= DISPLAY PRODUCTS ================= */
function displayProducts(list = products) {
    if (!productList) return;

    let html = "";
    list.forEach(p => {
        html += `
            <div class="product">
                <img src="${p.image}" alt="${p.name}" 
                     onerror="this.src='images/no-image.png'">
                <h3>${p.name}</h3>
                <p>₹${p.price}</p>
                <small>Stock: ${p.stock ?? "∞"}</small><br>
                <button onclick="addToCart('${p.id}')">Add to Cart</button>
            </div>
        `;
    });

    productList.innerHTML = html;
}

/* ================= SEARCH ================= */
function searchProducts() {
    const searchInput = document.getElementById("search");
    if (!searchInput) return;

    const keyword = searchInput.value.toLowerCase();
    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(keyword)
    );

    displayProducts(filtered);
}

/* ================= ADD TO CART ================= */
function addToCart(id) {
    const product = products.find(p => p.id === id);
    const item = cart.find(i => i.id === id);

    if (!product) return;

    if (product.stock !== undefined) {
        const qtyInCart = item ? item.qty : 0;
        if (qtyInCart >= product.stock) {
            alert("Stock limit reached!");
            return;
        }
    }

    if (item) item.qty++;
    else cart.push({ ...product, qty: 1 });

    alert("Item added to cart 🛒");
    updateCart();
}

/* ================= CART FUNCTIONS ================= */
function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    if (delta > 0 && item.stock !== undefined && item.qty >= item.stock) {
        alert("No more stock!");
        return;
    }

    item.qty += delta;

    if (item.qty <= 0) removeItem(id);
    else updateCart();
}

function removeItem(id) {
    cart = cart.filter(i => i.id !== id);
    updateCart();
}

function updateCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
}

function renderCart() {
    if (!cartItems || !totalPriceEl || !cartCountEl) return;

    if (cart.length === 0) {
        cartItems.innerHTML = "<p class='empty-cart'>🛒 Cart is empty</p>";
        totalPriceEl.textContent = 0;
        cartCountEl.textContent = 0;
        return;
    }

    cartItems.innerHTML = "";
    total = 0;
    let count = 0;

    cart.forEach(item => {
        total += item.price * item.qty;
        count += item.qty;

        cartItems.innerHTML += `
            <div class="cart-item">
                <span>${item.name} (₹${item.price})</span>
                <div class="qty-btns">
                    <button onclick="changeQty('${item.id}', -1)">−</button>
                    <strong>${item.qty}</strong>
                    <button onclick="changeQty('${item.id}', 1)">+</button>
                </div>
                <span>₹${item.price * item.qty}</span>
                <button class="remove-btn" onclick="removeItem('${item.id}')">X</button>
            </div>
        `;
    });

    totalPriceEl.textContent = total;
    cartCountEl.textContent = count;

    localStorage.setItem("total", total);
}

function clearCart() {
    cart = [];
    localStorage.removeItem("cart");
    localStorage.setItem("total", 0);
    updateCart();
}

/* ================= CHECKOUT ================= */
function placeOrder() {
    const name = document.getElementById("custName")?.value.trim();
    const address = document.getElementById("custAddress")?.value.trim();
    const phone = document.getElementById("custPhone")?.value.trim();

    if (!name || !address || !phone) {
        alert("Please fill all details");
        return;
    }

    const order = {
        customer: { name, address, phone },
        items: cart,
        total,
        date: new Date().toLocaleString()
    };

    localStorage.setItem("order", JSON.stringify(order));
    localStorage.removeItem("cart");

    window.location.href = "invoice.html";
}

/* ================= LOGIN (UPDATED) ================= */
function login() {
    let user = document.getElementById("username").value;
    let pass = document.getElementById("password").value;

    let users = JSON.parse(localStorage.getItem("users")) || [];

    // Admin login
    if (user === "admin" && pass === "1234") {
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("role", "admin");
        window.location.href = "index.html";
        return;
    }

    // User login
    let validUser = users.find(u => u.username === user && u.password === pass);

    if (validUser) {
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("role", "user");
        window.location.href = "index.html";
    } else {
        document.getElementById("error-msg").innerText = "Invalid credentials";
    }
}

/* ================= SIGNUP ================= */
function signup() {
    let user = document.getElementById("newUser").value;
    let pass = document.getElementById("newPass").value;

    if (!user || !pass) {
        document.getElementById("msg").innerText = "Fill all fields";
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    users.push({ username: user, password: pass });

    localStorage.setItem("users", JSON.stringify(users));

    document.getElementById("msg").innerText = "Signup successful!";
}

/* ================= SHOW PASSWORD ================= */
function togglePass() {
    let p = document.getElementById("password");
    p.type = p.type === "password" ? "text" : "password";
}

/* ================= LOGOUT ================= */
function logout() {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("role");
    window.location.href = "login.html";
}



window.onload = function () {
  loadProducts();
  renderCart();

  // Hide admin button if not admin
  let role = localStorage.getItem("role");
  let btn = document.querySelector(".fab");

  if (btn && role !== "admin") {
      btn.style.display = "none";
  }
};

