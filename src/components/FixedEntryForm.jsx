import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useAlert } from '../hooks/useAlert.js';
import '../styles/form.css';

const FixedEntryForm = ({ type, currentEntry, onSave, onCancel }) => {
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

  const handleSubmit = () => {
    if (entry.date && entry.description && entry.amount && (type !== 'Liabilities' || entry.dueDate)) {
      onSave(entry);
      setEntry({ date: null, dueDate: null, description: '', amount: '' });
    } else {
      showAlert('Please fill in all fields.', 'danger');
    }
  };

  return (
    <div className="form-section">
      <h2 className="section-title">{currentEntry ? 'Edit' : 'Add'} Fixed {type}</h2>
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
        <button onClick={handleSubmit} className="btn btn-primary">
          {currentEntry ? 'Update Entry' : 'Add Entry'}
        </button>
        {currentEntry && (
          <button onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default FixedEntryForm;
