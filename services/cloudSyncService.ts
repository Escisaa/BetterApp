// Cloud Sync Service - Syncs user data to Supabase
import { supabase } from "./supabaseClient";
import { TrackedApp, SavedAnalysis, StoredKeyword } from "./storageService";

// Get current user ID
const getUserId = async (): Promise<string | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id || null;
};

// ============================================
// TRACKED APPS SYNC
// ============================================

export const syncTrackedAppsToCloud = async (
  apps: TrackedApp[]
): Promise<boolean> => {
  try {
    const userId = await getUserId();
    if (!userId) return false;

    // Upsert all tracked apps
    const records = apps.map((app) => ({
      user_id: userId,
      app_id: app.id,
      app_data: app.app,
      tracked_since: app.trackedSince,
      last_checked: app.lastChecked,
      snapshots: app.snapshots,
    }));

    const { error } = await supabase.from("user_tracked_apps").upsert(records, {
      onConflict: "user_id,app_id",
    });

    if (error) {
      console.error("Error syncing tracked apps:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error in syncTrackedAppsToCloud:", error);
    return false;
  }
};

export const fetchTrackedAppsFromCloud = async (): Promise<
  TrackedApp[] | null
> => {
  try {
    const userId = await getUserId();
    if (!userId) return null;

    const { data, error } = await supabase
      .from("user_tracked_apps")
      .select("*")
      .eq("user_id", userId)
      .order("tracked_since", { ascending: false });

    if (error) {
      console.error("Error fetching tracked apps:", error);
      return null;
    }

    return (data || []).map((row) => ({
      id: row.app_id,
      app: row.app_data,
      trackedSince: row.tracked_since,
      lastChecked: row.last_checked,
      snapshots: row.snapshots || [],
    }));
  } catch (error) {
    console.error("Error in fetchTrackedAppsFromCloud:", error);
    return null;
  }
};

export const deleteTrackedAppFromCloud = async (
  appId: string
): Promise<boolean> => {
  try {
    const userId = await getUserId();
    if (!userId) return false;

    const { error } = await supabase
      .from("user_tracked_apps")
      .delete()
      .eq("user_id", userId)
      .eq("app_id", appId);

    if (error) {
      console.error("Error deleting tracked app:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error in deleteTrackedAppFromCloud:", error);
    return false;
  }
};

// ============================================
// KEYWORDS SYNC
// ============================================

export const syncKeywordsToCloud = async (
  keywords: StoredKeyword[]
): Promise<boolean> => {
  try {
    const userId = await getUserId();
    if (!userId) return false;

    const records = keywords.map((kw) => ({
      user_id: userId,
      keyword_id: kw.id,
      app_id: kw.appId,
      keyword: kw.keyword,
      source: kw.source,
      position: kw.position,
      position_change: kw.positionChange,
      last_checked: kw.lastChecked,
      notes: kw.notes,
      popularity: kw.popularity,
      difficulty: kw.difficulty,
      apps_in_ranking: kw.appsInRanking,
      total_apps_in_ranking: kw.totalAppsInRanking,
      previous_position: kw.previousPosition,
      history: kw.history,
      created_at: kw.createdAt,
    }));

    const { error } = await supabase.from("user_keywords").upsert(records, {
      onConflict: "user_id,keyword_id",
    });

    if (error) {
      console.error("Error syncing keywords:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error in syncKeywordsToCloud:", error);
    return false;
  }
};

export const fetchKeywordsFromCloud = async (): Promise<
  StoredKeyword[] | null
> => {
  try {
    const userId = await getUserId();
    if (!userId) return null;

    const { data, error } = await supabase
      .from("user_keywords")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching keywords:", error);
      return null;
    }

    return (data || []).map((row) => ({
      id: row.keyword_id,
      appId: row.app_id,
      keyword: row.keyword,
      source: row.source,
      position: row.position,
      positionChange: row.position_change,
      lastChecked: row.last_checked,
      notes: row.notes,
      popularity: row.popularity,
      difficulty: row.difficulty,
      appsInRanking: row.apps_in_ranking,
      totalAppsInRanking: row.total_apps_in_ranking,
      previousPosition: row.previous_position,
      history: row.history,
      createdAt: row.created_at,
    }));
  } catch (error) {
    console.error("Error in fetchKeywordsFromCloud:", error);
    return null;
  }
};

export const deleteKeywordFromCloud = async (
  keywordId: string
): Promise<boolean> => {
  try {
    const userId = await getUserId();
    if (!userId) return false;

    const { error } = await supabase
      .from("user_keywords")
      .delete()
      .eq("user_id", userId)
      .eq("keyword_id", keywordId);

    if (error) {
      console.error("Error deleting keyword:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error in deleteKeywordFromCloud:", error);
    return false;
  }
};

// ============================================
// ANALYSIS HISTORY SYNC
// ============================================

export const syncAnalysisToCloud = async (
  analyses: SavedAnalysis[]
): Promise<boolean> => {
  try {
    const userId = await getUserId();
    if (!userId) return false;

    // Only sync last 50 analyses
    const toSync = analyses.slice(0, 50);

    const records = toSync.map((analysis) => ({
      user_id: userId,
      analysis_id: analysis.id,
      app_id: analysis.appId,
      app_name: analysis.appName,
      app_icon: analysis.appIcon,
      analysis_data: analysis.analysis,
      tags: analysis.tags,
      created_at: analysis.createdAt,
    }));

    const { error } = await supabase.from("user_analyses").upsert(records, {
      onConflict: "user_id,analysis_id",
    });

    if (error) {
      console.error("Error syncing analyses:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error in syncAnalysisToCloud:", error);
    return false;
  }
};

export const fetchAnalysesFromCloud = async (): Promise<
  SavedAnalysis[] | null
> => {
  try {
    const userId = await getUserId();
    if (!userId) return null;

    const { data, error } = await supabase
      .from("user_analyses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching analyses:", error);
      return null;
    }

    return (data || []).map((row) => ({
      id: row.analysis_id,
      appId: row.app_id,
      appName: row.app_name,
      appIcon: row.app_icon,
      analysis: row.analysis_data,
      tags: row.tags,
      createdAt: row.created_at,
    }));
  } catch (error) {
    console.error("Error in fetchAnalysesFromCloud:", error);
    return null;
  }
};

export const deleteAnalysisFromCloud = async (
  analysisId: string
): Promise<boolean> => {
  try {
    const userId = await getUserId();
    if (!userId) return false;

    const { error } = await supabase
      .from("user_analyses")
      .delete()
      .eq("user_id", userId)
      .eq("analysis_id", analysisId);

    if (error) {
      console.error("Error deleting analysis:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error in deleteAnalysisFromCloud:", error);
    return false;
  }
};

// ============================================
// FULL SYNC (Initial load + merge)
// ============================================

export const performFullSync = async (): Promise<{
  trackedApps: TrackedApp[];
  keywords: StoredKeyword[];
  analyses: SavedAnalysis[];
}> => {
  const userId = await getUserId();

  if (!userId) {
    // Not logged in, return empty
    return { trackedApps: [], keywords: [], analyses: [] };
  }

  // Fetch from cloud
  const [cloudApps, cloudKeywords, cloudAnalyses] = await Promise.all([
    fetchTrackedAppsFromCloud(),
    fetchKeywordsFromCloud(),
    fetchAnalysesFromCloud(),
  ]);

  return {
    trackedApps: cloudApps || [],
    keywords: cloudKeywords || [],
    analyses: cloudAnalyses || [],
  };
};

// ============================================
// SETTINGS SYNC
// ============================================

export const syncSettingsToCloud = async (settings: {
  selectedCountry: string;
}): Promise<boolean> => {
  try {
    const userId = await getUserId();
    if (!userId) return false;

    const { error } = await supabase.from("user_settings").upsert(
      {
        user_id: userId,
        selected_country: settings.selectedCountry,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (error) {
      console.error("Error syncing settings:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error in syncSettingsToCloud:", error);
    return false;
  }
};

export const fetchSettingsFromCloud = async (): Promise<{
  selectedCountry: string;
} | null> => {
  try {
    const userId = await getUserId();
    if (!userId) return null;

    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error || !data) return null;

    return {
      selectedCountry: data.selected_country || "US",
    };
  } catch (error) {
    console.error("Error in fetchSettingsFromCloud:", error);
    return null;
  }
};
