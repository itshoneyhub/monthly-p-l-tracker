import React, { useState, useEffect, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/form.css';
import { useAlert } from '../hooks/useAlert.js';
import { getFixedEntries, updateFixedEntry } from '../utils/fixedData';

function Liabilities() {
  const [showForm, setShowForm] = useState(false);
  const [liabilityEntries, setLiabilityEntries] = useState([]);
  const [newEntry, setNewEntry] = useState({ date: null, dueDate: null, description: '', amount: '', paid: false });
  const [editingId, setEditingId] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const { showAlert } = useAlert();

  const fetchLiabilityEntries = useCallback(() => {
    const storedEntries = JSON.parse(localStorage.getItem('liabilityEntries')) || [];
    const fixedEntries = getFixedEntries('liabilities').map(entry => ({ ...entry, isFixed: true }));

    const combinedEntries = [...storedEntries, ...fixedEntries].sort((a, b) => new Date(a.date) - new Date(b.date));

    setLiabilityEntries(combinedEntries.map((entry, index) => ({
      ...entry,
      id: entry.id || Date.now() + index,
      date: entry.date ? new Date(entry.date) : null,
      dueDate: entry.dueDate ? new Date(entry.dueDate) : null,
      srNo: index + 1,
      paid: entry.paid || false // Ensure 'paid' property exists and defaults to false
    })));
  }, []);

  useEffect(() => {
    fetchLiabilityEntries();
    const handleStorageUpdate = () => {
      setTimeout(() => {
        fetchLiabilityEntries();
      }, 100); // Add a small delay to ensure localStorage is updated
    };
    window.addEventListener('localStorageUpdated', handleStorageUpdate);
    return () => {
      window.removeEventListener('localStorageUpdated', handleStorageUpdate);
    };
  }, [fetchLiabilityEntries]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEntry({ ...newEntry, [name]: value });
  };

  const handleDateChange = (name, date) => {
    setNewEntry({ ...newEntry, [name]: date });
  };

  const handleMarkAsPaid = (id) => {
    const entryToMarkPaid = liabilityEntries.find(entry => entry.id === id);
    if (entryToMarkPaid) {
      const updatedEntry = { ...entryToMarkPaid, paid: true };
      if (updatedEntry.isFixed) {
        updateFixedEntry('liabilities', id, updatedEntry);
      } else {
        const updatedEntries = liabilityEntries.map(entry =>
          entry.id === id ? updatedEntry : entry
        );
        localStorage.setItem('liabilityEntries', JSON.stringify(updatedEntries.filter(entry => !entry.isFixed).map(entry => ({
          ...entry,
          date: entry.date ? entry.date.toISOString() : null,
          dueDate: entry.dueDate ? entry.dueDate.toISOString() : null
        }))));
        setLiabilityEntries(updatedEntries);
      }
      showAlert('Liability marked as paid!', 'success');
      window.dispatchEvent(new Event('localStorageUpdated'));
    }
  };

  const handleAddOrUpdateEntry = () => {
    console.log('handleAddOrUpdateEntry called. New entry:', newEntry);
    if (newEntry.date && newEntry.dueDate && newEntry.description && newEntry.amount) {
      if (editingId !== null) {
        const updatedEntries = liabilityEntries.map(entry =>
          entry.id === editingId ? { ...newEntry, srNo: entry.srNo } : entry
        );
        setLiabilityEntries(updatedEntries);
        setEditingId(null);
        showAlert('Record updated successfully');
      } else {
        setLiabilityEntries([...liabilityEntries, { ...newEntry, id: Date.now(), srNo: liabilityEntries.length + 1, paid: false }]);
        showAlert('Record added successfully');
      }
      setNewEntry({ date: null, dueDate: null, description: '', amount: '', paid: false });
    } else {
      showAlert('Please fill in all fields.', 'danger');
    }
  };

  const handleEditEntry = (id) => {
    console.log('handleEditEntry called for ID:', id);
    const entryToEdit = liabilityEntries.find(entry => entry.id === id);
    setNewEntry(entryToEdit);
    setEditingId(id);
  };

  const handleDeleteEntry = (id) => {
    console.log('handleDeleteEntry called for ID:', id);
    const updatedEntries = liabilityEntries.filter(entry => entry.id !== id);
    setLiabilityEntries(updatedEntries);
    showAlert('Record deleted successfully', 'danger');
  };

  const filteredLiabilityEntries = liabilityEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    return (!startDate || entryDate >= startDate) && (!endDate || entryDate <= endDate);
  });

  const totalLiabilities = filteredLiabilityEntries.reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0);

  const getStatus = (dueDate, isPaid) => {
    console.log('getStatus called. DueDate:', dueDate, 'isPaid:', isPaid);
    if (isPaid) return 'Paid';
    const today = new Date();
    const due = new Date(dueDate);
    if (due < today) {
      return 'Overdue';
    } else if (due.getMonth() === today.getMonth() && due.getFullYear() === today.getFullYear()) {
      return 'Upcoming';
    } else {
      return '';
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Liabilities
        <button onClick={() => setShowForm(!showForm)} className="btn btn-add-toggle">
          {showForm ? '-' : '+'}
        </button>
      </h1>

      {showForm && (
        <div className="form-section">
          <h2 className="section-title">Add/Edit Liability Entry</h2>
          <div className="form-grid">
            <DatePicker
              selected={newEntry.date}
              onChange={(date) => handleDateChange('date', date)}
              dateFormat="dd-MM-yyyy"
              placeholderText="Select Date"
              className="form-input"
            />
            <DatePicker
              selected={newEntry.dueDate}
              onChange={(date) => handleDateChange('dueDate', date)}
              dateFormat="dd-MM-yyyy"
              placeholderText="Select Due Date"
              className="form-input"
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
        <h2 className="section-title">Liability Entries</h2>
        <div className="table-header-controls">
          <p className="total-amount">Total Liabilities: <span className="total-amount-value gray">₹{totalLiabilities.toFixed(2)}</span></p>
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
                <th className="table-header">Due Date</th>
                <th className="table-header">Description</th>
                <th className="table-header">Amount</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLiabilityEntries.map((entry, index) => (
                <tr key={entry.id} className={index % 2 === 0 ? 'table-row-even' : 'table-row-odd'}>
                  <td className="table-data">{entry.srNo}</td>
                  <td className="table-data">
                    {editingId === entry.id ? (
                      <DatePicker
                        selected={newEntry.date}
                        onChange={(date) => handleDateChange('date', date)}
                        dateFormat="dd-MM-yyyy"
                        className="form-input"
                      />
                    ) : (
                      entry.date ? entry.date.toLocaleDateString() : ''
                    )}
                  </td>
                  <td className="table-data">
                    {editingId === entry.id ? (
                      <DatePicker
                        selected={newEntry.dueDate}
                        onChange={(date) => handleDateChange('dueDate', date)}
                        dateFormat="dd-MM-yyyy"
                        className="form-input"
                      />
                    ) : (
                      entry.dueDate ? entry.dueDate.toLocaleDateString() : ''
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
                      entry.amount
                    )}
                  </td>
                  <td className="table-data">
                    <span className={
                      getStatus(entry.dueDate, entry.paid) === 'Overdue' ? 'status-overdue' :
                      getStatus(entry.dueDate, entry.paid) === 'Upcoming' ? 'status-upcoming' :
                      'status-paid'
                    }>
                      {getStatus(entry.dueDate, entry.paid)}
                    </span>
                  </td>
                  <td className="table-data">
                    {console.log(`Liabilities Entry ID: ${entry.id}, isFixed: ${entry.isFixed}, paid: ${entry.paid}`)}
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

export default Liabilities;
