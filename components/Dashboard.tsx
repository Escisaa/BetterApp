import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { App, Review, AnalysisResult } from "../types";
import {
  searchApps,
  getAppDetails,
  fetchAppIcon,
  API_BASE_URL,
} from "../services/apiService";
import {
  analyzeReviewsWithAI,
  generateTagsWithAI,
  chatWithAI,
  analyzeCompetitiveIntelligence,
} from "../services/geminiService";
import {
  getTrackedApps,
  addTrackedApp,
  removeTrackedApp,
  getAnalysisHistory,
  saveAnalysis,
  deleteAnalysis,
  TrackedApp,
  SavedAnalysis,
  getKeywordsForApp,
  addKeyword,
  removeKeyword,
  updateKeyword,
  StoredKeyword,
} from "../services/storageService";
import {
  extractKeywordsFromMetadata,
  generateKeywordSuggestions,
  discoverRankingKeywords,
  extractCompetitorKeywords,
  checkKeywordRanking,
  KeywordSuggestion,
} from "../services/keywordService";
import {
  exportReviewsToCSV,
  exportAnalysisToCSV,
} from "../services/exportService";
import { APP_STORE_COUNTRIES, getCountryByCode } from "../services/countries";
import { translateKeyword } from "../services/translationService";
import { KEYWORD_CONFIG } from "../services/keywordConfig";
import {
  validateLicense,
  getStoredLicense,
  saveLicense,
  checkLicenseStatus,
  getLicenseDetails,
  openCustomerPortal,
  resendLicenseKey,
  fetchLicenseForEmail,
  type LicenseDetails,
} from "../services/licenseService";
import {
  StarIcon,
  SearchIcon,
  DownloadIcon,
  RevenueIcon,
  WandIcon,
  SendIcon,
  ClipboardIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  ClockIcon,
  GiftIcon,
  FilledCircleIcon,
} from "./Icons";
import Logo from "./Logo";
import { HowToBeatThemCard } from "./HowToBeatThemCard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Initial state for the bubble apps on the main search screen - Updated with latest popular apps
const initialUiApps = [
  {
    id: "1",
    displayName: "ChatGPT",
    searchTerm: "ChatGPT",
    bg: "bg-green-500",
  },
  {
    id: "2",
    displayName: "Instagram",
    searchTerm: "Instagram",
    bg: "bg-pink-500",
  },
  {
    id: "3",
    displayName: "Spotify",
    searchTerm: "Spotify - Music and Podcasts",
    bg: "bg-green-600",
  },
  { id: "4", displayName: "TikTok", searchTerm: "TikTok", bg: "bg-black" },
  { id: "5", displayName: "Notion", searchTerm: "Notion", bg: "bg-gray-800" },
  {
    id: "6",
    displayName: "Discord",
    searchTerm: "Discord",
    bg: "bg-indigo-500",
  },
  {
    id: "7",
    displayName: "Duolingo",
    searchTerm: "Duolingo",
    bg: "bg-green-400",
  },
  { id: "8", displayName: "Uber", searchTerm: "Uber", bg: "bg-gray-900" },
  { id: "9", displayName: "Netflix", searchTerm: "Netflix", bg: "bg-red-600" },
].map((app, i) => ({ ...app, angle: 360 - i * (360 / 9), icon: null }));

// Sub-components defined outside to prevent re-creation on re-renders
const AppListItem: React.FC<{
  app: App;
  isSelected: boolean;
  onSelect: (app: App) => void;
  onTrack?: (app: App) => void;
  isTracked?: boolean;
}> = ({ app, isSelected, onSelect, onTrack, isTracked }) => (
  <li
    className={`flex items-start space-x-4 p-3 rounded-lg cursor-pointer border ${
      isSelected
        ? "bg-gray-800 border-gray-700"
        : "hover:bg-gray-700/50 border-gray-800"
    }`}
  >
    <img
      src={app.icon}
      alt={`${app.name} icon`}
      className="w-14 h-14 rounded-xl flex-shrink-0"
    />
    <div
      className="flex-1 overflow-hidden min-w-0"
        onClick={() => onSelect(app)}
    >
            <p className="font-semibold text-sm text-gray-100 truncate">{app.name}</p>
            <p className="text-xs text-gray-400 truncate">{app.developer}</p>
      <div className="flex items-center space-x-1 mt-1.5">
        <StarIcon className="w-3.5 h-3.5 text-yellow-400" />
        <span className="text-xs font-medium text-gray-300">{app.rating}</span>
        <span className="text-xs text-gray-500">({app.reviewsCount})</span>
            </div>
      {app.reviews && app.reviews.length > 0 && (
        <div className="mt-2 space-y-1">
          {app.reviews.slice(0, 2).map((review) => (
            <div key={review.id} className="text-xs text-gray-400 line-clamp-2">
              <span className="text-yellow-400">★{review.rating}</span>{" "}
              {review.content.substring(0, 80)}...
        </div>
          ))}
        </div>
      )}
    </div>
    {onTrack && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onTrack(app);
        }}
        className={`flex-shrink-0 px-3 py-1.5 text-xs rounded-lg transition-colors ${
          isTracked
            ? "bg-blue-600 text-white"
            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
        }`}
        title={isTracked ? "Untrack app" : "Track app"}
      >
        {isTracked ? "✓ Tracked" : "+ Track"}
      </button>
    )}
    </li>
);

const AppDetailHeader: React.FC<{ app: App }> = ({ app }) => (
  <div className="space-y-6">
    <div className="flex items-start space-x-6">
      <img
        src={app.icon}
        alt={`${app.name} icon`}
        className="w-24 h-24 rounded-3xl"
      />
      <div className="flex-1">
            <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-white">{app.name}</h1>
            </div>
            <p className="text-md text-gray-400 mt-1">{app.developer}</p>
            <div className="flex items-center space-x-2 mt-2">
          <span className="font-bold text-lg text-white">
            {app.rating.toFixed(1)}
          </span>
                <div className="flex">
                    {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={`w-5 h-5 ${
                  i < Math.round(app.rating)
                    ? "text-yellow-400"
                    : "text-gray-400"
                }`}
              />
                    ))}
                </div>
                <span className="text-gray-400">{app.reviewsCount} Ratings</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">Released {app.releaseDate}</p>
        <div className="flex items-center gap-2 mt-3">
          {app.trackViewUrl && (
            <a
              href={app.trackViewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              View on App Store
            </a>
          )}
          {app.trackViewUrl && (
            <button
              onClick={(e) => {
                navigator.clipboard.writeText(app.trackViewUrl || "");
                const btn = e.currentTarget;
                const originalText = btn.title;
                btn.title = "Copied!";
                setTimeout(() => {
                  btn.title = originalText;
                }, 2000);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 text-white text-xs font-medium rounded-lg hover:bg-gray-600 transition-colors"
              title="Copy App Store URL"
            >
              <ClipboardIcon className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={(e) => {
              navigator.clipboard.writeText(app.id);
              const btn = e.currentTarget;
              const originalText = btn.title;
              btn.title = "App ID copied!";
              setTimeout(() => {
                btn.title = originalText;
              }, 2000);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 text-white text-xs font-medium rounded-lg hover:bg-gray-600 transition-colors"
            title="Copy App ID"
          >
            <ClipboardIcon className="w-4 h-4" />
            <span>ID</span>
          </button>
        </div>
      </div>
    </div>

    {/* Additional App Info */}
    {(app.description ||
      app.formattedPrice ||
      app.fileSizeFormatted ||
      app.primaryGenreName ||
      app.contentAdvisoryRating ||
      app.version) && (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-800">
        {app.formattedPrice && (
          <div>
            <p className="text-xs text-gray-500 mb-1">Price</p>
            <p className="text-sm font-medium text-white">
              {app.formattedPrice}
            </p>
          </div>
        )}
        {app.fileSizeFormatted && app.fileSizeFormatted !== "N/A" && (
          <div>
            <p className="text-xs text-gray-500 mb-1">Size</p>
            <p className="text-sm font-medium text-white">
              {app.fileSizeFormatted}
            </p>
          </div>
        )}
        {app.primaryGenreName && (
          <div>
            <p className="text-xs text-gray-500 mb-1">Category</p>
            <p className="text-sm font-medium text-white">
              {app.primaryGenreName}
            </p>
          </div>
        )}
        {app.contentAdvisoryRating && app.contentAdvisoryRating !== "N/A" && (
          <div>
            <p className="text-xs text-gray-500 mb-1">Rating</p>
            <p className="text-sm font-medium text-white">
              {app.contentAdvisoryRating}
            </p>
          </div>
        )}
        {app.version && (
          <div>
            <p className="text-xs text-gray-500 mb-1">Version</p>
            <p className="text-sm font-medium text-white">{app.version}</p>
          </div>
        )}
        {app.minimumOsVersion && (
          <div>
            <p className="text-xs text-gray-500 mb-1">Requires iOS</p>
            <p className="text-sm font-medium text-white">
              {app.minimumOsVersion}+
            </p>
          </div>
        )}
        {app.languageCodes && app.languageCodes.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-1">Languages</p>
            <p className="text-sm font-medium text-white">
              {app.languageCodes.slice(0, 3).join(", ")}
              {app.languageCodes.length > 3
                ? ` +${app.languageCodes.length - 3}`
                : ""}
            </p>
          </div>
        )}
      </div>
    )}

    {/* Description */}
    {app.description && (
      <div className="pt-4 border-t border-gray-800">
        <p className="text-xs text-gray-500 mb-2">Description</p>
        <p className="text-sm text-gray-300 leading-relaxed line-clamp-4">
          {app.description}
        </p>
      </div>
    )}
    </div>
);

const Screenshots: React.FC<{ urls: string[] }> = ({ urls }) => (
    <div>
        <h2 className="text-lg font-semibold mb-3 text-white">Screenshots</h2>
        <div className="flex space-x-4 overflow-x-auto pb-2 -mx-6 px-6">
            {urls.map((url, index) => (
        <img
          key={index}
          src={url}
          alt={`Screenshot ${index + 1}`}
          className="h-80 rounded-xl object-cover"
        />
            ))}
        </div>
    </div>
);

const PerformanceCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}> = ({ icon, label, value, color }) => (
    <div className="bg-[#1C1C1E] border border-gray-800 rounded-xl p-6 flex-1">
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}
    >
            {icon}
        </div>
        <p className="text-sm text-gray-400 mt-4">{label}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
    </div>
);

const AITags: React.FC<{ tags: string[]; hasAccess?: boolean }> = ({
  tags,
  hasAccess = true,
}) => {
  // Clean tags: remove markdown (**), numbers, and extra formatting
  const cleanTags = tags
    .map((tag) => {
      // Remove markdown bold (**text**)
      let cleaned = tag.replace(/\*\*/g, "");
      // Remove numbers at the start (1. 2. etc)
      cleaned = cleaned.replace(/^\d+\.\s*/, "");
      // Remove quotes
      cleaned = cleaned.replace(/['"]+/g, "");
      // Trim whitespace
      cleaned = cleaned.trim();
      return cleaned;
    })
    .filter((tag) => tag.length > 0); // Remove empty tags

  // Don't show component if no tags and user has license
  if (cleanTags.length === 0 && hasAccess) {
    return null;
  }

  return (
    <div className="bg-[#1C1C1E] border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-orange-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          <h2 className="text-lg font-semibold text-gray-100">
            Relevant AI Tags
          </h2>
          {!hasAccess && (
            <svg
              className="w-4 h-4 text-gray-500 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          )}
        </div>
        <button className="text-gray-400 hover:text-gray-300">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </button>
      </div>
      <div
        className={`flex flex-wrap gap-2 ${
          !hasAccess ? "blur-sm pointer-events-none" : ""
        } relative`}
      >
        {cleanTags.length > 0 ? (
          cleanTags.map((tag, idx) => (
            <div
              key={idx}
              className="bg-orange-500/20 text-orange-400 text-sm font-semibold px-4 py-2.5 rounded-lg border border-orange-500/30"
            >
              {tag}
            </div>
          ))
        ) : !hasAccess ? (
          // Show placeholder tags when no license (so users can see what they're missing)
          <>
            <div className="bg-orange-500/20 text-orange-400 text-sm font-semibold px-4 py-2.5 rounded-lg border border-orange-500/30">
              User Experience
            </div>
            <div className="bg-orange-500/20 text-orange-400 text-sm font-semibold px-4 py-2.5 rounded-lg border border-orange-500/30">
              Performance
            </div>
            <div className="bg-orange-500/20 text-orange-400 text-sm font-semibold px-4 py-2.5 rounded-lg border border-orange-500/30">
              Design
            </div>
            <div className="bg-orange-500/20 text-orange-400 text-sm font-semibold px-4 py-2.5 rounded-lg border border-orange-500/30">
              Features
            </div>
            <div className="bg-orange-500/20 text-orange-400 text-sm font-semibold px-4 py-2.5 rounded-lg border border-orange-500/30">
              Quality
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-sm">No tags available yet</p>
        )}
        </div>
    </div>
);
};

const formatDate = (value?: string | Date) => {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => (
    <div className="border-b border-gray-800 py-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <StarIcon
            key={i}
            className={`w-4 h-4 ${
              i < review.rating ? "text-yellow-400" : "text-gray-600"
            }`}
          />
        ))}
            </div>
            <p className="text-xs text-gray-500">{review.date}</p>
        </div>
        <h3 className="font-semibold mt-2 text-gray-200">{review.title}</h3>
        <p className="text-sm text-gray-400 mt-1">{review.content}</p>
        <p className="text-xs text-gray-400 mt-2 font-medium">{review.author}</p>
    </div>
);

const AnalysisDisplay: React.FC<{
  result: AnalysisResult;
  onCopy: () => void;
}> = ({ result, onCopy }) => (
    <div className="bg-[#1C1C1E] border border-gray-800 rounded-xl p-6 relative">
    <button
      onClick={onCopy}
      className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-700 rounded-md"
    >
      <ClipboardIcon className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-gray-100 mb-4">AI Analysis</h2>
        
        <div className="space-y-6">
            <div>
                <h3 className="font-semibold text-gray-200 mb-2">Summary</h3>
                <p className="text-sm text-gray-400">{result.summary}</p>
            </div>
             <div>
                <h3 className="font-semibold text-gray-200 mb-2">Common Complaints</h3>
                <ul className="list-disc list-inside space-y-1">
          {result.commonComplaints.map((item, i) => (
            <li key={i} className="text-sm text-gray-400">
              {item}
            </li>
          ))}
                </ul>
            </div>
             <div>
                <h3 className="font-semibold text-gray-200 mb-2">Feature Requests</h3>
                 <ul className="list-disc list-inside space-y-1">
          {result.featureRequests.map((item, i) => (
            <li key={i} className="text-sm text-gray-400">
              {item}
            </li>
          ))}
                </ul>
            </div>
             <div>
        <h3 className="font-semibold text-gray-200 mb-2">
          Monetization Insights
        </h3>
                <p className="text-sm text-gray-400">{result.monetization}</p>
            </div>
             <div>
        <h3 className="font-semibold text-gray-200 mb-2">
          Market Opportunities
        </h3>
                <p className="text-sm text-gray-400">{result.marketOpportunities}</p>
            </div>
        </div>
    </div>
);

// Chat Modal Component (like Peter AI)
const ChatModal: React.FC<{
  app: App | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ app, isOpen, onClose }) => {
  const [messages, setMessages] = useState<
    { role: "user" | "model"; text: string }[]
  >([]);
  const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
    // Clear chat when app changes or modal closes
    if (!isOpen) {
      setMessages([]);
      setInput("");
    }
  }, [app?.id, isOpen]);

  // ESC key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

    const handleSend = async () => {
    if (!input.trim() || isLoading || !app) return;

    const userMessage = { role: "user" as const, text: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
        setIsLoading(true);

        try {
      const chatHistory: any[] = messages.map((m) => ({
                role: m.role,
        parts: [{ text: m.text }],
      }));
      const responseText = await chatWithAI(
        app.name,
        chatHistory,
        currentInput
      );
      setMessages((prev) => [
        ...prev,
        { role: "model" as const, text: responseText },
      ]);
        } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "model" as const,
          text: "Sorry, I couldn't get a response. Please try again.",
        },
      ]);
        } finally {
            setIsLoading(false);
        }
    };

  const suggestedQuestions = [
    "What do users like most about this app?",
    "What are the main complaints users have?",
    "How can I get the most out of this app?",
  ];

  const handleSuggestedQuestion = (question: string) => {
    setInput("");
    setIsLoading(true);
    const userMessage = { role: "user" as const, text: question };
    setMessages((prev) => [...prev, userMessage]);

    chatWithAI(
      app?.name || "",
      messages.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      })),
      question
    )
      .then((responseText) => {
        setMessages((prev) => [
          ...prev,
          { role: "model" as const, text: responseText },
        ]);
      })
      .catch(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "model" as const,
            text: "Sorry, I couldn't get a response. Please try again.",
          },
        ]);
      })
      .finally(() => setIsLoading(false));
  };

  if (!isOpen || !app) return null;

    return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-[#1C1C1E] border border-gray-800 rounded-2xl w-full max-w-4xl flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxHeight: "85vh",
          minHeight: "600px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-4">
            <img
              src={app.icon}
              alt={app.name}
              className="w-12 h-12 rounded-xl"
            />
            <div>
              <h2 className="text-xl font-semibold text-white">{app.name}</h2>
              <p className="text-sm text-gray-400">
                Chat with AI about this app
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Chat Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#111213] min-h-0">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Chat with {app.name}
              </h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Ask questions about this app, its features, user reviews, or get
                recommendations on how to use it better.
              </p>
              <div className="space-y-2 max-w-lg mx-auto">
                <p className="text-sm font-medium text-gray-300 mb-3">
                  Try asking:
                </p>
                {suggestedQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="w-full text-left px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg hover:border-orange-500 hover:bg-gray-700 transition-colors flex items-center justify-between group"
                  >
                    <span className="text-gray-300 group-hover:text-orange-400">
                      {question}
                    </span>
                    <svg
                      className="w-5 h-5 text-gray-500 group-hover:text-orange-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
                    {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                      msg.role === "user"
                        ? "bg-orange-600 text-white rounded-br-sm"
                        : "bg-gray-800 text-gray-100 border border-gray-700 rounded-bl-sm"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {msg.text}
                    </p>
                            </div>
                        </div>
                    ))}
                     {isLoading && (
                        <div className="flex justify-start">
                  <div className="bg-gray-800 border border-gray-700 text-gray-300 px-4 py-3 rounded-2xl rounded-bl-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                  </div>
                        </div>
                    )}
                </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-800 bg-[#1C1C1E]">
          <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && !e.shiftKey && handleSend()
              }
              placeholder="Ask about this app"
              className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-500"
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
              <SendIcon className="w-4 h-4" />
                    </button>
          </div>
                </div>
            </div>
        </div>
    );
};

const AnalysisPlaceholder: React.FC = () => {
    const placeholderApps = [
        { name: "Payout", bg: "bg-blue-500", emoji: "💰" },
        { name: "Fitness", bg: "bg-orange-500", emoji: "💪" },
        { name: "Dating", bg: "bg-pink-500", emoji: "💕" },
        { name: "Music", bg: "bg-red-500", emoji: "🎵" },
        { name: "Heart", bg: "bg-gray-800", emoji: "❤️" },
        { name: "Social", bg: "bg-slate-700", emoji: "👥" },
    ];
    
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 bg-[#111213]">
            <div className="grid grid-cols-3 gap-6 mb-6">
        {placeholderApps.map((app) => (
                    <div key={app.name} className="flex flex-col items-center gap-2">
            <div
              className={`w-20 h-20 ${app.bg} rounded-3xl flex items-center justify-center text-3xl shadow-md`}
            >
                            {app.emoji}
                        </div>
                    </div>
                ))}
            </div>
      <h2 className="text-xl font-semibold text-gray-200">
        Select an app to begin analysis
      </h2>
      <p className="max-w-xs mt-1">
        Choose an app from the search results on the left to view its details,
        reviews, and AI-powered insights.
      </p>
        </div>
  );
};

const LoadingPlaceholder: React.FC<{ text: string }> = ({ text }) => (
    <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-400 space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p>{text}</p>
        </div>
    </div>
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<"search" | "analysis" | "keywords">(
    "search"
  );
  const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<App[]>([]);
    const [selectedApp, setSelectedApp] = useState<App | null>(null);
    const [aiTags, setAiTags] = useState<string[]>([]);
    const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [copySuccess, setCopySuccess] = useState("");
  const [activeTab, setActiveTab] = useState("");
    const [bubbleApps, setBubbleApps] = useState(initialUiApps);
  const [isLoadingBubbles, setIsLoadingBubbles] = useState(true);
  const [trackedApps, setTrackedApps] = useState<TrackedApp[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("US");
  const [reviewFilter, setReviewFilter] = useState<{
    rating?: number;
    search?: string;
  }>({});
  const [showTrackedModal, setShowTrackedModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showKeywordsModal, setShowKeywordsModal] = useState(false);
  const [showAddAppModal, setShowAddAppModal] = useState(false);
  const [showKeywordSearchModal, setShowKeywordSearchModal] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [hasLicense, setHasLicense] = useState(false);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [licenseKey, setLicenseKey] = useState("");
  const [licenseError, setLicenseError] = useState("");
  const [licenseDetails, setLicenseDetails] = useState<LicenseDetails | null>(
    null
  );
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [isSubmittingLicense, setIsSubmittingLicense] = useState(false);
  const [isResendingLicense, setIsResendingLicense] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [resendStatus, setResendStatus] = useState<{
    success: boolean;
    message?: string;
  } | null>(null);
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);
  const [showManualLicenseEntry, setShowManualLicenseEntry] = useState(false);
  const [licenseCopied, setLicenseCopied] = useState(false);
  const [selectedTrackedApp, setSelectedTrackedApp] =
    useState<TrackedApp | null>(null);

  // Check license on mount and auto-link by email if available
    useEffect(() => {
    const checkLicense = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const email = session?.user?.email || null;
        if (email) {
          setResendEmail((prev) => prev || email);
        }

        let valid = await checkLicenseStatus();
        setHasLicense(valid);

        if (valid) {
          const details = await getLicenseDetails();
          setLicenseDetails(details);
          return;
        }

        // If no license stored locally but user is authenticated, fetch by email
        if (email) {
          const result = await fetchLicenseForEmail(email);
          if (result?.success && result.license?.licenseKey) {
            const normalizedDetails: LicenseDetails = {
              licenseKey: result.license.licenseKey,
              plan: result.license.plan,
              status: result.license.status,
              expiresAt: result.license.expiresAt,
              currentPeriodEnd: result.license.currentPeriodEnd,
            };
            saveLicense(normalizedDetails.licenseKey);
            setHasLicense(true);
            setLicenseDetails(normalizedDetails);
            return;
          }
                            }
                        } catch (error) {
        console.error("Error checking license:", error);
        setHasLicense(false);
      }
    };
    checkLicense();
  }, []);

  // Refresh license details when license is activated
  useEffect(() => {
    if (hasLicense && !licenseDetails) {
      getLicenseDetails().then(setLicenseDetails);
    }
  }, [hasLicense, licenseDetails]);

  // Load recent apps from localStorage and fetch initial app icons on mount
  useEffect(() => {
    // Load recent apps from localStorage
    const savedRecentApps = localStorage.getItem("appscope_recent_apps");
    let appsToShow = initialUiApps;

    if (savedRecentApps) {
      try {
        const recentApps = JSON.parse(savedRecentApps);
        if (recentApps.length > 0) {
          // Use recent apps, but ensure we have angles
          appsToShow = recentApps.map((app: any, i: number) => ({
            ...app,
            angle: 360 - i * (360 / Math.max(recentApps.length, 9)),
          }));
        }
      } catch (e) {
        console.warn("Failed to parse recent apps:", e);
      }
    }

    // Show apps immediately with colored backgrounds, then fetch icons in background
    setBubbleApps(appsToShow);
    setIsLoadingBubbles(false);

    const fetchInitialIcons = async () => {
      console.log("Fetching initial app icons for wheel...");

      // Batch icon fetches to avoid rate limiting
      const BATCH_SIZE = 3;
      const DELAY_BETWEEN_BATCHES = 300; // 300ms delay between batches

      const updatedApps = [...appsToShow];

      // Process icons in batches with delays
      for (let i = 0; i < appsToShow.length; i += BATCH_SIZE) {
        const batch = appsToShow.slice(i, i + BATCH_SIZE);

        await Promise.all(
          batch.map(async (app, batchIndex) => {
            // If app already has an icon, keep it
            if (app.icon && app.icon.startsWith("http")) {
              return;
            }

            try {
              // Try iTunes API first
              let iconUrl = "";
              let appId = app.id;
              let appName = app.displayName;

              // Use fetchAppIcon which goes through backend
              try {
                const iconData = await fetchAppIcon(
                  app.searchTerm || app.displayName
                );
                if (iconData && iconData.icon) {
                  iconUrl = iconData.icon;
                  appName = iconData.name.split(/[:–-]/)[0].trim();
                  console.log(`✓ Fetched ${app.displayName} icon`);

                  // Update immediately for progressive enhancement
                  const appIndex = i + batchIndex;
                  if (appIndex < updatedApps.length) {
                    updatedApps[appIndex] = {
                      ...updatedApps[appIndex],
                      icon: iconUrl,
                      id: appId,
                      searchTerm: app.searchTerm || app.displayName,
                      displayName: appName,
                    };
                    setBubbleApps([...updatedApps]);
                  }
                }
              } catch (iconError) {
                // Silently fail - icons are non-critical
                console.warn(
                  `Failed to fetch icon for ${app.displayName}:`,
                  iconError
                );
              }
            } catch (error) {
              console.error(
                `Failed to fetch icon for ${app.displayName}:`,
                error
              );
            }
          })
        );

        // Delay between batches to avoid rate limiting
        if (i + BATCH_SIZE < appsToShow.length) {
          await new Promise((resolve) =>
            setTimeout(resolve, DELAY_BETWEEN_BATCHES)
          );
        }
      }

      console.log(
        "Updated bubble apps:",
        updatedApps.filter((a) => a.icon && a.icon.startsWith("http")).length,
        "apps with icons"
      );
      setBubbleApps(updatedApps);
    };

    // Fetch icons in background
    fetchInitialIcons();
  }, []);
    
    const handleSearchView = () => {
    setView("search");
        setSelectedApp(null);
    setSearchQuery("");
        setSearchResults([]);
  };

    const handleSearch = async (query: string) => {
        if (!query.trim()) return;
        
        setIsSearching(true);
    if (view === "search") {
      setView("analysis");
        }
        setSelectedApp(null);
        setSearchResults([]);

        try {
      const apps = await searchApps(query, selectedCountry);
      // Fetch reviews for each app to show in search results (like Peter AI)
      const appsWithReviews = await Promise.all(
        apps.slice(0, 10).map(async (app) => {
          try {
            const detailed = await getAppDetails(app.name, app.id);
            return { ...app, reviews: detailed.reviews.slice(0, 3) }; // Show first 3 reviews
          } catch {
            return app; // Return original if details fail
          }
        })
      );
      setSearchResults(appsWithReviews);

      // Add searched apps to the wheel (add first result if it's new)
      if (apps.length > 0) {
        const firstApp = apps[0];
        setBubbleApps((prevApps) => {
          // Check if app already exists in wheel
          if (prevApps.some((b) => b.id === firstApp.id)) {
            return prevApps;
          }

          // Add new app to the front of the list (most recent)
          const newAppBubble = {
            id: firstApp.id,
            displayName: firstApp.name.split(/[:–-]/)[0].trim(),
            searchTerm: firstApp.name,
            icon: firstApp.icon,
            bg: "bg-gray-800",
          };

          // Add to front, keep max 9 apps
          const updatedApps = [newAppBubble, ...prevApps].slice(0, 9);

          // Recalculate angles for all apps
          const appsWithAngles = updatedApps.map((app, i) => ({
            ...app,
            angle: 360 - i * (360 / updatedApps.length),
          }));

          // Save to localStorage
          localStorage.setItem(
            "appscope_recent_apps",
            JSON.stringify(appsWithAngles.map(({ angle, ...app }) => app))
          );

          return appsWithAngles;
        });
      }
    } catch (error: any) {
            console.error("Error searching apps:", error);
      const errorMessage =
        error?.message || "Failed to search for apps. Please try again.";
      alert(errorMessage);
      if (view === "analysis") {
                handleSearchView(); // Go back to search if it fails
            }
        } finally {
            setIsSearching(false);
        }
  };

  const handleSelectApp = useCallback(
    async (app: App) => {
        if (selectedApp?.id === app.id && selectedApp.reviews.length > 0) {
            return; // Avoid re-fetching if already selected and detailed
        }
        setSelectedApp(app); // Show basic info immediately
        setSearchQuery(app.name);
        setIsDetailsLoading(true);
        setAnalysisResult(null);
        setAiTags([]);

        try {
            const detailedApp = await getAppDetails(app.name, app.id);
            setSelectedApp(detailedApp);

        setBubbleApps((prevApps) => {
          // Check if app already exists in wheel
          if (prevApps.some((b) => b.id === detailedApp.id)) {
                    return prevApps;
                }

          // Add new app to the front of the list (most recent)
                const newAppBubble = {
                    id: detailedApp.id,
                    displayName: detailedApp.name.split(/[:–-]/)[0].trim(),
                    searchTerm: detailedApp.name,
                    icon: detailedApp.icon,
            bg: "bg-gray-800",
          };

          // Add to front, keep max 9 apps
          const updatedApps = [newAppBubble, ...prevApps].slice(0, 9);

          // Recalculate angles for all apps
          const appsWithAngles = updatedApps.map((app, i) => ({
            ...app,
            angle: 360 - i * (360 / updatedApps.length),
          }));

          // Save to localStorage
          localStorage.setItem(
            "appscope_recent_apps",
            JSON.stringify(appsWithAngles.map(({ angle, ...app }) => app))
          );

          return appsWithAngles;
        });

        if (detailedApp.reviews.length > 0 && hasLicense) {
          // Only generate tags if user has license
          generateTagsWithAI(detailedApp.name, detailedApp.reviews).then(
            setAiTags
          );
        } else {
          // Clear tags if no license
          setAiTags([]);
            }
        } catch (error) {
            console.error("Error fetching app details:", error);
        alert(
          "Failed to load app details. The app might not be available in the US App Store or there was a network issue."
        );
            setSelectedApp(null);
        } finally {
            setIsDetailsLoading(false);
        }
    },
    [selectedApp?.id]
  );

  // Load tracked apps on mount
  useEffect(() => {
    setTrackedApps(getTrackedApps());
  }, []);

  // ESC key to close modals
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showChatModal) setShowChatModal(false);
        if (showTrackedModal) setShowTrackedModal(false);
        if (showAnalysisModal) setShowAnalysisModal(false);
        if (showKeywordsModal) setShowKeywordsModal(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [showChatModal, showTrackedModal, showAnalysisModal, showKeywordsModal]);

    useEffect(() => {
        if (selectedApp && selectedApp.reviews.length > 0) {
            setAnalysisResult(null); 
            setIsLoadingAnalysis(false);
      setAnalysisComplete(false);
      setShowAnalysisModal(false);
      setActiveTab("premium"); // Reset to User Analysis tab in analysis modal
      // Only generate tags if user has license
      if (hasLicense) {
        generateTagsWithAI(selectedApp.name, selectedApp.reviews).then(
          setAiTags
        );
      } else {
        setAiTags([]);
      }
    }
  }, [selectedApp, hasLicense]);

  const handleLicenseSubmit = async () => {
    if (isSubmittingLicense) return;
    setLicenseError("");
    if (!licenseKey.trim()) {
      setLicenseError("Please enter a license key");
      return;
    }

    setIsSubmittingLicense(true);
    try {
      const result = await validateLicense(licenseKey.trim());
      if (result.valid) {
        saveLicense(licenseKey.trim());
        setHasLicense(true);
        setShowLicenseModal(false);
        setLicenseKey("");
        // Load license details
        const details = await getLicenseDetails();
        setLicenseDetails(details);
      } else {
        setLicenseError(result.message || "Invalid license key");
      }
    } catch (error) {
      setLicenseError("Failed to validate license. Please try again.");
    } finally {
      setIsSubmittingLicense(false);
    }
  };

  const handleManageSubscription = async () => {
    const storedLicense = licenseDetails?.licenseKey || getStoredLicense();
    if (!storedLicense) {
      setLicenseError("No license key found");
      return;
    }

    setIsLoadingPortal(true);
    try {
      const portalUrl = await openCustomerPortal(storedLicense);
      if (portalUrl) {
        window.location.href = portalUrl;
      } else {
        setLicenseError("Failed to open subscription portal");
      }
    } catch (error) {
      setLicenseError("Failed to open subscription portal");
    } finally {
      setIsLoadingPortal(false);
    }
  };

  const handleResendLicense = async () => {
    if (isResendingLicense) return;
    if (!resendEmail.trim()) {
      setResendStatus({ success: false, message: "Please enter your email" });
      return;
    }

    setIsResendingLicense(true);
    setResendStatus(null);
    try {
      const result = await resendLicenseKey(resendEmail.trim());
      setResendStatus(result);
      if (result.success) {
        setResendEmail("");
      }
    } catch (error) {
      setResendStatus({
        success: false,
        message: "Failed to resend license key. Please try again.",
      });
    } finally {
      setIsResendingLicense(false);
    }
  };

  const handleStartCheckout = async () => {
    if (isStartingCheckout) return;
    setLicenseError("");
    setIsStartingCheckout(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/stripe/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          successUrl: `${window.location.origin}/dashboard?success=true`,
          cancelUrl: `${window.location.origin}/dashboard?canceled=true`,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        setLicenseError(
          errorText || "Failed to start checkout. Please try again."
        );
        setIsStartingCheckout(false);
        return;
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setLicenseError("Failed to start checkout. Please try again.");
        setIsStartingCheckout(false);
      }
    } catch (error: any) {
      setLicenseError(
        error?.message || "Failed to start checkout. Please try again."
      );
      setIsStartingCheckout(false);
    }
  };

  const handleCopyLicenseKey = async () => {
    if (!licenseDetails?.licenseKey) return;
    try {
      await navigator.clipboard.writeText(licenseDetails.licenseKey);
      setLicenseCopied(true);
      setTimeout(() => setLicenseCopied(false), 2000);
    } catch (error) {
      setLicenseError("Failed to copy license key. Please copy it manually.");
    }
  };

  const renderSubscriptionModal = () => {
    if (!showLicenseModal) return null;

    return (
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowLicenseModal(false);
          }
        }}
      >
        <div
          className="bg-[#1C1C1E] border border-gray-800 rounded-2xl w-full max-w-xl p-8 relative"
          onClick={(e) => e.stopPropagation()}
          style={{
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
          }}
        >
          <button
            onClick={() => setShowLicenseModal(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {hasLicense && licenseDetails ? (
            <div className="space-y-6">
              <header>
                <p className="text-xs uppercase text-gray-400 tracking-wide">
                  Subscription
                </p>
                <h2 className="text-2xl font-bold text-white mt-1">
                  Access active
                </h2>
                <p className="text-gray-400 mt-2 text-sm">
                  Linked to {resendEmail || "your account"}. Renewal on{" "}
                  {formatDate(licenseDetails.expiresAt)}.
                </p>
              </header>
              <div className="grid gap-3">
                <button
                  onClick={handleManageSubscription}
                  disabled={isLoadingPortal}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  {isLoadingPortal
                    ? "Opening portal..."
                    : "Manage subscription"}
                </button>
                <button
                  onClick={handleResendLicense}
                  disabled={isResendingLicense}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gray-800 text-white font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  {isResendingLicense ? "Sending..." : "Email my license"}
                </button>
                <button
                  onClick={handleCopyLicenseKey}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-gray-700 text-gray-200 font-semibold hover:bg-gray-800 transition-colors"
                >
                  Copy license key
                </button>
                {licenseCopied && (
                  <p className="text-xs text-green-400 text-center">
                    License key copied to clipboard
                  </p>
                )}
                {resendStatus && (
                  <p
                    className={`text-xs text-center ${
                      resendStatus.success ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {resendStatus.message}
                  </p>
                )}
                {licenseError && (
                  <p className="text-sm text-red-400 text-center">
                    {licenseError}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <header>
                <p className="text-xs uppercase text-gray-400 tracking-wide">
                  BetterApp Pro
                </p>
                <h2 className="text-2xl font-bold text-white mt-1">
                  Everything you need to beat competitors
                </h2>
                <p className="text-gray-400 mt-2 text-sm">
                  Unlimited ASO tracking, AI competitor analysis, CSV exports,
                  and tracked apps for a single annual license.
                </p>
              </header>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  • Discover the exact keywords your app already ranks for
                </li>
                <li>
                  • Extract competitor keywords and copy them into your backlog
                </li>
                <li>• Run AI chat & analyses on any app without limits</li>
                <li>• Export reviews, insights, and performance reports</li>
              </ul>
              <button
                onClick={handleStartCheckout}
                disabled={isStartingCheckout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                {isStartingCheckout ? "Redirecting..." : "Start subscription"}
              </button>
              <p className="text-xs text-gray-500 text-center">
                $9/month billed annually. Cancel anytime from the portal.
              </p>
              <div className="border-t border-gray-800 pt-4">
                <button
                  onClick={() => setShowManualLicenseEntry((prev) => !prev)}
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  {showManualLicenseEntry
                    ? "Hide manual entry"
                    : "Already have a license key?"}
                </button>
                {showManualLicenseEntry && (
                  <div className="mt-4 space-y-3">
                    <input
                      type="text"
                      value={licenseKey}
                      onChange={(e) => setLicenseKey(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleLicenseSubmit()
                      }
                      placeholder="Enter your license key..."
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <button
                      onClick={handleLicenseSubmit}
                      disabled={isSubmittingLicense}
                      className="w-full bg-gray-800 text-white font-semibold px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                    >
                      {isSubmittingLicense
                        ? "Validating..."
                        : "Activate license"}
                    </button>
                    <div className="text-xs text-gray-500">
                      <p>
                        Need help? Contact support with your purchase email.
                      </p>
                    </div>
                  </div>
                )}
                {licenseError && (
                  <p className="text-sm text-red-400 mt-3">{licenseError}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

    const handleAnalyze = useCallback(async () => {
    if (!hasLicense) {
      setShowLicenseModal(true);
      return;
    }
        if (!selectedApp || selectedApp.reviews.length === 0) return;

        setIsLoadingAnalysis(true);
        setAnalysisResult(null);
    setAnalysisComplete(false);
    try {
      const result = await analyzeReviewsWithAI(
        selectedApp.name,
        selectedApp.reviews
      );

      // Also fetch competitive intelligence with full app metadata
      try {
        const competitiveIntel = await analyzeCompetitiveIntelligence(
          selectedApp.name,
          selectedApp.reviews,
          {
            screenshots: selectedApp.screenshots,
            description: selectedApp.description,
            price: selectedApp.price,
            formattedPrice: selectedApp.formattedPrice,
            primaryGenreName: selectedApp.primaryGenreName,
          }
        );
        result.competitiveIntelligence = competitiveIntel;
      } catch (ciError) {
        console.warn("Failed to fetch competitive intelligence:", ciError);
        // Continue without it - not critical
      }

            setAnalysisResult(result);
      setAnalysisComplete(true);

      // Save analysis to history
      saveAnalysis(selectedApp, result, aiTags);
        } catch (error) {
            console.error(error);
            alert((error as Error).message);
        } finally {
            setIsLoadingAnalysis(false);
        }
  }, [selectedApp, aiTags]);
    
    const copyToClipboard = () => {
        if (!analysisResult || !selectedApp) return;
        const textToCopy = `
AI Analysis for ${selectedApp.name}

## Summary
${analysisResult.summary}

## Common Complaints
- ${analysisResult.commonComplaints.join("\n- ")}

## Feature Requests
- ${analysisResult.featureRequests.join("\n- ")}

## Monetization Insights
${analysisResult.monetization}

## Market Opportunities
${analysisResult.marketOpportunities}
        `;
        navigator.clipboard.writeText(textToCopy.trim());
    setCopySuccess("Copied!");
    setTimeout(() => setCopySuccess(""), 2000);
    };

  if (view === "search") {
        const tabs = [
      {
        id: "tracked",
        label: "Tracked Apps",
        icon: <ChartBarIcon className="w-5 h-5 text-blue-500" />,
      },
      {
        id: "keywords",
        label: "Keywords",
        icon: (
          <svg
            className="w-5 h-5 text-purple-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
        ),
      },
        ];
        
        return (
      <div className="min-h-screen bg-[#111213] flex flex-col font-sans p-4 sm:p-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                     <div className="flex items-center space-x-3">
            <Logo size={32} className="rounded-lg" />
            <span className="font-semibold text-lg sm:text-xl tracking-tight text-white">
              BetterApp
            </span>
                    </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = "/";
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              title="Sign out"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sign Out
            </button>
            {hasLicense && licenseDetails ? (
              <div className="flex items-center gap-3 bg-[#1C1C1E] border border-gray-800 rounded-xl px-4 py-2">
                <div>
                  <p className="text-xs uppercase text-gray-500 tracking-wide">
                    Premium access
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {licenseDetails.plan
                      ? licenseDetails.plan.toUpperCase()
                      : "Yearly"}{" "}
                    · renews {formatDate(licenseDetails.expiresAt)}
                  </p>
                </div>
                <button
                  onClick={handleManageSubscription}
                  className="text-sm font-semibold px-3 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors disabled:opacity-50"
                  disabled={isLoadingPortal}
                >
                  {isLoadingPortal ? "Opening..." : "Manage"}
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setShowLicenseModal(true);
                  setShowManualLicenseEntry(false);
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg shadow-lg hover:from-orange-700 hover:to-orange-800 transition-all"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Upgrade to Pro
              </button>
            )}
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                onClick={() => {
                  if (tab.id === "tracked") {
                    setShowTrackedModal(true);
                    setShowLicenseModal(false);
                  } else if (tab.id === "keywords") {
                    if (!hasLicense) {
                      setShowLicenseModal(true);
                    } else {
                      setView("keywords");
                    }
                    setShowTrackedModal(false);
                  }
                }}
                className={`flex items-center gap-2 sm:gap-2.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full font-medium transition-all duration-200 text-sm sm:text-base ${
                  (tab.id === "license" && showLicenseModal) ||
                  (tab.id === "tracked" && showTrackedModal) ||
                  (tab.id === "keywords" && (view as string) === "keywords")
                                    ? "bg-gray-200 text-gray-900"
                                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                }`}
                            >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </header>

        {/* Tracked Apps Modal - Peter AI Style */}
        {showTrackedModal && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowTrackedModal(false);
                setSelectedTrackedApp(null);
              }
            }}
          >
            <div
              className="bg-[#0F0F0F] border border-gray-900 rounded-2xl w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
              style={{
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.9)",
              }}
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-900 flex-shrink-0 bg-[#0F0F0F]">
                <h2 className="text-2xl font-bold text-white">Tracked Apps</h2>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <ClockIcon className="w-4 h-4" />
                    <span>Next refresh in 1h 50m</span>
                  </div>
                  <button
                    onClick={() => {
                      setShowTrackedModal(false);
                      setSelectedTrackedApp(null);
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content - Sidebar + Main */}
              <div className="flex-1 overflow-hidden flex">
                {/* Left Sidebar */}
                <div className="w-80 border-r border-gray-900 bg-[#111213] flex flex-col">
                  <div className="p-4 border-b border-gray-900">
                    <label className="text-sm text-gray-400 mb-2 block">
                      Store:
                    </label>
                    <select
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      className="w-full bg-[#0F0F0F] border border-gray-800 text-white rounded-lg px-3 py-2 text-sm"
                    >
                      {APP_STORE_COUNTRIES.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.flag} {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {trackedApps.length === 0 ? (
                      <div className="text-center py-8 px-4">
                        <p className="text-gray-500 text-sm">
                          No tracked apps yet
                        </p>
                      </div>
                    ) : (
                      <div className="p-2">
                        {trackedApps.map((tracked) => (
                          <div
                            key={tracked.id}
                            className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                              selectedTrackedApp?.id === tracked.id
                                ? "bg-green-600/20 border border-green-500/50"
                                : "bg-[#0F0F0F] hover:bg-[#1C1C1E] border border-transparent"
                            }`}
                            onClick={() => setSelectedTrackedApp(tracked)}
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={tracked.app.icon}
                                alt={tracked.app.name}
                                className="w-12 h-12 rounded-xl"
                              />
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-white text-sm truncate">
                                  {tracked.app.name}
                                </h3>
                                <p className="text-xs text-gray-400 truncate">
                                  {tracked.app.developer}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto bg-[#0F0F0F]">
                  {!selectedTrackedApp ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="w-32 h-32 mb-6 flex items-center justify-center">
                        <svg
                          className="w-full h-full text-gray-800"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        Select an App
                      </h3>
                      <p className="text-gray-400 text-center max-w-md">
                        Choose a tracked app from the sidebar to view its
                        performance charts.
                      </p>
                    </div>
                  ) : (
                    <div
                      className={`p-6 relative ${
                        !hasLicense ? "blur-sm pointer-events-none" : ""
                      }`}
                    >
                      {!hasLicense && (
                        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm rounded-xl">
                          <div className="bg-[#111213] border border-orange-500/50 rounded-xl p-6 max-w-md text-center">
                            <svg
                              className="w-12 h-12 text-orange-400 mx-auto mb-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <h3 className="text-xl font-bold text-white mb-2">
                              Unlock BetterApp Pro
                            </h3>
                            <p className="text-gray-400 mb-4">
                              Analyze trends, monitor ASO performance, and
                              export competitor insights once you subscribe.
                            </p>
                            <button
                              onClick={() => {
                                setShowTrackedModal(false);
                                setShowManualLicenseEntry(false);
                                setShowLicenseModal(true);
                              }}
                              className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                            >
                              See Plans
                            </button>
                          </div>
                        </div>
                      )}
                      {/* App Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <img
                            src={selectedTrackedApp.app.icon}
                            alt={selectedTrackedApp.app.name}
                            className="w-16 h-16 rounded-xl"
                          />
                          <div>
                            <h2 className="text-2xl font-bold text-white">
                              {selectedTrackedApp.app.name}
                            </h2>
                            <p className="text-gray-400">
                              {selectedTrackedApp.app.developer}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Tracking since{" "}
                              {new Date(
                                selectedTrackedApp.trackedSince
                              ).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              handleSearch(selectedTrackedApp.app.name);
                              setView("analysis");
                              setShowTrackedModal(false);
                            }}
                            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 text-sm font-medium"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            View Details
                          </button>
                        </div>
                      </div>

                      {/* Performance Charts */}
                      {selectedTrackedApp.snapshots.length > 0 ? (
                        <div className="space-y-6">
                          {/* Rating Trend */}
                          <div className="bg-[#111213] border border-gray-900 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">
                              Rating Trend
                            </h3>
                            {selectedTrackedApp.snapshots.length === 0 ? (
                              <div className="h-48 flex items-center justify-center text-gray-500">
                                <p className="text-sm">
                                  No data yet. Tracking will begin
                                  automatically.
                                </p>
                              </div>
                            ) : (
                              <div className="h-48 flex items-end gap-2">
                                {selectedTrackedApp.snapshots
                                  .slice(-10)
                                  .map((snapshot, idx) => {
                                    const rating = parseFloat(
                                      snapshot.rating.toString()
                                    );
                                    const height = (rating / 5) * 100;
                                    return (
                                      <div
                                        key={idx}
                                        className="flex-1 flex flex-col items-center group"
                                      >
                                        <div
                                          className="w-full bg-gray-800 rounded-t flex items-end relative"
                                          style={{ height: "100%" }}
                                        >
                                          <div
                                            className="w-full bg-gradient-to-t from-orange-600 to-orange-400 rounded-t transition-all hover:from-orange-500 hover:to-orange-300 cursor-pointer"
                                            style={{ height: `${height}%` }}
                                            title={`${rating.toFixed(2)} ⭐`}
                                          />
                                        </div>
                                        <span className="text-xs text-gray-500 mt-2">
                                          {new Date(
                                            snapshot.date
                                          ).toLocaleDateString("en-GB", {
                                            day: "numeric",
                                            month: "short",
                                          })}
                                        </span>
                                      </div>
                                    );
                                  })}
                              </div>
                            )}
                            <div className="mt-4 flex items-center justify-between">
                              <span className="text-sm text-gray-400">
                                Current: {selectedTrackedApp.app.rating} ⭐
                              </span>
                              {selectedTrackedApp.snapshots.length > 1 && (
                                <span
                                  className={`text-sm font-medium ${
                                    parseFloat(
                                      selectedTrackedApp.app.rating.toString()
                                    ) >
                                    parseFloat(
                                      selectedTrackedApp.snapshots[0].rating.toString()
                                    )
                                      ? "text-green-400"
                                      : "text-red-400"
                                  }`}
                                >
                                  {parseFloat(
                                    selectedTrackedApp.app.rating.toString()
                                  ) >
                                  parseFloat(
                                    selectedTrackedApp.snapshots[0].rating.toString()
                                  )
                                    ? "↑"
                                    : "↓"}
                                  {Math.abs(
                                    parseFloat(
                                      selectedTrackedApp.app.rating.toString()
                                    ) -
                                      parseFloat(
                                        selectedTrackedApp.snapshots[0].rating.toString()
                                      )
                                  ).toFixed(1)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Version History */}
                          {selectedTrackedApp.snapshots.some(
                            (s) => s.version
                          ) && (
                            <div className="bg-[#111213] border border-gray-900 rounded-xl p-6">
                              <h3 className="text-lg font-semibold text-white mb-4">
                                Version History
                              </h3>
                              <div className="space-y-2">
                                {selectedTrackedApp.snapshots
                                  .filter((s) => s.version)
                                  .slice(-5)
                                  .reverse()
                                  .map((snapshot, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between p-3 bg-[#0F0F0F] rounded-lg border border-gray-900"
                                    >
                                      <div>
                                        <p className="text-white font-medium">
                                          v{snapshot.version}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                          {new Date(
                                            snapshot.date
                                          ).toLocaleDateString("en-GB", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                          })}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-sm text-gray-300">
                                          {snapshot.rating} ⭐
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {snapshot.reviewsCount} reviews
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}

                          {/* Update Frequency */}
                          {selectedTrackedApp.snapshots.length > 1 && (
                            <div className="bg-[#111213] border border-gray-900 rounded-xl p-6">
                              <h3 className="text-lg font-semibold text-white mb-4">
                                Update Frequency
                              </h3>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-400">
                                    Total Updates Tracked
                                  </span>
                                  <span className="text-white font-semibold">
                                    {selectedTrackedApp.snapshots.length}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-400">
                                    Days Since First Track
                                  </span>
                                  <span className="text-white font-semibold">
                                    {Math.floor(
                                      (new Date().getTime() -
                                        new Date(
                                          selectedTrackedApp.trackedSince
                                        ).getTime()) /
                                        (1000 * 60 * 60 * 24)
                                    )}{" "}
                                    days
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-400">
                                    Last Checked
                                  </span>
                                  <span className="text-white font-semibold">
                                    {new Date(
                                      selectedTrackedApp.lastChecked
                                    ).toLocaleDateString("en-GB", {
                                      day: "numeric",
                                      month: "short",
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Reviews Count Trend */}
                          <div className="bg-[#111213] border border-gray-900 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">
                              Reviews Count
                            </h3>
                            {selectedTrackedApp.snapshots.length === 0 ? (
                              <div className="h-48 flex items-center justify-center text-gray-500">
                                <p className="text-sm">
                                  No data yet. Tracking will begin
                                  automatically.
                                </p>
                              </div>
                            ) : (
                              <div className="h-48 flex items-end gap-2">
                                {selectedTrackedApp.snapshots
                                  .slice(-10)
                                  .map((snapshot, idx) => {
                                    const reviews =
                                      parseInt(
                                        snapshot.reviewsCount.replace(/,/g, "")
                                      ) || 0;
                                    const maxReviews = Math.max(
                                      ...selectedTrackedApp.snapshots.map(
                                        (s) =>
                                          parseInt(
                                            s.reviewsCount.replace(/,/g, "")
                                          ) || 0
                                      )
                                    );
                                    const height =
                                      maxReviews > 0
                                        ? (reviews / maxReviews) * 100
                                        : 0;
                                    return (
                                      <div
                                        key={idx}
                                        className="flex-1 flex flex-col items-center group"
                                      >
                                        <div
                                          className="w-full bg-gray-800 rounded-t flex items-end relative"
                                          style={{ height: "100%" }}
                                        >
                                          <div
                                            className="w-full bg-gradient-to-t from-orange-600 to-orange-400 rounded-t transition-all hover:from-orange-500 hover:to-orange-300 cursor-pointer"
                                            style={{ height: `${height}%` }}
                                            title={`${reviews.toLocaleString()} reviews`}
                                          />
                                        </div>
                                        <span className="text-xs text-gray-500 mt-2">
                                          {new Date(
                                            snapshot.date
                                          ).toLocaleDateString("en-GB", {
                                            day: "numeric",
                                            month: "short",
                                          })}
                                        </span>
                                      </div>
                                    );
                                  })}
                              </div>
                            )}
                            <div className="mt-4 flex items-center justify-between">
                              <span className="text-sm text-gray-400">
                                Current: {selectedTrackedApp.app.reviewsCount}{" "}
                                reviews
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-[#111213] border border-gray-900 rounded-xl p-12 text-center">
                          <p className="text-gray-400">
                            No performance data yet. Data will be collected over
                            time.
                          </p>
                        </div>
                      )}

                      {/* Premium Upgrade CTA */}
                      {!hasLicense && (
                        <div className="mt-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-center">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <svg
                              className="w-6 h-6 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <h3 className="text-xl font-bold text-white">
                              Upgrade to Premium
                            </h3>
                          </div>
                          <p className="text-blue-100 mb-4">
                            Unlock advanced tracking features, keyword position
                            monitoring, and detailed analytics
                          </p>
                          <button
                            onClick={() => {
                              setShowTrackedModal(false);
                              setShowLicenseModal(true);
                            }}
                            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                          >
                            Get Premium
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {!showTrackedModal && !showLicenseModal && view === "search" && (
                <div className="flex-grow flex flex-col items-center justify-center">
            <main className="relative w-full h-64 sm:h-96 my-8 sm:my-12 flex items-center justify-center">
              {isLoadingBubbles ? (
                <div className="flex items-center justify-center">
                  <div className="text-center text-gray-400 space-y-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                    <p>Loading apps...</p>
                  </div>
                </div>
              ) : (
                <div
                  className="w-64 h-64 sm:w-96 sm:h-96 relative"
                  style={{ animation: "rotate-wheel 60s linear infinite" }}
                >
                            {bubbleApps.map((app, index) => {
                                const radius = 140;
                                const radians = (app.angle * Math.PI) / 180;
                                const x = Math.cos(radians) * radius;
                                const y = Math.sin(radians) * radius;
                                const floatClass = `float-${(index % 7) + 1}`;

                                return (
                                    <div // Positioning wrapper
                        key={`${app.id}-${index}`}
                                        className="absolute top-1/2 left-1/2"
                                        style={{ transform: `translate(${x}px, ${y}px)` }}
                                    >
                                        <div // Centering wrapper
                                            className="w-20 h-20 -translate-x-1/2 -translate-y-1/2"
                                        >
                                            <div // Animation wrapper + Click Handler
                                                className={`w-full h-full group cursor-pointer ${floatClass}`}
                                                onClick={() => handleSearch(app.searchTerm)}
                                            >
                                                <div
                              className={`w-full h-full rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 border border-gray-800 overflow-hidden ${
                                app.icon ? "" : app.bg || "bg-gray-800"
                              }`}
                                                >
                                                    {app.icon ? (
                                <img
                                  src={app.icon}
                                  alt={`${app.displayName} logo`}
                                  className="w-full h-full rounded-full object-cover"
                                  loading="eager"
                                  onError={(e) => {
                                    // Fallback to colored background with initial letter
                                    const img = e.target as HTMLImageElement;
                                    img.style.display = "none";
                                    const parent = img.parentElement;
                                    if (
                                      parent &&
                                      !parent.querySelector(".fallback-initial")
                                    ) {
                                      const fallback =
                                        document.createElement("div");
                                      fallback.className = `w-full h-full rounded-full flex items-center justify-center text-white font-bold text-xl fallback-initial ${
                                        app.bg || "bg-gray-800"
                                      }`;
                                      fallback.textContent = app.displayName
                                        .charAt(0)
                                        .toUpperCase();
                                      parent.appendChild(fallback);
                                    }
                                  }}
                                />
                              ) : (
                                <div
                                  className={`w-full h-full rounded-full flex items-center justify-center text-white font-bold text-xl ${
                                    app.bg || "bg-gray-800"
                                  }`}
                                >
                                  {app.displayName.charAt(0).toUpperCase()}
                                </div>
                                                    )}
                                                </div>
                                                </div>
                                            </div>
                                        </div>
                    );
                            })}
                        </div>
              )}
                    </main>

            <footer className="flex flex-col items-center gap-4 w-full max-w-2xl mx-auto px-4">
                        <div className="w-full relative">
                <SearchIcon className="absolute left-3 sm:left-5 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 sm:w-5 sm:h-5" />
                            <input
                                type="text"
                                placeholder="Search by app name, developer, App Store URL, or App ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleSearch(searchQuery)
                  }
                  className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-full border border-gray-700 bg-gray-900 text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
              <p className="text-gray-500 text-xs sm:text-sm text-center">
                Search for any app on the App Store to analyze user reviews
              </p>
                    </footer>
                </div>
        )}

        {renderSubscriptionModal()}
            </div>
        );
    }
    
  // Keywords View
  if (view === "keywords") {
    const appsWithKeywords = [...trackedApps.map((t) => t.app)].filter(
      (app, index, self) => index === self.findIndex((a) => a.id === app.id)
    );

    return (
      <div className="flex flex-col md:flex-row h-screen bg-[#111213]">
        {/* Left Sidebar - Apps List */}
        <aside className="w-full md:w-80 bg-[#111213] border-r border-gray-800 flex flex-col shrink-0 max-h-[40vh] md:max-h-none">
          <div className="p-4 border-b border-gray-800 bg-[#111213]">
            <button
              onClick={() => setView("search")}
              className="flex items-center space-x-2 text-sm font-medium text-gray-400 hover:text-white"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Back to Search</span>
            </button>
                 </div>
          <div className="p-4 border-b border-gray-800 bg-[#111213]">
            <h2 className="text-lg font-semibold text-white">Apps</h2>
          </div>
          <div className="flex-1 overflow-y-auto bg-[#111213]">
            <ul className="space-y-2 px-4 pb-4">
              {appsWithKeywords.length === 0 ? (
                <li className="text-center text-gray-500 p-4 text-sm">
                  No apps yet. Track apps or analyze them to see keywords.
                </li>
              ) : (
                appsWithKeywords.map((app) => {
                  const appKeywords = getKeywordsForApp(app.id);
                  return (
                    <li
                      key={app.id}
                      onClick={async () => {
                        // Load app details if not already loaded
                        if (!selectedApp || selectedApp.id !== app.id) {
                          try {
                            setIsDetailsLoading(true);
                            const details = await getAppDetails("", app.id);
                            setSelectedApp(details);
                            setView("keywords");
                          } catch (error) {
                            console.error("Error loading app:", error);
                          } finally {
                            setIsDetailsLoading(false);
                          }
                        }
                      }}
                      className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                        selectedApp?.id === app.id
                          ? "bg-orange-600/20 border border-orange-500/50"
                          : "bg-[#1C1C1E] hover:bg-[#1C1C1E]/80 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={app.icon}
                          alt={app.name}
                          className="w-10 h-10 rounded-xl"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm truncate">
                            {app.name}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {appKeywords.length} keywords
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeTrackedApp(app.id);
                            // Also remove from analysis history if it's there
                            const history = getAnalysisHistory();
                            const filteredHistory = history.filter(
                              (h) => h.appId !== app.id
                            );
                            localStorage.setItem(
                              "appscope_analysis_history",
                              JSON.stringify(filteredHistory)
                            );
                            // Refresh state to update the UI
                            setTrackedApps(getTrackedApps());
                            // If we removed the selected app, clear selection
                            if (selectedApp?.id === app.id) {
                              setSelectedApp(null);
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-400 p-1"
                          title="Remove app"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
          {/* Add App Button at Bottom */}
          <div className="p-4 border-t border-gray-800 bg-[#111213]">
            <button
              onClick={() => setShowAddAppModal(true)}
              className="w-full px-4 py-2.5 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add App
            </button>
          </div>
        </aside>

        {/* Main Content - Keywords Table */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {selectedApp ? (
            <KeywordsView
              selectedApp={selectedApp}
              aiTags={aiTags}
              selectedCountry={selectedCountry}
              onShowAddAppModal={() => setShowAddAppModal(true)}
              onShowKeywordSearchModal={() => setShowKeywordSearchModal(true)}
            />
          ) : (
            <KeywordsView
              selectedApp={null}
              aiTags={[]}
              selectedCountry={selectedCountry}
              onShowAddAppModal={() => setShowAddAppModal(true)}
              onShowKeywordSearchModal={() => setShowKeywordSearchModal(true)}
            />
          )}
        </main>

        {/* Add App Modal */}
        {showAddAppModal && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowAddAppModal(false);
              }
            }}
          >
            <AddAppModal
              onClose={() => setShowAddAppModal(false)}
              onSelectApp={async (app) => {
                try {
                  setIsDetailsLoading(true);
                  const details = await getAppDetails("", app.id);
                  setSelectedApp(details);
                  setView("keywords");
                  setShowAddAppModal(false);
                  // Add to tracked apps if not already
                  if (!trackedApps.some((t) => t.id === app.id)) {
                    addTrackedApp(details);
                    setTrackedApps(getTrackedApps());
                  }
                } catch (error) {
                  console.error("Error loading app:", error);
                } finally {
                  setIsDetailsLoading(false);
                }
              }}
              selectedCountry={selectedCountry}
            />
          </div>
        )}

        {/* Keyword Search Modal */}
        {showKeywordSearchModal && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowKeywordSearchModal(false);
              }
            }}
          >
            <KeywordSearchModal
              onClose={() => setShowKeywordSearchModal(false)}
              onAddKeywords={(keywords) => {
                keywords.forEach((keyword, idx) => {
                  if (selectedApp) {
                    const storedKeyword: StoredKeyword = {
                      id: `${selectedApp.id}_${keyword}_${Date.now()}_${idx}`,
                      appId: selectedApp.id,
                      keyword: keyword.trim(),
                      source: "manual",
                      createdAt: new Date().toISOString(),
                    };
                    addKeyword(storedKeyword);
                  }
                });
                setShowKeywordSearchModal(false);
                // Keywords will refresh automatically via the interval in KeywordsView
              }}
            />
          </div>
        )}

        {/* License Modal - Accessible from keywords view */}
        {renderSubscriptionModal()}
      </div>
    );
  }

  // Analysis View
  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#111213]">
      <aside className="w-full md:w-96 bg-[#1C1C1E] border-r border-gray-800 flex flex-col shrink-0 max-h-[40vh] md:max-h-none">
                 <div className="p-4 border-b border-gray-800">
          <button
            onClick={handleSearchView}
            className="flex items-center space-x-2 text-sm font-medium text-gray-400 hover:text-white"
          >
                        <ArrowLeftIcon className="w-4 h-4" />
                        <span>New Search</span>
                    </button>
                </div>
        <div className="p-4 border-b border-gray-800 space-y-3">
          <div className="relative">
            <label className="text-xs text-gray-400 mb-1.5 block">
              App Store:
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm"
            >
              {APP_STORE_COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.name}
                </option>
              ))}
            </select>
          </div>
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch(searchQuery);
                }
              }}
              placeholder="Search by app name, developer, App Store URL, or App ID..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 text-white rounded-lg focus:ring-orange-500 focus:border-orange-500"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
          {isSearching ? (
            <LoadingPlaceholder text="Searching..." />
          ) : (
            <ul className="space-y-2 px-4 pb-4">
              {searchResults.length === 0 && (
                <p className="text-center text-gray-500 p-4 text-sm">
                  No apps found.
                </p>
              )}
              {searchResults.map((app) => {
                const isTracked = trackedApps.some((t) => t.id === app.id);
                return (
                                <AppListItem
                                    key={app.id}
                                    app={app}
                                    isSelected={selectedApp?.id === app.id}
                                    onSelect={() => handleSelectApp(app)}
                    onTrack={(app) => {
                      if (isTracked) {
                        removeTrackedApp(app.id);
                      } else {
                        addTrackedApp(app);
                      }
                      setTrackedApps(getTrackedApps());
                    }}
                    isTracked={isTracked}
                  />
                );
              })}
                        </ul>
          )}
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto">
        {isDetailsLoading ? (
          <LoadingPlaceholder text="Loading app details..." />
        ) : selectedApp ? (
          <>
            {/* When analyzing, replace entire main content with loading state */}
            {isLoadingAnalysis ? (
              <div className="flex flex-col items-center justify-center h-full py-20">
                <div className="mb-4 animate-pulse">
                  <Logo size={80} className="rounded-lg" />
                </div>
                <p className="text-gray-400 text-lg animate-pulse">
                  Loading reviews...
                </p>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 p-4 sm:p-8">
                        <AppDetailHeader app={selectedApp} />
                        <Screenshots urls={selectedApp.screenshots} />

                {/* Analysis Complete Banner - Show under screenshots */}
                {analysisComplete && analysisResult && !showAnalysisModal && (
                  <div
                    className="bg-orange-600/20 border border-orange-500/50 rounded-xl p-6 cursor-pointer hover:bg-orange-600/30 transition-colors backdrop-blur-sm"
                    onClick={() => setShowAnalysisModal(true)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                          <div>
                          <p className="text-white font-semibold text-lg">
                            Analysis Complete!
                          </p>
                          <p className="text-orange-100 text-sm">
                            Tap to view detailed insights from our reviews
                          </p>
                        </div>
                      </div>
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                )}

                {selectedApp.downloads !== "N/A" && (
                  <div>
                    <h2 className="text-lg font-semibold mb-3 text-white">
                      App Performance
                    </h2>
                              <div className="flex space-x-6">
                      <PerformanceCard
                        icon={
                          <DownloadIcon className="w-6 h-6 text-green-400" />
                        }
                        label="DOWNLOADS"
                        value={selectedApp.downloads}
                        color="bg-green-500/10"
                      />
                      <PerformanceCard
                        icon={
                          <RevenueIcon className="w-6 h-6 text-indigo-400" />
                        }
                        label="REVENUE"
                        value={selectedApp.revenue}
                        color="bg-indigo-500/10"
                      />
                              </div>
                          </div>
                        )}

                {(aiTags.length > 0 || !hasLicense) && (
                  <AITags tags={aiTags} hasAccess={hasLicense} />
                )}
                        
                        <div>
                            <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-semibold text-white">
                      Reviews ({selectedApp.reviews.length})
                      <span className="text-sm text-gray-500 font-normal ml-2">
                        ⓘ
                      </span>
                    </h2>
                                {selectedApp.reviews.length > 0 && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (!hasLicense) {
                              setShowLicenseModal(true);
                            } else {
                              setShowChatModal(true);
                            }
                          }}
                          className="flex items-center space-x-2 bg-orange-600/20 border border-orange-500/50 text-orange-400 font-medium px-3 py-1.5 rounded-lg hover:bg-orange-600/30 transition-colors text-sm"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                          <span>Chat</span>
                        </button>
                                <button
                                    onClick={handleAnalyze}
                                    disabled={isLoadingAnalysis}
                          className="flex items-center space-x-2 bg-orange-600/20 border border-orange-500/50 text-orange-400 font-medium px-3 py-1.5 rounded-lg hover:bg-orange-600/30 disabled:bg-orange-900/20 disabled:border-orange-900/50 disabled:text-orange-600 transition-colors text-sm"
                        >
                          <WandIcon className="w-4 h-4" />
                          <span>
                            {isLoadingAnalysis
                              ? "Analyzing..."
                              : "Analyze reviews with AI"}
                          </span>
                                </button>
                        <button
                          onClick={() => {
                            if (!hasLicense) {
                              setShowLicenseModal(true);
                            } else if (
                              selectedApp &&
                              analysisResult &&
                              aiTags.length > 0
                            ) {
                              // Export analysis if available
                              exportAnalysisToCSV(
                                selectedApp,
                                analysisResult,
                                aiTags
                              );
                            } else if (selectedApp) {
                              // Otherwise export reviews
                              exportReviewsToCSV(
                                selectedApp,
                                selectedApp.reviews
                              );
                            }
                          }}
                          disabled={!hasLicense}
                          className={`flex items-center space-x-2 font-medium px-3 py-1.5 rounded-lg transition-colors text-sm ${
                            hasLicense
                              ? "bg-orange-600/20 border border-orange-500/50 text-orange-400 hover:bg-orange-600/30"
                              : "bg-gray-700/20 border border-gray-600/50 text-gray-500 cursor-not-allowed"
                          }`}
                          title={
                            !hasLicense
                              ? "Premium feature - Upgrade to export"
                              : analysisResult
                              ? "Export analysis to CSV"
                              : "Export reviews to CSV"
                          }
                        >
                          <DownloadIcon className="w-4 h-4" />
                          <span>CSV Export</span>
                        </button>
                      </div>
                                )}
                            </div>
                            
                            <div className="mt-6">
                    {selectedApp.reviews
                      .filter((review) => {
                        if (
                          reviewFilter.rating &&
                          review.rating !== reviewFilter.rating
                        )
                          return false;
                        if (reviewFilter.search) {
                          const searchLower = reviewFilter.search.toLowerCase();
                          return (
                            review.content
                              .toLowerCase()
                              .includes(searchLower) ||
                            review.title.toLowerCase().includes(searchLower) ||
                            review.author.toLowerCase().includes(searchLower)
                          );
                        }
                        return true;
                      })
                      .map((review) => (
                                    <ReviewCard key={review.id} review={review} />
                                ))}
                    {selectedApp.reviews.filter((review) => {
                      if (
                        reviewFilter.rating &&
                        review.rating !== reviewFilter.rating
                      )
                        return false;
                      if (reviewFilter.search) {
                        const searchLower = reviewFilter.search.toLowerCase();
                        return (
                          review.content.toLowerCase().includes(searchLower) ||
                          review.title.toLowerCase().includes(searchLower) ||
                          review.author.toLowerCase().includes(searchLower)
                        );
                      }
                      return true;
                    }).length === 0 && (
                      <p className="text-center text-gray-500 py-8">
                        No reviews match your filters
                      </p>
                    )}
                            </div>
                        </div>
              </div>
            )}

            {/* License Modal - Peter AI Style */}
            {showLicenseModal && (
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setShowLicenseModal(false);
                  }
                }}
              >
                <div
                  className="bg-[#1C1C1E] border border-gray-800 rounded-2xl w-full max-w-md p-8"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
                  }}
                >
                  <button
                    onClick={() => setShowLicenseModal(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>

                  {/* Large Key Icon */}
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                        />
                      </svg>
                    </div>
                  </div>

                  {hasLicense && licenseDetails ? (
                    <>
                      <h2 className="text-2xl font-bold text-white text-center mb-2">
                        Subscription Active
                      </h2>
                      <p className="text-gray-400 text-center mb-6">
                        Your BetterApp Premium subscription
                      </p>

                      {/* Subscription Status */}
                      <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-800">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-400 text-sm">Plan</span>
                          <span className="text-white font-semibold capitalize">
                            {licenseDetails.plan || "Yearly"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-400 text-sm">Status</span>
                          <span
                            className={`font-semibold ${
                              licenseDetails.status === "active"
                                ? "text-green-400"
                                : "text-yellow-400"
                            }`}
                          >
                            {licenseDetails.status === "active"
                              ? "Active"
                              : licenseDetails.status || "Active"}
                          </span>
                        </div>
                        {licenseDetails.expiresAt && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">
                              Expires
                            </span>
                            <span className="text-white text-sm">
                              {new Date(
                                licenseDetails.expiresAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Manage Subscription Button */}
                      <button
                        onClick={handleManageSubscription}
                        disabled={isLoadingPortal}
                        className="w-full bg-orange-600 text-white font-semibold px-4 py-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 mb-3 disabled:opacity-50"
                      >
                        {isLoadingPortal ? (
                          <>
                            <svg
                              className="animate-spin h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Loading...
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            Manage Subscription
                          </>
                        )}
                      </button>

                      {/* Resend License Key */}
                      <div className="border-t border-gray-800 pt-4">
                        <p className="text-gray-400 text-sm mb-3 text-center">
                          Lost your license key?
                        </p>
                        <div className="mb-3">
                          <input
                            type="email"
                            value={resendEmail}
                            onChange={(e) => setResendEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                          />
                        </div>
                        <button
                          onClick={handleResendLicense}
                          disabled={isResendingLicense}
                          className="w-full bg-transparent border border-gray-700 text-gray-300 font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isResendingLicense ? (
                            <>
                              <svg
                                className="animate-spin h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                              Sending...
                            </>
                          ) : (
                            "Resend License Key"
                          )}
                        </button>
                        {resendStatus && (
                          <p
                            className={`text-sm mt-2 text-center ${
                              resendStatus.success
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {resendStatus.message}
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold text-white text-center mb-2">
                        Activate Premium
                      </h2>
                      <p className="text-gray-400 text-center mb-6">
                        Get the best from BetterApp
                      </p>

                      <div className="mb-4">
                        <label className="text-sm text-gray-400 mb-2 block">
                          License Key
                        </label>
                        <input
                          type="text"
                          value={licenseKey}
                          onChange={(e) => setLicenseKey(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleLicenseSubmit()
                          }
                          placeholder="Enter your license key..."
                          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        {licenseError && (
                          <p className="text-red-400 text-sm mt-2">
                            {licenseError}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-3 mb-6">
                        <button
                          onClick={handleLicenseSubmit}
                          disabled={isSubmittingLicense}
                          className="flex-1 bg-orange-600 text-white font-semibold px-4 py-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmittingLicense ? (
                            <>
                              <svg
                                className="animate-spin h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                              Activating...
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                                />
                              </svg>
                              Activate License
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setShowLicenseModal(false);
                            // Navigate to pricing page - use window.location to maintain session
                            window.location.href = "/#pricing";
                          }}
                          className="flex-1 bg-transparent border-2 border-orange-500 text-orange-400 font-semibold px-4 py-3 rounded-lg hover:bg-orange-500/10 transition-colors flex items-center justify-center gap-2"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          View Plans
                        </button>
                      </div>

                      {/* Premium Features */}
                      <div className="border-t border-gray-800 pt-6">
                        <h3 className="text-sm font-semibold text-white mb-3">
                          Premium Features
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 text-sm text-gray-300">
                            <svg
                              className="w-5 h-5 text-orange-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                              />
                            </svg>
                            AI Review Analysis
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-300">
                            <svg
                              className="w-5 h-5 text-orange-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            CSV Export
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-300">
                            <svg
                              className="w-5 h-5 text-orange-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Competitive Intelligence and ASO
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-300">
                            <svg
                              className="w-5 h-5 text-orange-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                              />
                            </svg>
                            Unlimited Usage
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Chat Modal */}
            <ChatModal
              app={selectedApp}
              isOpen={showChatModal}
              onClose={() => setShowChatModal(false)}
            />

            {/* Analysis Modal - Third Screenshot */}
            {showAnalysisModal && analysisResult && selectedApp && (
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setShowAnalysisModal(false);
                  }
                }}
              >
                <div
                  className="bg-[#1C1C1E] border border-gray-800 rounded-2xl w-full max-w-6xl max-h-[85vh] flex flex-col"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
                  }}
                >
                  {/* Header */}
                  <div className="flex-shrink-0 bg-[#1C1C1E] border-b border-gray-800 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src={selectedApp.icon}
                        alt={selectedApp.name}
                        className="w-12 h-12 rounded-xl"
                      />
                      <div>
                        <h2 className="text-xl font-semibold text-white">
                          {selectedApp.name}
                        </h2>
                        <p className="text-sm text-gray-400">
                          What users think about
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-400">
                          Last 30 days
                        </div>
                        <div className="text-lg font-semibold text-white">
                          {selectedApp.reviewsCount}
                        </div>
                      </div>
                      <button
                        onClick={() => setShowAnalysisModal(false)}
                        className="text-gray-400 hover:text-white transition-colors p-2"
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex-shrink-0 border-b border-gray-800 bg-[#1C1C1E] px-4 flex gap-2">
                    <button
                      onClick={() => setActiveTab("premium")}
                      className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                        activeTab === "premium"
                          ? "text-orange-400 border-orange-400"
                          : "text-gray-400 border-transparent hover:text-gray-300"
                      }`}
                    >
                      User Analysis
                    </button>
                    <button
                      onClick={() => setActiveTab("competitive")}
                      className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                        activeTab === "competitive"
                          ? "text-orange-400 border-orange-400"
                          : "text-gray-400 border-transparent hover:text-gray-300"
                      }`}
                    >
                      Competitive Intelligence
                    </button>
                  </div>

                  {/* Content */}
                  {activeTab === "premium" ? (
                    <div className="flex-1 overflow-y-auto p-3 sm:p-4 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                      {/* LIKES Column */}
                      <div>
                        <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          LIKES
                        </h3>
                        <div className="space-y-2">
                          {analysisResult.likes &&
                          analysisResult.likes.length > 0 ? (
                            analysisResult.likes.map((like, idx) => (
                              <div
                                key={idx}
                                className="bg-green-500/10 border border-green-500/30 rounded-lg p-2.5 text-xs text-gray-200 leading-relaxed"
                              >
                                {like}
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500 text-sm">
                              No likes found
                            </p>
                          )}
                        </div>
                      </div>

                      {/* DISLIKES Column */}
                      <div>
                        <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                          DISLIKES
                        </h3>
                        <div className="space-y-2">
                          {analysisResult.dislikes &&
                          analysisResult.dislikes.length > 0 ? (
                            analysisResult.dislikes.map((dislike, idx) => (
                              <div
                                key={idx}
                                className="bg-red-500/10 border border-red-500/30 rounded-lg p-2.5 text-xs text-gray-200 leading-relaxed"
                              >
                                {dislike}
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500 text-sm">
                              No dislikes found
                            </p>
                          )}
                        </div>
                      </div>

                      {/* SUGGESTIONS Column */}
                      <div>
                        <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          SUGGESTIONS
                        </h3>
                        <div className="space-y-2">
                          {analysisResult.suggestions &&
                          analysisResult.suggestions.length > 0 ? (
                            analysisResult.suggestions.map(
                              (suggestion, idx) => (
                                <div
                                  key={idx}
                                  className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2.5 text-xs text-gray-200 leading-relaxed"
                                >
                                  {suggestion}
                                </div>
                              )
                            )
                          ) : (
                            <p className="text-gray-500 text-sm">
                              No suggestions found
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : /* Competitive Intelligence Tab */
                  analysisResult.competitiveIntelligence ? (
                    <div className="flex-1 overflow-y-auto p-6">
                      {/* Compact Grid - All Categories */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {/* Conversion Hacks */}
                        <HowToBeatThemCard
                          title="Conversion Hacks"
                          icon={
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                              />
                            </svg>
                          }
                          color="blue"
                          items={
                            analysisResult.competitiveIntelligence.howToBeatThem
                              .conversionHacks || []
                          }
                        />

                        {/* Retention Hacks */}
                        <HowToBeatThemCard
                          title="Retention Hacks"
                          icon={
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                          }
                          color="purple"
                          items={
                            analysisResult.competitiveIntelligence.howToBeatThem
                              .retentionHacks || []
                          }
                        />

                        {/* Discovery Hacks */}
                        <HowToBeatThemCard
                          title="Discovery Hacks"
                          icon={
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                              />
                            </svg>
                          }
                          color="yellow"
                          items={
                            analysisResult.competitiveIntelligence.howToBeatThem
                              .discoveryHacks || []
                          }
                        />

                        {/* Trust Hacks */}
                        <HowToBeatThemCard
                          title="Trust Hacks"
                          icon={
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                              />
                            </svg>
                          }
                          color="green"
                          items={
                            analysisResult.competitiveIntelligence.howToBeatThem
                              .trustHacks || []
                          }
                        />

                        {/* Monetization Hacks */}
                        <HowToBeatThemCard
                          title="Monetization Hacks"
                          icon={
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          }
                          color="orange"
                          items={
                            analysisResult.competitiveIntelligence.howToBeatThem
                              .monetizationHacks || []
                          }
                        />

                        {/* Quick Wins */}
                        <HowToBeatThemCard
                          title="Quick Wins"
                          icon={
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                              />
                            </svg>
                          }
                          color="green"
                          items={
                            analysisResult.competitiveIntelligence.howToBeatThem
                              .quickWins || []
                          }
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center p-6">
                      <div className="text-center text-gray-400">
                        <p>
                          Competitive intelligence analysis is being
                          generated...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
                ) : (
                     <AnalysisPlaceholder />
                )}
            </main>
        </div>
    );
};

// Keywords View Component (Full Page)
const KeywordsView: React.FC<{
  selectedApp: App | null;
  aiTags: string[];
  selectedCountry: string;
  onShowAddAppModal: () => void;
  onShowKeywordSearchModal: () => void;
}> = ({
  selectedApp,
  aiTags,
  selectedCountry: initialCountry,
  onShowAddAppModal,
  onShowKeywordSearchModal,
}) => {
  const [trackedKeywords, setTrackedKeywords] = useState<StoredKeyword[]>([]);
  const [suggestions, setSuggestions] = useState<KeywordSuggestion[]>([]);
  const [discoveredKeywords, setDiscoveredKeywords] = useState<
    Array<{
      keyword: string;
      position: number;
      popularity: number;
      difficulty: number;
      totalAppsInRanking: number;
    }>
  >([]);
  const [isDiscoveringKeywords, setIsDiscoveringKeywords] = useState(false);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(
    new Set()
  );
  const [suggestionSearchQuery, setSuggestionSearchQuery] = useState("");
  const [showCompetitorKeywordsModal, setShowCompetitorKeywordsModal] =
    useState(false);
  const [competitorKeywords, setCompetitorKeywords] = useState<
    Array<{
      keyword: string;
      position: number;
      popularity: number;
      difficulty: number;
    }>
  >([]);
  const [selectedCompetitorApp, setSelectedCompetitorApp] =
    useState<App | null>(null);
  const [isCheckingRanking, setIsCheckingRanking] = useState<string | null>(
    null
  );
  const [newKeyword, setNewKeyword] = useState("");
  const [showAddKeyword, setShowAddKeyword] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(initialCountry);
  const [translatedKeywords, setTranslatedKeywords] = useState<
    Map<string, string>
  >(new Map());
  const [hoveredKeyword, setHoveredKeyword] = useState<string | null>(null);
  const [lastDiscoveredAppId, setLastDiscoveredAppId] = useState<string | null>(
    null
  );
  const [copiedDiscovered, setCopiedDiscovered] = useState(false);

  // Load tracked keywords and generate suggestions
  useEffect(() => {
    if (selectedApp) {
      const keywords = getKeywordsForApp(selectedApp.id);
      setTrackedKeywords(keywords);

      // Generate suggestions
      generateKeywordSuggestions(selectedApp, aiTags)
        .then((sugs) => {
          setSuggestions(sugs);
        })
        .catch(() => {
          // Silently fail - suggestions are optional
        });
    } else {
      // No app selected - clear keywords
      setTrackedKeywords([]);
      setSuggestions([]);
    }
  }, [selectedApp, aiTags]);

  // Refresh keywords periodically and on visibility change
  useEffect(() => {
    const refreshKeywords = () => {
      if (selectedApp) {
        const keywords = getKeywordsForApp(selectedApp.id);
        setTrackedKeywords(keywords);
      }
    };

    // Refresh on visibility change (when tab becomes visible)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshKeywords();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Refresh every 2 seconds (for same-tab updates)
    const interval = setInterval(refreshKeywords, 2000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(interval);
    };
  }, [selectedApp]);

  useEffect(() => {
    if (!selectedApp) return;
    if (lastDiscoveredAppId === selectedApp.id) return;

    let cancelled = false;
    const autoDiscover = async () => {
      setIsDiscoveringKeywords(true);
      try {
        const discovered = await discoverRankingKeywords(
          selectedApp,
          selectedCountry
        );
        if (!cancelled) {
          setDiscoveredKeywords(discovered);
          setLastDiscoveredAppId(selectedApp.id);
        }
      } catch (error) {
        console.error("Error auto-discovering keywords:", error);
      } finally {
        if (!cancelled) {
          setIsDiscoveringKeywords(false);
        }
      }
    };

    autoDiscover();
    return () => {
      cancelled = true;
    };
  }, [selectedApp?.id, selectedCountry, lastDiscoveredAppId]);

  const handleAddDiscoveredToTracking = () => {
    discoveredKeywords.slice(0, 20).forEach((kw) => {
      handleAddKeyword(kw.keyword, "extracted");
    });
  };

  const handleCopyDiscoveredKeywords = async () => {
    if (discoveredKeywords.length === 0) return;
    try {
      await navigator.clipboard.writeText(
        discoveredKeywords.map((kw) => kw.keyword).join(", ")
      );
      setCopiedDiscovered(true);
      setTimeout(() => setCopiedDiscovered(false), 2000);
    } catch (error) {
      console.error("Error copying keywords:", error);
    }
  };

  const handleAddKeyword = (
    keyword: string,
    source: "extracted" | "ai-suggested" | "manual" | "competitor" = "manual"
  ) => {
    if (!selectedApp || !keyword.trim()) return;

    const storedKeyword: StoredKeyword = {
      id: `${selectedApp.id}_${keyword}_${Date.now()}`,
      appId: selectedApp.id,
      keyword: keyword.trim(),
      source,
      createdAt: new Date().toISOString(),
    };

    addKeyword(storedKeyword);
    setTrackedKeywords(getKeywordsForApp(selectedApp.id));
    setNewKeyword("");
    setShowAddKeyword(false);
  };

  const handleRemoveKeyword = (keywordId: string) => {
    removeKeyword(keywordId);
    if (selectedApp) {
      setTrackedKeywords(getKeywordsForApp(selectedApp.id));
    }
  };

  const handleCheckRanking = async (keyword: StoredKeyword) => {
    if (!selectedApp) return;
    setIsCheckingRanking(keyword.id);
    try {
      const result = await checkKeywordRanking(
        selectedApp.id,
        keyword.keyword,
        selectedCountry,
        keyword.previousPosition || keyword.position
      );

      // Store top 4 apps in ranking (simplified for storage)
      const appsInRanking = result.appsInRanking.map((app) => ({
        id: app.id,
        name: app.name,
        icon: app.icon,
      }));

      await updateKeyword(keyword.id, {
        position: result.position || undefined,
        positionChange: result.positionChange,
        popularity: result.popularity,
        difficulty: result.difficulty,
        appsInRanking,
        totalAppsInRanking: result.totalAppsInRanking,
        previousPosition: result.position || undefined,
        lastChecked: new Date().toISOString(),
      });
      setTrackedKeywords(getKeywordsForApp(selectedApp.id));
    } catch (error) {
      console.error("Error checking ranking:", error);
    } finally {
      setIsCheckingRanking(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#111213]">
      {/* Top Toolbar - Like Try Astro */}
      <div className="flex-shrink-0 border-b border-gray-800 bg-[#1C1C1E] px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <h1 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
              Keywords
              {selectedApp && (
                <span className="hidden sm:inline text-sm font-normal text-gray-400">
                  - {selectedApp.name}
                </span>
              )}
              <button
                onClick={() => {
                  const modal = document.getElementById("aso-help-modal");
                  if (modal) {
                    (modal as any).showModal();
                  }
                }}
                className="text-gray-400 hover:text-orange-400 transition-colors"
                title="How ASO Keyword Tracking Works"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
            </h1>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="px-2 sm:px-3 py-1.5 bg-gray-800 border border-gray-700 text-white rounded-lg text-xs sm:text-sm"
            >
              {APP_STORE_COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.code}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {selectedApp && (
              <button
                onClick={onShowKeywordSearchModal}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1.5 sm:gap-2"
              >
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="hidden sm:inline">Add Keywords +</span>
                <span className="sm:hidden">Add +</span>
              </button>
            )}
            {selectedApp && (
              <button
                onClick={async () => {
                  if (!selectedApp) return;
                  setIsDiscoveringKeywords(true);
                  try {
                    const discovered = await discoverRankingKeywords(
                      selectedApp,
                      selectedCountry
                    );
                    setDiscoveredKeywords(discovered);
                    setShowSuggestionsModal(true);
                  } catch (error) {
                    console.error("Error discovering keywords:", error);
                  } finally {
                    setIsDiscoveringKeywords(false);
                  }
                }}
                disabled={isDiscoveringKeywords}
                className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDiscoveringKeywords ? (
                  <>
                    <svg
                      className="animate-spin w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Discovering...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    Found {discoveredKeywords.length || "?"} Suggestions
                  </>
                )}
              </button>
            )}
            {trackedKeywords.length > 0 && (
              <button
                onClick={async () => {
                  // Check all keywords
                  for (const keyword of trackedKeywords) {
                    if (!isCheckingRanking) {
                      await handleCheckRanking(keyword);
                      // Small delay to avoid rate limiting
                      await new Promise((resolve) => setTimeout(resolve, 500));
                    }
                  }
                }}
                disabled={isCheckingRanking !== null}
                className="px-4 py-2 bg-gray-700 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Check All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ASO Help Modal */}
      <dialog id="aso-help-modal" className="modal">
        <div className="modal-box bg-[#1C1C1E] border border-gray-800 max-w-2xl">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-gray-400 hover:text-white">
              ✕
            </button>
          </form>
          <h3 className="text-2xl font-bold text-white mb-4">
            How ASO Keyword Tracking Works
          </h3>
          <div className="space-y-4 text-gray-300">
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">
                What is ASO Keyword Tracking?
              </h4>
              <p className="text-sm">
                ASO (App Store Optimization) keyword tracking helps you monitor
                your app's ranking position for specific keywords in the App
                Store. This helps you understand which keywords drive visibility
                and discoverability for your app.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">
                How to Use This Feature:
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>
                  <strong>Add Keywords:</strong> Click "Add Keywords +" to
                  manually add keywords you want to track, or use "Found X
                  Suggestions" to discover keywords your app already ranks for.
                </li>
                <li>
                  <strong>Check Rankings:</strong> Click on any keyword row to
                  check its current ranking position. The system searches the
                  App Store and finds where your app appears.
                </li>
                <li>
                  <strong>Monitor Metrics:</strong>
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                    <li>
                      <strong>Position:</strong> Your app's rank (1-25). If
                      blank, your app doesn't rank in top 25 for this keyword.
                    </li>
                    <li>
                      <strong>Popularity:</strong> Estimated search volume
                      (0-100). Higher = more people search for this keyword.
                    </li>
                    <li>
                      <strong>Difficulty:</strong> How hard it is to rank
                      (0-100). Higher = more competition from established apps.
                    </li>
                    <li>
                      <strong>Apps in Ranking:</strong> Competitors ranking for
                      the same keyword.
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>Track Competitors:</strong> Click on competitor app
                  icons to extract keywords they rank for, then add those
                  keywords to track your own ranking.
                </li>
              </ol>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">
                Why Position Might Be Empty:
              </h4>
              <p className="text-sm">
                If a keyword shows no position, it means your app doesn't
                currently rank in the top 25 results for that keyword in the App
                Store. This is normal for new keywords or highly competitive
                terms. Focus on keywords where you do rank, or use "Found X
                Suggestions" to discover keywords you already rank for.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">
                Best Practices:
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Track 10-20 relevant keywords per app</li>
                <li>
                  Focus on keywords with medium popularity (30-70) and
                  low-medium difficulty (0-50)
                </li>
                <li>Check rankings weekly to track improvements</li>
                <li>
                  Use competitor keyword extraction to discover new
                  opportunities
                </li>
                <li>
                  Update your app's metadata (name, subtitle, description) to
                  improve rankings
                </li>
              </ul>
            </div>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* Content - Table View */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Add Keyword Input - Show in toolbar area if needed */}
        {showAddKeyword && (
          <div className="px-6 py-3 bg-[#1C1C1E] border-b border-gray-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && newKeyword.trim()) {
                    handleAddKeyword(newKeyword);
                  }
                }}
                placeholder="Enter keyword to track..."
                className="flex-1 px-4 py-2 bg-[#111213] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
              />
              <button
                onClick={() => handleAddKeyword(newKeyword)}
                disabled={!newKeyword.trim()}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddKeyword(false);
                  setNewKeyword("");
                }}
                className="px-4 py-2 bg-[#1C1C1E] border border-gray-700 text-white rounded-lg hover:bg-[#1C1C1E]/80"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Keywords Table - Like Try Astro */}
        <div className="flex-1 overflow-auto">
          {discoveredKeywords.length > 0 && (
            <div className="mx-4 my-6 bg-[#1C1C1E] border border-gray-800 rounded-2xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    Keywords you're already ranking for
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Live data from the {selectedCountry} store. Add or copy
                    these keywords to keep tracking their movement.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleCopyDiscoveredKeywords}
                    className="px-4 py-2 text-sm rounded-lg border border-gray-700 text-gray-200 hover:bg-gray-800 transition-colors"
                  >
                    {copiedDiscovered ? "Copied!" : "Copy list"}
                  </button>
                  <button
                    onClick={handleAddDiscoveredToTracking}
                    className="px-4 py-2 text-sm rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors"
                  >
                    Track top keywords
                  </button>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {discoveredKeywords.slice(0, 10).map((kw) => (
                  <div
                    key={kw.keyword}
                    className="p-4 rounded-xl border border-gray-800 bg-[#111213]"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold">{kw.keyword}</p>
                        <p className="text-xs text-gray-500">
                          Position:{" "}
                          {kw.position ? `#${kw.position}` : "Not in top 25"}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          handleAddKeyword(kw.keyword, "extracted")
                        }
                        className="text-xs font-semibold text-orange-400 hover:text-orange-300"
                      >
                        Track
                      </button>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-gray-400">
                      <div>
                        <p className="text-gray-500">Popularity</p>
                        <p className="text-white font-semibold">
                          {kw.popularity}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Difficulty</p>
                        <p className="text-white font-semibold">
                          {kw.difficulty}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Apps</p>
                        <p className="text-white font-semibold">
                          {kw.totalAppsInRanking}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="sticky top-0 bg-[#111213] z-10 border-b border-gray-800">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                    <div className="flex items-center gap-1">
                      Keyword
                      <button className="text-gray-500 hover:text-gray-400">
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <circle
                            cx="10"
                            cy="10"
                            r="8"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                          <text
                            x="10"
                            y="13"
                            textAnchor="middle"
                            fontSize="8"
                            fill="currentColor"
                          >
                            i
                          </text>
                        </svg>
                      </button>
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                    <div className="flex items-center gap-1">
                      Notes
                      <button className="text-gray-500 hover:text-gray-400">
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <circle
                            cx="10"
                            cy="10"
                            r="8"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                          <text
                            x="10"
                            y="13"
                            textAnchor="middle"
                            fontSize="8"
                            fill="currentColor"
                          >
                            i
                          </text>
                        </svg>
                      </button>
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                    <div className="flex items-center gap-1">
                      Last update
                      <button className="text-gray-500 hover:text-gray-400">
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <circle
                            cx="10"
                            cy="10"
                            r="8"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                          <text
                            x="10"
                            y="13"
                            textAnchor="middle"
                            fontSize="8"
                            fill="currentColor"
                          >
                            i
                          </text>
                        </svg>
                      </button>
                    </div>
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">
                    <div className="flex items-center justify-end gap-1">
                      Popularity
                      <button className="text-gray-500 hover:text-gray-400">
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <circle
                            cx="10"
                            cy="10"
                            r="8"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                          <text
                            x="10"
                            y="13"
                            textAnchor="middle"
                            fontSize="8"
                            fill="currentColor"
                          >
                            i
                          </text>
                        </svg>
                      </button>
                    </div>
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">
                    <div className="flex items-center justify-end gap-1">
                      Difficulty
                      <button className="text-gray-500 hover:text-gray-400">
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <circle
                            cx="10"
                            cy="10"
                            r="8"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                          <text
                            x="10"
                            y="13"
                            textAnchor="middle"
                            fontSize="8"
                            fill="currentColor"
                          >
                            i
                          </text>
                        </svg>
                      </button>
                    </div>
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">
                    <div className="flex items-center justify-end gap-1">
                      Position
                      <button className="text-gray-500 hover:text-gray-400">
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <circle
                            cx="10"
                            cy="10"
                            r="8"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                          <text
                            x="10"
                            y="13"
                            textAnchor="middle"
                            fontSize="8"
                            fill="currentColor"
                          >
                            i
                          </text>
                        </svg>
                      </button>
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                    <div className="flex items-center gap-1">
                      Apps in Ranking
                      <button className="text-gray-500 hover:text-gray-400">
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <circle
                            cx="10"
                            cy="10"
                            r="8"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                          <text
                            x="10"
                            y="13"
                            textAnchor="middle"
                            fontSize="8"
                            fill="currentColor"
                          >
                            i
                          </text>
                        </svg>
                      </button>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {trackedKeywords.length === 0 ? (
                  // Empty state with helpful message
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="max-w-md mx-auto">
                        <svg
                          className="w-16 h-16 text-gray-600 mx-auto mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                          />
                        </svg>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          No Keywords Tracked Yet
                        </h3>
                        <p className="text-gray-400 text-sm mb-4">
                          Start tracking keywords to monitor your app's App
                          Store rankings and discoverability.
                        </p>
                        <div className="space-y-2 text-left max-w-sm mx-auto">
                          <p className="text-gray-500 text-xs">
                            <strong className="text-gray-300">
                              Quick Start:
                            </strong>
                          </p>
                          <ol className="list-decimal list-inside space-y-1 text-xs text-gray-400">
                            <li>
                              Click "Add Keywords +" to manually add keywords
                            </li>
                            <li>
                              Or click "Found X Suggestions" to discover
                              keywords your app already ranks for
                            </li>
                            <li>
                              Click any keyword row to check its ranking
                              position
                            </li>
                          </ol>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <>
                    {trackedKeywords.map((keyword, idx) => (
                      <tr
                        key={keyword.id}
                        onClick={() => {
                          if (!isCheckingRanking) {
                            handleCheckRanking(keyword);
                          }
                        }}
                        className={`border-b border-gray-800 hover:bg-gray-800/30 transition-colors cursor-pointer ${
                          idx % 2 === 0 ? "bg-gray-800/10" : "bg-gray-800/5"
                        }`}
                      >
                        <td className="py-4 px-4">
                          <div className="relative group">
                            <span className="text-white font-medium">
                              {keyword.keyword}
                            </span>
                            {selectedCountry !== "US" && (
                              <div
                                className="absolute left-0 top-full mt-2 hidden group-hover:block z-50 bg-[#1C1C1E] border border-gray-700 rounded-lg p-3 shadow-xl min-w-[200px]"
                                onMouseEnter={async () => {
                                  const cacheKey = `main_${keyword.keyword}_EN`;
                                  if (!translatedKeywords.has(cacheKey)) {
                                    const translation = await translateKeyword(
                                      keyword.keyword,
                                      "EN"
                                    );
                                    if (
                                      translation &&
                                      translation !== keyword.keyword
                                    ) {
                                      setTranslatedKeywords(
                                        new Map(
                                          translatedKeywords.set(
                                            cacheKey,
                                            translation
                                          )
                                        )
                                      );
                                    }
                                  }
                                }}
                              >
                                <div className="text-xs text-gray-400 mb-1">
                                  English Translation:
                                </div>
                                <div className="text-white text-sm">
                                  {translatedKeywords.get(
                                    `main_${keyword.keyword}_EN`
                                  ) || "Translating..."}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1">
                            {keyword.notes && keyword.notes.length > 0 ? (
                              keyword.notes.map((note, noteIdx) => (
                                <div
                                  key={noteIdx}
                                  className={`w-2 h-2 rounded-full ${
                                    note === "purple"
                                      ? "bg-purple-500"
                                      : note === "orange"
                                      ? "bg-orange-500"
                                      : note === "blue"
                                      ? "bg-blue-500"
                                      : "bg-gray-500"
                                  }`}
                                />
                              ))
                            ) : (
                              <span className="text-gray-600 text-xs">—</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {keyword.lastChecked ? (
                            <span className="text-gray-400 text-sm">
                              {(() => {
                                const date = new Date(keyword.lastChecked);
                                const now = new Date();
                                const diffMs = now.getTime() - date.getTime();
                                const diffMins = Math.floor(diffMs / 60000);
                                const diffHours = Math.floor(diffMs / 3600000);
                                const diffDays = Math.floor(diffMs / 86400000);

                                if (diffMins < 1) return "A few seconds...";
                                if (diffMins < 60)
                                  return `${diffMins} minute${
                                    diffMins > 1 ? "s" : ""
                                  } ago`;
                                if (diffHours < 24)
                                  return `${diffHours} hour${
                                    diffHours > 1 ? "s" : ""
                                  } ago`;
                                return `${diffDays} day${
                                  diffDays > 1 ? "s" : ""
                                } ago`;
                              })()}
                            </span>
                          ) : (
                            <span className="text-gray-500 text-sm">Never</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right">
                          {keyword.popularity !== undefined ? (
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-white text-sm font-medium w-8 text-right">
                                {keyword.popularity}
                              </span>
                              <div className="w-16 h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${
                                    keyword.popularity < 30
                                      ? "bg-red-500"
                                      : keyword.popularity < 60
                                      ? "bg-yellow-500"
                                      : "bg-green-500"
                                  }`}
                                  style={{ width: `${keyword.popularity}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-500 text-sm">—</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right">
                          {keyword.difficulty !== undefined ? (
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-white text-sm font-medium w-8 text-right">
                                {keyword.difficulty}
                              </span>
                              <div className="w-16 h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${
                                    keyword.difficulty < 30
                                      ? "bg-green-500"
                                      : keyword.difficulty < 70
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                  }`}
                                  style={{ width: `${keyword.difficulty}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-500 text-sm">—</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right">
                          {isCheckingRanking === keyword.id ? (
                            <div className="flex items-center justify-end gap-2">
                              <svg
                                className="animate-spin h-4 w-4 text-orange-400"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                              <span className="text-gray-400 text-xs">
                                Checking...
                              </span>
                            </div>
                          ) : keyword.position ? (
                            <div className="flex items-center justify-end gap-1">
                              <span className="text-white font-semibold">
                                #{keyword.position}
                              </span>
                              {keyword.positionChange !== undefined &&
                                keyword.positionChange !== 0 && (
                                  <span
                                    className={`text-xs font-medium ${
                                      keyword.positionChange > 0
                                        ? "text-green-400"
                                        : "text-red-400"
                                    }`}
                                  >
                                    {keyword.positionChange > 0 ? "↑" : "↓"}
                                    {Math.abs(keyword.positionChange)}
                                  </span>
                                )}
                              {keyword.history &&
                                keyword.history.length > 1 && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setHoveredKeyword(
                                        hoveredKeyword === keyword.id
                                          ? null
                                          : keyword.id
                                      );
                                    }}
                                    className="ml-2 text-gray-400 hover:text-orange-400 transition-colors"
                                    title="View position history"
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                      />
                                    </svg>
                                  </button>
                                )}
                            </div>
                          ) : keyword.lastChecked ? (
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-gray-500 text-sm">
                                Not in top 25
                              </span>
                              <span className="text-gray-600 text-xs">
                                Click to check
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-gray-500 text-sm">—</span>
                              <span className="text-gray-600 text-xs">
                                Click to check
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {keyword.appsInRanking &&
                          keyword.appsInRanking.length > 0 ? (
                            <div className="flex items-center gap-1">
                              {keyword.appsInRanking.slice(0, 3).map((app) => (
                                <img
                                  key={app.id}
                                  src={app.icon}
                                  alt={app.name}
                                  className="w-6 h-6 rounded-lg cursor-pointer hover:ring-2 hover:ring-orange-500 transition-all"
                                  title={`${app.name} - Click to extract keywords`}
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    if (!selectedApp) return;
                                    setSelectedCompetitorApp({
                                      ...app,
                                      id: app.id,
                                    } as App);
                                    setShowCompetitorKeywordsModal(true);
                                    try {
                                      // Fetch full app details first
                                      const fullApp = await getAppDetails(
                                        "",
                                        app.id
                                      );
                                      const keywords =
                                        await extractCompetitorKeywords(
                                          fullApp,
                                          selectedCountry
                                        );
                                      setCompetitorKeywords(keywords);
                                    } catch (error) {
                                      console.error(
                                        "Error extracting competitor keywords:",
                                        error
                                      );
                                      setCompetitorKeywords([]);
                                    }
                                  }}
                                />
                              ))}
                              {keyword.totalAppsInRanking &&
                                keyword.totalAppsInRanking > 3 && (
                                  <span className="text-gray-400 text-xs ml-1">
                                    +{keyword.totalAppsInRanking - 3}
                                  </span>
                                )}
                            </div>
                          ) : (
                            <span className="text-gray-500 text-sm">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {/* Historical Chart Modal for selected keyword */}
                    {hoveredKeyword &&
                      (() => {
                        const keyword = trackedKeywords.find(
                          (k) => k.id === hoveredKeyword
                        );
                        if (
                          !keyword ||
                          !keyword.history ||
                          keyword.history.length < 2
                        )
                          return null;

                        const chartData = keyword.history
                          .slice(-KEYWORD_CONFIG.HISTORY_RETENTION_DAYS) // Last N data points
                          .map((h) => ({
                            date: new Date(h.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            }),
                            position: h.position,
                            popularity: h.popularity,
                            difficulty: h.difficulty,
                          }));

                        return (
                          <tr key={`chart-${hoveredKeyword}`}>
                            <td
                              colSpan={7}
                              className="p-6 bg-[#1C1C1E] border-b border-gray-800"
                            >
                              <div className="mb-2 flex items-center justify-between">
                                <h3 className="text-white font-semibold">
                                  Position History: {keyword.keyword}
                                </h3>
                                <button
                                  onClick={() => setHoveredKeyword(null)}
                                  className="text-gray-400 hover:text-white"
                                >
                                  <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>
                              </div>
                              <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart data={chartData}>
                                    <CartesianGrid
                                      strokeDasharray="3 3"
                                      stroke="#374151"
                                    />
                                    <XAxis
                                      dataKey="date"
                                      stroke="#9CA3AF"
                                      style={{ fontSize: "12px" }}
                                    />
                                    <YAxis
                                      stroke="#9CA3AF"
                                      style={{ fontSize: "12px" }}
                                      reversed
                                      domain={["dataMin - 5", "dataMax + 5"]}
                                    />
                                    <Tooltip
                                      contentStyle={{
                                        backgroundColor: "#1C1C1E",
                                        border: "1px solid #374151",
                                        borderRadius: "8px",
                                        color: "#fff",
                                      }}
                                    />
                                    <Line
                                      type="monotone"
                                      dataKey="position"
                                      stroke="#f97316"
                                      strokeWidth={2}
                                      dot={{ fill: "#f97316", r: 4 }}
                                      activeDot={{ r: 6 }}
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                            </td>
                          </tr>
                        );
                      })()}
                    {/* Fill remaining rows with empty rows to fill the table */}
                    {Array.from({
                      length: Math.max(
                        0,
                        KEYWORD_CONFIG.MIN_TABLE_ROWS - trackedKeywords.length
                      ),
                    }).map((_, idx) => (
                      <tr
                        key={`empty-fill-${idx}`}
                        className={`border-b border-gray-800 ${
                          (trackedKeywords.length + idx) % 2 === 0
                            ? "bg-gray-800/10"
                            : "bg-gray-800/5"
                        }`}
                      >
                        <td className="py-4 px-4">
                          <div className="h-4 bg-gray-800/30 rounded w-32"></div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="h-4 bg-gray-800/30 rounded w-16"></div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="h-4 bg-gray-800/30 rounded w-24"></div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="h-4 bg-gray-800/30 rounded w-16 ml-auto"></div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="h-4 bg-gray-800/30 rounded w-16 ml-auto"></div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="h-4 bg-gray-800/30 rounded w-16 ml-auto"></div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="h-4 bg-gray-800/30 rounded w-32"></div>
                        </td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Keyword Suggestions Modal - Like Astro */}
      {showSuggestionsModal && selectedApp && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowSuggestionsModal(false);
              setSelectedSuggestions(new Set());
            }
          }}
        >
          <div
            className="bg-[#1C1C1E] border border-gray-800 rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Keyword Suggestions
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  {selectedApp.name} ranks with {discoveredKeywords.length}{" "}
                  keywords in{" "}
                  {getCountryByCode(selectedCountry)?.name || selectedCountry}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowSuggestionsModal(false);
                  setSelectedSuggestions(new Set());
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-800">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search for Suggestion"
                  value={suggestionSearchQuery}
                  onChange={(e) => setSuggestionSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#111213] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Keywords List */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-4">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="sticky top-0 bg-[#1C1C1E] z-10">
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                        <input
                          type="checkbox"
                          checked={
                            selectedSuggestions.size ===
                              discoveredKeywords.length &&
                            discoveredKeywords.length > 0
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSuggestions(
                                new Set(
                                  discoveredKeywords.map((k) => k.keyword)
                                )
                              );
                            } else {
                              setSelectedSuggestions(new Set());
                            }
                          }}
                          className="rounded border-gray-600 text-orange-600 focus:ring-orange-500"
                        />
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                        Suggestion
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                        Popularity
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                        Difficulty
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                        Position
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                        Apps Count
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {discoveredKeywords
                      .filter((kw) =>
                        suggestionSearchQuery
                          ? kw.keyword
                              .toLowerCase()
                              .includes(suggestionSearchQuery.toLowerCase())
                          : true
                      )
                      .map((kw) => (
                        <tr
                          key={kw.keyword}
                          className="border-b border-gray-800 hover:bg-gray-800/30"
                        >
                          <td className="py-3 px-4">
                            <input
                              type="checkbox"
                              checked={selectedSuggestions.has(kw.keyword)}
                              onChange={(e) => {
                                const newSet = new Set(selectedSuggestions);
                                if (e.target.checked) {
                                  newSet.add(kw.keyword);
                                } else {
                                  newSet.delete(kw.keyword);
                                }
                                setSelectedSuggestions(newSet);
                              }}
                              className="rounded border-gray-600 text-orange-600 focus:ring-orange-500"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-white font-medium">
                              {kw.keyword}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-white text-sm w-8">
                                {kw.popularity}
                              </span>
                              <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${
                                    kw.popularity < 30
                                      ? "bg-red-500"
                                      : kw.popularity < 60
                                      ? "bg-yellow-500"
                                      : "bg-green-500"
                                  }`}
                                  style={{ width: `${kw.popularity}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-white text-sm w-8">
                                {kw.difficulty}
                              </span>
                              <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${
                                    kw.difficulty < 30
                                      ? "bg-green-500"
                                      : kw.difficulty < 70
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                  }`}
                                  style={{ width: `${kw.difficulty}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-white font-semibold">
                              #{kw.position}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-gray-400 text-sm">
                              {kw.totalAppsInRanking}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-800">
              <span className="text-gray-400 text-sm">
                {selectedSuggestions.size} keywords selected
              </span>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowSuggestionsModal(false);
                    setSelectedSuggestions(new Set());
                  }}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Done
                </button>
                <button
                  onClick={() => {
                    selectedSuggestions.forEach((keyword) => {
                      handleAddKeyword(keyword, "extracted");
                    });
                    setShowSuggestionsModal(false);
                    setSelectedSuggestions(new Set());
                  }}
                  disabled={selectedSuggestions.size === 0}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Selected ({selectedSuggestions.size})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Competitor Keywords Modal */}
      {showCompetitorKeywordsModal && selectedCompetitorApp && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCompetitorKeywordsModal(false);
              setSelectedCompetitorApp(null);
              setCompetitorKeywords([]);
            }
          }}
        >
          <div
            className="bg-[#1C1C1E] border border-gray-800 rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <img
                  src={selectedCompetitorApp.icon}
                  alt={selectedCompetitorApp.name}
                  className="w-12 h-12 rounded-lg"
                />
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Extract Competitor Keywords
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    {selectedCompetitorApp.name} ranks with{" "}
                    {competitorKeywords.length} keywords
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCompetitorKeywordsModal(false);
                  setSelectedCompetitorApp(null);
                  setCompetitorKeywords([]);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Keywords List */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-4">
              {competitorKeywords.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead className="sticky top-0 bg-[#1C1C1E] z-10">
                      <tr className="border-b border-gray-800">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                          Keyword
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                          Position
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                          Popularity
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                          Difficulty
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {competitorKeywords.map((kw) => (
                        <tr
                          key={kw.keyword}
                          className="border-b border-gray-800 hover:bg-gray-800/30"
                        >
                          <td className="py-3 px-4">
                            <span className="text-white font-medium">
                              {kw.keyword}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-white font-semibold">
                              #{kw.position}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-white text-sm w-8">
                                {kw.popularity}
                              </span>
                              <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${
                                    kw.popularity < 30
                                      ? "bg-red-500"
                                      : kw.popularity < 60
                                      ? "bg-yellow-500"
                                      : "bg-green-500"
                                  }`}
                                  style={{ width: `${kw.popularity}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-white text-sm w-8">
                                {kw.difficulty}
                              </span>
                              <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${
                                    kw.difficulty < 30
                                      ? "bg-green-500"
                                      : kw.difficulty < 70
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                  }`}
                                  style={{ width: `${kw.difficulty}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => {
                                handleAddKeyword(kw.keyword, "competitor");
                                setShowCompetitorKeywordsModal(false);
                                setSelectedCompetitorApp(null);
                                setCompetitorKeywords([]);
                              }}
                              className="px-3 py-1.5 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors"
                            >
                              Add
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="mb-4">
                    <svg
                      className="w-16 h-16 text-gray-600 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-lg mb-2">
                    No keywords found for this competitor
                  </p>
                  <p className="text-gray-500 text-sm max-w-md mx-auto">
                    This app may not rank in the top 25 for the keywords we
                    checked, or the keywords couldn't be extracted from their
                    metadata. Try checking a more popular competitor app.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Modals are rendered in the parent Dashboard component

// Add App Modal Component
const AddAppModal: React.FC<{
  onClose: () => void;
  onSelectApp: (app: App) => void;
  selectedCountry: string;
}> = ({ onClose, onSelectApp, selectedCountry }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<App[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await searchApps(searchQuery, selectedCountry);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching apps:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div
      className="bg-[#111213] border border-gray-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header - Just Close Button */}
      <div className="flex-shrink-0 bg-[#111213] border-b border-gray-800 px-6 py-4 flex items-center justify-end">
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors p-1.5"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-800 bg-[#111213]">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            placeholder="Search for App Name or Developer Name"
            className="w-full pl-12 pr-4 py-3.5 bg-[#1C1C1E] border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 text-sm"
          />
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto bg-[#111213]">
        {isSearching ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-400 text-sm">Searching...</p>
            </div>
          </div>
        ) : searchResults.length === 0 && searchQuery ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">
              No apps found. Try a different search.
            </p>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="p-6 space-y-2">
            {searchResults.map((app, idx) => (
              <div
                key={app.id}
                onClick={() => onSelectApp(app)}
                className="p-4 bg-[#1C1C1E] rounded-xl hover:bg-[#1C1C1E]/80 cursor-pointer transition-colors border border-gray-800 hover:border-gray-700"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 text-sm font-semibold">
                    {idx + 1}
                  </div>
                  <img
                    src={app.icon}
                    alt={app.name}
                    className="w-14 h-14 rounded-xl flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-base mb-1 truncate">
                      {app.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-2 truncate">
                      {app.developer}
                    </p>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-gray-500">
                        Rating count:{" "}
                        <span className="text-gray-400">
                          {app.reviewsCount}
                        </span>
                      </span>
                      <span className="text-gray-500">
                        Average Rating:{" "}
                        <span className="text-gray-400">
                          {app.rating.toFixed(1)}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(
                          app.trackViewUrl ||
                            `https://apps.apple.com/app/id${app.id}`
                        );
                      }}
                      className="text-gray-400 hover:text-white p-2 transition-colors"
                      title="Copy link"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectApp(app);
                      }}
                      className="text-gray-400 hover:text-orange-500 p-2 transition-colors"
                      title="Add app"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">
              Search for an app to add it to your keywords tracking
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Keyword Search Modal Component
const KeywordSearchModal: React.FC<{
  onClose: () => void;
  onAddKeywords: (keywords: string[]) => void;
}> = ({ onClose, onAddKeywords }) => {
  const [keywordInput, setKeywordInput] = useState("");

  const handleAdd = () => {
    if (!keywordInput.trim()) return;
    const keywords = keywordInput
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
    if (keywords.length > 0) {
      onAddKeywords(keywords);
      setKeywordInput("");
    }
  };

  return (
    <div
      className="bg-[#1C1C1E] border border-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex-shrink-0 bg-[#1C1C1E] border-b border-gray-800 p-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Add Keywords</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors p-2"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-6">
          <input
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleAdd();
              }
            }}
            placeholder="Keywords separated by a comma"
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!keywordInput.trim()}
            className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Keywords +
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
