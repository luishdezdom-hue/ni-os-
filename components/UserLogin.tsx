import React, { useState } from 'react';

interface UserLoginProps {
    onLogin: (name: string, age: string) => void;
}

export const UserLogin: React.FC<UserLoginProps> = ({ onLogin }) => {
    const [name, setName] = useState('');
    const [age, setAge] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim() && age.trim()) {
            onLogin(name.trim(), age.trim());
        }
    };

    return (
        <div className="w-full max-w-md mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 text-center animate-fadeIn">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight">
                ¡Bienvenido!
            </h1>
            <p className="text-slate-600 mt-3 text-lg mb-8">
                Ingresa tu nombre y edad para guardar tu progreso y empezar a aprender.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu Nombre"
                    className="w-full p-4 text-lg border-2 border-slate-300 rounded-lg shadow-inner focus:border-purple-500 focus:ring-purple-500 transition-all"
                    required
                    aria-label="Tu Nombre"
                />
                <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Tu Edad"
                    className="w-full p-4 text-lg border-2 border-slate-300 rounded-lg shadow-inner focus:border-purple-500 focus:ring-purple-500 transition-all"
                    required
                    min="1"
                    aria-label="Tu Edad"
                />
                <button
                    type="submit"
                    disabled={!name.trim() || !age.trim()}
                    className="w-full mt-4 px-8 py-4 bg-purple-500 text-white font-bold text-xl rounded-lg shadow-lg hover:bg-purple-600 transition-all transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                    Empezar a Aprender
                </button>
            </form>
        </div>
    );
};