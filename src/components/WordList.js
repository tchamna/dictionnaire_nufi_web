import React from 'react';

const WordList = ({ words, onWordClick }) => (
  <div className="w-full lg:w-1/3 p-4">
    <h2 className="text-3xl font-bold mb-4 text-indigo-800 dark:text-indigo-300">
      Nkwèè njá'zū ...
    </h2>
    <ul className="space-y-4">
      {words.map((word) => (
        <li
          key={word.word}
          className="p-6 bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition transform hover:scale-105"
          onClick={() => onWordClick(word)}
        >
          <h3 className="text-3xl font-semibold text-blue-900 dark:text-blue-100">
            {word.word}
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {word.translation}
          </p>
        </li>
      ))}
    </ul>
  </div>
);

export default WordList;
