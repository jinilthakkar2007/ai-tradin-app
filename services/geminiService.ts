import { GoogleGenAI, Type } from "@google/genai";
import { Trade, OrderBookData, UserStats, Prices, TradeActionSuggestion } from "./types";
import { MOCK_SENTIMENT_HEADLINES } from "../constants";

// Always use new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates AI commentary for a closed trade.
 * @throws Will throw an error if the API call fails.
 */
export const getAICommentary = async (trade: Trade): Promise<string> => {
  if (!trade.closePrice || !trade.closeDate) {
    return "AI commentary is only available for closed trades.";
  }

  const isWin =
    (trade.direction === "LONG" && trade.closePrice > trade.entryPrice) ||
    (trade.direction === "SHORT" && trade.closePrice < trade.entryPrice);

  const outcome =
    trade.status === "CLOSED_TP"
      ? "hit a take profit level"
      : "hit the stop loss";

  const prompt = `
    Analyze the following closed trade and provide a brief, insightful commentary (2-3 sentences) for a trader.
    The tone should be educational and encouraging.
    
    Trade Details:
    - Asset: ${trade.asset}
    - Direction: ${trade.direction}
    - Entry Price: ${trade.entryPrice}
    - Close Price: ${trade.closePrice}
    - Outcome: The trade ${outcome}. It was a ${isWin ? "win" : "loss"}.
    - Risk Percentage: ${trade.riskPercentage}%

    Commentary Guidelines:
    - Start with a success (✅) or loss (❌) emoji.
    - If it was a win, comment on the good execution.
    - If it was a loss, comment on how the stop loss protected capital.
    - Mention one potential learning point or observation.
    - Keep it concise.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 150,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Received an empty response from the AI service.");
    }
    return text.trim();
  } catch (error) {
    console.error("Error fetching AI commentary:", error);
    throw new Error("Failed to generate AI commentary. The AI service may be temporarily unavailable.");
  }
};

/**
 * Analyzes a user's natural language query to provide market analysis or a trade setup.
 * @throws Will throw an error if the API call fails.
 */
export const getAITradeAnalysis = async (query: string) => {
  const prompt = `You are a trading assistant AI. Analyze the user's request and provide either a general market analysis or a specific trade setup.

  User query: "${query}"
  
  Your task:
  1. Determine if the user is asking for a general analysis of an asset (e.g., "analyze BTC", "what's the outlook for TSLA?") or a specific trade setup (e.g., "long ETH", "short NVDA").
  2. If it's a general analysis, provide a brief, neutral overview covering potential bullish and bearish scenarios. Do NOT provide a trade setup.
  3. If it's a trade setup request, use the provided schema to generate a plausible LONG or SHORT setup. The prices should be realistic but are for simulation purposes.
  4. Always include a disclaimer that this is not financial advice.
  
  Here are some example asset prices for context, do not use them directly, just for scale:
  - BTC/USD: 68,000
  - ETH/USD: 3,700
  - TSLA: 180
  - AAPL: 190
  - NVDA: 120
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      analysis: {
        type: Type.STRING,
        description:
          "The text analysis of the asset. Should always be present.",
      },
      setup: {
        type: Type.OBJECT,
        nullable: true,
        description: "The proposed trade setup, if applicable.",
        properties: {
          asset: { type: Type.STRING },
          direction: { type: Type.STRING, enum: ["LONG", "SHORT"] },
          entryPrice: { type: Type.NUMBER },
          stopLoss: { type: Type.NUMBER },
          takeProfits: {
            type: Type.ARRAY,
            items: { type: Type.NUMBER },
          },
        },
      },
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
        throw new Error("Received empty response from AI for trade analysis.");
    }
    const result = JSON.parse(jsonText.trim());
    result.analysis += "\n\n**Disclaimer:** This is AI-generated analysis and not financial advice.";
    return result;

  } catch (error) {
    console.error("Error fetching AI trade analysis:", error);
    throw new Error("Failed to process your request with the AI service. Please try again.");
  }
};

// --- Rate limiting for getAIOrderBookAnalysis ---
let lastOrderBookAnalysisTimestamp = 0;
let isFetchingOrderBookAnalysis = false;
const ORDER_BOOK_ANALYSIS_COOLDOWN_MS = 12000;

type OrderBookAnalysisResult = 
  | { success: true; message: string }
  | { success: false; message: string; isCooldown: boolean };


/**
 * Generates AI analysis of an order book, with client-side rate limiting and a concurrency lock.
 * Returns a structured object indicating success or failure.
 */
export const getAIOrderBookAnalysis = async (asset: string, orderBook: OrderBookData): Promise<OrderBookAnalysisResult> => {
  if (isFetchingOrderBookAnalysis) {
    console.warn("AI Order Book Analysis request blocked due to an ongoing request.");
    return { success: false, message: "An analysis is already in progress. Please wait a moment.", isCooldown: true };
  }

  const now = Date.now();
  if (now - lastOrderBookAnalysisTimestamp < ORDER_BOOK_ANALYSIS_COOLDOWN_MS) {
    const timeLeft = Math.ceil((ORDER_BOOK_ANALYSIS_COOLDOWN_MS - (now - lastOrderBookAnalysisTimestamp)) / 1000);
    console.warn(`AI Order Book Analysis request throttled. Please wait ${timeLeft}s.`);
    return { success: false, message: `To prevent rate-limiting, please wait ${timeLeft} more seconds before requesting another analysis.`, isCooldown: true };
  }

  const totalBidVolume = orderBook.bids.reduce((sum, bid) => sum + bid.quantity, 0);
  const totalAskVolume = orderBook.asks.reduce((sum, ask) => sum + ask.quantity, 0);

  const prompt = `
    Analyze the following order book data for ${asset} and provide a one-sentence summary of the immediate market sentiment.
    - Total Bid Volume (demand): ${totalBidVolume.toFixed(2)}
    - Total Ask Volume (supply): ${totalAskVolume.toFixed(2)}
    - Highest Bid Price: ${orderBook.bids[0]?.price}
    - Lowest Ask Price: ${orderBook.asks[0]?.price}

    Based on this data, is the pressure more bullish (demand > supply) or bearish (supply > demand)? Keep it very brief.
    Example: "Slight bullish pressure is visible with more volume on the buy-side."
    Example: "Bearish sentiment is present, indicated by a larger volume of sell orders."
  `;

  try {
    isFetchingOrderBookAnalysis = true;
    lastOrderBookAnalysisTimestamp = Date.now();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.5,
        maxOutputTokens: 50,
      },
    });

    const text = response.text;
    return { success: true, message: text ? text.trim() : "Could not generate AI analysis at this time." };
  } catch (error) {
    console.error("Error fetching AI order book analysis:", error);
    return { success: false, message: "Could not generate AI analysis due to an API error.", isCooldown: false };
  } finally {
    isFetchingOrderBookAnalysis = false;
  }
};

// --- AI Co-Pilot Services ---

export const getMarketSentiment = async (): Promise<{ sentiment: 'Bullish' | 'Neutral' | 'Bearish'; summary: string }> => {
  const prompt = `
    Analyze these simulated market headlines and determine the overall sentiment: Bullish, Neutral, or Bearish. 
    Provide a 2-sentence summary explaining your reasoning.
    
    Headlines:
    - ${MOCK_SENTIMENT_HEADLINES.join("\n- ")}
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      sentiment: { type: Type.STRING, enum: ['Bullish', 'Neutral', 'Bearish'] },
      summary: { type: Type.STRING },
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });
    const jsonText = response.text;
    return JSON.parse(jsonText.trim());
  } catch (error) {
    console.error("Error fetching market sentiment:", error);
    throw new Error("Failed to fetch market sentiment.");
  }
};

export const getPersonalizedTradeIdeas = async (stats: UserStats, activeTrades: Trade[]): Promise<{ asset: string, direction: 'LONG' | 'SHORT', confidence: number, rationale: string }[]> => {
    const preferredAssets = Array.from(new Set(activeTrades.map(t => t.asset))).join(', ') || 'None';
    const prompt = `
        You are a trading co-pilot. Based on this trader's stats and the current (simulated) bullish market sentiment, generate 2 personalized and actionable trade ideas. 
        Trader's Stats:
        - Win Rate: ${stats.winRate}%
        - Total Trades: ${stats.totalTrades}
        - Currently trading: ${preferredAssets}
        
        For each idea, provide a confidence score from 60-95% and a concise rationale. Do not use markdown.
        Focus on assets the user is already trading if possible, otherwise suggest common assets like BTC/USD or NVDA.
    `;
    
    const responseSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                asset: { type: Type.STRING },
                direction: { type: Type.STRING, enum: ['LONG', 'SHORT'] },
                confidence: { type: Type.INTEGER },
                rationale: { type: Type.STRING },
            }
        }
    };
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });
        const jsonText = response.text;
        return JSON.parse(jsonText.trim());
    } catch (error) {
        console.error("Error fetching personalized trade ideas:", error);
        throw new Error("Failed to generate trade ideas.");
    }
};

export const getPortfolioAnalysis = async (activeTrades: Trade[]): Promise<{ score: number, analysis: string }> => {
    if (activeTrades.length === 0) {
        return { score: 10, analysis: "Your portfolio is clear! No active trades means no concentrated risk. Ready to look for the next opportunity." };
    }
    const prompt = `
        Analyze this trader's active portfolio. Calculate a 'Portfolio Health Score' from 1 to 10 (1=very poor, 10=excellent) based on diversification, risk concentration, and correlation. 
        Provide a 2-3 sentence summary with one key recommendation.
        
        Active Trades:
        ${JSON.stringify(activeTrades.map(t => ({ asset: t.asset, direction: t.direction, quantity: t.quantity, entry: t.entryPrice })))}
    `;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            score: { type: Type.INTEGER },
            analysis: { type: Type.STRING },
        }
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });
        const jsonText = response.text;
        return JSON.parse(jsonText.trim());
    } catch (error) {
        console.error("Error fetching portfolio analysis:", error);
        throw new Error("Failed to analyze portfolio.");
    }
};

export const getPerformanceTip = async (stats: UserStats): Promise<string> => {
    const prompt = `
        Analyze these user trading stats and provide a single, actionable tip to help them improve. Keep it under 25 words and start with an emoji.
        
        Stats:
        - Win Rate: ${stats.winRate}%
        - Profit Factor: ${stats.profitFactor}
        - Average Win: $${stats.avgWin}
        - Average Loss: $${stats.avgLoss}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
             config: { maxOutputTokens: 60 }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error fetching performance tip:", error);
        throw new Error("Failed to generate performance tip.");
    }
};

export const getTradeActionSuggestions = async (activeTrades: Trade[], prices: Prices): Promise<TradeActionSuggestion[]> => {
    if (activeTrades.length === 0) {
        return [];
    }

    const tradesWithContext = activeTrades.map(t => ({
        id: t.id,
        asset: t.asset,
        direction: t.direction,
        entryPrice: t.entryPrice,
        stopLoss: t.stopLoss,
        takeProfits: t.takeProfits,
        currentPrice: prices[t.asset] || t.entryPrice,
    }));

    const prompt = `
        You are a proactive trading co-pilot. Analyze the following portfolio of active trades given their current market prices. Identify trades that might require immediate attention and suggest a single, clear action for each.

        Your analysis should consider:
        1.  **Profit Taking**: If a trade has significant unrealized profit (e.g., over 70% of the way to its first take-profit) and might be near a reversal point (you can simulate this assumption), suggest closing it to secure gains.
        2.  **Risk Management**: If a trade is approaching its stop-loss (e.g., over 70% of the way there) and market momentum seems against it, suggest closing it early to mitigate losses.
        3.  **Capital Protection**: If a trade is in profit, suggest adjusting the stop-loss to the entry price (break-even) to eliminate risk.

        For each suggestion, you MUST provide:
        - \`tradeId\`: The ID of the trade.
        - \`action\`: One of 'CLOSE', 'ADJUST_SL'.
        - \`reasoning\`: A concise, user-friendly explanation for your suggestion.
        - \`suggestedPrice\` (ONLY for 'ADJUST_SL'): The new stop-loss price, which should be the trade's original entry price.

        Current active trades:
        ${JSON.stringify(tradesWithContext)}

        Return your response as a JSON array matching the provided schema. Only include trades that you have a high-confidence suggestion for. If no trades require action, return an empty array.
    `;

    const responseSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                tradeId: { type: Type.STRING },
                action: { type: Type.STRING, enum: ['CLOSE', 'ADJUST_SL'] },
                reasoning: { type: Type.STRING },
                suggestedPrice: { type: Type.NUMBER, nullable: true },
            }
        }
    };
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });
        const jsonText = response.text;
        return JSON.parse(jsonText.trim());
    } catch (error) {
        console.error("Error fetching trade action suggestions:", error);
        throw new Error("Failed to generate proactive suggestions.");
    }
};