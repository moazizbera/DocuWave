
import React from 'react';
import Modal from './Modal';
import { useTranslations } from '../../hooks/useTranslations';

function ConfirmDialog({ isOpen, onClose, onConfirm, message }) {
  const { t } = useTranslations();
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.common?.confirm || 'Confirm'}>
      <p className="mb-6">{message}</p>
      <div className="flex justify-end gap-2">
        <button 
          onClick={onClose}
          className="px-4 py-2 border rounded hover:bg-gray-50"
        >
          {t.common?.no || 'No'}
        </button>
        <button 
          onClick={() => { onConfirm(); onClose(); }}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          {t.common?.yes || 'Yes'}
        </button>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;