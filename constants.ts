
import { Trade, MarketData, UserSettings } from './types';

export const ASSET_SYMBOLS = [
  'BTC/USD',
  'ETH/USD',
  'SOL/USD',
  'DOGE/USD',
  'AAPL',
  'TSLA',
  'NVDA',
  'GOOGL',
];

export const MOCK_MARKET_DATA: MarketData[] = [
  { symbol: 'BTC/USD', name: 'Bitcoin', price: 68543.21, change: 1234.56, changePercent: 1.83, volume: '1.2B', high24h: 69123.45, low24h: 67345.67 },
  { symbol: 'ETH/USD', name: 'Ethereum', price: 3789.45, change: -56.78, changePercent: -1.48, volume: '800M', high24h: 3850.12, low24h: 3750.89 },
  { symbol: 'SOL/USD', name: 'Solana', price: 165.78, change: 5.12, changePercent: 3.18, volume: '300M', high24h: 170.00, low24h: 160.45 },
  { symbol: 'DOGE/USD', name: 'Dogecoin', price: 0.158, change: 0.005, changePercent: 3.26, volume: '150M', high24h: 0.162, low24h: 0.151 },
  { symbol: 'AAPL', name: 'Apple Inc.', price: 195.67, change: 1.23, changePercent: 0.63, volume: '45M', high24h: 196.50, low24h: 194.20 },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 180.34, change: -2.45, changePercent: -1.34, volume: '90M', high24h: 184.00, low24h: 179.50 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 120.89, change: 3.45, changePercent: 2.94, volume: '150M', high24h: 122.00, low24h: 118.50 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 175.43, change: 0.89, changePercent: 0.51, volume: '30M', high24h: 176.00, low24h: 174.10 },
];

export const MOCK_TRADES: Trade[] = [
    {
        id: 'trade-1',
        asset: 'BTC/USD',
        direction: 'LONG',
        entryPrice: 65000,
        quantity: 0.1,
        stopLoss: 64000,
        takeProfits: [
            { level: 1, price: 66000, hit: true },
            { level: 2, price: 67500, hit: false },
        ],
        status: 'ACTIVE',
        openDate: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
        riskPercentage: 1.54,
        priceAlert: { price: 67000, condition: 'ABOVE', triggered: false },
        journal: [
            { timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), note: "Initial entry based on support bounce." }
        ]
    },
    {
        id: 'trade-2',
        asset: 'ETH/USD',
        direction: 'SHORT',
        entryPrice: 3800,
        quantity: 2,
        stopLoss: 3900,
        takeProfits: [{ level: 1, price: 3700, hit: false }],
        status: 'ACTIVE',
        openDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        riskPercentage: 2.63,
        priceAlert: null,
    },
    {
        id: 'trade-3',
        asset: 'NVDA',
        direction: 'LONG',
        entryPrice: 115,
        quantity: 50,
        stopLoss: 110,
        takeProfits: [{ level: 1, price: 125, hit: true }],
        status: 'CLOSED_TP',
        openDate: new Date(Date.now() - 86400000 * 5).toISOString(),
        closeDate: new Date(Date.now() - 86400000 * 3).toISOString(),
        closePrice: 125,
        riskPercentage: 4.35,
    },
    {
        id: 'trade-4',
        asset: 'TSLA',
        direction: 'SHORT',
        entryPrice: 185,
        quantity: 30,
        stopLoss: 190,
        takeProfits: [{ level: 1, price: 175, hit: false }],
        status: 'CLOSED_SL',
        openDate: new Date(Date.now() - 86400000 * 4).toISOString(),
        closeDate: new Date(Date.now() - 86400000 * 1).toISOString(),
        closePrice: 190,
        riskPercentage: 2.7,
    },
];

export const MOCK_NEWS_CONFIG = {
    sources: ['CoinDesk', 'Bloomberg Crypto', 'The Block', 'Reuters', 'MarketWatch'],
    headlines: [
        { template: '{{asset}} Sees Increased Volatility Ahead of Fed Meeting', summary: 'Traders are on edge as {{asset}} shows wild price swings.' },
        { template: 'Institutional Interest in {{asset}} Continues to Grow', summary: 'Major financial players are reportedly increasing their holdings in {{asset}}.' },
        { template: 'Technical Analysis: {{asset}} Testing Key Support Level', summary: 'Chart patterns suggest a critical moment for {{asset}} as it re-tests a historical support zone.' },
        { template: '{{asset}} Price Dips Amidst Broader Market Sell-off', summary: 'A risk-off sentiment in global markets is putting downward pressure on {{asset}}.' },
    ],
};

export const DEFAULT_USER_SETTINGS: UserSettings = {
    defaultCurrency: 'USD',
    notifications: {
        tradeAlerts: true,
        aiCommentary: true,
        marketNews: false,
    },
    chart: {
        defaultMA: true,
        defaultRSI: false,
        maPeriod: 20,
        rsiPeriod: 14,
    },
};
