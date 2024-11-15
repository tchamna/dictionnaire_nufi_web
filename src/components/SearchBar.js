

import React from 'react';

const SearchBar = ({ searchQuery, setSearchQuery, handleKeyPress }) => {
  return (
    <div className="w-full max-w-screen-lg mx-auto">
      <input
        type="text"
        placeholder="Cāk njâ'wú séè lè..."
        value={searchQuery}
        onChange={setSearchQuery}
        onKeyPress={handleKeyPress}
        className="p-4 text-2xl w-full rounded-lg shadow-md border border-gray-300 dark:border-gray-600"
      />
    </div>
  );
};

export default SearchBar;
