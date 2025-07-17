const getLocalStorageKey = (type) => `fixed${type.charAt(0).toUpperCase() + type.slice(1)}Entries`;

export const getFixedEntries = (type) => {
  const key = getLocalStorageKey(type);
  const storedEntries = localStorage.getItem(key);
  return storedEntries ? JSON.parse(storedEntries) : [];
};

export const addFixedEntry = (type, entry) => {
  const entries = getFixedEntries(type);
  const updatedEntries = [...entries, { ...entry, srNo: entries.length + 1 }];
  localStorage.setItem(getLocalStorageKey(type), JSON.stringify(updatedEntries));
  window.dispatchEvent(new Event('localStorageUpdated'));
  return updatedEntries;
};

export const updateFixedEntry = (type, id, updatedEntry) => {
  const entries = getFixedEntries(type);
  const newEntries = entries.map(entry => 
    entry.id === id ? { ...updatedEntry, srNo: entry.srNo } : entry
  );
  localStorage.setItem(getLocalStorageKey(type), JSON.stringify(newEntries));
  window.dispatchEvent(new Event('localStorageUpdated'));
  return newEntries;
};

export const deleteFixedEntry = (type, index) => {
  const entries = getFixedEntries(type);
  const updatedEntries = entries.filter((_, i) => i !== index);
  localStorage.setItem(getLocalStorageKey(type), JSON.stringify(updatedEntries));
  window.dispatchEvent(new Event('localStorageUpdated'));
  return updatedEntries;
};
