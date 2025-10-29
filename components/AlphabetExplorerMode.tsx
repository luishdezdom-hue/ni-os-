

import React, { useState, useEffect } from 'react';
import { Language } from '../services/i18n';
import { Character } from '../services/characterService';
import { getExampleForLetter, LetterExample } from '../services/alphabetService';
import { speakText, playSound, primeAlphabetCache } from '../services/soundService';
import { getTranslation } from '../services/i18n';
import { SpeakerWaveIcon } from './Icons';
import { TranslatedText } from './TranslatedText';

interface AlphabetExplorerModeProps {
  language: Language;
  character: Character;
  alphabet: string[];
}

export const AlphabetExplorerMode: React.FC<AlphabetExplorerModeProps> = ({ language, character, alphabet }) => {
    const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
    const [example, setExample] = useState<LetterExample | null>(null);
    const T = (key: string, replacements?: {[key: string]: string}) => getTranslation(language, key, replacements);

    useEffect(() => {
        // Prime the audio cache for the entire alphabet when the component loads or language/character changes.
        // This will make subsequent playback instant.
        if (alphabet.length > 0) {
            primeAlphabetCache(alphabet, character.voiceName, language);
        }
    }, [alphabet, character, language]);

    const handleSelectLetter = (letter: string) => {
        playSound('click');
        const letterExample = getExampleForLetter(letter, language);
        setSelectedLetter(letter);
        setExample(letterExample);
        
        // Play the audio immediately upon selection.
        // The audio should be cached from the useEffect hook above, so it will be fast.
        if (letterExample) {
            const textToSay = T('theLetterIs', { letter: letter, word: letterExample.word });
            speakText(textToSay, character.voiceName, language);
        } else {
            speakText(letter, character.voiceName, language);
        }
    };

    const handleSpeak = () => {
        playSound('click'); // Add sound for consistency
        if (selectedLetter && example) {
            const textToSay = T('theLetterIs', { letter: selectedLetter, word: example.word });
            speakText(textToSay, character.voiceName, language);
        } else if (selectedLetter) {
            speakText(selectedLetter, character.voiceName, language);
        }
    };
    
    useEffect(() => {
        // Reset the view when the language changes
        setSelectedLetter(null);
        setExample(null);
    }, [language]);

    const renderWordWithHighlight = (word: string, letter: string) => {
        const firstChar = word.charAt(0);
        // Compare case-insensitively
        if (firstChar.localeCompare(letter, undefined, { sensitivity: 'accent' }) === 0) {
            return <p className="text-4xl font-bold text-slate-700 mt-4"><span className="text-purple-600">{firstChar}</span>{word.slice(1)}</p>;
        }
        return <p className="text-4xl font-bold text-slate-700 mt-4">{word}</p>;
    };

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-1/2 bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg p-6">
                <div className="grid grid-cols-5 md:grid-cols-6 gap-3">
                    {alphabet.map(letter => (
                        <button 
                            key={letter}
                            onClick={() => handleSelectLetter(letter)}
                            className={`aspect-square flex items-center justify-center font-bold text-2xl rounded-lg shadow-md transition-all transform hover:scale-110 ${selectedLetter === letter ? 'bg-purple-500 text-white' : 'bg-white text-slate-700 hover:bg-purple-100'}`}
                            aria-label={`Seleccionar letra ${letter}`}
                        >
                            {letter}
                        </button>
                    ))}
                </div>
            </div>
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg p-8 min-h-[300px] lg:min-h-0">
                {!selectedLetter ? (
                    <div className="text-center text-slate-600 animate-fadeIn">
                        <p className="text-2xl font-semibold">
                            <TranslatedText language={language} textKey="selectALetterToLearn" />
                        </p>
                    </div>
                ) : (
                    <div className="text-center animate-scaleIn">
                        <div className="flex items-center justify-center gap-4">
                            <p className="text-9xl md:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 leading-none">
                                {selectedLetter}
                            </p>
                             <button
                                onClick={handleSpeak}
                                className="p-3 bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200 transition-all self-center"
                                aria-label={T('listenToLetter')}
                            >
                                <SpeakerWaveIcon className="w-8 h-8" />
                            </button>
                        </div>

                        {example ? (
                            <>
                                {renderWordWithHighlight(example.word, selectedLetter)}
                                <img src={example.image} alt={example.word} className="w-40 h-40 object-cover rounded-lg shadow-md mx-auto mt-6" />
                            </>
                        ) : (
                            <p className="mt-4 text-slate-500">No example found.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
