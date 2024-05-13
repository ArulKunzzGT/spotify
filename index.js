const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/home', (req, res) => {
    res.sendFile(__dirname + '/public/home.html')
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});