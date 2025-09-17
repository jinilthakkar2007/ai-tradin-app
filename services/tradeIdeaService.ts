import { ASSET_SYMBOLS } from '../constants';
import { TradeDirection } from '../types';

export interface TradeIdea {
  asset: string;
  direction: TradeDirection;
  entryPrice: number;
  suggestion: string;
}

type IdeaListener = (idea: TradeIdea) => void;

let listener: IdeaListener | null = null;
let intervalId: number | null = null;

const ideas = [
  "is showing strong bullish divergence on the 4H chart.",
  "is approaching a key resistance level, indicating a potential reversal.",
  "has broken out of a consolidation pattern with high volume.",
  "is forming a golden cross on the daily chart, a strong bullish signal.",
  "is testing a long-term support level, offering a good risk/reward entry.",
];

const generateRandomIdea = (): TradeIdea => {
    const asset = ASSET_SYMBOLS[Math.floor(Math.random() * ASSET_SYMBOLS.length)];
    const direction: TradeDirection = Math.random() > 0.5 ? 'LONG' : 'SHORT';
    // Mock a realistic price for the asset type
    const price = asset.includes('/') ? parseFloat((Math.random() * 80000).toFixed(2)) : parseFloat((Math.random() * 500 + 50).toFixed(2));
    const suggestion = `${asset} ${ideas[Math.floor(Math.random() * ideas.length)]} Consider a ${direction} position.`;
    
    return { asset, direction, entryPrice: price, suggestion };
};

export const tradeIdeaService = {
  subscribe: (callback: IdeaListener) => {
    listener = callback;
    // For demo, immediately send an idea, then send more periodically
    setTimeout(() => {
        if (listener) listener(generateRandomIdea());
    }, 1500);

    if (intervalId) clearInterval(intervalId);
    intervalId = window.setInterval(() => {
      if (listener) {
        listener(generateRandomIdea());
      }
    }, 30000); // New idea every 30 seconds
  },
  unsubscribe: () => {
    listener = null;
    if (intervalId) clearInterval(intervalId);
    intervalId = null;
  }
};
