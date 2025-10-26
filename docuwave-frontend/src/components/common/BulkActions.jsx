import React from 'react';
import { Trash2, Download, Archive, X } from 'lucide-react';

function BulkActions({ selectedCount, onDelete, onExport, onArchive, onClear }) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-4 z-50 animate-slide-in">
      <div className="flex items-center gap-2">
        <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {selectedCount}
        </div>
        <span className="text-sm">item{selectedCount > 1 ? 's' : ''} selected</span>
      </div>

      <div className="h-6 w-px bg-gray-600"></div>

      <div className="flex gap-2">
        {onExport && (
          <button
            onClick={onExport}
            className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded flex items-center gap-2 text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        )}
        
        {onArchive && (
          <button
            onClick={onArchive}
            className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded flex items-center gap-2 text-sm transition-colors"
          >
            <Archive className="w-4 h-4" />
            Archive
          </button>
        )}

        {onDelete && (
          <button
            onClick={onDelete}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded flex items-center gap-2 text-sm transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        )}
      </div>

      <div className="h-6 w-px bg-gray-600"></div>

      <button
        onClick={onClear}
        className="p-1 hover:bg-gray-800 rounded transition-colors"
        title="Clear selection"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default BulkActions;