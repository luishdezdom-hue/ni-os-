// components/NumberWritingMode.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NumberData, getNumbersForLevel, getNumberData } from '../services/numberService';
import { speakText, playSound, preloadSpeech } from '../services/soundService';
import { LockClosedIcon, CheckCircleIcon, SpeakerWaveIcon } from './Icons';
import { getTranslation, Language } from '../services/i18n';
import { Character } from '../services/characterService';
import { TranslatedText } from './TranslatedText';

type GamePhase = 'selection' | 'playing' | 'results';
type AnswerStatus = 'playing' | 'correct' | 'incorrect';

const NUMBERS_PER_LEVEL = 5;
const PASSING_SCORE = 80;
const TOTAL_LEVELS = 4;


interface NumberWritingModeProps {
  language: Language;
  character: Character;
  userName: string;
}

export const NumberWritingMode: React.FC<NumberWritingModeProps> = ({ language, character, userName }) => {
  const [phase, setPhase] = useState<GamePhase>('selection');
  const [level, setLevel] = useState<number | null>(null);
  const [currentNumber, setCurrentNumber] = useState<NumberData | null>(null);
  const [userInput, setUserInput] = useState('');
  const [status, setStatus] = useState<AnswerStatus>('playing');
  const [spanishSubtitle, setSpanishSubtitle] = useState<string | null>(null);
  
  const [sessionNumbers, setSessionNumbers] = useState<NumberData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionCorrectCount, setSessionCorrectCount] = useState(0);
  const [highestUnlockedLevel, setHighestUnlockedLevel] = useState(1);
  const [lastScore, setLastScore] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const T = (key: string, replacements?: {[key: string]: string}) => getTranslation(language, key, replacements);
  const LOCAL_STORAGE_KEY = `reconocimientoLetrasProgresoNumerosEscritura_${userName}`;

  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedProgress) setHighestUnlockedLevel(JSON.parse(savedProgress));
    } catch (error) { console.error("Failed to load progress:", error); }
  }, [LOCAL_STORAGE_KEY]);
  
  useEffect(() => {
    if (currentNumber) {
      preloadSpeech(currentNumber.name, character.voiceName, language);
    }
    if (language === 'nah' && currentNumber) {
        const esData = getNumberData(currentNumber.digit, 'es-MX');
        setSpanishSubtitle(esData ? `(${esData.name})` : null);
    } else {
        setSpanishSubtitle(null);
    }
  }, [currentNumber, language, character]);

  const updateProgress = useCallback((newHighestLevel: number) => {
    setHighestUnlockedLevel(newHighestLevel);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newHighestLevel));
    } catch (error) { console.error("Failed to save progress:", error); }
  }, [LOCAL_STORAGE_KEY]);

  const startLevel = useCallback((selectedLevel: number) => {
    playSound('click');
    setPhase('playing');
    setLevel(selectedLevel);
    setStatus('playing');
    setUserInput('');
    setCurrentIndex(0);
    setSessionCorrectCount(0);
    
    const newSessionNumbers = getNumbersForLevel(selectedLevel, language, NUMBERS_PER_LEVEL);
    setSessionNumbers(newSessionNumbers);
    const firstNumber = newSessionNumbers[0];
    setCurrentNumber(firstNumber);

    if (language === 'nah') {
        speakText(firstNumber.name, character.voiceName, language);
    }

    setTimeout(() => inputRef.current?.focus(), 100);
  }, [language, character.voiceName]);

  const goToNextNumber = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < sessionNumbers.length) {
      const nextNumber = sessionNumbers[nextIndex];
      setCurrentIndex(nextIndex);
      setCurrentNumber(nextNumber);
      setUserInput('');
      setStatus('playing');

      if (language === 'nah') {
        speakText(nextNumber.name, character.voiceName, language);
      }

       setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      const score = Math.round((sessionCorrectCount / NUMBERS_PER_LEVEL) * 100);
      setLastScore(score);
      setPhase('results');
      
      const nextLevel = level! + 1;
      if (score >= PASSING_SCORE && nextLevel > highestUnlockedLevel) {
          updateProgress(nextLevel);
          playSound('switch');
      }
    }
  };

  const checkAnswer = () => {
    if (!currentNumber || status !== 'playing') return;
    playSound('click');
    
    const isCorrect = language === 'nah'
        ? userInput.trim() === currentNumber.digit.toString()
        : userInput.trim().toLowerCase() === currentNumber.name.toLowerCase();

    if (isCorrect) {
      setStatus('correct');
      setSessionCorrectCount(prev => prev + 1);
      playSound('success');
      setTimeout(goToNextNumber, 1500);
    } else {
      setStatus('incorrect');
      playSound('error');
      setTimeout(goToNextNumber, 2500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') checkAnswer();
  };
  
  const handleBackToSelection = () => {
    playSound('click');
    setPhase('selection');
  };

  if (phase === 'selection') {
    return (
      <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg p-8 w-full max-w-2xl mx-auto flex flex-col items-center gap-6 animate-fadeIn">
        <h2 className="text-3xl font-bold text-slate-800 text-center"><TranslatedText language={language} textKey="writeTheNumber" /></h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            {[1, 2, 3, 4].map(l => (
                <button key={l} onClick={() => startLevel(l)} disabled={l > highestUnlockedLevel} className="p-6 text-white font-bold text-xl rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600">
                    {l > highestUnlockedLevel && <LockClosedIcon className="w-5 h-5" />}
                    <TranslatedText language={language} textKey="level" replacements={{level: l.toString()}} />
                </button>
            ))}
        </div>
      </div>
    );
  }
  
  if (phase === 'results') {
    const passed = lastScore >= PASSING_SCORE;
    return (
       <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg p-8 w-full max-w-lg mx-auto flex flex-col items-center gap-4 text-center animate-scaleIn">
        <h2 className="text-3xl font-bold text-slate-800"><TranslatedText language={language} textKey="levelCompleted" replacements={{level: level!.toString()}} /></h2>
        <p className="text-xl text-slate-600"><TranslatedText language={language} textKey="yourScore" /></p>
        <p className={`text-6xl font-black ${passed ? 'text-green-500' : 'text-red-500'}`}>{lastScore}%</p>
        {passed ? (
          <>
            <p className="text-xl font-semibold text-green-600 mt-2"><TranslatedText language={language} textKey="excellentWork" /></p>
            {level! < TOTAL_LEVELS && <p className="text-slate-600"><TranslatedText language={language} textKey="unlockedNextLevel" /></p>}
          </>
        ) : (
          <p className="text-xl font-semibold text-orange-500 mt-2"><TranslatedText language={language} textKey="almostThere" replacements={{score: PASSING_SCORE.toString()}} /></p>
        )}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button onClick={handleBackToSelection} className="px-6 py-3 bg-slate-500 text-white font-semibold rounded-lg shadow-md hover:bg-slate-600"><TranslatedText language={language} textKey="backToLevels" /></button>
          {!passed && <button onClick={() => startLevel(level!)} className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg shadow-md hover:bg-orange-600"><TranslatedText language={language} textKey="retry" /></button>}
          {passed && level! < TOTAL_LEVELS && <button onClick={() => startLevel(level! + 1)} className="px-6 py-3 bg-purple-500 text-white font-semibold rounded-lg shadow-md hover:bg-purple-600"><TranslatedText language={language} textKey="nextLevel" /></button>}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg p-8 w-full max-w-lg mx-auto flex flex-col items-center gap-4 animate-fadeIn">
        <div className="w-full flex justify-between items-center">
            <button onClick={handleBackToSelection} className="text-slate-600 hover:text-slate-800 font-semibold">&larr; <TranslatedText language={language} textKey="back" /></button>
            <div className="text-right">
                <p className="font-bold text-slate-700"><TranslatedText language={language} textKey="level" replacements={{level: level!.toString()}} /></p>
                <p className="text-sm text-slate-500"><TranslatedText language={language} textKey="problemOf" replacements={{ current: (currentIndex + 1).toString(), total: NUMBERS_PER_LEVEL.toString() }} /></p>
            </div>
        </div>
        {currentNumber && (
            <div className="flex flex-col items-center gap-4 w-full">
                <div className="flex items-center justify-center gap-4">
                     {language === 'nah' ? (
                        <div className="text-center">
                            <p className="text-7xl font-black text-slate-800 capitalize">{currentNumber.name}</p>
                            {spanishSubtitle && <p className="text-2xl text-slate-500 font-semibold mt-2">{spanishSubtitle}</p>}
                        </div>
                    ) : (
                        <p className="text-9xl font-black text-slate-800">{currentNumber.digit}</p>
                    )}
                    <button
                        onClick={() => { playSound('click'); speakText(currentNumber.name, character.voiceName, language); }}
                        className="p-3 bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200 transition-all self-center"
                        aria-label={T('listenToLetter')}
                    >
                        <SpeakerWaveIcon className="w-8 h-8" />
                    </button>
                </div>
                
                <p className="text-slate-600"><TranslatedText language={language} textKey={language === 'nah' ? 'writeTheDigit' : 'numberAsWord'} /></p>

                <div className="w-full flex flex-col items-center gap-2 min-h-[180px] justify-center">
                    <div className="relative w-full max-w-sm">
                        <input
                            ref={inputRef}
                            type={language === 'nah' ? 'number' : 'text'}
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            autoFocus
                            disabled={status !== 'playing'}
                            className={`w-full text-center text-2xl p-3 border-4 rounded-lg shadow-inner transition-all duration-300 ${
                                status === 'incorrect' ? 'border-red-500 animate-shake' : 
                                status === 'correct' ? 'border-green-500' :
                                'border-slate-300 focus:border-purple-500 focus:ring-purple-500'
                            }`}
                            placeholder="..."
                        />
                         {status === 'correct' && <CheckCircleIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 text-green-500" />}
                    </div>
                    
                    <div className="h-16 flex flex-col items-center justify-center text-center">
                        {status === 'incorrect' && (
                            <div className="text-red-600 font-semibold animate-fadeIn">
                                <p className="text-sm"><TranslatedText language={language} textKey="theCorrectNumberWas" /></p>
                                <p className="text-2xl">{language === 'nah' ? currentNumber.digit : currentNumber.name}</p>
                            </div>
                        )}
                         {status === 'correct' && (
                            <div className="text-green-600 font-semibold animate-scaleIn">
                                <p className="text-2xl"><TranslatedText language={language} textKey="correctExclamation" /></p>
                            </div>
                        )}
                    </div>

                    <button onClick={checkAnswer} disabled={status !== 'playing' || userInput === ''} className="px-8 py-3 bg-purple-500 text-white font-bold text-lg rounded-lg shadow-md hover:bg-purple-600 transition-transform transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:scale-100">
                        <TranslatedText language={language} textKey="check" />
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};
