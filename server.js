require("dotenv").config({ path: "./.env" });

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();

const User = require("./models/User");
const Product = require("./models/Product");

// ------------------ MongoDB Connection ------------------

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB error:", err));
mongoose.connection.once("open", async () => {
  console.log("DB NAME:", mongoose.connection.name);
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log("COLLECTIONS:", collections.map(c => c.name));
});
app.use(cors());
app.use(express.json()); // to parse JSON body

// ------------------ Registration ------------------
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: "Username and password required" });

    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const newUser = new User({ username, password, cart: [] });
    await newUser.save();

    res.json({ message: "Registration successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------ Login ------------------
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    res.json({ message: "Login successful", username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------ Get all products ------------------
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// ------------------ Get single product ------------------
app.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------ Add product to cart ------------------
app.post("/cart/:username/:productId", async (req, res) => {
  try {
    const { username, productId } = req.params;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const cartItem = user.cart.find(
      item => item.product.toString() === productId
    );

    if (cartItem) {
      cartItem.quantity += 1;
    } else {
      user.cart.push({ product: productId, quantity: 1 });
    }

    await user.save();
    res.json({ message: "Added to cart" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------ Get user cart ------------------
app.get("/cart/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate("cart.product");   

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.cart); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------ Place order ------------------
app.post("/order/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.cart.length === 0) return res.status(400).json({ message: "Cart is empty" });

    user.cart = []; 
    await user.save();

    res.json({ message: "Order placed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------ Root check ------------------
app.get("/", (req, res) => {
  res.send("E-commerce backend running!");
});

// ------------------ Remove / Decrease product from cart ------------------
app.delete("/cart/:username/:productId", async (req, res) => {
  try {
    const { username, productId } = req.params;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const index = user.cart.findIndex(
      item => item.product.toString() === productId
    );

    if (index === -1)
      return res.status(404).json({ message: "Item not found" });

    if (user.cart[index].quantity > 1) {
      user.cart[index].quantity -= 1;
    } else {
      user.cart.splice(index, 1);
    }

    await user.save();

    const updatedUser = await User.findOne({ username })
      .populate("cart.product");

    res.json(updatedUser.cart);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------ Start server ------------------
app.listen(4000, () => {
  console.log("Server running on port 4000");
});

app.get("/debug-products-count", async (req, res) => {
  const count = await Product.countDocuments();
  res.json({ count });
});

app.post("/debug-add-product", async (req, res) => {
  const p = new Product({
    name: "Debug Product",
    price: 999,
    description: "Inserted from backend",
    image: "debug.jpg"
  });
  await p.save();
  res.json({ message: "Inserted", product: p });
});