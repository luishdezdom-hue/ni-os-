import React from 'react';
import { speakText, playSound } from '../services/soundService';
import { getNumberData } from '../services/numberService';
import { getTranslation, Language } from '../services/i18n';
import { Character } from '../services/characterService';
import { ArrowLeftIcon } from './Icons';

interface NumberIntroductionModeProps {
  language: Language;
  character: Character;
  onBack: () => void;
}

const numbers_to_show = Array.from({ length: 21 }, (_, i) => i); // 0 to 20

export const NumberIntroductionMode: React.FC<NumberIntroductionModeProps> = ({ language, character, onBack }) => {
  const T = (key: string, replacements?: {[key: string]: string}) => getTranslation(language, key, replacements);

  const handleNumberClick = (digit: number) => {
    playSound('click');
    const numberData = getNumberData(digit, language);
    if (numberData) {
      speakText(numberData.name, character.voiceName, language);
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg p-8 w-full max-w-4xl mx-auto flex flex-col items-center gap-6 animate-fadeIn">
      <div className="w-full flex justify-between items-center mb-4">
        <button onClick={onBack} className="text-slate-600 hover:text-slate-800 font-semibold flex items-center gap-2">
            <ArrowLeftIcon className="w-5 h-5" />
            <span>{T('back')}</span>
        </button>
        <h2 className="text-3xl font-bold text-slate-800 text-center">
            {T('learnNumbersTitle')}
        </h2>
        <div className="w-24"></div>
      </div>
      <p className="text-slate-600 text-lg text-center">
        {T('learnNumbersDesc')}
      </p>

      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-4">
        {numbers_to_show.map((num) => (
          <button
            key={num}
            onClick={() => handleNumberClick(num)}
            className="p-4 bg-white rounded-xl shadow-md text-purple-600 font-bold text-4xl aspect-square flex items-center justify-center transition-transform transform hover:scale-110 hover:bg-purple-50"
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
};