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
app.use(express.json()); // Use express.json middleware to parse JSON bodies
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Add this new route
app.get('/hello', (req, res) => {
    res.send('hello frontend');
});

app.post('/countries', async (req, res) => {
  try {
    const country = req.body.country;
    console.log(`Received country from client: ${country}`);
    
    const country_id_qq = await pool.query("SELECT country_id FROM countries WHERE country = '" + country + "'");
    const country_id = country_id_qq.rows[0].country_id;

    const response = await pool.query("SELECT state FROM states WHERE country_id = '" + country_id + "'");
    const states_list = response.data.states_list; // Access the 'states_list' array directly
    
    console.log(states_list);
    res.send({states_list});
  } catch (err) {
    console.error(err);
    res.status(500).send('Error occurred');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`)); 