const express = require('express');
const cors = require('cors'); // Require cors middleware
const app = express();
const path = require('path');
const { Pool } = require('pg'); // Require pg module

// Create a new pool using the DATABASE_URL environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.use(cors()); // Use cors middleware
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Add this new route
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

app.get('/deleteTables', (req, res) => {
    deleteTables(pool)
      .then(() => res.send('Tables deleted successfully'))
      .catch(err => res.status(500).send(`Error deleting tables: ${err}`));

});

async function deleteTables(pool) {
  try {
    // Get a list of all tables (consider using information_schema)
    const result = await pool.query('SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\''); // Modify schema name if needed

    if (!result.rows.length) {
      return res.send('No tables found');
    }

    const deleteQueries = result.rows.map(row => `DROP TABLE ${row.table_name}`);
    for (const query of deleteQueries) {
      await pool.query(query);
    }
  } catch (err) {
    throw err;
  }
}


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`)); 