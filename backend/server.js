const express = require('express');
const path = require('path');
const db = require('./db');
const bcrypt = require('bcrypt');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Проверка подключения к базе
(async () => {
  try {
    const res = await db.query('SELECT NOW()');
    console.log('Postgres connected:', res.rows[0]);
  } catch (err) {
    console.error('Postgres connection error:', err);
  }
})();

// Регистрация пользователя
app.post('/api/register', async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role',
      [username, hash, role || 'user']
    );
    res.json({ user: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      res.status(409).json({ error: 'Username already exists' });
    } else {
      res.status(500).json({ error: 'Registration error', details: err.message });
    }
  }
});

// Логин пользователя
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  try {
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ id: user.id, username: user.username, role: user.role });
  } catch (err) {
    res.status(500).json({ error: 'Login error', details: err.message });
  }
});

// Добавление пользователя (только для админа)
app.post('/api/users', async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) return res.status(400).json({ error: 'Все поля обязательны' });

  // Здесь должна быть проверка, что запрос делает админ (например, по токену или роли)
  // Пока что без авторизации для простоты

  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role',
      [username, hash, role]
    );
    res.json({ user: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      res.status(409).json({ error: 'Пользователь с таким логином уже существует' });
    } else {
      res.status(500).json({ error: 'Ошибка добавления пользователя', details: err.message });
    }
  }
});

// Абсолютный путь к корню проекта (где лежат index.html, css, js и т.д.)
const STATIC_PATH = path.resolve(__dirname, '..');

app.use(express.static(STATIC_PATH));

// Для всех остальных маршрутов отдаём index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(STATIC_PATH, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 
