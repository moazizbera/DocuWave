import React from 'react';
import { Database } from 'lucide-react';
import { useTranslations } from '../hooks/useTranslations';

function Repositories({ showToast }) {
  const { t } = useTranslations();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">{t.repo?.title}</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-8 h-8 text-green-600" />
          <div>
            <h3 className="font-semibold">IBM FileNet</h3>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              {t.repo?.connected}
            </span>
          </div>
        </div>
        <button 
          onClick={() => showToast('Connection successful!', 'success')} 
          className="px-4 py-2 border rounded hover:bg-gray-50"
        >
          {t.repo?.testConnection}
        </button>
      </div>
    </div>
  );
}

export default Repositories;