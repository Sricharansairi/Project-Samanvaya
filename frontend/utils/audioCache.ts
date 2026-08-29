/**
 * TTS Audio Cache Utility
 * Saves Sarvam API credits by caching static TTS responses (like greetings, consent prompts)
 * in localStorage so they don't hit the API on every page reload during testing.
 */

const CACHE_PREFIX = "samanvaya_tts_";

export const getCachedAudio = (text: string, language: string): string | null => {
  if (typeof window === "undefined") return null;
  const cacheKey = `${CACHE_PREFIX}${language}_${btoa(text).slice(0, 50)}`;
  return localStorage.getItem(cacheKey);
};

export const setCachedAudio = (text: string, language: string, base64Audio: string): void => {
  if (typeof window === "undefined") return;
  
  // Prevent quota exceeded errors
  try {
    const cacheKey = `${CACHE_PREFIX}${language}_${btoa(text).slice(0, 50)}`;
    localStorage.setItem(cacheKey, base64Audio);
  } catch (e) {
    console.warn("TTS Cache full. Clearing old audio entries.");
    // Clear only our TTS cache, leaving other localStorage data intact
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
            localStorage.removeItem(key);
        }
    });
    // Retry saving
    try {
        const cacheKey = `${CACHE_PREFIX}${language}_${btoa(text).slice(0, 50)}`;
        localStorage.setItem(cacheKey, base64Audio);
    } catch (e2) {
        console.error("Failed to cache audio even after clearing.", e2);
    }
  }
};

export const playCachedAudio = (base64Audio: string) => {
    const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);
    audio.play();
};
