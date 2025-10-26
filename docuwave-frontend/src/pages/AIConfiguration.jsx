import React from 'react';
import { Cloud, Database } from 'lucide-react';
import { useTranslations } from '../hooks/useTranslations';

function AIConfiguration({ tenant, showToast }) {
  const { t } = useTranslations();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">{t.ai?.title} - {tenant.name}</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">AI Deployment Mode</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-4 border rounded cursor-pointer hover:bg-gray-50">
            <input type="radio" name="aiMode" defaultChecked />
            <div>
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-blue-500" />
                <span className="font-medium">{t.ai?.cloudAI}</span>
              </div>
            </div>
          </label>
          <label className="flex items-center gap-3 p-4 border rounded cursor-pointer hover:bg-gray-50">
            <input type="radio" name="aiMode" />
            <div>
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-green-500" />
                <span className="font-medium">{t.ai?.localAI}</span>
              </div>
            </div>
          </label>
        </div>
        <button 
          onClick={() => showToast('Configuration saved!', 'success')} 
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {t.ai?.saveConfiguration}
        </button>
      </div>
    </div>
  );
}

export default AIConfiguration;