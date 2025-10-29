// components/ArithmeticMode.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MathProblem, getProblemsForLevel } from '../services/mathService';
import { playSound } from '../services/soundService';
import { LockClosedIcon, CheckCircleIcon } from './Icons';
import { getTranslation, Language } from '../services/i18n';
import { Character } from '../services/characterService';
import { TranslatedText } from './TranslatedText';

type GamePhase = 'selection' | 'learn' | 'playing' | 'results';
type AnswerStatus = 'waiting' | 'correct' | 'incorrect';
type OperationType = 'add-subtract' | 'multiply-divide';

const PROBLEMS_PER_LEVEL = 5;
const PASSING_SCORE = 80;
const TOTAL_LEVELS = 4;

interface ArithmeticModeProps {
  language: Language;
  character: Character;
  operationType: OperationType;
  onBackToMainSelection: () => void;
  userName: string;
}

export const ArithmeticMode: React.FC<ArithmeticModeProps> = ({ language, character, operationType, onBackToMainSelection, userName }) => {
  const [phase, setPhase] = useState<GamePhase>('selection');
  const [level, setLevel] = useState<number | null>(null);
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
  const [userInput, setUserInput] = useState('');
  const [status, setStatus] = useState<AnswerStatus>('waiting');
  
  const [sessionProblems, setSessionProblems] = useState<MathProblem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionCorrectCount, setSessionCorrectCount] = useState(0);
  const [highestUnlockedLevel, setHighestUnlockedLevel] = useState(1);
  const [lastScore, setLastScore] = useState(0);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const LOCAL_STORAGE_KEY = `reconocimientoLetrasProgresoNumeros_${operationType}_${userName}`;

  const T = (key: string, replacements?: {[key: string]: string}) => getTranslation(language, key, replacements);

  useEffect(() => {
    // This effect runs once on mount and returns a cleanup function that runs on unmount.
    // This will clear any pending timeouts if the component is unmounted for any reason.
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedProgress) setHighestUnlockedLevel(JSON.parse(savedProgress));
    } catch (error) { console.error("Failed to load progress:", error); }
  }, [LOCAL_STORAGE_KEY]);

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
    setStatus('waiting');
    setUserInput('');
    setCurrentIndex(0);
    setSessionCorrectCount(0);
    
    const newProblems = getProblemsForLevel(selectedLevel, operationType, PROBLEMS_PER_LEVEL);
    setSessionProblems(newProblems);
    setCurrentProblem(newProblems[0]);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [operationType]);

  const goToNextProblem = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < sessionProblems.length) {
      setCurrentIndex(nextIndex);
      setCurrentProblem(sessionProblems[nextIndex]);
      setUserInput('');
      setStatus('waiting');
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      const score = Math.round((sessionCorrectCount / PROBLEMS_PER_LEVEL) * 100);
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
    if (!currentProblem || status !== 'waiting' || userInput === '') return;
    playSound('click');
    if (parseInt(userInput, 10) === currentProblem.answer) {
      setStatus('correct');
      setSessionCorrectCount(prev => prev + 1);
      playSound('success');
      timeoutRef.current = setTimeout(goToNextProblem, 1500);
    } else {
      setStatus('incorrect');
      playSound('error');
      timeoutRef.current = setTimeout(goToNextProblem, 2500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') checkAnswer();
  };
  
  const handleBackToSelection = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    playSound('click');
    setPhase('selection');
  };

  const getTitle = () => {
      const key = operationType === 'add-subtract' ? 'addAndSubtract' : 'multiplyAndDivide';
      return <TranslatedText language={language} textKey={key} />;
  }

  if (phase === 'selection' || phase === 'learn') {
    return (
      <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg p-8 w-full max-w-2xl mx-auto flex flex-col items-center gap-6 animate-fadeIn">
        <div className="w-full flex justify-between items-center">
             <button onClick={onBackToMainSelection} className="text-slate-600 hover:text-slate-800 font-semibold">&larr; <TranslatedText language={language} textKey="back" /></button>
             <h2 className="text-3xl font-bold text-slate-800 text-center">{getTitle()}</h2>
             <div className="w-24"></div>
        </div>
        
        {phase === 'selection' && (
            <>
                <div className="w-full flex justify-center gap-4 my-4">
                    <button onClick={() => { playSound('click'); setPhase('learn')}} className="px-8 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition-all"><TranslatedText language={language} textKey="learn" /></button>
                    <button onClick={() => startLevel(1)} className="px-8 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition-all"><TranslatedText language={language} textKey="play" /></button>
                </div>
                <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(l => (
                        <button key={l} onClick={() => startLevel(l)} disabled={l > highestUnlockedLevel} className="p-6 text-white font-bold text-xl rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600">
                            {l > highestUnlockedLevel && <LockClosedIcon className="w-5 h-5" />}
                            <TranslatedText language={language} textKey="level" replacements={{ level: l.toString() }} />
                        </button>
                    ))}
                </div>
            </>
        )}
        
        {phase === 'learn' && (
            <div className="w-full text-left p-4 bg-slate-50/50 rounded-lg">
                <h3 className="text-2xl font-semibold text-slate-700 mb-2"><TranslatedText language={language} textKey={operationType === 'add-subtract' ? 'learnAdditionTitle' : 'learnMultiplicationTitle'} /></h3>
                <p className="text-slate-600 mb-4"><TranslatedText language={language} textKey={operationType === 'add-subtract' ? 'learnAdditionDesc' : 'learnMultiplicationDesc'} as="p" /></p>
                <div className="text-center font-mono text-xl p-4 bg-white rounded-md shadow-inner">
                    <p>{T(operationType === 'add-subtract' ? 'addExample1' : 'multiplyExample1')}</p>
                    <p>{T(operationType === 'add-subtract' ? 'addExample2' : 'multiplyExample2')}</p>
                </div>

                <h3 className="text-2xl font-semibold text-slate-700 mt-6 mb-2"><TranslatedText language={language} textKey={operationType === 'add-subtract' ? 'learnSubtractionTitle' : 'learnDivisionTitle'} /></h3>
                <p className="text-slate-600 mb-4"><TranslatedText language={language} textKey={operationType === 'add-subtract' ? 'learnSubtractionDesc' : 'learnDivisionDesc'} as="p" /></p>
                <div className="text-center font-mono text-xl p-4 bg-white rounded-md shadow-inner">
                   <p>{T(operationType === 'add-subtract' ? 'subtractExample1' : 'divideExample1')}</p>
                   <p>{T(operationType === 'add-subtract' ? 'subtractExample2' : 'divideExample2')}</p>
                </div>

                <div className="text-center mt-6">
                    <button onClick={handleBackToSelection} className="px-8 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition-all"><TranslatedText language={language} textKey="readyToPlay" /></button>
                </div>
            </div>
        )}
      </div>
    );
  }
  
  if (phase === 'results') {
    const passed = lastScore >= PASSING_SCORE;
    return (
      <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg p-8 w-full max-w-lg mx-auto flex flex-col items-center gap-4 text-center animate-scaleIn">
        <h2 className="text-3xl font-bold text-slate-800"><TranslatedText language={language} textKey="levelCompleted" replacements={{ level: level!.toString() }} /></h2>
        <p className="text-xl text-slate-600"><TranslatedText language={language} textKey="yourScore" /></p>
        <p className={`text-6xl font-black ${passed ? 'text-green-500' : 'text-red-500'}`}>{lastScore}%</p>
        {passed ? (
          <>
            <p className="text-xl font-semibold text-green-600 mt-2"><TranslatedText language={language} textKey="excellentWork" /></p>
            {level! < TOTAL_LEVELS && <p className="text-slate-600"><TranslatedText language={language} textKey="unlockedNextLevel" /></p>}
          </>
        ) : (
          <p className="text-xl font-semibold text-orange-500 mt-2"><TranslatedText language={language} textKey="almostThere" replacements={{ score: PASSING_SCORE.toString() }} /></p>
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
                <p className="text-sm text-slate-500"><TranslatedText language={language} textKey="problemOf" replacements={{ current: (currentIndex + 1).toString(), total: PROBLEMS_PER_LEVEL.toString() }} /></p>
            </div>
        </div>
        {currentProblem && (
            <div className="flex flex-col items-center gap-4 w-full">
                <div className="text-5xl font-bold text-slate-800 tracking-wider text-center bg-slate-100/70 p-8 rounded-lg shadow-inner w-full">
                    {currentProblem.operand1} {currentProblem.operator} {currentProblem.operand2}
                </div>
                
                <div className="w-full flex flex-col items-center gap-2 min-h-[180px] justify-center">
                    <div className="relative w-full max-w-sm">
                        <input
                            ref={inputRef}
                            type="number"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            autoFocus
                            disabled={status !== 'waiting'}
                            className={`w-full text-center text-3xl p-3 border-4 rounded-lg shadow-inner transition-all duration-300 ${
                                status === 'incorrect' ? 'border-red-500 animate-shake' : 
                                status === 'correct' ? 'border-green-500' :
                                'border-slate-300 focus:border-purple-500 focus:ring-purple-500'
                            }`}
                            placeholder="?"
                        />
                         {status === 'correct' && <CheckCircleIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 text-green-500" />}
                    </div>
                    
                    <div className="h-16 flex flex-col items-center justify-center text-center">
                        {status === 'incorrect' && (
                            <div className="text-red-600 font-semibold animate-fadeIn">
                                <p className="text-sm"><TranslatedText language={language} textKey="theCorrectAnswerWas" /></p>
                                <p className="text-2xl">{currentProblem.answer}</p>
                            </div>
                        )}
                         {status === 'correct' && (
                            <div className="text-green-600 font-semibold animate-scaleIn">
                                <p className="text-2xl"><TranslatedText language={language} textKey="correctExclamation" /></p>
                            </div>
                        )}
                    </div>

                    <button onClick={checkAnswer} disabled={status !== 'waiting' || userInput === ''} className="px-8 py-3 bg-purple-500 text-white font-bold text-lg rounded-lg shadow-md hover:bg-purple-600 transition-transform transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:scale-100">
                        <TranslatedText language={language} textKey="check" />
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};
