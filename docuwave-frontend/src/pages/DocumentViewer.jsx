import React, { useState } from 'react';
import { Save, Download, Eye, Highlighter, MessageSquare, Eraser, Trash2 } from 'lucide-react';
import { useTranslations } from '../hooks/useTranslations';

function DocumentViewer({ showToast }) {
  const { t } = useTranslations();
  const [viewMode, setViewMode] = useState('pdf'); // pdf, word, image
  const [activeTool, setActiveTool] = useState(null);
  const [showOCR, setShowOCR] = useState(true);
  const [annotations, setAnnotations] = useState([
    { id: 1, type: 'highlight', text: 'Invoice Number: INV-2025-001', position: 'top-20 left-40' },
    { id: 2, type: 'comment', text: 'Verify amount with finance', position: 'top-40 left-40' }
  ]);

  const tools = [
    { id: 'highlight', label: 'Highlight', icon: Highlighter, color: 'text-yellow-600' },
    { id: 'comment', label: 'Comment', icon: MessageSquare, color: 'text-blue-600' },
    { id: 'redact', label: 'Redact', icon: Eraser, color: 'text-red-600' }
  ];

  const handleSave = () => {
    showToast('Document saved successfully!', 'success');
  };

  const handleDownload = () => {
    showToast('Document downloaded!', 'success');
  };

  const deleteAnnotation = (id) => {
    setAnnotations(annotations.filter(a => a.id !== id));
    showToast('Annotation deleted', 'success');
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">Invoice_12345.pdf</h2>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
            AI Extracted
          </span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
          <button 
            onClick={handleDownload}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-4">
        {/* Toolbar */}
        <div className="w-16 bg-white rounded-lg shadow p-2 flex flex-col gap-2">
          {tools.map(tool => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(activeTool === tool.id ? null : tool.id)}
              className={`p-3 rounded hover:bg-gray-100 transition-colors ${activeTool === tool.id ? 'bg-blue-100' : ''}`}
              title={tool.label}
            >
              <tool.icon className={`w-5 h-5 ${tool.color}`} />
            </button>
          ))}
          <div className="border-t my-2"></div>
          <button
            onClick={() => setShowOCR(!showOCR)}
            className={`p-3 rounded hover:bg-gray-100 transition-colors ${showOCR ? 'bg-green-100' : ''}`}
            title="Toggle OCR"
          >
            <Eye className="w-5 h-5 text-green-600" />
          </button>
        </div>

        {/* Document Display */}
        <div className="flex-1 bg-white rounded-lg shadow p-6 overflow-auto relative">
          {/* View Mode Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setViewMode('pdf')}
              className={`px-4 py-2 rounded ${viewMode === 'pdf' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              PDF View
            </button>
            <button
              onClick={() => setViewMode('word')}
              className={`px-4 py-2 rounded ${viewMode === 'word' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Document View
            </button>
            <button
              onClick={() => setViewMode('image')}
              className={`px-4 py-2 rounded ${viewMode === 'image' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Image + OCR
            </button>
          </div>

          {/* Document Content */}
          <div className="border-2 border-gray-300 rounded-lg p-8 min-h-[600px] bg-gray-50 relative">
            {viewMode === 'pdf' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">INVOICE</h3>
                      <p className="text-sm text-gray-600">Invoice #: INV-2025-001</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Date: October 18, 2025</p>
                      <p className="text-sm text-gray-600">Due Date: November 18, 2025</p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Bill To:</p>
                        <p className="text-sm text-gray-600">Acme Corporation</p>
                        <p className="text-sm text-gray-600">123 Business St</p>
                        <p className="text-sm text-gray-600">New York, NY 10001</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">From:</p>
                        <p className="text-sm text-gray-600">Global Supplies Inc</p>
                        <p className="text-sm text-gray-600">456 Vendor Ave</p>
                        <p className="text-sm text-gray-600">Boston, MA 02101</p>
                      </div>
                    </div>

                    <table className="w-full text-sm mb-4">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="text-left p-2">Description</th>
                          <th className="text-right p-2">Qty</th>
                          <th className="text-right p-2">Price</th>
                          <th className="text-right p-2">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="p-2">Office Supplies</td>
                          <td className="text-right p-2">10</td>
                          <td className="text-right p-2">$25.00</td>
                          <td className="text-right p-2">$250.00</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2">Equipment Rental</td>
                          <td className="text-right p-2">5</td>
                          <td className="text-right p-2">$150.00</td>
                          <td className="text-right p-2">$750.00</td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="text-right">
                      <p className="text-sm"><span className="font-semibold">Subtotal:</span> $1,000.00</p>
                      <p className="text-sm"><span className="font-semibold">Tax (8%):</span> $80.00</p>
                      <p className="text-lg font-bold mt-2"><span>Total:</span> $1,080.00</p>
                    </div>
                  </div>
                </div>

                {showOCR && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded p-4">
                    <p className="text-sm font-semibold text-blue-800 mb-2">🤖 AI Extracted Data:</p>
                    <div className="text-xs text-blue-700 space-y-1">
                      <p><strong>Invoice Number:</strong> INV-2025-001</p>
                      <p><strong>Date:</strong> October 18, 2025</p>
                      <p><strong>Total Amount:</strong> $1,080.00</p>
                      <p><strong>Vendor:</strong> Global Supplies Inc</p>
                      <p><strong>Confidence:</strong> 98.5%</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {viewMode === 'word' && (
              <div className="bg-white p-8 rounded shadow">
                <h2 className="text-2xl font-bold mb-4">Invoice Document</h2>
                <p className="text-gray-700 mb-2"><strong>Invoice Number:</strong> INV-2025-001</p>
                <p className="text-gray-700 mb-2"><strong>Date:</strong> October 18, 2025</p>
                <p className="text-gray-700 mb-2"><strong>Amount:</strong> $1,080.00</p>
                <p className="text-gray-700 mb-4"><strong>Vendor:</strong> Global Supplies Inc</p>
                
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold mb-2">Line Items:</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Office Supplies - Qty: 10 - $250.00</li>
                    <li>Equipment Rental - Qty: 5 - $750.00</li>
                  </ul>
                </div>
              </div>
            )}

            {viewMode === 'image' && (
              <div className="relative">
                <div className="bg-white p-8 rounded shadow min-h-[500px] border-2 border-dashed border-gray-300">
                  <p className="text-center text-gray-400 mb-4">Scanned Document Image</p>
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-96 rounded flex items-center justify-center">
                    <p className="text-gray-500">Document preview would appear here</p>
                  </div>
                </div>
                {showOCR && (
                  <div className="absolute top-4 right-4 bg-yellow-100 border-2 border-yellow-400 rounded p-3 max-w-xs">
                    <p className="text-xs font-semibold text-yellow-900 mb-1">OCR Layer Active</p>
                    <div className="text-xs text-yellow-800 space-y-1">
                      <p>✓ Text recognition enabled</p>
                      <p>✓ 156 words detected</p>
                      <p>✓ Confidence: 97.2%</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Annotations overlay */}
            {annotations.map(annotation => (
              <div
                key={annotation.id}
                className={`absolute ${annotation.position} ${
                  annotation.type === 'highlight' ? 'bg-yellow-200 border-yellow-400' : 'bg-blue-100 border-blue-400'
                } border-2 p-2 rounded shadow-lg max-w-xs z-10`}
              >
                <div className="flex justify-between items-start gap-2">
                  <p className="text-xs">{annotation.text}</p>
                  <button
                    onClick={() => deleteAnnotation(annotation.id)}
                    className="flex-shrink-0"
                  >
                    <Trash2 className="w-3 h-3 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {activeTool && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">
                <strong>{tools.find(t => t.id === activeTool)?.label}</strong> tool active. 
                Click on the document to add annotations.
              </p>
            </div>
          )}
        </div>

        {/* Annotations Sidebar */}
        <div className="w-64 bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Annotations ({annotations.length})
          </h3>
          <div className="space-y-3">
            {annotations.map(annotation => (
              <div
                key={annotation.id}
                className={`p-3 rounded border-l-4 ${
                  annotation.type === 'highlight' 
                    ? 'bg-yellow-50 border-yellow-400' 
                    : 'bg-blue-50 border-blue-400'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-semibold text-gray-700">
                    {annotation.type === 'highlight' ? '🖍️ Highlight' : '💬 Comment'}
                  </span>
                  <button onClick={() => deleteAnnotation(annotation.id)}>
                    <Trash2 className="w-3 h-3 text-red-600" />
                  </button>
                </div>
                <p className="text-xs text-gray-700">{annotation.text}</p>
              </div>
            ))}

            {annotations.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-6">
                No annotations yet. Use the tools on the left to add some.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentViewer;