import { MOCK_MARKET_DATA as initialMarketData } from '../constants';
import { MarketData } from '../types';

type UpdateListener = (updatedAsset: MarketData) => void;

class TradingViewService {
  private marketData: MarketData[];
  private listeners: Map<string, Set<UpdateListener>> = new Map();
  // Replaced polling interval with a timeout-based loop for a simulated WebSocket stream
  private simulationTimeoutId: number | null = null;

  constructor(initialData: MarketData[]) {
    // The initial data now contains high24h and low24h, so we can use it directly.
    this.marketData = initialData;
  }

  // init() is no longer needed as the simulation starts on the first subscription.
  public init(): void {}

  /**
   * Simulates a real-time WebSocket feed by randomly selecting a subscribed asset
   * and pushing a price update. The loop schedules itself to run again after a short,
   * random delay.
   */
  private runWebSocketSimulation(): void {
    if (this.listeners.size === 0) {
        this.simulationTimeoutId = null;
        console.log("Stopping simulated WebSocket feed as there are no listeners.");
        return; // Stop simulation if no one is listening
    }

    // Pick a random subscribed asset to update
    const subscribedSymbols = Array.from(this.listeners.keys());
    const symbolToUpdate = subscribedSymbols[Math.floor(Math.random() * subscribedSymbols.length)];
    const assetIndex = this.marketData.findIndex(a => a.symbol === symbolToUpdate);

    if (assetIndex !== -1) {
      const asset = this.marketData[assetIndex];
      // Simulate the price change for this single asset
      const price = asset.price;
      const volatility = asset.symbol.includes('/') && !asset.symbol.includes('JPY') ? price * 0.001 : price * 0.005; 
      const change = (Math.random() - 0.5) * 2 * volatility;
      let newPrice = parseFloat((price + change).toFixed(asset.symbol.includes('JPY') ? 2 : 4));
      if (newPrice < 0) newPrice = 0;

      const oldPriceYesterday = newPrice / (1 + (asset.changePercent / 100));
      const newChange = newPrice - oldPriceYesterday;
      const newChangePercent = (newChange / oldPriceYesterday) * 100;
      const newHigh24h = Math.max(asset.high24h, newPrice);
      const newLow24h = Math.min(asset.low24h, newPrice);

      // Update the data in our store
      this.marketData[assetIndex] = {
        ...asset,
        price: newPrice,
        change: newChange,
        changePercent: newChangePercent,
        high24h: newHigh24h,
        low24h: newLow24h,
      };
      
      // Notify listeners for this specific asset, mimicking a push update
      this.listeners.get(symbolToUpdate)?.forEach(callback => callback(this.marketData[assetIndex]));
    }
    
    // Schedule the next update to create a continuous stream
    const randomDelay = Math.random() * 450 + 50; // Update every 50-500ms
    this.simulationTimeoutId = window.setTimeout(() => this.runWebSocketSimulation(), randomDelay);
  }

  public subscribe(symbol: string, callback: UpdateListener): void {
    if (!this.listeners.has(symbol)) {
      this.listeners.set(symbol, new Set());
    }
    this.listeners.get(symbol)!.add(callback);

    // Start the simulation if it's the first subscription and not already running
    if (!this.simulationTimeoutId) {
        console.log("Starting simulated WebSocket feed...");
        this.runWebSocketSimulation();
    }
  }

  public unsubscribe(symbol: string, callback: UpdateListener): void {
    const symbolListeners = this.listeners.get(symbol);
    if (symbolListeners) {
      symbolListeners.delete(callback);
      if (symbolListeners.size === 0) {
        this.listeners.delete(symbol);
      }
    }
    // The simulation loop will stop itself on its next tick if this.listeners.size becomes 0.
  }

  public getMarketData(): MarketData[] {
    return JSON.parse(JSON.stringify(this.marketData));
  }

  public getInitialPrice(symbol: string): number | undefined {
    return this.marketData.find(asset => asset.symbol === symbol)?.price;
  }
}

// Create a singleton instance
export const tradingViewService = new TradingViewService(initialMarketData);