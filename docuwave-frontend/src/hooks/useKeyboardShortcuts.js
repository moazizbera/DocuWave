import { useEffect } from 'react';

export function useKeyboardShortcuts(shortcuts) {
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Don't trigger if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      shortcuts.forEach(shortcut => {
        const matchesKey = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const matchesCtrl = shortcut.ctrl ? e.ctrlKey || e.metaKey : true;
        const matchesShift = shortcut.shift ? e.shiftKey : true;
        const matchesAlt = shortcut.alt ? e.altKey : true;

        if (matchesKey && matchesCtrl && matchesShift && matchesAlt) {
          e.preventDefault();
          shortcut.action();
        }
      });
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [shortcuts]);
}

// Keyboard Shortcuts Help Modal
export function KeyboardShortcutsHelp({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcuts = [
    { keys: ['Ctrl', 'S'], description: 'Save current page' },
    { keys: ['Ctrl', 'K'], description: 'Open search' },
    { keys: ['Ctrl', 'N'], description: 'New item' },
    { keys: ['Ctrl', 'E'], description: 'Export data' },
    { keys: ['Esc'], description: 'Close modal' },
    { keys: ['?'], description: 'Show this help' },
    { keys: ['1-7'], description: 'Navigate to tab' },
  ];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Keyboard Shortcuts</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {shortcuts.map((shortcut, idx) => (
            <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-700">{shortcut.description}</span>
              <div className="flex gap-1">
                {shortcut.keys.map((key, kidx) => (
                  <kbd 
                    key={kidx}
                    className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center text-xs text-gray-500">
          Press <kbd className="px-2 py-1 bg-gray-100 border rounded">?</kbd> anytime to view shortcuts
        </div>
      </div>
    </div>
  );
}

export default useKeyboardShortcuts;