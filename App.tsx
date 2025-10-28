import React, { useState, useRef, useCallback, useEffect } from 'react';
import { CameraFeed, CameraFeedHandle } from './components/CameraFeed';
import { ResultDisplay } from './components/ResultDisplay';
import { TypingMode } from './components/TypingMode';
import { WordsMode } from './components/WordsMode';
import { SentencesMode } from './components/SentencesMode';
import { recognizeLetter } from './services/geminiService';
import { CameraIcon, SparklesIcon, PowerIcon, QuestionMarkCircleIcon, PencilIcon, BookOpenIcon, HomeIcon, ArrowUpTrayIcon, ChatBubbleBottomCenterTextIcon } from './components/Icons';
import { playSound, primeAlphabetCache } from './services/soundService';
import { LanguageSelection } from './components/LanguageSelection';
import { getTranslation, Language } from './services/i18n';
import { Character } from './services/characterService';
import { CharacterSelection } from './components/CharacterSelection';

type Mode = 'recognize' | 'quiz' | 'typing' | 'words' | 'sentences';
type MediaSource = 'none' | 'camera' | 'video';

const ALPHABETS = {
  'es-MX': 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split(''),
  'en-US': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
  'nah': 'ACHEIKLMNOPQTUXZ'.split(''),
};

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language | null>(null);
  const [character, setCharacter] = useState<Character | null>(null);
  const [mode, setMode] = useState<Mode>('recognize');
  const [recognizedLetter, setRecognizedLetter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaSource, setMediaSource] = useState<MediaSource>('none');
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  
  const [targetLetter, setTargetLetter] = useState<string | null>(null);
  const [quizStatus, setQuizStatus] = useState<'correct' | 'incorrect' | 'waiting' | null>(null);

  const cameraFeedRef = useRef<CameraFeedHandle>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  const T = (key: string, replacements?: {[key: string]: string}) => {
    return getTranslation(language!, key, replacements);
  };

  const generateNewTargetLetter = useCallback(() => {
    if (!language) return;
    const alphabet = ALPHABETS[language];
    const newLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
    setTargetLetter(newLetter);
    setRecognizedLetter(null);
    setQuizStatus('waiting');
    setError(null);
  }, [language]);

  useEffect(() => {
    setRecognizedLetter(null);
    setError(null);
    setIsLoading(false);

    if (mode === 'quiz' || mode === 'typing') {
      generateNewTargetLetter();
    }
    
    if (mode === 'typing' || mode === 'words' || mode === 'sentences') {
        if (mediaSource === 'video' && videoSrc) {
            URL.revokeObjectURL(videoSrc);
            setVideoSrc(null);
        }
        setMediaSource('none');
    }

  }, [mode, generateNewTargetLetter]);
  
  const handleLanguageSelect = (lang: Language) => {
    playSound('click');
    setLanguage(lang);
  };

  const handleCharacterSelect = (char: Character) => {
    playSound('success');
    setCharacter(char);
    // Pre-load all letter sounds for the selected language and voice in the background
    if (language) {
      primeAlphabetCache(ALPHABETS[language], char.voiceName, language);
    }
  };

  const handleRecognize = useCallback(async () => {
    if (!cameraFeedRef.current || !language) return;
    playSound('click');
    const imageDataUrl = cameraFeedRef.current.captureFrame();

    if (imageDataUrl) {
      setIsLoading(true);
      setError(null);
      setRecognizedLetter(null);
      try {
        const letter = await recognizeLetter(imageDataUrl, ALPHABETS[language]);
        setRecognizedLetter(letter);

        if (mode === 'quiz' && targetLetter) {
            if (letter.toUpperCase() === targetLetter.toUpperCase()) {
                setQuizStatus('correct');
            } else {
                setQuizStatus('incorrect');
            }
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : T('errorUnknown'));
      } finally {
        setIsLoading(false);
      }
    } else {
      setError(T('errorCapture'));
    }
  }, [mode, targetLetter, language, T]);
  
  const toggleCamera = () => {
    playSound('click');
    if (mediaSource === 'camera') {
        setRecognizedLetter(null);
        setError(null);
        setMediaSource('none');
    } else {
        setMediaSource('camera');
    }
  };
  
  const handleUploadClick = () => {
    videoInputRef.current?.click();
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      playSound('click');
      const url = URL.createObjectURL(file);
      if (videoSrc) {
        URL.revokeObjectURL(videoSrc);
      }
      setVideoSrc(url);
      setMediaSource('video');
      setRecognizedLetter(null);
      setError(null);
    }
  };

  const removeVideo = () => {
    playSound('click');
    if (videoSrc) {
      URL.revokeObjectURL(videoSrc);
    }
    setVideoSrc(null);
    setMediaSource('none');
    setRecognizedLetter(null);
    setError(null);
    if(videoInputRef.current) {
        videoInputRef.current.value = "";
    }
  };

  const handleModeChange = (newMode: Mode) => {
    playSound('click');
    if (mode !== newMode) {
      setMode(newMode);
    }
  };
  
  const handleGoHome = () => {
    playSound('click');
    setLanguage(null);
    setCharacter(null);
  };

  if (!language) {
    return <LanguageSelection onLanguageSelect={handleLanguageSelect} />;
  }

  if (!character) {
    return <CharacterSelection onCharacterSelect={handleCharacterSelect} language={language} />;
  }

  const SidebarButton: React.FC<{ currentMode: Mode; targetMode: Mode; onClick: (mode: Mode) => void; icon: React.ReactNode; text: string }> = ({ currentMode, targetMode, onClick, icon, text }) => (
    <button
      onClick={() => onClick(targetMode)}
      className={`w-full flex items-center justify-start gap-3 px-4 py-3 rounded-lg font-semibold transition-all duration-300 text-base ${
        currentMode === targetMode
          ? 'bg-green-600 text-white shadow-lg'
          : 'bg-white/60 hover:bg-green-100 text-slate-700'
      }`}
    >
      {icon}
      <span>{text}</span>
    </button>
  );

  const showCameraControls = mode === 'recognize' || mode === 'quiz';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-emerald-200 flex flex-col items-center p-4 font-sans">
      <div className="w-full max-w-6xl mx-auto">
        <header className="relative text-center mb-6 bg-white/50 backdrop-blur-sm p-4 rounded-xl shadow-md">
          <button
            onClick={handleGoHome}
            className="absolute top-1/2 -translate-y-1/2 left-4 bg-white/60 p-2 rounded-full text-slate-600 hover:bg-white hover:text-green-600 transition-all"
            aria-label={T('backToHome')}
          >
            <HomeIcon className="w-6 h-6" />
          </button>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight">
            {T('title')}
          </h1>
          <p className="text-slate-600 mt-2 text-lg">
            {T('subtitle')}
          </p>
          <div className="absolute top-1/2 -translate-y-1/2 right-4 bg-white/60 p-1 rounded-full shadow-md">
             <img src={character.avatar} alt={character.name} className="w-12 h-12 rounded-full" />
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* --- Left Sidebar --- */}
          <aside className="w-full lg:w-1/3 xl:w-1/4 flex flex-col gap-6">
            <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold text-slate-700 mb-4">{T('modes')}</h2>
                <div className="flex flex-col gap-3">
                    <SidebarButton currentMode={mode} targetMode="recognize" onClick={handleModeChange} icon={<SparklesIcon className="w-6 h-6" />} text={T('recognize')} />
                    <SidebarButton currentMode={mode} targetMode="quiz" onClick={handleModeChange} icon={<QuestionMarkCircleIcon className="w-6 h-6" />} text={T('quiz')} />
                    <SidebarButton currentMode={mode} targetMode="typing" onClick={handleModeChange} icon={<PencilIcon className="w-6 h-6" />} text={T('typing')} />
                    <SidebarButton currentMode={mode} targetMode="words" onClick={handleModeChange} icon={<BookOpenIcon className="w-6 h-6" />} text={T('words')} />
                    <SidebarButton currentMode={mode} targetMode="sentences" onClick={handleModeChange} icon={<ChatBubbleBottomCenterTextIcon className="w-6 h-6" />} text={T('sentences')} />
                </div>
            </div>

            {showCameraControls && (
                 <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl shadow-lg">
                     <h2 className="text-xl font-bold text-slate-700 mb-4">{T('controls')}</h2>
                     {mediaSource !== 'none' ? (
                        <div className="flex flex-col gap-4">
                            <button
                                onClick={handleRecognize}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-500 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-green-600 transition-transform transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:scale-100"
                            >
                                <SparklesIcon className="w-7 h-7" />
                                {isLoading ? T('recognizing') : T('recognizeLetter')}
                            </button>
                            {mediaSource === 'camera' && (
                                <button
                                    onClick={toggleCamera}
                                    className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition-all"
                                >
                                    <PowerIcon className="w-6 h-6" />
                                    {T('turnOffCamera')}
                                </button>
                            )}
                            {mediaSource === 'video' && (
                                 <button
                                    onClick={removeVideo}
                                    className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition-all"
                                >
                                    <PowerIcon className="w-6 h-6" />
                                    {T('removeVideo')}
                                </button>
                            )}
                        </div>
                     ) : (
                        <div className="flex flex-col gap-4">
                            <button
                                onClick={toggleCamera}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                <CameraIcon className="w-6 h-6" />
                                {T('turnOnCamera')}
                            </button>
                            <button
                                onClick={handleUploadClick}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                            >
                                <ArrowUpTrayIcon className="w-6 h-6" />
                                {T('uploadVideo')}
                            </button>
                            <input
                                type="file"
                                ref={videoInputRef}
                                onChange={handleVideoUpload}
                                accept="video/*"
                                className="hidden"
                            />
                        </div>
                     )}
                 </div>
            )}
          </aside>

          {/* --- Main Content Area --- */}
          <main className="w-full lg:w-2/3 xl:w-3/4">
            <div key={mode} className="animate-fadeIn">
              {mode === 'typing' && <TypingMode key={targetLetter} targetLetter={targetLetter!} onNextLetter={generateNewTargetLetter} language={language} alphabet={ALPHABETS[language]} character={character} />}
              {mode === 'words' && <WordsMode language={language} character={character} />}
              {mode === 'sentences' && <SentencesMode language={language} character={character} />}
              {showCameraControls && (
                  <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg p-4 md:p-8 flex flex-col gap-8">
                      <div className="flex-1 flex flex-col items-center justify-center bg-slate-100 rounded-xl p-4 min-h-[300px] lg:min-h-[480px]">
                          {mediaSource !== 'none' ? (
                              <CameraFeed ref={cameraFeedRef} videoSrc={videoSrc ?? undefined} />
                          ) : (
                              <div className="text-center p-8">
                                  <CameraIcon className="w-24 h-24 text-slate-400 mx-auto" />
                                  <p className="text-slate-500 mt-4 text-lg">{T('cameraOrVideo')}</p>
                              </div>
                          )}
                      </div>
                      <div className="bg-slate-50 rounded-xl p-6 shadow-inner">
                          <h2 className="text-2xl font-bold text-slate-700 mb-4">
                              {mode === 'recognize' && T('result')}
                              {mode === 'quiz' && T('yourMission')}
                          </h2>
                          <ResultDisplay
                              letter={recognizedLetter}
                              isLoading={isLoading}
                              error={error}
                              mode={mode}
                              quizStatus={quizStatus}
                              targetLetter={targetLetter}
                              onNextQuiz={generateNewTargetLetter}
                              language={language}
                              character={character}
                          />
                      </div>
                  </div>
              )}
            </div>
          </main>
        </div>

        <footer className="text-center mt-8 text-slate-500 bg-white/50 p-2 rounded-lg">
            <p>UMB ATENCO</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
