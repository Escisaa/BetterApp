import { GoogleGenAI, Type } from "@google/genai";

// Lazy initialization - only check API key when actually needed
let ai = null;

function getAI() {
  if (!ai) {
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      const envKeys = Object.keys(process.env).filter(
        (k) => k.includes("GEMINI") || k.includes("API") || k.includes("KEY")
      );
      console.error("❌ GEMINI_API_KEY not found in environment variables");
      console.error(
        "🔍 Available env vars containing 'GEMINI', 'API', or 'KEY':",
        envKeys
      );
      console.error(
        "💡 Make sure GEMINI_API_KEY is set in Render environment variables"
      );
      throw new Error(
        "GEMINI_API_KEY environment variable not set. Please check Render environment variables and restart the service."
      );
    }
    // Validate API key format (starts with AIza)
    if (!API_KEY.startsWith("AIza")) {
      console.warn(
        "⚠️  GEMINI_API_KEY format looks incorrect (should start with 'AIza')"
      );
    }
    ai = new GoogleGenAI({ apiKey: API_KEY });
    console.log("✅ Gemini AI initialized successfully");
  }
  return ai;
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

  // Calculate review stats for context
  const totalReviews = reviews.length;
  const avgRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
  const positiveReviews = reviews.filter((r) => r.rating >= 4).length;
  const negativeReviews = reviews.filter((r) => r.rating <= 2).length;

  const prompt = `
    You are a SENIOR COMPETITIVE INTELLIGENCE ANALYST at a top-tier mobile app consultancy. You're known for finding insights others miss.
    
    Your task: Analyze user reviews for "${appName}" and deliver ACTIONABLE INTELLIGENCE that helps someone build a BETTER competing app.
    
    REVIEW STATS:
    - Total reviews analyzed: ${totalReviews}
    - Average rating: ${avgRating.toFixed(1)}/5
    - Positive reviews (4-5 stars): ${positiveReviews} (${Math.round(
    (positiveReviews / totalReviews) * 100
  )}%)
    - Negative reviews (1-2 stars): ${negativeReviews} (${Math.round(
    (negativeReviews / totalReviews) * 100
  )}%)
    
    USER REVIEWS:
    ${reviewsText}
    
    ANALYSIS REQUIREMENTS:
    1. Be SPECIFIC - Quote or paraphrase actual reviews. Don't be generic.
    2. Be ACTIONABLE - Every insight should help build a better competing app.
    3. Be QUANTITATIVE - Use numbers and percentages when possible.
    4. Be CONTRARIAN - Find insights others would miss.
    5. Think like a FOUNDER - What would make YOU switch to a competitor?
    
    Focus on finding the GAPS and OPPORTUNITIES. What are users begging for that this app doesn't provide?
  `;

  const maxRetries = 3;
  let lastError = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await getAI().models.generateContent({
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
    } catch (error) {
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
          `API overloaded, retrying in ${delay}ms... (attempt ${
            attempt + 1
          }/${maxRetries})`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      console.error("Error analyzing reviews with AI:", error);
      throw new Error(
        isOverloaded
          ? "AI service is temporarily overloaded. Please try again in a few moments."
          : "Failed to get analysis from AI. Please check the console for details."
      );
    }
  }

  throw new Error(
    lastError?.message?.includes("overloaded")
      ? "AI service is temporarily overloaded. Please try again in a few moments."
      : "Failed to get analysis from AI after multiple attempts. Please try again later."
  );
}

export async function generateTagsWithAI(appName, reviews) {
  const reviewsText = reviews
    .map(
      (r) => `Rating: ${r.rating}/5\nTitle: ${r.title}\nReview: ${r.content}`
    )
    .join("\n---\n");

  const prompt = `You are an expert at analyzing app reviews and extracting key themes and tags.

Analyze the following reviews for "${appName}" and generate 5-8 concise, relevant tags that summarize the main themes, features, or topics mentioned in the reviews.

Reviews:
${reviewsText}

Return ONLY a JSON array of tag strings, nothing else. Each tag should be 1-3 words max, be specific and actionable. Example: ["User Experience", "Performance Issues", "Feature Requests", "Design", "Bugs", "Pricing", "Customer Support", "Mobile Optimization"]

Tags:`;

  try {
    const response = await getAI().models.generateContent({
      model: "gemini-flash-lite-latest",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const text = response.text.trim();
    // Try to parse as JSON array
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      // If it's an object with a tags property
      if (parsed.tags && Array.isArray(parsed.tags)) {
        return parsed.tags;
      }
    } catch (e) {
      // If not JSON, try to extract tags from text
      const lines = text.split("\n").filter((line) => line.trim().length > 0);
      const tags = lines
        .map((line) => {
          // Remove numbering, bullets, quotes
          return line
            .replace(/^\d+\.\s*/, "")
            .replace(/^[-*]\s*/, "")
            .replace(/^["']|["']$/g, "")
            .trim();
        })
        .filter((tag) => tag.length > 0 && tag.length < 50);
      if (tags.length > 0) {
        return tags.slice(0, 8);
      }
    }

    // Fallback: return empty array
    return [];
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

  const prompt = `You are a knowledgeable AI assistant helping users understand and analyze mobile apps.

Context: The user is analyzing the app "${appName}".

Your capabilities:
- Answer ANY question about this app or mobile apps in general
- Provide insights about features, competitors, market positioning, user experience
- Help with app store optimization (ASO), marketing strategies, monetization
- Discuss technical aspects, design patterns, user feedback analysis
- Compare apps, suggest improvements, explain app store dynamics

RESPONSE STYLE:
- Be helpful, accurate, and conversational
- Keep responses concise (2-4 sentences for simple questions, more for complex ones)
- If you don't know something specific, be honest but offer related insights
- Use your knowledge to provide useful context and suggestions

${
  historyContext ? `Previous conversation:\n${historyContext}\n\n` : ""
}User: "${newMessage}"

Respond naturally and helpfully:`;

  try {
    const response = await getAI().models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        maxOutputTokens: 300,
        temperature: 0.7,
        tools: [{ googleSearch: {} }],
      },
    });

    let text = "";
    const responseAny = response;

    if (responseAny?.text && typeof responseAny.text === "string") {
      text = responseAny.text;
    } else if (responseAny?.candidates?.[0]?.content?.parts?.[0]?.text) {
      text = String(responseAny.candidates[0].content.parts[0].text);
    } else if (responseAny?.content?.parts?.[0]?.text) {
      text = String(responseAny.content.parts[0].text);
    } else if (typeof response === "string") {
      text = response;
    } else {
      console.error("Unexpected response structure:", response);
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

    if (!text || typeof text !== "string" || text.length === 0) {
      console.error("Invalid text response. Response object:", response);
      return "Sorry, I couldn't get a valid response. Please try rephrasing your question.";
    }

    text = text.trim();

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
}

// Competitive Intelligence schema and function (simplified - full version in original)
export async function analyzeCompetitiveIntelligence(
  appName,
  reviews,
  appMetadata
) {
  const reviewsText = reviews
    .map(
      (r) => `Rating: ${r.rating}/5\nTitle: ${r.title}\nReview: ${r.content}`
    )
    .join("\n---\n");

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
          monetizationHacks: {
            type: Type.ARRAY,
            items: { type: Type.OBJECT },
          },
          quickWins: { type: Type.ARRAY, items: { type: Type.OBJECT } },
        },
      },
      overallScore: { type: Type.NUMBER },
    },
  };

  const prompt = `
    You are a competitive intelligence analyst helping app developers BUILD A BETTER APP than their competitors.
    
    ${context}
    
    CRITICAL: You MUST provide 3-5 items for EACH of the 6 categories below. Every category must have content. This is non-negotiable.
    
    IMPORTANT: Frame everything as advice for the USER to build THEIR app better. This is NOT feedback for the competitor - it's a blueprint for the user to beat them.
    
    Your goal: Give users SPECIFIC, ACTIONABLE HACKS to build a better app than this competitor:
    
    1. CONVERSION HACKS (3-5 items): How YOUR app can convert users better than them
    2. RETENTION HACKS (3-5 items): How YOUR app can keep users better than them
    3. DISCOVERY HACKS (3-5 items): How YOUR app can get found better than them
    4. TRUST HACKS (3-5 items): How YOUR app can build trust faster than them
    5. MONETIZATION HACKS (3-5 items): How YOUR app can monetize better than them
    6. QUICK WINS (3-5 items): Easy fixes for YOUR app with high impact
    
    Be EXTREMELY specific. Don't say "improve onboarding" - say "In YOUR app, reduce signup to 2 steps: email + password, skip name/phone → Their signup is 5 steps, users drop off at step 3, YOUR simpler flow will convert better".
    
    CRITICAL: Generate 3-5 items for EVERY category. Frame everything as "In YOUR app, build X" not "They should fix X". This is a blueprint for the user to build a superior product.
  `;

  const maxRetries = 3;
  let lastError = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await getAI().models.generateContent({
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
    } catch (error) {
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
}
