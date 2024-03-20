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

// Add this new route
app.get('/hello', (req, res) => {
    res.send('hello frontend');
});

// Add the /countries route
app.get('/countries', async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM countries');
      const results = { 'results': (result) ? result.rows : null};
      res.send('full countries content: ' + JSON.stringify(results));
      client.release();
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error: ' + err.message);
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));