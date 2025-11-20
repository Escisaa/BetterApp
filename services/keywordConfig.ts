// Configuration constants for keyword tracking
// These can be adjusted based on API rate limits and performance needs

export const KEYWORD_CONFIG = {
  // Discovery limits
  MAX_KEYWORDS_TO_CHECK: 50, // Maximum keywords to check when discovering ranking keywords
  MAX_COMPETITOR_KEYWORDS: 30, // Maximum keywords to check for competitor extraction

  // Extraction limits
  MAX_PHRASES_FROM_DESCRIPTION: 20, // Maximum phrases to extract from app description
  MAX_PHRASES_FROM_DESCRIPTION_SHORT: 10, // Maximum phrases for short descriptions
  MAX_METADATA_KEYWORDS: 20, // Maximum keywords from metadata extraction

  // Display limits
  MAX_APPS_IN_RANKING_DISPLAY: 4, // Number of competitor apps to show in UI
  MAX_COMPETING_APPS_FOR_DIFFICULTY: 10, // Number of competing apps to analyze for difficulty
  MIN_TABLE_ROWS: 20, // Minimum number of rows to display in the keyword table (for empty state)

  // Rate limiting
  DELAY_BETWEEN_KEYWORD_CHECKS: 200, // Milliseconds between keyword checks (to avoid rate limits)

  // History
  HISTORY_RETENTION_DAYS: 30, // Days of historical data to keep

  // Suggestions
  MAX_KEYWORD_SUGGESTIONS: 30, // Maximum keyword suggestions to generate
} as const;
