import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { categoryIcons } from '../utils/types';
import { lockBodyScroll } from '../utils/bodyScrollLock';

export const DeleteConfirmationModal = ({
  isOpen,
  credential,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!isOpen || !credential) return undefined;
    return lockBodyScroll();
  }, [isOpen, credential]);

  if (!isOpen || !credential) return null;

  return createPortal(
    <div className="modal-overlay" role="presentation" onClick={onCancel}>
      <div
        className="modal-overlay-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
      <div className="modal-content max-w-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 id="delete-modal-title" className="text-2xl font-bold text-white">
              Confirm Delete
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              This action cannot be undone
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-800/50 rounded-xl transition-colors"
          >
            <span className="text-xl">✕</span>
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-500/20 rounded-xl">
              <span className="text-xl">⚠️</span>
            </div>
            <div>
              <h3 className="font-bold text-white">Delete Credential</h3>
              <p className="text-gray-400 text-sm">
                Are you sure you want to delete this credential?
              </p>
            </div>
          </div>
          
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-800/50 rounded-xl">
                <span className="text-xl">
                  {categoryIcons[credential.category] || '📝'}
                </span>
              </div>
              <div>
                <h4 className="font-bold text-white">{credential.serviceName}</h4>
                <p className="text-gray-400 text-sm">{credential.username}</p>
                <p className="text-xs text-gray-500">
                  {credential.category} • Created {new Date(credential.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="btn-danger flex-1"
          >
            <span className="text-lg">🗑️</span>
            <span>Delete Permanently</span>
          </button>
          <button
            onClick={onCancel}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
        </div>
      </div>
      </div>
    </div>,
    document.body
  );
};