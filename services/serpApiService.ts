// SerpAPI service for fetching app store data
const SERP_API_KEY =
  "0368c56eebd03a3c27e212d9f829aedd1cb7e5d6fc653b9a4d4188892e482c63";
const SERP_API_URL = "https://serpapi.com/search.json";

export interface AppIconData {
  name: string;
  icon: string;
}

/**
 * Fetches app icon from SerpAPI using App Store search
 */
export const fetchAppIconFromSerp = async (
  appName: string
): Promise<AppIconData | null> => {
  // SerpAPI doesn't work from browser - skip it for now, use iTunes only
  return null;

  /* DISABLED - SerpAPI requires backend
  try {
    const params = new URLSearchParams({
      engine: 'apple_app_store',
      term: appName,
      api_key: SERP_API_KEY,
    });

    const response = await fetch(`${SERP_API_URL}?${params.toString()}`);
    
    if (!response.ok) {
      console.warn(`SerpAPI request failed for ${appName}:`, response.status);
      return null;
    }

    const data = await response.json();
    
    // SerpAPI App Store results structure - check multiple possible fields
    if (data.apps && Array.isArray(data.apps) && data.apps.length > 0) {
      const firstResult = data.apps[0];
      const iconUrl = firstResult.thumbnail || firstResult.icon || firstResult.logo || firstResult.image || '';
      
      if (iconUrl) {
        return {
          name: firstResult.title || firstResult.name || appName,
          icon: iconUrl,
        };
      }
    }
    
    // Also check organic_results as fallback
    if (data.organic_results && Array.isArray(data.organic_results) && data.organic_results.length > 0) {
      const firstResult = data.organic_results[0];
      const iconUrl = firstResult.thumbnail || firstResult.icon || firstResult.logo || firstResult.image || '';
      
      if (iconUrl) {
        return {
          name: firstResult.title || firstResult.name || appName,
          icon: iconUrl,
        };
      }
    }
    
    // Check for app_store_results
    if (data.app_store_results && data.app_store_results.apps && Array.isArray(data.app_store_results.apps) && data.app_store_results.apps.length > 0) {
      const firstResult = data.app_store_results.apps[0];
      const iconUrl = firstResult.thumbnail || firstResult.icon || firstResult.logo || firstResult.image || '';
      
      if (iconUrl) {
        return {
          name: firstResult.title || firstResult.name || appName,
          icon: iconUrl,
        };
      }
    }
    
    return null;
  } catch (error) {
    console.warn(`Error fetching from SerpAPI for ${appName}:`, error);
    return null;
  }
  */
};

/**
 * Fetches app icon from iTunes API as fallback
 */
export const fetchAppIconFromiTunes = async (
  appName: string
): Promise<AppIconData | null> => {
  try {
    const targetUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(
      appName
    )}&entity=software&country=US&limit=1`;

    // Try direct fetch first (might work in some browsers)
    let response;
    try {
      response = await fetch(targetUrl);
    } catch (e) {
      // If CORS fails, try with proxy
      const PROXY_URL = "https://cors.sh/";
      response = await fetch(`${PROXY_URL}${targetUrl}`);
    }

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const item = data.results[0];
      const iconUrl =
        item.artworkUrl100?.replace("100x100", "512x512") ||
        item.artworkUrl512 ||
        item.artworkUrl100 ||
        "";

      if (iconUrl) {
        return {
          name: item.trackName || appName,
          icon: iconUrl,
        };
      }
    }

    return null;
  } catch (error) {
    console.warn(`Error fetching from iTunes for ${appName}:`, error);
    return null;
  }
};

/**
 * Fetches app icon with fallback: tries SerpAPI first, then iTunes
 */
export const fetchAppIcon = async (appName: string): Promise<AppIconData> => {
  // Try SerpAPI first
  let result = await fetchAppIconFromSerp(appName);

  if (result && result.icon) {
    return result;
  }

  // Fallback to iTunes
  result = await fetchAppIconFromiTunes(appName);

  if (result && result.icon) {
    return result;
  }

  // Return placeholder if both fail
  return {
    name: appName,
    icon: "",
  };
};
