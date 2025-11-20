// Local storage service for Tracked Apps and Analysis History
import { App, AnalysisResult } from "../types";

export interface TrackedApp {
  id: string;
  app: App;
  trackedSince: string;
  lastChecked: string;
  snapshots: AppSnapshot[];
}

export interface AppSnapshot {
  date: string;
  rating: number;
  reviewsCount: string;
  version?: string;
  price?: number;
  // Add more fields as needed
}

export interface SavedAnalysis {
  id: string;
  appId: string;
  appName: string;
  appIcon: string;
  analysis: AnalysisResult;
  tags: string[];
  createdAt: string;
}

const STORAGE_KEYS = {
  TRACKED_APPS: "appscope_tracked_apps",
  ANALYSIS_HISTORY: "appscope_analysis_history",
  SELECTED_COUNTRY: "appscope_selected_country",
  KEYWORDS: "appscope_keywords",
};

// Tracked Apps
export const getTrackedApps = (): TrackedApp[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TRACKED_APPS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const addTrackedApp = (app: App): void => {
  const tracked = getTrackedApps();
  if (tracked.some((t) => t.id === app.id)) return; // Already tracked

  const newTracked: TrackedApp = {
    id: app.id,
    app,
    trackedSince: new Date().toISOString(),
    lastChecked: new Date().toISOString(),
    snapshots: [
      {
        date: new Date().toISOString(),
        rating: app.rating,
        reviewsCount: app.reviewsCount,
      },
    ],
  };

  tracked.push(newTracked);
  localStorage.setItem(STORAGE_KEYS.TRACKED_APPS, JSON.stringify(tracked));
};

export const removeTrackedApp = (appId: string): void => {
  const tracked = getTrackedApps().filter((t) => t.id !== appId);
  localStorage.setItem(STORAGE_KEYS.TRACKED_APPS, JSON.stringify(tracked));
};

export const updateTrackedApp = (appId: string, app: App): void => {
  const tracked = getTrackedApps();
  const index = tracked.findIndex((t) => t.id === appId);
  if (index === -1) return;

  tracked[index].app = app;
  tracked[index].lastChecked = new Date().toISOString();
  tracked[index].snapshots.push({
    date: new Date().toISOString(),
    rating: app.rating,
    reviewsCount: app.reviewsCount,
    version: app.version,
    price: app.price,
  });

  localStorage.setItem(STORAGE_KEYS.TRACKED_APPS, JSON.stringify(tracked));
};

// Analysis History
export const getAnalysisHistory = (): SavedAnalysis[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ANALYSIS_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveAnalysis = (
  app: App,
  analysis: AnalysisResult,
  tags: string[]
): void => {
  const history = getAnalysisHistory();

  const saved: SavedAnalysis = {
    id: `${app.id}_${Date.now()}`,
    appId: app.id,
    appName: app.name,
    appIcon: app.icon,
    analysis,
    tags,
    createdAt: new Date().toISOString(),
  };

  history.unshift(saved); // Add to beginning
  // Keep only last 50 analyses
  const limited = history.slice(0, 50);
  localStorage.setItem(STORAGE_KEYS.ANALYSIS_HISTORY, JSON.stringify(limited));
};

export const deleteAnalysis = (analysisId: string): void => {
  const history = getAnalysisHistory().filter((h) => h.id !== analysisId);
  localStorage.setItem(STORAGE_KEYS.ANALYSIS_HISTORY, JSON.stringify(history));
};

// Country Selection
export const getSelectedCountry = (): string => {
  return localStorage.getItem(STORAGE_KEYS.SELECTED_COUNTRY) || "US";
};

export const setSelectedCountry = (country: string): void => {
  localStorage.setItem(STORAGE_KEYS.SELECTED_COUNTRY, country);
};

// Keywords Storage
export interface KeywordHistory {
  date: string;
  position: number;
  popularity: number;
  difficulty: number;
}

export interface StoredKeyword {
  id: string;
  appId: string;
  keyword: string;
  source: "extracted" | "ai-suggested" | "manual" | "competitor";
  position?: number;
  positionChange?: number; // Change in position (positive = up, negative = down)
  lastChecked?: string;
  notes?: string[]; // Array of note colors/tags
  popularity?: number; // 0-100
  difficulty?: number; // 0-100
  appsInRanking?: Array<{ id: string; name: string; icon: string }>; // Top 4 apps
  totalAppsInRanking?: number;
  previousPosition?: number; // For tracking changes
  history?: KeywordHistory[]; // Historical position data for charts
  createdAt: string;
}

export const getKeywordsForApp = (appId: string): StoredKeyword[] => {
  try {
    const allKeywords = getAllKeywords();
    return allKeywords.filter((k) => k.appId === appId);
  } catch {
    return [];
  }
};

export const getAllKeywords = (): StoredKeyword[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.KEYWORDS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const addKeyword = (keyword: StoredKeyword): void => {
  const keywords = getAllKeywords();
  // Check if keyword already exists for this app
  if (
    keywords.some(
      (k) =>
        k.appId === keyword.appId &&
        k.keyword.toLowerCase() === keyword.keyword.toLowerCase()
    )
  ) {
    return; // Already exists
  }
  keywords.push(keyword);
  localStorage.setItem(STORAGE_KEYS.KEYWORDS, JSON.stringify(keywords));
};

export const removeKeyword = (keywordId: string): void => {
  const keywords = getAllKeywords().filter((k) => k.id !== keywordId);
  localStorage.setItem(STORAGE_KEYS.KEYWORDS, JSON.stringify(keywords));
};

export const updateKeyword = async (
  keywordId: string,
  updates: Partial<StoredKeyword>
): Promise<void> => {
  const keywords = getAllKeywords();
  const index = keywords.findIndex((k) => k.id === keywordId);
  if (index === -1) return;

  const keyword = keywords[index];

  // If position is being updated, add to history
  if (updates.position !== undefined && updates.position !== null) {
    const history = keyword.history || [];
    const newHistoryEntry: KeywordHistory = {
      date: new Date().toISOString(),
      position: updates.position,
      popularity: updates.popularity ?? keyword.popularity ?? 0,
      difficulty: updates.difficulty ?? keyword.difficulty ?? 0,
    };

    // Keep last N days of history
    const { KEYWORD_CONFIG } = await import("./keywordConfig");
    const retentionDays = KEYWORD_CONFIG.HISTORY_RETENTION_DAYS;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    const filteredHistory = history.filter(
      (h) => new Date(h.date) >= cutoffDate
    );

    filteredHistory.push(newHistoryEntry);
    updates.history = filteredHistory;
  }

  keywords[index] = { ...keyword, ...updates };
  localStorage.setItem(STORAGE_KEYS.KEYWORDS, JSON.stringify(keywords));
};
