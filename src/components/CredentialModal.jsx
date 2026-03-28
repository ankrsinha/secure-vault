import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { categoryIcons, credentialCategories, bankCredentialTypes, bankSpecificFields } from '../utils/types';
import { lockBodyScroll } from '../utils/bodyScrollLock';

export const CredentialModal = ({
  isOpen,
  onClose,
  onSave,
  editingCredential,
  isEditing,
}) => {
  const [serviceName, setServiceName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [details, setDetails] = useState('');
  const [category, setCategory] = useState('Other');
  
  // Banking-specific state
  const [bankCredentials, setBankCredentials] = useState([]); // Array of {type, value}
  const [showNewCredential, setShowNewCredential] = useState(false);
  const [newBankCredential, setNewBankCredential] = useState({ 
    type: 'atm_pin', 
    customLabel: '', // Only used for 'custom' type
    value: '' 
  });
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    ifscCode: '',
    branch: '',
    accountType: 'Savings',
    customerId: '',
    cardNumber: '',
    cardExpiry: '',
    cvv: ''
  });

  useEffect(() => {
    if (isEditing && editingCredential) {
      setServiceName(editingCredential.serviceName);
      setUsername(editingCredential.username || '');
      setPassword(editingCredential.password || '');
      setDetails(editingCredential.details || '');
      setCategory(editingCredential.category);
      
      // Load banking data if it's a bank credential
      if (editingCredential.category === 'Bank') {
        setBankCredentials(editingCredential.bankCredentials || []);
        setBankDetails(editingCredential.bankDetails || {});
      }
    } else {
      resetForm();
    }
  }, [isEditing, editingCredential, isOpen]);

  const resetForm = () => {
    setServiceName('');
    setUsername('');
    setPassword('');
    setShowPassword(false);
    setDetails('');
    setCategory('Other');
    setBankCredentials([]);
    setShowNewCredential(false);
    setNewBankCredential({ 
      type: 'atm_pin', 
      customLabel: '',
      value: '' 
    });
    setBankDetails({
      accountNumber: '',
      ifscCode: '',
      branch: '',
      accountType: 'Savings',
      customerId: '',
      cardNumber: '',
      cardExpiry: '',
      cvv: ''
    });
  };

  const handleSave = () => {
    if (!serviceName.trim()) {
      alert('Please enter a service name');
      return;
    }

    // For non-bank categories, require username and password
    if (category !== 'Bank') {
      if (!username.trim()) {
        alert('Please enter a username or email');
        return;
      }
      if (!password) {
        alert('Please enter a password');
        return;
      }
    }

    // For bank category, require at least one banking credential
    if (category === 'Bank' && bankCredentials.length === 0) {
      alert('Please add at least one banking credential (PIN, password, etc.)');
      return;
    }

    const credentialData = {
      serviceName: serviceName.trim(),
      username: username.trim(),
      password: password,
      details: details.trim(),
      category,
    };

    // Add banking-specific data if it's a bank credential
    if (category === 'Bank') {
      credentialData.bankCredentials = bankCredentials.filter(cred => cred.value.trim() !== '');
      credentialData.bankDetails = bankDetails;
    }

    onSave(credentialData);
    resetForm();
    onClose();
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(password);
  };

  const generatePIN = (length = 4) => {
    let pin = '';
    for (let i = 0; i < length; i++) {
      pin += Math.floor(Math.random() * 10);
    }
    return pin;
  };

  const addBankCredential = () => {
    if (!newBankCredential.value.trim()) {
      alert('Please enter a value for the credential');
      return;
    }

    // For custom type, require a custom label
    if (newBankCredential.type === 'custom' && !newBankCredential.customLabel.trim()) {
      alert('Please enter a label for the custom credential');
      return;
    }

    // Get label from type or custom label
    let label;
    if (newBankCredential.type === 'custom') {
      label = newBankCredential.customLabel.trim();
    } else {
      const credentialType = bankCredentialTypes.find(t => t.value === newBankCredential.type);
      label = credentialType ? credentialType.label : newBankCredential.type;
    }

    setBankCredentials(prev => [...prev, {
      type: newBankCredential.type,
      label: label,
      value: newBankCredential.value
    }]);

    // Reset new credential form
    setNewBankCredential({ 
      type: 'atm_pin', 
      customLabel: '',
      value: '' 
    });
    setShowNewCredential(false);
  };

  const removeBankCredential = (index) => {
    setBankCredentials(prev => prev.filter((_, i) => i !== index));
  };

  const generateCredential = () => {
    const credentialType = bankCredentialTypes.find(t => t.value === newBankCredential.type);
    const length = credentialType?.maxLength || 4;
    const generatedValue = generatePIN(length);
    setNewBankCredential(prev => ({ ...prev, value: generatedValue }));
  };

  const getCurrentCredentialLabel = () => {
    if (newBankCredential.type === 'custom') {
      return newBankCredential.customLabel.trim() || 'Custom Credential';
    }
    const credentialType = bankCredentialTypes.find(t => t.value === newBankCredential.type);
    return credentialType ? credentialType.label : newBankCredential.type;
  };

  useEffect(() => {
    if (!isOpen) return undefined;
    return lockBodyScroll();
  }, [isOpen]);

  if (!isOpen) return null;

  const isBankCategory = category === 'Bank';

  return createPortal(
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="modal-overlay-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="credential-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
      <div className="modal-content max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 id="credential-modal-title" className="text-2xl font-bold text-white">
              {isEditing ? 'Edit Credential' : 'Add New Credential'}
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {isEditing 
                ? 'Update your credential information' 
                : 'Securely store a new credential'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800/50 rounded-xl transition-colors"
          >
            <span className="text-xl">✕</span>
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Service Name *
              </label>
              <input
                type="text"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className="form-input"
                placeholder="e.g., HDFC Bank, Google, Facebook"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-select"
              >
                {credentialCategories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Username/Email - Optional for Bank */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Username / Email {category !== 'Bank' && '*'}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              placeholder={
                category === 'Bank' 
                  ? "Optional: Enter username, email, or customer ID" 
                  : "username@example.com"
              }
            />
          </div>

          {/* Password - Optional for Bank */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-white">
                Password {category !== 'Bank' && '*'}
              </label>
              <button
                type="button"
                onClick={generatePassword}
                className="text-xs px-2 py-1 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors"
              >
                🔐 Generate
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input pr-10"
                placeholder={
                  category === 'Bank' 
                    ? "Optional: Enter password" 
                    : "Enter password"
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {password && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Strength:</span>
                  <span className={password.length >= 8 ? 'text-green-500' : 'text-yellow-500'}>
                    {password.length >= 12 ? 'Strong' : password.length >= 8 ? 'Good' : 'Weak'}
                  </span>
                </div>
                <div className="mt-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${password.length >= 12 ? 'bg-green-500' :
                        password.length >= 8 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                    style={{ width: `${Math.min(password.length * 5, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Banking Credentials (ONLY for Bank category) */}
          {isBankCategory && (
            <div className="bg-gray-800/20 border border-gray-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-white flex items-center gap-2">
                  <span>🏦</span> Banking Credentials *
                </h3>
                <button
                  type="button"
                  onClick={() => setShowNewCredential(!showNewCredential)}
                  className="text-xs px-3 py-1 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors"
                >
                  {showNewCredential ? '−' : '+'} Add Credential
                </button>
              </div>

              {/* List of added credentials */}
              {bankCredentials.length > 0 && (
                <div className="space-y-2 mb-4">
                  {bankCredentials.map((cred, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-800/30 p-3 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-sm text-white">{cred.label}</div>
                        <div className="font-mono text-xs text-gray-400 mt-1">
                          {'•'.repeat(Math.min(cred.value.length, 8))}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeBankCredential(index)}
                        className="text-xs px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-colors ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new credential form */}
              {showNewCredential && (
                <div className="border border-gray-700/50 rounded-lg p-4 bg-gray-800/30">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-2">
                        Credential Type *
                      </label>
                      <select
                        value={newBankCredential.type}
                        onChange={(e) => setNewBankCredential(prev => ({ 
                          ...prev, 
                          type: e.target.value,
                          customLabel: e.target.value === 'custom' ? prev.customLabel : ''
                        }))}
                        className="form-select text-sm"
                      >
                        {bankCredentialTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.icon} {type.label}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        {newBankCredential.type === 'custom' 
                          ? "Select 'Custom' for credentials not listed above" 
                          : "The label will be automatically set based on the type"}
                      </p>
                    </div>

                    {/* Custom label input (only shown for custom type) */}
                    {newBankCredential.type === 'custom' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-2">
                          Custom Label *
                        </label>
                        <input
                          type="text"
                          value={newBankCredential.customLabel}
                          onChange={(e) => setNewBankCredential(prev => ({ ...prev, customLabel: e.target.value }))}
                          className="form-input text-sm"
                          placeholder="e.g., UPI PIN, Branch Code, Secret Question Answer"
                        />
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-medium text-gray-400">
                          {getCurrentCredentialLabel()} Value *
                        </label>
                        <button
                          type="button"
                          onClick={generateCredential}
                          className="text-xs px-2 py-1 bg-primary/20 hover:bg-primary/30 text-primary rounded transition-colors"
                        >
                          Generate
                        </button>
                      </div>
                      <input
                        type="text"
                        value={newBankCredential.value}
                        onChange={(e) => setNewBankCredential(prev => ({ ...prev, value: e.target.value }))}
                        className="form-input text-sm"
                        placeholder={`Enter ${getCurrentCredentialLabel().toLowerCase()} value`}
                        maxLength={bankCredentialTypes.find(t => t.value === newBankCredential.type)?.maxLength || 50}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-6">
                    <button
                      type="button"
                      onClick={addBankCredential}
                      className="flex-1 px-3 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm transition-colors"
                      disabled={!newBankCredential.value.trim() || 
                        (newBankCredential.type === 'custom' && !newBankCredential.customLabel.trim())}
                    >
                      Add {getCurrentCredentialLabel()}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewCredential(false);
                        setNewBankCredential({ 
                          type: 'atm_pin', 
                          customLabel: '',
                          value: '' 
                        });
                      }}
                      className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              {bankCredentials.length === 0 && !showNewCredential && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No banking credentials added yet. Click "Add Credential" to add PINs, passwords, etc.
                </div>
              )}
            </div>
          )}

          {/* Banking-specific Details (ONLY for Bank category) */}
          {isBankCategory && (
            <div className="bg-gray-800/20 border border-gray-700/50 rounded-xl p-4">
              <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                <span>🏦</span> Bank Account Details (Optional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(bankSpecificFields).map(([key, field]) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-400 mb-2">
                      {field.icon} {field.label}
                    </label>
                    {field.type === 'select' ? (
                      <select
                        value={bankDetails[key]}
                        onChange={(e) => setBankDetails(prev => ({
                          ...prev,
                          [key]: e.target.value
                        }))}
                        className="form-select"
                      >
                        <option value="">Select {field.label}</option>
                        {field.options.map(option => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'month' ? (
                      <input
                        type="month"
                        value={bankDetails[key]}
                        onChange={(e) => setBankDetails(prev => ({
                          ...prev,
                          [key]: e.target.value
                        }))}
                        className="form-input"
                      />
                    ) : (
                      <input
                        type={field.mask ? 'password' : 'text'}
                        value={bankDetails[key]}
                        onChange={(e) => {
                          let value = e.target.value;
                          if (field.maxLength) {
                            value = value.slice(0, field.maxLength);
                          }
                          if (field.mask && key === 'cvv') {
                            value = value.replace(/\D/g, '');
                          }
                          if (field.mask && key === 'cardNumber') {
                            value = value.replace(/\D/g, '');
                            if (value.length > 16) value = value.slice(0, 16);
                            if (value.length > 12) value = value.replace(/(\d{4})(\d{4})(\d{4})(\d+)/, '$1-$2-$3-$4');
                            else if (value.length > 8) value = value.replace(/(\d{4})(\d{4})(\d+)/, '$1-$2-$3');
                            else if (value.length > 4) value = value.replace(/(\d{4})(\d+)/, '$1-$2');
                          }
                          setBankDetails(prev => ({
                            ...prev,
                            [key]: value
                          }));
                        }}
                        className="form-input"
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        maxLength={field.maxLength}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Details (for ALL categories) */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Additional Notes
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="form-textarea"
              placeholder={
                isBankCategory 
                  ? "Security questions, recovery email, branch manager contact, etc."
                  : "Notes, security questions, 2FA backup codes, or any additional information..."
              }
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={handleSave}
            className="btn-primary flex-1"
          >
            <span className="text-lg">{isEditing ? '✏️' : '✓'}</span>
            <span>{isEditing ? 'Update Credential' : 'Save Credential'}</span>
          </button>
          <button
            onClick={onClose}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
        </div>

        {isBankCategory && (
          <div className="mt-6 p-3 bg-gray-800/20 rounded-lg border border-gray-700/30">
            <p className="text-sm text-gray-400">
              💡 <strong>Tips for banking credentials:</strong>
              <ul className="mt-2 space-y-1 text-xs">
                <li>• <strong>Select credential type</strong>: Choose from ATM PIN, Mobile Banking PIN, etc.</li>
                <li>• <strong>For custom types</strong>: Select "Custom" and enter your own label</li>
                <li>• <strong>Add multiple credentials</strong>: Click "Add Credential" for each PIN/password</li>
                <li>• Username and password fields are optional for banking entries</li>
              </ul>
            </p>
          </div>
        )}
      </div>
      </div>
    </div>,
    document.body
  );
};