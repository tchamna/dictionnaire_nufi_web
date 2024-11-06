import React, { useState, useEffect } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { firestore } from './firebaseConfig';
import SearchBar from './components/SearchBar';
import WordList from './components/WordList';
import WordDetails from './components/WordDetails';
import nufi_dictionary_data from './data/nufi_dictionary_data.json'; // Local data

// Clafrica Mapping (partial list shown, continue as per your requirements)
const Clafrica ={
  
  "aff1":"ɑ̀ɑ̀",
  "aff2":"ɑ́ɑ́",
  "aff3":"ɑ̄ɑ̄",
  "c_":"ç",
  "c_ced":"ç",
  "C_":"Ç",
  "C_ced":"Ç",
  "a13":"a᷅",
  "a23":"a᷇",
  "a32":"a᷄",
  "af13":"ɑ᷅",
  "af23":"ɑ᷇",
  "af32":"ɑ᷄",
  "ai13":"ɛ᷅",
  "ai23":"ɛ᷇",
  "ai32":"ɛ᷄",
  "e13":"e᷅",
  "e23":"e᷇",
  "e32":"e᷄",
  "eu13":"ə᷅",
  "eu23":"ə᷇",
  "eu32":"ə᷄",
  "i13":"i᷅",
  "i23":"i᷇",
  "i32":"i᷄",
  "o*13":"ɔ᷅",
  "o*23":"ɔ᷇",
  "o*32":"ɔ᷄",
  "o13":"o᷅",
  "o23":"o᷇",
  "o32":"o᷄",
  "u13":"u᷅",
  "u23":"u᷇",
  "u32":"u᷄",
  "uu13":"ʉ᷅",
  "uu23":"ʉ᷇",
  "uu32":"ʉ᷄",
  "a11":"àà",
  "a22":"áá",
  "a33":"āā",
  "af11":"ɑ̀ɑ̀",
  "af22":"ɑ́ɑ́",
  "af33":"ɑ̄ɑ̄",
  "e11":"èè",
  "e22":"éé",
  "e33":"ēē",
  "eu11":"ə̀ə̀",
  "eu22":"ə́ə́",
  "eu33":"ə̄ə̄",
  "ai11":"ɛ̀ɛ̀",
  "ai22":"έέ",
  "ai33":"ɛ̄ɛ̄",
  "i11":"ìì",
  "i22":"íí",
  "i33":"īī",
  "o11":"òò",
  "o22":"óó",
  "o33":"ōō",
  "o*11":"ɔ̀ɔ̀",
  "o*22":"ɔ́ɔ́",
  "o*33":"ɔ̄ɔ̄",
  "uu11":"ʉ̀ʉ̀",
  "uu22":"ʉ́ʉ́",
  "uu33":"ʉ̄ʉ̄",
  "u11":"ùù",
  "u22":"úú",
  "u33":"ūū",
  "u-11":"ʉ̀ʉ̀",
  "u-22":"ʉ́ʉ́",
  "u-33":"ʉ̄ʉ̄",
  "uuaf1":"ʉ̀ɑ̀",
  "uuaf2":"ʉ́ɑ́",
  "uuaf3":"ʉ̄ɑ̄",
  "ai11":"ɛ̀ɛ̀",
  "o*21":"ɔ̂",
  "o*12":"ɔ̌",
  "af11":"ɑ̀ɑ̀",
  "af12":"ɑ̌",
  "uuaf5":"ʉɑ̂",
  "uuaf7":"ʉɑ̌",
  "uuaf ":"ʉɑ",
  "eu12":"ə̌",
  "ai12":"ɛ̌",
  "uu12":"ʉ̌",
  "af21":"ɑ̂",
  "eu21":"ə̂",
  "ai21":"ɛ̂",
  "uu21":"ʉ̂",
  "aff1":"ɑ̀ɑ̀",
  "uaf1":"ùɑ̀",
  "iaf1":"ìɑ̀",
  "aff2":"ɑ́ɑ́",
  "uaf2":"úɑ́",
  "iaf2":"íɑ́",
  "iaf5":"iɑ̂",
  "iaf7":"iɑ̌",
  "uaf3":"ūɑ̄",
  "iaf3":"īɑ̄",
  "oo12":"ǒǒ",
  "oo21":"ôô",
  "..af":"ɑ̈",
  "..ai":"ɛ̈",
  "..eu":"ə̈",
  "..o*":"ɔ̈",
  "..uu":"ʉ̈",
  "i11":"ìì",
  "ai1":"ɛ̀",
  "ii1":"ìì",
  "o*2":"ɔ́",
  "o*3":"ɔ̄",
  "o*1":"ɔ̀",
  "uu1":"ʉ̀",
  "eu1":"ə̀",
  "eu2":"ə́",
  "ai2":"έ",
  "uu2":"ʉ́",
  "eu3":"ə̄",
  "uu3":"ʉ̄",
  "a12":"ǎ",
  "iaf":"iɑ",
  "e12":"ě",
  "i12":"ǐ",
  "u12":"ǔ",
  "a21":"â",
  "e21":"ê",
  "i21":"î",
  "u21":"û",
  "aa1":"àà",
  "ua1":"ùà",
  "ia1":"ìà",
  "aff ":"ɑɑ",
  "ee1":"èè",
  "ie1":"ìè",
  "af1":"ɑ̀",
  "aa2":"áá",
  "ee2":"éé",
  "ii2":"íí",
  "ie2":"íé",
  "oo2":"óó",
  "ua2":"úá",
  "ia2":"íá",
  "af2":"ɑ́",
  "ii3":"īī",
  "ai3":"ɛ̄",
  "ie3":"īē",
  "ee3":"ēē",
  "oo3":"ōō",
  "ua3":"ūā",
  "ia3":"īā",
  "aa3":"āā",
  "af3":"ɑ̄",
  "o12":"ǒ",
  "oo1":"òò",
  "o21":"ô",
  "o*7":"ɔ̌",
  "o*5":"ɔ̂",
  "af7":"ɑ̌",
  "eu7":"ə̌",
  "ai7":"ɛ̌",
  "uu7":"ʉ̌",
  "af5":"ɑ̂",
  "eu5":"ə̂",
  "ai5":"ɛ̂",
  "uu5":"ʉ̂",
  "oo7":"ǒǒ",
  "oo5":"ôô",
  "..a":"ä",
  "..b":"b̈",
  "..c":"c̈",
  "..d":"d̈",
  "..e":"ë",
  "..f":"f̈",
  "..g":"g̈",
  "..h":"ḧ",
  "..i":"ï",
  "..j":"j̈",
  "..k":"k̈",
  "..l":"l̈",
  "..m":"m̈",
  "..n":"n̈",
  "..o":"ö",
  "..p":"p̈",
  "..q":"q̈",
  "..r":"r̈",
  "..s":"s̈",
  "..t":"ẗ",
  "..u":"ü",
  "..v":"v̈",
  "..w":"ẅ",
  "..x":"ẍ",
  "..y":"ÿ",
  "..z":"z̈",
  ".af":"ɑ̇",
  ".ai":"ε̇",
  ".eu":"ə̇",
  ".o*":"ɔ̇",
  ".uu":"ʉ̇",
  "u1":"ù",
  "u2":"ú",
  "o*":"ɔ",
  "o*":"ɔ",
  "i1":"ì",
  "u3":"ū",
  "a1":"à",
  "e1":"è",
  "n*":"ŋ",
  "i2":"í",
  "e2":"é",
  "a2":"á",
  "i3":"ī",
  "e3":"ē",
  "a3":"ā",
  "o1":"ò",
  "o2":"ó",
  "o3":"ō",
  "a7":"ǎ",
  "e7":"ě",
  "i7":"ǐ",
  "u7":"ǔ",
  "a5":"â",
  "e5":"ê",
  "i5":"î",
  "u5":"û",
  "o7":"ǒ",
  "o5":"ô",
  ".?":"ʔ",
  ".a":"ȧ",
  ".b":"ḃ",
  ".c":"ċ",
  ".d":"ḋ",
  ".e":"ė",
  ".f":"ḟ",
  ".g":"ġ",
  ".h":"ḣ",
  ".i":"i̇",
  ".j":"j̇",
  ".k":"k̇",
  ".l":"l̇",
  ".m":"ṁ",
  ".n":"ṅ",
  ".o":"ȯ",
  ".p":"ṗ",
  ".q":"q̇",
  ".r":"ṙ",
  ".s":"ṡ",
  ".t":"ṫ",
  ".u":"u̇",
  ".v":"v̇",
  ".w":"ẇ",
  ".x":"ẋ",
  ".y":"ẏ",
  ".z":"ż",
  "?.":"ʔ",
  "u-1":"ʉ̀",
  "u-2":"ʉ́",
  "u-3":"ʉ̄",
  "af ":"ɑ",
  "eu":"ə",
  "ai":"ε",
  "uu ":"ʉ",
  "u-5":"ʉ̂",
  "u-7":"ʉ̌",
  "u- ":"ʉ",
  "u-":"ʉ",
  "n1":"ǹ",
  "n2":"ń",
  "n3":"n̄",
  "n7":"ň",
  "n5":"n̂",
  "m1":"m̀",
  "m2":"ḿ",
  "m3":"m̄",
  "m7":"m̌",
  "m5":"m̂",
  "N1":"Ǹ",
  "N2":"Ń",
  "N3":"N̄",
  "N7":"Ň",
  "N5":"N̂",
  "N*1":"Ŋ̀",
  "N*2":"Ŋ́",
  "N*3":"Ŋ̄",
  "N*7":"Ŋ̌",
  "N*5":"Ŋ̂",
  "N*":"Ŋ",
  "M1":"M̀",
  "M2":"Ḿ",
  "M3":"M̄",
  "M7":"M̌",
  "M5":"M̂",
  "A1":"À",
  "A2":"Á",
  "A3":"Ā",
  "A7":"Ǎ",
  "A5":"Â",
  "E1":"È",
  "E2":"É",
  "E3":"Ē",
  "E7":"Ě",
  "E5":"Ê",
  "O1":"Ò",
  "O2":"Ó",
  "O3":"Ō",
  "O7":"Ǒ",
  "O5":"Ô",
  "O*1":"Ɔ̀",
  "O*2":"Ɔ́",
  "O*3":"Ɔ̄",
  "O*7":"Ɔ̌",
  "O*5":"Ɔ̂",
  "O*":"Ɔ",
  "A12":"Ǎ",
  "A21":"Â",
  "O12":"Ǒ",
  "O21":"Ô",
  "e3_":"ē̠",
  "e_3":"ē̠",
  "e_":"e̠",
  "u-5":"ʉ̂",
  "u-7":"ʉ̌",
  "*n":"ɲ",
  "b*":"ɓ",
  "B*":"Ɓ",
  "d*":"ɗ",
  "D*":"Ɗ",
  "*N":"Ɲ",
  "U1":"Ù",
  "U2":"Ú",
  "U3":"Ū",
  "U5":"Û",
  "U7":"Ǔ",
  "I1":"Ì",
  "I2":"Í",
  "I3":"Ī",
  "I5":"Î",
  "I7":"Ǐ",
  "AI1":"Ɛ̀",
  "AI2":"έ",
  "AI3":"Ɛ̄",
  "AI5":"Ɛ̂",
  "AI7":"Ɛ̌",
  "EU1":"Ə̀",
  "EU2":"Ə́",
  "EU3":"Ə̄",
  "EU5":"Ə̂",
  "a~":"ã",
  "i~":"ĩ",
  "u~":"ũ",
  "e~":"ẽ",
  "o~":"õ",
  "ai~":"ɛ̃",
  "o*~":"ɔ̃",
  "af~":"ɑ̃",
  "eq.":"=",
  "pluss":"+",
  "i-":"ɨ",
  "i-1":"ɨ̀",
  "i-2":"ɨ́",
  "i-3":"ɨ̄",
  "i-7":"ɨ̌",
  "i-5":"ɨ̂"}


// Function to apply Clafrica mapping to transform input for matching
const applyClafricaMapping = (input) => {
  let transformedInput = input;
  const sortedEntries = Object.entries(Clafrica).sort(([keyA], [keyB]) => keyB.length - keyA.length);
  sortedEntries.forEach(([key, value]) => {
    const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    transformedInput = transformedInput.replace(regex, value);
  });
  return transformedInput;
};

const App = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWord, setSelectedWord] = useState(null);
  const [wordsData, setWordsData] = useState([]);

  // Fetch data conditionally based on environment
  useEffect(() => {
    const fetchData = async () => {
      if (process.env.NODE_ENV === 'development') {
        // Use local data in development
        setWordsData(nufi_dictionary_data);
      } else {
        // Fetch from Firebase in production
        try {
          const querySnapshot = await getDocs(collection(firestore, "nufi_dictionary"));
          const data = querySnapshot.docs.map(doc => doc.data());
          setWordsData(data);
        } catch (error) {
          console.error("Error fetching data from Firebase:", error);
        }
      }
    };
    fetchData();
  }, []);

  // Handle search input changes without transforming input for the display
  const handleInputChange = (event) => {
    setSearchQuery(event.target.value); // Keep the user input unchanged in the search box
  };

  // Filter words based on the transformed input while keeping the original input
  const transformedSearchQuery = applyClafricaMapping(searchQuery);
  const filteredWords = transformedSearchQuery
    ? wordsData.filter(wordEntry => {
        if (!wordEntry.word) return false; // Handle cases where word might be undefined
        const wordLower = wordEntry.word.toLowerCase();
        return wordLower.startsWith(transformedSearchQuery.toLowerCase());
      })
    : [];

  // Handle word selection
  const onWordClick = (word) => {
    setSelectedWord(word);
    setSearchQuery(''); // Clear the search query
  };

  // Handle double-click to find word definition
  const onWordDoubleClick = (wordText) => {
    const word = wordsData.find(item => item.word.toLowerCase() === wordText.toLowerCase());
    if (word) {
      setSelectedWord(word);
    } else {
      console.warn(`No matching word found for "${wordText}"`);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 dark:text-gray-100">
      <header className="p-8 shadow-md bg-white dark:bg-gray-800 border-b-2 border-gray-200 dark:border-gray-700">
        <div className="flex flex-col items-center">
          <h1 className="text-6xl font-extrabold text-indigo-800 dark:text-blue-300 mb-4 text-center">
            Ŋwɑ̀'nǐpàhsǐ Nùfī
          </h1>
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={handleInputChange}
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
            onWordDoubleClick={onWordDoubleClick}
          />
        )}
      </main>
    </div>
  );
};

export default App;
