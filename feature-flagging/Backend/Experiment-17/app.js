const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
const SECRET_KEY = 'your_secret_key'; 
let balance = 1000; 

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(403).json({ message: 'Token missing' });
    const token = authHeader.split(' ')[1];
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid or expired token' });
        req.user = user;
        next();
    });
}

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Hardcoded for this demo
    if (username === 'user1' && password === 'password123') {
        const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

app.get('/balance', authenticateToken, (req, res) => {
    res.json({ balance });
});

app.post('/deposit', authenticateToken, (req, res) => {
    const { amount } = req.body;
    balance += amount;
    res.json({ message: `Deposited $${amount}`, newBalance: balance });
});

app.post('/withdraw', authenticateToken, (req, res) => {
    const { amount } = req.body;
    if (amount > balance) {
        return res.status(400).json({ message: 'Insufficient funds' });
    }
    balance -= amount;
    res.json({ message: `Withdrew $${amount}`, newBalance: balance });
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
