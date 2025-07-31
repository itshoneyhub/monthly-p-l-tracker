const express = require('express');
const router = express.Router();
const { getConnection, sql } = require('../db');

// Get all liability entries
router.get('/', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT * FROM Liabilities');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Add a new liability entry
router.post('/', async (req, res) => {
  const { description, amount, date } = req.body;
  try {
    const pool = await getConnection();
    await pool.request()
      .input('description', sql.NVarChar, description)
      .input('amount', sql.Decimal(10, 2), amount)
      .input('date', sql.Date, date)
      .query('INSERT INTO Liabilities (description, amount, date) VALUES (@description, @amount, @date)');
    res.status(201).send('Liability entry added');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Update a liability entry
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
      .query('UPDATE Liabilities SET description = @description, amount = @amount, date = @date WHERE id = @id');
    res.send('Liability entry updated');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Delete a liability entry
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getConnection();
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Liabilities WHERE id = @id');
    res.send('Liability entry deleted');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
