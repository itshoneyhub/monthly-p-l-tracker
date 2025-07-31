require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { getConnection } = require('./db');

const incomeRoutes = require('./routes/income');
const expenseRoutes = require('./routes/expenses');
const liabilityRoutes = require('./routes/liabilities');
const fixedEntryRoutes = require('./routes/fixedEntries');
const loginRoutes = require('./routes/login');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON bodies

app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

// Test DB connection
app.get('/test-db', async (req, res) => {
  try {
    await getConnection();
    res.send('Database connected successfully!');
  } catch (err) {
    console.error('Database connection failed in /test-db:', err);
    res.status(500).send(`Database connection failed: ${err.message}`);
  }
});

// Use API routes
app.use('/api/income', incomeRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/liabilities', liabilityRoutes);
app.use('/api/fixed-entries', fixedEntryRoutes);
app.use('/api/login', loginRoutes);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

