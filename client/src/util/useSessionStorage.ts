import { useState } from 'react';
import {
  decryptString as decrypt,
  encryptString as encrypt,
  generateKeyFromString,
} from 'dha-encryption';

export function useSessionStorage<T>(key: string, initialValue: T | null, ttl?: number) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      let item;
      const pin =
        process.env.REACT_APP_DB_PIN !== undefined ? process.env.REACT_APP_DB_PIN : '1234';
      const eKey = generateKeyFromString(pin);
      // Get from local storage by key
      if (ttl !== undefined) item = getWithExpiry(key);
      else item = window.sessionStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(decrypt(item, eKey)) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.error(error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      const pin =
        process.env.REACT_APP_DB_PIN !== undefined ? process.env.REACT_APP_DB_PIN : '1234';
      const eKey = generateKeyFromString(pin);
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage with an expiration of 1 hour
      if (ttl !== undefined) setWithExpiry(key, encrypt(JSON.stringify(valueToStore), eKey), ttl);
      else window.sessionStorage.setItem(key, encrypt(JSON.stringify(valueToStore), eKey));
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

function setWithExpiry(key: string, value: string, ttl: number) {
  const now = new Date();

  // `item` is an object which contains the original value
  // as well as the time when it's supposed to expire
  const item = {
    value: value,
    expiry: now.getTime() + ttl,
  };
  window.sessionStorage.setItem(key, JSON.stringify(item));
}

function getWithExpiry(key: string) {
  const itemStr = window.sessionStorage.getItem(key);
  // if the item doesn't exist, return null
  if (!itemStr) {
    return null;
  }
  const item = JSON.parse(itemStr);
  const now = new Date();
  // compare the expiry time of the item with the current time
  if (now.getTime() > item.expiry) {
    // If the item is expired, delete the item from storage
    // and return null
    window.sessionStorage.removeItem(key);
    return null;
  }
  return item.value;
}
