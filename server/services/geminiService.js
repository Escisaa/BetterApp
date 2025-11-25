import { GoogleGenAI, Type } from "@google/genai";

// Lazy initialization - only check API key when actually needed
let ai = null;

function getAI() {
  if (!ai) {
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable not set");
    }
    ai = new GoogleGenAI({ apiKey: API_KEY });
  }
  return ai;
}

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

export async function analyzeReviewsWithAI(appName, reviews) {
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

  const prompt = `You are an expert mobile app analyst. Answer questions about "${appName}" concisely and intelligently.

IMPORTANT: Keep responses SHORT (2-4 sentences max). Be direct, insightful, and actionable. No fluff or long explanations.

${
  historyContext ? `Previous conversation:\n${historyContext}\n\n` : ""
}User question: "${newMessage}"

Provide a brief, smart answer. Focus on key insights, not lengthy explanations.`;

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
