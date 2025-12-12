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
}) => {
    const [showPassword, setShowPassword] = useState(false);

    if (!isOpen || !credential) return null;

    const handleShowAndCopy = () => {
        // First show the password temporarily
        setShowPassword(true);
        // Copy to clipboard
        navigator.clipboard.writeText(credential.password);
        // Call the parent function to show status message
        onShowPassword(credential.password);
        // Hide password after 3 seconds
        setTimeout(() => setShowPassword(false), 3000);
    };

    const handleCopyUsername = () => {
        navigator.clipboard.writeText(credential.username);
        // You might want to add a callback here to show status
    };

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

                    {credential.details && (
                        <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
                            <label className="block text-xs font-medium text-gray-400 mb-2">
                                Additional Details
                            </label>
                            <p className="text-gray-200 text-sm whitespace-pre-wrap break-words">
                                {credential.details}
                            </p>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-2 pt-4">
                        <span className="credential-badge">
                            {categoryIcons[credential.category]} {credential.category}
                        </span>
                        {credential.updatedAt && (
                            <span className="credential-badge">
                                📅 Updated {new Date(credential.updatedAt).toLocaleDateString()}
                            </span>
                        )}
                    </div>
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