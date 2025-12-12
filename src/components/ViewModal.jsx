// Enhanced ViewModal.jsx
import React from 'react';
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
  if (!isOpen || !credential) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-lg">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-800/50 rounded-xl">
              <span className="text-3xl">
                {categoryIcons[credential.category] || '📝'}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
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
            <span className="text-2xl">✕</span>
          </button>
        </div>

        <div className="space-y-4 mb-8 max-h-[50vh] overflow-y-auto custom-scrollbar p-2">
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-5">
            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
              Username / Email
            </label>
            <div className="flex items-center justify-between">
              <p className="font-mono text-lg break-all text-white">
                {credential.username}
              </p>
              <button
                onClick={() => navigator.clipboard.writeText(credential.username)}
                className="ml-2 p-2 hover:bg-gray-700/50 rounded-lg transition-colors group relative"
              >
                <span className="text-gray-400 group-hover:text-white">📋</span>
                <div className="tooltip -top-2 left-full ml-2">Copy</div>
              </button>
            </div>
          </div>

          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-5">
            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
              Password
            </label>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono text-lg tracking-widest">
                  ••••••••••••
                </span>
                <span className="text-xs text-gray-500">
                  {credential.password.length} characters
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onShowPassword(credential.password)}
                  className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors text-sm"
                >
                  👁️ Show & Copy
                </button>
              </div>
            </div>
          </div>

          {credential.details && (
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-5">
              <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                Additional Details
              </label>
              <p className="text-gray-200 whitespace-pre-wrap break-words leading-relaxed">
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
            className="btn-secondary group relative"
          >
            <span className="text-lg">✏️</span>
            <span>Edit</span>
            <div className="tooltip -top-2 left-1/2">Edit Credential</div>
          </button>
          <button
            onClick={onCopyAll}
            className="btn-secondary group relative"
          >
            <span className="text-lg">📋</span>
            <span>Copy All</span>
            <div className="tooltip -top-2 left-1/2">Copy All Details</div>
          </button>
          <button
            onClick={onDelete}
            className="btn-danger group relative"
          >
            <span className="text-lg">🗑️</span>
            <span>Delete</span>
            <div className="tooltip -top-2 left-1/2">Delete Credential</div>
          </button>
          <button
            onClick={onClose}
            className="btn-secondary group relative"
          >
            <span className="text-lg">←</span>
            <span>Close</span>
          </button>
        </div>
      </div>
    </div>
  );
};