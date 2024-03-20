const express = require('express');
const cors = require('cors'); // Require cors middleware
const app = express();
const path = require('path');

app.use(cors()); // Use cors middleware
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Add this new route
app.get('/hello', (req, res) => {
    res.send('hello frontend');
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`)); 