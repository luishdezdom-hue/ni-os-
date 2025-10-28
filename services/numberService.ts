// services/numberService.ts

import { Language } from './i18n';

export interface NumberData {
  digit: number;
  name: string;
}

const NUMBERS_DB: { [lang in Language]: { [key: number]: string } } = {
  'es-MX': {
    0: 'cero', 1: 'uno', 2: 'dos', 3: 'tres', 4: 'cuatro', 5: 'cinco', 6: 'seis', 7: 'siete', 8: 'ocho', 9: 'nueve', 10: 'diez',
    11: 'once', 12: 'doce', 13: 'trece', 14: 'catorce', 15: 'quince', 16: 'dieciséis', 17: 'diecisiete', 18: 'dieciocho', 19: 'diecinueve', 20: 'veinte',
  },
  'en-US': {
    0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten',
    11: 'eleven', 12: 'twelve', 13: 'thirteen', 14: 'fourteen', 15: 'fifteen', 16: 'sixteen', 17: 'seventeen', 18: 'eighteen', 19: 'nineteen', 20: 'twenty',
  },
  'nah': {
    0: 'ahtle', 1: 'ce', 2: 'ome', 3: 'yei', 4: 'nahui', 5: 'macuilli', 6: 'chicuace', 7: 'chicome', 8: 'chicuei', 9: 'chicnahui', 10: 'mahtlactli',
    11: 'mahtlactli once', 12: 'mahtlactli omome', 13: 'mahtlactli omey', 14: 'mahtlactli onnahui', 15: 'caxtolli', 16: 'caxtolli once', 17: 'caxtolli omome', 18: 'caxtolli omey', 19: 'caxtolli onnahui', 20: 'cempohualli',
  },
};

const LEVEL_MAP: { [level: number]: number[] } = {
    1: [1, 2, 3, 4, 5],
    2: [6, 7, 8, 9, 10],
    3: [11, 12, 13, 14, 15],
    4: [16, 17, 18, 19, 20],
};

export const getNumbersForLevel = (level: number, lang: Language, count: number): NumberData[] => {
    const numberDigits = LEVEL_MAP[level] || LEVEL_MAP[1];
    const pool: NumberData[] = numberDigits.map(digit => ({
        digit: digit,
        name: NUMBERS_DB[lang][digit],
    }));

    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

export const getNumberData = (digit: number, lang: Language): NumberData | null => {
    const name = NUMBERS_DB[lang]?.[digit];
    if (name) {
        return { digit, name };
    }
    return null;
}
