import React from 'react';
import { Language } from '../services/i18n';

interface LanguageSelectionProps {
  onLanguageSelect: (language: Language) => void;
}

const LanguageCard: React.FC<{
  onClick: () => void;
  lang: string;
  country: string;
  flag: string;
}> = ({ onClick, lang, country, flag }) => (
  <button
    onClick={onClick}
    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 w-full text-center transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:bg-white group"
  >
    <div className="text-6xl mb-4 transition-transform duration-300 group-hover:scale-110">
      {flag}
    </div>
    <h2 className="text-2xl font-bold text-slate-800">{lang}</h2>
    <p className="text-slate-500">{country}</p>
  </button>
);

export const LanguageSelection: React.FC<LanguageSelectionProps> = ({ onLanguageSelect }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-emerald-200 flex flex-col items-center justify-center p-4 font-sans animate-fadeIn">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight">
          ¡Bienvenido / Welcome!
        </h1>
        <p className="text-slate-600 mt-3 text-lg max-w-md mx-auto">
          Selecciona tu idioma para comenzar la aventura de aprendizaje.
        </p>
        <p className="text-slate-500 mt-1 text-base">
          Select your language to begin the learning adventure.
        </p>
      </div>
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8">
        <LanguageCard
          onClick={() => onLanguageSelect('es-MX')}
          lang="Español"
          country="México"
          flag="🇲🇽"
        />
        <LanguageCard
          onClick={() => onLanguageSelect('en-US')}
          lang="English"
          country="USA"
          flag="🇺🇸"
        />
        <LanguageCard
          onClick={() => onLanguageSelect('nah')}
          lang="Náhuatl"
          country="Huasteca"
          flag="🌺"
        />
      </div>
       <footer className="text-center mt-12 text-slate-500">
          <p>UMB ATENCO</p>
      </footer>
    </div>
  );
};
