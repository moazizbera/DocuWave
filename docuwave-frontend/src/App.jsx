import React from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import DocuWaveSystem from './DocuWaveSystem';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <DocuWaveSystem />
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;