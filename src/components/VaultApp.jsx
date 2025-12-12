// Enhanced VaultApp.jsx
import React, { useState, useEffect } from 'react';
import { categoryIcons } from '../utils/types';
import { StorageManager, SecurityManager } from '../utils/encryption';
import { CredentialModal } from './CredentialModal';
import { ViewModal } from './ViewModal';
import { StatusMessage } from './StatusMessage';

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

  const handleDeleteCredential = () => {
    if (!selectedCredential) return;

    if (confirm('Are you sure you want to delete this credential? This action cannot be undone.')) {
      const updated = credentials.filter((c) => c.id !== selectedCredential.id);
      onCredentialsChange(updated);
      StorageManager.saveCredentials(updated);
      setIsViewModalOpen(false);
      setStatus({ text: 'Credential deleted', type: 'success' });
    }
  };

  const handleViewCredential = (credential) => {
    setSelectedCredential(credential);
    setIsViewModalOpen(true);
  };

  const handleCopyPassword = (password) => {
    navigator.clipboard.writeText(password);
    setStatus({ text: 'Password copied to clipboard!', type: 'success' });
  };

  const handleCopyAll = () => {
    if (!selectedCredential) return;
    const text = `${selectedCredential.serviceName}\nUsername: ${selectedCredential.username}\nPassword: ${selectedCredential.password}\n${
      selectedCredential.details ? 'Details: ' + selectedCredential.details : ''
    }`;
    navigator.clipboard.writeText(text);
    setStatus({ text: 'Credential copied to clipboard!', type: 'success' });
  };

  const handleBackup = () => {
    if (credentials.length === 0) {
      setStatus({ text: 'No credentials to backup', type: 'warning' });
      return;
    }
    StorageManager.downloadBackup(credentials, masterPassword);
    setStatus({ text: 'Backup downloaded successfully!', type: 'success' });
  };

  const handleRestore = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const restored = await StorageManager.restoreFromBackup(file, masterPassword);
        onCredentialsChange(restored);
        StorageManager.saveCredentials(restored);
        setStatus({ text: 'Credentials restored successfully!', type: 'success' });
      } catch {
        setStatus({ text: 'Failed to restore backup. Check password or file.', type: 'error' });
      }
    };
    input.click();
  };

  const handleExport = () => {
    if (credentials.length === 0) {
      setStatus({ text: 'No credentials to export', type: 'warning' });
      return;
    }
    StorageManager.exportPlainJSON(credentials);
    setStatus({ text: 'Export completed!', type: 'success' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-gray-800 bg-gray-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-primary to-cyan-600 rounded-2xl">
                <span className="text-2xl">🔐</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Secure Vault
                </h1>
                <p className="text-gray-400 text-sm">
                  {credentials.length} credential{credentials.length !== 1 ? 's' : ''} stored
                </p>
              </div>
            </div>
            <button 
              onClick={onLogout} 
              className="btn-secondary px-6 py-2.5 rounded-xl hover:shadow-lg transition-all duration-200"
            >
              <span className="mr-2">↩️</span>
              Lock Vault
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <StatusMessage
          message={status?.text || null}
          type={status?.type || 'success'}
          onClose={() => setStatus(null)}
        />

        {/* Stats & Actions */}
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

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <button 
              onClick={handleAddCredential} 
              className="btn-primary group"
            >
              <span className="text-xl">+</span>
              <span>Add Credential</span>
            </button>
            <button 
              onClick={handleBackup} 
              className="btn-secondary group"
            >
              <span className="text-xl">📥</span>
              <span>Download Backup</span>
            </button>
            <button 
              onClick={handleRestore} 
              className="btn-secondary group"
            >
              <span className="text-xl">📤</span>
              <span>Restore Backup</span>
            </button>
            <button 
              onClick={handleExport} 
              className="btn-secondary group"
            >
              <span className="text-xl">📄</span>
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
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
              className="custom-scrollbar"
            />
          </div>
        </div>

        {/* Credentials Grid */}
        {filteredCredentials.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="p-8 bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-3xl">
                <div className="text-6xl mb-4">🔒</div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {credentials.length === 0 
                    ? 'Your vault is empty' 
                    : 'No matching credentials'}
                </h3>
                <p className="text-gray-400 mb-6">
                  {credentials.length === 0
                    ? 'Add your first credential to get started'
                    : 'Try a different search term'}
                </p>
                {credentials.length === 0 && (
                  <button 
                    onClick={handleAddCredential}
                    className="btn-primary mx-auto"
                  >
                    + Add Your First Credential
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredCredentials.map((cred) => (
              <div
                key={cred.id}
                onClick={() => handleViewCredential(cred)}
                className="grid-item card group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gray-800/50 rounded-xl">
                    <span className="text-2xl">
                      {categoryIcons[cred.category] || '📝'}
                    </span>
                  </div>
                  <div className="relative group/tooltip">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this credential? This cannot be undone.')) {
                          const updated = credentials.filter((c) => c.id !== cred.id);
                          onCredentialsChange(updated);
                          StorageManager.saveCredentials(updated);
                          setStatus({ text: 'Credential deleted', type: 'success' });
                        }
                      }}
                      className="btn-danger btn-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                    >
                      🗑️
                    </button>
                    <div className="tooltip">Delete</div>
                  </div>
                </div>
                
                <h3 className="font-bold text-xl mb-2 text-white group-hover:text-primary transition-colors">
                  {cred.serviceName}
                </h3>
                <p className="text-gray-400 text-sm truncate mb-4">{cred.username}</p>
                
                <div className="flex items-center justify-between mt-6">
                  <span className="credential-badge">
                    {categoryIcons[cred.category]} {cred.category}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(cred.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-gray-500 text-sm">Click to view →</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-12 pt-8 border-t border-gray-800/50">
          <div className="text-center text-gray-500 text-sm">
            <p>🔒 All credentials are encrypted locally using AES-256</p>
            <p className="mt-1">Your master password is never stored or transmitted</p>
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
        onDelete={handleDeleteCredential}
        onCopyAll={handleCopyAll}
        onShowPassword={handleCopyPassword}
      />
    </div>
  );
};