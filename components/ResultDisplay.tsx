import React, { useEffect } from 'react';
import { playSound, speakText, preloadSpeech } from '../services/soundService';
import { getTranslation, Language } from '../services/i18n';
import { Character } from '../services/characterService';

interface ResultDisplayProps {
  letter: string | null;
  isLoading: boolean;
  error: string | null;
  mode: 'recognize' | 'quiz';
  quizStatus: 'correct' | 'incorrect' | 'waiting' | null;
  targetLetter: string | null;
  onNextQuiz: () => void;
  language: Language;
  character: Character;
}

const LoadingSpinner: React.FC<{ language: Language }> = ({ language }) => {
  const T = (key: string) => getTranslation(language, key);
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mb-4"></div>
      <p className="text-slate-600 font-semibold">
        {T('analyzing')}
        {language !== 'es-MX' && <span className="block text-xs font-normal text-slate-500 mt-0.5">({getTranslation('es-MX', 'analyzing')})</span>}
      </p>

      <p className="text-slate-500 text-sm">
        {T('identifyingLetter')}
        {language !== 'es-MX' && <span className="block text-xs font-normal mt-0.5">({getTranslation('es-MX', 'identifyingLetter')})</span>}
      </p>
    </div>
  );
};

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ letter, isLoading, error, mode, quizStatus, targetLetter, onNextQuiz, language, character }) => {
  const T = (key: string, replacements?: {[key: string]: string}) => getTranslation(language, key, replacements);

  // Speak the target letter when a new quiz starts
  useEffect(() => {
    if (mode === 'quiz' && targetLetter && quizStatus === 'waiting') {
      const instruction = T('findTheLetter', { letter: targetLetter });
      const successMessage = T('correctIsLetter', { letter: targetLetter });
      // Preload the success message for when the user gets it right.
      preloadSpeech(successMessage, character.voiceName, language);
      // Speak the instruction for the new letter.
      speakText(instruction, character.voiceName, language);
    }
  }, [mode, targetLetter, quizStatus, language, T, character]);

  // Handle results for quiz mode
  useEffect(() => {
    if (quizStatus === 'correct' && targetLetter) {
      playSound('success');
      // This should be faster now due to preloading when the quiz letter appeared.
      speakText(T('correctIsLetter', { letter: targetLetter }), character.voiceName, language);
    } else if (quizStatus === 'incorrect') {
      playSound('error');
    }
  }, [quizStatus, targetLetter, language, T, character]);

  // Handle results for recognize mode
  useEffect(() => {
    if (mode === 'recognize' && letter) {
      if (letter === '?') {
        playSound('error');
      } else {
        playSound('success');
        speakText(letter, character.voiceName, language); // Pronounce the recognized letter
      }
    }
  }, [letter, mode, character, language]);
  
  const handleNextQuiz = () => {
    playSound('click');
    onNextQuiz();
  };

  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner language={language} />;
    }
    if (error) {
      return (
        <div className="text-center text-red-600 bg-red-100 p-4 rounded-lg animate-shake">
          <p className="font-bold">
            {T('ohNo')}
            {language !== 'es-MX' && <span className="block text-sm font-normal text-red-500 mt-0.5">({getTranslation('es-MX', 'ohNo')})</span>}
          </p>
          <p>{error}</p>
        </div>
      );
    }

    if (mode === 'quiz') {
        if (quizStatus === 'correct') {
            return (
                <div className="text-center animate-scaleIn">
                    <p className="text-2xl font-bold text-green-600">
                        {T('correctExclamation')}
                        {language !== 'es-MX' && <span className="block text-sm font-normal text-green-500 mt-0.5">({getTranslation('es-MX', 'correctExclamation')})</span>}
                    </p>
                    <p className="text-slate-600 mt-2">
                        {T('youFoundLetter')}
                        {language !== 'es-MX' && <span className="block text-xs font-normal text-slate-500 mt-0.5">({getTranslation('es-MX', 'youFoundLetter')})</span>}
                    </p>
                    <p className="text-8xl font-black text-green-500">{targetLetter}</p>
                    <button
                        onClick={handleNextQuiz}
                        className="mt-4 px-6 py-2 bg-purple-500 text-white font-semibold rounded-lg shadow-md hover:bg-purple-600 transition-all"
                    >
                        <span className="text-center">
                            {T('nextLetter')}
                            {language !== 'es-MX' && <span className="block text-xs font-normal mt-0.5 opacity-80">({getTranslation('es-MX', 'nextLetter')})</span>}
                        </span>
                    </button>
                </div>
            )
        }
        if (quizStatus === 'incorrect' && letter) {
             return (
                <div className="text-center animate-shake">
                    <p className="text-2xl font-bold text-orange-600">
                        {T('almost')}
                        {language !== 'es-MX' && <span className="block text-sm font-normal text-orange-500 mt-0.5">({getTranslation('es-MX', 'almost')})</span>}
                    </p>
                    <p className="text-slate-600 mt-2">
                        {T('cameraSaw', { sawLetter: letter, targetLetter: targetLetter! })}
                        {language !== 'es-MX' && <span className="block text-xs font-normal text-slate-500 mt-0.5">({getTranslation('es-MX', 'cameraSaw', { sawLetter: letter, targetLetter: targetLetter! })})</span>}
                    </p>
                    <p className="text-slate-500 mt-2">
                        {T('keepTrying')}
                        {language !== 'es-MX' && <span className="block text-xs font-normal text-slate-500 mt-0.5">({getTranslation('es-MX', 'keepTrying')})</span>}
                    </p>
                </div>
            )
        }
        return (
            <div className="text-center animate-scaleIn">
                <p className="text-slate-600 text-lg mb-2">
                    {T('findThisLetter')}
                    {language !== 'es-MX' && <span className="block text-xs font-normal text-slate-500 mt-0.5">({getTranslation('es-MX', 'findThisLetter')})</span>}
                </p>
                <p className="text-9xl md:text-[10rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 leading-none">
                    {targetLetter}
                </p>
            </div>
        )
    }

    // Default 'recognize' mode
    if (letter) {
      if (letter === '?') {
        return (
             <div className="text-center animate-shake">
                <p className="text-8xl font-black text-slate-400">?</p>
                <p className="mt-2 text-slate-600 font-semibold">
                    {T('couldNotIdentify')}
                    {language !== 'es-MX' && <span className="block text-xs font-normal text-slate-500 mt-0.5">({getTranslation('es-MX', 'couldNotIdentify')})</span>}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                    {T('tryCentering')}
                    {language !== 'es-MX' && <span className="block text-xs font-normal text-slate-500 mt-0.5">({getTranslation('es-MX', 'tryCentering')})</span>}
                </p>
            </div>
        )
      }
      return (
        <div className="text-center animate-scaleIn">
            <p className="text-slate-600 text-lg mb-2">
                {T('itLooksLike')}
                {language !== 'es-MX' && <span className="block text-xs font-normal text-slate-500 mt-0.5">({getTranslation('es-MX', 'itLooksLike')})</span>}
            </p>
            <p className="text-9xl md:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 leading-none">
                {letter}
            </p>
        </div>
      );
    }
    return (
      <div className="text-center text-slate-500">
        <p className="text-lg">
          {T('showAndRecognize')}
          {language !== 'es-MX' && <span className="block text-sm font-normal mt-1">({getTranslation('es-MX', 'showAndRecognize')})</span>}
        </p>
      </div>
    );
  };

  return (
    <div className="flex items-center justify-center h-full min-h-[200px] bg-slate-100/60 rounded-lg p-4">
      {renderContent()}
    </div>
  );
};