const express = require('express');
const router = express.Router();
const { getConnection, sql } = require('../db');

// Get all expense entries
router.get('/', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT * FROM Expenses');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Add a new expense entry
router.post('/', async (req, res) => {
  const { description, amount, date } = req.body;
  try {
    const pool = await getConnection();
    await pool.request()
      .input('description', sql.NVarChar, description)
      .input('amount', sql.Decimal(10, 2), amount)
      .input('date', sql.Date, date)
      .query('INSERT INTO Expenses (description, amount, date) VALUES (@description, @amount, @date)');
    res.status(201).send('Expense entry added');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Update an expense entry
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { description, amount, date } = req.body;
  try {
    const pool = await getConnection();
    await pool.request()
      .input('id', sql.Int, id)
      .input('description', sql.NVarChar, description)
      .input('amount', sql.Decimal(10, 2), amount)
      .input('date', sql.Date, date)
      .query('UPDATE Expenses SET description = @description, amount = @amount, date = @date WHERE id = @id');
    res.send('Expense entry updated');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Delete an expense entry
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getConnection();
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Expenses WHERE id = @id');
    res.send('Expense entry deleted');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
