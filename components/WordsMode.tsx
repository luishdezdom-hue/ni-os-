import React, { useState, useEffect, useCallback } from 'react';
import { Word, getRandomWord, Language as WordLanguage } from '../services/wordService';
import { speakText, playSound, preloadSpeech } from '../services/soundService';
import { SpeakerWaveIcon, LockClosedIcon, CheckCircleIcon } from './Icons';
import { getTranslation, Language } from '../services/i18n';
import { Character } from '../services/characterService';

type GamePhase = 'selection' | 'base' | 'advanced' | 'results';
type AnswerStatus = 'playing' | 'correct' | 'incorrect';

const WORDS_PER_LEVEL = 5;
const PASSING_SCORE = 80;
const LOCAL_STORAGE_KEY = 'reconocimientoLetrasProgresoPalabras';

interface WordsModeProps {
  language: Language;
  character: Character;
}

export const WordsMode: React.FC<WordsModeProps> = ({ language, character }) => {
  const [phase, setPhase] = useState<GamePhase>('selection');
  const [level, setLevel] = useState<number | null>(null);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [userInput, setUserInput] = useState('');
  const [status, setStatus] = useState<AnswerStatus>('playing');
  
  const [sessionWords, setSessionWords] = useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
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

  // Preload the audio for the current word whenever it changes
  useEffect(() => {
    if (currentWord) {
      preloadSpeech(currentWord.word, character.voiceName, language);
    }
  }, [currentWord, language, character]);

  const updateProgress = useCallback((newHighestLevel: number) => {
    setHighestUnlockedLevel(newHighestLevel);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newHighestLevel));
    } catch (error) {
      console.error("Failed to save progress:", error);
    }
  }, []);

  const startLevel = useCallback((selectedLevel: number, selectedPhase: 'base' | 'advanced') => {
    playSound('click');
    setPhase(selectedPhase);
    setLevel(selectedLevel);
    setStatus('playing');
    setUserInput('');
    setCurrentWordIndex(0);
    setSessionCorrectCount(0);
    
    const wordLevel = selectedPhase === 'advanced' ? selectedLevel - 4 : selectedLevel;
    
    const wordSet = new Set<string>();
    const newSessionWords: Word[] = [];
    while (newSessionWords.length < WORDS_PER_LEVEL) {
        const word = getRandomWord(wordLevel, language as WordLanguage);
        if (!wordSet.has(word.word)) {
            wordSet.add(word.word);
            newSessionWords.push(word);
        }
    }
    setSessionWords(newSessionWords);
    setCurrentWord(newSessionWords[0]);
  }, [language]);

  const spellWord = (word: string) => {
    const letters = word.split('');
    let i = 0;
    const spellInterval = setInterval(() => {
      if (i < letters.length) {
        speakText(letters[i], character.voiceName, language);
        i++;
      } else {
        clearInterval(spellInterval);
      }
    }, 800);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  const goToNextWord = () => {
    const nextIndex = currentWordIndex + 1;
    if (nextIndex < sessionWords.length) {
      // Proactively load the audio for the *next* word while the user sees the result of the current one.
      const nextWord = sessionWords[nextIndex];
      preloadSpeech(nextWord.word, character.voiceName, language);
      
      setCurrentWordIndex(nextIndex);
      setCurrentWord(sessionWords[nextIndex]);
      setUserInput('');
      setStatus('playing');
    } else {
      // Level finished
      const score = (sessionCorrectCount / WORDS_PER_LEVEL) * 100;
      setLastScore(score);
      setPhase('results');
      
      const nextLevel = level! + 1;
      if (score >= PASSING_SCORE && nextLevel > highestUnlockedLevel && nextLevel <= 8) {
          updateProgress(nextLevel);
          playSound('switch'); // Play level up sound
      }
    }
  };

  const checkAnswer = () => {
    if (!currentWord || status !== 'playing') return;
    playSound('click');
    if (userInput.trim().toLowerCase() === currentWord.word.toLowerCase()) {
      setStatus('correct');
      setSessionCorrectCount(prev => prev + 1);
      playSound('success');
      setTimeout(goToNextWord, 1500);
    } else {
      setStatus('incorrect');
      playSound('error');
      setTimeout(goToNextWord, 2500); // Go to next word even if incorrect
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      checkAnswer();
    }
  };
  
  const spellWordAgain = () => {
    if (phase !== 'advanced' || !currentWord) return;
    playSound('click');
    spellWord(currentWord.word);
  };

  const handleBackToSelection = () => {
    playSound('click');
    setPhase('selection');
  };

  if (phase === 'selection') {
    return (
      <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg p-8 w-full max-w-2xl mx-auto flex flex-col items-center gap-6 animate-fadeIn">
        <h2 className="text-3xl font-bold text-slate-800">{T('wordsMode')}</h2>
        
        <div className="w-full">
            <h3 className="text-2xl font-semibold text-slate-700 mb-4 text-center border-b-2 pb-2">{T('baseLevel')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(l => (
                    <button key={`base-${l}`} onClick={() => startLevel(l, 'base')} disabled={l > highestUnlockedLevel} className="p-6 text-white font-bold text-xl rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600">
                        {l > highestUnlockedLevel && <LockClosedIcon className="w-5 h-5" />}
                        {T('level', { level: l.toString() })}
                    </button>
                ))}
            </div>
        </div>

        <div className="w-full mt-6">
            <h3 className="text-2xl font-semibold text-slate-700 mb-4 text-center border-b-2 pb-2">{T('advancedLevel')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {[5, 6, 7, 8].map(l => (
                    <button key={`adv-${l}`} onClick={() => startLevel(l, 'advanced')} disabled={l > highestUnlockedLevel} className="p-6 bg-indigo-500 text-white font-bold text-xl rounded-lg shadow-md hover:bg-indigo-600 transition-transform transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2">
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
    const isLastLevel = level === 8;
    const completedLevelPhase = level! <= 4 ? 'base' : 'advanced';
    const nextLevel = level! + 1;
    const nextLevelPhase = nextLevel <= 4 ? 'base' : 'advanced';

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
             <button onClick={() => startLevel(level!, completedLevelPhase)} className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg shadow-md hover:bg-orange-600 transition-all">
                {T('retry')}
             </button>
          )}
          {passed && !isLastLevel && (
             <button onClick={() => startLevel(nextLevel, nextLevelPhase)} disabled={nextLevel > highestUnlockedLevel} className="px-6 py-3 bg-purple-500 text-white font-semibold rounded-lg shadow-md hover:bg-purple-600 transition-all disabled:bg-slate-400 disabled:cursor-not-allowed">
                {T('nextLevel')}
             </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg p-8 w-full max-w-lg mx-auto flex flex-col items-center gap-4 animate-fadeIn">
        <div className="w-full flex justify-between items-center">
            <button onClick={handleBackToSelection} className="text-slate-600 hover:text-slate-800 font-semibold">&larr; {T('back')}</button>
            <div className="text-right">
                <p className="font-bold text-slate-700">{T('level', { level: level!.toString() })}</p>
                <p className="text-sm text-slate-500">{T('wordOf', { current: (currentWordIndex + 1).toString(), total: WORDS_PER_LEVEL.toString() })}</p>
            </div>
        </div>
        {currentWord && (
            <div className="flex flex-col items-center gap-4 w-full">
                {phase === 'base' ? (
                    <img src={currentWord.image} alt={currentWord.word} className="w-48 h-48 object-cover rounded-lg shadow-md" />
                ) : (
                    <button
                        onClick={spellWordAgain}
                        className="w-48 h-48 flex items-center justify-center bg-slate-200 rounded-lg shadow-inner hover:bg-slate-300 transition-all"
                        aria-label={T('listenToWordSpelled')}
                    >
                        <SpeakerWaveIcon className="w-24 h-24 text-slate-500" />
                    </button>
                )}
                
                <div className="w-full flex flex-col items-center gap-2 min-h-[250px] justify-center">
                    {phase === 'base' && (
                        <div className="flex items-center justify-center gap-4 my-4">
                            <p className="text-4xl font-bold text-slate-800 tracking-widest">{currentWord.word.toUpperCase()}</p>
                            <button
                                onClick={() => { playSound('click'); speakText(currentWord.word, character.voiceName, language); }}
                                className="p-2 bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200 transition-all"
                                aria-label={T('listenToWord')}
                            >
                                <SpeakerWaveIcon className="w-7 h-7" />
                            </button>
                        </div>
                    )}
                    <div className="relative w-full max-w-sm">
                        <input
                            type="text"
                            value={userInput}
                            onChange={handleInputChange}
                            onKeyPress={handleKeyPress}
                            autoFocus
                            disabled={status !== 'playing'}
                            className={`w-full text-center text-2xl p-3 border-4 rounded-lg shadow-inner transition-all duration-300 ${
                                status === 'incorrect' ? 'border-red-500 animate-shake' : 
                                status === 'correct' ? 'border-green-500' :
                                'border-slate-300 focus:border-purple-500 focus:ring-purple-500'
                            }`}
                            placeholder="_ _ _"
                        />
                         {status === 'correct' && (
                            <CheckCircleIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 text-green-500" />
                        )}
                    </div>
                    
                    <div className="h-16 flex flex-col items-center justify-center text-center">
                        {status === 'incorrect' && currentWord && (
                            <div className="text-red-600 font-semibold animate-fadeIn">
                                <p className="text-sm">{T('theCorrectWordWas')}</p>
                                <p className="text-2xl tracking-widest">{currentWord.word.toUpperCase()}</p>
                            </div>
                        )}
                    </div>

                    <button onClick={checkAnswer} disabled={status !== 'playing' || !userInput} className="px-8 py-3 bg-purple-500 text-white font-bold text-lg rounded-lg shadow-md hover:bg-purple-600 transition-transform transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:scale-100">
                        {T('check')}
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};