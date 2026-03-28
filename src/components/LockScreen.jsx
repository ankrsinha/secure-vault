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
        <div className="lock-screen-root">
            <div className="lock-screen-card">
                <header className="text-center mb-6 sm:mb-8">
                    <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-primary to-cyan-600 rounded-2xl mb-5 shadow-lg shadow-primary/20">
                        <span className="text-5xl leading-none" aria-hidden>🔐</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                        Secure Vault
                    </h1>
                    <p className="text-gray-400 mt-2 text-sm sm:text-base">
                        {isCreating ? 'Create your secure vault' : 'Unlock your secure vault'}
                    </p>
                </header>

                <div className="space-y-5 sm:space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-white mb-2" htmlFor="lock-master-password">
                            Master Password
                        </label>
                        <div className="relative">
                            <input
                                id="lock-master-password"
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
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    {isCreating && (
                        <div>
                            <label className="block text-sm font-medium text-white mb-2" htmlFor="lock-confirm-password">
                                Confirm Password
                            </label>
                            <input
                                id="lock-confirm-password"
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="form-input"
                                placeholder="Re-enter your master password"
                            />
                        </div>
                    )}

                    <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                        <button
                            type="button"
                            onClick={isCreating ? handleCreate : handleUnlock}
                            className="btn-primary flex-1 py-3.5"
                        >
                            <span className="text-xl" aria-hidden>{isCreating ? '🔓' : '🔐'}</span>
                            <span>{isCreating ? 'Create Vault' : 'Unlock Vault'}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setIsCreating(!isCreating);
                                setPassword('');
                                setConfirmPassword('');
                            }}
                            className="btn-secondary flex-1 py-3.5"
                        >
                            {isCreating ? 'Back to Login' : 'Create New Vault'}
                        </button>
                    </div>

                    <aside className="rounded-2xl border border-blue-500/25 bg-gradient-to-br from-blue-500/10 via-gray-900/40 to-cyan-500/5 p-4 sm:p-5">
                        <div className="flex items-center gap-2.5 mb-3">
                            <span className="text-2xl shrink-0" aria-hidden>🛡️</span>
                            <h2 className="text-sm font-semibold text-blue-200 tracking-wide uppercase">
                                Security
                            </h2>
                        </div>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2.5 text-sm text-gray-300">
                            <li className="flex gap-2 min-w-0">
                                <span className="text-emerald-400 shrink-0" aria-hidden>✓</span>
                                <span>AES-256 encryption on your device</span>
                            </li>
                            <li className="flex gap-2 min-w-0">
                                <span className="text-emerald-400 shrink-0" aria-hidden>✓</span>
                                <span>Master password never leaves this device</span>
                            </li>
                            <li className="flex gap-2 min-w-0 sm:col-span-2">
                                <span className="text-emerald-400 shrink-0" aria-hidden>✓</span>
                                <span>Zero-knowledge — we cannot read your data</span>
                            </li>
                            <li className="flex gap-2 min-w-0 sm:col-span-2 pt-1 border-t border-blue-500/15">
                                <span className="text-amber-400 shrink-0" aria-hidden>⚠</span>
                                <span className="text-gray-200">Your master password cannot be recovered if lost</span>
                            </li>
                        </ul>
                        <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                            Store your master password in a trusted password manager.
                        </p>
                    </aside>
                </div>
            </div>
        </div>
    );
};
