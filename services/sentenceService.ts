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

// --- Database of Words for Images and Distractors ---
const IMAGE_DB: { [key: string]: string } = {
  // es-MX words
  sol: '☀️', casa: '🏠', gato: '🐈', pelota: '⚽', manzana: '🍎', perro: '🐕', pájaro: '🐦', niña: '👧', coche: '🚗', luna: '🌙', árbol: '🌳', flor: '🌸', libro: '📖', agua: '💧',
  // en-US words (some overlap)
  sun: '☀️', home: '🏠', cat: '🐈', ball: '⚽', apple: '🍎', dog: '🐕', bird: '🐦', girl: '👧', car: '🚗', moon: '🌙', tree: '🌳', flower: '🌸', book: '📖', water: '💧',
  // nah words
  tonatiuh: '☀️', calli: '🏠', miztli: '🐈', itzcuintli: '🐕', cuahuitl: '🌳', xochitl: '🌸', atl: '💧', axolotl: '🦎', papalotl: '🦋', tochtli: '🐇', oquichtli: '👦', cihuatl: '👧', metztli: '🌙'
};

const LANGUAGE_WORD_POOL: { [lang in Language]: string[] } = {
    'es-MX': ['sol', 'casa', 'gato', 'pelota', 'manzana', 'perro', 'pájaro', 'niña', 'coche', 'luna', 'árbol', 'flor', 'libro', 'agua'],
    'en-US': ['sun', 'home', 'cat', 'ball', 'apple', 'dog', 'bird', 'girl', 'car', 'moon', 'tree', 'flower', 'book', 'water'],
    'nah': ['tonatiuh', 'calli', 'miztli', 'itzcuintli', 'cuahuitl', 'xochitl', 'atl', 'axolotl', 'papalotl', 'tochtli', 'oquichtli', 'cihuatl', 'metztli']
};


// --- Sentences Database with Levels ---
const SENTENCES_DB: { [lang in Language]: { [level: number]: Omit<Sentence, 'correctImage' | 'distractors'>[] } } = {
  'es-MX': {
    1: [
      { text: 'El {word} es amarillo.', correctWord: 'sol' },
      { text: 'Yo vivo en una {word}.', correctWord: 'casa' },
      { text: 'El {word} dice miau.', correctWord: 'gato' },
      { text: 'Me gusta jugar con la {word}.', correctWord: 'pelota' },
      { text: 'La {word} es de color rojo.', correctWord: 'manzana' },
    ],
    2: [
      { text: 'El {word} ladra fuerte.', correctWord: 'perro' },
      { text: 'El {word} vuela en el cielo.', correctWord: 'pájaro' },
      { text: 'La {word} va a la escuela.', correctWord: 'niña' },
      { text: 'El {word} es de color azul.', correctWord: 'coche' },
      { text: 'La {word} brilla de noche.', correctWord: 'luna' },
    ]
  },
  'en-US': {
    1: [
      { text: 'The {word} is yellow.', correctWord: 'sun' },
      { text: 'I live in a {word}.', correctWord: 'home' },
      { text: 'The {word} says meow.', correctWord: 'cat' },
      { text: 'I like to play with the {word}.', correctWord: 'ball' },
      { text: 'The {word} is red.', correctWord: 'apple' },
    ],
    2: [
      { text: 'The {word} barks loudly.', correctWord: 'dog' },
      { text: 'The {word} flies in the sky.', correctWord: 'bird' },
      { text: 'The {word} goes to school.', correctWord: 'girl' },
      { text: 'The {word} is blue.', correctWord: 'car' },
      { text: 'The {word} shines at night.', correctWord: 'moon' },
    ]
  },
  'nah': {
    1: [
      { text: 'N {word} yetic ipan atl.', correctWord: 'axolotl' },
      { text: 'N {word} patlani.', correctWord: 'papalotl' },
      { text: 'Nehuatl niah n {word}.', correctWord: 'calli' },
      { text: 'N {word} xoxoctic.', correctWord: 'cuahuitl' },
      { text: 'N {word} cochi.', correctWord: 'tochtli' },
    ],
    2: [
      { text: 'N {word} chipahuac.', correctWord: 'xochitl' },
      { text: 'N {word} tlatoa.', correctWord: 'miztli' }, // The cat meows
      { text: 'N {word} motlaloa.', correctWord: 'itzcuintli' }, // The dog runs
      { text: 'N {word} tlacua.', correctWord: 'oquichtli' }, // The boy eats
      { text: 'N {word} cecec.', correctWord: 'atl' }, // The water is cold
    ]
  }
};

export const getSentencesForLevel = (level: number, lang: Language, count: number): Sentence[] => {
    const sentenceTemplates = SENTENCES_DB[lang]?.[level];
    if (!sentenceTemplates || sentenceTemplates.length < count) {
        // Fallback to level 1 if requested level doesn't exist or is empty
        const fallbackTemplates = SENTENCES_DB[lang]?.[1];
        if (!fallbackTemplates) throw new Error(`No sentences found for language ${lang}`);
        return getSentencesForLevel(1, lang, count);
    }
    
    const shuffled = [...sentenceTemplates].sort(() => 0.5 - Math.random());
    const selectedTemplates = shuffled.slice(0, count);
    
    const allWordsForLang = LANGUAGE_WORD_POOL[lang];
    
    return selectedTemplates.map(template => {
        const correctWord = template.correctWord;
        
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
            distractors,
        };
    });
};
