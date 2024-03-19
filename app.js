const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('<body style="background-color:black;"><p style="color:darkgreen;">Hello</p></body>');
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));