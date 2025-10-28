export interface Character {
  id: string;
  name: string;
  voiceName: string; // Name from Gemini TTS API
  avatar: string; // base64 encoded SVG
  bgImage: string; // base64 encoded SVG
}

// Helper function to create an SVG avatar from an emoji
const createAvatarSvgUrl = (emoji: string, bgColor: string): string => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="20" fill="${bgColor}" />
      <text x="50" y="55" font-family="sans-serif" font-size="70" text-anchor="middle" dominant-baseline="central">${emoji}</text>
    </svg>
  `.trim();
  // Use a robust method to encode SVG with emojis to Base64
  const base64 = btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${base64}`;
};

// Simple background SVGs
const eliBg = 'data:image/svg+xml;base64,' + btoa('<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#FFDDC1"/><circle cx="20" cy="80" r="10" fill="#FFEECF" opacity="0.7"/><circle cx="80" cy="20" r="15" fill="#FFEECF" opacity="0.7"/><circle cx="50" cy="50" r="8" fill="#FFEECF" opacity="0.7"/></svg>');
const abiBg = 'data:image/svg+xml;base64,' + btoa('<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#C1FFD7"/><path d="M 0 80 C 20 60, 40 100, 60 80 S 80 60, 100 80 V 100 H 0 Z" fill="#A8E6CF" opacity="0.8"/><path d="M 0 20 C 20 0, 40 40, 60 20 S 80 0, 100 20" fill="none" stroke="#A8E6CF" stroke-width="5" opacity="0.6"/></svg>');
const puchiBg = 'data:image/svg+xml;base64,' + btoa('<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#C1E7FF"/><path d="M 10 90 L 30 70 L 50 90 L 70 70 L 90 90 V 100 H 10 Z" fill="#A1D6F7" opacity="0.8"/><circle cx="25" cy="25" r="5" fill="white" opacity="0.9"/><circle cx="75" cy="40" r="3" fill="white" opacity="0.9"/><circle cx="50" cy="15" r="4" fill="white" opacity="0.9"/></svg>');
const hanquiBg = 'data:image/svg+xml;base64,' + btoa('<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#FFC1F5"/><rect x="10" y="10" width="20" height="20" rx="5" fill="#FFD6F9" opacity="0.8"/><rect x="70" y="60" width="25" height="25" rx="5" fill="#FFD6F9" opacity="0.8"/><circle cx="30" cy="70" r="10" fill="#FFD6F9" opacity="0.8"/></svg>');

export const CHARACTERS: Character[] = [
  {
    id: 'eli',
    name: 'Eli',
    // Friendly male voice
    voiceName: 'Kore', 
    avatar: createAvatarSvgUrl('🦁', '#FFDDC1'),
    bgImage: eliBg,
  },
  {
    id: 'abi',
    name: 'Abi',
    // Friendly female voice
    voiceName: 'Zephyr',
    avatar: createAvatarSvgUrl('🐒', '#C1FFD7'),
    bgImage: abiBg,
  },
  {
    id: 'puchi',
    name: 'Puchi',
    // Another friendly male voice
    voiceName: 'Puck',
    avatar: createAvatarSvgUrl('🐧', '#C1E7FF'),
    bgImage: puchiBg,
  },
  {
    id: 'hanqui',
    name: 'Hanqui',
    // Another friendly female voice
    voiceName: 'Charon',
    avatar: createAvatarSvgUrl('🐹', '#FFC1F5'),
    bgImage: hanquiBg,
  }
];
