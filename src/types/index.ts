export interface Language {
  id: string;
  name: string;
  code: string;
  nativeName?: string;
  isSelected: boolean;
}

export interface LanguageContextType {
  selectedLanguages: Language[];
  availableLanguages: Language[];
  toggleLanguage: (id: string) => void;
  selectAllLanguages: () => void;
  deselectAllLanguages: () => void;
}

export interface Phrase {
  id: string;
  category: string;
  english: string;
  translations: Record<string, string>;
}

export interface DictionaryEntry {
  id: string;
  word: string;
  partOfSpeech: string;
  language: string;
  definitions: string[];
  examples: string[];
  translations: {
    [language: string]: string;
  };
}
