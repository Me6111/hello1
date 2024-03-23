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
    const result = await pool.query('SELECT * FROM country');
    console.log(result.rows);
    res.send(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error occurred');
  }
});

const port = process.env.PORT || 3000;

// Read the JSON file
const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));

// Group data by model
const groupedData = data.reduce((acc, item) => {
  const tableName = item.model.split('.')[1];
  if (!acc[tableName]) {
    acc[tableName] = [];
  }
  acc[tableName].push(item.fields);
  return acc;
}, {});

// Define the schema for the country and state tables
const tableSchemas = {
  country: 'id INT, country TEXT',
  state: 'id INT, state TEXT, country_id INT'
};

// Iterate over each table in the data
for (const tableName in groupedData) {
  // Use the predefined schema for the table
  const fields = tableSchemas[tableName];

  // Create the table
  const createTableQuery = `CREATE TABLE IF NOT EXISTS ${tableName} (${fields})`;

  pool.query(createTableQuery, (err) => {
    if (err) {
      console.error(`Error creating table ${tableName}`, err.stack);
    } else {
      console.log(`Table ${tableName} created`);

      // Insert the JSON data into the table
      groupedData[tableName].forEach((item) => {
        const keys = Object.keys(item);
        const values = Object.values(item);

        const insertQuery = `
          INSERT INTO ${tableName} (${keys.join(', ')})
          VALUES (${values.map((_, i) => `$${i + 1}`).join(', ')})
        `;

        pool.query(insertQuery, values, (err) => {
          if (err) {
            console.error(`Error inserting data into ${tableName}`, err.stack);
          } else {
            console.log(`Data inserted into ${tableName}`);
          }
        });
      });
    }
  });
}

app.listen(port, () => console.log(`Server running on port ${port}`));