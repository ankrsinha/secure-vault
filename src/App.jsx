import React, { useState, useEffect } from 'react';
import { StorageManager, SecurityManager } from './utils/encryption';
import { LockScreen } from './components/LockScreen';
import { VaultApp } from './components/VaultApp';

function App() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [masterPassword, setMasterPassword] = useState(null);
  const [credentials, setCredentials] = useState([]);
  const [lockError, setLockError] = useState(null);

  useEffect(() => {
    // Load credentials on mount if they exist
    const saved = StorageManager.loadCredentials();
    setCredentials(saved);
  }, []);

  const handleUnlock = (password, loadedCredentials) => {
    setMasterPassword(password);
    setCredentials(loadedCredentials);
    setIsUnlocked(true);
    setLockError(null);

    // Save encrypted vault to localStorage
    const encryptedVault = SecurityManager.encrypt(loadedCredentials, password);
    localStorage.setItem('vault_encrypted', JSON.stringify(encryptedVault));
  };

  const handleLogout = () => {
    setIsUnlocked(false);
    setMasterPassword(null);
    setCredentials([]);
    setLockError(null);
  };

  const handleCredentialsChange = (updated) => {
    setCredentials(updated);
    if (masterPassword) {
      const encryptedVault = SecurityManager.encrypt(updated, masterPassword);
      localStorage.setItem('vault_encrypted', JSON.stringify(encryptedVault));
    }
  };

  if (!isUnlocked) {
    return (
      <LockScreen
        onUnlock={handleUnlock}
        onError={setLockError}
      />
    );
  }

  return (
    <VaultApp
      credentials={credentials}
      masterPassword={masterPassword}
      onLogout={handleLogout}
      onCredentialsChange={handleCredentialsChange}
    />
  );
}

export default App;