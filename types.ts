export interface Review {
  id: number;
  rating: number;
  author: string;
  date: string;
  title: string;
  content: string;
}

export interface App {
  id: string;
  name: string;
  developer: string;
  icon: string;
  rating: number;
  reviewsCount: string;
  releaseDate: string;
  screenshots: string[];
  downloads: string;
  revenue: string;
  reviews: Review[];
  // Additional iTunes API fields
  description?: string;
  price?: number;
  formattedPrice?: string;
  contentAdvisoryRating?: string;
  fileSizeBytes?: number;
  fileSizeFormatted?: string;
  languageCodes?: string[];
  primaryGenreName?: string;
  genres?: string[];
  minimumOsVersion?: string;
  releaseNotes?: string;
  version?: string;
  sellerUrl?: string;
  trackViewUrl?: string;
}

export interface AnalysisResult {
  summary: string;
  commonComplaints: string[];
  featureRequests: string[];
  monetization: string;
  marketOpportunities: string;
  likes?: string[];
  dislikes?: string[];
  suggestions?: string[];
  competitiveIntelligence?: CompetitiveIntelligence;
}

export interface CompetitiveIntelligence {
  strengths: {
    items: string[];
    score: number; // 0-100
    summary: string;
  };
  weaknesses: {
    items: string[];
    score: number; // 0-100 (lower is worse)
    summary: string;
  };
  howToBeatThem: {
    conversionHacks: {
      action: string;
      theirWeakness: string;
      whatToBuild: string;
      whyItWorks: string;
    }[];
    retentionHacks: {
      action: string;
      theirWeakness: string;
      whatToBuild: string;
      whyItWorks: string;
    }[];
    discoveryHacks: {
      action: string;
      opportunity: string;
      whatToBuild: string;
      whyItWorks: string;
    }[];
    trustHacks: {
      action: string;
      theirWeakness: string;
      whatToBuild: string;
      whyItWorks: string;
    }[];
    monetizationHacks: {
      action: string;
      theirWeakness: string;
      whatToBuild: string;
      whyItWorks: string;
    }[];
    quickWins: {
      action: string;
      impact: string;
      effort: "low" | "medium" | "high";
      whatToBuild: string;
    }[];
  };
  overallScore: number; // 0-100
}
