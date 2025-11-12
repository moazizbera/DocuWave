import React from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { OrgProvider } from './contexts/OrgContext';
import DocuWaveSystem from './DocuWaveSystem';

/**
 * 🎯 ROOT APP COMPONENT
 * =====================
 * Wraps the entire application with context providers in correct hierarchy:
 * 
 * ThemeProvider (outermost)
 *   └─ LanguageProvider
 *       └─ OrgProvider
 *           └─ DocuWaveSystem (main app)
 * 
 * This ensures all contexts are available throughout the app
 * 
 * @component
 */
function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <OrgProvider>
          <DocuWaveSystem />
        </OrgProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;