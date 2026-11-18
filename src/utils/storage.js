/**
 * LocalStorage utility with safe JSON parsing and fallback support
 */

export const getStoredItem = (key, fallbackValue = null) => {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) {
      return fallbackValue;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading key "${key}" from localStorage:`, err);
    return fallbackValue;
  }
};

export const setStoredItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`Error writing key "${key}" to localStorage:`, err);
    return false;
  }
};

export const removeStoredItem = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (err) {
    console.error(`Error removing key "${key}" from localStorage:`, err);
    return false;
  }
};

