
import { Language } from './i18n';

export interface LetterExample {
  word: string;
  image: string; // URL or base64 data URL
}

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

const ALPHABET_EXAMPLES: { [lang in Language]: { [letter: string]: LetterExample } } = {
  'es-MX': {
    'A': { word: 'Árbol', image: createSvgUrl('🌳') },
    'B': { word: 'Barco', image: createSvgUrl('⛵') },
    'C': { word: 'Casa', image: createSvgUrl('🏠') },
    'D': { word: 'Dado', image: createSvgUrl('🎲') },
    'E': { word: 'Estrella', image: createSvgUrl('⭐') },
    'F': { word: 'Flor', image: createSvgUrl('🌸') },
    'G': { word: 'Gato', image: createSvgUrl('🐈') },
    'H': { word: 'Helado', image: createSvgUrl('🍦') },
    'I': { word: 'Iglú', image: createSvgUrl('🧊') },
    'J': { word: 'Jirafa', image: createSvgUrl('🦒') },
    'K': { word: 'Koala', image: createSvgUrl('🐨') },
    'L': { word: 'Luna', image: createSvgUrl('🌙') },
    'M': { word: 'Manzana', image: createSvgUrl('🍎') },
    'N': { word: 'Nube', image: createSvgUrl('☁️') },
    'Ñ': { word: 'Ñandú', image: createSvgUrl('🦤') },
    'O': { word: 'Oso', image: createSvgUrl('🐻') },
    'P': { word: 'Pelota', image: createSvgUrl('⚽') },
    'Q': { word: 'Queso', image: createSvgUrl('🧀') },
    'R': { word: 'Ratón', image: createSvgUrl('🐁') },
    'S': { word: 'Sol', image: createSvgUrl('☀️') },
    'T': { word: 'Tigre', image: createSvgUrl('🐅') },
    'U': { word: 'Uvas', image: createSvgUrl('🍇') },
    'V': { word: 'Vaca', image: createSvgUrl('🐄') },
    'W': { word: 'Wafle', image: createSvgUrl('🧇') },
    'X': { word: 'Xilófono', image: createSvgUrl('🎹') },
    'Y': { word: 'Yoyo', image: createSvgUrl('🪀') },
    'Z': { word: 'Zapato', image: createSvgUrl('👟') },
  },
  'en-US': {
    'A': { word: 'Apple', image: createSvgUrl('🍎') },
    'B': { word: 'Ball', image: createSvgUrl('⚽') },
    'C': { word: 'Cat', image: createSvgUrl('🐈') },
    'D': { word: 'Dog', image: createSvgUrl('🐕') },
    'E': { word: 'Elephant', image: createSvgUrl('🐘') },
    'F': { word: 'Fish', image: createSvgUrl('🐟') },
    'G': { word: 'Goat', image: createSvgUrl('🐐') },
    'H': { word: 'Hat', image: createSvgUrl('🎩') },
    'I': { word: 'Ice cream', image: createSvgUrl('🍦') },
    'J': { word: 'Juice', image: createSvgUrl('🧃') },
    'K': { word: 'Key', image: createSvgUrl('🔑') },
    'L': { word: 'Lion', image: createSvgUrl('🦁') },
    'M': { word: 'Moon', image: createSvgUrl('🌙') },
    'N': { word: 'Nest', image: createSvgUrl('🪹') },
    'O': { word: 'Orange', image: createSvgUrl('🍊') },
    'P': { word: 'Pig', image: createSvgUrl('🐖') },
    'Q': { word: 'Queen', image: createSvgUrl('👑') },
    'R': { word: 'Rabbit', image: createSvgUrl('🐇') },
    'S': { word: 'Sun', image: createSvgUrl('☀️') },
    'T': { word: 'Tree', image: createSvgUrl('🌳') },
    'U': { word: 'Umbrella', image: createSvgUrl('☂️') },
    'V': { word: 'Violin', image: createSvgUrl('🎻') },
    'W': { word: 'Whale', image: createSvgUrl('🐋') },
    'X': { word: 'Xylophone', image: createSvgUrl('🎹') },
    'Y': { word: 'Yoyo', image: createSvgUrl('🪀') },
    'Z': { word: 'Zebra', image: createSvgUrl('🦓') },
  },
  'nah': { // 'ABCDEHIJKLMNÑOPSTUWXYZ'
    'A': { word: 'Atl', image: createSvgUrl('💧') },
    'B': { word: 'Burro', image: createSvgUrl('🐴') }, // Loanword
    'C': { word: 'Calli', image: createSvgUrl('🏠') },
    'D': { word: 'Durazno', image: createSvgUrl('🍑') }, // Loanword
    'E': { word: 'Ehecatl', image: createSvgUrl('🌬️') },
    'H': { word: 'Huacalli', image: createSvgUrl('📦') }, // Box/Crate
    'I': { word: 'Itzcuintli', image: createSvgUrl('🐕') },
    'J': { word: 'Xicalli', image: createSvgUrl('🥣') }, // Jicara/Bowl (uses X for J sound)
    'K': { word: 'Kuali', image: createSvgUrl('👍') }, // Good
    'L': { word: 'Limon', image: createSvgUrl('🍋') }, // Loanword
    'M': { word: 'Miztli', image: createSvgUrl('🐈') },
    'N': { word: 'Nantli', image: createSvgUrl('👩') }, // Mother
    'Ñ': { word: 'Ñandú', image: createSvgUrl('🦤') }, // Loanword, common placeholder
    'O': { word: 'Ocelotl', image: createSvgUrl('🐆') },
    'P': { word: 'Papalotl', image: createSvgUrl('🦋') },
    'S': { word: 'Sitlalli', image: createSvgUrl('⭐') },
    'T': { word: 'Tochtli', image: createSvgUrl('🐇') },
    'U': { word: 'Ulli', image: createSvgUrl('ゴム') }, // Rubber/gum (no good emoji)
    'W': { word: 'Wiwitl', image: createSvgUrl('⛏️') }, // A type of hoe/digging tool
    'X': { word: 'Xochitl', image: createSvgUrl('🌸') },
    'Y': { word: 'Yollotl', image: createSvgUrl('❤️') }, // Heart
    'Z': { word: 'Zanatl', image: createSvgUrl('🐦‍⬛') }, // A type of bird
  },
  'pt-BR': {
    'A': { word: 'Avião', image: createSvgUrl('✈️') },
    'B': { word: 'Bola', image: createSvgUrl('⚽') },
    'C': { word: 'Casa', image: createSvgUrl('🏠') },
    'D': { word: 'Dado', image: createSvgUrl('🎲') },
    'E': { word: 'Estrela', image: createSvgUrl('⭐') },
    'F': { word: 'Flor', image: createSvgUrl('🌸') },
    'G': { word: 'Gato', image: createSvgUrl('🐈') },
    'H': { word: 'Hambúrguer', image: createSvgUrl('🍔') },
    'I': { word: 'Ilha', image: createSvgUrl('🏝️') },
    'J': { word: 'Jacaré', image: createSvgUrl('🐊') },
    'K': { word: 'Kiwi', image: createSvgUrl('🥝') },
    'L': { word: 'Lua', image: createSvgUrl('🌙') },
    'M': { word: 'Maçã', image: createSvgUrl('🍎') },
    'N': { word: 'Nuvem', image: createSvgUrl('☁️') },
    'O': { word: 'Olho', image: createSvgUrl('👀') },
    'P': { word: 'Pato', image: createSvgUrl('🦆') },
    'Q': { word: 'Queijo', image: createSvgUrl('🧀') },
    'R': { word: 'Rato', image: createSvgUrl('🐁') },
    'S': { word: 'Sol', image: createSvgUrl('☀️') },
    'T': { word: 'Tigre', image: createSvgUrl('🐅') },
    'U': { word: 'Uva', image: createSvgUrl('🍇') },
    'V': { word: 'Vaca', image: createSvgUrl('🐄') },
    'W': { word: 'Wi-fi', image: createSvgUrl('📶') },
    'X': { word: 'Xícara', image: createSvgUrl('☕') },
    'Y': { word: 'Yoga', image: createSvgUrl('🧘') },
    'Z': { word: 'Zebra', image: createSvgUrl('🦓') },
  },
};

export const getExampleForLetter = (letter: string, lang: Language): LetterExample | null => {
  return ALPHABET_EXAMPLES[lang]?.[letter.toUpperCase()] || null;
};
