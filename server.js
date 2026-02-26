const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 'tigersgb', // <--- TYPE YOUR MYSQL PASSWORD HERE
    database: 'portfolio_db'
});

db.connect(err => {
    if (err) return console.error("DB Error: " + err.message);
    console.log("Connected to MySQL Database!");
});

// Route to save form data
app.post('/contact', (req, res) => {
    const { name, email, message } = req.body;
    const query = "INSERT INTO messages (name, email, message) VALUES (?, ?, ?)";
    db.query(query, [name, email, message], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send({ status: "Success", message: "Message saved!" });
    });
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));