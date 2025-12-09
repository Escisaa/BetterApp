import { GoogleGenAI, Type } from "@google/genai";
import OpenAI from "openai";

// Lazy initialization
let geminiAI = null;
let openaiClient = null;

function getGeminiAI() {
  if (!geminiAI) {
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      console.warn("⚠️ GEMINI_API_KEY not set, will use OpenAI fallback");
      return null;
    }
    if (!API_KEY.startsWith("AIza")) {
      console.warn("⚠️ GEMINI_API_KEY format looks incorrect");
    }
    geminiAI = new GoogleGenAI({ apiKey: API_KEY });
    console.log("✅ Gemini AI initialized");
  }
  return geminiAI;
}

function getOpenAI() {
  if (!openaiClient) {
    const API_KEY = process.env.OPENAI_API_KEY;
    if (!API_KEY) {
      console.warn("⚠️ OPENAI_API_KEY not set");
      return null;
    }
    openaiClient = new OpenAI({ apiKey: API_KEY });
    console.log("✅ OpenAI initialized as fallback");
  }
  return openaiClient;
}

// Helper: Try Gemini first, fallback to OpenAI
async function callAIWithFallback(geminiCall, openaiCall) {
  // Try Gemini first
  const gemini = getGeminiAI();
  if (gemini) {
    try {
      return await geminiCall(gemini);
    } catch (error) {
      console.warn("⚠️ Gemini failed, trying OpenAI fallback:", error.message);
    }
  }

  // Fallback to OpenAI
  const openai = getOpenAI();
  if (openai) {
    try {
      return await openaiCall(openai);
    } catch (error) {
      console.error("❌ OpenAI also failed:", error.message);
      throw error;
    }
  }

  throw new Error(
    "No AI service available. Please set GEMINI_API_KEY or OPENAI_API_KEY."
  );
}

// Legacy compatibility
function getAI() {
  const gemini = getGeminiAI();
  if (gemini) return gemini;
  throw new Error(
    "GEMINI_API_KEY not configured. Set OPENAI_API_KEY as fallback."
  );
}

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description:
        "A compelling 3-4 sentence executive summary covering: (1) Overall sentiment percentage (positive/negative), (2) The single biggest strength mentioned, (3) The critical weakness most users complain about, (4) One surprising insight competitors could exploit.",
    },
    commonComplaints: {
      type: Type.ARRAY,
      description:
        "Top 6-8 specific complaints with frequency indicators. Format each as: '[HIGH/MEDIUM frequency] Specific issue - exact user quote or paraphrase'. Example: '[HIGH] App crashes on iOS 17 - Multiple users report crashes when opening settings'",
      items: { type: Type.STRING },
    },
    featureRequests: {
      type: Type.ARRAY,
      description:
        "6-8 specific features users are begging for. Include the potential impact. Format: 'Feature name: Description - Why users want this (e.g., 5+ users mentioned this)'",
      items: { type: Type.STRING },
    },
    monetization: {
      type: Type.STRING,
      description:
        "Detailed monetization analysis: (1) Current model (free/freemium/paid/subscription), (2) User sentiment about pricing (use percentages if possible), (3) Specific pricing complaints, (4) What price point users seem willing to pay, (5) Opportunity for alternative monetization.",
    },
    marketOpportunities: {
      type: Type.STRING,
      description:
        "3-4 specific, actionable market opportunities based on gaps. Format: 'OPPORTUNITY 1: [Name] - Build [specific feature] because [evidence from reviews]. Target audience: [who]. Potential advantage: [why this beats the competitor].'",
    },
    likes: {
      type: Type.ARRAY,
      description:
        "6-8 specific things users LOVE. Include why it matters competitively. Format: 'Feature/aspect - Why users love it and how often mentioned'",
      items: { type: Type.STRING },
    },
    dislikes: {
      type: Type.ARRAY,
      description:
        "6-8 specific pain points. Include severity level. Format: '[CRITICAL/MAJOR/MINOR] Issue - Specific description and impact on user experience'",
      items: { type: Type.STRING },
    },
    suggestions: {
      type: Type.ARRAY,
      description:
        "8-10 prioritized, actionable suggestions. Format: '[Priority 1-10] Suggestion - Expected impact and implementation difficulty (Easy/Medium/Hard)'",
      items: { type: Type.STRING },
    },
    competitorWeaknesses: {
      type: Type.ARRAY,
      description:
        "5-6 specific weaknesses a competitor could exploit to steal users. Format: 'Weakness: Description - How to exploit this to win users'",
      items: { type: Type.STRING },
    },
    userPersonas: {
      type: Type.STRING,
      description:
        "2-3 distinct user personas based on review patterns. For each: Name, Primary use case, Main frustration, What would make them switch to a competitor.",
    },
  },
  required: [
    "summary",
    "commonComplaints",
    "featureRequests",
    "monetization",
    "marketOpportunities",
    "likes",
    "dislikes",
    "suggestions",
    "competitorWeaknesses",
    "userPersonas",
  ],
};

export async function analyzeReviewsWithAI(appName, reviews) {
  const reviewsText = reviews
    .map(
      (r) => `Rating: ${r.rating}/5\nTitle: ${r.title}\nReview: ${r.content}`
    )
    .join("\n---\n");

  const totalReviews = reviews.length;
  const avgRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
  const positiveReviews = reviews.filter((r) => r.rating >= 4).length;
  const negativeReviews = reviews.filter((r) => r.rating <= 2).length;

  const prompt = `You are a SENIOR COMPETITIVE INTELLIGENCE ANALYST. Analyze user reviews for "${appName}" and deliver ACTIONABLE INTELLIGENCE.
    
REVIEW STATS:
- Total: ${totalReviews}, Avg rating: ${avgRating.toFixed(1)}/5
- Positive (4-5★): ${positiveReviews} (${Math.round(
    (positiveReviews / totalReviews) * 100
  )}%)
- Negative (1-2★): ${negativeReviews} (${Math.round(
    (negativeReviews / totalReviews) * 100
  )}%)

REVIEWS:
${reviewsText}

Return JSON with these fields:
- summary: 3-4 sentence executive summary
- commonComplaints: array of top complaints with frequency
- featureRequests: array of features users want
- monetization: pricing analysis
- marketOpportunities: gaps to exploit
- likes: array of what users love
- dislikes: array of pain points  
- suggestions: array of prioritized improvements
- competitorWeaknesses: array of exploitable weaknesses
- userPersonas: 2-3 user personas`;

  return callAIWithFallback(
    // Gemini call
    async (gemini) => {
      const response = await gemini.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: analysisSchema,
        },
      });
      return JSON.parse(response.text.trim());
    },
    // OpenAI fallback
    async (openai) => {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });
      return JSON.parse(response.choices[0].message.content);
    }
  );
}

export async function generateTagsWithAI(appName, reviews) {
  const reviewsText = reviews
    .map((r) => `${r.rating}★: ${r.title} - ${r.content}`)
    .join("\n");

  const prompt = `Analyze reviews for "${appName}" and return 5-8 tags as a JSON array.
Reviews: ${reviewsText}
Return ONLY a JSON array like: ["Tag1", "Tag2", "Tag3"]`;

  try {
    return await callAIWithFallback(
      async (gemini) => {
        const response = await gemini.models.generateContent({
          model: "gemini-2.0-flash",
          contents: prompt,
          config: { responseMimeType: "application/json", temperature: 0.7 },
        });
        const parsed = JSON.parse(response.text.trim());
        return Array.isArray(parsed) ? parsed : parsed.tags || [];
      },
      async (openai) => {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
        });
        const parsed = JSON.parse(response.choices[0].message.content);
        return Array.isArray(parsed) ? parsed : parsed.tags || [];
      }
    );
  } catch (error) {
    console.error("Error generating tags:", error);
    return [];
  }
}

export async function chatWithAI(appName, chatHistory, newMessage) {
  const historyContext =
    chatHistory.length > 0
      ? chatHistory
          .map(
            (msg) =>
              `${msg.role === "user" ? "User" : "Assistant"}: ${
                msg.parts[0].text
              }`
          )
          .join("\n")
      : "";

  const prompt = `You are an AI assistant helping analyze the app "${appName}".
Help with: features, competitors, ASO, marketing, monetization, user feedback.
Be concise (2-4 sentences). Be helpful.

${
  historyContext ? `Previous:\n${historyContext}\n\n` : ""
}User: "${newMessage}"`;

  try {
    return await callAIWithFallback(
      async (gemini) => {
        const response = await gemini.models.generateContent({
          model: "gemini-2.0-flash",
          contents: prompt,
          config: { maxOutputTokens: 500, temperature: 0.7 },
        });
        let text = response.text || "";
        if (text.length > 400) {
          const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
          text = sentences.slice(0, 3).join(" ").trim();
        }
        return text.trim() || "Sorry, I couldn't generate a response.";
      },
      async (openai) => {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 500,
          temperature: 0.7,
        });
        return response.choices[0].message.content.trim();
      }
    );
  } catch (error) {
    console.error("Error in chat:", error);
    return "Sorry, I encountered an error. Please try again.";
  }
}

// Competitive Intelligence with fallback
export async function analyzeCompetitiveIntelligence(
  appName,
  reviews,
  appMetadata
) {
  const reviewsText = reviews
    .map((r) => `${r.rating}★: ${r.content}`)
    .join("\n");

  let context = `App: "${appName}"\nReviews:\n${reviewsText}`;
  if (appMetadata?.description)
    context += `\nDescription: ${appMetadata.description.substring(0, 300)}`;
  if (appMetadata?.formattedPrice)
    context += `\nPrice: ${appMetadata.formattedPrice}`;

  const prompt = `Analyze "${appName}" and return JSON with competitive intelligence to help build a BETTER app.

${context}

Return JSON:
{
  "howToBeatThem": {
    "conversionHacks": [{"title": "...", "description": "..."}],
    "retentionHacks": [{"title": "...", "description": "..."}],
    "discoveryHacks": [{"title": "...", "description": "..."}],
    "trustHacks": [{"title": "...", "description": "..."}],
    "monetizationHacks": [{"title": "...", "description": "..."}],
    "quickWins": [{"title": "...", "description": "..."}]
  },
  "overallScore": 75
}

Provide 3-5 items per category. Be specific and actionable.`;

  const competitiveIntelligenceSchema = {
    type: Type.OBJECT,
    properties: {
      howToBeatThem: {
        type: Type.OBJECT,
        properties: {
          conversionHacks: { type: Type.ARRAY, items: { type: Type.OBJECT } },
          retentionHacks: { type: Type.ARRAY, items: { type: Type.OBJECT } },
          discoveryHacks: { type: Type.ARRAY, items: { type: Type.OBJECT } },
          trustHacks: { type: Type.ARRAY, items: { type: Type.OBJECT } },
          monetizationHacks: { type: Type.ARRAY, items: { type: Type.OBJECT } },
          quickWins: { type: Type.ARRAY, items: { type: Type.OBJECT } },
        },
      },
      overallScore: { type: Type.NUMBER },
    },
  };

  return callAIWithFallback(
    async (gemini) => {
      const response = await gemini.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: competitiveIntelligenceSchema,
        },
      });
      return JSON.parse(response.text.trim());
    },
    async (openai) => {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });
      return JSON.parse(response.choices[0].message.content);
    }
  );
}
