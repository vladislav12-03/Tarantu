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

// Получение пароля админ-панели
app.get('/api/admin-password', async (req, res) => {
  try {
    const result = await db.query('SELECT admin_password FROM admin_settings LIMIT 1');
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Admin password not found' });
    } else {
      res.json({ password: result.rows[0].admin_password });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Генерация уникального ID
async function generateUniqueId() {
  while (true) {
    const id = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const result = await db.query('SELECT id FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return id;
    }
  }
}

// Модифицируем регистрацию пользователя
app.post('/api/register', async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  try {
    const hash = await bcrypt.hash(password, 10);
    const userId = await generateUniqueId();
    const result = await db.query(
      'INSERT INTO users (id, username, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, role',
      [userId, username, hash, role || 'user']
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

// Получение списка пользователей
app.get('/api/users', async (req, res) => {
  try {
    const result = await db.query('SELECT id, username, role FROM users ORDER BY username');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения списка пользователей', details: err.message });
  }
});

// Получение всех отчётов
app.get('/api/reports', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM reports ORDER BY date DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения отчётов', details: err.message });
  }
});

// Добавление нового отчёта
app.post('/api/reports', async (req, res) => {
  const { player, reason, article, punishment, proof, admin } = req.body;
  if (!player || !reason || !article || !punishment || !admin) {
    return res.status(400).json({ error: 'Все обязательные поля должны быть заполнены' });
  }
  try {
    const result = await db.query(
      'INSERT INTO reports (player, reason, article, punishment, proof, admin) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [player, reason, article, punishment, proof || null, admin]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка добавления отчёта', details: err.message });
  }
});

// Удаление отчёта
app.delete('/api/reports/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM reports WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка удаления отчёта', details: err.message });
  }
});

// --- API для заявок (анкет) ---
// Получить все заявки
app.get('/api/forms', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM forms ORDER BY date DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения заявок', details: err.message });
  }
});

// Добавить новую заявку
app.post('/api/forms', async (req, res) => {
  const { role, data } = req.body;
  if (!role || !data) {
    return res.status(400).json({ error: 'Роль и данные заявки обязательны' });
  }
  try {
    const result = await db.query(
      'INSERT INTO forms (role, data) VALUES ($1, $2) RETURNING *',
      [role, data]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка добавления заявки', details: err.message });
  }
});

// Обновить статус заявки
app.patch('/api/forms/:id', async (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Новый статус обязателен' });
  try {
    const result = await db.query(
      'UPDATE forms SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Заявка не найдена' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка обновления статуса', details: err.message });
  }
});

// Удалить заявку
app.delete('/api/forms/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM forms WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка удаления заявки', details: err.message });
  }
});

// Абсолютный путь к корню проекта (где лежат index.html, css, js и т.д.)
const STATIC_PATH = path.resolve(__dirname, '..');

// СТАТИКА только после всех API-роутов
app.use(express.static(STATIC_PATH));

// Catch-all только в самом конце!
app.get('*', (req, res) => {
    res.sendFile(path.join(STATIC_PATH, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 
