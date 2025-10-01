const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000; // or any port you like
const mongoUrl = 'mongodb://localhost:27017';
const dbName = 'inventoryDB';

let db, itemsCollection;

// Middleware setup
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
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
app.get('/', checkAuth, async (req, res) => {
  const items = await itemsCollection.find().toArray();
  res.render('index', { user: req.session.user, items });
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
