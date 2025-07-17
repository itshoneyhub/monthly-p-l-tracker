import React, { useState, useEffect, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/form.css';
import { useAlert } from '../hooks/useAlert.js';
import { getFixedEntries, updateFixedEntry } from '../utils/fixedData';

function Income() {
  const [showForm, setShowForm] = useState(false);
  const [incomeEntries, setIncomeEntries] = useState([]);
  const [newEntry, setNewEntry] = useState({ date: new Date(), description: '', amount: '', id: null, paid: false });
  const [editingId, setEditingId] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const { showAlert } = useAlert();

  const fetchIncomeEntries = useCallback(() => {
    const storedEntries = JSON.parse(localStorage.getItem('incomeEntries')) || [];
    const fixedEntries = getFixedEntries('income').map(entry => ({ ...entry, isFixed: true }));
    
    const combinedEntries = [...storedEntries, ...fixedEntries].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    setIncomeEntries(combinedEntries.map((entry, index) => ({
      ...entry,
      id: entry.id || Date.now() + index,
      date: entry.date ? new Date(entry.date) : null,
      srNo: index + 1, // Re-assign Sr. No. after combining and sorting
      paid: entry.paid || false // Ensure 'paid' property exists and defaults to false
    })));
  }, []);

  useEffect(() => {
    fetchIncomeEntries();
    const handleStorageUpdate = () => {
      setTimeout(() => {
        fetchIncomeEntries();
      }, 100); // Add a small delay to ensure localStorage is updated
    };
    window.addEventListener('localStorageUpdated', handleStorageUpdate);
    return () => {
      window.removeEventListener('localStorageUpdated', handleStorageUpdate);
    };
  }, [fetchIncomeEntries]);

  useEffect(() => {
    const nonFixedEntries = incomeEntries.filter(entry => !entry.isFixed);
    const dataToSave = nonFixedEntries.map(entry => ({
      ...entry,
      date: entry.date ? entry.date.toISOString() : null,
      id: entry.id // Preserve ID when saving
    }));
    console.log('Income: Saving non-fixed entries to localStorage:', dataToSave);
    localStorage.setItem('incomeEntries', JSON.stringify(dataToSave));
  }, [incomeEntries]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEntry({ ...newEntry, [name]: value });
  };

  const handleDateChange = (date) => {
    setNewEntry({ ...newEntry, date });
  };

  const handleMarkAsPaid = (id) => {
    const entryToMarkPaid = incomeEntries.find(entry => entry.id === id);
    if (entryToMarkPaid) {
      const updatedEntry = { ...entryToMarkPaid, paid: true };
      if (updatedEntry.isFixed) {
        updateFixedEntry('income', id, updatedEntry);
      } else {
        const updatedEntries = incomeEntries.map(entry =>
          entry.id === id ? updatedEntry : entry
        );
        localStorage.setItem('incomeEntries', JSON.stringify(updatedEntries.filter(entry => !entry.isFixed).map(entry => ({
          ...entry,
          date: entry.date ? entry.date.toISOString() : null,
          id: entry.id, // Preserve ID when saving
          paid: entry.paid // Preserve paid status when saving
        }))));
        setIncomeEntries(updatedEntries);
      }
      showAlert('Income marked as paid!', 'success');
      window.dispatchEvent(new Event('localStorageUpdated'));
    }
  };

  const handleAddOrUpdateEntry = () => {
    if (newEntry.date && newEntry.description && newEntry.amount) {
      if (editingId !== null) {
        const updatedEntries = incomeEntries.map(entry =>
          entry.id === editingId ? { ...newEntry, srNo: entry.srNo } : entry
        );
        setIncomeEntries(updatedEntries);
        setEditingId(null);
        showAlert('Record updated successfully');
      } else {
        setIncomeEntries([...incomeEntries, { ...newEntry, id: Date.now(), srNo: incomeEntries.length + 1 }]); // Assign unique ID for new entries
        showAlert('Record added successfully');
      }
      setNewEntry({ date: new Date(), description: '', amount: '', id: null });
    } else {
      showAlert('Please fill in all fields.', 'danger');
    }
  };

  const handleEditEntry = (id) => {
    const entryToEdit = incomeEntries.find(entry => entry.id === id);
    setNewEntry(entryToEdit);
    setEditingId(id);
  };

  const handleDeleteEntry = (id) => {
    const updatedEntries = incomeEntries.filter(entry => entry.id !== id);
    setIncomeEntries(updatedEntries);
    showAlert('Record deleted successfully', 'danger');
  };

  const filteredIncomeEntries = incomeEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    return (!startDate || entryDate >= startDate) && (!endDate || entryDate <= endDate);
  });

  const totalIncome = filteredIncomeEntries.reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0);

  return (
    <div className="page-container">
      <h1 className="page-title">Income
        <button onClick={() => setShowForm(!showForm)} className="btn btn-add-toggle">
          {showForm ? '-' : '+'}
        </button>
      </h1>

      {showForm && (
        <div className="form-section">
          <h2 className="section-title">Add/Edit Income Entry</h2>
          <div className="form-grid">
            <DatePicker
              selected={newEntry.date}
              onChange={handleDateChange}
              dateFormat="dd-MM-yyyy"
              placeholderText="Select Date"
              className="form-input"
              maxDate={new Date()}
            />
            <input
              type="text"
              name="description"
              placeholder="Description"
              value={newEntry.description}
              onChange={handleInputChange}
              className="form-input"
            />
            <input
              type="number"
              name="amount"
              placeholder="Amount"
              value={newEntry.amount}
              onChange={handleInputChange}
              className="form-input"
            />
            <button
              onClick={handleAddOrUpdateEntry}
              className="btn btn-primary"
            >
              {editingId !== null ? 'Update Entry' : 'Add Entry'}
            </button>
          </div>
        </div>
      )}

      <div className="table-section">
        <h2 className="section-title">Income Entries</h2>
        <div className="table-header-controls">
          <p className="total-amount">Total Income: <span className="total-amount-value green">₹{totalIncome.toFixed(2)}</span></p>
          <div className="date-filter-group">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              placeholderText="Start Date"
              dateFormat="dd-MM-yyyy"
              className="form-input date-filter-input"
            />
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              placeholderText="End Date"
              dateFormat="dd-MM-yyyy"
              className="form-input date-filter-input"
            />
          </div>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th className="table-header">Sr. No</th>
                <th className="table-header">Date</th>
                <th className="table-header">Description</th>
                <th className="table-header">Amount</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncomeEntries.map((entry, index) => (
                <tr key={entry.id} className={index % 2 === 0 ? 'table-row-even' : 'table-row-odd'}> <td className="table-data">{entry.srNo}</td>
                  <td className="table-data">
                    {editingId === entry.id ? (
                      <DatePicker
                        selected={newEntry.date}
                        onChange={handleDateChange}
                        dateFormat="dd-MM-yyyy"
                        className="form-input"
                        maxDate={new Date()}
                      />
                    ) : (
                      entry.date ? entry.date.toLocaleDateString() : ''
                    )}
                  </td>
                  <td className="table-data">
                    {editingId === entry.id ? (
                      <input
                        type="text"
                        name="description"
                        value={newEntry.description}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    ) : (
                      <>{entry.description} {entry.isFixed && <span className="fixed-tag">(Fixed)</span>}</>
                    )}
                  </td>
                  <td className="table-data">
                    {editingId === entry.id ? (
                      <input
                        type="number"
                        name="amount"
                        value={newEntry.amount}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    ) : (
                      `₹${parseFloat(entry.amount).toFixed(2)}`
                    )}
                  </td>
                  <td className="table-data">
                    {console.log(`Income Entry ID: ${entry.id}, isFixed: ${entry.isFixed}, paid: ${entry.paid}`)}
                    {entry.isFixed ? (
                      !entry.paid && (
                        <button
                          onClick={() => handleMarkAsPaid(entry.id)}
                          className="btn btn-save"
                        >
                          Paid
                        </button>
                      )
                    ) : (
                      <>
                        {editingId === entry.id ? (
                          <>
                            <button
                              onClick={handleAddOrUpdateEntry}
                              className="btn btn-primary"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="btn btn-delete"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            {!entry.paid && (
                              <button
                                onClick={() => handleMarkAsPaid(entry.id)}
                                className="btn btn-save"
                              >
                                Paid
                              </button>
                            )}
                            <button
                              onClick={() => handleEditEntry(entry.id)}
                              className="btn btn-edit"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="btn btn-delete"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Income;