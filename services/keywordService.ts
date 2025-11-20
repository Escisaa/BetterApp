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
 * Improved algorithm: More results = higher popularity
 * Note: Without Apple Search Ads API, this is an estimation based on search volume
 */
const calculatePopularity = (resultCount: number): number => {
  if (resultCount === 0) return 0;

  // Improved normalization based on typical App Store search volumes:
  // 0-20 results = 0-25 (very niche)
  // 20-100 results = 25-50 (low-medium)
  // 100-500 results = 50-75 (medium-high)
  // 500+ results = 75-100 (very popular)

  if (resultCount < 20) {
    return Math.min(25, (resultCount / 20) * 25);
  }
  if (resultCount < 100) {
    return 25 + ((resultCount - 20) / 80) * 25;
  }
  if (resultCount < 500) {
    return 50 + ((resultCount - 100) / 400) * 25;
  }
  return Math.min(100, 75 + ((resultCount - 500) / 1000) * 25);
};

/**
 * Calculate estimated difficulty (0-100) based on competing apps
 * Improved algorithm: Higher ratings/reviews of competitors = higher difficulty
 * Note: Without Apple Search Ads data, this estimates based on competitor strength
 */
const calculateDifficulty = (competingApps: App[]): number => {
  if (competingApps.length === 0) return 0;

  const avgRating =
    competingApps.reduce((sum, app) => sum + app.rating, 0) /
    competingApps.length;
  const avgReviews =
    competingApps.reduce((sum, app) => {
      const reviews = parseFloat(app.reviewsCount.replace(/[km]/gi, "")) || 0;
      const multiplier = app.reviewsCount.toLowerCase().includes("k")
        ? 1000
        : app.reviewsCount.toLowerCase().includes("m")
        ? 1000000
        : 1;
      return sum + reviews * multiplier;
    }, 0) / competingApps.length;

  // Improved normalization:
  // Count score: 0-5 apps = 0-20, 5-20 apps = 20-50, 20-50 apps = 50-80, 50+ = 80-100
  let countScore = 0;
  if (competingApps.length < 5) {
    countScore = (competingApps.length / 5) * 20;
  } else if (competingApps.length < 20) {
    countScore = 20 + ((competingApps.length - 5) / 15) * 30;
  } else if (competingApps.length < 50) {
    countScore = 50 + ((competingApps.length - 20) / 30) * 30;
  } else {
    countScore = Math.min(100, 80 + ((competingApps.length - 50) / 50) * 20);
  }

  // Rating score: 0-3 stars = 0-15, 3-4 stars = 15-25, 4-5 stars = 25-30
  const ratingScore =
    avgRating < 3
      ? (avgRating / 3) * 15
      : avgRating < 4
      ? 15 + ((avgRating - 3) / 1) * 10
      : 25 + ((avgRating - 4) / 1) * 5;

  // Reviews score: logarithmic scale, max 30 points
  const reviewsScore = Math.min(30, (Math.log10(avgReviews + 1) / 7) * 30);

  // Weighted combination: 40% count, 30% rating, 30% reviews
  return Math.min(
    100,
    countScore * 0.4 + ratingScore * 0.3 + reviewsScore * 0.3
  );
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

    // Calculate metrics
    const popularity = calculatePopularity(results.length);
    const difficulty = calculateDifficulty(competingApps);

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
  } catch (error) {
    console.error("Error checking keyword ranking:", error);
    return {
      position: null,
      popularity: 0,
      difficulty: 0,
      appsInRanking: [],
      totalAppsInRanking: 0,
    };
  }
};

/**
 * Discover keywords that the app is actually ranking for
 * Similar to Astro's "Found X Suggestions" feature
 * Searches common keywords and finds which ones the app ranks for
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

  // Generate potential keywords from app metadata
  const potentialKeywords = new Set<string>();

  // From app name
  if (app.name) {
    const nameWords = app.name
      .toLowerCase()
      .split(/[\s\-_]+/)
      .filter((w) => w.length > 2);
    nameWords.forEach((w) => potentialKeywords.add(w));
    // Add combinations
    if (nameWords.length > 1) {
      potentialKeywords.add(nameWords.join(" "));
    }
  }

  // From description (extract key phrases)
  if (app.description) {
    const desc = app.description.toLowerCase();
    // Extract 2-3 word phrases
    const phrases = desc.match(/\b\w{3,}\s+\w{3,}(?:\s+\w{3,})?\b/g) || [];
    phrases
      .slice(0, KEYWORD_CONFIG.MAX_PHRASES_FROM_DESCRIPTION)
      .forEach((p) => potentialKeywords.add(p));
  }

  // From genre/category
  if (app.primaryGenreName) {
    potentialKeywords.add(app.primaryGenreName.toLowerCase());
  }

  // Check each potential keyword to see if app ranks for it
  const keywordsToCheck = Array.from(potentialKeywords).slice(
    0,
    KEYWORD_CONFIG.MAX_KEYWORDS_TO_CHECK
  );

  for (const keyword of keywordsToCheck) {
    try {
      const results = await searchApps(keyword, country);
      const position = results.findIndex((a) => a.id === app.id);

      if (position >= 0) {
        // App ranks for this keyword!
        const positionNum = position + 1;
        const competingApps = results
          .filter((a) => a.id !== app.id)
          .slice(0, KEYWORD_CONFIG.MAX_COMPETING_APPS_FOR_DIFFICULTY);
        const popularity = calculatePopularity(results.length);
        const difficulty = calculateDifficulty(competingApps);

        discoveredKeywords.push({
          keyword,
          position: positionNum,
          popularity: Math.round(popularity),
          difficulty: Math.round(difficulty),
          totalAppsInRanking: results.length,
        });
      }

      // Small delay to avoid rate limiting
      await new Promise((resolve) =>
        setTimeout(resolve, KEYWORD_CONFIG.DELAY_BETWEEN_KEYWORD_CHECKS)
      );
    } catch (error) {
      console.error(`Error checking keyword "${keyword}":`, error);
      // Continue with next keyword
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
    try {
      const results = await searchApps(keyword, country);
      const position = results.findIndex((a) => a.id === competitorApp.id);

      if (position >= 0 && position < 50) {
        // Only include if in top 50
        const positionNum = position + 1;
        const competingApps = results
          .filter((a) => a.id !== competitorApp.id)
          .slice(0, KEYWORD_CONFIG.MAX_COMPETING_APPS_FOR_DIFFICULTY);
        const popularity = calculatePopularity(results.length);
        const difficulty = calculateDifficulty(competingApps);

        competitorKeywords.push({
          keyword,
          position: positionNum,
          popularity: Math.round(popularity),
          difficulty: Math.round(difficulty),
        });
      }

      await new Promise((resolve) =>
        setTimeout(resolve, KEYWORD_CONFIG.DELAY_BETWEEN_KEYWORD_CHECKS)
      );
    } catch (error) {
      console.error(`Error checking competitor keyword "${keyword}":`, error);
    }
  }

  return competitorKeywords.sort((a, b) => a.position - b.position);
};
