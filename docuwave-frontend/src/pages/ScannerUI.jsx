import React, { useState, useRef } from 'react';
import { ScanLine, Upload, FileText, Trash2 } from 'lucide-react';
import { useTranslations } from '../hooks/useTranslations';
import { apiService } from '../services/api';

function ScannerUI({ setDocuments, showToast, schemes, onRefresh }) {
  const { t } = useTranslations();
  const [scanning, setScanning] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [scannedDocs, setScannedDocs] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState('');
  const fileInputRef = useRef(null);

  const handleFiles = (files) => {
    const newDocs = Array.from(files).map(file => ({ 
      id: Date.now() + Math.random(), 
      name: file.name, 
      file: file,
      pages: 1
    }));
    setScannedDocs([...scannedDocs, ...newDocs]);
    showToast(`${files.length} files added`, 'success');
  };

  const processBatch = async () => {
    if (!selectedScheme) {
      showToast('Please select a scheme', 'warning');
      return;
    }

    setUploading(true);
    let successCount = 0;

    for (const doc of scannedDocs) {
      if (doc.file) {
        try {
          await apiService.uploadDocument(doc.file, selectedScheme);
          successCount++;
        } catch (error) {
          console.error('Upload failed:', error);
        }
      }
    }

    setScannedDocs([]);
    setUploading(false);
    showToast(`Uploaded ${successCount} documents`, 'success');
    onRefresh();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t.scanner?.title}</h2>
        <div className="flex gap-2">
          <select 
            value={selectedScheme} 
            onChange={(e) => setSelectedScheme(e.target.value)} 
            className="border rounded-lg px-4 py-2"
          >
            <option value="">Select Scheme...</option>
            {schemes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <input 
            ref={fileInputRef} 
            type="file" 
            multiple 
            accept="image/*,.pdf" 
            onChange={(e) => handleFiles(e.target.files)} 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className="px-4 py-2 border rounded hover:bg-gray-50 flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {t.scanner?.uploadFiles}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {scannedDocs.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <ScanLine className="w-16 h-16 mx-auto mb-3 text-gray-400" />
            <p>{t.scanner?.noDocuments}</p>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">{t.scanner?.scannedDocuments} ({scannedDocs.length})</h3>
              <button 
                onClick={processBatch} 
                disabled={uploading || !selectedScheme} 
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : t.scanner?.processBatch}
              </button>
            </div>
            <div className="space-y-3">
              {scannedDocs.map(doc => (
                <div key={doc.id} className="border rounded p-3 flex items-center gap-3">
                  <FileText className="w-6 h-6 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{doc.name}</p>
                  </div>
                  <button 
                    onClick={() => setScannedDocs(scannedDocs.filter(d => d.id !== doc.id))} 
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ScannerUI;