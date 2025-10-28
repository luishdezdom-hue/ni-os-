import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CameraFeed, CameraFeedHandle } from './CameraFeed';
import { Color, getColorsForLevel, getAllColors } from '../services/colorService';
import { recognizeColor } from '../services/geminiService';
import { speakText, playSound, preloadSpeech } from '../services/soundService';
import { SpeakerWaveIcon, LockClosedIcon, SparklesIcon, PowerIcon } from './Icons';
import { getTranslation, Language } from '../services/i18n';
import { Character } from '../services/characterService';

type GamePhase = 'selection' | 'playing' | 'results';
type AnswerStatus = 'waiting' | 'correct' | 'incorrect';

const COLORS_PER_LEVEL = 5;
const PASSING_SCORE = 80;


interface ColorsModeProps {
  language: Language;
  character: Character;
  userName: string;
}

const LoadingSpinner: React.FC = () => (
    <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center rounded-lg z-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-500"></div>
        <p className="mt-4 text-slate-600 font-semibold">Identifying...</p>
    </div>
);

export const ColorsMode: React.FC<ColorsModeProps> = ({ language, character, userName }) => {
  const [phase, setPhase] = useState<GamePhase>('selection');
  const [level, setLevel] = useState<number | null>(null);
  const [currentTarget, setCurrentTarget] = useState<Color | null>(null);
  const [status, setStatus] = useState<AnswerStatus>('waiting');
  
  const [sessionColors, setSessionColors] = useState<Color[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionCorrectCount, setSessionCorrectCount] = useState(0);
  const [highestUnlockedLevel, setHighestUnlockedLevel] = useState(1);
  const [lastScore, setLastScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);

  const cameraFeedRef = useRef<CameraFeedHandle>(null);
  const allColorsForLang = getAllColors(language);

  const T = (key: string, replacements?: {[key: string]: string}) => getTranslation(language, key, replacements);
  const LOCAL_STORAGE_KEY = `reconocimientoLetrasProgresoColores_${userName}`;

  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedProgress) setHighestUnlockedLevel(JSON.parse(savedProgress));
    } catch (error) { console.error("Failed to load progress:", error); }
  }, [LOCAL_STORAGE_KEY]);

  useEffect(() => {
    if (currentTarget && status === 'waiting') {
        const textToSay = T('findTheColor', { color: currentTarget.name });
        preloadSpeech(textToSay, character.voiceName, language);
        speakText(textToSay, character.voiceName, language);
    }
  }, [currentTarget, status, character, language, T]);

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
    setCurrentIndex(0);
    setSessionCorrectCount(0);
    setIsCameraOn(true);
    
    const newSessionColors = getColorsForLevel(selectedLevel, language, COLORS_PER_LEVEL);
    setSessionColors(newSessionColors);
    setCurrentTarget(newSessionColors[0]);
  }, [language]);

  const goToNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < sessionColors.length) {
      setCurrentIndex(nextIndex);
      setCurrentTarget(sessionColors[nextIndex]);
      setStatus('waiting');
    } else {
      const score = Math.round((sessionCorrectCount / COLORS_PER_LEVEL) * 100);
      setLastScore(score);
      setPhase('results');
      setIsCameraOn(false);
      const nextLevel = level! + 1;
      if (score >= PASSING_SCORE && nextLevel > highestUnlockedLevel && nextLevel <= 8) {
          updateProgress(nextLevel);
          playSound('switch');
      }
    }
  };

  const handleRecognize = async () => {
    if (!cameraFeedRef.current || status === 'correct' || isLoading) return;
    playSound('click');
    const imageDataUrl = cameraFeedRef.current.captureFrame();
    if (imageDataUrl) {
      setIsLoading(true);
      try {
        const colorNames = allColorsForLang.map(c => c.name);
        const recognized = await recognizeColor(imageDataUrl, currentTarget!.name, language, colorNames);
        if (recognized.toLowerCase() === currentTarget!.name.toLowerCase()) {
          setStatus('correct');
          setSessionCorrectCount(prev => prev + 1);
          playSound('success');
          speakText(T('correctExclamation'), character.voiceName, language);
          setTimeout(goToNext, 2000);
        } else {
          setStatus('incorrect');
          playSound('error');
          speakText(T('almost'), character.voiceName, language);
        }
      } catch (err) {
        console.error(err);
        setStatus('incorrect');
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const handleBackToSelection = () => {
    playSound('click');
    setPhase('selection');
    setIsCameraOn(false);
  };
  
  const LevelButton: React.FC<{levelNum: number}> = ({levelNum}) => (
    <button onClick={() => startLevel(levelNum)} disabled={levelNum > highestUnlockedLevel} className="p-6 text-white font-bold text-xl rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600">
        {levelNum > highestUnlockedLevel && <LockClosedIcon className="w-5 h-5" />}
        <span>
            {T('level', { level: levelNum.toString() })}
            {language !== 'es-MX' && <span className="block text-xs font-normal opacity-80 mt-0.5">({getTranslation('es-MX', 'level', { level: levelNum.toString() })})</span>}
        </span>
    </button>
  );

  if (phase === 'selection') {
    return (
      <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg p-8 w-full max-w-2xl mx-auto flex flex-col items-center gap-6 animate-fadeIn">
        <h2 className="text-3xl font-bold text-slate-800 text-center">{T('colorsMode')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(l => <LevelButton key={l} levelNum={l}/>)}
        </div>
      </div>
    );
  }
  
  if (phase === 'results') {
    const passed = lastScore >= PASSING_SCORE;
    return (
      <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg p-8 w-full max-w-lg mx-auto flex flex-col items-center gap-4 text-center animate-scaleIn">
        <h2 className="text-3xl font-bold text-slate-800">{T('levelCompleted', { level: level!.toString() })}</h2>
        <p className="text-xl text-slate-600">{T('yourScore')}</p>
        <p className={`text-6xl font-black ${passed ? 'text-green-500' : 'text-red-500'}`}>{lastScore}%</p>
        {passed ? (
          <>
            <p className="text-xl font-semibold text-green-600 mt-2">{T('excellentWork')}</p>
            {level! < 8 && <p className="text-slate-600">{T('unlockedNextLevel')}</p>}
          </>
        ) : (
          <p className="text-xl font-semibold text-orange-500 mt-2">{T('almostThere', { score: PASSING_SCORE.toString() })}</p>
        )}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button onClick={handleBackToSelection} className="px-6 py-3 bg-slate-500 text-white font-semibold rounded-lg shadow-md hover:bg-slate-600">{T('backToLevels')}</button>
          {!passed && <button onClick={() => startLevel(level!)} className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg shadow-md hover:bg-orange-600">{T('retry')}</button>}
          {passed && level! < 8 && <button onClick={() => startLevel(level! + 1)} className="px-6 py-3 bg-purple-500 text-white font-semibold rounded-lg shadow-md hover:bg-purple-600">{T('nextLevel')}</button>}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg p-4 md:p-8 w-full flex flex-col items-center gap-4 animate-fadeIn">
        <div className="w-full flex justify-between items-center">
            <button onClick={handleBackToSelection} className="text-slate-600 hover:text-slate-800 font-semibold">&larr; {T('back')}</button>
            <div className="text-right">
                <p className="font-bold text-slate-700">{T('level', { level: level!.toString() })}</p>
                <p className="text-sm text-slate-500">{T('colorOf', { current: (currentIndex + 1).toString(), total: COLORS_PER_LEVEL.toString() })}</p>
            </div>
        </div>

        {currentTarget && (
            <div className="flex items-center gap-4">
                 <div className="w-16 h-16 rounded-full shadow-md border-4 border-white" style={{ backgroundColor: currentTarget.hex }}></div>
                 <h3 className="text-2xl md:text-3xl font-bold text-slate-700">{T('findTheColor', { color: currentTarget.name })}</h3>
                 <button onClick={() => speakText(T('findTheColor', { color: currentTarget.name }), character.voiceName, language)} className="p-2 bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200 transition-all"><SpeakerWaveIcon className="w-6 h-6" /></button>
            </div>
        )}

        <div className="w-full max-w-lg relative min-h-[300px] lg:min-h-[400px] bg-slate-100 rounded-xl flex items-center justify-center">
            {isLoading && <LoadingSpinner />}
            {isCameraOn ? (
                <CameraFeed ref={cameraFeedRef} />
            ) : (
                <p className="text-slate-500">{T('turnOnCamera')}</p>
            )}
            <div className={`absolute inset-2 border-4 rounded-lg transition-all duration-300 pointer-events-none ${
                status === 'correct' ? 'border-green-500' :
                status === 'incorrect' ? 'border-red-500 animate-shake' : 'border-transparent'
            }`}></div>
        </div>
        
        <div className="h-20 flex flex-col items-center justify-center text-center">
            {status === 'incorrect' && (
                <div className="animate-fadeIn text-orange-600 font-semibold">
                    <p>{T('almost')}</p>
                    <button
                        onClick={() => { playSound('click'); goToNext(); }}
                        className="mt-2 px-5 py-2 bg-slate-500 text-white text-sm rounded-lg shadow hover:bg-slate-600 transition-all"
                    >
                        {T('nextColor')} &rarr;
                    </button>
                </div>
            )}
            {status === 'correct' && (
                <p className="text-2xl font-bold text-green-600 animate-scaleIn">{T('correctExclamation')}</p>
            )}
        </div>
        
        <div className="flex gap-4">
             <button
                onClick={handleRecognize}
                disabled={isLoading || !isCameraOn || status === 'correct'}
                className="flex items-center justify-center gap-3 px-6 py-4 bg-purple-500 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-purple-600 transition-transform transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
                <SparklesIcon className="w-7 h-7" />
                {T('checkColor')}
            </button>
            <button
                onClick={() => { playSound('click'); setIsCameraOn(prev => !prev); }}
                className="flex items-center justify-center gap-3 px-4 py-3 bg-rose-500 text-white font-semibold rounded-lg shadow-md hover:bg-rose-600"
            >
                <PowerIcon className="w-6 h-6" />
                {isCameraOn ? T('turnOffCamera') : T('turnOnCamera')}
            </button>
        </div>
    </div>
  );
};