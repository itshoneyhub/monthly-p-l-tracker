import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../components/Modal.jsx';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/form.css';
import { useAlert } from '../hooks/useAlert.js';
import { getFixedEntries, updateFixedEntry, deleteFixedEntry as deleteFixedEntryApi } from '../utils/fixedData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + '/api';

function Income() {
  const [incomeEntries, setIncomeEntries] = useState([]);
  const [newEntry, setNewEntry] = useState({ date: new Date(), description: '', amount: '', id: null, paid: false });
  const [editingEntry, setEditingEntry] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const { showAlert } = useAlert();

  const fetchIncomeEntries = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/income`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const storedEntries = await response.json();

      const fixedEntries = await getFixedEntries('income');
      const combinedEntries = [
        ...storedEntries.map(entry => ({ ...entry, isFixed: false })),
        ...fixedEntries.map(entry => ({ ...entry, isFixed: true }))
      ].sort((a, b) => new Date(a.date) - new Date(b.date));

      setIncomeEntries(combinedEntries.map((entry, index) => ({
        ...entry,
        date: entry.date ? new Date(entry.date) : null,
        srNo: index + 1,
        paid: entry.paid || false
      })));
    } catch (error) {
      console.error('Error fetching income entries:', error);
      showAlert('Failed to fetch income entries.', 'danger');
    }
  }, [showAlert]);

  useEffect(() => {
    fetchIncomeEntries();
    const handleDataUpdate = () => {
      fetchIncomeEntries();
    };
    window.addEventListener('dataUpdated', handleDataUpdate);
    window.addEventListener('fixedEntryUpdated', handleDataUpdate);
    return () => {
      window.removeEventListener('dataUpdated', handleDataUpdate);
      window.removeEventListener('fixedEntryUpdated', handleDataUpdate);
    };
  }, [fetchIncomeEntries]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEntry({ ...newEntry, [name]: value });
  };

  const handleDateChange = (date) => {
    setNewEntry({ ...newEntry, date });
  };

  const handleMarkAsPaid = async (id, isFixed) => {
    try {
      const entryToMarkPaid = incomeEntries.find(entry => entry.id === id);
      if (!entryToMarkPaid) return;

      const updatedEntry = { ...entryToMarkPaid, paid: true };

      let response;
      if (isFixed) {
        response = await fetch(`${API_BASE_URL}/fixed-entries/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedEntry),
        });
      } else {
        response = await fetch(`${API_BASE_URL}/income/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedEntry),
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      showAlert('Income marked as paid!', 'success');
      fetchIncomeEntries();
      window.dispatchEvent(new Event('dataUpdated'));
    } catch (error) {
      console.error('Error marking income as paid:', error);
      showAlert('Failed to mark income as paid.', 'danger');
    }
  };

  const handleAddOrUpdateEntry = async () => {
    if (newEntry.date && newEntry.description && newEntry.amount) {
      try {
        const entryData = { ...newEntry, date: newEntry.date.toISOString().split('T')[0] };
        if (editingEntry) {
          // Update existing entry
          const response = await fetch(`${API_BASE_URL}/income/${editingEntry.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entryData),
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          showAlert('Record updated successfully', 'success');
        } else {
          // Add new entry
          const response = await fetch(`${API_BASE_URL}/income`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entryData),
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          showAlert('Record added successfully', 'success');
        }
        setNewEntry({ date: new Date(), description: '', amount: '', id: null });
        setEditingEntry(null);
        setIsModalOpen(false);
        fetchIncomeEntries();
        window.dispatchEvent(new Event('dataUpdated'));
      } catch (error) {
        console.error('Error adding/updating income entry:', error);
        showAlert('Failed to save income entry.', 'danger');
      }
    } else {
      showAlert('Please fill in all fields.', 'danger');
    }
  };

  const handleEditEntry = (id) => {
    const entryToEdit = incomeEntries.find(entry => entry.id === id);
    if (entryToEdit) {
      setNewEntry({ ...entryToEdit, date: new Date(entryToEdit.date) });
      setEditingEntry(entryToEdit);
      setIsModalOpen(true);
    }
  };

  const handleDeleteEntry = async (id, isFixed) => {
    try {
      let response;
      if (isFixed) {
        response = await fetch(`${API_BASE_URL}/fixed-entries/${id}`, {
          method: 'DELETE',
        });
      } else {
        response = await fetch(`${API_BASE_URL}/income/${id}`, {
          method: 'DELETE',
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      showAlert('Record deleted successfully', 'danger');
      fetchIncomeEntries();
      window.dispatchEvent(new Event('dataUpdated'));
    } catch (error) {
      console.error('Error deleting income entry:', error);
      showAlert('Failed to delete income entry.', 'danger');
    }
  };

  const filteredIncomeEntries = incomeEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    return (!startDate || entryDate >= startDate) && (!endDate || entryDate <= endDate);
  });

  const totalIncome = filteredIncomeEntries.reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0);

  return (
    <div className="page-container">
      <h1 className="page-title">Income
        <button onClick={() => setIsModalOpen(true)} className="btn btn-add-toggle">
          +
        </button>
      </h1>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingEntry ? 'Edit Income Entry' : 'Add Income Entry'}>
        <div className="form-section">
          <div className="form-header">
            <h2 className="section-title">{editingEntry ? 'Edit' : 'Add'} Income Entry</h2>
            <div className="form-buttons">
              <button onClick={handleAddOrUpdateEntry} className="btn btn-primary">
                {editingEntry ? 'Update' : 'Add'}
              </button>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
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
          </div>
        </div>
      </Modal>

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
                          onClick={() => handleMarkAsPaid(entry.id, true)}
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
                                onClick={() => handleMarkAsPaid(entry.id, false)}
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
                              onClick={() => handleDeleteEntry(entry.id, false)}
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