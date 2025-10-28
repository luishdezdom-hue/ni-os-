import React from 'react';

const decorations = [
  // Letters - White & Larger
  { content: 'A', top: '10%', left: '5%', size: 'text-6xl', color: 'text-white/20', animationClass: 'animate-float', duration: '12s', delay: '0s', blur: '' },
  { content: 'b', top: '25%', left: '85%', size: 'text-8xl', color: 'text-white/30', animationClass: 'animate-float-2', duration: '15s', delay: '2s', blur: '' },
  { content: 'C', top: '80%', left: '15%', size: 'text-5xl', color: 'text-white/10', animationClass: 'animate-float-3', duration: '10s', delay: '4s', blur: 'blur-sm' },
  { content: 'm', top: '50%', left: '5%', size: 'text-9xl', color: 'text-white/20', animationClass: 'animate-float', duration: '18s', delay: '1s', blur: '' },
  { content: 'R', top: '90%', left: '80%', size: 'text-7xl', color: 'text-white/25', animationClass: 'animate-float-2', duration: '13s', delay: '3s', blur: '' },
  { content: 'e', top: '5%', left: '40%', size: 'text-5xl', color: 'text-white/15', animationClass: 'animate-float-3', duration: '11s', delay: '5s', blur: 'blur-sm' },

  // Numbers - White & Varied Size
  { content: '7', top: '5%', left: '75%', size: 'text-5xl', color: 'text-white/20', animationClass: 'animate-float-3', duration: '14s', delay: '3.5s', blur: '' },
  { content: '9', top: '70%', left: '92%', size: 'text-8xl', color: 'text-white/30', animationClass: 'animate-float', duration: '9s', delay: '0.5s', blur: '' },
  { content: '3', top: '45%', left: '30%', size: 'text-7xl', color: 'text-white/10', animationClass: 'animate-float-2', duration: '16s', delay: '2.5s', blur: 'blur-sm' },
  { content: '1', top: '88%', left: '5%', size: 'text-6xl', color: 'text-white/20', animationClass: 'animate-float', duration: '12s', delay: '6s', blur: '' },
  { content: '5', top: '35%', left: '75%', size: 'text-9xl', color: 'text-white/25', animationClass: 'animate-float-3', duration: '19s', delay: '1.2s', blur: 'blur-sm' },

  // Shapes - White & Varied
  { content: '●', top: '15%', left: '25%', size: 'text-4xl', color: 'text-white/15', animationClass: 'animate-float-2', duration: '10s', delay: '5s', blur: '' },
  { content: '■', top: '60%', left: '70%', size: 'text-6xl', color: 'text-white/20', animationClass: 'animate-float', duration: '13s', delay: '1s', blur: 'blur-sm' },
  { content: '▲', top: '85%', left: '40%', size: 'text-7xl', color: 'text-white/25', animationClass: 'animate-float-3', duration: '17s', delay: '4.5s', blur: '' },
  { content: '★', top: '40%', left: '50%', size: 'text-5xl', color: 'text-white/30', animationClass: 'animate-float-spin', duration: '18s', delay: '2.2s', blur: '' },
  { content: '♦', top: '20%', left: '60%', size: 'text-6xl', color: 'text-white/10', animationClass: 'animate-float-2', duration: '19s', delay: '3.3s', blur: 'blur-sm' },
  { content: '♥', top: '75%', left: '55%', size: 'text-8xl', color: 'text-white/20', animationClass: 'animate-float-3', duration: '14s', delay: '0.8s', blur: '' },
  { content: '+', top: '55%', left: '90%', size: 'text-5xl', color: 'text-white/15', animationClass: 'animate-float', duration: '11s', delay: '5.5s', blur: 'blur-sm' },
  { content: '⬟', top: '33%', left: '12%', size: 'text-7xl', color: 'text-white/20', animationClass: 'animate-float-spin', duration: '25s', delay: '1.8s', blur: '' },
  { content: '⬬', top: '5%', left: '95%', size: 'text-4xl', color: 'text-white/10', animationClass: 'animate-float-3', duration: '20s', delay: '0.2s', blur: 'blur-sm' },

  // --- NEW COLORED & BLURRED ELEMENTS ---
  { content: 'S', top: '18%', left: '90%', size: 'text-5xl', color: 'text-yellow-200/20', animationClass: 'animate-float-spin', duration: '22s', delay: '7s', blur: 'blur-sm' },
  { content: 'o', top: '82%', left: '2%', size: 'text-7xl', color: 'text-pink-200/30', animationClass: 'animate-float', duration: '16s', delay: '3s', blur: '' },
  { content: '8', top: '55%', left: '45%', size: 'text-6xl', color: 'text-blue-200/15', animationClass: 'animate-float-2', duration: '14s', delay: '8s', blur: 'blur-md' },
  { content: 'K', top: '30%', left: '40%', size: 'text-9xl', color: 'text-green-200/20', animationClass: 'animate-float-3', duration: '20s', delay: '1s', blur: '' },
  { content: '2', top: '2%', left: '15%', size: 'text-4xl', color: 'text-purple-200/25', animationClass: 'animate-float-spin', duration: '18s', delay: '9s', blur: 'blur-sm' },
  
  { content: '✦', top: '65%', left: '20%', size: 'text-5xl', color: 'text-yellow-200/20', animationClass: 'animate-float', duration: '15s', delay: '6s', blur: '' },
  { content: '✽', top: '12%', left: '55%', size: 'text-6xl', color: 'text-pink-200/30', animationClass: 'animate-float-2', duration: '19s', delay: '4s', blur: 'blur-sm' },
  { content: '✚', top: '95%', left: '60%', size: 'text-7xl', color: 'text-blue-200/25', animationClass: 'animate-float-3', duration: '12s', delay: '10s', blur: '' },
  { content: '❤', top: '5%', left: '5%', size: 'text-8xl', color: 'text-red-200/20', animationClass: 'animate-float-spin', duration: '24s', delay: '1.5s', blur: '' },
  { content: '✪', top: '78%', left: '78%', size: 'text-4xl', color: 'text-yellow-200/15', animationClass: 'animate-float', duration: '13s', delay: '11s', blur: 'blur-md' },

  { content: 'G', top: '48%', left: '80%', size: 'text-7xl', color: 'text-white/10', animationClass: 'animate-float-2', duration: '19s', delay: '5.8s', blur: 'blur-sm' },
  { content: 'z', top: '92%', left: '25%', size: 'text-5xl', color: 'text-purple-200/20', animationClass: 'animate-float', duration: '16s', delay: '8.2s', blur: '' },
  { content: '4', top: '70%', left: '40%', size: 'text-9xl', color: 'text-green-200/25', animationClass: 'animate-float-3', duration: '21s', delay: '3.7s', blur: 'blur-sm' },
  { content: 'p', top: '15%', left: '70%', size: 'text-6xl', color: 'text-pink-200/15', animationClass: 'animate-float-spin', duration: '17s', delay: '10.5s', blur: '' },
  { content: '6', top: '42%', left: '18%', size: 'text-8xl', color: 'text-blue-200/20', animationClass: 'animate-float-2', duration: '14s', delay: '2.9s', blur: 'blur-md' },

  { content: '✶', top: '80%', left: '95%', size: 'text-5xl', color: 'text-yellow-200/30', animationClass: 'animate-float', duration: '11s', delay: '0.1s', blur: '' },
  { content: '❖', top: '58%', left: '8%', size: 'text-7xl', color: 'text-red-200/15', animationClass: 'animate-float-spin', duration: '28s', delay: '4.3s', blur: 'blur-sm' },
  { content: '♪', top: '8%', left: '20%', size: 'text-6xl', color: 'text-white/20', animationClass: 'animate-float-3', duration: '15s', delay: '7.7s', blur: '' },
  { content: '✔', top: '95%', left: '50%', size: 'text-4xl', color: 'text-green-200/25', animationClass: 'animate-float-2', duration: '12s', delay: '9.4s', blur: 'blur-sm' },
  { content: '✨', top: '22%', left: '2%', size: 'text-5xl', color: 'text-yellow-200/20', animationClass: 'animate-float', duration: '18s', delay: '5.1s', blur: '' },
];


export const DecorativeBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {decorations.map((deco, i) => (
        <span
          key={i}
          className={`absolute font-bold ${deco.color} ${deco.size} ${deco.animationClass} ${deco.blur}`}
          style={{
            top: deco.top,
            left: deco.left,
            animationDelay: deco.delay,
            animationDuration: deco.duration,
          }}
        >
          {deco.content}
        </span>
      ))}
    </div>
  );
};