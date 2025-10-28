import React, { useState, useEffect, useCallback } from 'react';
import { Sentence, getRandomSentence } from '../services/sentenceService';
import { speakText, playSound, preloadSpeech } from '../services/soundService';
import { SpeakerWaveIcon } from './Icons';
import { getTranslation, Language } from '../services/i18n';
import { Character } from '../services/characterService';

type AnswerStatus = 'playing' | 'correct' | 'incorrect';

interface SentencesModeProps {
  language: Language;
  character: Character;
}

export const SentencesMode: React.FC<SentencesModeProps> = ({ language, character }) => {
  const [currentSentence, setCurrentSentence] = useState<Sentence | null>(null);
  const [options, setOptions] = useState<{ word: string; image: string; }[]>([]);
  const [status, setStatus] = useState<AnswerStatus>('playing');
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  const T = (key: string, replacements?: {[key: string]: string}) => getTranslation(language, key, replacements);

  const loadNewSentence = useCallback(() => {
    setStatus('playing');
    setSelectedWord(null);
    const newSentence = getRandomSentence(language);
    setCurrentSentence(newSentence);
    
    // Preload both the gapped and the correct sentence audio for faster playback.
    const gappedText = newSentence.text.replace('{word}', '...');
    const correctText = newSentence.text.replace('{word}', newSentence.correctWord);
    preloadSpeech(gappedText, character.voiceName, language);
    preloadSpeech(correctText, character.voiceName, language);

    // Shuffle options
    const allOptions = [...newSentence.distractors, { word: newSentence.correctWord, image: newSentence.correctImage }];
    setOptions(allOptions.sort(() => Math.random() - 0.5));
  }, [language, character]);

  useEffect(() => {
    loadNewSentence();
  }, [loadNewSentence]);

  const handleOptionClick = (word: string) => {
    if (status !== 'playing' || !currentSentence) return;
    
    setSelectedWord(word);
    
    if (word === currentSentence.correctWord) {
      setStatus('correct');
      playSound('success');
      // This should be fast now due to preloading in loadNewSentence
      speakText(currentSentence.text.replace('{word}', currentSentence.correctWord), character.voiceName, language);
      setTimeout(() => {
        loadNewSentence();
      }, 2500);
    } else {
      setStatus('incorrect');
      playSound('error');
    }
  };
  
  const handleSpeakSentence = () => {
    if(!currentSentence) return;
    playSound('click');
    // This should also be fast due to preloading
    const textToSpeak = currentSentence.text.replace('{word}', '...');
    speakText(textToSpeak, character.voiceName, language);
  }

  const renderSentence = () => {
    if (!currentSentence) return null;

    const parts = currentSentence.text.split('{word}');
    const blank = (
      <span className={`inline-block text-center border-b-2 mx-2 transition-all duration-500 ${
        status === 'correct' ? 'border-green-500 bg-green-100 text-green-700 px-2 rounded' : 'border-slate-400'
      }`} style={{minWidth: '100px'}}>
        {status === 'correct' ? currentSentence.correctWord : '...'}
      </span>
    );

    return (
      <p className="text-2xl md:text-3xl text-slate-800 font-semibold text-center leading-relaxed">
        {parts[0]}
        {blank}
        {parts[1]}
      </p>
    );
  };

  if (!currentSentence) {
    return null; // or a loading state
  }
  
  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg p-8 w-full max-w-2xl mx-auto flex flex-col items-center gap-6 animate-fadeIn">
      <h2 className="text-3xl font-bold text-slate-800">{T('sentencesMode')}</h2>
      <p className="text-slate-600 text-center">{T('selectTheCorrectImage')}</p>

      <div className="w-full bg-slate-100/70 p-6 rounded-lg shadow-inner">
          {renderSentence()}
      </div>
      
      <button 
        onClick={handleSpeakSentence}
        className="p-3 bg-sky-100 text-sky-600 rounded-full hover:bg-sky-200 transition-all self-center"
        aria-label={T('listenToWord')}
      >
        <SpeakerWaveIcon className="w-8 h-8" />
      </button>

      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {options.map((option) => {
          const isSelected = selectedWord === option.word;
          const isCorrect = currentSentence.correctWord === option.word;
          
          let ringColor = 'ring-transparent';
          if (isSelected) {
            ringColor = status === 'correct' ? 'ring-green-500' : 'ring-red-500';
          } else if (status === 'correct' && isCorrect) {
             ringColor = 'ring-green-500';
          }
          
          return (
            <button
              key={option.word}
              onClick={() => handleOptionClick(option.word)}
              disabled={status !== 'playing'}
              className={`p-4 bg-white rounded-2xl shadow-md cursor-pointer transition-all duration-300 transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70 ring-4 ${ringColor} ${status === 'incorrect' && isSelected ? 'animate-shake' : ''}`}
            >
              <img src={option.image} alt={option.word} className="w-full h-auto aspect-square object-cover rounded-lg" />
            </button>
          );
        })}
      </div>
      
      <div className="h-12 mt-4">
        {status === 'correct' && (
            <div className="text-center animate-scaleIn">
                <p className="text-2xl font-bold text-green-600">{T('correctExclamation')}</p>
            </div>
        )}
         {status === 'incorrect' && (
            <div className="text-center animate-shake">
                <p className="text-xl font-semibold text-orange-600">{T('tryAgain')}</p>
            </div>
        )}
      </div>
    </div>
  );
};