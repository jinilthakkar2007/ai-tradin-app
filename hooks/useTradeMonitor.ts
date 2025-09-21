import { useState, useEffect, useRef } from 'react';
import { Trade, Prices, MarketData } from '../types';
import { tradingViewService } from '../services/tradingViewService';

export const useTradeMonitor = (
  activeTrades: Trade[],
  onTrigger: (trade: Trade, status: 'CLOSED_TP' | 'CLOSED_SL', price: number) => void,
  onCustomAlert: (trade: Trade) => void
) => {
  const [prices, setPrices] = useState<Prices>({});
  const triggeredTradesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Reset triggered trades when active trades change, e.g., a trade is deleted or added.
    triggeredTradesRef.current = new Set();
    const tradeSymbols = activeTrades.map(trade => trade.asset);
    const allSymbols = Array.from(new Set(tradeSymbols));

    // Initialize prices for all monitored assets
    const initialPrices: Prices = {};
    allSymbols.forEach(symbol => {
        const trade = activeTrades.find(t => t.asset === symbol);
        initialPrices[symbol] = tradingViewService.getInitialPrice(symbol) || trade?.entryPrice || 0;
    });
    setPrices(initialPrices);

    const checkTriggers = (assetSymbol: string, newPrice: number) => {
      activeTrades.forEach(trade => {
        if (trade.asset !== assetSymbol || triggeredTradesRef.current.has(trade.id)) return;

        const { direction, stopLoss, takeProfits, priceAlert } = trade;
        const isLong = direction === 'LONG';

        if (priceAlert && !priceAlert.triggered) {
            const conditionMet = 
                (priceAlert.condition === 'ABOVE' && newPrice >= priceAlert.price) ||
                (priceAlert.condition === 'BELOW' && newPrice <= priceAlert.price);
            
            if (conditionMet) {
                onCustomAlert(trade);
            }
        }

        // Check for TP
        const hitTp = takeProfits.find(tp => !tp.hit && (isLong ? newPrice >= tp.price : newPrice <= tp.price));
        if (hitTp) {
            triggeredTradesRef.current.add(trade.id);
            onTrigger(trade, 'CLOSED_TP', hitTp.price);
            return; // A trade is closed once one of its conditions is met
        }

        // Check for SL
        if ((isLong && newPrice <= stopLoss) || (!isLong && newPrice >= stopLoss)) {
            triggeredTradesRef.current.add(trade.id);
            onTrigger(trade, 'CLOSED_SL', stopLoss);
            return; // A trade is closed once one of its conditions is met
        }
      });
    };

    const subscriptions: { symbol: string; handler: (asset: MarketData) => void }[] = [];
    allSymbols.forEach(symbol => {
      const handler = (asset: MarketData) => {
        setPrices(prev => ({ ...prev, [symbol]: asset.price }));
        checkTriggers(symbol, asset.price);
      };
      tradingViewService.subscribe(symbol, handler);
      subscriptions.push({ symbol, handler });
    });

    return () => {
      subscriptions.forEach(({ symbol, handler }) => {
        tradingViewService.unsubscribe(symbol, handler);
      });
    };
  }, [activeTrades, onTrigger, onCustomAlert]);

  return { prices };
};