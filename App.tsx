import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Character } from './services/characterService';
import { Language } from './services/i18n';
import { LanguageSelection } from './components/LanguageSelection';
import { CharacterSelection } from './components/CharacterSelection';
import { ColorsMode } from './components/ColorsMode';
import { MatchingColorsMode } from './components/MatchingColorsMode';
import { ColorGameSelection } from './components/ColorGameSelection';
import { MathGameSelection } from './components/MathGameSelection';
import { ArithmeticMode } from './components/ArithmeticMode';
import { NumberWritingMode } from './components/NumberWritingMode';
import { WordsMode } from './components/WordsMode';
import { SentencesMode } from './components/SentencesMode';
import { CameraFeed, CameraFeedHandle } from './components/CameraFeed';
import { ResultDisplay } from './components/ResultDisplay';
import { recognizeLetter } from './services/geminiService';
import { playSound } from './services/soundService';
import { TypingMode } from './components/TypingMode';
import { ArrowLeftIcon, BookOpenIcon, Bars3BottomLeftIcon, SwatchIcon, HashtagIcon, UserIcon, GlobeAltIcon, SparklesIcon } from './components/Icons';
import { DecorativeBackground } from './components/DecorativeBackground';
import { UserLogin } from './components/UserLogin';
import { ProgressView } from './components/ProgressView';
import { AlphabetExplorerMode } from './components/AlphabetExplorerMode';
import { getTranslation } from './services/i18n';

type AppState = 'user_login' | 'lang_select' | 'char_select' | 'main_app';
type MainMode = 'alphabet' | 'alphabet_explorer' | 'words' | 'sentences' | 'colors' | 'numbers' | 'progress';
type InitialPath = 'colors' | 'numbers';

interface User {
  name: string;
  age: string;
}

const ALPHABETS: { [lang in Language]: string[] } = {
  'es-MX': 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split(''),
  'en-US': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
  'nah': 'ABCDEHIJKLMNÑOPSTUWXYZ'.split(''), // A simplified alphabet for Nahuatl
};

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [appState, setAppState] = useState<AppState>('user_login');
    const [mainMode, setMainMode] = useState<MainMode>('alphabet');
    const [initialPath, setInitialPath] = useState<InitialPath | null>(null);

    const [language, setLanguage] = useState<Language | null>(null);
    const [character, setCharacter] = useState<Character | null>(null);

    // Sub-states for modes
    const [letterMode, setLetterMode] = useState<'recognize' | 'quiz' | 'draw'>('recognize');
    const [colorGame, setColorGame] = useState<'selection' | 'camera' | 'matching'>('selection');
    const [numberGame, setNumberGame] = useState<'selection' | 'writing' | 'add-subtract' | 'multiply-divide'>('selection');

    // State for letter recognition/quiz
    const [recognizedLetter, setRecognizedLetter] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [targetLetter, setTargetLetter] = useState<string | null>(null);
    const [quizStatus, setQuizStatus] = useState<'waiting' | 'correct' | 'incorrect' | null>('waiting');
    const cameraFeedRef = useRef<CameraFeedHandle>(null);
    const currentAlphabet = useMemo(() => language ? ALPHABETS[language] : [], [language]);

    useEffect(() => {
        try {
            const savedUser = localStorage.getItem('currentUser');
            if (savedUser) {
                setCurrentUser(JSON.parse(savedUser));
                setAppState('lang_select');
            } else {
                setAppState('user_login');
            }
        } catch (error) {
            console.error("Failed to load user:", error);
            setAppState('user_login');
        }
    }, []);

    const handleLogin = (name: string, age: string) => {
        const user = { name, age };
        setCurrentUser(user);
        try {
            localStorage.setItem('currentUser', JSON.stringify(user));
        } catch (error) {
            console.error("Failed to save user:", error);
        }
        setAppState('lang_select');
    };
    
    const handleLogout = () => {
        try {
            localStorage.removeItem('currentUser');
        } catch (error) {
            console.error("Failed to remove user:", error);
        }
        setCurrentUser(null);
        setLanguage(null);
        setCharacter(null);
        setAppState('user_login');
        setInitialPath(null);
        setMainMode('alphabet');
        setLetterMode('recognize');
        setColorGame('selection');
        setNumberGame('selection');
    };

    const handleBackToLangSelect = () => {
        playSound('click');
        setLanguage(null);
        setCharacter(null);
        setAppState('lang_select');
        setInitialPath(null);
        setMainMode('alphabet');
        setLetterMode('recognize');
        setColorGame('selection');
        setNumberGame('selection');
        setQuizStatus('waiting');
        setTargetLetter(null);
        setRecognizedLetter(null);
        setError(null);
    };

    const handleSelectAlphabetPath = (lang: Language) => {
        setMainMode('alphabet');
        setLanguage(lang);
        setAppState('char_select');
    };

    const handleSelectColorsPath = () => {
        setInitialPath('colors');
        setAppState('lang_select');
    };

    const handleSelectNumbersPath = () => {
        setInitialPath('numbers');
        setAppState('lang_select');
    };

    const handleLanguageForPath = (lang: Language) => {
        if (initialPath) {
            setMainMode(initialPath);
        }
        setLanguage(lang);
        setAppState('char_select');
    };


    const handleCharacterSelect = (char: Character) => {
        setCharacter(char);
        setAppState('main_app');
    };

    const handleNextQuiz = useCallback(() => {
        setQuizStatus('waiting');
        setRecognizedLetter(null);
        setError(null);
        const randomIndex = Math.floor(Math.random() * currentAlphabet.length);
        setTargetLetter(currentAlphabet[randomIndex]);
    }, [currentAlphabet]);

    useEffect(() => {
        if (appState === 'main_app' && mainMode === 'alphabet' && letterMode === 'quiz' && !targetLetter) {
            handleNextQuiz();
        }
    }, [appState, mainMode, letterMode, targetLetter, handleNextQuiz]);

    const handleRecognizeLetter = async () => {
        if (isLoading || !cameraFeedRef.current) return;
        playSound('click');
        setIsLoading(true);
        setError(null);
        const imageDataUrl = cameraFeedRef.current.captureFrame();
        if (imageDataUrl) {
            try {
                const letter = await recognizeLetter(imageDataUrl, currentAlphabet);
                setRecognizedLetter(letter);

                if (letterMode === 'quiz') {
                    if (letter.toUpperCase() === targetLetter?.toUpperCase()) {
                        setQuizStatus('correct');
                    } else {
                        setQuizStatus('incorrect');
                    }
                }
            } catch (e: any) {
                setError(e.message || 'An unknown error occurred.');
                if (letterMode === 'quiz') setQuizStatus('incorrect');
            } finally {
                setIsLoading(false);
            }
        } else {
            setError('Could not capture frame from camera.');
            setIsLoading(false);
            if (letterMode === 'quiz') setQuizStatus('incorrect');
        }
    };

    const backgroundStyle = useMemo(() => {
        if (character) {
            return {
                backgroundImage: `url("${character.bgImage}")`,
                backgroundSize: 'cover',
                backgroundRepeat: 'repeat',
            };
        }
        return {};
    }, [character]);
    
    const renderAppContent = () => {
        if (appState !== 'main_app' || !language || !character || !currentUser) return null;
        const T = (key: string) => getTranslation(language, key);

        const mainContent = () => {
            switch(mainMode) {
                case 'alphabet':
                    return (
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-center bg-white/50 backdrop-blur-sm rounded-full p-2 gap-2 self-center">
                                <SubModeButton label="Reconocer" active={letterMode === 'recognize'} onClick={() => { setLetterMode('recognize'); setRecognizedLetter(null); }} />
                                <SubModeButton label="Quiz" active={letterMode === 'quiz'} onClick={() => { setLetterMode('quiz'); handleNextQuiz(); }} />
                                <SubModeButton label="Dibujar" active={letterMode === 'draw'} onClick={() => { setLetterMode('draw'); if(!targetLetter) handleNextQuiz(); }} />
                            </div>
                            {letterMode === 'draw' ? (
                                <TypingMode targetLetter={targetLetter || 'A'} onNextLetter={handleNextQuiz} language={language} alphabet={currentAlphabet} character={character} />
                            ) : (
                                <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-4">
                                        <CameraFeed ref={cameraFeedRef} />
                                        <button onClick={handleRecognizeLetter} disabled={isLoading} className="w-full py-3 text-lg font-bold text-white bg-purple-500 rounded-lg shadow-lg hover:bg-purple-600 transition-transform transform hover:scale-105 disabled:bg-slate-400">
                                            {isLoading ? 'Analizando...' : 'Reconocer Letra'}
                                        </button>
                                    </div>
                                    <ResultDisplay letter={recognizedLetter} isLoading={isLoading} error={error} mode={letterMode} quizStatus={quizStatus} targetLetter={targetLetter} onNextQuiz={handleNextQuiz} language={language} character={character} />
                                </div>
                            )}
                        </div>
                    );
                case 'alphabet_explorer':
                    return <AlphabetExplorerMode language={language} character={character} alphabet={currentAlphabet} />;
                case 'words':
                    return <WordsMode language={language} character={character} userName={currentUser.name} />;
                case 'sentences':
                    return <SentencesMode language={language} character={character} userName={currentUser.name} />;
                case 'colors':
                    if (colorGame === 'selection') return <ColorGameSelection onSelectGame={setColorGame} language={language} />;
                    if (colorGame === 'camera') return <ColorsMode language={language} character={character} userName={currentUser.name} />;
                    if (colorGame === 'matching') return <MatchingColorsMode language={language} character={character} userName={currentUser.name} />;
                    return null;
                case 'numbers':
                    if (numberGame === 'selection') return <MathGameSelection onSelectGame={setNumberGame} language={language} />;
                    if (numberGame === 'writing') return <NumberWritingMode language={language} character={character} userName={currentUser.name} />;
                    if (numberGame === 'add-subtract' || numberGame === 'multiply-divide') return <ArithmeticMode language={language} character={character} operationType={numberGame} onBackToMainSelection={() => setNumberGame('selection')} userName={currentUser.name}/>;
                    return null;
                case 'progress':
                    return <ProgressView userName={currentUser.name} language={language} />;
                default:
                    return null;
            }
        };

        return (
            <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-8 p-4 md:p-8">
                <aside className="w-full md:w-64 bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg flex flex-col gap-4 self-start">
                   <div className="flex items-center gap-3 border-b pb-4">
                       <UserIcon className="w-12 h-12 text-slate-500 flex-shrink-0" />
                       <div>
                           <p className="font-bold text-slate-700 text-lg">{currentUser.name}</p>
                           <p className="text-sm text-slate-500">Edad: {currentUser.age}</p>
                       </div>
                   </div>
                   <div className="flex items-center gap-3">
                       <img src={character.avatar} alt={character.name} className="w-16 h-16 rounded-lg" />
                       <div>
                           <p className="font-bold text-slate-700 text-lg">{character.name}</p>
                           <button onClick={() => { setCharacter(null); setAppState('char_select'); }} className="text-sm text-purple-600 hover:underline">Cambiar Guía</button>
                       </div>
                   </div>
                   <nav className="flex flex-col gap-2 border-t pt-4">
                       <ModeButton icon={<BookOpenIcon className="w-6 h-6"/>} label="Letras" active={mainMode === 'alphabet'} onClick={() => setMainMode('alphabet')} />
                       <ModeButton icon={<SparklesIcon className="w-6 h-6"/>} label={T('alphabetExplorer')} active={mainMode === 'alphabet_explorer'} onClick={() => setMainMode('alphabet_explorer')} />
                       <ModeButton icon={<Bars3BottomLeftIcon className="w-6 h-6"/>} label="Palabras" active={mainMode === 'words'} onClick={() => setMainMode('words')} />
                       <ModeButton icon={<Bars3BottomLeftIcon className="w-6 h-6"/>} label="Oraciones" active={mainMode === 'sentences'} onClick={() => setMainMode('sentences')} />
                       <ModeButton icon={<SwatchIcon className="w-6 h-6"/>} label="Colores" active={mainMode === 'colors'} onClick={() => { setMainMode('colors'); setColorGame('selection'); }} />
                       <ModeButton icon={<HashtagIcon className="w-6 h-6"/>} label="Números" active={mainMode === 'numbers'} onClick={() => { setMainMode('numbers'); setNumberGame('selection'); }} />
                       <ModeButton icon={<UserIcon className="w-6 h-6"/>} label="Progreso" active={mainMode === 'progress'} onClick={() => setMainMode('progress')} />
                   </nav>
                   <div className="border-t pt-4 mt-auto flex flex-col gap-2">
                        <button onClick={handleBackToLangSelect} className="w-full flex items-center gap-2 justify-center px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg font-semibold text-slate-700 shadow-sm">
                            <GlobeAltIcon className="w-5 h-5"/>
                            <span>Cambiar Idioma</span>
                        </button>
                        <button onClick={handleLogout} className="w-full flex items-center gap-2 justify-center px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg font-semibold text-slate-700 shadow-sm">
                            <ArrowLeftIcon className="w-5 h-5"/>
                            <span>Cambiar Usuario</span>
                        </button>
                   </div>
                </aside>
                <main className="flex-1">{mainContent()}</main>
            </div>
        );
    };

    const renderState = () => {
        switch (appState) {
            case 'user_login':
                return <UserLogin onLogin={handleLogin} />;
            case 'lang_select':
                if (initialPath === null) {
                    return <LanguageSelection 
                        onAlphabetSelect={handleSelectAlphabetPath} 
                        onColorsSelect={handleSelectColorsPath}
                        onNumbersSelect={handleSelectNumbersPath}
                    />;
                } else {
                    return <LanguageSelection
                        currentPath={initialPath}
                        onLanguageSelect={handleLanguageForPath}
                    />
                }
            case 'char_select':
                if (language) return <CharacterSelection onCharacterSelect={handleCharacterSelect} language={language} />;
                handleLogout();
                return null;
            case 'main_app':
                return renderAppContent();
            default:
                return null;
        }
    };
    
    return (
        <div className="min-h-screen w-full transition-all duration-500 relative overflow-hidden" style={backgroundStyle}>
            <DecorativeBackground />
            <div className="min-h-screen w-full flex items-center justify-center relative z-10">
              {renderState()}
            </div>
        </div>
    );
};

const ModeButton: React.FC<{icon: React.ReactNode, label: string, active: boolean, onClick: () => void}> = ({icon, label, active, onClick}) => (
    <button onClick={onClick} className={`flex items-center gap-4 p-3 rounded-lg text-left font-semibold transition-all ${active ? 'bg-purple-500 text-white shadow-md animate-pulse-glow' : 'text-slate-600 hover:bg-purple-100'}`}>
        {icon}
        <span>{label}</span>
    </button>
);
const SubModeButton: React.FC<{label: string, active: boolean, onClick: () => void}> = ({label, active, onClick}) => (
    <button onClick={onClick} className={`px-4 py-2 rounded-full font-semibold transition-all text-sm md:text-base ${active ? 'bg-purple-500 text-white' : 'bg-white text-slate-600 hover:bg-purple-100'}`}>
        {label}
    </button>
);

export default App;