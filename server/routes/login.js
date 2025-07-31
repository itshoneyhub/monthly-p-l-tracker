const express = require('express');
const router = express.Router();
const { getConnection, sql } = require('../db');

router.post('/', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const pool = await getConnection();
    // In a real application, you would hash passwords and compare them securely.
    // For this example, we'll use a simple check against a hardcoded user.
    if (username === 'hanumant' && password === 'password') {
      // In a real application, you would generate a JWT token here.
      res.status(200).json({ message: 'Login successful', token: 'fake-jwt-token' });
    } else {
      res.status(401).json({ message: 'Invalid credentials.' });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send(err.message);
  }
});

module.exports = router;
