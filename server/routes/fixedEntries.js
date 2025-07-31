const express = require('express');
const router = express.Router();
const { getConnection, sql } = require('../db');

// Get all fixed entries
router.get('/', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT * FROM FixedEntries');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Add a new fixed entry
router.post('/', async (req, res) => {
  const { type, description, amount, date } = req.body;
  try {
    const pool = await getConnection();
    await pool.request()
      .input('type', sql.NVarChar, type)
      .input('description', sql.NVarChar, description)
      .input('amount', sql.Decimal(10, 2), amount)
      .input('date', sql.Date, date)
      .query('INSERT INTO FixedEntries (type, description, amount, date) VALUES (@type, @description, @amount, @date)');
    res.status(201).send('Fixed entry added');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Update a fixed entry
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { type, description, amount, date } = req.body;
  try {
    const pool = await getConnection();
    await pool.request()
      .input('id', sql.Int, id)
      .input('type', sql.NVarChar, type)
      .input('description', sql.NVarChar, description)
      .input('amount', sql.Decimal(10, 2), amount)
      .input('date', sql.Date, date)
      .query('UPDATE FixedEntries SET type = @type, description = @description, amount = @amount, date = @date WHERE id = @id');
    res.send('Fixed entry updated');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Delete a fixed entry
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getConnection();
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM FixedEntries WHERE id = @id');
    res.send('Fixed entry deleted');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
