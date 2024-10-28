// src/App.js

import React, { useState } from 'react';
import SearchBar from './components/SearchBar';
import WordList from './components/WordList';
import WordDetails from './components/WordDetails';
import wordsData from './data/nufi_dictionary_data.json';

const App = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWord, setSelectedWord] = useState(null);
  const [fontClass, setFontClass] = useState('font-charis'); // Default font

  // Filter words that start with the search query
  const filteredWords = searchQuery
    ? wordsData.filter((word, index) => {
        // Convert word.word to string if it's not
        const wordStr = typeof word.word === 'string' ? word.word : String(word.word);
        
        // Optional: Log a warning if conversion was necessary
        if (typeof word.word !== 'string') {
          console.warn(`Converted 'word.word' from non-string to string at index ${index}:`, word.word);
        }

        // Perform the filtering using the string version
        return wordStr.toLowerCase().startsWith(searchQuery.toLowerCase());
      })
    : [];

  // Handle word selection
  const onWordClick = (word) => {
    setSelectedWord(word);
    setSearchQuery(''); // Clear the search query
  };

  // Handle double-click to find word definition
  const onWordDoubleClick = (wordText) => {
    if (typeof wordText !== 'string') {
      console.warn(`Received non-string wordText in onWordDoubleClick:`, wordText);
      return;
    }

    const word = wordsData.find((item, index) => {
      // Convert item.word to string if it's not
      const itemWordStr = typeof item.word === 'string' ? item.word : String(item.word);
      
      // Optional: Log a warning if conversion was necessary
      if (typeof item.word !== 'string') {
        console.warn(`Converted 'item.word' from non-string to string at index ${index}:`, item.word);
      }

      return itemWordStr.toLowerCase() === wordText.toLowerCase();
    });

    if (word) {
      setSelectedWord(word); // Display the word's details
    } else {
      console.warn(`No matching word found for wordText: "${wordText}"`);
    }
  };

  // Handle search input changes
  const handleInputChange = (event) => {
    setSearchQuery(event.target.value);
    setSelectedWord(null); // Reset selected word when typing
  };

  // Handle Enter key to trigger search
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && filteredWords.length > 0) {
      setSelectedWord(filteredWords[0]); // Select the first match
      setSearchQuery(''); // Clear the search query
    }
  };

  return (
    <div className={`min-h-screen bg-white text-gray-800 dark:text-gray-100 transition duration-500 ${fontClass}`}>
      <header className="p-8 shadow-md bg-white dark:bg-gray-800 border-b-2 border-gray-200 dark:border-gray-700">
        <div className="flex flex-col items-center">
          <h1 className="text-6xl font-extrabold text-indigo-800 dark:text-blue-300 mb-4 text-center">
            Ŋwɑ̀'nǐpàhsǐ Nùfī
          </h1>
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={handleInputChange}
            handleKeyPress={handleKeyPress} // Pass handleKeyPress function to SearchBar
          />
        </div>
      </header>
      <main className="p-6 flex flex-col lg:flex-row justify-center space-y-6 lg:space-y-0 lg:space-x-6">
        {searchQuery && !selectedWord && (
          <WordList words={filteredWords} onWordClick={onWordClick} />
        )}
        {selectedWord && (
          <WordDetails 
            word={selectedWord} 
            onBack={() => setSelectedWord(null)} 
            onWordDoubleClick={onWordDoubleClick} // Pass double-click handler
          />
        )}
      </main>
    </div>
  );
};

export default App;
