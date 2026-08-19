const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'wishes.json');

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

function readWishes() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
      fs.writeFileSync(DATA_FILE, '[]', 'utf8');
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Unable to read wishes data:', error.message);
    return [];
  }
}

function writeWishes(wishes) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(wishes, null, 2), 'utf8');
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'birthday-site-backend' });
});

app.get('/api/wishes', (_req, res) => {
  const wishes = readWishes();
  res.json(wishes);
});

app.post('/api/wishes', (req, res) => {
  const { name, message } = req.body || {};
  const safeName = typeof name === 'string' ? name.trim() : '';
  const safeMessage = typeof message === 'string' ? message.trim() : '';

  if (!safeName || !safeMessage) {
    return res.status(400).json({ error: 'Both name and message are required.' });
  }

  const newWish = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: safeName,
    message: safeMessage,
    createdAt: new Date().toISOString()
  };

  const wishes = readWishes();
  wishes.unshift(newWish);
  const trimmed = wishes.slice(0, 20);
  writeWishes(trimmed);

  res.status(201).json(newWish);
});

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'happy_birthday_vijaya.html'));
});

app.get('/happy_birthday_vijaya.html', (_req, res) => {
  res.sendFile(path.join(__dirname, 'happy_birthday_vijaya.html'));
});

app.listen(PORT, () => {
  console.log(`Birthday backend is running at http://localhost:${PORT}`);
});
