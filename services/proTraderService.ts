import { ProTrader, Trade } from '../types';
import { tradingViewService } from './tradingViewService';

type ProTraderListener = (trader: ProTrader, trade: Omit<Trade, 'id' | 'status' | 'openDate'>) => void;

const MOCK_PRO_TRADERS: ProTrader[] = [
    {
        id: 'pro-1',
        name: 'CryptoWizard',
        avatar: `https://api.dicebear.com/8.x/bottts/svg?seed=wizard`,
        bio: 'Scalping major pairs with a focus on BTC and ETH volatility.',
        stats: { monthlyPL: 12.5, winRate: 68.2, followers: 1250, riskScore: 'Medium' },
        tradeTemplates: [
            { asset: 'BTC/USD', direction: 'LONG', quantity: 0.05 },
            { asset: 'ETH/USD', direction: 'SHORT', quantity: 1.5 },
        ]
    },
    {
        id: 'pro-2',
        name: 'MomentumMax',
        avatar: `https://api.dicebear.com/8.x/bottts/svg?seed=momentum`,
        bio: 'Swing trading high-growth tech stocks like NVDA and TSLA.',
        stats: { monthlyPL: 21.8, winRate: 55.4, followers: 840, riskScore: 'High' },
        tradeTemplates: [
            { asset: 'NVDA', direction: 'LONG', quantity: 50 },
            { asset: 'TSLA', direction: 'SHORT', quantity: 30 },
        ]
    },
    {
        id: 'pro-3',
        name: 'SteadyGains',
        avatar: `https://api.dicebear.com/8.x/bottts/svg?seed=steady`,
        bio: 'Low-risk, long-term positions on established market leaders.',
        stats: { monthlyPL: 4.2, winRate: 81.0, followers: 2300, riskScore: 'Low' },
        tradeTemplates: [
            { asset: 'AAPL', direction: 'LONG', quantity: 100 },
            { asset: 'GOOGL', direction: 'LONG', quantity: 80 },
        ]
    },
];

class ProTraderService {
    private listener: ProTraderListener | null = null;
    private intervalId: number | null = null;
    private traders: ProTrader[] = MOCK_PRO_TRADERS;

    public getProTraders(): ProTrader[] {
        return this.traders;
    }

    private generateTradeFor(trader: ProTrader): Omit<Trade, 'id' | 'status' | 'openDate'> {
        const template = trader.tradeTemplates[Math.floor(Math.random() * trader.tradeTemplates.length)];
        const currentPrice = tradingViewService.getInitialPrice(template.asset) || 100;
        
        const isLong = template.direction === 'LONG';
        const stopLossDistance = currentPrice * (0.01 + Math.random() * 0.02); // 1-3% SL
        const takeProfitDistance = stopLossDistance * (1.5 + Math.random()); // 1.5-2.5 RR

        const stopLoss = isLong ? currentPrice - stopLossDistance : currentPrice + stopLossDistance;
        const takeProfit = isLong ? currentPrice + takeProfitDistance : currentPrice - takeProfitDistance;
        
        const riskPercentage = Math.abs(((currentPrice - stopLoss) / currentPrice) * 100);

        return {
            ...template,
            entryPrice: parseFloat(currentPrice.toFixed(4)),
            stopLoss: parseFloat(stopLoss.toFixed(4)),
            takeProfits: [{ level: 1, price: parseFloat(takeProfit.toFixed(4)), hit: false }],
            riskPercentage: parseFloat(riskPercentage.toFixed(2)),
        };
    }

    private simulateNewTrade(): void {
        if (!this.listener) return;

        // Pick a random trader to execute a trade
        const trader = this.traders[Math.floor(Math.random() * this.traders.length)];
        const newTrade = this.generateTradeFor(trader);
        
        this.listener(trader, newTrade);
    }

    public subscribe(callback: ProTraderListener): void {
        this.listener = callback;
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        // Start simulating trades
        this.intervalId = window.setInterval(() => this.simulateNewTrade(), 8000); // New trade every 8 seconds
    }

    public unsubscribe(): void {
        this.listener = null;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}

export const proTraderService = new ProTraderService();
