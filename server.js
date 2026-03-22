require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Database Connection using your .env values
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) {
        console.error("DB Connection Error: " + err.message);
        return;
    }
    console.log("Connected to MySQL Database via Environment Variables!");
});

// 2. NutriTrack Meal Logging Route
// In your server.js
app.post('/log-meal', (req, res) => {
    const { name, meal, calories } = req.body;

    // Use CONCAT to keep the old food names and add the new one
    const sql = `
        INSERT INTO meals (user_name, food_name, calories) 
        VALUES (?, ?, ?) 
        ON DUPLICATE KEY UPDATE 
        calories = calories + VALUES(calories),
        food_name = CONCAT(food_name, ', ', VALUES(food_name))`;

    db.query(sql, [name, meal, calories], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "DB Error" });
        }

        const totalSql = "SELECT SUM(calories) AS total FROM meals WHERE user_name = ?";
        db.query(totalSql, [name], (err, rows) => {
            if (err) return res.status(500).json({ error: "Fetch Error" });
            res.status(200).json({ message: "Success", total: rows[0].total });
        });
    });
});
// 3. Start Server on Port 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
