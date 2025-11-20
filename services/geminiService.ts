import { GoogleGenAI, Type } from "@google/genai";
import { Review, CompetitiveIntelligence } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description:
        "A 2-3 sentence summary of the overall user sentiment and key takeaways from the reviews.",
    },
    commonComplaints: {
      type: Type.ARRAY,
      description:
        "A list of the most frequent complaints or issues users have with the app.",
      items: { type: Type.STRING },
    },
    featureRequests: {
      type: Type.ARRAY,
      description: "A list of features that users are commonly requesting.",
      items: { type: Type.STRING },
    },
    monetization: {
      type: Type.STRING,
      description:
        "Analyze the reviews for any mentions of pricing, subscriptions, or ads to infer the app's monetization strategy and user sentiment towards it.",
    },
    marketOpportunities: {
      type: Type.STRING,
      description:
        "Based on the complaints and feature requests, identify potential market gaps or opportunities for a new or improved app. Be specific and actionable.",
    },
    likes: {
      type: Type.ARRAY,
      description:
        "A list of 5-8 things users like about the app, extracted from positive reviews. Be specific and concise (one sentence each).",
      items: { type: Type.STRING },
    },
    dislikes: {
      type: Type.ARRAY,
      description:
        "A list of 5-8 things users dislike about the app, extracted from negative reviews. Be specific and concise (one sentence each).",
      items: { type: Type.STRING },
    },
    suggestions: {
      type: Type.ARRAY,
      description:
        "A list of 5-8 actionable suggestions for improvement based on user feedback. Be specific and concise (one sentence each).",
      items: { type: Type.STRING },
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
  ],
};

export const analyzeReviewsWithAI = async (
  appName: string,
  reviews: Review[]
) => {
  const reviewsText = reviews
    .map(
      (r) => `Rating: ${r.rating}/5\nTitle: ${r.title}\nReview: ${r.content}`
    )
    .join("\n---\n");
  const prompt = `
    You are a senior product analyst for a top mobile app development studio.
    Your task is to analyze user reviews for the app "${appName}" and provide actionable insights for product and business decisions.
    
    Here are the user reviews:
    ${reviewsText}
    
    Based on these reviews, provide a detailed analysis.
  `;

  const maxRetries = 3;
  let lastError: any = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: analysisSchema,
          thinkingConfig: { thinkingBudget: 32768 },
        },
      });

      const jsonText = response.text.trim();
      return JSON.parse(jsonText);
    } catch (error: any) {
      lastError = error;
      // Check for 503/429 errors in various formats
      const isOverloaded =
        error?.status === 503 ||
        error?.status === 429 ||
        error?.code === 503 ||
        error?.code === 429 ||
        error?.error?.code === 503 ||
        error?.error?.code === 429 ||
        error?.message?.includes("overloaded") ||
        error?.message?.includes("503") ||
        error?.error?.message?.includes("overloaded");

      // If it's a 503 (overloaded) or 429 (rate limit), retry with exponential backoff
      if (isOverloaded && attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        console.warn(
          `API overloaded, retrying in ${delay}ms... (attempt ${
            attempt + 1
          }/${maxRetries})`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      // If it's not a retryable error or we've exhausted retries, throw
      console.error("Error analyzing reviews with AI:", error);
      throw new Error(
        isOverloaded
          ? "AI service is temporarily overloaded. Please try again in a few moments."
          : "Failed to get analysis from AI. Please check the console for details."
      );
    }
  }

  // If we get here, all retries failed
  throw new Error(
    lastError?.message?.includes("overloaded")
      ? "AI service is temporarily overloaded. Please try again in a few moments."
      : "Failed to get analysis from AI after multiple attempts. Please try again later."
  );
};

export const generateTagsWithAI = async (
  appName: string,
  reviews: Review[]
) => {
  const reviewsText = reviews.map((r) => r.content).join(" ");
  const prompt = `Based on the app name "${appName}" and the following review excerpts, generate 5-8 relevant, concise keyword tags (2-3 words max). Return ONLY a comma-separated list of tags, no numbers, no markdown, no formatting. Examples: habit tracker, community support, bug fixes needed. Reviews: ${reviewsText.substring(
    0,
    1000
  )}`;

  const maxRetries = 3;
  let lastError: any = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-flash-lite-latest",
        contents: prompt,
      });

      // Clean up the response
      let tagsText = response.text.trim();
      // Remove any markdown formatting
      tagsText = tagsText.replace(/\*\*/g, "");
      // Split by comma and clean each tag
      const tags = tagsText
        .split(",")
        .map((tag) => {
          // Remove numbers at start (1. 2. etc)
          let cleaned = tag.replace(/^\d+\.\s*/, "");
          // Remove quotes
          cleaned = cleaned.replace(/['"]+/g, "");
          // Trim whitespace
          return cleaned.trim();
        })
        .filter((tag) => tag.length > 0); // Remove empty tags

      return tags;
    } catch (error: any) {
      lastError = error;
      // Check for 503/429 errors in various formats
      const isOverloaded =
        error?.status === 503 ||
        error?.status === 429 ||
        error?.code === 503 ||
        error?.code === 429 ||
        error?.error?.code === 503 ||
        error?.error?.code === 429 ||
        error?.message?.includes("overloaded") ||
        error?.message?.includes("503") ||
        error?.error?.message?.includes("overloaded");

      // If it's a 503 (overloaded) or 429 (rate limit), retry with exponential backoff
      if (isOverloaded && attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        console.warn(
          `API overloaded, retrying in ${delay}ms... (attempt ${
            attempt + 1
          }/${maxRetries})`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      // If it's not a retryable error or we've exhausted retries, return empty
      console.error("Error generating tags:", error);
      return [];
    }
  }

  console.error("Error generating tags after retries:", lastError);
  return [];
};

export const chatWithAI = async (
  appName: string,
  chatHistory: { role: string; parts: { text: string }[] }[],
  newMessage: string
) => {
  // Build context from chat history
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

  const prompt = `You are an expert mobile app analyst. Answer questions about "${appName}" concisely and intelligently.

IMPORTANT: Keep responses SHORT (2-4 sentences max). Be direct, insightful, and actionable. No fluff or long explanations.

${
  historyContext ? `Previous conversation:\n${historyContext}\n\n` : ""
}User question: "${newMessage}"

Provide a brief, smart answer. Focus on key insights, not lengthy explanations.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        maxOutputTokens: 300, // Limit response length
        temperature: 0.7,
        tools: [{ googleSearch: {} }],
      },
    });

    // Handle response - check multiple possible structures
    let text = "";
    const responseAny = response as any;

    // Try direct text property first (most common)
    if (responseAny?.text && typeof responseAny.text === "string") {
      text = responseAny.text;
    }
    // Try candidates structure (standard Gemini API format)
    else if (responseAny?.candidates?.[0]?.content?.parts?.[0]?.text) {
      text = String(responseAny.candidates[0].content.parts[0].text);
    }
    // Try content.parts structure
    else if (responseAny?.content?.parts?.[0]?.text) {
      text = String(responseAny.content.parts[0].text);
    }
    // If it's already a string
    else if (typeof response === "string") {
      text = response;
    }
    // Log for debugging and try to extract
    else {
      console.error("Unexpected response structure:", response);
      // Try to extract text from any nested structure
      try {
        const responseStr = JSON.stringify(response);
        const textMatch = responseStr.match(
          /"text"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/
        );
        if (textMatch && textMatch[1]) {
          text = textMatch[1].replace(/\\"/g, '"').replace(/\\n/g, "\n");
        }
      } catch (e) {
        console.error("Could not extract text from response:", e);
      }
    }

    // Validate we have text
    if (!text || typeof text !== "string" || text.length === 0) {
      console.error("Invalid text response. Response object:", response);
      return "Sorry, I couldn't get a valid response. Please try rephrasing your question.";
    }

    text = text.trim();

    // If response is too long, truncate intelligently
    if (text.length > 400) {
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
      text = sentences.slice(0, 3).join(" ").trim();
      if (text.length > 400) {
        text = text.substring(0, 397) + "...";
      }
    }

    return text || "Sorry, I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Error in chat:", error);
    return "Sorry, I encountered an error. Please try again.";
  }
};

const competitiveIntelligenceSchema = {
  type: Type.OBJECT,
  properties: {
    strengths: {
      type: Type.OBJECT,
      properties: {
        items: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description:
            "Top 5-7 things this app does well, based on positive reviews. Be specific and actionable.",
        },
        score: {
          type: Type.NUMBER,
          description:
            "Overall strength score (0-100) based on positive sentiment and feature quality.",
        },
        summary: {
          type: Type.STRING,
          description: "A 2-3 sentence summary of the app's key strengths.",
        },
      },
      required: ["items", "score", "summary"],
    },
    weaknesses: {
      type: Type.OBJECT,
      properties: {
        items: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description:
            "Top 5-7 critical weaknesses or pain points, based on negative reviews. Be specific and actionable.",
        },
        score: {
          type: Type.NUMBER,
          description:
            "Weakness score (0-100, where lower is worse). Calculate based on severity and frequency of complaints.",
        },
        summary: {
          type: Type.STRING,
          description: "A 2-3 sentence summary of the app's main weaknesses.",
        },
      },
      required: ["items", "score", "summary"],
    },
    howToBeatThem: {
      type: Type.OBJECT,
      properties: {
        conversionHacks: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              action: {
                type: Type.STRING,
                description:
                  "Specific conversion hack (e.g., 'Remove paywall from core feature', 'Add free trial', 'Simplify signup to 2 steps').",
              },
              theirWeakness: {
                type: Type.STRING,
                description:
                  "What conversion problem they have (e.g., 'Users drop off at paywall', 'Signup is too long', 'No free trial').",
              },
              whatToBuild: {
                type: Type.STRING,
                description:
                  "EXACT implementation (e.g., 'Remove paywall from first 3 features, show premium upsell after user completes first action').",
              },
              whyItWorks: {
                type: Type.STRING,
                description:
                  "Why this beats them (e.g., 'Their #1 complaint is aggressive paywall, this converts 3x better').",
              },
            },
            required: ["action", "theirWeakness", "whatToBuild", "whyItWorks"],
          },
          description:
            "3-5 conversion hacks - how to convert users better than them (onboarding, pricing, paywall strategy).",
        },
        retentionHacks: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              action: {
                type: Type.STRING,
                description:
                  "Specific retention hack (e.g., 'Add daily streak notifications', 'Build habit-forming feature', 'Create engagement loop').",
              },
              theirWeakness: {
                type: Type.STRING,
                description:
                  "What retention problem they have (e.g., 'Users forget to use app', 'No daily engagement', 'Features don't create habits').",
              },
              whatToBuild: {
                type: Type.STRING,
                description:
                  "EXACT implementation (e.g., 'Push notification at 9am daily: \"Your streak is 5 days! Tap to continue\" with one-tap action').",
              },
              whyItWorks: {
                type: Type.STRING,
                description:
                  "Why this beats them (e.g., 'Users complain about forgetting to use app, this creates daily habit').",
              },
            },
            required: ["action", "theirWeakness", "whatToBuild", "whyItWorks"],
          },
          description:
            "3-5 retention hacks - how to keep users better than them (features that drive daily use, engagement loops).",
        },
        discoveryHacks: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              action: {
                type: Type.STRING,
                description:
                  "Specific discovery/ASO hack (e.g., 'Target keyword they don't rank for', 'Optimize for high-volume search', 'Add keyword to title').",
              },
              opportunity: {
                type: Type.STRING,
                description:
                  "What discovery opportunity exists (e.g., 'They don't rank for \"free productivity\" keyword with 50k monthly searches').",
              },
              whatToBuild: {
                type: Type.STRING,
                description:
                  "EXACT ASO action (e.g., 'Add \"free productivity\" to app title (first 30 chars), include in first 100 chars of description, add to keyword field').",
              },
              whyItWorks: {
                type: Type.STRING,
                description:
                  "Why this beats them (e.g., 'Users search for this but can't find them, you'll capture that traffic').",
              },
            },
            required: ["action", "opportunity", "whatToBuild", "whyItWorks"],
          },
          description:
            "3-5 discovery hacks - how to get found better than them (keywords, ASO, positioning gaps).",
        },
        trustHacks: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              action: {
                type: Type.STRING,
                description:
                  "Specific trust hack (e.g., 'Add 24-hour support response', 'Show user testimonials', 'Transparent pricing page').",
              },
              theirWeakness: {
                type: Type.STRING,
                description:
                  "What trust problem they have (e.g., 'No customer support', 'Hidden pricing', 'Users don't trust them').",
              },
              whatToBuild: {
                type: Type.STRING,
                description:
                  "EXACT implementation (e.g., 'In-app chat support with \"Average response: 2 hours\" badge, visible on every screen').",
              },
              whyItWorks: {
                type: Type.STRING,
                description:
                  "Why this beats them (e.g., 'Their #1 complaint is no support, this builds immediate trust').",
              },
            },
            required: ["action", "theirWeakness", "whatToBuild", "whyItWorks"],
          },
          description:
            "3-5 trust hacks - how to build trust faster than them (support, transparency, social proof).",
        },
        monetizationHacks: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              action: {
                type: Type.STRING,
                description:
                  "Specific monetization hack (e.g., 'Offer freemium tier', 'Transparent pricing', 'One-time purchase option').",
              },
              theirWeakness: {
                type: Type.STRING,
                description:
                  "What monetization problem they have (e.g., 'Users hate subscription model', 'Pricing is opaque', 'Too expensive').",
              },
              whatToBuild: {
                type: Type.STRING,
                description:
                  "EXACT pricing model (e.g., 'Free tier: Core features forever. Premium: $9.99/month or $79.99 lifetime. Show pricing on homepage').",
              },
              whyItWorks: {
                type: Type.STRING,
                description:
                  "Why this beats them (e.g., 'Their biggest complaint is subscription-only, freemium captures 10x more users').",
              },
            },
            required: ["action", "theirWeakness", "whatToBuild", "whyItWorks"],
          },
          description:
            "3-5 monetization hacks - how to monetize better than them (pricing model, value proposition, payment friction).",
        },
        quickWins: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              action: {
                type: Type.STRING,
                description:
                  "A specific, actionable move (e.g., 'Add dark mode', 'Fix checkout flow', 'Remove paywall from X feature'). Be concrete and specific.",
              },
              impact: {
                type: Type.STRING,
                description:
                  "Why this will help beat the competitor (e.g., 'Solves their #1 complaint', 'Addresses 40% of negative reviews').",
              },
              effort: {
                type: Type.STRING,
                enum: ["low", "medium", "high"],
                description: "Estimated implementation effort.",
              },
              whatToBuild: {
                type: Type.STRING,
                description:
                  "Exact implementation steps (e.g., 'Add dark mode toggle in settings menu, use #1A1A1A background, #FFFFFF text').",
              },
            },
            required: ["action", "impact", "effort", "whatToBuild"],
          },
          description:
            "3-5 quick wins - easy fixes that have high impact on beating the competitor.",
        },
      },
      required: [
        "conversionHacks",
        "retentionHacks",
        "discoveryHacks",
        "trustHacks",
        "monetizationHacks",
        "quickWins",
      ],
    },
    overallScore: {
      type: Type.NUMBER,
      description:
        "Overall competitive health score (0-100) based on strengths, weaknesses, and market position. Higher is better.",
    },
  },
  required: ["strengths", "weaknesses", "howToBeatThem", "overallScore"],
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
  const reviewsText = reviews
    .map(
      (r) => `Rating: ${r.rating}/5\nTitle: ${r.title}\nReview: ${r.content}`
    )
    .join("\n---\n");

  // Build comprehensive context
  let context = `App: "${appName}"\n\nUser Reviews:\n${reviewsText}`;

  if (appMetadata) {
    context += `\n\nApp Metadata:\n`;
    if (appMetadata.description) {
      context += `Description: ${appMetadata.description.substring(0, 500)}\n`;
    }
    if (appMetadata.formattedPrice) {
      context += `Price: ${appMetadata.formattedPrice}\n`;
    }
    if (appMetadata.primaryGenreName) {
      context += `Category: ${appMetadata.primaryGenreName}\n`;
    }
    if (appMetadata.screenshots && appMetadata.screenshots.length > 0) {
      context += `Screenshots: ${appMetadata.screenshots.length} screenshots available for design analysis\n`;
    }
  }

  const prompt = `
    You are a competitive intelligence analyst helping app developers BUILD A BETTER APP than their competitors.
    
    ${context}
    
    CRITICAL: You MUST provide 3-5 items for EACH of the 6 categories below. Every category must have content. This is non-negotiable.
    
    IMPORTANT: Frame everything as advice for the USER to build THEIR app better. This is NOT feedback for the competitor - it's a blueprint for the user to beat them.
    
    Your goal: Give users SPECIFIC, ACTIONABLE HACKS to build a better app than this competitor:
    
    1. CONVERSION HACKS (3-5 items): How YOUR app can convert users better than them
       - Analyze their onboarding, pricing, paywall strategy weaknesses
       - Example: "In YOUR app, remove paywall from first 3 features → Their #1 complaint is aggressive paywall, YOUR app will convert 3x better"
       - For each: action (what to build in YOUR app), theirWeakness (their problem), whatToBuild (EXACT implementation for YOUR app), whyItWorks (why YOUR app beats them)
    
    2. RETENTION HACKS (3-5 items): How YOUR app can keep users better than them
       - Analyze what makes users come back daily vs. forget the app
       - Example: "In YOUR app, add daily streak notifications at 9am → Users complain about forgetting to use their app, YOUR app will create daily habits"
       - For each: action (what to build in YOUR app), theirWeakness (their problem), whatToBuild (EXACT implementation for YOUR app), whyItWorks (why YOUR app beats them)
    
    3. DISCOVERY HACKS (3-5 items): How YOUR app can get found better than them
       - Analyze keywords they don't rank for, ASO gaps, positioning opportunities
       - Example: "In YOUR app, target 'free productivity' keyword → They don't rank for this 50k monthly search term, YOUR app will capture that traffic"
       - For each: action (what to do in YOUR app), opportunity (what they're missing), whatToBuild (EXACT ASO steps for YOUR app), whyItWorks (why YOUR app beats them)
    
    4. TRUST HACKS (3-5 items): How YOUR app can build trust faster than them
       - Analyze support, transparency, social proof weaknesses
       - Example: "In YOUR app, add 24-hour support response badge → Their #1 complaint is no support, YOUR app will build immediate trust"
       - For each: action (what to build in YOUR app), theirWeakness (their problem), whatToBuild (EXACT implementation for YOUR app), whyItWorks (why YOUR app beats them)
    
    5. MONETIZATION HACKS (3-5 items): How YOUR app can monetize better than them
       - Analyze pricing model, value proposition, payment friction
       - Example: "In YOUR app, offer freemium tier → Their biggest complaint is subscription-only, YOUR freemium model will capture 10x more users"
       - For each: action (what to build in YOUR app), theirWeakness (their problem), whatToBuild (EXACT pricing model for YOUR app), whyItWorks (why YOUR app beats them)
    
    6. QUICK WINS (3-5 items): Easy fixes for YOUR app with high impact
       - Low-effort changes that solve their biggest problems
       - For each: action (what to build in YOUR app), impact (why this beats them), effort (low/medium/high), whatToBuild (EXACT steps for YOUR app)
    
    Be EXTREMELY specific. Don't say "improve onboarding" - say "In YOUR app, reduce signup to 2 steps: email + password, skip name/phone → Their signup is 5 steps, users drop off at step 3, YOUR simpler flow will convert better".
    
    CRITICAL: Generate 3-5 items for EVERY category. Frame everything as "In YOUR app, build X" not "They should fix X". This is a blueprint for the user to build a superior product.
  `;

  const maxRetries = 3;
  let lastError: any = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: competitiveIntelligenceSchema,
          thinkingConfig: { thinkingBudget: 32768 },
        },
      });

      const jsonText = response.text.trim();
      return JSON.parse(jsonText);
    } catch (error: any) {
      lastError = error;
      const isOverloaded =
        error?.status === 503 ||
        error?.status === 429 ||
        error?.code === 503 ||
        error?.code === 429 ||
        error?.error?.code === 503 ||
        error?.error?.code === 429 ||
        error?.message?.includes("overloaded") ||
        error?.message?.includes("503") ||
        error?.error?.message?.includes("overloaded");

      if (isOverloaded && attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(
          `API overloaded, retrying competitive intelligence in ${delay}ms... (attempt ${
            attempt + 1
          }/${maxRetries})`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      console.error("Error analyzing competitive intelligence:", error);
      throw new Error(
        isOverloaded
          ? "AI service is temporarily overloaded. Please try again in a few moments."
          : "Failed to get competitive intelligence from AI. Please check the console for details."
      );
    }
  }

  throw new Error(
    lastError?.message?.includes("overloaded")
      ? "AI service is temporarily overloaded. Please try again in a few moments."
      : "Failed to get competitive intelligence from AI after multiple attempts. Please try again later."
  );
};
