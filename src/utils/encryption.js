// src/utils/encryption.js

import CryptoJS from 'crypto-js';

export const SecurityManager = {
  deriveKey: (masterPassword, salt = null) => {
    if (!salt) {
      salt = CryptoJS.lib.WordArray.random(16).toString();
    }
    const key = CryptoJS.PBKDF2(masterPassword, salt, {
      keySize: 256 / 32,
      iterations: 1000,
    });
    return { key: key.toString(), salt };
  },

  encrypt: (data, masterPassword) => {
    const { key, salt } = SecurityManager.deriveKey(masterPassword);
    const jsonString = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(jsonString, key).toString();
    return {
      encrypted,
      salt,
      timestamp: new Date().toISOString(),
    };
  },

  decrypt: (encryptedData, masterPassword) => {
    try {
      const { key } = SecurityManager.deriveKey(masterPassword, encryptedData.salt);
      const decrypted = CryptoJS.AES.decrypt(
        encryptedData.encrypted,
        key
      ).toString(CryptoJS.enc.Utf8);
      return JSON.parse(decrypted);
    } catch (error) {
      throw new Error('Invalid master password or corrupted data');
    }
  },
};

export const StorageManager = {
  saveCredentials: (credentials) => {
    localStorage.setItem('vault_data', JSON.stringify(credentials));
  },

  loadCredentials: () => {
    const data = localStorage.getItem('vault_data');
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  downloadBackup: (credentials, masterPassword) => {
    const backupData = SecurityManager.encrypt(credentials, masterPassword);
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vault-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  exportPlainJSON: (credentials) => {
    const blob = new Blob([JSON.stringify(credentials, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vault-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  restoreFromBackup: (file, masterPassword) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const backupData = JSON.parse(event.target.result);
          const decrypted = SecurityManager.decrypt(backupData, masterPassword);
          resolve(decrypted);
        } catch (error) {
          reject(new Error('Failed to restore backup. Check password or file.'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  },
};