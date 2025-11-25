// Frontend service that calls backend API instead of direct Gemini API
// This keeps the API key secure on the backend

const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env?.VITE_API_URL as string;
  if (envUrl) {
    return envUrl.replace(/[.\/]+$/, "");
  }

  if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    !window.location.hostname.includes("127.0.0.1")
  ) {
    return "https://betterapp-arsv.onrender.com";
  }

  return "http://localhost:3002";
};

const API_BASE_URL = getApiBaseUrl();

import { Review, CompetitiveIntelligence } from "../types";

export const analyzeReviewsWithAI = async (
  appName: string,
  reviews: Review[]
) => {
  const response = await fetch(`${API_BASE_URL}/api/ai/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ appName, reviews }),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Failed to analyze reviews" }));
    throw new Error(error.error || "Failed to analyze reviews");
  }

  return await response.json();
};

export const generateTagsWithAI = async (
  appName: string,
  reviews: Review[]
): Promise<string[]> => {
  const response = await fetch(`${API_BASE_URL}/api/ai/tags`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ appName, reviews }),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Failed to generate tags" }));
    console.error("Error generating tags:", error);
    return [];
  }

  const data = await response.json();
  return data.tags || [];
};

export const chatWithAI = async (
  appName: string,
  chatHistory: { role: string; parts: { text: string }[] }[],
  newMessage: string
): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ appName, chatHistory, message: newMessage }),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Failed to get chat response" }));
    return error.error || "Sorry, I couldn't get a response. Please try again.";
  }

  const data = await response.json();
  return (
    data.response || "Sorry, I couldn't generate a response. Please try again."
  );
};

export const analyzeCompetitiveIntelligence = async (
  appName: string,
  reviews: Review[],
  appMetadata?: {
    screenshots?: string[];
    description?: string;
    price?: number;
    formattedPrice?: string;
    primaryGenreName?: string;
  }
): Promise<CompetitiveIntelligence> => {
  const response = await fetch(`${API_BASE_URL}/api/ai/competitive`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ appName, reviews, appMetadata }),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Failed to analyze competitive intelligence" }));
    throw new Error(
      error.error || "Failed to analyze competitive intelligence"
    );
  }

  return await response.json();
};
