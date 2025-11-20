// New API service that uses the backend instead of direct API calls
import { App } from "../types";

const API_BASE_URL =
  (import.meta.env?.VITE_API_URL as string) || "http://localhost:3002";

export interface AppIconData {
  name: string;
  icon: string;
}

/**
 * Search for apps using the backend API
 * @param searchTerm The search query
 * @param country Optional country code (default: US)
 */
export const searchApps = async (
  searchTerm: string,
  country: string = "US"
): Promise<App[]> => {
  const response = await fetch(
    `${API_BASE_URL}/api/search?q=${encodeURIComponent(
      searchTerm
    )}&country=${country}`
  );

  if (!response.ok) {
    throw new Error(`Failed to search apps: ${response.statusText}`);
  }

  const data = await response.json();
  return data.results || [];
};

/**
 * Get detailed app information
 * @param _appName The app name (unused, kept for compatibility)
 * @param appId The app ID
 */
export const getAppDetails = async (
  _appName: string,
  appId: string
): Promise<App> => {
  const response = await fetch(`${API_BASE_URL}/api/app/${appId}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch app details: ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Get app icon
 */
export const fetchAppIcon = async (appName: string): Promise<AppIconData> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/icon?name=${encodeURIComponent(appName)}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch icon: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.warn(`Error fetching icon for ${appName}:`, error);
    return { name: appName, icon: "" };
  }
};
