
import React, { useState, useEffect } from 'react';
import { getTranslation, Language } from '../services/i18n';
import { Bars3BottomLeftIcon, SwatchIcon, HashtagIcon, PuzzlePieceIcon, CalculatorIcon, BookOpenIcon, CheckCircleIcon } from './Icons';
import { Character } from '../services/characterService';
import { TranslatedText } from './TranslatedText';

interface ProgressViewProps {
  userName: string;
  language: Language;
  character: Character;
}

const gameModes = [
    { id: 'words', nameKey: 'progressWords', key_prefix: 'reconocimientoLetrasProgresoPalabras', icon: <BookOpenIcon className="w-10 h-10" />, totalLevels: 8, color: 'text-green-500', bg: 'bg-green-100' },
    { id: 'sentences', nameKey: 'progressSentences', key_prefix: 'reconocimientoLetrasProgresoOraciones', icon: <Bars3BottomLeftIcon className="w-10 h-10" />, totalLevels: 2, color: 'text-blue-500', bg: 'bg-blue-100' },
    { id: 'colorsCamera', nameKey: 'progressColorsCamera', key_prefix: 'reconocimientoLetrasProgresoColores', icon: <SwatchIcon className="w-10 h-10" />, totalLevels: 8, color: 'text-pink-500', bg: 'bg-pink-100' },
    { id: 'colorsMatching', nameKey: 'progressColorsMatching', key_prefix: 'reconocimientoLetrasProgresoColoresMatching', icon: <PuzzlePieceIcon className="w-10 h-10" />, totalLevels: 4, color: 'text-purple-500', bg: 'bg-purple-100' },
    { id: 'numbersWriting', nameKey: 'progressNumbersWriting', key_prefix: 'reconocimientoLetrasProgresoNumerosEscritura', icon: <HashtagIcon className="w-10 h-10" />, totalLevels: 4, color: 'text-yellow-500', bg: 'bg-yellow-100' },
    { id: 'addSubtract', nameKey: 'progressAddSubtract', key_prefix: 'reconocimientoLetrasProgresoNumeros_add-subtract', icon: <CalculatorIcon className="w-10 h-10" />, totalLevels: 4, color: 'text-indigo-500', bg: 'bg-indigo-100' },
    { id: 'multiplyDivide', nameKey: 'progressMultiplyDivide', key_prefix: 'reconocimientoLetrasProgresoNumeros_multiply-divide', icon: <CalculatorIcon className="w-10 h-10" />, totalLevels: 4, color: 'text-red-500', bg: 'bg-red-100' },
];

const ProgressCard: React.FC<{mode: typeof gameModes[0], level: number, language: Language, character: Character}> = ({ mode, level, language, character }) => {
    const isComplete = (level - 1) >= mode.totalLevels;
    const progressPercent = isComplete ? 100 : Math.min(((level - 1) / mode.totalLevels) * 100, 100);

    return (
        <div className={`bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-6 flex flex-col gap-4 animate-fadeIn ${isComplete ? 'border-2 border-yellow-400' : ''}`} style={{ animationDelay: `${gameModes.findIndex(m => m.id === mode.id) * 100}ms` }}>
            <div className="flex items-center gap-4">
                 {isComplete ? (
                    <img src={character.avatar} alt={character.name} className="w-10 h-10 rounded-full" />
                ) : (
                    <div className={`p-3 rounded-full ${mode.bg} ${mode.color}`}>
                        {mode.icon}
                    </div>
                )}
                <div>
                    <h3 className="text-xl font-bold text-slate-700">
                        <TranslatedText language={language} textKey={mode.nameKey} />
                    </h3>
                    {isComplete ? (
                         <p className="font-semibold text-green-600 flex items-center gap-1">
                            <CheckCircleIcon className="w-5 h-5" />
                            <TranslatedText language={language} textKey="complete" />
                         </p>
                    ) : (
                        <p className={`text-sm font-semibold ${mode.color}`}>
                            <TranslatedText language={language} textKey="progressLevelOf" replacements={{ current: (level - 1).toString(), total: mode.totalLevels.toString() }} />
                        </p>
                    )}
                </div>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-4">
                <div 
                    className={`rounded-full h-4 transition-all duration-1000 ${isComplete ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : mode.bg.replace('100', '500')}`}
                    style={{ width: `${progressPercent}%` }}
                ></div>
            </div>
        </div>
    )
}

export const ProgressView: React.FC<ProgressViewProps> = ({ userName, language, character }) => {
    const [progress, setProgress] = useState<{[key: string]: number}>({});

    useEffect(() => {
        const newProgress: {[key: string]: number} = {};
        gameModes.forEach(mode => {
            try {
                const key = `${mode.key_prefix}_${userName}`;
                const savedProgress = localStorage.getItem(key);
                newProgress[mode.id] = savedProgress ? JSON.parse(savedProgress) : 1;
            } catch (error) {
                console.error(`Failed to load progress for ${mode.nameKey}:`, error);
                newProgress[mode.id] = 1;
            }
        });
        setProgress(newProgress);
    }, [userName]);

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
            <h2 className="text-4xl font-bold text-slate-800 text-center"><TranslatedText language={language} textKey="myProgress" /></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {gameModes.map(mode => (
                    <ProgressCard 
                        key={mode.id}
                        mode={mode}
                        level={progress[mode.id] || 1}
                        language={language}
                        character={character}
                    />
                ))}
            </div>
        </div>
    );
};
