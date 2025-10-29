import React from 'react';
import { getTranslation, Language } from '../services/i18n';
import { CameraIcon, PuzzlePieceIcon } from './Icons';
import { TranslatedText } from './TranslatedText';

interface ColorGameSelectionProps {
    onSelectGame: (gameType: 'camera' | 'matching') => void;
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
    <div className="text-purple-500 transition-transform duration-300 group-hover:scale-110">
      {icon}
    </div>
    <div>
      <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
    </div>
  </button>
);


export const ColorGameSelection: React.FC<ColorGameSelectionProps> = ({ onSelectGame, language }) => {
    return (
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-8 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                <GameCard
                    onClick={() => onSelectGame('camera')}
                    title={<TranslatedText language={language} textKey="findWithCamera" />}
                    icon={<CameraIcon className="w-20 h-20" />}
                />
                <GameCard
                    onClick={() => onSelectGame('matching')}
                    title={<TranslatedText language={language} textKey="matchTheColor" />}
                    icon={<PuzzlePieceIcon className="w-20 h-20" />}
                />
            </div>
        </div>
    );
};
