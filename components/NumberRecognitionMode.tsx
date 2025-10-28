import React, { useState, useRef } from 'react';
import { CameraFeed, CameraFeedHandle } from './CameraFeed';
import { recognizeNumber } from '../services/geminiService';
import { speakText, playSound } from '../services/soundService';
import { getTranslation, Language } from '../services/i18n';
import { Character } from '../services/characterService';

interface NumberRecognitionModeProps {
  language: Language;
  character: Character;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mb-4"></div>
        <p className="text-slate-600 font-semibold">Analyzing...</p>
    </div>
);

export const NumberRecognitionMode: React.FC<NumberRecognitionModeProps> = ({ language, character }) => {
  const [recognizedNumber, setRecognizedNumber] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cameraFeedRef = useRef<CameraFeedHandle>(null);

  const T = (key: string, replacements?: {[key: string]: string}) => getTranslation(language, key, replacements);

  const handleRecognize = async () => {
    if (isLoading || !cameraFeedRef.current) return;
    playSound('click');
    setIsLoading(true);
    setError(null);
    setRecognizedNumber(null);

    const imageDataUrl = cameraFeedRef.current.captureFrame();
    if (imageDataUrl) {
      try {
        const number = await recognizeNumber(imageDataUrl);
        setRecognizedNumber(number);
        if (number !== '?') {
            playSound('success');
            speakText(number, character.voiceName, language);
        } else {
            playSound('error');
        }
      } catch (e: any) {
        setError(e.message || 'An unknown error occurred.');
        playSound('error');
      } finally {
        setIsLoading(false);
      }
    } else {
      setError('Could not capture frame from camera.');
      setIsLoading(false);
      playSound('error');
    }
  };

  const renderResult = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }
    if (error) {
      return (
        <div className="text-center text-red-600 bg-red-100 p-4 rounded-lg animate-shake">
          <p className="font-bold">{T('ohNo')}</p>
          <p>{error}</p>
        </div>
      );
    }
    if (recognizedNumber) {
      if (recognizedNumber === '?') {
        return (
          <div className="text-center animate-shake">
            <p className="text-8xl font-black text-slate-400">?</p>
            <p className="mt-2 text-slate-600 font-semibold">{T('couldNotIdentify')}</p>
            <p className="mt-1 text-sm text-slate-500">{T('tryCentering')}</p>
          </div>
        );
      }
      return (
        <div className="text-center animate-scaleIn">
          <p className="text-slate-600 text-lg mb-2">{T('itLooksLike')}</p>
          <p className="text-9xl md:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 leading-none">
            {recognizedNumber}
          </p>
        </div>
      );
    }
    return (
      <div className="text-center text-slate-500">
        <p className="text-lg">{T('showAndRecognize')}</p>
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-6">
        <div className="flex-1 flex flex-col gap-4">
            <CameraFeed ref={cameraFeedRef} />
            <button onClick={handleRecognize} disabled={isLoading} className="w-full py-4 text-xl font-bold text-white bg-purple-500 rounded-lg shadow-lg hover:bg-purple-600 transition-transform transform hover:scale-105 disabled:bg-slate-400">
                {isLoading ? 'Analyzing...' : 'Recognize Number'}
            </button>
        </div>
        <div className="flex-1 flex items-center justify-center h-full min-h-[200px] bg-slate-100/60 rounded-lg p-4">
            {renderResult()}
        </div>
    </div>
  );
};
