const express = require('express');
const cors = require('cors'); // Require cors middleware
const app = express();
const path = require('path');
const { Pool } = require('pg');

app.use(cors()); // Use cors middleware
app.use(express.static('public'));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS countries (
        id SERIAL PRIMARY KEY,
        country VARCHAR(50)
      )
    `);
    console.log('Table created successfully');

    const countries = ['Germany', 'France', 'Poland'];
    for (const country of countries) {
      await pool.query('INSERT INTO countries (country) VALUES ($1)', [country]);
      console.log(`Inserted ${country} into the table`);
    }
  } catch (err) {
    console.error(err);
  }
})();

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/hello', (req, res) => {
    res.send('hello frontend');
});

app.get('/countries', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM countries');
    console.log(result.rows);
    res.send(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error occurred');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));