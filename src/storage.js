const storage = window.localStorage;

function readList(key) {
  try {
    const value = JSON.parse(storage.getItem(key) || '[]');
    return Array.isArray(value) ? value : [];
  } catch (error) {
    console.warn(`PulseUp could not read ${key}; resetting this preference.`, error);
    storage.removeItem(key);
    return [];
  }
}

export const savedTitles = () => readList('pulseup-saved-opportunities');
export const joinedSpaces = () => readList('pulseup-joined-spaces');
export const applications = () => readList('pulseup-applications');
export const profile = () => {
  try {
    const value = JSON.parse(storage.getItem('pulseup-profile') || '{}');
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch (error) {
    console.warn('PulseUp could not read the profile; resetting this preference.', error);
    storage.removeItem('pulseup-profile');
    return {};
  }
};

export function writeList(key, values) {
  storage.setItem(key, JSON.stringify(values));
}

export function writeObject(key, value) {
  storage.setItem(key, JSON.stringify(value));
}
