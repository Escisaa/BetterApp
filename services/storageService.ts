// Storage service with cloud sync support
// Uses localStorage as cache, syncs to Supabase when logged in
import { App, AnalysisResult } from "../types";
import {
  syncTrackedAppsToCloud,
  syncKeywordsToCloud,
  syncAnalysisToCloud,
  syncSettingsToCloud,
  deleteTrackedAppFromCloud,
  deleteKeywordFromCloud,
  deleteAnalysisFromCloud,
  performFullSync,
  fetchSettingsFromCloud,
} from "./cloudSyncService";

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
  LAST_SYNC: "appscope_last_sync",
};

// Debounced cloud sync (waits 2s after last change)
let syncTimeout: ReturnType<typeof setTimeout> | null = null;
const SYNC_DELAY = 2000;

const debouncedCloudSync = () => {
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(async () => {
    try {
      const apps = getTrackedApps();
      const keywords = getAllKeywords();
      const analyses = getAnalysisHistory();

      await Promise.all([
        syncTrackedAppsToCloud(apps),
        syncKeywordsToCloud(keywords),
        syncAnalysisToCloud(analyses),
      ]);

      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
      console.log("☁️ Cloud sync completed");
    } catch (error) {
      console.warn("Cloud sync failed (offline?):", error);
    }
  }, SYNC_DELAY);
};

// Initialize: Load from cloud if logged in
export const initializeStorage = async (): Promise<boolean> => {
  try {
    const cloudData = await performFullSync();

    if (cloudData.trackedApps.length > 0) {
      // Merge cloud data with local (cloud wins for conflicts)
      const localApps = getTrackedApps();
      const mergedApps = mergeData(localApps, cloudData.trackedApps, "id");
      localStorage.setItem(
        STORAGE_KEYS.TRACKED_APPS,
        JSON.stringify(mergedApps)
      );
    }

    if (cloudData.keywords.length > 0) {
      const localKeywords = getAllKeywords();
      const mergedKeywords = mergeData(localKeywords, cloudData.keywords, "id");
      localStorage.setItem(
        STORAGE_KEYS.KEYWORDS,
        JSON.stringify(mergedKeywords)
      );
    }

    if (cloudData.analyses.length > 0) {
      const localAnalyses = getAnalysisHistory();
      const mergedAnalyses = mergeData(localAnalyses, cloudData.analyses, "id");
      localStorage.setItem(
        STORAGE_KEYS.ANALYSIS_HISTORY,
        JSON.stringify(mergedAnalyses.slice(0, 50))
      );
    }

    // Load settings
    const settings = await fetchSettingsFromCloud();
    if (settings?.selectedCountry) {
      localStorage.setItem(
        STORAGE_KEYS.SELECTED_COUNTRY,
        settings.selectedCountry
      );
    }

    console.log("☁️ Data loaded from cloud");
    return true;
  } catch (error) {
    console.warn("Could not load from cloud:", error);
    return false;
  }
};

// Merge helper: combines local and cloud data, cloud wins on conflict
function mergeData<T extends { id: string }>(
  local: T[],
  cloud: T[],
  key: keyof T
): T[] {
  const map = new Map<string, T>();

  // Add local first
  for (const item of local) {
    map.set(String(item[key]), item);
  }

  // Cloud overwrites
  for (const item of cloud) {
    map.set(String(item[key]), item);
  }

  return Array.from(map.values());
}

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
  if (tracked.some((t) => t.id === app.id)) return;

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
  debouncedCloudSync(); // Sync to cloud
};

export const removeTrackedApp = (appId: string): void => {
  const tracked = getTrackedApps().filter((t) => t.id !== appId);
  localStorage.setItem(STORAGE_KEYS.TRACKED_APPS, JSON.stringify(tracked));
  deleteTrackedAppFromCloud(appId); // Delete from cloud
  debouncedCloudSync();
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
  debouncedCloudSync(); // Sync to cloud
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

  history.unshift(saved);
  const limited = history.slice(0, 50);
  localStorage.setItem(STORAGE_KEYS.ANALYSIS_HISTORY, JSON.stringify(limited));
  debouncedCloudSync(); // Sync to cloud
};

export const deleteAnalysis = (analysisId: string): void => {
  const history = getAnalysisHistory().filter((h) => h.id !== analysisId);
  localStorage.setItem(STORAGE_KEYS.ANALYSIS_HISTORY, JSON.stringify(history));
  deleteAnalysisFromCloud(analysisId); // Delete from cloud
  debouncedCloudSync();
};

// Country Selection
export const getSelectedCountry = (): string => {
  return localStorage.getItem(STORAGE_KEYS.SELECTED_COUNTRY) || "US";
};

export const setSelectedCountry = (country: string): void => {
  localStorage.setItem(STORAGE_KEYS.SELECTED_COUNTRY, country);
  syncSettingsToCloud({ selectedCountry: country }); // Sync to cloud
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
  if (
    keywords.some(
      (k) =>
        k.appId === keyword.appId &&
        k.keyword.toLowerCase() === keyword.keyword.toLowerCase()
    )
  ) {
    return;
  }
  keywords.push(keyword);
  localStorage.setItem(STORAGE_KEYS.KEYWORDS, JSON.stringify(keywords));
  debouncedCloudSync(); // Sync to cloud
};

export const removeKeyword = (keywordId: string): void => {
  const keywords = getAllKeywords().filter((k) => k.id !== keywordId);
  localStorage.setItem(STORAGE_KEYS.KEYWORDS, JSON.stringify(keywords));
  deleteKeywordFromCloud(keywordId); // Delete from cloud
  debouncedCloudSync();
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
  debouncedCloudSync(); // Sync to cloud
};
