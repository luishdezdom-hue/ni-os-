import React, { useState } from 'react';
import { CHARACTERS, Character } from '../services/characterService';
import { playSound, speakText } from '../services/soundService';
import { CheckCircleIcon } from './Icons';
import { getTranslation, Language } from '../services/i18n';

interface CharacterSelectionProps {
  onCharacterSelect: (character: Character) => void;
  language: Language;
}

export const CharacterSelection: React.FC<CharacterSelectionProps> = ({ onCharacterSelect, language }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const T = (key: string, replacements?: {[key: string]: string}) => getTranslation(language, key, replacements);

  const handleSelect = (character: Character) => {
    playSound('click');
    setSelectedId(character.id);
    speakText(T('charGreeting', { name: character.name }), character.voiceName, language);
  };

  const handleStart = () => {
    const selectedCharacter = CHARACTERS.find(c => c.id === selectedId);
    if (selectedCharacter) {
      onCharacterSelect(selectedCharacter);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-emerald-200 flex flex-col items-center justify-center p-4 font-sans animate-fadeIn">
      <div className="w-full max-w-3xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight">
          {T('chooseYourGuide')}
        </h1>
        <p className="text-slate-600 mt-2 text-lg mb-8">
          {T('selectACharacter')}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          {CHARACTERS.map(char => (
            <div
              key={char.id}
              onClick={() => handleSelect(char)}
              className={`relative p-4 bg-white/80 rounded-2xl shadow-lg cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                selectedId === char.id ? 'ring-4 ring-green-500 shadow-xl' : 'ring-2 ring-transparent'
              }`}
            >
              <img src={char.avatar} alt={char.name} className="w-full h-auto rounded-lg mb-3" />
              <p className="font-bold text-slate-700 text-sm md:text-base">{char.name}</p>
              {selectedId === char.id && (
                <div className="absolute -top-3 -right-3 bg-white rounded-full">
                  <CheckCircleIcon className="w-8 h-8 text-green-500" />
                </div>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={handleStart}
          disabled={!selectedId}
          className="px-12 py-4 bg-green-600 text-white font-bold text-xl rounded-lg shadow-lg hover:bg-green-700 transition-all transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:scale-100"
        >
          {T('begin')}
        </button>
      </div>
    </div>
  );
};
