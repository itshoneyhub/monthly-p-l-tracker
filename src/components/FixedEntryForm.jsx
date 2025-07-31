import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useAlert } from '../hooks/useAlert.js';
import { addFixedEntry, updateFixedEntry } from '../utils/fixedData';
import '../styles/form.css';

const FixedEntryForm = ({ type, currentEntry, onCancel }) => {
  const [entry, setEntry] = useState(currentEntry || { date: null, dueDate: null, description: '', amount: '' });
  const { showAlert } = useAlert();

  useEffect(() => {
    setEntry(currentEntry || { date: null, dueDate: null, description: '', amount: '' });
  }, [currentEntry]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEntry({ ...entry, [name]: value });
  };

  const handleDateChange = (name, date) => {
    setEntry({ ...entry, [name]: date });
  };

  const handleSubmit = async () => {
    if (entry.date && entry.description && entry.amount && (type !== 'Liabilities' || entry.dueDate)) {
      try {
        const entryData = { ...entry, date: entry.date.toISOString().split('T')[0] };
        if (type === 'Liabilities' && entry.dueDate) {
          entryData.dueDate = entry.dueDate.toISOString().split('T')[0];
        }

        if (currentEntry) {
          await updateFixedEntry(currentEntry.id, { ...entryData, type: type.toLowerCase() });
          showAlert('Fixed entry updated successfully!', 'success');
        } else {
          await addFixedEntry(type.toLowerCase(), entryData);
          showAlert('Fixed entry added successfully!', 'success');
        }
        setEntry({ date: null, dueDate: null, description: '', amount: '' });
        onCancel(); // Close form after submission
        window.dispatchEvent(new Event('fixedEntryUpdated'));
      } catch (error) {
        console.error('Error saving fixed entry:', error);
        showAlert('Failed to save fixed entry.', 'danger');
      }
    } else {
      showAlert('Please fill in all fields.', 'danger');
    }
  };

  return (
    <div className="form-section">
      <div className="form-header">
        <h2 className="section-title">{currentEntry ? 'Edit' : 'Add'} Fixed {type}</h2>
        <div className="form-buttons">
          <button onClick={handleSubmit} className="btn btn-primary">
            {currentEntry ? 'Update' : 'Add'}
          </button>
          <button onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </div>
      <div className="form-grid">
        <DatePicker
          selected={entry.date}
          onChange={(date) => handleDateChange('date', date)}
          dateFormat="dd-MM-yyyy"
          placeholderText="Select Date"
          className="form-input"
          
        />
        {type === 'Liabilities' && (
          <DatePicker
            selected={entry.dueDate}
            onChange={(date) => handleDateChange('dueDate', date)}
            dateFormat="dd-MM-yyyy"
            placeholderText="Select Due Date"
            className="form-input"
          />
        )}
        <input
          type="text"
          name="description"
          placeholder="Description"
          value={entry.description}
          onChange={handleInputChange}
          className="form-input"
        />
        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={entry.amount}
          onChange={handleInputChange}
          className="form-input"
        />
      </div>
    </div>
  );
};

export default FixedEntryForm;
