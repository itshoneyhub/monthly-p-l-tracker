const getLocalStorageKey = (type) => `${type}Entries`;

const filterAndSave = (type, fixedEntryDescription, fixedEntryAmount) => {
  const key = getLocalStorageKey(type);
  const storedEntries = JSON.parse(localStorage.getItem(key)) || [];
  const updatedEntries = storedEntries.filter(entry => 
    !(entry.description === fixedEntryDescription && entry.amount === fixedEntryAmount)
  );
  localStorage.setItem(key, JSON.stringify(updatedEntries));
  window.dispatchEvent(new Event('localStorageUpdated'));
  console.log(`Cascading delete: Removed matching ${type} entries.`);
};

// This is the actual function that will be called from Settings.jsx
export const triggerCascadingDelete = (deletedFixedEntry) => {
  console.log('triggerCascadingDelete called for:', deletedFixedEntry);
  const { description, amount } = deletedFixedEntry;

  filterAndSave('income', description, amount);
  filterAndSave('expenses', description, amount);
  filterAndSave('liabilities', description, amount);
};