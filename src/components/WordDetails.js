import React, { useRef } from 'react';
import audioMap from '../data/nufi_audio_map.json'; // Import audio map for paths
import nufiDictionary from '../data/nufi_dictionary_data.json'; // Import dictionary data

// Helper function to clean words
const cleanWord = (word) => word.replace(/[.,!?;:()"/]+$/, "").trim();

// Check if a word is clickable (exists in audioMap)
const isClickable = (word) => !!audioMap[cleanWord(word)];

// Generate keywordMap from nufiDictionary
const generateKeywordMap = (dictionary) => {
  const map = {};
  dictionary.forEach(entry => {
    map[entry.word] = entry.definitions; // Map each word to its definitions
  });
  return map;
};

const keywordMap = generateKeywordMap(nufiDictionary); // Infer keywordMap from nufi_dictionary_dat.json

// Function to play audio if available in the audioMap
const useAudioPlayer = () => {
  const audioRef = useRef(null);

  const playAudio = (key) => {
    const audioPath = audioMap[cleanWord(key)];
    if (audioPath) {
      audioRef.current.src = audioPath;
      audioRef.current.play().catch(error => console.error("Audio play failed:", error));
    }
  };

  return { audioRef, playAudio };
};

// Function to render clickable text with specific click and double-click behavior
const renderClickableText = (text, playAudio, onWordDoubleClick) => {
  // Clean the text by removing specific HTML tags
  const cleanedText = text
    .replace(/<tag_def>/g, "")         // Remove <tag_def> tags
    .replace(/<\/tag_def>/g, "")       // Remove </tag_def> tags
    .replace(/<br\s*\/?>/g, "\n");     // Replace <br> tags with newline for line breaks

  // Split cleaned text into words, spaces, and punctuation
  const words = cleanedText.split(/(\s+|[.,!?;:])/);

  return words.map((word, index) => {
    const clean = cleanWord(word);

    let clickTimeout; // Timeout variable to manage click events

    if (audioMap[clean]) {
      // Word exists in audioMap, apply blue color and underline for audio playback
      return (
        <span
          key={index}
          onClick={() => {
            clickTimeout = setTimeout(() => playAudio(clean), 250); // Trigger playAudio after 250ms delay
          }}
          onDoubleClick={() => {
            clearTimeout(clickTimeout); // Clear the click timeout if double-click is detected
            onWordDoubleClick(clean);   // Trigger double-click action to show definition
          }}
          className="text-blue-700 underline cursor-pointer" // Blue color, underline, and pointer cursor
        >
          {word}
        </span>
      );
    } else if (keywordMap[clean]) {
      // Word exists in keywordMap but not in audioMap, apply black color, no underline
      return (
        <span
          key={index}
          onDoubleClick={() => onWordDoubleClick(clean)} // Only double-click to show definition
          className="text-black cursor-pointer" // Black color, no underline
        >
          {word}
        </span>
      );
    }

    // For words that are neither in audioMap nor keywordMap
    return <span key={index}>{word}</span>;
  });
};

const WordDetails = ({ word, onBack, onWordDoubleClick }) => {
  const { audioRef, playAudio } = useAudioPlayer();

  return (
    <div className="w-full lg:w-2/3 p-6">
      <button
        onClick={onBack}
        className="mb-4 text-indigo-500 hover:text-indigo-700 underline cursor-pointer text-2xl"
      >
        ← Back to Results
      </button>
      <div className="bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 rounded-2xl p-8 transform transition duration-300 hover:scale-105">
        <h2
          className="text-6xl font-extrabold text-green-700 dark:text-green-400 mb-4 cursor-pointer underline"
          onClick={() => playAudio(word.word)}
        >
          {word.word}
        </h2>
        {word.part_of_speech && (
          <p className="text-xl mb-4">
            <strong>Ntīē njâ'wū: </strong>
            {renderClickableText(word.part_of_speech, playAudio, onWordDoubleClick)}
          </p>
        )}
        {audioMap[cleanWord(word.word)] && (
          <button
            onClick={() => playAudio(word.word)}
            className="text-blue-700 underline text-lg mb-4 cursor-pointer"
          >
            ▶️ Nò' ndáh njū'
          </button>
        )}
        {word.definitions.map((definition, defIdx) => (
          <div key={defIdx} className="mb-6">
            <p className="text-3xl font-medium text-gray-700 dark:text-gray-300 mb-4">
              {renderClickableText(definition.text, playAudio, onWordDoubleClick)}
            </p>
            {definition.examples.length > 0 && (
              <div className="ml-4">
                <ul>
                  {definition.examples.map((example, exIdx) => (
                    <li key={exIdx} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-inner mb-2">
                      <p className="text-3xl font-medium text-gray-900 dark:text-gray-100">
                        {renderClickableText(example.native, playAudio, onWordDoubleClick)}
                      </p>
                      <p className="text-2xl italic text-gray-700 dark:text-gray-800">
                        {renderClickableText(example.english, playAudio, onWordDoubleClick)}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
      <audio ref={audioRef} preload="auto" />
    </div>
  );
};

export default WordDetails;
