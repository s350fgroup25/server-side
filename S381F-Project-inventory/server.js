const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const mongoUrl = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const dbName = process.env.DB_NAME || 'inventoryDB';

let db, itemsCollection;

// Middleware setup
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.use(require('express').static('public'));
app.use(cookieSession({
  name: 'session',
  keys: ['secretKeyHere'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// Connect to MongoDB
MongoClient.connect(mongoUrl, { useUnifiedTopology: true })
  .then(client => {
    db = client.db(dbName);
    itemsCollection = db.collection('items');
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  })
  .catch(error => console.error(error));

// Simple hardcoded user for login demo
const users = { admin: 'password' };

// Middleware to check if user logged in
function checkAuth(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
}

// Routes

// Login page
app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// Handle login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (users[username] && users[username] === password) {
    req.session.user = username;
    res.redirect('/');
  } else {
    res.render('login', { error: 'Invalid username or password' });
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

// Home page with inventory list
// GET /
app.get('/', checkAuth, async (req, res) => {
  const { q = '', min, max, page = 1, limit = 30 } = req.query;
  const filter = {};
  if (q) filter.name = { $regex: q, $options: 'i' };
  if (min || max) filter.quantity = {};
  if (min) filter.quantity.$gte = parseInt(min, 10);
  if (max) filter.quantity.$lte = parseInt(max, 10);

  const p = Math.max(parseInt(page, 10) || 1, 1);
  const L = Math.min(parseInt(limit, 10) || 30, 200);
  const skip = (p - 1) * L;

  const [items, totalCount] = await Promise.all([
    itemsCollection.find(filter).skip(skip).limit(L).toArray(),
    itemsCollection.countDocuments(filter)
  ]);

  res.render('index', { user: req.session.user, items, q, min, max, page: p, limit: L, totalCount });
});


// Add new item form
app.get('/add', checkAuth, (req, res) => {
  res.render('add');
});

// Handle add item
app.post('/add', checkAuth, async (req, res) => {
  const { name, quantity } = req.body;
  await itemsCollection.insertOne({ name, quantity: parseInt(quantity) });
  res.redirect('/');
});

// Edit item form
app.get('/edit/:id', checkAuth, async (req, res) => {
  const id = req.params.id;
  const item = await itemsCollection.findOne({ _id: new ObjectId(id) });
  res.render('edit', { item });
});

// Handle edit item
app.post('/edit/:id', checkAuth, async (req, res) => {
  const id = req.params.id;
  const { name, quantity } = req.body;
  await itemsCollection.updateOne({ _id: new ObjectId(id) }, { $set: { name, quantity: parseInt(quantity) } });
  res.redirect('/');
});

// Delete item
app.get('/delete/:id', checkAuth, async (req, res) => {
  const id = req.params.id;
  await itemsCollection.deleteOne({ _id: new ObjectId(id) });
  res.redirect('/');
});


// =============== RESTful API ===============

// Read all
app.get('/api/items', async (req, res) => {
  const items = await itemsCollection.find().toArray();
  res.json(items);
});

// Read one
app.get('/api/items/:id', async (req, res) => {
  const item = await itemsCollection.findOne({ _id: new ObjectId(req.params.id) });
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

// Create
app.post('/api/items', async (req, res) => {
  const { name, quantity } = req.body;
  const result = await itemsCollection.insertOne({ name, quantity: parseInt(quantity) });
  res.status(201).json({ _id: result.insertedId, name, quantity });
});

// Update
app.put('/api/items/:id', async (req, res) => {
  const { name, quantity } = req.body;
  const result = await itemsCollection.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: { name, quantity: parseInt(quantity) } }
  );
  res.json({ modifiedCount: result.modifiedCount });
});

// Delete
app.delete('/api/items/:id', async (req, res) => {
  const result = await itemsCollection.deleteOne({ _id: new ObjectId(req.params.id) });
  res.json({ deletedCount: result.deletedCount });
});