import React, { useState } from 'react';
import { FileText, CheckCircle, XCircle, AlertCircle, Download, Trash2, Search, RefreshCw, Filter, X } from 'lucide-react';
import { useTranslations } from '../hooks/useTranslations';
import StatCard from '../components/common/StatCard';
import ConfirmDialog from '../components/common/ConfirmDialog';
import BulkActions from '../components/common/BulkActions';
import { TableSkeleton } from '../components/common/LoadingSkeleton';
import { apiService } from '../services/api';

function Dashboard({ documents, tenant, setDocuments, showToast, schemes, loading, onRefresh }) {
  const { t } = useTranslations();
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDoc, setDeleteDoc] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('date-desc');
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [deleteBulk, setDeleteBulk] = useState(false);

  const filteredDocs = documents
    .filter(doc => {
      const matchesSearch = (doc.fileName || doc.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || (doc.scheme || doc.type) === filterType;
      const matchesStatus = filterStatus === 'all' || (doc.status || 'processed') === filterStatus;
      
      let matchesDate = true;
      if (dateFrom || dateTo) {
        const docDate = new Date(doc.uploadedAt || doc.date);
        if (dateFrom) matchesDate = matchesDate && docDate >= new Date(dateFrom);
        if (dateTo) matchesDate = matchesDate && docDate <= new Date(dateTo);
      }

      return matchesSearch && matchesType && matchesStatus && matchesDate;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return (a.fileName || a.name).localeCompare(b.fileName || b.name);
        case 'name-desc':
          return (b.fileName || b.name).localeCompare(a.fileName || a.name);
        case 'date-asc':
          return new Date(a.uploadedAt || a.date) - new Date(b.uploadedAt || b.date);
        case 'date-desc':
          return new Date(b.uploadedAt || b.date) - new Date(a.uploadedAt || a.date);
        default:
          return 0;
      }
    });

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedDocs(filteredDocs.map(d => d.id || d.documentId));
    } else {
      setSelectedDocs([]);
    }
  };

  const handleSelectDoc = (docId, checked) => {
    if (checked) {
      setSelectedDocs([...selectedDocs, docId]);
    } else {
      setSelectedDocs(selectedDocs.filter(id => id !== docId));
    }
  };

  const handleDelete = async (doc) => {
    const success = await apiService.deleteDocument(doc.id || doc.documentId);
    if (success) {
      setDocuments(prev => prev.filter(d => (d.id || d.documentId) !== (doc.id || doc.documentId)));
      showToast('Document deleted', 'success');
    } else {
      showToast('Failed to delete', 'error');
    }
  };

  const handleBulkDelete = async () => {
    let successCount = 0;
    for (const docId of selectedDocs) {
      const success = await apiService.deleteDocument(docId);
      if (success) successCount++;
    }
    
    setDocuments(prev => prev.filter(d => !selectedDocs.includes(d.id || d.documentId)));
    setSelectedDocs([]);
    showToast(`Deleted ${successCount} document(s)`, 'success');
    setDeleteBulk(false);
  };

  const handleBulkExport = () => {
    const selectedData = documents.filter(d => selectedDocs.includes(d.id || d.documentId));
    const csv = [
      ['Name', 'Type', 'Status', 'Date'].join(','),
      ...selectedData.map(d => [d.fileName || d.name, d.scheme || d.type, d.status || 'processed', d.uploadedAt || d.date].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `selected_documents_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast(`Exported ${selectedData.length} document(s)`, 'success');
  };

  const exportCSV = () => {
    const csv = [
      ['Name', 'Type', 'Status', 'Date'].join(','),
      ...filteredDocs.map(d => [d.fileName || d.name, d.scheme || d.type, d.status || 'processed', d.uploadedAt || d.date].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `documents_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast(`CSV exported! (${filteredDocs.length} records)`, 'success');
  };

  const clearFilters = () => {
    setFilterType('all');
    setFilterStatus('all');
    setDateFrom('');
    setDateTo('');
    setSearchQuery('');
    showToast('Filters cleared', 'info');
  };

  const stats = {
    total: documents.length,
    processed: documents.filter(d => d.status === 'processed' || !d.status).length,
    pending: documents.filter(d => d.status === 'pending').length,
    failed: documents.filter(d => d.status === 'failed').length
  };

  const activeFiltersCount = [
    filterType !== 'all',
    filterStatus !== 'all',
    dateFrom !== '',
    dateTo !== '',
    searchQuery !== ''
  ].filter(Boolean).length;

  const allSelected = filteredDocs.length > 0 && selectedDocs.length === filteredDocs.length;
  const someSelected = selectedDocs.length > 0 && !allSelected;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">{t.dashboard?.title} - {tenant.name}</h2>
          <p className="text-sm text-gray-600 mt-1">
            Showing {filteredDocs.length} of {documents.length} documents
            {selectedDocs.length > 0 && ` • ${selectedDocs.length} selected`}
          </p>
        </div>
        <button 
          onClick={onRefresh} 
          disabled={loading} 
          className="px-4 py-2 border rounded hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard icon={FileText} label={t.dashboard?.totalDocuments} value={stats.total} color="blue" />
        <StatCard icon={CheckCircle} label={t.dashboard?.processed} value={stats.processed} color="green" />
        <StatCard icon={AlertCircle} label={t.dashboard?.pending} value={stats.pending} color="yellow" />
        <StatCard icon={XCircle} label={t.dashboard?.failed} value={stats.failed} color="red" />
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b space-y-3">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder={t.dashboard?.searchPlaceholder} 
                className="w-full pl-10 pr-4 py-2 border rounded-lg" 
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2 ${showFilters ? 'bg-blue-50 border-blue-500' : ''}`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            <button 
              onClick={exportCSV} 
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {t.dashboard?.exportCSV}
            </button>
          </div>

          {showFilters && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3 animate-fade-in">
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Document Type</label>
                  <select 
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-3 py-2 border rounded text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="Invoice">Invoice</option>
                    <option value="Contract">Contract</option>
                    <option value="Receipt">Receipt</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Status</label>
                  <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 border rounded text-sm"
                  >
                    <option value="all">All Statuses</option>
                    <option value="processed">Processed</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Date From</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-3 py-2 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Date To</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-3 py-2 border rounded text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <p className="text-xs text-gray-600">
                  {filteredDocs.length} document{filteredDocs.length !== 1 ? 's' : ''} match your filters
                </p>
                <button
                  onClick={clearFilters}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 border rounded text-sm"
              >
                <option value="date-desc">Date (Newest first)</option>
                <option value="date-asc">Date (Oldest first)</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
              </select>
            </div>
            
            {selectedDocs.length > 0 && (
              <button
                onClick={() => setSelectedDocs([])}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Clear selection
              </button>
            )}
          </div>
        </div>
        
        {loading ? (
          <TableSkeleton rows={5} />
        ) : filteredDocs.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">
              {searchQuery || activeFiltersCount > 0 
                ? 'No documents match your search criteria'
                : 'No documents yet'}
            </p>
            {(searchQuery || activeFiltersCount > 0) && (
              <button
                onClick={clearFilters}
                className="mt-3 text-blue-600 hover:text-blue-700 text-sm"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={input => {
                        if (input) input.indeterminate = someSelected;
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Document</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.dashboard?.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredDocs.map(doc => (
                  <tr key={doc.id || doc.documentId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{doc.fileName || doc.name}</td>
                    
                    {/* THIS IS THE FIX - handle object scheme */}
                    <td className="px-4 py-3 text-sm">
                      {typeof doc.scheme === 'object' 
                        ? doc.scheme.name 
                        : (doc.scheme || doc.type || 'N/A')}
                    </td>
                    
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                        {doc.status || 'processed'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(doc.uploadedAt || doc.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setDeleteDoc(doc)} className="p-1 hover:bg-gray-100 rounded">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      <BulkActions
        selectedCount={selectedDocs.length}
        onDelete={() => setDeleteBulk(true)}
        onExport={handleBulkExport}
        onClear={() => setSelectedDocs([])}
      />

      {/* Single Delete Confirmation */}
      <ConfirmDialog 
        isOpen={!!deleteDoc} 
        onClose={() => setDeleteDoc(null)} 
        onConfirm={() => handleDelete(deleteDoc)} 
        message={`${t.dashboard?.deleteConfirm} "${deleteDoc?.fileName || deleteDoc?.name}"?`} 
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmDialog 
        isOpen={deleteBulk} 
        onClose={() => setDeleteBulk(false)} 
        onConfirm={handleBulkDelete} 
        message={`Are you sure you want to delete ${selectedDocs.length} document(s)? This action cannot be undone.`} 
      />
    </div>
  );
}

export default Dashboard;