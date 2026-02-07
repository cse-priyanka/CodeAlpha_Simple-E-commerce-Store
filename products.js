const baseUrl = "http://127.0.0.1:4000";
const currentUser = localStorage.getItem("currentUser");

if (!currentUser) {
  alert("Please login first");
  window.location.href = "login.html";
}

let allProducts = [];

// ---------------- LOAD PRODUCTS ----------------
function loadProducts() {
  fetch(`${baseUrl}/products`)
    .then(res => res.json())
    .then(data => {
      allProducts = data;
      displayProducts(data);
      loadCart();
    });
}

function displayProducts(products) {
  const list = document.getElementById("productList");
  list.innerHTML = "";

  products.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <img src="${p.image}">
      <div class="product-info">
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <strong>₹${p.price}</strong>
        <button onclick="addToCart('${p._id}')">Add to Cart</button>
      </div>
    `;

    list.appendChild(card);
  });
}

// ---------------- FILTER ----------------
document.getElementById("categoryFilter").onchange = filterProducts;
document.getElementById("searchInput").oninput = filterProducts;

function filterProducts() {
  const cat = categoryFilter.value;
  const search = searchInput.value.toLowerCase();

  const filtered = allProducts.filter(p =>
    (cat === "all" || p.category === cat) &&
    p.name.toLowerCase().includes(search)
  );

  displayProducts(filtered);
}

// ---------------- CART ----------------
function addToCart(productId) {
  fetch(`${baseUrl}/cart/${currentUser}/${productId}`, { method: "POST" })
    .then(() => loadCart());
}

function decreaseItem(productId) {
  fetch(`${baseUrl}/cart/${currentUser}/${productId}`, { method: "DELETE" })
    .then(() => loadCart());
}

function loadCart() {
  fetch(`${baseUrl}/cart/${currentUser}`)
    .then(res => res.json())
    .then(renderCart);
}

function renderCart(cart) {
  const cartDiv = document.getElementById("cart");
  cartDiv.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <img src="${item.product.image}">
      <span>${item.product.name}</span>
      <span>₹${item.product.price}</span>
      <button onclick="addToCart('${item.product._id}')">+</button>
      <span>${item.quantity}</span>
      <button onclick="decreaseItem('${item.product._id}')">-</button>
    `;
    cartDiv.appendChild(div);

    total += item.product.price * item.quantity;
  });

  document.getElementById("total").innerText = `Total: ₹${total}`;
}

// ---------------- ORDER ----------------
function placeOrder() {
  fetch(`${baseUrl}/order/${currentUser}`, { method: "POST" })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      loadCart();
    });
}

// ---------------- LOGOUT ----------------
function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
}

window.onload = loadProducts;
