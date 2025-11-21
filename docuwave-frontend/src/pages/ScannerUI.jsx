import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, ScanLine, FileText, Image, File, X, CheckCircle, AlertCircle,
  Trash2, Eye, Download, Plus, Loader, Camera, FolderOpen
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { apiService } from '../services/api';

/**
 * 🎨 ENHANCED SCANNER UI - PROFESSIONAL VERSION
 * ============================================
 * Features:
 * - Drag & Drop with visual feedback
 * - File preview (images & PDFs)
 * - Upload progress tracking
 * - Multiple file selection
 * - File validation
 * - Beautiful animations
 */
function ScannerUI({ setDocuments, showToast, schemes, onRefresh }) {
  const { language } = useLanguage();
  const fileInputRef = useRef(null);
  
  const [scannedDocs, setScannedDocs] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  // File validation
  const validateFile = (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (file.size > maxSize) {
      return {
        valid: false,
        error: language === 'ar' ? 'الملف كبير جداً (الحد الأقصى 10MB)' :
               language === 'fr' ? 'Fichier trop volumineux (max 10MB)' :
               'File too large (max 10MB)'
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: language === 'ar' ? 'نوع الملف غير مدعوم' :
               language === 'fr' ? 'Type de fichier non supporté' :
               'Unsupported file type'
      };
    }

    return { valid: true };
  };

  // Get file icon
  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return Image;
    if (file.type === 'application/pdf') return FileText;
    return File;
  };

  // Get file size in readable format
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Handle file selection
  const handleFiles = (files) => {
    const fileArray = Array.from(files);
    const validFiles = [];
    
    fileArray.forEach(file => {
      const validation = validateFile(file);
      if (validation.valid) {
        const newDoc = {
          id: Date.now() + Math.random(),
          name: file.name,
          file: file,
          size: file.size,
          type: file.type,
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
          status: 'ready'
        };
        validFiles.push(newDoc);
      } else {
        showToast(validation.error, 'error');
      }
    });

    if (validFiles.length > 0) {
      setScannedDocs([...scannedDocs, ...validFiles]);
      showToast(
        language === 'ar' ? `تم إضافة ${validFiles.length} ملف` :
        language === 'fr' ? `${validFiles.length} fichier(s) ajouté(s)` :
        `${validFiles.length} file(s) added`,
        'success'
      );
    }
  };

  // Drag & Drop handlers
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

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  }, [scannedDocs]);

  // Process batch upload
  const processBatch = async () => {
    if (!selectedScheme) {
      showToast(
        language === 'ar' ? 'الرجاء اختيار نظام التصنيف' :
        language === 'fr' ? 'Veuillez sélectionner un schéma' :
        'Please select a scheme',
        'warning'
      );
      return;
    }

    if (scannedDocs.length === 0) {
      showToast(
        language === 'ar' ? 'لا توجد ملفات للتحميل' :
        language === 'fr' ? 'Aucun fichier à télécharger' :
        'No files to upload',
        'warning'
      );
      return;
    }

    setUploading(true);
    let successCount = 0;
    let failCount = 0;

    try {
      await apiService.uploadDocuments(
        scannedDocs.map((doc) => doc.file),
        { schemeId: selectedScheme }
      );
      successCount = scannedDocs.length;
      setUploadProgress(
        scannedDocs.reduce((acc, doc) => ({ ...acc, [doc.id]: 100 }), {})
      );
      setScannedDocs((prev) => prev.map((d) => ({ ...d, status: 'success' })));
    } catch (error) {
      console.error('Upload failed:', error);
      failCount = scannedDocs.length;
      setScannedDocs((prev) => prev.map((d) => ({ ...d, status: 'failed' })));
    }

    setUploading(false);
    
    if (successCount > 0) {
      showToast(
        language === 'ar' ? `تم تحميل ${successCount} ملف بنجاح` :
        language === 'fr' ? `${successCount} fichier(s) téléchargé(s)` :
        `${successCount} file(s) uploaded successfully`,
        'success'
      );
      
      // Clear successful uploads after 2 seconds
      setTimeout(() => {
        setScannedDocs(prev => prev.filter(d => d.status !== 'success'));
        setUploadProgress({});
      }, 2000);
      
      onRefresh();
    }
    
    if (failCount > 0) {
      showToast(
        language === 'ar' ? `فشل تحميل ${failCount} ملف` :
        language === 'fr' ? `Échec de ${failCount} fichier(s)` :
        `${failCount} file(s) failed to upload`,
        'error'
      );
    }
  };

  // Remove document
  const removeDoc = (docId) => {
    setScannedDocs(scannedDocs.filter(d => d.id !== docId));
    showToast(
      language === 'ar' ? 'تم الإزالة' :
      language === 'fr' ? 'Supprimé' :
      'Removed',
      'success'
    );
  };

  // Clear all
  const clearAll = () => {
    setScannedDocs([]);
    setUploadProgress({});
    showToast(
      language === 'ar' ? 'تم مسح جميع الملفات' :
      language === 'fr' ? 'Tous les fichiers supprimés' :
      'All files cleared',
      'info'
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <ScanLine className="w-7 h-7 text-white" />
              </div>
              {language === 'ar' ? 'ماسح المستندات' :
               language === 'fr' ? 'Scanner de documents' :
               'Document Scanner'}
            </h1>
            <p className="text-gray-600">
              {language === 'ar' ? 'قم بتحميل ومعالجة المستندات الخاصة بك' :
               language === 'fr' ? 'Téléchargez et traitez vos documents' :
               'Upload and process your documents'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Scheme Selector */}
            <select 
              value={selectedScheme} 
              onChange={(e) => setSelectedScheme(e.target.value)}
              className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none font-medium text-sm min-w-[200px]"
            >
              <option value="">
                {language === 'ar' ? 'اختر نظام التصنيف...' :
                 language === 'fr' ? 'Sélectionner schéma...' :
                 'Select Scheme...'}
              </option>
              {schemes.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            {/* Upload Button */}
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all flex items-center gap-2 font-medium shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              {language === 'ar' ? 'إضافة ملفات' :
               language === 'fr' ? 'Ajouter fichiers' :
               'Add Files'}
            </button>
            
            <input 
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border-2 border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  {language === 'ar' ? 'إجمالي الملفات' :
                   language === 'fr' ? 'Total fichiers' :
                   'Total Files'}
                </p>
                <p className="text-2xl font-bold text-gray-900">{scannedDocs.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  {language === 'ar' ? 'جاهز' :
                   language === 'fr' ? 'Prêt' :
                   'Ready'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {scannedDocs.filter(d => d.status === 'ready').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  {language === 'ar' ? 'نجح' :
                   language === 'fr' ? 'Réussi' :
                   'Success'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {scannedDocs.filter(d => d.status === 'success').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  {language === 'ar' ? 'فشل' :
                   language === 'fr' ? 'Échoué' :
                   'Failed'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {scannedDocs.filter(d => d.status === 'failed').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                <X className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
        {scannedDocs.length === 0 ? (
          /* Drop Zone */
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative p-16 text-center cursor-pointer transition-all duration-300 ${
              isDragging 
                ? 'bg-purple-50 border-4 border-dashed border-purple-400' 
                : 'border-4 border-dashed border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
            }`}
          >
            <div className="relative z-10">
              <div className={`w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center transition-all duration-300 ${
                isDragging ? 'bg-purple-500 scale-110' : 'bg-purple-100'
              }`}>
                <Upload className={`w-12 h-12 transition-colors duration-300 ${
                  isDragging ? 'text-white' : 'text-purple-600'
                }`} />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {isDragging ? (
                  language === 'ar' ? 'أفلت الملفات هنا' :
                  language === 'fr' ? 'Déposez les fichiers ici' :
                  'Drop files here'
                ) : (
                  language === 'ar' ? 'اسحب وأفلت الملفات' :
                  language === 'fr' ? 'Glissez-déposez les fichiers' :
                  'Drag and drop files'
                )}
              </h3>
              
              <p className="text-gray-600 mb-6">
                {language === 'ar' ? 'أو انقر لتحديد الملفات من جهازك' :
                 language === 'fr' ? 'ou cliquez pour sélectionner depuis votre appareil' :
                 'or click to select from your device'}
              </p>
              
              <div className="flex items-center justify-center gap-4 mb-4">
                <span className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
                  📄 PDF
                </span>
                <span className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
                  🖼️ Images
                </span>
                <span className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
                  📝 Word
                </span>
              </div>
              
              <p className="text-xs text-gray-400">
                {language === 'ar' ? 'الحد الأقصى للملف: 10MB' :
                 language === 'fr' ? 'Taille max: 10MB' :
                 'Max file size: 10MB'}
              </p>
            </div>
          </div>
        ) : (
          /* Documents List */
          <div>
            <div className="p-4 border-b-2 border-gray-100 bg-gray-50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {language === 'ar' ? 'المستندات الممسوحة' :
                 language === 'fr' ? 'Documents scannés' :
                 'Scanned Documents'} ({scannedDocs.length})
              </h2>
              <div className="flex gap-2">
                {scannedDocs.length > 0 && (
                  <button
                    onClick={clearAll}
                    disabled={uploading}
                    className="px-4 py-2 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium text-sm disabled:opacity-50"
                  >
                    {language === 'ar' ? 'مسح الكل' :
                     language === 'fr' ? 'Tout effacer' :
                     'Clear All'}
                  </button>
                )}
                <button
                  onClick={processBatch}
                  disabled={uploading || !selectedScheme || scannedDocs.length === 0}
                  className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-medium text-sm disabled:opacity-50 flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  {uploading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      {language === 'ar' ? 'جاري التحميل...' :
                       language === 'fr' ? 'Téléchargement...' :
                       'Uploading...'}
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      {language === 'ar' ? 'رفع الكل' :
                       language === 'fr' ? 'Tout télécharger' :
                       'Upload All'}
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
              {scannedDocs.map(doc => {
                const Icon = getFileIcon(doc);
                const progress = uploadProgress[doc.id] || 0;
                
                return (
                  <div
                    key={doc.id}
                    className="border-2 border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      {/* Preview/Icon */}
                      <div className="relative">
                        {doc.preview ? (
                          <img
                            src={doc.preview}
                            alt={doc.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-purple-50 rounded-lg flex items-center justify-center">
                            <Icon className="w-8 h-8 text-purple-600" />
                          </div>
                        )}
                        
                        {/* Status Badge */}
                        {doc.status === 'success' && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                        {doc.status === 'failed' && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                            <X className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500">{formatFileSize(doc.size)}</span>
                          {doc.status === 'ready' && (
                            <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full font-medium">
                              {language === 'ar' ? 'جاهز' :
                               language === 'fr' ? 'Prêt' :
                               'Ready'}
                            </span>
                          )}
                          {doc.status === 'success' && (
                            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                              {language === 'ar' ? 'نجح' :
                               language === 'fr' ? 'Réussi' :
                               'Success'}
                            </span>
                          )}
                          {doc.status === 'failed' && (
                            <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-medium">
                              {language === 'ar' ? 'فشل' :
                               language === 'fr' ? 'Échoué' :
                               'Failed'}
                            </span>
                          )}
                        </div>
                        
                        {/* Progress Bar */}
                        {progress > 0 && progress < 100 && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{progress}%</p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {doc.preview && (
                          <button
                            onClick={() => setPreviewDoc(doc)}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title={language === 'ar' ? 'معاينة' : language === 'fr' ? 'Aperçu' : 'Preview'}
                          >
                            <Eye className="w-4 h-4 text-blue-600" />
                          </button>
                        )}
                        <button
                          onClick={() => removeDoc(doc.id)}
                          disabled={uploading}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title={language === 'ar' ? 'حذف' : language === 'fr' ? 'Supprimer' : 'Remove'}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewDoc(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b-2 border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{previewDoc.name}</h3>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
              <img
                src={previewDoc.preview}
                alt={previewDoc.name}
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScannerUI;