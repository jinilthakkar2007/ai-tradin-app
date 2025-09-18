import { useState, useEffect, useRef } from 'react';
import { Trade, TradeStatus, Prices, MarketData } from '../types';
import { tradingViewService } from '../services/tradingViewService';

export const useTradeMonitor = (
  activeTrades: Trade[],
  onTrigger: (trade: Trade, status: TradeStatus, price: number) => void,
  onCustomAlert: (trade: Trade) => void
) => {
  const [prices, setPrices] = useState<Prices>({});
  const triggeredTradesRef = useRef<Set<string>>(new Set());
  const onTriggerRef = useRef(onTrigger);
  const onCustomAlertRef = useRef(onCustomAlert);


  // Keep callbacks fresh without re-running the effect
  useEffect(() => {
    onTriggerRef.current = onTrigger;
  }, [onTrigger]);

  useEffect(() => {
    onCustomAlertRef.current = onCustomAlert;
  }, [onCustomAlert]);

  useEffect(() => {
    // Initialize prices for active trades
    const initialPrices: Prices = {};
    activeTrades.forEach(trade => {
        initialPrices[trade.asset] = tradingViewService.getInitialPrice(trade.asset) || trade.entryPrice;
    });
    setPrices(initialPrices);

    const checkTrade = (trade: Trade, newPrice: number) => {
      if (triggeredTradesRef.current.has(trade.id)) return;

      const { direction, stopLoss, takeProfits, priceAlert } = trade;
      const isLong = direction === 'LONG';

      // Check for custom price alert first
      if (priceAlert && !priceAlert.triggered) {
        const conditionMet = 
            (priceAlert.condition === 'ABOVE' && newPrice >= priceAlert.price) ||
            (priceAlert.condition === 'BELOW' && newPrice <= priceAlert.price);
        
        if (conditionMet) {
            onCustomAlertRef.current(trade);
            // The parent component will mark it as triggered.
            // We don't stop checking for SL/TP.
        }
      }

      // Check for Stop Loss
      if ((isLong && newPrice <= stopLoss) || (!isLong && newPrice >= stopLoss)) {
        triggeredTradesRef.current.add(trade.id);
        onTriggerRef.current(trade, 'CLOSED_SL', stopLoss);
        return true;
      }

      // Check for Take Profit
      const sortedTPs = isLong
          ? [...takeProfits].sort((a, b) => a.price - b.price)
          : [...takeProfits].sort((a, b) => b.price - a.price);

      for (const tp of sortedTPs) {
        if (tp.hit) continue;
        if ((isLong && newPrice >= tp.price) || (!isLong && newPrice <= tp.price)) {
          triggeredTradesRef.current.add(trade.id);
          onTriggerRef.current(trade, 'CLOSED_TP', tp.price);
          return true;
        }
      }
      return false;
    };
    
    // The tradingViewService now uses a simulated WebSocket connection to provide
    // real-time price updates. This hook subscribes to the assets from the active
    // trades list to receive those updates.
    const handlers = activeTrades.map(trade => {
      const handler = (updatedAsset: MarketData) => {
        const newPrice = updatedAsset.price;
        setPrices(prev => ({ ...prev, [trade.asset]: newPrice }));
        checkTrade(trade, newPrice);
      };
      tradingViewService.subscribe(trade.asset, handler);
      return { symbol: trade.asset, handler };
    });

    // Cleanup: unsubscribe from all
    return () => {
      handlers.forEach(({ symbol, handler }) => {
        tradingViewService.unsubscribe(symbol, handler);
      });
    };
    
  }, [activeTrades]); // Re-subscribe only when active trades change

  return { prices };
};