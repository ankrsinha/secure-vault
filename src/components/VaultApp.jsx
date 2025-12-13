import React, { useState, useEffect } from 'react';
import { categoryIcons } from '../utils/types';
import { StorageManager, SecurityManager } from '../utils/encryption';
import { CredentialModal } from './CredentialModal';
import { ViewModal } from './ViewModal';
import { StatusMessage } from './StatusMessage';
import { DeleteConfirmationModal } from './DeleteConfirmationModal'; // Import the new modal

export const VaultApp = ({
    credentials,
    masterPassword,
    onLogout,
    onCredentialsChange,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredCredentials, setFilteredCredentials] = useState(credentials);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedCredential, setSelectedCredential] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [status, setStatus] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [credentialToDelete, setCredentialToDelete] = useState(null);

    useEffect(() => {
        const filtered = credentials.filter(
            (c) =>
                c.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredCredentials(filtered);
    }, [searchQuery, credentials]);

    const handleAddCredential = () => {
        setEditingId(null);
        setSelectedCredential(null);
        setIsModalOpen(true);
    };

    const handleSaveCredential = (credentialData) => {
        let updatedCredentials;

        if (editingId) {
            updatedCredentials = credentials.map((c) =>
                c.id === editingId
                    ? {
                        ...c,
                        ...credentialData,
                        updatedAt: new Date().toISOString(),
                    }
                    : c
            );
            setStatus({ text: 'Credential updated successfully', type: 'success' });
        } else {
            const newCredential = {
                id: Date.now().toString(),
                ...credentialData,
                createdAt: new Date().toISOString(),
            };
            updatedCredentials = [...credentials, newCredential];
            setStatus({ text: 'Credential added successfully', type: 'success' });
        }

        onCredentialsChange(updatedCredentials);
        StorageManager.saveCredentials(updatedCredentials);
        setIsModalOpen(false);
    };

    const handleEditCredential = (credential) => {
        setEditingId(credential.id);
        setSelectedCredential(credential);
        setIsViewModalOpen(false);
        setIsModalOpen(true);
    };

    // Functions for delete confirmation
    const handleDeleteFromGrid = (credential) => {
        setCredentialToDelete(credential);
        setShowDeleteModal(true);
    };

    const handleDeleteFromViewModal = () => {
        if (!selectedCredential) return;
        setCredentialToDelete(selectedCredential);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = () => {
        if (!credentialToDelete) return;

        const updated = credentials.filter((c) => c.id !== credentialToDelete.id);
        onCredentialsChange(updated);
        StorageManager.saveCredentials(updated);
        
        // Close view modal if we're deleting the viewed credential
        if (selectedCredential && selectedCredential.id === credentialToDelete.id) {
            setIsViewModalOpen(false);
            setSelectedCredential(null);
        }
        
        setStatus({ text: 'Credential deleted', type: 'success' });
        setShowDeleteModal(false);
        setCredentialToDelete(null);
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setCredentialToDelete(null);
    };

    const handleViewCredential = (credential) => {
        setSelectedCredential(credential);
        setIsViewModalOpen(true);
    };

    const handleCopyPassword = (password) => {
        navigator.clipboard.writeText(password);
        setStatus({ text: 'Password copied to clipboard!', type: 'success' });
    };

    const handleCopyBankCredential = (value, label) => {
        navigator.clipboard.writeText(value);
        setStatus({ text: `${label} copied to clipboard!`, type: 'success' });
    };

    const handleCopyAll = () => {
        if (!selectedCredential) return;
        
        let text = `${selectedCredential.serviceName}\n`;
        if (selectedCredential.username) {
            text += `Username: ${selectedCredential.username}\n`;
        }
        if (selectedCredential.password) {
            text += `Password: ${selectedCredential.password}\n`;
        }
        text += `Category: ${selectedCredential.category}\n`;
        
        // Add banking credentials if it's a bank credential
        if (selectedCredential.category === 'Bank' && selectedCredential.bankCredentials) {
            text += '\nBanking Credentials:\n';
            selectedCredential.bankCredentials.forEach(cred => {
                text += `  ${cred.label}: ${cred.value}\n`;
            });
        }
        
        // Add bank details if it's a bank credential
        if (selectedCredential.category === 'Bank' && selectedCredential.bankDetails) {
            text += '\nBank Details:\n';
            Object.entries(selectedCredential.bankDetails).forEach(([key, value]) => {
                if (value) {
                    text += `  ${key}: ${value}\n`;
                }
            });
        }
        
        // Add notes
        if (selectedCredential.details) {
            text += `\nNotes:\n${selectedCredential.details}\n`;
        }
        
        navigator.clipboard.writeText(text);
        setStatus({ text: 'Credential copied to clipboard!', type: 'success' });
    };

    const handleBackup = () => {
        if (credentials.length === 0) {
            setStatus({ text: 'No credentials to backup', type: 'warning' });
            return;
        }

        try {
            StorageManager.downloadBackup(credentials, masterPassword);
            setStatus({ text: 'Encrypted backup downloaded successfully!', type: 'success' });
        } catch (error) {
            setStatus({ text: `Backup failed: ${error.message}`, type: 'error' });
        }
    };

    const handleExport = () => {
        if (credentials.length === 0) {
            setStatus({ text: 'No credentials to export', type: 'warning' });
            return;
        }

        try {
            StorageManager.exportPlainJSON(credentials);
            setStatus({
                text: 'Export completed! Data exported without passwords for security.',
                type: 'success'
            });
        } catch (error) {
            setStatus({ text: `Export failed: ${error.message}`, type: 'error' });
        }
    };

    const handleRestore = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            try {
                const restored = await StorageManager.restoreFromBackup(file, masterPassword, credentials);
                
                const newCredentialCount = restored.length - credentials.length;
                
                if (newCredentialCount > 0) {
                    onCredentialsChange(restored);
                    StorageManager.saveCredentials(restored);

                    const newCreds = restored.slice(credentials.length);
                    const hasMissingPasswords = newCreds.some(cred => !cred.password || cred.password === '');
                    
                    if (hasMissingPasswords) {
                        setStatus({
                            text: `${newCredentialCount} new credential(s) added! Note: Some passwords were not included in the export and need to be re-entered.`,
                            type: 'warning'
                        });
                    } else {
                        setStatus({ 
                            text: `${newCredentialCount} new credential(s) added to your vault!`, 
                            type: 'success' 
                        });
                    }
                } else {
                    setStatus({ 
                        text: 'No new credentials added. All credentials from the backup already exist in your vault.', 
                        type: 'warning' 
                    });
                }
            } catch (error) {
                setStatus({ text: error.message, type: 'error' });
            }
        };
        input.click();
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100">
            {/* Header */}
            <div className="sticky top-0 z-40 border-b border-gray-800 bg-gray-900/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-gradient-to-br from-primary to-cyan-600 rounded-2xl">
                                <span className="text-xl">🔐</span>
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                                    Secure Vault
                                </h1>
                                <p className="text-gray-400 text-sm">
                                    {credentials.length} credential{credentials.length !== 1 ? 's' : ''} stored
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onLogout}
                            className="btn-secondary px-5 py-2.5 rounded-xl hover:shadow-lg transition-all duration-200"
                        >
                            <span className="mr-2">↩️</span>
                            Lock Vault
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto p-4 sm:p-6">
                <StatusMessage
                    message={status?.text || null}
                    type={status?.type || 'success'}
                    onClose={() => setStatus(null)}
                />

                <div className="mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-400 text-sm">Total Credentials</p>
                                    <p className="text-3xl font-bold text-white mt-2">{credentials.length}</p>
                                </div>
                                <div className="p-3 bg-primary/20 rounded-xl">
                                    <span className="text-2xl">📊</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-400 text-sm">Categories</p>
                                    <p className="text-3xl font-bold text-white mt-2">
                                        {new Set(credentials.map(c => c.category)).size}
                                    </p>
                                </div>
                                <div className="p-3 bg-cyan-500/20 rounded-xl">
                                    <span className="text-2xl">🏷️</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons with tooltips */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                        <button
                            onClick={handleAddCredential}
                            className="btn-primary relative group"
                            title="Add a new credential"
                        >
                            <span className="text-lg">+</span>
                            <span>Add Credential</span>
                            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                Add new login/password
                            </div>
                        </button>

                        <button
                            onClick={handleBackup}
                            className="btn-secondary relative group"
                            title="Download encrypted backup"
                        >
                            <span className="text-lg">🔐</span>
                            <span>Encrypted Backup</span>
                            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                Secure backup (encrypted)
                            </div>
                        </button>

                        <button
                            onClick={handleRestore}
                            className="btn-secondary relative group"
                            title="Restore from encrypted backup"
                        >
                            <span className="text-lg">📤</span>
                            <span>Restore Backup</span>
                            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                Restore encrypted backup
                            </div>
                        </button>

                        <button
                            onClick={handleExport}
                            className="btn-secondary relative group"
                            title="Export as plain JSON"
                        >
                            <span className="text-lg">📄</span>
                            <span>Export (JSON)</span>
                            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                Export data without passwords
                            </div>
                        </button>
                    </div>

                    {/* Search */}
                    <div className="mb-8">
                        <div className="search-input">
                            <div className="search-icon">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search credentials by service, username, or category..."
                                className="w-full"
                            />
                        </div>
                    </div>

                    {/* Credentials Grid */}
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {filteredCredentials.length === 0 ? (
                            <div className="col-span-full">
                                <div className="text-center py-12">
                                    <div className="inline-block p-6 bg-gray-800/30 rounded-2xl">
                                        <div className="text-4xl mb-4">🔒</div>
                                        <h3 className="text-xl font-bold text-white mb-2">
                                            {credentials.length === 0
                                                ? 'Your vault is empty'
                                                : 'No matching credentials'}
                                        </h3>
                                        <p className="text-gray-400">
                                            {credentials.length === 0
                                                ? 'Add your first credential to get started'
                                                : 'Try a different search term'}
                                        </p>
                                        {credentials.length === 0 && (
                                            <button
                                                onClick={handleAddCredential}
                                                className="btn-primary mt-4 px-5 py-2 hover:shadow-lg transition-all duration-200"
                                            >
                                                + Add Your First Credential
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            filteredCredentials.map((cred) => (
                                <div
                                    key={cred.id}
                                    onClick={() => handleViewCredential(cred)}
                                    className="card group relative overflow-hidden"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="p-2 bg-gray-800/50 rounded-xl">
                                            <span className="text-xl">
                                                {categoryIcons[cred.category] || '📝'}
                                            </span>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteFromGrid(cred);
                                            }}
                                            className="btn-danger btn-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                                        >
                                            🗑️
                                        </button>
                                    </div>

                                    <h3 className="font-bold text-lg mb-1 text-white">
                                        {cred.serviceName}
                                    </h3>
                                    <p className="text-gray-400 text-sm truncate mb-3">{cred.username}</p>

                                    <div className="flex items-center justify-between">
                                        <span className="credential-badge">
                                            {categoryIcons[cred.category]} {cred.category}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(cred.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer Info */}
                    <div className="mt-12 pt-8 border-t border-gray-800/50">
                        <div className="text-center text-gray-500 text-sm">
                            <p>🔒 All credentials are encrypted locally using AES-256</p>
                            <p className="mt-1">Your master password is never stored or transmitted</p>
                            <p className="mt-2 text-xs text-gray-600">
                                <strong>Note:</strong> Encrypted Backup requires your master password to restore.
                                Export (JSON) exports data without passwords for safe viewing.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Modals */}
                <CredentialModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingId(null);
                        setSelectedCredential(null);
                    }}
                    onSave={handleSaveCredential}
                    editingCredential={editingId ? credentials.find((c) => c.id === editingId) || null : null}
                    isEditing={editingId !== null}
                />

                <ViewModal
                    isOpen={isViewModalOpen}
                    credential={selectedCredential}
                    onClose={() => {
                        setIsViewModalOpen(false);
                        setSelectedCredential(null);
                    }}
                    onEdit={() => handleEditCredential(selectedCredential)}
                    onDelete={handleDeleteFromViewModal}
                    onCopyAll={handleCopyAll}
                    onShowPassword={handleCopyPassword}
                    onCopyBankCredential={handleCopyBankCredential}
                />

                {/* Delete Confirmation Modal */}
                <DeleteConfirmationModal
                    isOpen={showDeleteModal}
                    credential={credentialToDelete}
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                />
            </div>
        </div>
    );
};