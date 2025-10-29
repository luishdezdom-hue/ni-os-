import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Color, getMatchingColorsForLevel, Language as ColorLanguage } from '../services/colorService';
import { speakText, playSound, preloadSpeech } from '../services/soundService';
import { LockClosedIcon } from './Icons';
import { getTranslation, Language } from '../services/i18n';
import { Character } from '../services/characterService';
import { TranslatedText } from './TranslatedText';

type GamePhase = 'selection' | 'playing' | 'results';
type Connection = { from: number, to: number, status: 'correct' | 'incorrect' };

const COLORS_PER_LEVEL = [3, 4, 5, 6]; // For levels 1, 2, 3, 4
const PASSING_SCORE = 80;


interface MatchingColorsModeProps {
  language: Language;
  character: Character;
  userName: string;
}

export const MatchingColorsMode: React.FC<MatchingColorsModeProps> = ({ language, character, userName }) => {
  const [phase, setPhase] = useState<GamePhase>('selection');
  const [level, setLevel] = useState<number | null>(null);
  const [gameData, setGameData] = useState<{ colors: Color[], words: Color[] } | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedColorIndex, setSelectedColorIndex] = useState<number | null>(null);
  
  const [sessionCorrectCount, setSessionCorrectCount] = useState(0);
  const [highestUnlockedLevel, setHighestUnlockedLevel] = useState(1);
  const [lastScore, setLastScore] = useState(0);
  
  const colorRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const wordRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const T = (key: string, replacements?: {[key: string]: string}) => getTranslation(language, key, replacements);
  const LOCAL_STORAGE_KEY = `reconocimientoLetrasProgresoColoresMatching_${userName}`;

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
    setConnections([]);
    setSelectedColorIndex(null);
    setSessionCorrectCount(0);
    
    const colors = getMatchingColorsForLevel(selectedLevel, language as ColorLanguage);
    const words = [...colors].sort(() => Math.random() - 0.5);
    setGameData({ colors, words });

    // Preload all color names for the level
    colors.forEach(color => preloadSpeech(color.name, character.voiceName, language));
  }, [language, character]);

  const handleColorClick = (index: number) => {
    playSound('click');
    // If this color is already correctly connected, do nothing
    if (connections.some(c => c.from === index && c.status === 'correct')) return;

    setSelectedColorIndex(index);
    speakText(gameData!.colors[index].name, character.voiceName, language);
  };

  const handleWordClick = (index: number) => {
    if (selectedColorIndex === null) return;
    playSound('click');

    const fromIndex = selectedColorIndex;
    const toIndex = index;

    const isCorrect = gameData!.colors[fromIndex].name === gameData!.words[toIndex].name;
    const newConnection: Connection = { from: fromIndex, to: toIndex, status: isCorrect ? 'correct' : 'incorrect' };

    setConnections(prev => [...prev, newConnection]);
    setSelectedColorIndex(null);

    if (isCorrect) {
      playSound('success');
      setSessionCorrectCount(prev => prev + 1);
    } else {
      playSound('error');
      // Incorrect connections disappear after a short delay
      setTimeout(() => {
        setConnections(prev => prev.filter(c => c !== newConnection));
      }, 1000);
    }
  };

  useEffect(() => {
    if (gameData && sessionCorrectCount === gameData.colors.length) {
      // Level finished
      setTimeout(() => {
        const score = 100; // All correct
        setLastScore(score);
        setPhase('results');
        const nextLevel = level! + 1;
        if (nextLevel > highestUnlockedLevel) {
            updateProgress(nextLevel);
            playSound('switch');
        }
      }, 1000);
    }
  }, [sessionCorrectCount, gameData, level, highestUnlockedLevel, updateProgress]);

  const handleBackToSelection = () => {
    playSound('click');
    setPhase('selection');
  };

  const getButtonCenter = (element: HTMLElement | null) => {
    if (!element || !containerRef.current) return { x: 0, y: 0 };
    const containerRect = containerRef.current.getBoundingClientRect();
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top + rect.height / 2
    };
  };
  
  if (phase === 'selection') {
    return (
      <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg p-8 w-full max-w-2xl mx-auto flex flex-col items-center gap-6 animate-fadeIn">
        <h2 className="text-3xl font-bold text-slate-800 text-center"><TranslatedText language={language} textKey="matchTheColor" /></h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            {[1, 2, 3, 4].map(l => (
                 <button key={l} onClick={() => startLevel(l)} disabled={l > highestUnlockedLevel} className="p-6 text-white font-bold text-xl rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600">
                    {l > highestUnlockedLevel && <LockClosedIcon className="w-5 h-5" />}
                    <TranslatedText language={language} textKey="level" replacements={{ level: l.toString() }} />
                </button>
            ))}
        </div>
      </div>
    );
  }
  
  if (phase === 'results') {
    const isLastLevel = level === 4;
    return (
      <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg p-8 w-full max-w-lg mx-auto flex flex-col items-center gap-4 text-center animate-scaleIn">
        <h2 className="text-3xl font-bold text-slate-800"><TranslatedText language={language} textKey="levelCompleted" replacements={{ level: level!.toString() }} /></h2>
        <p className={`text-6xl font-black text-green-500`}>{lastScore}%</p>
        <p className="text-xl font-semibold text-green-600 mt-2"><TranslatedText language={language} textKey="excellentWork" /></p>
        {!isLastLevel && <p className="text-slate-600"><TranslatedText language={language} textKey="unlockedNextLevel" /></p>}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button onClick={handleBackToSelection} className="px-6 py-3 bg-slate-500 text-white font-semibold rounded-lg shadow-md hover:bg-slate-600"><TranslatedText language={language} textKey="backToLevels" /></button>
          {!isLastLevel && <button onClick={() => startLevel(level! + 1)} className="px-6 py-3 bg-indigo-500 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-600"><TranslatedText language={language} textKey="nextLevel" /></button>}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg p-4 md:p-8 w-full max-w-2xl flex flex-col items-center gap-6 animate-fadeIn">
        <div className="w-full flex justify-between items-center">
            <button onClick={handleBackToSelection} className="text-slate-600 hover:text-slate-800 font-semibold">&larr; <TranslatedText language={language} textKey="back" /></button>
            <div className="text-right">
                <p className="font-bold text-slate-700"><TranslatedText language={language} textKey="level" replacements={{ level: level!.toString() }} /></p>
                <p className="text-sm text-slate-500"><TranslatedText language={language} textKey="connectTheColor" /></p>
            </div>
        </div>
        
        <div ref={containerRef} className="relative w-full flex justify-between items-center p-4">
            <div className="w-1/4 flex flex-col items-center gap-4 z-10">
                {gameData?.colors.map((color, index) => {
                    const isConnected = connections.some(c => c.from === index && c.status === 'correct');
                    return (
                        <button
                            key={`color-${index}`}
                            ref={el => { colorRefs.current[index] = el; }}
                            onClick={() => handleColorClick(index)}
                            disabled={isConnected}
                            className={`w-16 h-16 rounded-full shadow-md border-4 transition-all ${
                                selectedColorIndex === index ? 'border-purple-500 scale-110' : 'border-white'
                            } ${isConnected ? 'opacity-50' : ''}`}
                            style={{ backgroundColor: color.hex }}
                            aria-label={`Color ${color.name}`}
                        />
                    );
                })}
            </div>
            
            <div className="absolute inset-0 z-0">
                <svg width="100%" height="100%">
                    {connections.map((conn, i) => {
                        const start = getButtonCenter(colorRefs.current[conn.from]);
                        const end = getButtonCenter(wordRefs.current[conn.to]);
                        return (
                            <line
                                key={i}
                                x1={start.x} y1={start.y}
                                x2={end.x} y2={end.y}
                                stroke={conn.status === 'correct' ? '#22c55e' : '#ef4444'}
                                strokeWidth="5"
                                strokeLinecap="round"
                                className={conn.status === 'incorrect' ? 'animate-shake' : 'animate-fadeIn'}
                            />
                        );
                    })}
                </svg>
            </div>
            
            <div className="w-1/2 flex flex-col items-center gap-4 z-10">
                {gameData?.words.map((word, index) => {
                    const isConnected = connections.some(c => c.to === index && c.status === 'correct');
                     return (
                        <button
                            key={`word-${index}`}
                            ref={el => { wordRefs.current[index] = el; }}
                            onClick={() => handleWordClick(index)}
                            disabled={isConnected || selectedColorIndex === null}
                            className={`px-4 py-3 w-4/5 bg-white rounded-lg shadow-md font-semibold text-slate-700 text-lg transition-all disabled:opacity-50 ${
                                selectedColorIndex !== null ? 'hover:bg-purple-100' : 'disabled:cursor-not-allowed'
                            }`}
                        >
                            {word.name}
                        </button>
                     );
                })}
            </div>
        </div>
    </div>
  );
};
