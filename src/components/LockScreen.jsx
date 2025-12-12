import React, { useState } from 'react';
import { SecurityManager, StorageManager } from '../utils/encryption';

export const LockScreen = ({ onUnlock, onError }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleUnlock = () => {
        if (!password) {
            onError('Please enter your master password');
            return;
        }

        try {
            const storedVault = localStorage.getItem('vault_encrypted');
            if (!storedVault) {
                StorageManager.saveCredentials([]);
                onUnlock(password, []);
                setPassword('');
                return;
            }

            const vaultData = JSON.parse(storedVault);
            const decrypted = SecurityManager.decrypt(vaultData, password);
            onUnlock(password, decrypted);
            setPassword('');
        } catch {
            onError('Invalid password. Please try again.');
            setPassword('');
        }
    };

    const handleCreate = () => {
        if (!password) {
            onError('Please enter a master password');
            return;
        }
        if (password.length < 8) {
            onError('Master password must be at least 8 characters');
            return;
        }
        if (password !== confirmPassword) {
            onError('Passwords do not match');
            return;
        }

        StorageManager.saveCredentials([]);
        onUnlock(password, []);
        setPassword('');
        setConfirmPassword('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            isCreating ? handleCreate() : handleUnlock();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-black to-gray-900">
            <div className="modal-content w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-block p-4 bg-gradient-to-br from-primary to-cyan-600 rounded-2xl mb-6">
                        <span className="text-5xl">🔐</span>
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                        Secure Vault
                    </h1>
                    <p className="text-gray-400 mt-2">
                        {isCreating ? 'Create your secure vault' : 'Unlock your secure vault'}
                    </p>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-white mb-3">
                            Master Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="form-input pr-12"
                                placeholder="Enter a strong master password"
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    {isCreating && (
                        <div>
                            <label className="block text-sm font-medium text-white mb-3">
                                Confirm Password
                            </label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="form-input"
                                placeholder="Re-enter your master password"
                            />
                        </div>
                    )}

                    <div className="flex gap-4">
                        <button
                            onClick={isCreating ? handleCreate : handleUnlock}
                            className="btn-primary flex-1 py-4"
                        >
                            <span className="text-xl">{isCreating ? '🔓' : '🔐'}</span>
                            <span>{isCreating ? 'Create Vault' : 'Unlock Vault'}</span>
                        </button>
                        <button
                            onClick={() => {
                                setIsCreating(!isCreating);
                                setPassword('');
                                setConfirmPassword('');
                            }}
                            className="btn-secondary flex-1 py-4"
                        >
                            {isCreating ? 'Back to Login' : 'Create New Vault'}
                        </button>
                    </div>

                    <div className="mt-6 p-5 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl mt-1">🛡️</span>
                            <div>
                                <strong className="text-blue-300">Security Information:</strong>
                                <ul className="mt-3 space-y-2 text-sm text-gray-300">
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-400">✓</span>
                                        <span>All data encrypted locally with AES-256</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-400">✓</span>
                                        <span>Master password never leaves your device</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-400">✓</span>
                                        <span>Zero-knowledge architecture</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-yellow-400">⚠</span>
                                        <span>Your master password cannot be recovered</span>
                                    </li>
                                </ul>
                                <p className="text-xs text-gray-500 mt-4">
                                    For enhanced security, use a password manager to store your master password
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};