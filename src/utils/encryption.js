import CryptoJS from 'crypto-js';

export const SecurityManager = {
    deriveKey: (masterPassword, salt) => {
        if (!salt) {
            salt = CryptoJS.lib.WordArray.random(128 / 8).toString(CryptoJS.enc.Hex);
        }

        // Use more iterations for better security (recommended: at least 100,000)
        // Using 10,000 for reasonable performance
        const key = CryptoJS.PBKDF2(masterPassword, salt, {
            keySize: 256 / 32,
            iterations: 10000,
            hasher: CryptoJS.algo.SHA256
        });

        return {
            key: key.toString(CryptoJS.enc.Hex),
            salt
        };
    },

    encrypt: (data, masterPassword) => {
        const salt = CryptoJS.lib.WordArray.random(128 / 8).toString(CryptoJS.enc.Hex);
        const { key } = SecurityManager.deriveKey(masterPassword, salt);

        const jsonString = JSON.stringify(data);
        const encrypted = CryptoJS.AES.encrypt(jsonString, key, {
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        }).toString();

        return {
            version: '1.0',
            encrypted,
            salt,
            timestamp: new Date().toISOString(),
        };
    },

    decrypt: (encryptedData, masterPassword) => {
        try {
            // Check for required fields
            if (!encryptedData.encrypted || !encryptedData.salt) {
                throw new Error('Invalid encrypted data format');
            }

            const { key } = SecurityManager.deriveKey(masterPassword, encryptedData.salt);

            const decryptedBytes = CryptoJS.AES.decrypt(
                encryptedData.encrypted,
                key,
                {
                    mode: CryptoJS.mode.CBC,
                    padding: CryptoJS.pad.Pkcs7
                }
            );

            const decrypted = decryptedBytes.toString(CryptoJS.enc.Utf8);

            if (!decrypted) {
                throw new Error('Decryption failed - likely wrong password');
            }

            return JSON.parse(decrypted);
        } catch (error) {
            if (error.message === 'Decryption failed - likely wrong password') {
                throw error;
            }
            throw new Error('Invalid master password or corrupted data');
        }
    },
    
    // Helper function for decrypting backup data (with better error handling)
    decryptData: (encryptedContent, masterPassword) => {
        try {
            const backupData = JSON.parse(encryptedContent);
            return SecurityManager.decrypt(backupData, masterPassword);
        } catch (error) {
            throw new Error('Failed to decrypt backup data: ' + error.message);
        }
    }
};

export const StorageManager = {
    saveCredentials: (credentials) => {
        try {
            localStorage.setItem('vault_data', JSON.stringify(credentials));
        } catch (error) {
            console.error('Failed to save credentials:', error);
            throw new Error('Failed to save credentials to local storage');
        }
    },

    loadCredentials: () => {
        try {
            const data = localStorage.getItem('vault_data');
            if (!data) return [];

            const parsed = JSON.parse(data);

            // Validate the structure
            if (!Array.isArray(parsed)) {
                console.warn('Invalid data format in localStorage, resetting...');
                localStorage.removeItem('vault_data');
                return [];
            }

            return parsed;
        } catch (error) {
            console.error('Failed to load credentials:', error);
            // Clear corrupted data
            localStorage.removeItem('vault_data');
            return [];
        }
    },

    downloadBackup: (credentials, masterPassword) => {
        if (!credentials || credentials.length === 0) {
            throw new Error('No credentials to backup');
        }

        if (!masterPassword) {
            throw new Error('Master password is required for encrypted backup');
        }

        try {
            // Encrypt the credentials with master password
            const backupData = SecurityManager.encrypt(credentials, masterPassword);

            // Add metadata
            const completeBackup = {
                ...backupData,
                metadata: {
                    credentialCount: credentials.length,
                    exportType: 'encrypted_backup',
                    exportDate: new Date().toISOString(),
                    appName: 'Secure Vault'
                }
            };

            const blob = new Blob([JSON.stringify(completeBackup, null, 2)], {
                type: 'application/json',
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `secure-vault-encrypted-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            return true;
        } catch (error) {
            console.error('Backup failed:', error);
            throw new Error('Failed to create backup: ' + error.message);
        }
    },

    exportPlainJSON: (credentials) => {
        if (!credentials || credentials.length === 0) {
            throw new Error('No credentials to export');
        }

        try {
            // Create a safe export WITHOUT passwords
            const safeExport = credentials.map(cred => ({
                id: cred.id,
                serviceName: cred.serviceName,
                username: cred.username,
                category: cred.category,
                details: cred.details,
                createdAt: cred.createdAt,
                updatedAt: cred.updatedAt,
                // Note: Password is intentionally omitted for security
                // URLs or other non-sensitive data can be included
                ...(cred.url && { url: cred.url }),
                ...(cred.notes && { notes: cred.notes }),
            }));

            // Add export metadata
            const exportData = {
                version: '1.0',
                exportType: 'plain_export',
                exportDate: new Date().toISOString(),
                appName: 'Secure Vault',
                credentials: safeExport,
                metadata: {
                    totalCredentials: safeExport.length,
                    warning: '⚠️ PASSWORDS ARE NOT INCLUDED IN THIS EXPORT FOR SECURITY REASONS ⚠️',
                    note: 'Use "Encrypted Backup" for a complete backup including passwords'
                }
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json',
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `secure-vault-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            return true;
        } catch (error) {
            console.error('Export failed:', error);
            throw new Error('Failed to create export: ' + error.message);
        }
    },

    restoreFromBackup: (file, masterPassword, existingCredentials = []) => {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('No file selected'));
                return;
            }

            if (!masterPassword) {
                reject(new Error('Master password is required'));
                return;
            }

            const reader = new FileReader();

            reader.onload = (event) => {
                try {
                    const backupData = JSON.parse(event.target.result);

                    // Check if it's an encrypted backup or plain export
                    if (backupData.encrypted && backupData.salt) {
                        // Encrypted backup - decrypt it
                        const decrypted = SecurityManager.decrypt(backupData, masterPassword);

                        // Validate the decrypted data
                        if (!Array.isArray(decrypted)) {
                            reject(new Error('Invalid backup format: expected array of credentials'));
                            return;
                        }

                        // Merge with existing credentials if provided
                        if (existingCredentials && existingCredentials.length > 0) {
                            const merged = StorageManager.mergeCredentials(existingCredentials, decrypted);
                            resolve(merged);
                        } else {
                            resolve(decrypted);
                        }
                    } else if (backupData.credentials && Array.isArray(backupData.credentials)) {
                        // Plain export - just use the credentials (will have no passwords)
                        const plainCredentials = backupData.credentials.map(cred => ({
                            ...cred,
                            password: '', // Empty password - user needs to fill these
                            // Generate a new ID to avoid conflicts
                            id: cred.id || Date.now().toString() + Math.random().toString(36).substr(2, 9)
                        }));

                        if (confirm(
                            '⚠️ This is a plain export file without passwords.\n\n' +
                            'You will need to manually re-enter passwords for each credential.\n\n' +
                            'Do you want to continue?'
                        )) {
                            // Merge with existing credentials if provided
                            if (existingCredentials && existingCredentials.length > 0) {
                                const merged = StorageManager.mergeCredentials(existingCredentials, plainCredentials);
                                resolve(merged);
                            } else {
                                resolve(plainCredentials);
                            }
                        } else {
                            reject(new Error('Import cancelled by user'));
                        }
                    } else {
                        // Try to parse as direct credentials array
                        if (Array.isArray(backupData)) {
                            // Direct credentials array
                            const credentials = backupData.map(cred => ({
                                ...cred,
                                // Ensure IDs are unique
                                id: cred.id || Date.now().toString() + Math.random().toString(36).substr(2, 9)
                            }));

                            // Merge with existing credentials if provided
                            if (existingCredentials && existingCredentials.length > 0) {
                                const merged = StorageManager.mergeCredentials(existingCredentials, credentials);
                                resolve(merged);
                            } else {
                                resolve(credentials);
                            }
                        } else {
                            reject(new Error('Invalid backup file format'));
                        }
                    }
                } catch (error) {
                    console.error('Restore error:', error);

                    if (error.message.includes('wrong password') || error.message.includes('Invalid master password')) {
                        reject(new Error('Invalid master password. Please check and try again.'));
                    } else {
                        reject(new Error('Failed to restore backup. The file may be corrupted or in wrong format.'));
                    }
                }
            };

            reader.onerror = () => {
                reject(new Error('Failed to read the backup file'));
            };

            reader.readAsText(file);
        });
    },

    // Merge credentials intelligently (appends new ones, avoids duplicates)
    mergeCredentials: (existingCreds, newCreds) => {
        if (!Array.isArray(existingCreds) || !Array.isArray(newCreds)) {
            throw new Error('Both parameters must be arrays');
        }

        // If no existing credentials, just return all new ones
        if (existingCreds.length === 0) {
            return newCreds;
        }

        // Create a map of existing credentials for quick lookup
        const existingMap = new Map();
        existingCreds.forEach(cred => {
            // Use a composite key for better duplicate detection
            const key = `${cred.serviceName?.toLowerCase() || ''}-${cred.username?.toLowerCase() || ''}-${cred.category?.toLowerCase() || 'other'}`;
            existingMap.set(key, cred);
        });

        // Filter new credentials to remove duplicates
        const uniqueNewCreds = newCreds.filter(newCred => {
            const key = `${newCred.serviceName?.toLowerCase() || ''}-${newCred.username?.toLowerCase() || ''}-${newCred.category?.toLowerCase() || 'other'}`;
            return !existingMap.has(key);
        });

        // Ensure unique IDs
        const mergedCreds = [...existingCreds];
        uniqueNewCreds.forEach(cred => {
            // Check for ID conflicts
            const existingIds = new Set(existingCreds.map(c => c.id));
            let newId = cred.id;
            
            // Generate new ID if there's a conflict
            if (existingIds.has(newId)) {
                newId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
            }
            
            mergedCreds.push({
                ...cred,
                id: newId
            });
        });

        return mergedCreds;
    },

    // Optional: Export with passwords (for advanced users)
    exportWithPasswords: (credentials, masterPassword) => {
        if (!credentials || credentials.length === 0) {
            throw new Error('No credentials to export');
        }

        if (!masterPassword) {
            throw new Error('Master password is required');
        }

        try {
            // Encrypt for export
            const encryptedExport = SecurityManager.encrypt(credentials, masterPassword);

            const exportData = {
                ...encryptedExport,
                metadata: {
                    exportType: 'encrypted_export_with_passwords',
                    exportDate: new Date().toISOString(),
                    appName: 'Secure Vault',
                    credentialCount: credentials.length,
                    warning: '⚠️ THIS FILE CONTAINS ENCRYPTED PASSWORDS ⚠️',
                    note: 'Keep this file secure. It can only be restored with the correct master password.'
                }
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json',
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `secure-vault-full-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            return true;
        } catch (error) {
            console.error('Full export failed:', error);
            throw new Error('Failed to create full export: ' + error.message);
        }
    }
};