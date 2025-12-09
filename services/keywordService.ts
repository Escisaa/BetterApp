// Keyword service for extracting and managing keywords
import { App } from "../types";
import { searchApps } from "./apiService";
import { KEYWORD_CONFIG } from "./keywordConfig";

export interface Keyword {
  id: string;
  keyword: string;
  source: "extracted" | "ai-suggested" | "manual" | "competitor";
  position?: number; // App Store ranking position
  positionChange?: number; // Change in position (positive = up, negative = down)
  lastChecked?: string;
  notes?: string[];
  popularity?: number; // 0-100 estimated popularity
  difficulty?: number; // 0-100 estimated difficulty
  appsInRanking?: App[]; // Top apps ranking for this keyword
  totalAppsInRanking?: number; // Total number of apps ranking
}

export interface KeywordSuggestion {
  keyword: string;
  reason: string; // Why this keyword is suggested
  source: "ai-tags" | "app-metadata" | "reviews" | "competitor";
}

/**
 * Extract keywords from app metadata (name, subtitle, description)
 */
export const extractKeywordsFromMetadata = (app: App): string[] => {
  const keywords: string[] = [];

  // Extract from app name
  if (app.name) {
    const nameWords = app.name
      .toLowerCase()
      .split(/[\s\-_]+/)
      .filter(
        (word) =>
          word.length > 2 && !["app", "the", "for", "and"].includes(word)
      );
    keywords.push(...nameWords);
  }

  // Extract from description (first 500 chars)
  if (app.description) {
    const desc = app.description.toLowerCase();
    // Extract meaningful phrases (2-3 words)
    const phrases = desc.match(/\b\w{3,}\s+\w{3,}(?:\s+\w{3,})?\b/g) || [];
    keywords.push(
      ...phrases.slice(0, KEYWORD_CONFIG.MAX_PHRASES_FROM_DESCRIPTION_SHORT)
    );
  }

  // Add category/genre as keyword
  if (app.primaryGenreName) {
    keywords.push(app.primaryGenreName.toLowerCase());
  }

  // Remove duplicates and return
  return [...new Set(keywords)].slice(0, KEYWORD_CONFIG.MAX_METADATA_KEYWORDS);
};

/**
 * Generate keyword suggestions using AI (based on app data and reviews)
 */
export const generateKeywordSuggestions = async (
  app: App,
  aiTags: string[]
): Promise<KeywordSuggestion[]> => {
  const suggestions: KeywordSuggestion[] = [];

  // Use AI tags as keyword suggestions
  aiTags.forEach((tag) => {
    suggestions.push({
      keyword: tag,
      reason: "Based on user reviews and app features",
      source: "ai-tags",
    });
  });

  // Extract from metadata
  const metadataKeywords = extractKeywordsFromMetadata(app);
  metadataKeywords.forEach((keyword) => {
    if (!suggestions.some((s) => s.keyword === keyword)) {
      suggestions.push({
        keyword,
        reason: "Extracted from app name and description",
        source: "app-metadata",
      });
    }
  });

  return suggestions.slice(0, KEYWORD_CONFIG.MAX_KEYWORD_SUGGESTIONS);
};

/**
 * Calculate estimated popularity (0-100) based on search results count
 * Enhanced algorithm with more variance for better differentiation
 * Note: Without Apple Search Ads API, this is an estimation based on search volume
 */
const calculatePopularity = (resultCount: number, keyword?: string): number => {
  if (resultCount === 0) return 0;

  // Base score from result count with wider distribution
  let baseScore = 0;
  if (resultCount < 10) {
    baseScore = (resultCount / 10) * 15; // 0-15
  } else if (resultCount < 25) {
    baseScore = 15 + ((resultCount - 10) / 15) * 15; // 15-30
  } else if (resultCount < 50) {
    baseScore = 30 + ((resultCount - 25) / 25) * 20; // 30-50
  } else if (resultCount < 100) {
    baseScore = 50 + ((resultCount - 50) / 50) * 15; // 50-65
  } else if (resultCount < 200) {
    baseScore = 65 + ((resultCount - 100) / 100) * 15; // 65-80
  } else {
    baseScore = Math.min(100, 80 + ((resultCount - 200) / 300) * 20); // 80-100
  }

  // Keyword characteristics modifier for more variance
  let modifier = 0;
  if (keyword) {
    const wordCount = keyword.split(/\s+/).length;
    const charCount = keyword.length;

    // Single words are typically more popular (broader)
    if (wordCount === 1 && charCount <= 10) {
      modifier += 8;
    }
    // Long-tail keywords (3+ words) are less popular but more specific
    if (wordCount >= 3) {
      modifier -= 5;
    }
    // Very short keywords tend to be more popular
    if (charCount <= 5) {
      modifier += 5;
    }
    // Common app-related terms boost
    const popularTerms = [
      "app",
      "game",
      "free",
      "photo",
      "video",
      "music",
      "health",
      "fitness",
      "social",
      "chat",
    ];
    if (popularTerms.some((term) => keyword.toLowerCase().includes(term))) {
      modifier += 7;
    }
  }

  return Math.max(0, Math.min(100, Math.round(baseScore + modifier)));
};

/**
 * Calculate estimated difficulty (0-100) based on competing apps
 * Enhanced algorithm with better differentiation based on competitor strength
 * Note: Without Apple Search Ads data, this estimates based on competitor strength
 */
const calculateDifficulty = (
  competingApps: App[],
  keyword?: string
): number => {
  if (competingApps.length === 0) return 5; // Minimum difficulty

  // Parse review counts properly
  const parseReviewCount = (reviewStr: string): number => {
    const clean = reviewStr.replace(/[,\s]/g, "").toLowerCase();
    const num = parseFloat(clean.replace(/[km]/g, "")) || 0;
    if (clean.includes("m")) return num * 1000000;
    if (clean.includes("k")) return num * 1000;
    return num;
  };

  // Calculate metrics
  const ratings = competingApps.map((app) => app.rating || 0);
  const reviews = competingApps.map((app) =>
    parseReviewCount(app.reviewsCount || "0")
  );

  const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  const maxRating = Math.max(...ratings);
  const avgReviews = reviews.reduce((a, b) => a + b, 0) / reviews.length;
  const maxReviews = Math.max(...reviews);
  const totalReviews = reviews.reduce((a, b) => a + b, 0);

  // Competition density score (how many strong competitors)
  let densityScore = 0;
  if (competingApps.length <= 3) {
    densityScore = competingApps.length * 5; // 0-15
  } else if (competingApps.length <= 10) {
    densityScore = 15 + (competingApps.length - 3) * 3; // 15-36
  } else if (competingApps.length <= 25) {
    densityScore = 36 + (competingApps.length - 10) * 1.5; // 36-58
  } else {
    densityScore = Math.min(70, 58 + (competingApps.length - 25) * 0.5); // 58-70
  }

  // Quality score based on ratings (how good are competitors)
  let qualityScore = 0;
  if (avgRating >= 4.5) {
    qualityScore = 20 + (avgRating - 4.5) * 10; // 20-25
  } else if (avgRating >= 4.0) {
    qualityScore = 12 + (avgRating - 4.0) * 16; // 12-20
  } else if (avgRating >= 3.5) {
    qualityScore = 5 + (avgRating - 3.5) * 14; // 5-12
  } else {
    qualityScore = avgRating * 1.4; // 0-5
  }

  // Authority score based on reviews (how established are competitors)
  let authorityScore = 0;
  if (maxReviews > 100000) {
    authorityScore = 20 + Math.min(15, Math.log10(maxReviews / 100000) * 10);
  } else if (maxReviews > 10000) {
    authorityScore = 12 + ((maxReviews - 10000) / 90000) * 8;
  } else if (maxReviews > 1000) {
    authorityScore = 5 + ((maxReviews - 1000) / 9000) * 7;
  } else {
    authorityScore = (maxReviews / 1000) * 5;
  }

  // Keyword specificity modifier
  let modifier = 0;
  if (keyword) {
    const wordCount = keyword.split(/\s+/).length;
    // Long-tail keywords are easier to rank for
    if (wordCount >= 3) modifier -= 8;
    if (wordCount >= 4) modifier -= 5;
    // Short generic keywords are harder
    if (wordCount === 1 && keyword.length <= 6) modifier += 10;
  }

  // Combine scores with weights
  const rawScore =
    densityScore * 0.35 + qualityScore * 0.35 + authorityScore * 0.3 + modifier;

  return Math.max(5, Math.min(100, Math.round(rawScore)));
};

/**
 * Check app ranking for a keyword and calculate all metrics
 * Returns comprehensive keyword data including position, popularity, difficulty, and competing apps
 */
export const checkKeywordRanking = async (
  appId: string,
  keyword: string,
  country: string = "US",
  previousPosition?: number
): Promise<{
  position: number | null;
  positionChange?: number;
  popularity: number;
  difficulty: number;
  appsInRanking: App[];
  totalAppsInRanking: number;
}> => {
  const maxRetries = 3;
  let lastError = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const results = await searchApps(keyword, country);
      const position = results.findIndex((app) => app.id === appId);
      const positionNum = position >= 0 ? position + 1 : null;

      // Calculate position change
      let positionChange: number | undefined;
      if (previousPosition !== undefined && positionNum !== null) {
        positionChange = previousPosition - positionNum; // Positive = moved up, negative = moved down
      }

      // Get top competing apps (excluding the target app)
      const competingApps = results
        .filter((app) => app.id !== appId)
        .slice(0, KEYWORD_CONFIG.MAX_COMPETING_APPS_FOR_DIFFICULTY);

      // Calculate metrics with keyword context for better variance
      const popularity = calculatePopularity(results.length, keyword);
      const difficulty = calculateDifficulty(competingApps, keyword);

      return {
        position: positionNum,
        positionChange,
        popularity: Math.round(popularity),
        difficulty: Math.round(difficulty),
        appsInRanking: competingApps.slice(
          0,
          KEYWORD_CONFIG.MAX_APPS_IN_RANKING_DISPLAY
        ),
        totalAppsInRanking: results.length,
      };
    } catch (error: any) {
      lastError = error;
      const errorMessage = error?.message || "";

      // If rate limited, retry with exponential backoff
      if (
        (errorMessage.includes("429") ||
          errorMessage.includes("403") ||
          errorMessage.includes("rate limit") ||
          errorMessage.includes("Too many requests")) &&
        attempt < maxRetries - 1
      ) {
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        console.warn(
          `Keyword ranking check rate limited, retrying in ${delay}ms... (attempt ${
            attempt + 1
          }/${maxRetries})`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      // If not rate limit, break and return error
      break;
    }
  }

  // If all retries failed, return empty result
  console.error("Error checking keyword ranking after retries:", lastError);
  return {
    position: null,
    popularity: 0,
    difficulty: 0,
    appsInRanking: [],
    totalAppsInRanking: 0,
  };
};

/**
 * Discover keywords that the app is actually ranking for
 * Like Astro - discovers keywords dynamically from app metadata, not hardcoded lists
 * Searches potential keywords extracted from the app and finds which ones it ranks for
 */
export const discoverRankingKeywords = async (
  app: App,
  country: string = "US"
): Promise<
  Array<{
    keyword: string;
    position: number;
    popularity: number;
    difficulty: number;
    totalAppsInRanking: number;
  }>
> => {
  const discoveredKeywords: Array<{
    keyword: string;
    position: number;
    popularity: number;
    difficulty: number;
    totalAppsInRanking: number;
  }> = [];

  // Generate potential keywords dynamically from app metadata (no hardcoded lists)
  const potentialKeywords = new Set<string>();

  // 1. From app name - the most important source
  if (app.name) {
    const cleanName = app.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .trim();
    potentialKeywords.add(cleanName); // Full app name

    const nameWords = cleanName.split(/[\s\-_]+/).filter((w) => w.length > 2);
    nameWords.forEach((w) => potentialKeywords.add(w));

    // 2-word combinations from name
    if (nameWords.length >= 2) {
      for (let i = 0; i < nameWords.length - 1; i++) {
        potentialKeywords.add(`${nameWords[i]} ${nameWords[i + 1]}`);
      }
    }
  }

  // 2. From subtitle if available (common App Store field)
  if ((app as any).subtitle) {
    const subtitle = (app as any).subtitle.toLowerCase();
    potentialKeywords.add(subtitle);
    subtitle
      .split(/[\s\-_,]+/)
      .filter((w: string) => w.length > 2)
      .forEach((w: string) => potentialKeywords.add(w));
  }

  // 3. From description - extract meaningful phrases
  if (app.description) {
    const desc = app.description.toLowerCase();

    // Extract 2-word phrases (most valuable for ASO)
    const twoWordPhrases = desc.match(/\b[a-z]{3,}\s+[a-z]{3,}\b/g) || [];
    twoWordPhrases
      .slice(0, KEYWORD_CONFIG.MAX_PHRASES_FROM_DESCRIPTION)
      .forEach((p) => potentialKeywords.add(p.trim()));

    // Extract single important words
    const words = desc.match(/\b[a-z]{4,}\b/g) || [];
    const stopWords = new Set([
      "this",
      "that",
      "with",
      "have",
      "from",
      "your",
      "will",
      "been",
      "more",
      "when",
      "very",
      "most",
      "only",
      "also",
      "just",
      "about",
      "other",
      "into",
      "some",
      "could",
      "their",
      "what",
      "which",
      "would",
      "there",
      "were",
      "they",
      "being",
      "these",
      "those",
      "such",
      "then",
      "than",
      "here",
      "each",
      "after",
      "before",
      "while",
      "where",
      "can",
      "all",
      "any",
      "both",
      "each",
      "few",
      "many",
      "much",
      "own",
      "same",
      "through",
      "during",
      "under",
      "again",
    ]);
    words
      .filter((w) => !stopWords.has(w) && w.length >= 4)
      .slice(0, 20)
      .forEach((w) => potentialKeywords.add(w));
  }

  // 4. From genre/category
  if (app.primaryGenreName) {
    const genre = app.primaryGenreName.toLowerCase();
    potentialKeywords.add(genre);
    // Also add individual words from multi-word genres
    genre
      .split(/[\s&]+/)
      .filter((w) => w.length > 2)
      .forEach((w) => potentialKeywords.add(w));
  }

  // 5. From developer name (users often search by developer)
  if (app.developer) {
    const devName = app.developer
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .trim();
    if (devName.length > 2 && devName.length < 30) {
      potentialKeywords.add(devName);
    }
  }

  // Check each potential keyword to see if app ranks for it
  const keywordsToCheck = Array.from(potentialKeywords).slice(
    0,
    KEYWORD_CONFIG.MAX_KEYWORDS_TO_CHECK
  );

  for (const keyword of keywordsToCheck) {
    const maxRetries = 2;
    let success = false;

    for (let attempt = 0; attempt < maxRetries && !success; attempt++) {
      try {
        const results = await searchApps(keyword, country);
        const position = results.findIndex((a) => a.id === app.id);

        if (position >= 0) {
          // App ranks for this keyword!
          const positionNum = position + 1;
          const competingApps = results
            .filter((a) => a.id !== app.id)
            .slice(0, KEYWORD_CONFIG.MAX_COMPETING_APPS_FOR_DIFFICULTY);
          const popularity = calculatePopularity(results.length, keyword);
          const difficulty = calculateDifficulty(competingApps, keyword);

          discoveredKeywords.push({
            keyword,
            position: positionNum,
            popularity,
            difficulty,
            totalAppsInRanking: results.length,
          });
          success = true;
        } else {
          success = true; // Not an error, just doesn't rank
        }

        // Small delay to avoid rate limiting
        await new Promise((resolve) =>
          setTimeout(resolve, KEYWORD_CONFIG.DELAY_BETWEEN_KEYWORD_CHECKS)
        );
      } catch (error: any) {
        const errorMessage = error?.message || "";

        // If rate limited, retry with delay
        if (
          (errorMessage.includes("429") ||
            errorMessage.includes("403") ||
            errorMessage.includes("rate limit") ||
            errorMessage.includes("Too many requests")) &&
          attempt < maxRetries - 1
        ) {
          const delay = Math.pow(2, attempt) * 2000; // 2s, 4s
          console.warn(
            `Rate limited checking keyword "${keyword}", retrying in ${delay}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        // If not rate limit or all retries failed, skip this keyword
        console.error(`Error checking keyword "${keyword}":`, error);
        success = true; // Mark as done to continue to next keyword
      }
    }
  }

  // Sort by position (best ranking first)
  return discoveredKeywords.sort((a, b) => a.position - b.position);
};

/**
 * Extract keywords from competitor apps
 * When user clicks on a competitor app, find what keywords they rank for
 */
export const extractCompetitorKeywords = async (
  competitorApp: App,
  country: string = "US"
): Promise<
  Array<{
    keyword: string;
    position: number;
    popularity: number;
    difficulty: number;
  }>
> => {
  const competitorKeywords: Array<{
    keyword: string;
    position: number;
    popularity: number;
    difficulty: number;
  }> = [];

  // Generate potential keywords from competitor's metadata
  const potentialKeywords = new Set<string>();

  if (competitorApp.name) {
    const nameWords = competitorApp.name
      .toLowerCase()
      .split(/[\s\-_]+/)
      .filter((w) => w.length > 2);
    nameWords.forEach((w) => potentialKeywords.add(w));
    if (nameWords.length > 1) {
      potentialKeywords.add(nameWords.join(" "));
    }
  }

  if (competitorApp.description) {
    const desc = competitorApp.description.toLowerCase();
    const phrases = desc.match(/\b\w{3,}\s+\w{3,}(?:\s+\w{3,})?\b/g) || [];
    phrases
      .slice(0, KEYWORD_CONFIG.MAX_PHRASES_FROM_DESCRIPTION_SHORT)
      .forEach((p) => potentialKeywords.add(p));
  }

  // Check which keywords the competitor ranks for
  const keywordsToCheck = Array.from(potentialKeywords).slice(
    0,
    KEYWORD_CONFIG.MAX_COMPETITOR_KEYWORDS
  );

  for (const keyword of keywordsToCheck) {
    const maxRetries = 2;
    let success = false;

    for (let attempt = 0; attempt < maxRetries && !success; attempt++) {
      try {
        const results = await searchApps(keyword, country);
        const position = results.findIndex((a) => a.id === competitorApp.id);

        if (position >= 0 && position < 50) {
          // Only include if in top 50
          const positionNum = position + 1;
          const competingApps = results
            .filter((a) => a.id !== competitorApp.id)
            .slice(0, KEYWORD_CONFIG.MAX_COMPETING_APPS_FOR_DIFFICULTY);
          const popularity = calculatePopularity(results.length, keyword);
          const difficulty = calculateDifficulty(competingApps, keyword);

          competitorKeywords.push({
            keyword,
            position: positionNum,
            popularity,
            difficulty,
          });
        }
        success = true;

        await new Promise((resolve) =>
          setTimeout(resolve, KEYWORD_CONFIG.DELAY_BETWEEN_KEYWORD_CHECKS)
        );
      } catch (error: any) {
        const errorMessage = error?.message || "";

        // If rate limited, retry with delay
        if (
          (errorMessage.includes("429") ||
            errorMessage.includes("403") ||
            errorMessage.includes("rate limit") ||
            errorMessage.includes("Too many requests")) &&
          attempt < maxRetries - 1
        ) {
          const delay = Math.pow(2, attempt) * 2000; // 2s, 4s
          console.warn(
            `Rate limited checking competitor keyword "${keyword}", retrying in ${delay}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        // If not rate limit or all retries failed, skip this keyword
        console.error(`Error checking competitor keyword "${keyword}":`, error);
        success = true; // Mark as done to continue to next keyword
      }
    }
  }

  return competitorKeywords.sort((a, b) => a.position - b.position);
};

/**
 * Generate smart keyword recommendations based on tracked keywords
 * Suggests related keywords and variations
 */
export const generateSmartRecommendations = (
  trackedKeywords: string[]
): Array<{
  keyword: string;
  reason: string;
  basedOn: string;
}> => {
  const recommendations: Array<{
    keyword: string;
    reason: string;
    basedOn: string;
  }> = [];
  const addedKeywords = new Set(trackedKeywords.map((k) => k.toLowerCase()));

  for (const keyword of trackedKeywords) {
    const words = keyword.toLowerCase().split(/\s+/);

    // 1. Singular/Plural variations
    for (const word of words) {
      if (word.endsWith("s") && word.length > 3) {
        const singular = word.slice(0, -1);
        const newKeyword = keyword.toLowerCase().replace(word, singular);
        if (!addedKeywords.has(newKeyword)) {
          recommendations.push({
            keyword: newKeyword,
            reason: "Singular variation",
            basedOn: keyword,
          });
          addedKeywords.add(newKeyword);
        }
      } else if (!word.endsWith("s") && word.length > 2) {
        const plural = word + "s";
        const newKeyword = keyword.toLowerCase().replace(word, plural);
        if (!addedKeywords.has(newKeyword)) {
          recommendations.push({
            keyword: newKeyword,
            reason: "Plural variation",
            basedOn: keyword,
          });
          addedKeywords.add(newKeyword);
        }
      }
    }

    // 2. Common prefixes/suffixes
    const prefixes = ["best", "free", "top", "easy", "simple", "pro"];
    const suffixes = ["app", "tracker", "manager", "tool", "helper"];

    for (const prefix of prefixes) {
      if (!keyword.toLowerCase().startsWith(prefix)) {
        const newKeyword = `${prefix} ${keyword.toLowerCase()}`;
        if (!addedKeywords.has(newKeyword) && newKeyword.length <= 30) {
          recommendations.push({
            keyword: newKeyword,
            reason: `"${prefix}" prefix often searched`,
            basedOn: keyword,
          });
          addedKeywords.add(newKeyword);
        }
      }
    }

    // Only add suffix if keyword is short enough
    if (words.length === 1) {
      for (const suffix of suffixes) {
        if (!keyword.toLowerCase().endsWith(suffix)) {
          const newKeyword = `${keyword.toLowerCase()} ${suffix}`;
          if (!addedKeywords.has(newKeyword) && newKeyword.length <= 30) {
            recommendations.push({
              keyword: newKeyword,
              reason: `"${suffix}" suffix popular`,
              basedOn: keyword,
            });
            addedKeywords.add(newKeyword);
          }
        }
      }
    }

    // 3. Word order swap for 2-word keywords
    if (words.length === 2) {
      const swapped = `${words[1]} ${words[0]}`;
      if (!addedKeywords.has(swapped)) {
        recommendations.push({
          keyword: swapped,
          reason: "Word order variation",
          basedOn: keyword,
        });
        addedKeywords.add(swapped);
      }
    }

    // 4. Synonym-based suggestions (simple common synonyms)
    const synonyms: Record<string, string[]> = {
      track: ["monitor", "log", "record"],
      tracker: ["monitor", "logger", "recorder"],
      manage: ["organize", "control", "handle"],
      manager: ["organizer", "controller", "planner"],
      health: ["wellness", "fitness", "medical"],
      fitness: ["workout", "exercise", "health"],
      money: ["budget", "finance", "cash"],
      budget: ["money", "expense", "finance"],
      habit: ["routine", "daily", "goal"],
      goal: ["target", "objective", "habit"],
      photo: ["picture", "image", "camera"],
      video: ["movie", "film", "clip"],
      note: ["memo", "reminder", "document"],
      task: ["todo", "checklist", "reminder"],
      calendar: ["schedule", "planner", "agenda"],
    };

    for (const word of words) {
      if (synonyms[word]) {
        for (const synonym of synonyms[word].slice(0, 2)) {
          const newKeyword = keyword.toLowerCase().replace(word, synonym);
          if (!addedKeywords.has(newKeyword)) {
            recommendations.push({
              keyword: newKeyword,
              reason: `Synonym: "${word}" → "${synonym}"`,
              basedOn: keyword,
            });
            addedKeywords.add(newKeyword);
          }
        }
      }
    }
  }

  // Limit to top 20 recommendations
  return recommendations.slice(0, 20);
};
