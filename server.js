const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.get('/', (req, res) => {
  res.json({ mensaje: 'API de GRESANOVA funcionando' });
});

app.post('/api/diagnosticos', async (req, res) => {
  try {
    const { nombre, email, empresa, respuestas } = req.body;
    const result = await pool.query(
      `INSERT INTO diagnosticos (nombre_cliente, email_cliente, empresa_cliente, respuestas) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [nombre, email, empresa, JSON.stringify(respuestas)]
    );
    res.status(201).json({ mensaje: 'Guardado exitosamente', id: result.rows[0].id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al guardar' });
  }
});

app.get('/api/diagnosticos', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, nombre_cliente, email_cliente, empresa_cliente, 
              TO_CHAR(fecha_creacion, 'YYYY-MM-DD') as fecha 
       FROM diagnosticos ORDER BY fecha_creacion DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error' });
  }
});

app.get('/api/diagnosticos/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM diagnosticos WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { usuario, password } = req.body;
  if (usuario === 'admin' && password === 'admin123') {
    res.json({ mensaje: 'Login exitoso', token: 'demo-token' });
  } else {
    res.status(401).json({ error: 'Credenciales incorrectas' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT}`);
});

module.exports = app;
