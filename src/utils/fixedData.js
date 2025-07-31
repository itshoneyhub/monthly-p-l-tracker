const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + '/api';

export const getFixedEntries = async (type) => {
  try {
    const response = await fetch(`${API_BASE_URL}/fixed-entries?type=${type}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching fixed ${type} entries:`, error);
    return [];
  }
};

export const addFixedEntry = async (type, entry) => {
  try {
    const response = await fetch(`${API_BASE_URL}/fixed-entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...entry, type }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    window.dispatchEvent(new Event('fixedEntryUpdated'));
    return data;
  } catch (error) {
    console.error(`Error adding fixed ${type} entry:`, error);
    throw error;
  }
};

export const updateFixedEntry = async (id, updatedEntry) => {
  try {
    const response = await fetch(`${API_BASE_URL}/fixed-entries/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedEntry),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    window.dispatchEvent(new Event('fixedEntryUpdated'));
    return data;
  } catch (error) {
    console.error(`Error updating fixed entry ${id}:`, error);
    throw error;
  }
};

export const deleteFixedEntry = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/fixed-entries/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    window.dispatchEvent(new Event('fixedEntryUpdated'));
    return true;
  } catch (error) {
    console.error(`Error deleting fixed entry ${id}:`, error);
    throw error;
  }
};
