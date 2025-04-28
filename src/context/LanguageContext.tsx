'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Language } from '@/types';

// Sample language data
const LANGUAGES: Language[] = [
  { id: '1', name: 'Swahili', code: 'sw', nativeName: 'Kiswahili', isSelected: true },
  { id: '2', name: 'Yoruba', code: 'yo', nativeName: 'Yorùbá', isSelected: false },
  { id: '3', name: 'Zulu', code: 'zu', nativeName: 'isiZulu', isSelected: false },
  { id: '4', name: 'Hausa', code: 'ha', nativeName: 'Hausa', isSelected: false },
  { id: '5', name: 'Amharic', code: 'am', nativeName: 'አማርኛ', isSelected: false },
  { id: '6', name: 'Igbo', code: 'ig', nativeName: 'Igbo', isSelected: false },
  { id: '7', name: 'Xhosa', code: 'xh', nativeName: 'isiXhosa', isSelected: false },
  { id: '8', name: 'Somali', code: 'so', nativeName: 'Soomaali', isSelected: false },
  { id: '9', name: 'Twi', code: 'tw', nativeName: 'Twi', isSelected: false },
  { id: '10', name: 'Shona', code: 'sn', nativeName: 'chiShona', isSelected: false },
];

interface LanguageContextType {
  availableLanguages: Language[];
  selectedLanguages: Language[];
  toggleLanguage: (languageId: string) => void;
  selectAllLanguages: () => void;
  deselectAllLanguages: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [languages, setLanguages] = useState<Language[]>(LANGUAGES);

  const selectedLanguages = languages.filter(lang => lang.isSelected);

  const toggleLanguage = (languageId: string) => {
    setLanguages(prevLanguages =>
      prevLanguages.map(lang =>
        lang.id === languageId ? { ...lang, isSelected: !lang.isSelected } : lang
      )
    );
  };

  const selectAllLanguages = () => {
    setLanguages(prevLanguages =>
      prevLanguages.map(lang => ({ ...lang, isSelected: true }))
    );
  };

  const deselectAllLanguages = () => {
    setLanguages(prevLanguages =>
      prevLanguages.map(lang => ({ ...lang, isSelected: false }))
    );
  };

  return (
    <LanguageContext.Provider
      value={{
        availableLanguages: languages,
        selectedLanguages,
        toggleLanguage,
        selectAllLanguages,
        deselectAllLanguages,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
