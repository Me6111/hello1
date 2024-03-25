const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.use(cors());
app.use(express.static('public'));

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

// Read the JSON file
fs.readFile('mysql_locations.json', 'utf8', async (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  // Parse the JSON data
  const jsonData = JSON.parse(data);

  // Iterate over each table in the data
  for (const table in jsonData) {
    // Create table if not exists
    const createTableQuery = `CREATE TABLE IF NOT EXISTS ${table} (${Object.keys(jsonData[table][0]).join(' text, ')} text)`;
    try {
      await pool.query(createTableQuery);
    } catch (err) {
      console.error(err);
    }

    // Iterate over each record in the table
    for (const record of jsonData[table]) {
      // Build an SQL query to insert the record into the table
      const columns = Object.keys(record).join(', ');
      const values = Object.values(record).map(value => `'${value}'`).join(', ');
      const query = `INSERT INTO ${table} (${columns}) VALUES (${values})`;

      // Execute the query
      try {
        await pool.query(query);
      } catch (err) {
        console.error(err);
      }
    }
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));