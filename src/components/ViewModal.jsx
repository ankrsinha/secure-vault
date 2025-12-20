import React, { useState } from 'react';
import { categoryIcons } from '../utils/types';

export const ViewModal = ({
  isOpen,
  credential,
  onClose,
  onEdit,
  onDelete,
  onCopyAll,
  onShowPassword,
  onCopyBankCredential, 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showBankCredentialValues, setShowBankCredentialValues] = useState({});
  const [showBankDetails, setShowBankDetails] = useState({
    cardNumber: false,
    cvv: false,
    accountNumber: false
  });

  if (!isOpen || !credential) return null;

  const handleShowAndCopy = () => {
    if (!credential.password) return;
    
    setShowPassword(true);
    navigator.clipboard.writeText(credential.password);
    onShowPassword(credential.password);
    setTimeout(() => setShowPassword(false), 3000);
  };

  const handleCopyUsername = () => {
    if (credential.username) {
      navigator.clipboard.writeText(credential.username);
      onShowPassword(`Username copied to clipboard!`);
    }
  };

  const handleShowAndCopyBankCredential = (index, value, label) => {
    // Show the credential temporarily
    setShowBankCredentialValues(prev => ({
      ...prev,
      [index]: true
    }));
    
    // Copy to clipboard
    navigator.clipboard.writeText(value);
    
    // Show status message
    if (onCopyBankCredential) {
      onCopyBankCredential(value, label);
    }
    
    // Hide after 3 seconds
    setTimeout(() => {
      setShowBankCredentialValues(prev => ({
        ...prev,
        [index]: false
      }));
    }, 3000);
  };

  const toggleBankDetailVisibility = (field) => {
    setShowBankDetails(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleCopyBankDetail = (field, value, label) => {
    if (!value) return;
    
    navigator.clipboard.writeText(value);
    if (onCopyBankCredential) {
      onCopyBankCredential(value, `${label} copied`);
    }
  };

  const formatCardNumber = (cardNumber) => {
    if (!cardNumber) return '';
    // Remove any non-digit characters and format
    const digits = cardNumber.replace(/\D/g, '');
    if (digits.length <= 4) return digits;
    if (digits.length <= 8) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    if (digits.length <= 12) return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8)}`;
    return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 12)}-${digits.slice(12, 16)}`;
  };

  const getDisplayValue = (key, value) => {
    if (!value) return '';
    
    const isVisible = showBankDetails[key];
    
    if (key === 'cardNumber') {
      const formatted = formatCardNumber(value);
      return isVisible ? formatted : '••••-••••-••••-••••';
    }
    
    if (key === 'cvv') {
      return isVisible ? value : '•••';
    }
    
    if (key === 'accountNumber') {
      const strValue = value.toString();
      if (isVisible) {
        if (strValue.length <= 4) return strValue;
        return `${'•'.repeat(strValue.length - 4)}${strValue.slice(-4)}`;
      }
      return '•'.repeat(Math.min(strValue.length, 12));
    }
    
    return value;
  };

  const getFieldIcon = (key) => {
    const icons = {
      'accountNumber': '🔢',
      'ifscCode': '🏦',
      'branch': '🏢',
      'accountType': '📊',
      'customerId': '👤',
      'cardNumber': '💳',
      'cardExpiry': '📅',
      'cvv': '🔒',
    };
    return icons[key] || '📝';
  };

  const getFieldLabel = (key) => {
    const labels = {
      'accountNumber': 'Account Number',
      'ifscCode': 'IFSC Code',
      'branch': 'Branch',
      'accountType': 'Account Type',
      'customerId': 'Customer ID',
      'cardNumber': 'Card Number',
      'cardExpiry': 'Card Expiry',
      'cvv': 'CVV',
    };
    return labels[key] || key.replace(/([A-Z])/g, ' $1');
  };

  const isBankCategory = credential.category === 'Bank';

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-800/50 rounded-xl">
              <span className="text-2xl">
                {categoryIcons[credential.category] || '📝'}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {credential.serviceName}
              </h2>
              <p className="text-gray-400 text-sm">
                {credential.category} • Created {new Date(credential.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800/50 rounded-xl transition-colors"
          >
            <span className="text-xl">✕</span>
          </button>
        </div>

        <div className="space-y-4 mb-6 max-h-[50vh] overflow-y-auto p-2">
          {/* Username/Email - Optional for Bank */}
          {credential.username && (
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
              <label className="block text-xs font-medium text-gray-400 mb-2">
                Username / Email
              </label>
              <div className="flex items-center justify-between">
                <p className="font-mono text-sm break-all text-white">
                  {credential.username}
                </p>
                <button
                  onClick={handleCopyUsername}
                  className="ml-2 p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  <span className="text-gray-400 hover:text-white">📋</span>
                </button>
              </div>
            </div>
          )}

          {/* Password - Optional for Bank */}
          {credential.password && (
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
              <label className="block text-xs font-medium text-gray-400 mb-2">
                Password
              </label>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm tracking-widest">
                    {showPassword ? credential.password : '••••••••••••'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {credential.password.length} characters
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShowAndCopy}
                    className="px-3 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors text-sm"
                  >
                    {showPassword ? '🙈 Hide' : '👁️ Show & Copy'}
                  </button>
                </div>
              </div>
              {showPassword && (
                <div className="mt-2 text-xs text-yellow-400">
                  ⚠️ Password will be hidden in 3 seconds
                </div>
              )}
            </div>
          )}

          {/* Banking Credentials (ONLY for Bank) */}
          {isBankCategory && credential.bankCredentials && credential.bankCredentials.length > 0 && (
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
              <label className="block text-xs font-medium text-gray-400 mb-2 flex items-center gap-2">
                <span>🏦</span> Banking Credentials
              </label>
              <div className="space-y-3">
                {credential.bankCredentials.map((cred, index) => {
                  const isVisible = showBankCredentialValues[index];
                  
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{cred.label}:</span>
                        <span className="font-mono text-sm">
                          {isVisible ? cred.value : '•'.repeat(Math.min(cred.value.length, 8))}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleShowAndCopyBankCredential(index, cred.value, cred.label)}
                          className="text-xs px-3 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors whitespace-nowrap"
                        >
                          {isVisible ? '🙈 Hide' : '👁️ Show & Copy'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {Object.values(showBankCredentialValues).some(val => val === true) && (
                <div className="mt-3 text-xs text-yellow-400">
                  ⚠️ Revealed credentials will be hidden in 3 seconds
                </div>
              )}
            </div>
          )}

          {/* Bank Details (ONLY for Bank) */}
          {isBankCategory && credential.bankDetails && (
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
              <label className="block text-xs font-medium text-gray-400 mb-2 flex items-center gap-2">
                <span>🏦</span> Bank Account Details
              </label>
              <div className="space-y-3">
                {Object.entries(credential.bankDetails).map(([key, value]) => 
                  value && (
                    <div key={key} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-300">
                          {getFieldIcon(key)} {getFieldLabel(key)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white font-mono">
                          {getDisplayValue(key, value)}
                        </span>
                        {['cardNumber', 'cvv', 'accountNumber'].includes(key) ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => toggleBankDetailVisibility(key)}
                              className="text-xs px-2 py-1 bg-gray-700/50 hover:bg-gray-700 rounded transition-colors"
                            >
                              {showBankDetails[key] ? '🙈' : '👁️'}
                            </button>
                            <button
                              onClick={() => handleCopyBankDetail(key, value, getFieldLabel(key))}
                              className="text-xs px-2 py-1 bg-primary/20 hover:bg-primary/30 text-primary rounded transition-colors"
                            >
                              📋
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleCopyBankDetail(key, value, getFieldLabel(key))}
                            className="text-xs px-2 py-1 bg-primary/20 hover:bg-primary/30 text-primary rounded transition-colors ml-1"
                          >
                            📋
                          </button>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
              {(showBankDetails.cardNumber || showBankDetails.cvv || showBankDetails.accountNumber) && (
                <div className="mt-3 text-xs text-yellow-400">
                  ⚠️ Sensitive details are visible. They will be hidden when you close this modal.
                </div>
              )}
            </div>
          )}

          {/* Notes (for ALL categories) */}
          {credential.details && (
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
              <label className="block text-xs font-medium text-gray-400 mb-2">
                📝 Notes
              </label>
              <p className="text-gray-200 text-sm whitespace-pre-wrap break-words">
                {credential.details}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={onEdit}
            className="btn-secondary"
          >
            <span className="text-lg">✏️</span>
            <span>Edit</span>
          </button>
          <button
            onClick={onCopyAll}
            className="btn-secondary"
          >
            <span className="text-lg">📋</span>
            <span>Copy All</span>
          </button>
          <button
            onClick={onDelete}
            className="btn-danger"
          >
            <span className="text-lg">🗑️</span>
            <span>Delete</span>
          </button>
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            <span className="text-lg">←</span>
            <span>Close</span>
          </button>
        </div>
      </div>
    </div>
  );
};