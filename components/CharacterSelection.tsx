import React, { useState, useEffect } from 'react';
import { CHARACTERS, Character } from '../services/characterService';
import { playSound, speakText, preloadSpeech, ensureAudioIsCached } from '../services/soundService';
import { CheckCircleIcon } from './Icons';
import { getTranslation, Language } from '../services/i18n';

interface CharacterSelectionProps {
  onCharacterSelect: (character: Character) => void;
  language: Language;
}

export const CharacterSelection: React.FC<CharacterSelectionProps> = ({ onCharacterSelect, language }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const T = (key: string, replacements?: {[key: string]: string}) => getTranslation(language, key, replacements);

  useEffect(() => {
    // To meet the "0 second" playback requirement for Eli, we prioritize loading his
    // greeting audio. This `async` function is called immediately, ensuring
    // we 'await' the audio cache for Eli.
    const prioritizeEliAudio = async () => {
      const eli = CHARACTERS.find(c => c.id === 'eli');
      if (eli) {
        await ensureAudioIsCached(T('charGreeting', { name: eli.name }), eli.voiceName, language);
      }
    };

    prioritizeEliAudio();
    
    // Preload greetings for all other characters in the background to make selection feel responsive.
    CHARACTERS.forEach(char => {
      if (char.id !== 'eli') {
        preloadSpeech(T('charGreeting', { name: char.name }), char.voiceName, language);
      }
    });
  }, [language, T]);

  const handleSelect = (character: Character) => {
    playSound('click');
    setSelectedId(character.id);
    // This will now be faster due to preloading, especially for Eli.
    speakText(T('charGreeting', { name: character.name }), character.voiceName, language);
  };

  const handleStart = () => {
    const selectedCharacter = CHARACTERS.find(c => c.id === selectedId);
    if (selectedCharacter) {
      onCharacterSelect(selectedCharacter);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-200 to-purple-300 flex flex-col items-center justify-center p-4 font-sans animate-fadeIn">
      <div className="w-full max-w-3xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight">
          {T('chooseYourGuide')}
          {language !== 'es-MX' && <span className="block text-lg font-normal text-slate-500 mt-1">({getTranslation('es-MX', 'chooseYourGuide')})</span>}
        </h1>
        <p className="text-slate-600 mt-2 text-lg mb-8">
          {T('selectACharacter')}
          {language !== 'es-MX' && <span className="block text-sm font-normal text-slate-500 mt-1">({getTranslation('es-MX', 'selectACharacter')})</span>}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          {CHARACTERS.map(char => (
            <div
              key={char.id}
              onClick={() => handleSelect(char)}
              className={`relative p-4 bg-white/80 rounded-2xl shadow-lg cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                selectedId === char.id ? 'ring-4 ring-purple-500 shadow-xl' : 'ring-2 ring-transparent'
              }`}
            >
              <img src={char.avatar} alt={char.name} className="w-full h-auto rounded-lg mb-3" />
              <p className="font-bold text-slate-700 text-sm md:text-base">{char.name}</p>
              {selectedId === char.id && (
                <div className="absolute -top-3 -right-3 bg-white rounded-full">
                  <CheckCircleIcon className="w-8 h-8 text-purple-500" />
                </div>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={handleStart}
          disabled={!selectedId}
          className="px-12 py-4 bg-purple-500 text-white font-bold text-xl rounded-lg shadow-lg hover:bg-purple-600 transition-all transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:scale-100"
        >
          <span className="text-center">
            {T('begin')}
            {language !== 'es-MX' && <span className="block text-sm font-normal mt-1 opacity-80">({getTranslation('es-MX', 'begin')})</span>}
          </span>
        </button>
      </div>
    </div>
  );
};