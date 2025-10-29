// components/MathGameSelection.tsx
import React from 'react';
import { getTranslation, Language } from '../services/i18n';
import { PlusMinusIcon, XMarkIcon, DivideIcon, PaintBrushIcon } from './Icons';
import { TranslatedText } from './TranslatedText';

interface MathGameSelectionProps {
    onSelectGame: (gameType: 'add-subtract' | 'multiply-divide' | 'writing') => void;
    language: Language;
}

const GameCard: React.FC<{
  onClick: () => void;
  title: React.ReactNode;
  icon: React.ReactNode;
}> = ({ onClick, title, icon }) => (
  <button
    onClick={onClick}
    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 w-full text-center transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:bg-white group flex flex-col items-center justify-center gap-4"
  >
    <div className="text-indigo-500 transition-transform duration-300 group-hover:scale-110">
      {icon}
    </div>
    <div>
      <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
    </div>
  </button>
);


export const MathGameSelection: React.FC<MathGameSelectionProps> = ({ onSelectGame, language }) => {
    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-8 animate-fadeIn">
             <div className="w-full">
                <GameCard
                    onClick={() => onSelectGame('writing')}
                    title={<TranslatedText language={language} textKey="writeTheNumber" />}
                    icon={<PaintBrushIcon className="w-20 h-20" />}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                <GameCard
                    onClick={() => onSelectGame('add-subtract')}
                    title={<TranslatedText language={language} textKey="addAndSubtract" />}
                    icon={
                        <div className="relative w-20 h-20">
                            <PlusMinusIcon className="w-20 h-20" />
                        </div>
                    }
                />
                <GameCard
                    onClick={() => onSelectGame('multiply-divide')}
                    title={<TranslatedText language={language} textKey="multiplyAndDivide" />}
                     icon={
                        <div className="relative w-20 h-20">
                           <XMarkIcon className="w-12 h-12 absolute top-0 left-0" />
                           <DivideIcon className="w-12 h-12 absolute bottom-0 right-0" />
                        </div>
                    }
                />
            </div>
        </div>
    );
};
