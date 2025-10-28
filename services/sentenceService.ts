export interface Sentence {
  text: string; // e.g., "The {word} is yellow."
  correctWord: string;
  correctImage: string; // URL or base64 data URL
  distractors: { word: string; image: string; }[];
}

export type Language = 'es-MX' | 'en-US' | 'nah';

// --- Reusable Image Generation ---
const createSvgUrl = (emoji: string) => {
  const colors = ['#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff'];
  const charCode = emoji.codePointAt(0) || 0;
  const colorIndex = charCode % colors.length;
  const bgColor = colors[colorIndex];
  
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="15" fill="${bgColor}" />
      <text x="50" y="55" font-family="sans-serif" font-size="60" text-anchor="middle" dominant-baseline="central">${emoji}</text>
    </svg>
  `.trim();
  
  const base64 = btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${base64}`;
};

// --- Database of Words for Distractors ---
const IMAGE_DB: { [key: string]: string } = {
  sol: '☀️', luna: '🌙', casa: '🏠', gato: '🐈', perro: '🐕', árbol: '🌳', flor: '🌸', agua: '💧', pan: '🍞', pelota: '⚽', libro: '📖', manzana: '🍎',
  sun: '☀️', moon: '🌙', home: '🏠', cat: '🐈', dog: '🐕', tree: '🌳', flower: '🌸', water: '💧', bread: '🍞', ball: '⚽', book: '📖', apple: '🍎',
  tonatiuh: '☀️', metztli: '🌙', calli: '🏠', miztli: '🐈', itzcuintli: '🐕', cuahuitl: '🌳', xochitl: '🌸', atl: '💧', tlaxcalli: '🍞', axolotl: '🦎', papalotl: '🦋', tochtli: '🐇'
};

// --- Sentences Database ---
const SENTENCES_DB: { [lang in Language]: Omit<Sentence, 'correctImage' | 'distractors'>[] } = {
  'es-MX': [
    { text: 'El {word} es amarillo.', correctWord: 'sol' },
    { text: 'Yo vivo en una {word}.', correctWord: 'casa' },
    { text: 'El {word} dice miau.', correctWord: 'gato' },
    { text: 'Las plantas necesitan {word}.', correctWord: 'agua' },
    { text: 'Me gusta leer un {word}.', correctWord: 'libro' },
    { text: 'La {word} es de color rojo.', correctWord: 'manzana' },
    { text: 'El {word} ladra fuerte.', correctWord: 'perro' },
  ],
  'en-US': [
    { text: 'The {word} is yellow.', correctWord: 'sun' },
    { text: 'I live in a {word}.', correctWord: 'home' },
    { text: 'The {word} says meow.', correctWord: 'cat' },
    { text: 'Plants need {word}.', correctWord: 'water' },
    { text: 'I like to read a {word}.', correctWord: 'book' },
    { text: 'The {word} is red.', correctWord: 'apple' },
    { text: 'The {word} barks loudly.', correctWord: 'dog' },
  ],
  'nah': [
    { text: 'N {word} yetic ipan atl.', correctWord: 'axolotl' }, // The axolotl is in the water
    { text: 'N {word} patlani.', correctWord: 'papalotl' }, // The butterfly flies
    { text: 'Nehuatl niah n {word}.', correctWord: 'calli' }, // I go to the house
    { text: 'N {word} xoxoctic.', correctWord: 'cuahuitl' }, // The tree is green
    { text: 'N {word} cochi.', correctWord: 'tochtli' }, // The rabbit sleeps
    { text: 'N {word} chipahuac.', correctWord: 'xochitl' }, // The flower is beautiful
  ]
};

let lastSentenceIndex: { [lang: string]: number } = {};

export const getRandomSentence = (lang: Language): Sentence => {
  const sentenceTemplates = SENTENCES_DB[lang];
  if (!sentenceTemplates) {
    throw new Error(`No sentences found for language ${lang}`);
  }

  let randomIndex;
  do {
    randomIndex = Math.floor(Math.random() * sentenceTemplates.length);
  } while (sentenceTemplates.length > 1 && randomIndex === lastSentenceIndex[lang]);

  lastSentenceIndex[lang] = randomIndex;
  
  const template = sentenceTemplates[randomIndex];
  const correctWord = template.correctWord;

  // Get distractor words from the full list, ensuring they are different from the correct word
  const allWordsForLang = Object.keys(SENTENCES_DB[lang].reduce((acc, s) => ({...acc, [s.correctWord]: true }), {}));
  const distractorWords = allWordsForLang
    .filter(word => word !== correctWord)
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  const distractors = distractorWords.map(word => ({
    word: word,
    image: createSvgUrl(IMAGE_DB[word])
  }));

  return {
    ...template,
    correctImage: createSvgUrl(IMAGE_DB[correctWord]),
    distractors: distractors,
  };
};
