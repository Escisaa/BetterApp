// Translation service using DeepL API (free tier: 500k chars/month)
// Reference: https://www.deepl.com/docs-api

const DEEPL_API_KEY = import.meta.env.VITE_DEEPL_API_KEY || "";
const DEEPL_API_URL = "https://api-free.deepl.com/v2/translate";

export interface TranslationResult {
  translatedText: string;
  detectedSourceLanguage?: string;
}

/**
 * Translate text using DeepL API
 * Free tier: 500,000 characters/month
 */
export const translateText = async (
  text: string,
  targetLang: string = "EN"
): Promise<TranslationResult | null> => {
  if (!DEEPL_API_KEY) {
    // If no API key, return null (feature gracefully degrades)
    return null;
  }

  try {
    const response = await fetch(DEEPL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        auth_key: DEEPL_API_KEY,
        text: text,
        target_lang: targetLang,
      }),
    });

    if (!response.ok) {
      console.warn("DeepL translation failed:", response.statusText);
      return null;
    }

    const data = await response.json();
    if (data.translations && data.translations.length > 0) {
      return {
        translatedText: data.translations[0].text,
        detectedSourceLanguage: data.translations[0].detected_source_language,
      };
    }

    return null;
  } catch (error) {
    console.warn("Error translating text:", error);
    return null;
  }
};

/**
 * Translate keyword (with caching to avoid repeated API calls)
 */
const translationCache = new Map<string, TranslationResult>();

export const translateKeyword = async (
  keyword: string,
  targetLang: string = "EN"
): Promise<string | null> => {
  const cacheKey = `${keyword}_${targetLang}`;

  // Check cache first
  if (translationCache.has(cacheKey)) {
    const cached = translationCache.get(cacheKey);
    return cached?.translatedText || null;
  }

  // Only translate if keyword is not already in English
  if (targetLang === "EN" && /^[a-zA-Z0-9\s\-_]+$/.test(keyword)) {
    // Likely already English, return as-is
    return keyword;
  }

  const result = await translateText(keyword, targetLang);
  if (result) {
    translationCache.set(cacheKey, result);
    return result.translatedText;
  }

  return null;
};
