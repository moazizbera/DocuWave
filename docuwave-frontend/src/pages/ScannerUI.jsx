import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Upload,
  ScanLine,
  FileText,
  Image,
  File,
  X,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import apiService from '../services/api';
import { HubConnectionState } from '@microsoft/signalr';

function ScannerUI({ showToast, schemes, onUploadComplete, selectedTenant }) {
  const { language } = useLanguage();
  const fileInputRef = useRef(null);
  const [scannedDocs, setScannedDocs] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const connectionRef = useRef(null);

  const validateFile = (file) => {
    const maxSize = 25 * 1024 * 1024;
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (file.size > maxSize) {
      return {
        valid: false,
        error:
          language === 'ar'
            ? 'الملف كبير جداً (الحد الأقصى 25MB)'
            : language === 'fr'
            ? 'Fichier trop volumineux (max 25MB)'
            : 'File too large (max 25MB)'
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error:
          language === 'ar'
            ? 'نوع الملف غير مدعوم'
            : language === 'fr'
            ? 'Type de fichier non supporté'
            : 'Unsupported file type'
      };
    }

    return { valid: true };
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return Image;
    if (file.type === 'application/pdf') return FileText;
    return File;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFiles = (files) => {
    const fileArray = Array.from(files);
    const validFiles = [];

    fileArray.forEach((file) => {
      const validation = validateFile(file);
      if (validation.valid) {
        const newDoc = {
          id: `${Date.now()}-${Math.random()}`,
          name: file.name,
          file,
          size: file.size,
          type: file.type,
          status: 'ready'
        };
        validFiles.push(newDoc);
      } else {
        showToast(validation.error, 'error');
      }
    });

    if (validFiles.length > 0) {
      setScannedDocs((prev) => [...prev, ...validFiles]);
      showToast(
        language === 'ar'
          ? `تم إضافة ${validFiles.length} ملف`
          : language === 'fr'
          ? `${validFiles.length} fichier(s) ajouté(s)`
          : `${validFiles.length} file(s) added`,
        'success'
      );
    }
  };

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleFiles(files);
      }
    },
    [handleFiles]
  );

  const connectHub = useCallback(async () => {
    if (connectionRef.current) {
      await connectionRef.current.stop();
      connectionRef.current = null;
    }
    const connection = apiService.createHubConnection('/hubs/documents');
    connection.on('uploadProgress', (payload) => {
      if (!payload) return;
      setUploadProgress((prev) => ({
        ...prev,
        [payload.documentId || payload.id || 'unknown']: payload.progress || 0
      }));
    });
    connection.on('extractionUpdated', () => {});
    connection.on('completed', async () => {
      if (typeof onUploadComplete === 'function') {
        await onUploadComplete();
      }
    });
    await connection.start();
    connectionRef.current = connection;
  }, [onUploadComplete]);

  useEffect(() => {
    if (selectedTenant) {
      connectHub();
    }
    return () => {
      if (connectionRef.current && connectionRef.current.state === HubConnectionState.Connected) {
        connectionRef.current.stop();
      }
    };
  }, [connectHub, selectedTenant]);

  const processBatch = async () => {
    if (!selectedScheme) {
      showToast(
        language === 'ar'
          ? 'الرجاء اختيار نظام التصنيف'
          : language === 'fr'
          ? 'Veuillez sélectionner un schéma'
          : 'Please select a scheme',
        'warning'
      );
      return;
    }

    if (scannedDocs.length === 0) {
      showToast(
        language === 'ar'
          ? 'لا توجد ملفات للتحميل'
          : language === 'fr'
          ? 'Aucun fichier à télécharger'
          : 'No files to upload',
        'warning'
      );
      return;
    }

    setUploading(true);
    try {
      const files = scannedDocs.map((doc) => doc.file);
      await apiService.uploadDocuments({ files, schemeId: selectedScheme });
      showToast(
        language === 'ar'
          ? `تم تحميل ${scannedDocs.length} ملف بنجاح`
          : language === 'fr'
          ? `${scannedDocs.length} fichier(s) téléchargé(s)`
          : `${scannedDocs.length} file(s) uploaded successfully`,
        'success'
      );
      setScannedDocs([]);
      setUploadProgress({});
      if (typeof onUploadComplete === 'function') {
        await onUploadComplete();
      }
    } catch (error) {
      showToast(
        language === 'ar'
          ? 'فشل التحميل'
          : language === 'fr'
          ? 'Échec du téléversement'
          : 'Upload failed',
        'error'
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <ScanLine className="w-10 h-10 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold">Document Scanner</h2>
          <p className="text-gray-500">
            {language === 'ar'
              ? 'قم بسحب وإفلات الملفات أو استخدم زر التحديد للرفع.'
              : language === 'fr'
              ? 'Glissez-déposez des fichiers ou utilisez le bouton de sélection.'
              : 'Drag & drop files or use the picker to upload.'}
          </p>
        </div>
      </div>

      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-8 transition-all ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <Upload className="w-12 h-12 text-blue-600" />
          <p className="text-gray-600 text-center">
            {language === 'ar'
              ? 'أسقط الملفات هنا أو'
              : language === 'fr'
              ? 'Déposez des fichiers ici ou'
              : 'Drop files here or'}
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <ScanLine className="w-4 h-4" />
            {language === 'ar' ? 'اختر الملفات' : language === 'fr' ? 'Choisir des fichiers' : 'Choose files'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
          <div className="w-full max-w-md">
            <label className="block text-sm font-medium mb-2">
              {language === 'ar'
                ? 'اختر المخطط'
                : language === 'fr'
                ? 'Sélectionner un schéma'
                : 'Select scheme'}
            </label>
            <select
              value={selectedScheme}
              onChange={(e) => setSelectedScheme(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">
                {language === 'ar'
                  ? 'اختر'
                  : language === 'fr'
                  ? 'Choisir'
                  : 'Select'}
              </option>
              {schemes.map((scheme) => (
                <option key={scheme.id} value={scheme.id}>
                  {scheme.name || scheme.title || scheme.id}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {scannedDocs.length > 0 && (
        <div className="mt-6 space-y-3">
          {scannedDocs.map((doc) => {
            const Icon = getFileIcon(doc);
            const progress = uploadProgress[doc.id] ?? (doc.status === 'ready' ? 0 : 100);
            return (
              <div key={doc.id} className="bg-white border rounded-lg p-4 flex items-center gap-4">
                <Icon className="w-10 h-10 text-blue-500" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{doc.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(doc.size)}</p>
                    </div>
                    {doc.status === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                    {doc.status === 'failed' && <AlertCircle className="w-5 h-5 text-red-500" />}
                    {doc.status === 'ready' && (
                      <button onClick={() => setScannedDocs((prev) => prev.filter((d) => d.id !== doc.id))}>
                        <X className="w-5 h-5 text-gray-400" />
                      </button>
                    )}
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full ${
                        doc.status === 'failed' ? 'bg-red-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={processBatch}
          disabled={uploading}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-60"
        >
          {uploading && <Loader className="w-4 h-4 animate-spin" />}
          {language === 'ar'
            ? 'بدء الرفع'
            : language === 'fr'
            ? 'Commencer le téléversement'
            : 'Start upload'}
        </button>
      </div>
    </div>
  );
}

export default ScannerUI;
