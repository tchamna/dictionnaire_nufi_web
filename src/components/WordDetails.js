import React, { useRef } from 'react';
import audioMap from '../data/nufi_audio_map.json'; // Import audio map for paths
import nufiDictionary from '../data/nufi_dictionary_data.json'; // Import dictionary data

// Helper function to clean words
const cleanWord = (word) => word.replace(/[.,!?;:()"/]+$/, "").trim().toLowerCase();

// Generate keywordMap from nufiDictionary
const generateKeywordMap = (dictionary) => {
  const map = {};
  dictionary.forEach(entry => {
    map[entry.word] = entry.definitions; // Map each word to its definitions
  });
  return map;
};

// Utility function to capitalize the first letter of a sentence
const capitalizeFirstLetter = (sentence) => {
  if (!sentence) return sentence; // Handle empty string case
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
};

const keywordMap = generateKeywordMap(nufiDictionary); // Infer keywordMap from nufi_dictionary_data.json

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

const renderClickableText = (text, playAudio, onWordDoubleClick) => {
  // Split text by tags and keep the tags as part of the tokens
  const tokens = text.split(/(<tag_def>|<\/tag_def>|<b>|<\/b>|<br\s*\/?>|\s+|[.,!?;:])/);

  return tokens.map((token, index) => {
    const clean = cleanWord(token); // Normalize to lowercase for consistent matching

    // Handle specific tags as React components
    if (token === "<tag_def>") {
      return <span key={`${index}-open-tag-def`} className="font-semibold"></span>;
    }
    if (token === "</tag_def>") {
      return <React.Fragment key={`${index}-close-tag-def`}></React.Fragment>;
    }
    if (token === "<b>") {
      return <strong key={`${index}-open-bold`}></strong>;
    }
    if (token === "</b>") {
      return <React.Fragment key={`${index}-close-bold`}></React.Fragment>;
    }
    if (token === "<br>" || token === "<br />") {
      return <br key={`${index}-br`} />;
    }

    // Render clickable words with audio
    if (audioMap[clean]) {
      return (
        <span
          key={index}
          onClick={() => playAudio(clean)}
          onDoubleClick={() => onWordDoubleClick(clean)}
          className="text-black-100 cursor-pointer"
        >
          {token}
        </span>
      );
    }

    // Render clickable words with definition but no audio
    if (keywordMap[clean]) {
      return (
        <span
          key={index}
          onDoubleClick={() => onWordDoubleClick(clean)}
          className="text-black cursor-pointer"
        >
          {token}
        </span>
      );
    }

    // Render non-clickable words
    return <span key={index}>{token}</span>;
  });
};

const WordDetails = ({ word, onBack, onWordDoubleClick }) => {
  const { audioRef, playAudio } = useAudioPlayer();

  return (
    <div className="w-full lg:w-2/3 p-6 mx-auto" style={{ fontFamily: '"Charis SIL", serif' }}>
      <button
        onClick={onBack}
        className="mb-4 text-indigo-500 hover:text-indigo-700 underline cursor-pointer text-2xl"
      >
        ← Back to Results
      </button>
      <div className="bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 rounded-2xl p-8 transform transition duration-300 hover:scale-105 mx-auto max-w-3xl">
        <h2
          className="text-6xl font-extrabold text-green-700 dark:text-green-400 mb-4 cursor-pointer underline text-center"
          onClick={() => playAudio(word.word)}
        >
          {word.word}
        </h2>
        {word.part_of_speech && (
          <p className="text-xl mb-4">
            {/* <strong>Ntīē njâ'wū: </strong> */}
            {renderClickableText(word.part_of_speech, playAudio, onWordDoubleClick)}
          </p>
        )}
        {/* {audioMap[cleanWord(word.word)] && (
          <button
            onClick={() => playAudio(word.word)}
            className="text-blue-700 underline text-lg mb-4 cursor-pointer block mx-auto"
          >
            ▶️ Nò' ndáh njū'
          </button>
        )} */}
        {word.definitions.map((definition, defIdx) => (
          <div key={defIdx} className="mb-6">
            <p className="text-3xl font-medium text-gray-700 dark:text-gray-300 mb-4 text-justify">
              {renderClickableText(definition.text, playAudio, onWordDoubleClick)}
            </p>

           
          

            {definition.examples.length > 0 && (
              <div className="ml-4">
                <ul className="w-full">
                  {definition.examples.map((example, exIdx) => (
                    <li
                      key={exIdx}
                      className="p-4 rounded-lg shadow-inner mb-4 bg-green-50 hover:bg-green-100 transition-all border dark:border-gray-600 w-full"
                      style={{
                        boxShadow: 'inset 3px 3px 5px rgba(0, 0, 0, 0.2), inset -3px -3px 5px rgba(255, 255, 255, 0.7)',
                        backgroundImage: 'linear-gradient(to bottom, #fefff5, #f4f5f0)',
                        border: '1px solid #e0e0e0',
                      }}
                    >
                      <p className="text-2xl font-medium text-blue-900 dark:text-gray-100 w-full text-justify">
                        {renderClickableText(capitalizeFirstLetter(example.native), playAudio, onWordDoubleClick)}
                      </p>
                      <p className="text-2xl text-black-800 dark:text-blue-400 mt-1 w-full text-justify">
                        {renderClickableText(capitalizeFirstLetter(example.english), playAudio, onWordDoubleClick)}
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
