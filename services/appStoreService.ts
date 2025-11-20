import { App, Review } from "../types";

// Using a proxy to avoid CORS issues. Try multiple proxies as fallback.
const PROXY_URLS = [
  "https://api.allorigins.win/raw?url=",
  "https://corsproxy.io/?",
  "https://cors.sh/",
];

// Helper to format large numbers for display
const formatCount = (num: number): string => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}m`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k`;
  return num.toString();
};

/**
 * Searches for apps using the iTunes Search API.
 * This provides a lightweight list of apps for search results.
 * @param searchTerm The term to search for.
 * @returns A promise that resolves to an array of App objects.
 */
const fetchWithProxy = async (url: string): Promise<Response> => {
  for (const proxy of PROXY_URLS) {
    try {
      const proxyUrl =
        proxy === "https://api.allorigins.win/raw?url="
          ? `${proxy}${encodeURIComponent(url)}`
          : `${proxy}${url}`;
      const response = await fetch(proxyUrl, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(10000), // 10s timeout
      });
      if (response.ok) return response;
    } catch (e) {
      continue; // Try next proxy
    }
  }
  throw new Error("All proxy attempts failed");
};

export const searchApps = async (searchTerm: string): Promise<App[]> => {
  const targetUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(
    searchTerm
  )}&entity=software&country=US&limit=25`;
  const response = await fetchWithProxy(targetUrl);
  const data = await response.json();

  if (!data.results) {
    return [];
  }

  return data.results.map(
    (item: any): App => ({
      id: item.trackId.toString(),
      name: item.trackName,
      developer: item.artistName,
      icon: item.artworkUrl100.replace("100x100", "256x256"), // Request a larger icon
      rating: parseFloat(item.averageUserRating) || 0,
      reviewsCount: formatCount(item.userRatingCount || 0),
      releaseDate: new Date(item.releaseDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      // Full details like screenshots and reviews are fetched upon selection
      screenshots: [],
      downloads: "N/A",
      revenue: "N/A",
      reviews: [],
    })
  );
};

/**
 * Fetches detailed information for a specific app using the official iTunes Lookup API for metadata
 * and the iTunes RSS feed for user reviews.
 * @param _appName The name of the app (unused, as lookup is by ID).
 * @param appId The unique trackId of the app.
 * @returns A promise that resolves to a detailed App object.
 */
export const getAppDetails = async (
  _appName: string,
  appId: string
): Promise<App> => {
  // Step 1: Fetch reliable metadata from iTunes Lookup API
  const itunesUrl = `https://itunes.apple.com/lookup?id=${appId}&entity=software&country=US`;
  const itunesResponse = await fetchWithProxy(itunesUrl);

  if (!itunesResponse.ok) {
    throw new Error("Failed to fetch from iTunes Lookup API via proxy");
  }
  const itunesData = await itunesResponse.json();

  if (!itunesData.results || itunesData.results.length === 0) {
    throw new Error(
      `Could not find app details in iTunes for app ID "${appId}".`
    );
  }
  const appData = itunesData.results[0];

  // Step 2: Fetch reviews from the official iTunes RSS feed
  let reviews: Review[] = [];
  const reviewsUrl = `https://itunes.apple.com/us/rss/customerreviews/id=${appId}/sortBy=mostRecent/json`;

  try {
    const reviewsResponse = await fetchWithProxy(reviewsUrl);
    if (reviewsResponse.ok) {
      const reviewsData = await reviewsResponse.json();
      if (reviewsData.feed && reviewsData.feed.entry) {
        // The first entry is app metadata, the rest are reviews.
        reviews = reviewsData.feed.entry.slice(1).map(
          (entry: any, index: number): Review => ({
            id: index, // Use index as a stable ID for React keys
            rating: parseInt(entry["im:rating"].label, 10),
            author: entry.author.name.label,
            date: new Date(entry.updated.label).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
            title: entry.title.label,
            content: entry.content.label,
          })
        );
      }
    } else {
      const errorBody = await reviewsResponse.text();
      console.warn("Could not fetch reviews from iTunes RSS feed:", errorBody);
    }
  } catch (error) {
    console.warn(
      "Error fetching or parsing reviews from iTunes RSS feed:",
      error
    );
  }

  // Step 3: Combine all data into our App type
  return {
    id: appData.trackId.toString(),
    name: appData.trackName,
    developer: appData.artistName,
    icon: appData.artworkUrl100.replace("100x100", "256x256"),
    rating: parseFloat(appData.averageUserRating) || 0,
    reviewsCount: formatCount(appData.userRatingCount || 0),
    releaseDate: new Date(appData.releaseDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    screenshots: appData.screenshotUrls || [],
    downloads: "N/A", // Performance data is not available from this source
    revenue: "N/A", // Performance data is not available from this source
    reviews: reviews, // The RSS feed returns up to 50 reviews
  };
};
