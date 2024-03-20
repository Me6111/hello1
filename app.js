const express = require('express');
const cors = require('cors'); // Require cors middleware
const app = express();
const path = require('path');
const { Pool } = require('pg');

app.use(cors()); // Use cors middleware
app.use(express.static('public'));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Modify this route
app.get('/hello', async (req, res) => {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM countries LIMIT 1');
    const firstRow = result.rows[0];
    res.send(`hello frontend, 1st row of table countries: ${JSON.stringify(firstRow)}`);
    client.release();
});

// Add the /countries route
app.get('/countries', async (req, res) => {
  const client = await pool.connect();
  const result = await client.query('SELECT * FROM countries');
  const results = { 'results': (result) ? result.rows : null};
  res.send(results);
  client.release();
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));