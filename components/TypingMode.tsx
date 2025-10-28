import React, { useState, useEffect, useRef } from 'react';
import { playSound, speakText, preloadSpeech } from '../services/soundService';
import { recognizeLetter } from '../services/geminiService';
import { getTranslation, Language } from '../services/i18n';
import { SpeakerWaveIcon } from './Icons';
import { Character } from '../services/characterService';

interface DrawingModeProps {
  targetLetter: string;
  onNextLetter: () => void;
  language: Language;
  alphabet: string[];
  character: Character;
}

export const TypingMode: React.FC<DrawingModeProps> = ({ targetLetter, onNextLetter, language, alphabet, character }) => {
  const [status, setStatus] = useState<'waiting' | 'correct' | 'incorrect'>('waiting');
  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPosition = useRef<{ x: number; y: number } | null>(null);

  const T = (key: string, replacements?: {[key: string]: string}) => getTranslation(language, key, replacements);
  
  const instructionText = T('drawTheLetter', { letter: targetLetter });

  useEffect(() => {
    // Preload the instruction audio as soon as the component mounts or the letter changes.
    preloadSpeech(instructionText, character.voiceName, language);
  }, [instructionText, character, language]);

  const getCanvasContext = () => canvasRef.current?.getContext('2d');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = getCanvasContext();
    if (!ctx) return;
    
    // Set background and drawing style
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getCoordinates = (event: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    if ('touches' in event) {
        return {
            x: event.touches[0].clientX - rect.left,
            y: event.touches[0].clientY - rect.top,
        };
    }
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
    };
  };

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    if (status === 'correct' || isLoading) return;
    const coords = getCoordinates(event);
    if (coords) {
        isDrawing.current = true;
        lastPosition.current = coords;
        const ctx = getCanvasContext();
        if (ctx) {
            ctx.beginPath();
            ctx.moveTo(coords.x, coords.y);
        }
    }
  };

  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current || status === 'correct' || isLoading) return;
    const coords = getCoordinates(event);
    if (coords) {
        const ctx = getCanvasContext();
        if (ctx) {
            ctx.lineTo(coords.x, coords.y);
            ctx.stroke();
        }
        lastPosition.current = coords;
    }
  };

  const stopDrawing = () => {
    isDrawing.current = false;
    lastPosition.current = null;
    const ctx = getCanvasContext();
    ctx?.beginPath(); // Reset the path
  };

  const clearCanvas = () => {
    playSound('click');
    const canvas = canvasRef.current;
    const ctx = getCanvasContext();
    if (canvas && ctx) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    setStatus('waiting');
  };

  const handleCheck = async () => {
    const canvas = canvasRef.current;
    if (!canvas || status === 'correct') return;
    playSound('click');
    setIsLoading(true);
    
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    
    try {
      const recognized = await recognizeLetter(imageDataUrl, alphabet);
      if (recognized.toUpperCase() === targetLetter.toUpperCase()) {
        setStatus('correct');
        playSound('success');
      } else {
        setStatus('incorrect');
        playSound('error');
      }
    } catch (error) {
      console.error(error);
      setStatus('incorrect');
      playSound('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    playSound('click');
    onNextLetter();
    setStatus('waiting');
    clearCanvas();
  };

  return (
    <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg p-8 w-full max-w-lg mx-auto flex flex-col items-center gap-6 animate-fadeIn">
      <h2 className="text-2xl font-bold text-slate-700 text-center">
        {T('drawingMode')}
        {language !== 'es-MX' && <span className="block text-sm font-normal text-slate-500 mt-1">({getTranslation('es-MX', 'drawingMode')})</span>}
      </h2>
      <p className="text-slate-600 text-center">
        {T('drawTheLetterYouSee')}
        {language !== 'es-MX' && <span className="block text-sm font-normal text-slate-500 mt-1">({getTranslation('es-MX', 'drawTheLetterYouSee')})</span>}
      </p>
      
      <div className="my-2 flex items-center justify-center gap-4">
        <div className="text-center">
            <p className="text-slate-600">
              {T('letterToDraw')}
              {language !== 'es-MX' && <span className="block text-xs font-normal text-slate-500 mt-0.5">({getTranslation('es-MX', 'letterToDraw')})</span>}
            </p>
            <p className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-600 to-slate-800 leading-none">
                {targetLetter}
            </p>
        </div>
        <button
            onClick={() => {
                playSound('click');
                // This should be fast due to the preloading in the useEffect hook.
                speakText(instructionText, character.voiceName, language);
            }}
            className="p-3 bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200 transition-all self-center"
            aria-label={T('listenToLetter')}
        >
            <SpeakerWaveIcon className="w-8 h-8" />
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        className="bg-white rounded-lg shadow-inner border-2 border-slate-300 cursor-crosshair touch-none"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      
      <div className="flex gap-4">
        <button onClick={clearCanvas} disabled={isLoading || status === 'correct'} className="px-6 py-2 bg-slate-500 text-white font-semibold rounded-lg shadow-md hover:bg-slate-600 transition-all disabled:bg-slate-300">
            {T('clear')}
            {language !== 'es-MX' && <span className="block text-xs font-normal mt-0.5 opacity-80">({getTranslation('es-MX', 'clear')})</span>}
        </button>
        <button onClick={handleCheck} disabled={isLoading || status === 'correct'} className="px-8 py-3 bg-purple-500 text-white font-semibold rounded-lg shadow-md hover:bg-purple-600 transition-all disabled:bg-slate-400">
            {isLoading ? T('checking') : T('check')}
            {language !== 'es-MX' && <span className="block text-xs font-normal mt-0.5 opacity-80">({getTranslation('es-MX', isLoading ? 'checking' : 'check')})</span>}
        </button>
      </div>

      <div className="h-16 mt-2">
        {status === 'correct' && (
          <div className="text-center animate-scaleIn">
            <p className="text-2xl font-bold text-green-600">
              {T('excellent')}
              {language !== 'es-MX' && <span className="block text-sm font-normal text-green-500 mt-1">({getTranslation('es-MX', 'excellent')})</span>}
            </p>
            <button
              onClick={handleNext}
              className="mt-2 px-6 py-2 bg-purple-500 text-white font-semibold rounded-lg shadow-md hover:bg-purple-600 transition-all"
            >
              {T('nextLetter')}
              {language !== 'es-MX' && <span className="block text-xs font-normal mt-0.5 opacity-80">({getTranslation('es-MX', 'nextLetter')})</span>}
            </button>
          </div>
        )}
        {status === 'incorrect' && (
          <div className="text-center animate-shake">
            <p className="text-xl font-semibold text-orange-600">
              {T('goodTry')}
              {language !== 'es-MX' && <span className="block text-sm font-normal text-orange-500 mt-1">({getTranslation('es-MX', 'goodTry')})</span>}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};