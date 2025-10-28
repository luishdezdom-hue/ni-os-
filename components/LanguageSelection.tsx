import React from 'react';
import { Language } from '../services/i18n';
import { PaintBrushIcon, CalculatorIcon } from './Icons';

interface LanguageSelectionProps {
  onAlphabetSelect?: (language: Language) => void;
  onColorsSelect?: () => void;
  onNumbersSelect?: () => void;
  onLanguageSelect?: (language: Language) => void;
  currentPath?: 'colors' | 'numbers';
}

const LanguageCard: React.FC<{
  onClick: () => void;
  lang: string;
  country: string;
  flag: string;
  subtitle?: string;
}> = ({ onClick, lang, country, flag, subtitle }) => (
  <button
    onClick={onClick}
    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 w-full text-center transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:bg-white group"
  >
    <div className="text-6xl mb-4 transition-transform duration-300 group-hover:scale-110">
      {flag}
    </div>
    <h2 className="text-2xl font-bold text-slate-800">{lang}</h2>
    <p className="text-slate-500">{country}</p>
    {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
  </button>
);

export const LanguageSelection: React.FC<LanguageSelectionProps> = ({ onAlphabetSelect, onColorsSelect, onNumbersSelect, onLanguageSelect, currentPath }) => {
  if (currentPath && onLanguageSelect) {
    const title = currentPath === 'colors' ? 'Elige un Idioma para Colores' : 'Elige un Idioma para Números';
    const subtitle = currentPath === 'colors' ? 'Selecciona el idioma en el que quieres aprender los colores.' : 'Selecciona el idioma para las operaciones matemáticas.';

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-200 to-purple-300 flex flex-col items-center justify-center p-4 font-sans animate-fadeIn">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight">
                {title}
                </h1>
                <p className="text-slate-600 mt-3 text-lg max-w-md mx-auto">
                {subtitle}
                </p>
            </div>
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8">
                <LanguageCard onClick={() => onLanguageSelect('es-MX')} lang="Español" country="México" flag="🇲🇽" />
                <LanguageCard onClick={() => onLanguageSelect('en-US')} lang="English" country="USA" flag="🇺🇸" />
                <LanguageCard onClick={() => onLanguageSelect('nah')} lang="Náhuatl" country="Huasteca" flag="🌺" />
            </div>
            <footer className="text-center mt-12 text-slate-500">
                <p>UMB ATENCO</p>
            </footer>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-200 to-purple-300 flex flex-col items-center justify-center p-4 font-sans animate-fadeIn">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight">
          ¡Bienvenido / Welcome!
        </h1>
        <p className="text-slate-600 mt-3 text-lg max-w-2xl mx-auto">
          Selecciona un idioma para comenzar tu aventura de aprendizaje con las letras.
        </p>
      </div>
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8">
        <LanguageCard onClick={() => onAlphabetSelect?.('es-MX')} lang="Español" country="México" flag="🇲🇽" />
        <LanguageCard onClick={() => onAlphabetSelect?.('en-US')} lang="English" country="USA" flag="🇺🇸" />
        <LanguageCard onClick={() => onAlphabetSelect?.('nah')} lang="Náhuatl" country="Huasteca" flag="🌺" />
      </div>
       <footer className="text-center mt-12 text-slate-500">
          <p>UMB ATENCO</p>
      </footer>
    </div>
  );
};