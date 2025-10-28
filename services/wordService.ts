export interface Word {
  word: string;
  image: string; // URL or base64 data URL
}

export type Language = 'es-MX' | 'en-US' | 'nah';

const createSvgUrl = (emoji: string) => {
  const colors = ['#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff'];
  // Use codePointAt for multi-byte emoji support
  const charCode = emoji.codePointAt(0) || 0;
  const colorIndex = charCode % colors.length;
  const bgColor = colors[colorIndex];
  
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="15" fill="${bgColor}" />
      <text x="50" y="55" font-family="sans-serif" font-size="60" text-anchor="middle" dominant-baseline="central">${emoji}</text>
    </svg>
  `.trim();
  
  // Use a robust method to encode SVG with emojis to Base64
  const base64 = btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${base64}`;
};

const WORDS_DB: { [lang in Language]: { [level: number]: Word[] } } = {
  'es-MX': {
    1: [ // 3 letters
      { word: 'sol', image: createSvgUrl('☀️') },
      { word: 'paz', image: createSvgUrl('🕊️') },
      { word: 'luz', image: createSvgUrl('💡') },
      { word: 'mar', image: createSvgUrl('🌊') },
      { word: 'pan', image: createSvgUrl('🍞') },
      { word: 'rey', image: createSvgUrl('👑') },
    ],
    2: [ // 4 letters
      { word: 'luna', image: createSvgUrl('🌙') },
      { word: 'casa', image: createSvgUrl('🏠') },
      { word: 'gato', image: createSvgUrl('🐈') },
      { word: 'flor', image: createSvgUrl('🌸') },
      { word: 'nube', image: createSvgUrl('☁️') },
      { word: 'agua', image: createSvgUrl('💧') },
    ],
    3: [ // 5 letters
      { word: 'árbol', image: createSvgUrl('🌳') },
      { word: 'feliz', image: createSvgUrl('😊') },
      { word: 'libro', image: createSvgUrl('📖') },
      { word: 'playa', image: createSvgUrl('🏖️') },
      { word: 'verde', image: createSvgUrl('🍃') },
      { word: 'ratón', image: createSvgUrl('🐁') },
    ],
    4: [ // 6 letters
      { word: 'fiesta', image: createSvgUrl('🎉') },
      { word: 'música', image: createSvgUrl('🎵') },
      { word: 'zapato', image: createSvgUrl('👟') },
      { word: 'pelota', image: createSvgUrl('⚽') },
      { word: 'camisa', image: createSvgUrl('👕') },
      { word: 'doctor', image: createSvgUrl('🧑‍⚕️') },
    ]
  },
  'en-US': {
    1: [ // 3 letters
      { word: 'sun', image: createSvgUrl('☀️') },
      { word: 'cat', image: createSvgUrl('🐈') },
      { word: 'dog', image: createSvgUrl('🐕') },
      { word: 'pan', image: createSvgUrl('🍳') },
      { word: 'key', image: createSvgUrl('🔑') },
      { word: 'car', image: createSvgUrl('🚗') },
    ],
    2: [ // 4 letters
      { word: 'moon', image: createSvgUrl('🌙') },
      { word: 'home', image: createSvgUrl('🏠') },
      { word: 'lion', image: createSvgUrl('🦁') },
      { word: 'tree', image: createSvgUrl('🌳') },
      { word: 'book', image: createSvgUrl('📖') },
      { word: 'ball', image: createSvgUrl('⚽') },
    ],
    3: [ // 5 letters
      { word: 'apple', image: createSvgUrl('🍎') },
      { word: 'happy', image: createSvgUrl('😊') },
      { word: 'water', image: createSvgUrl('💧') },
      { word: 'house', image: createSvgUrl('🏠') },
      { word: 'green', image: createSvgUrl('🍃') },
      { word: 'mouse', image: createSvgUrl('🐁') },
    ],
    4: [ // 6 letters
      { word: 'orange', image: createSvgUrl('🍊') },
      { word: 'school', image: createSvgUrl('🏫') },
      { word: 'pencil', image: createSvgUrl('✏️') },
      { word: 'flower', image: createSvgUrl('🌸') },
      { word: 'cheese', image: createSvgUrl('🧀') },
      { word: 'doctor', image: createSvgUrl('🧑‍⚕️') },
    ]
  },
  'nah': {
    1: [ // 3-4 letters
      { word: 'amo', image: createSvgUrl('❌') }, // No
      { word: 'ehe', image: createSvgUrl('✅') }, // Yes
      { word: 'ayo', image: createSvgUrl('🎃') }, // Pumpkin
      { word: 'atl', image: createSvgUrl('💧') }, // Water
      { word: 'metl', image: createSvgUrl('🌵') }, // Maguey
    ],
    2: [ // 4-6 letters
      { word: 'calli', image: createSvgUrl('🏠') }, // House
      { word: 'xochi', image: createSvgUrl('🌸') }, // Flower
      { word: 'toto', image: createSvgUrl('🐦') }, // Bird
      { word: 'tepe', image: createSvgUrl('⛰️') }, // Hill
      { word: 'miztli', image: createSvgUrl('🐈') }, // Cat
    ],
    3: [ // 5 letters
      { word: 'koatl', image: createSvgUrl('🐍') }, // Snake
      { word: 'michi', image: createSvgUrl('🐟') }, // Fish
      { word: 'tochi', image: createSvgUrl('🐇') }, // Rabbit
      { word: 'mazat', image: createSvgUrl('🦌') }, // Deer
      { word: 'citlal', image: createSvgUrl('⭐') }, // Star
    ],
    4: [ // 6+ letters
      { word: 'axolotl', image: createSvgUrl('🦎') }, // Axolotl
      { word: 'papalotl', image: createSvgUrl('🦋') }, // Butterfly
      { word: 'tekpilli', image: createSvgUrl('👑') }, // Noble
      { word: 'chilli', image: createSvgUrl('🌶️') }, // Chili
      { word: 'ehecatl', image: createSvgUrl('🌬️') }, // Wind
    ]
  }
};

let lastWordIndexes: { [lang: string]: { [level: number]: number } } = {
  'es-MX': {},
  'en-US': {},
  'nah': {},
};

export const getRandomWord = (level: number, lang: Language): Word => {
  const wordsForLevel = WORDS_DB[lang]?.[level];
  if (!wordsForLevel) {
    throw new Error(`No words found for language ${lang} and level ${level}`);
  }

  let randomIndex;
  // Ensure we don't repeat the same word twice in a row for a given level
  do {
    randomIndex = Math.floor(Math.random() * wordsForLevel.length);
  } while (wordsForLevel.length > 1 && randomIndex === lastWordIndexes[lang]?.[level]);
  
  if (!lastWordIndexes[lang]) {
    lastWordIndexes[lang] = {};
  }
  lastWordIndexes[lang][level] = randomIndex;
  return wordsForLevel[randomIndex];
};