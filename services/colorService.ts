
export interface Color {
  name: string;
  hex: string;
}

export type Language = 'es-MX' | 'en-US' | 'nah' | 'pt-BR';

const COLORS_DB: { [lang in Language]: Color[] } = {
  'es-MX': [
    { name: 'Rojo', hex: '#FF0000' },
    { name: 'Amarillo', hex: '#FFFF00' },
    { name: 'Azul', hex: '#0000FF' },
    { name: 'Verde', hex: '#008000' },
    { name: 'Naranja', hex: '#FFA500' },
    { name: 'Morado', hex: '#800080' },
    { name: 'Negro', hex: '#000000' },
    { name: 'Blanco', hex: '#FFFFFF' },
    { name: 'Gris', hex: '#808080' },
    { name: 'Café', hex: '#A52A2A' },
    { name: 'Rosa', hex: '#FFC0CB' },
    { name: 'Celeste', hex: '#87CEEB' },
    { name: 'Dorado', hex: '#FFD700' },
    { name: 'Plateado', hex: '#C0C0C0' },
    { name: 'Turquesa', hex: '#40E0D0' },
    { name: 'Magenta', hex: '#FF00FF' },
  ],
  'en-US': [
    { name: 'Red', hex: '#FF0000' },
    { name: 'Yellow', hex: '#FFFF00' },
    { name: 'Blue', hex: '#0000FF' },
    { name: 'Green', hex: '#008000' },
    { name: 'Orange', hex: '#FFA500' },
    { name: 'Purple', hex: '#800080' },
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Gray', hex: '#808080' },
    { name: 'Brown', hex: '#A52A2A' },
    { name: 'Pink', hex: '#FFC0CB' },
    { name: 'Sky Blue', hex: '#87CEEB' },
    { name: 'Gold', hex: '#FFD700' },
    { name: 'Silver', hex: '#C0C0C0' },
    { name: 'Turquoise', hex: '#40E0D0' },
    { name: 'Magenta', hex: '#FF00FF' },
  ],
  'nah': [
    { name: 'Chichiltic', hex: '#FF0000' }, // Red
    { name: 'Costic', hex: '#FFFF00' },     // Yellow
    { name: 'Texotic', hex: '#0000FF' },    // Blue
    { name: 'Xoxoctic', hex: '#008000' },  // Green
    { name: 'Chichilcostic', hex: '#FFA500' }, // Orange
    { name: 'Camohtic', hex: '#800080' }, // Purple
    { name: 'Tliltic', hex: '#000000' },    // Black
    { name: 'Iztac', hex: '#FFFFFF' },      // White
    { name: 'Nextic', hex: '#808080' },     // Gray
    { name: 'Camiltic', hex: '#A52A2A' },  // Brown
    { name: 'Tlapaltic', hex: '#FFC0CB' }, // Pink
    { name: 'Xoxouhtic', hex: '#87CEEB' }, // Sky blue-ish
    { name: 'Teocuitlatl', hex: '#FFD700' }, // Gold
    { name: 'Iztacteocuitlatl', hex: '#C0C0C0' }, // Silver
    { name: 'Xiuhtic', hex: '#40E0D0' }, // Turquoise
    { name: 'Ixnezcayotl', hex: '#FF00FF' }, // Magenta
  ],
  'pt-BR': [
    { name: 'Vermelho', hex: '#FF0000' },
    { name: 'Amarelo', hex: '#FFFF00' },
    { name: 'Azul', hex: '#0000FF' },
    { name: 'Verde', hex: '#008000' },
    { name: 'Laranja', hex: '#FFA500' },
    { name: 'Roxo', hex: '#800080' },
    { name: 'Preto', hex: '#000000' },
    { name: 'Branco', hex: '#FFFFFF' },
    { name: 'Cinza', hex: '#808080' },
    { name: 'Marrom', hex: '#A52A2A' },
    { name: 'Rosa', hex: '#FFC0CB' },
    { name: 'Azul Celeste', hex: '#87CEEB' },
    { name: 'Dourado', hex: '#FFD700' },
    { name: 'Prateado', hex: '#C0C0C0' },
    { name: 'Turquesa', hex: '#40E0D0' },
    { name: 'Magenta', hex: '#FF00FF' },
  ],
};

const LEVEL_MAP: { [level: number]: number[] } = {
  1: [0, 1, 2], // Red, Yellow, Blue
  2: [3, 4, 5], // Green, Orange, Purple
  3: [6, 7],    // Black, White
  4: [8, 9, 10], // Gray, Brown, Pink
  5: [0, 1, 2, 3], // Lvl 1 + Green
  6: [4, 5, 6, 7], // Lvl 2 + Neutrals
  7: [11, 12, 13], // Sky Blue, Gold, Silver
  8: [14, 15], // Turquoise, Magenta
};

const MATCHING_LEVEL_MAP: { [level: number]: { count: number, indices: number[] } } = {
    1: { count: 3, indices: [0, 1, 2] }, // Red, Yellow, Blue
    2: { count: 4, indices: [0, 1, 2, 3] }, // + Green
    3: { count: 5, indices: [0, 1, 2, 3, 4, 5] }, // + Orange, Purple
    4: { count: 6, indices: [0, 1, 2, 3, 4, 5, 6, 7] }, // + Black, White
};

export const getAllColors = (lang: Language): Color[] => {
    return COLORS_DB[lang];
}

export const getColorsForLevel = (level: number, lang: Language, count: number): Color[] => {
    const indices = LEVEL_MAP[level] || LEVEL_MAP[1];
    const pool = indices.map(i => COLORS_DB[lang][i]);

    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

export const getMatchingColorsForLevel = (level: number, lang: Language): Color[] => {
    const levelInfo = MATCHING_LEVEL_MAP[level] || MATCHING_LEVEL_MAP[1];
    const pool = levelInfo.indices.map(i => COLORS_DB[lang][i]);

    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, levelInfo.count);
};
