import React, { useState, useEffect } from 'react';

export const CredentialModal = ({
    isOpen,
    onClose,
    onSave,
    editingCredential,
    isEditing,
}) => {
    const [serviceName, setServiceName] = useState('');
    const [username, setUsername] = useState('');
    const [passwordField, setPasswordField] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [details, setDetails] = useState('');
    const [category, setCategory] = useState('Other');

    useEffect(() => {
        if (isEditing && editingCredential) {
            setServiceName(editingCredential.serviceName);
            setUsername(editingCredential.username);
            setPasswordField(editingCredential.password);
            setDetails(editingCredential.details);
            setCategory(editingCredential.category);
        } else {
            resetForm();
        }
    }, [isEditing, editingCredential, isOpen]);

    const resetForm = () => {
        setServiceName('');
        setUsername('');
        setPasswordField('');
        setShowPassword(false);
        setDetails('');
        setCategory('Other');
    };

    const handleSave = () => {
        if (!serviceName.trim()) {
            alert('Please enter a service name');
            return;
        }
        if (!username.trim()) {
            alert('Please enter a username or email');
            return;
        }
        if (!passwordField) {
            alert('Please enter a password');
            return;
        }

        onSave({
            serviceName: serviceName.trim(),
            username: username.trim(),
            password: passwordField,
            details: details.trim(),
            category,
        });

        resetForm();
        onClose();
    };

    const generatePassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
        let password = '';
        for (let i = 0; i < 16; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setPasswordField(password);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content max-w-2xl">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            {isEditing ? 'Edit Credential' : 'Add New Credential'}
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">
                            {isEditing
                                ? 'Update your credential information'
                                : 'Securely store a new password'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-800/50 rounded-xl transition-colors"
                    >
                        <span className="text-xl">✕</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">
                            Service Name *
                        </label>
                        <input
                            type="text"
                            value={serviceName}
                            onChange={(e) => setServiceName(e.target.value)}
                            className="form-input"
                            placeholder="e.g., Google, Bank of America, GitHub"
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
                            <option value="Bank">🏦 Banking & Finance</option>
                            <option value="Email">📧 Email</option>
                            <option value="Social">👥 Social Media</option>
                            <option value="Work">💼 Work & Productivity</option>
                            <option value="Shopping">🛒 Shopping & E-commerce</option>
                            <option value="Entertainment">🎬 Entertainment</option>
                            <option value="Other">📝 Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white mb-2">
                            Username / Email *
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="form-input"
                            placeholder="username@example.com"
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-white">
                                Password *
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
                                value={passwordField}
                                onChange={(e) => setPasswordField(e.target.value)}
                                className="form-input pr-10"
                                placeholder="Enter password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                        {passwordField && (
                            <div className="mt-2">
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>Strength:</span>
                                    <span className={passwordField.length >= 8 ? 'text-green-500' : 'text-yellow-500'}>
                                        {passwordField.length >= 12 ? 'Strong' : passwordField.length >= 8 ? 'Good' : 'Weak'}
                                    </span>
                                </div>
                                <div className="mt-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${passwordField.length >= 12 ? 'bg-green-500' :
                                                passwordField.length >= 8 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}
                                        style={{ width: `${Math.min(passwordField.length * 5, 100)}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-white mb-2">
                        Additional Details
                    </label>
                    <textarea
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        className="form-textarea"
                        placeholder="Notes, security questions, 2FA backup codes, or any additional information..."
                        rows={3}
                    />
                </div>

                <div className="flex gap-3">
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

                <div className="mt-6 p-3 bg-gray-800/20 rounded-lg border border-gray-700/30">
                    <p className="text-sm text-gray-400">
                        💡 <strong>Tip:</strong> Use the password generator to create strong, unique passwords for each service.
                    </p>
                </div>
            </div>
        </div>
    );
};