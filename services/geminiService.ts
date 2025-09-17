import { GoogleGenAI, Type } from "@google/genai";
import { Trade, OrderBookData } from "./types";

// Always use new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates AI commentary for a closed trade.
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
    // Correct API call as per guidelines
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 150,
      },
    });

    // Correct way to extract text, now with a safety check
    const text = response.text;
    return text ? text.trim() : "Could not generate AI commentary at this time.";
  } catch (error) {
    console.error("Error fetching AI commentary:", error);
    return "Could not generate AI commentary at this time.";
  }
};

/**
 * Analyzes a user's natural language query to provide market analysis or a trade setup.
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
    // The response is a JSON string, parse it.
    const result = JSON.parse(jsonText.trim());
    result.analysis += "\n\n**Disclaimer:** This is AI-generated analysis and not financial advice.";
    return result;

  } catch (error) {
    console.error("Error fetching AI trade analysis:", error);
    return null;
  }
};

/**
 * Generates AI analysis of an order book.
 */
export const getAIOrderBookAnalysis = async (asset: string, orderBook: OrderBookData): Promise<string> => {
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
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.5,
        maxOutputTokens: 50,
      },
    });

    const text = response.text;
    return text ? text.trim() : "Could not generate AI analysis at this time.";
  } catch (error) {
    console.error("Error fetching AI order book analysis:", error);
    return "Could not generate AI analysis at this time.";
  }
};