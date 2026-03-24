const express = require('express');
const app = express();
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Authorization header missing or incorrect'
    });
  }
  const token = authHeader.split(' ')[1];
  if (token !== 'mysecrettoken') {
    return res.status(403).json({
      message: 'Invalid or missing token'
    });
  }
  next();
}
app.get('/public', (req, res) => {
  res.status(200).send('This is a public route. No authentication required.');
});
app.get('/protected', authenticateToken, (req, res) => {
  res.status(200).send('You have accessed a protected route with a valid Bearer token!');
});
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
