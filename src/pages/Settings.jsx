import React, { useState, useEffect } from 'react';
import { useAlert } from '../hooks/useAlert.js';
import { getFixedEntries, addFixedEntry, updateFixedEntry, deleteFixedEntry } from '../utils/fixedData';

import FixedEntryForm from '../components/FixedEntryForm.jsx';
import FixedEntriesList from '../components/FixedEntriesList.jsx';
import Modal from '../components/Modal.jsx';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showAlert } = useAlert();

  useEffect(() => {
    const fetchAllFixedEntries = async () => {
      setFixedIncomeEntries(await getFixedEntries('income'));
      setFixedExpenseEntries(await getFixedEntries('expenses'));
      setFixedLiabilityEntries(await getFixedEntries('liabilities'));
    };
    fetchAllFixedEntries();

    const handleFixedEntryUpdate = () => {
      fetchAllFixedEntries();
    };
    window.addEventListener('fixedEntryUpdated', handleFixedEntryUpdate);
    return () => {
      window.removeEventListener('fixedEntryUpdated', handleFixedEntryUpdate);
    };
  }, []);

  const handleSaveFixedEntry = async (type, entry) => {
    try {
      if (entry.id) {
        await updateFixedEntry(entry.id, { ...entry, type });
        showAlert('Fixed record updated successfully', 'success');
      } else {
        await addFixedEntry(type, entry);
        showAlert('Fixed record added successfully', 'success');
      }
      setEditingIncomeEntry(null);
      setEditingExpenseEntry(null);
      setEditingLiabilityEntry(null);
      setIsModalOpen(false); // Close modal after saving
    } catch (error) {
      console.error('Error saving fixed entry:', error);
      showAlert('Failed to save fixed entry.', 'danger');
    }
  };

  const handleDeleteFixedEntry = async (type, id) => {
    try {
      await deleteFixedEntry(id);
      showAlert('Fixed record deleted successfully', 'danger');
    } catch (error) {
      console.error('Error deleting fixed entry:', error);
      showAlert('Failed to delete fixed entry.', 'danger');
    }
  };

  const handleEditFixedEntry = (type, entry) => {
    if (type === 'income') setEditingIncomeEntry(entry);
    else if (type === 'expenses') setEditingExpenseEntry(entry);
    else if (type === 'liabilities') setEditingLiabilityEntry(entry);
    setIsModalOpen(true); // Open modal for editing
  };

  const handleAddFixedEntryClick = (type) => {
    // Clear any existing editing state and open modal for adding
    setEditingIncomeEntry(null);
    setEditingExpenseEntry(null);
    setEditingLiabilityEntry(null);
    setActiveTab(type); // Ensure the correct tab is active when adding
    setIsModalOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingIncomeEntry(null);
    setEditingExpenseEntry(null);
    setEditingLiabilityEntry(null);
    setIsModalOpen(false); // Close modal on cancel
  };

  const getModalTitle = () => {
    if (activeTab === 'income') return editingIncomeEntry ? 'Edit Fixed Income' : 'Add Fixed Income';
    if (activeTab === 'expenses') return editingExpenseEntry ? 'Edit Fixed Expense' : 'Add Fixed Expense';
    if (activeTab === 'liabilities') return editingLiabilityEntry ? 'Edit Fixed Liability' : 'Add Fixed Liability';
    return '';
  };

  const getCurrentEntry = () => {
    if (activeTab === 'income') return editingIncomeEntry;
    if (activeTab === 'expenses') return editingExpenseEntry;
    if (activeTab === 'liabilities') return editingLiabilityEntry;
    return null;
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

      <>
        <div className="settings-content">
          <button
            className="btn btn-primary add-new-entry-btn"
            onClick={() => handleAddFixedEntryClick(activeTab)}
          >
            Add New Fixed {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </button>

          {activeTab === 'income' && (
            <FixedEntriesList
              type="Income"
              entries={fixedIncomeEntries}
              onEdit={(entry) => handleEditFixedEntry('income', entry)}
              onDelete={(id) => handleDeleteFixedEntry('income', id)}
            />
          )}

          {activeTab === 'expenses' && (
            <FixedEntriesList
              type="Expenses"
              entries={fixedExpenseEntries}
              onEdit={(entry) => handleEditFixedEntry('expenses', entry)}
              onDelete={(id) => handleDeleteFixedEntry('expenses', id)}
            />
          )}

          {activeTab === 'liabilities' && (
            <FixedEntriesList
              type="Liabilities"
              entries={fixedLiabilityEntries}
              onEdit={(entry) => handleEditFixedEntry('liabilities', entry)}
              onDelete={(id) => handleDeleteFixedEntry('liabilities', id)}
            />
          )}
        </div>

        <Modal isOpen={isModalOpen} onClose={handleCancelEdit} title={getModalTitle()}>
          <FixedEntryForm
            type={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            currentEntry={getCurrentEntry()}
            onSave={handleSaveFixedEntry}
            onCancel={handleCancelEdit}
          />
        </Modal>
      </>
    </div>
  );
}

export default Settings;
