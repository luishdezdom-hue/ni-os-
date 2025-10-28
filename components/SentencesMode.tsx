import React, { useState, useEffect, useCallback } from 'react';
import { Sentence, getSentencesForLevel } from '../services/sentenceService';
import { speakText, playSound, preloadSpeech } from '../services/soundService';
import { SpeakerWaveIcon, LockClosedIcon } from './Icons';
import { getTranslation, Language } from '../services/i18n';
import { Character } from '../services/characterService';

type GamePhase = 'selection' | 'playing' | 'results';
type AnswerStatus = 'playing' | 'correct' | 'incorrect';

const SENTENCES_PER_LEVEL = 5;
const PASSING_SCORE = 80;
const TOTAL_LEVELS = 2; // Based on the data in sentenceService
const LOCAL_STORAGE_KEY = 'reconocimientoLetrasProgresoOraciones';


interface SentencesModeProps {
  language: Language;
  character: Character;
}

export const SentencesMode: React.FC<SentencesModeProps> = ({ language, character }) => {
  const [phase, setPhase] = useState<GamePhase>('selection');
  const [level, setLevel] = useState<number | null>(null);
  const [currentSentence, setCurrentSentence] = useState<Sentence | null>(null);
  const [options, setOptions] = useState<{ word: string; image: string; }[]>([]);
  const [status, setStatus] = useState<AnswerStatus>('playing');
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  const [sessionSentences, setSessionSentences] = useState<Sentence[]>([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [sessionCorrectCount, setSessionCorrectCount] = useState(0);
  const [highestUnlockedLevel, setHighestUnlockedLevel] = useState(1);
  const [lastScore, setLastScore] = useState(0);

  const T = (key: string, replacements?: {[key: string]: string}) => getTranslation(language, key, replacements);

  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        if (typeof parsed === 'number' && parsed > 0) {
          setHighestUnlockedLevel(parsed);
        } else {
          setHighestUnlockedLevel(1);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(1));
        }
      }
    } catch (error) {
      console.error("Failed to load progress:", error);
      setHighestUnlockedLevel(1);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(1));
    }
  }, []);

  const updateProgress = useCallback((newHighestLevel: number) => {
    setHighestUnlockedLevel(newHighestLevel);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newHighestLevel));
    } catch (error) {
      console.error("Failed to save progress:", error);
    }
  }, []);

  const startLevel = useCallback((selectedLevel: number) => {
    playSound('click');
    setPhase('playing');
    setLevel(selectedLevel);
    setStatus('playing');
    setSelectedWord(null);
    setCurrentSentenceIndex(0);
    setSessionCorrectCount(0);
    
    const newSessionSentences = getSentencesForLevel(selectedLevel, language, SENTENCES_PER_LEVEL);
    setSessionSentences(newSessionSentences);
    
    const firstSentence = newSessionSentences[0];
    setCurrentSentence(firstSentence);

    const gappedText = firstSentence.text.replace('{word}', '...');
    preloadSpeech(gappedText, character.voiceName, language);
    
    setOptions([...firstSentence.distractors, { word: firstSentence.correctWord, image: firstSentence.correctImage }].sort(() => Math.random() - 0.5));
  }, [language, character.voiceName]);


  const handleOptionClick = (word: string) => {
    // FIX: The original `status === 'correct'` check caused a TypeScript error because
    // the button calling this function is disabled when `status` is 'correct'.
    // The redundant checks have been removed to fix the error and simplify the logic.
    if (!currentSentence) {
      return;
    }

    setSelectedWord(word);

    if (word === currentSentence.correctWord) {
      // Only increment score if they haven't gotten it right yet for this turn.
      // Since buttons are disabled on 'correct', this logic effectively means
      // we give a point even if they retry after an incorrect answer.
      if (status !== 'correct') {
        setSessionCorrectCount((prev) => prev + 1);
      }
      setStatus('correct');
      playSound('success');
      const correctText = currentSentence.text.replace(
        '{word}',
        currentSentence.correctWord,
      );
      speakText(correctText, character.voiceName, language);
    } else {
      setStatus('incorrect');
      playSound('error');
    }
  };
  
  const goToNextSentence = () => {
    playSound('click');
    const nextIndex = currentSentenceIndex + 1;

    if (nextIndex < sessionSentences.length) {
        setCurrentSentenceIndex(nextIndex);
        const nextSentence = sessionSentences[nextIndex];
        setCurrentSentence(nextSentence);
        const gappedText = nextSentence.text.replace('{word}', '...');
        preloadSpeech(gappedText, character.voiceName, language);
        setOptions([...nextSentence.distractors, { word: nextSentence.correctWord, image: nextSentence.correctImage }].sort(() => Math.random() - 0.5));
        setStatus('playing');
        setSelectedWord(null);
    } else {
        // Level finished
        const score = Math.round((sessionCorrectCount / SENTENCES_PER_LEVEL) * 100);
        setLastScore(score);
        setPhase('results');
        
        const nextLevel = level! + 1;
        if (score >= PASSING_SCORE && nextLevel > highestUnlockedLevel && nextLevel <= TOTAL_LEVELS) {
            updateProgress(nextLevel);
            playSound('switch');
        }
    }
  };

  const handleSpeakSentence = () => {
    if(!currentSentence) return;
    playSound('click');
    const textToSpeak = currentSentence.text.replace('{word}', '...');
    speakText(textToSpeak, character.voiceName, language);
  }
  
  const handleBackToSelection = () => {
    playSound('click');
    setPhase('selection');
  };

  if (phase === 'selection') {
    return (
      <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg p-8 w-full max-w-2xl mx-auto flex flex-col items-center gap-6 animate-fadeIn">
        <h2 className="text-3xl font-bold text-slate-800">{T('sentencesMode')}</h2>
        
        <div className="w-full">
            <h3 className="text-2xl font-semibold text-slate-700 mb-4 text-center border-b-2 pb-2">{T('completeTheSentence')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2].map(l => ( // Only show 2 levels as defined in service
                    <button key={`level-${l}`} onClick={() => startLevel(l)} disabled={l > highestUnlockedLevel} className="p-6 text-white font-bold text-xl rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600">
                        {l > highestUnlockedLevel && <LockClosedIcon className="w-5 h-5" />}
                        {T('level', { level: l.toString() })}
                    </button>
                ))}
            </div>
        </div>
      </div>
    );
  }

  if (phase === 'results') {
    const passed = lastScore >= PASSING_SCORE;
    const isLastLevel = level === TOTAL_LEVELS;

    return (
      <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg p-8 w-full max-w-lg mx-auto flex flex-col items-center gap-4 text-center animate-scaleIn">
        <h2 className="text-3xl font-bold text-slate-800">{T('levelCompleted', { level: level!.toString() })}</h2>
        <p className="text-xl text-slate-600">{T('yourScore')}</p>
        <p className={`text-6xl font-black ${passed ? 'text-green-500' : 'text-red-500'}`}>{lastScore}%</p>
        {passed ? (
          <>
            <p className="text-xl font-semibold text-green-600 mt-2">{T('excellentWork')}</p>
            {!isLastLevel && <p className="text-slate-600">{T('unlockedNextLevel')}</p>}
          </>
        ) : (
          <p className="text-xl font-semibold text-orange-500 mt-2">{T('almostThere', { score: PASSING_SCORE.toString() })}</p>
        )}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button onClick={handleBackToSelection} className="px-6 py-3 bg-slate-500 text-white font-semibold rounded-lg shadow-md hover:bg-slate-600 transition-all">
            {T('backToLevels')}
          </button>
          {!passed && (
             <button onClick={() => startLevel(level!)} className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg shadow-md hover:bg-orange-600 transition-all">
                {T('retry')}
             </button>
          )}
          {passed && !isLastLevel && (
             <button onClick={() => startLevel(level! + 1)} disabled={(level! + 1) > highestUnlockedLevel} className="px-6 py-3 bg-purple-500 text-white font-semibold rounded-lg shadow-md hover:bg-purple-600 transition-all disabled:bg-slate-400 disabled:cursor-not-allowed">
                {T('nextLevel')}
             </button>
          )}
        </div>
      </div>
    );
  }

  if (!currentSentence) {
    return null; // Should not happen in playing phase
  }
  
  const parts = currentSentence.text.split('{word}');
  const blank = (
    <span className={`inline-block text-center border-b-2 mx-2 transition-all duration-500 ${
      status === 'correct' ? 'border-purple-500 bg-purple-100 text-purple-700 px-2 rounded' : 'border-slate-400'
    }`} style={{minWidth: '100px'}}>
      {status === 'correct' ? currentSentence.correctWord : '...'}
    </span>
  );
  
  return (
    <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg p-8 w-full max-w-2xl mx-auto flex flex-col items-center gap-6 animate-fadeIn">
      <div className="w-full flex justify-between items-center">
        <button onClick={handleBackToSelection} className="text-slate-600 hover:text-slate-800 font-semibold">&larr; {T('back')}</button>
        <div className="text-right">
            <p className="font-bold text-slate-700">{T('level', { level: level!.toString() })}</p>
            <p className="text-sm text-slate-500">{T('sentenceOf', { current: (currentSentenceIndex + 1).toString(), total: SENTENCES_PER_LEVEL.toString() })}</p>
        </div>
      </div>

      <div className="w-full bg-slate-100/70 p-6 rounded-lg shadow-inner">
          <p className="text-2xl md:text-3xl text-slate-800 font-semibold text-center leading-relaxed">
            {parts[0]}
            {blank}
            {parts[1]}
          </p>
      </div>
      
      <button 
        onClick={handleSpeakSentence}
        className="p-3 bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200 transition-all self-center"
        aria-label={T('listenToWord')}
      >
        <SpeakerWaveIcon className="w-8 h-8" />
      </button>

      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {options.map((option) => {
          const isSelected = selectedWord === option.word;
          const isCorrectAnswer = currentSentence.correctWord === option.word;
          
          let ringColor = 'ring-transparent';
          if (status === 'correct' && isCorrectAnswer) {
            ringColor = 'ring-purple-500';
          } else if (isSelected) {
            ringColor = status === 'incorrect' ? 'ring-red-500' : 'ring-transparent';
          }
          
          return (
            <button
              key={option.word}
              onClick={() => handleOptionClick(option.word)}
              disabled={status === 'correct'}
              className={`p-4 bg-white rounded-2xl shadow-md cursor-pointer transition-all duration-300 transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-80 ring-4 ${ringColor} ${status === 'incorrect' && isSelected ? 'animate-shake' : ''}`}
            >
              <img src={option.image} alt={option.word} className="w-full h-auto aspect-square object-cover rounded-lg" />
            </button>
          );
        })}
      </div>
      
      <div className="h-20 mt-4 flex items-center justify-center">
        {status === 'correct' && (
            <div className="text-center animate-scaleIn flex flex-col items-center gap-4">
                <p className="text-2xl font-bold text-green-600">{T('correctExclamation')}</p>
                <button onClick={goToNextSentence} className="px-8 py-3 bg-purple-500 text-white font-semibold rounded-lg shadow-md hover:bg-purple-600 transition-all">
                  {currentSentenceIndex < SENTENCES_PER_LEVEL - 1 ? T('nextSentence') : T('viewResults')}
                </button>
            </div>
        )}
         {status === 'incorrect' && selectedWord && (
            <div className="text-center animate-shake">
                <p className="text-xl font-semibold text-orange-600">{T('tryAgain')}</p>
            </div>
        )}
      </div>
    </div>
  );
};