const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

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
