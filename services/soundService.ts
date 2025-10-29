
import { GoogleGenAI, Modality } from "@google/genai";
import { Language } from './i18n';

// Sound effects are small, silent WAV files to avoid network requests while providing audio feedback hooks.
const sounds: { [key: string]: HTMLAudioElement } = {
  click: new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA'),
  success: new Audio('data:audio/wav;base64,UklGRlIAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhUQAAAP//Aw+EG8VO5xBC91r9P/9f/w8P/17/Xf8P/1D/Xf8P/1n/Xv8Q/1n/Xf8R/1z/X/8S/1z/Yf8S/13/Yv8T/17/Y/8U/1//Zv8V/2D/aP8W/2H/af8X/2L/bP8Y/2T/b/8Z/2X/cf8a/2b/d/8b/2f/eP8c/2n/fP8e/2r/gv8f/2v/hP8g/2z/if8h/23/j/8j/27/l/8l/2//m/8m/3D/nv8n/3H/o/8p/3L/qP8q/3P/rP8s/3T/tP8t/3T/uf8u/3X/v/8v/3b/w/8w/3f/yP8x/3j/0P8z/3n/2f80/3r/4/82/3v/6/83/3z/8/85/33//P86/37//f88/38A/v89/4AA//8+'),
  error: new Audio('data:audio/wav;base64,UklGRkAAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhQAAAAOC/v7r+7////u7+7v7u/u7+7v7u/u7+7v7u/u7+7v7u/u7+7v7u/u7+7v7u/u7+7v7u/u7+7v7u/u7+7v7u/u7+7v7u/u7+7v7u/u7g=='),
  switch: new Audio('data:audio/wav;base64,UklGRiIAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhBgAAAP8/gP5/f/5/fn5+fn9+f35/f39/f39/gH+Af4B/gH+Af4B/gH+Bf4F/gX+Bf4F/gX+Bf4F/gX+Bf4F/gYGBgYGBgYGBgYGBgYGBgYGBgYGBgY=')
};

export const playSound = (sound: 'click' | 'success' | 'error' | 'switch') => {
  try {
    const s = sounds[sound];
    if (s) {
      s.currentTime = 0;
      s.play().catch(e => console.error("Error playing sound:", e));
    }
  } catch(e) {
    console.error("Could not play sound", e);
  }
};

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
const outputNode = outputAudioContext.createGain();
outputNode.connect(outputAudioContext.destination);

const audioCache = new Map<string, AudioBuffer>();

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const getAudioBuffer = async (text: string, voiceName: string, language: Language): Promise<AudioBuffer | null> => {
    if (typeof window === 'undefined' || !text || !voiceName) return null;

    const cacheKey = `${voiceName}:${language}:${text}`;
    if (audioCache.has(cacheKey)) {
        return audioCache.get(cacheKey)!;
    }

    let prompt = text;
    // For phrases (not single letters), add a language-specific instruction to the prompt
    // to improve robustness with punctuation like '¡'.
    if (text.length > 2 && text.trim() !== '?') {
      switch(language) {
          case 'es-MX':
              prompt = `Pronuncia en español: ${text}`;
              break;
          case 'en-US':
               prompt = `Say in English: ${text}`;
               break;
          case 'pt-BR':
                prompt = `Pronuncie em português: ${text}`;
                break;
          // For Nahuatl, we pass the text directly, as an English/Spanish prompt might confuse the model.
          case 'nah':
          default:
              prompt = text;
      }
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
            const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                outputAudioContext,
                24000,
                1,
            );
            audioCache.set(cacheKey, audioBuffer);
            return audioBuffer;
        }
        console.error("No audio data received from API for text:", text);
        return null;
    } catch (error) {
        console.error("Error generating speech for text:", text, error);
        return null;
    }
};

export const ensureAudioIsCached = (text: string, voiceName: string, language: Language): Promise<AudioBuffer | null> => {
    if (typeof window === 'undefined' || !text || !voiceName) {
        return Promise.resolve(null);
    }
    // This function simply calls getAudioBuffer and returns its promise,
    // ensuring the audio is in the cache when the promise resolves.
    return getAudioBuffer(text, voiceName, language);
};

export const speakText = async (text: string, voiceName: string, language: Language) => {
    if (outputAudioContext.state === 'suspended') {
        await outputAudioContext.resume();
    }

    const audioBuffer = await getAudioBuffer(text, voiceName, language);
    if (audioBuffer) {
        try {
            const source = outputAudioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputNode);
            source.start(0);
        } catch (e) {
            console.error("Error playing audio buffer", e);
        }
    }
};

export const preloadSpeech = (text: string, voiceName: string, language: Language) => {
  if (typeof window === 'undefined' || !text || !voiceName) return;
  // Fire-and-forget call to getAudioBuffer to populate the cache for faster playback later.
  getAudioBuffer(text, voiceName, language).catch(err => {
    console.warn(`Failed to preload audio for text: "${text}"`, err);
  });
};

export const primeAlphabetCache = (alphabet: string[], voiceName: string, language: Language) => {
  if (typeof window === 'undefined' || !alphabet || !voiceName) return;
  
  console.log(`Priming cache for ${alphabet.length} letters with voice ${voiceName}...`);
  const primingPromises = alphabet.map(letter => getAudioBuffer(letter, voiceName, language));
  Promise.all(primingPromises).then(() => {
    console.log("Alphabet cache priming complete.");
  }).catch(err => {
    console.error("Error during alphabet cache priming:", err);
  });
};
