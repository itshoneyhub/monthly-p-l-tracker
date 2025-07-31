import React, { useState, useEffect, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/form.css';
import { useAlert } from '../hooks/useAlert.js';
import { getFixedEntries, updateFixedEntry, deleteFixedEntry as deleteFixedEntryApi } from '../utils/fixedData';
import Modal from '../components/Modal.jsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + '/api';

function Liabilities() {
  const [liabilityEntries, setLiabilityEntries] = useState([]);
  const [newEntry, setNewEntry] = useState({ date: null, dueDate: null, description: '', amount: '', paid: false });
  const [editingEntry, setEditingEntry] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const { showAlert } = useAlert();

  const fetchLiabilityEntries = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/liabilities`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const storedEntries = await response.json();

      const fixedEntries = await getFixedEntries('liabilities');
      const combinedEntries = [
        ...storedEntries.map(entry => ({ ...entry, isFixed: false })),
        ...fixedEntries.map(entry => ({ ...entry, isFixed: true }))
      ].sort((a, b) => new Date(a.date) - new Date(b.date));

      setLiabilityEntries(combinedEntries.map((entry, index) => ({
        ...entry,
        date: entry.date ? new Date(entry.date) : null,
        dueDate: entry.dueDate ? new Date(entry.dueDate) : null,
        srNo: index + 1,
        paid: entry.paid || false
      })));
    } catch (error) {
      console.error('Error fetching liability entries:', error);
      showAlert('Failed to fetch liability entries.', 'danger');
    }
  }, [showAlert]);

  useEffect(() => {
    fetchLiabilityEntries();
    const handleDataUpdate = () => {
      fetchLiabilityEntries();
    };
    window.addEventListener('dataUpdated', handleDataUpdate);
    window.addEventListener('fixedEntryUpdated', handleDataUpdate);
    return () => {
      window.removeEventListener('dataUpdated', handleDataUpdate);
      window.removeEventListener('fixedEntryUpdated', handleDataUpdate);
    };
  }, [fetchLiabilityEntries]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEntry({ ...newEntry, [name]: value });
  };

  const handleDateChange = (name, date) => {
    setNewEntry({ ...newEntry, [name]: date });
  };

  const handleMarkAsPaid = async (id, isFixed) => {
    try {
      const entryToMarkPaid = liabilityEntries.find(entry => entry.id === id);
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
        response = await fetch(`${API_BASE_URL}/liabilities/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedEntry),
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      showAlert('Liability marked as paid!', 'success');
      fetchLiabilityEntries();
      window.dispatchEvent(new Event('dataUpdated'));
    } catch (error) {
      console.error('Error marking liability as paid:', error);
      showAlert('Failed to mark liability as paid.', 'danger');
    }
  };

  const handleAddOrUpdateEntry = async () => {
    if (newEntry.date && newEntry.dueDate && newEntry.description && newEntry.amount) {
      try {
        const entryData = { ...newEntry, date: newEntry.date.toISOString().split('T')[0], dueDate: newEntry.dueDate.toISOString().split('T')[0] };
        if (editingEntry) {
          // Update existing entry
          const response = await fetch(`${API_BASE_URL}/liabilities/${editingEntry.id}`, {
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
          const response = await fetch(`${API_BASE_URL}/liabilities`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entryData),
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          showAlert('Record added successfully', 'success');
        }
        setNewEntry({ date: null, dueDate: null, description: '', amount: '', paid: false });
        setEditingEntry(null);
        setIsModalOpen(false);
        fetchLiabilityEntries();
        window.dispatchEvent(new Event('dataUpdated'));
      } catch (error) {
        console.error('Error adding/updating liability entry:', error);
        showAlert('Failed to save liability entry.', 'danger');
      }
    } else {
      showAlert('Please fill in all fields.', 'danger');
    }
  };

  const handleEditEntry = (id) => {
    const entryToEdit = liabilityEntries.find(entry => entry.id === id);
    if (entryToEdit) {
      setNewEntry({ ...entryToEdit, date: new Date(entryToEdit.date), dueDate: new Date(entryToEdit.dueDate) });
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
        response = await fetch(`${API_BASE_URL}/liabilities/${id}`, {
          method: 'DELETE',
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      showAlert('Record deleted successfully', 'danger');
      fetchLiabilityEntries();
      window.dispatchEvent(new Event('dataUpdated'));
    } catch (error) {
      console.error('Error deleting liability entry:', error);
      showAlert('Failed to delete liability entry.', 'danger');
    }
  };

  const filteredLiabilityEntries = liabilityEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    return (!startDate || entryDate >= startDate) && (!endDate || entryDate <= endDate);
  });

  const totalLiabilities = filteredLiabilityEntries.reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0);

  const getStatus = (dueDate, isPaid) => {
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
        <button onClick={() => setIsModalOpen(true)} className="btn btn-add-toggle">
          +
        </button>
      </h1>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingEntry ? 'Edit Liability Entry' : 'Add Liability Entry'}>
        <div className="form-section">
          <div className="form-header">
            <h2 className="section-title">{editingEntry ? 'Edit' : 'Add'} Liability Entry</h2>
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
          </div>
        </div>
      </Modal>

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

export default Liabilities;
