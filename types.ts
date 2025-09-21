
export type View = 'dashboard' | 'history' | 'alerts' | 'chatbot' | 'market' | 'strategy' | 'portfolio' | 'backtesting' | 'copy-trading';

export interface TakeProfit {
  level: number;
  price: number;
  hit: boolean;
}

export type TradeDirection = 'LONG' | 'SHORT';
export type TradeStatus = 'ACTIVE' | 'CLOSED_TP' | 'CLOSED_SL';
export type AlertCondition = 'ABOVE' | 'BELOW';

export interface PriceAlert {
    price: number;
    condition: AlertCondition;
    triggered: boolean;
}

export interface GlobalPriceAlert {
  id: string;
  asset: string;
  price: number;
  condition: AlertCondition;
  createdAt: string;
}

export interface JournalEntry {
    timestamp: string;
    note: string;
}

export interface Trade {
  id: string;
  asset: string;
  direction: TradeDirection;
  entryPrice: number;
  quantity: number;
  stopLoss: number;
  takeProfits: TakeProfit[];
  status: TradeStatus;
  openDate: string;
  closeDate?: string;
  closePrice?: number;
  riskPercentage: number;
  priceAlert?: PriceAlert | null;
  journal?: JournalEntry[];
}

export interface Alert {
  id: string;
  tradeId: string;
  asset: string;
  message: string;
  timestamp: string;
  type: 'success' | 'error' | 'info';
  aiCommentary?: string;
  read: boolean;
}

export interface MarketData {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    volume: string;
    high24h: number;
    low24h: number;
}

export interface Prices {
    [symbol: string]: number;
}

export interface ChatMessage {
    id: string;
    sender: 'user' | 'bot';
    text: string;
    timestamp: string;
}

export interface User {
    id: string;
    email: string;
    name?: string;
    picture?: string;
    subscriptionTier: 'Free' | 'Premium';
}

export interface UserStats {
    totalTrades: number;
    winRate: number; // percentage
    totalPL: number;
    avgWin: number;
    avgLoss: number;
    profitFactor: number;
}

export interface UserSettings {
    defaultCurrency: 'USD' | 'EUR' | 'GBP' | 'JPY';
    notifications: {
        tradeAlerts: boolean;
        aiCommentary: boolean;
        marketNews: boolean;
    };
    chart: {
        defaultMA: boolean;
        defaultRSI: boolean;
        maPeriod: number;
        rsiPeriod: number;
    };
}

export interface NewsArticle {
  id: string;
  timestamp: string;
  headline: string;
  summary: string;
  source: string;
  symbols: string[];
}

export interface Order {
  price: number;
  quantity: number;
  total: number;
}

export interface OrderBookData {
  bids: Order[];
  asks: Order[];
}

export interface ProTrader {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  stats: {
    monthlyPL: number; // percentage
    winRate: number; // percentage
    followers: number;
    riskScore: 'Low' | 'Medium' | 'High';
  };
  // A list of trade structures this trader might execute
  tradeTemplates: Omit<Trade, 'id' | 'status' | 'openDate' | 'entryPrice' | 'stopLoss' | 'takeProfits' | 'riskPercentage'>[];
}

export interface AssetPerformanceData {
  symbol: string;
  totalTrades: number;
  winRate: number;
  totalPL: number;
  realizedPL: number;
  unrealizedPL: number;
  avgPL: number;
}
