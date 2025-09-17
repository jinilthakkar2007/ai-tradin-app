import { NewsArticle } from '../types';
import { ASSET_SYMBOLS, MOCK_NEWS_CONFIG } from '../constants';

type NewsListener = (article: NewsArticle) => void;

class MarketNewsService {
  private listener: NewsListener | null = null;
  private intervalId: number | null = null;

  private generateRandomNews(): NewsArticle {
    const asset = ASSET_SYMBOLS[Math.floor(Math.random() * ASSET_SYMBOLS.length)];
    const headlineConfig = MOCK_NEWS_CONFIG.headlines[Math.floor(Math.random() * MOCK_NEWS_CONFIG.headlines.length)];
    const source = MOCK_NEWS_CONFIG.sources[Math.floor(Math.random() * MOCK_NEWS_CONFIG.sources.length)];

    return {
      id: `news-${Date.now()}`,
      timestamp: new Date().toISOString(),
      headline: headlineConfig.template.replace('{{asset}}', asset),
      summary: headlineConfig.summary.replace('{{asset}}', asset),
      source,
      symbols: [asset],
    };
  }

  public subscribe(callback: NewsListener): void {
    this.listener = callback;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    // Start sending news after a short delay
    setTimeout(() => {
        if (this.listener) this.listener(this.generateRandomNews());
    }, 2000);

    this.intervalId = window.setInterval(() => {
      if (this.listener) {
        this.listener(this.generateRandomNews());
      }
    }, 12000); // New article every 12 seconds
  }

  public unsubscribe(): void {
    this.listener = null;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const marketNewsService = new MarketNewsService();
