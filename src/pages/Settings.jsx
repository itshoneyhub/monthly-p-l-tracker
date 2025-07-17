import React, { useState, useEffect } from 'react';
import { useAlert } from '../hooks/useAlert.js';
import { getFixedEntries, addFixedEntry, updateFixedEntry, deleteFixedEntry } from '../utils/fixedData';
import { triggerCascadingDelete } from '../utils/cascadingDelete';
import FixedEntryForm from '../components/FixedEntryForm.jsx';
import FixedEntriesList from '../components/FixedEntriesList.jsx';
import '../styles/Settings.css';
import '../styles/form.css'; // Reusing form styles

function Settings() {
  const [activeTab, setActiveTab] = useState('income'); // 'income', 'expenses', 'liabilities'
  const [fixedIncomeEntries, setFixedIncomeEntries] = useState([]);
  const [fixedExpenseEntries, setFixedExpenseEntries] = useState([]);
  const [fixedLiabilityEntries, setFixedLiabilityEntries] = useState([]);
  const [editingIncomeEntry, setEditingIncomeEntry] = useState(null);
  const [editingExpenseEntry, setEditingExpenseEntry] = useState(null);
  const [editingLiabilityEntry, setEditingLiabilityEntry] = useState(null);
  const { showAlert } = useAlert();

  useEffect(() => {
    setFixedIncomeEntries(getFixedEntries('income'));
    setFixedExpenseEntries(getFixedEntries('expenses'));
    setFixedLiabilityEntries(getFixedEntries('liabilities'));
  }, []);

  const handleSaveFixedEntry = (type, entry) => {
    let updatedEntries;
    if (entry.originalIndex !== undefined) {
      updatedEntries = updateFixedEntry(type, entry.originalIndex, entry);
      showAlert('Fixed record updated successfully');
    } else {
      updatedEntries = addFixedEntry(type, entry);
      showAlert('Fixed record added successfully');
    }
    updateState(type, updatedEntries);
    setEditingIncomeEntry(null);
    setEditingExpenseEntry(null);
    setEditingLiabilityEntry(null);
  };

  const handleDeleteFixedEntry = (type, index) => {
    let entryToDelete;
    if (type === 'income') entryToDelete = fixedIncomeEntries[index];
    else if (type === 'expenses') entryToDelete = fixedExpenseEntries[index];
    else if (type === 'liabilities') entryToDelete = fixedLiabilityEntries[index];

    if (entryToDelete) {
      triggerCascadingDelete(entryToDelete);
    }

    const updatedEntries = deleteFixedEntry(type, index);
    updateState(type, updatedEntries);
    showAlert('Fixed record deleted successfully', 'danger');
  };

  const handleEditFixedEntry = (type, entry, index) => {
    const entryWithIndex = { ...entry, originalIndex: index };
    if (type === 'income') setEditingIncomeEntry(entryWithIndex);
    else if (type === 'expenses') setEditingExpenseEntry(entryWithIndex);
    else if (type === 'liabilities') setEditingLiabilityEntry(entryWithIndex);
  };

  const handleCancelEdit = (type) => {
    if (type === 'income') setEditingIncomeEntry(null);
    else if (type === 'expenses') setEditingExpenseEntry(null);
    else if (type === 'liabilities') setEditingLiabilityEntry(null);
  };

  const updateState = (type, entries) => {
    if (type === 'income') setFixedIncomeEntries(entries);
    else if (type === 'expenses') setFixedExpenseEntries(entries);
    else if (type === 'liabilities') setFixedLiabilityEntries(entries);
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Settings</h1>

      <div className="settings-tabs">
        <button
          className={`settings-tab-btn ${activeTab === 'income' ? 'active' : ''}`}
          onClick={() => setActiveTab('income')}
        >
          Fixed Income
        </button>
        <button
          className={`settings-tab-btn ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          Fixed Expenses
        </button>
        <button
          className={`settings-tab-btn ${activeTab === 'liabilities' ? 'active' : ''}`}
          onClick={() => setActiveTab('liabilities')}
        >
          Fixed Liabilities
        </button>
      </div>

      <div className="settings-content">
        {activeTab === 'income' && (
          <>
            <FixedEntryForm
              type="Income"
              currentEntry={editingIncomeEntry}
              onSave={(entry) => handleSaveFixedEntry('income', entry)}
              onCancel={() => handleCancelEdit('income')}
            />
            <FixedEntriesList
              type="Income"
              entries={fixedIncomeEntries}
              onEdit={(entry, index) => handleEditFixedEntry('income', entry, index)}
              onDelete={(index) => handleDeleteFixedEntry('income', index)}
            />
          </>
        )}

        {activeTab === 'expenses' && (
          <>
            <FixedEntryForm
              type="Expenses"
              currentEntry={editingExpenseEntry}
              onSave={(entry) => handleSaveFixedEntry('expenses', entry)}
              onCancel={() => handleCancelEdit('expenses')}
            />
            <FixedEntriesList
              type="Expenses"
              entries={fixedExpenseEntries}
              onEdit={(entry, index) => handleEditFixedEntry('expenses', entry, index)}
              onDelete={(index) => handleDeleteFixedEntry('expenses', index)}
            />
          </>
        )}

        {activeTab === 'liabilities' && (
          <>
            <FixedEntryForm
              type="Liabilities"
              currentEntry={editingLiabilityEntry}
              onSave={(entry) => handleSaveFixedEntry('liabilities', entry)}
              onCancel={() => handleCancelEdit('liabilities')}
            />
            <FixedEntriesList
              type="Liabilities"
              entries={fixedLiabilityEntries}
              onEdit={(entry, index) => handleEditFixedEntry('liabilities', entry, index)}
              onDelete={(index) => handleDeleteFixedEntry('liabilities', index)}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default Settings;
