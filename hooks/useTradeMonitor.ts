import { useState, useEffect, useRef } from 'react';
import { Trade, TradeStatus, Prices, MarketData, GlobalPriceAlert } from '../types';
import { tradingViewService } from '../services/tradingViewService';

export const useTradeMonitor = (
  activeTrades: Trade[],
  globalAlerts: GlobalPriceAlert[],
  onTrigger: (trade: Trade, status: TradeStatus, price: number) => void,
  onCustomAlert: (trade: Trade) => void,
  onGlobalAlert: (alert: GlobalPriceAlert) => void
) => {
  const [prices, setPrices] = useState<Prices>({});
  const triggeredTradesRef = useRef<Set<string>>(new Set());
  const onTriggerRef = useRef(onTrigger);
  const onCustomAlertRef = useRef(onCustomAlert);
  const onGlobalAlertRef = useRef(onGlobalAlert);


  // Keep callbacks fresh without re-running the effect
  useEffect(() => {
    onTriggerRef.current = onTrigger;
  }, [onTrigger]);

  useEffect(() => {
    onCustomAlertRef.current = onCustomAlert;
  }, [onCustomAlert]);

  useEffect(() => {
    onGlobalAlertRef.current = onGlobalAlert;
  }, [onGlobalAlert]);

  useEffect(() => {
    const tradeSymbols = activeTrades.map(trade => trade.asset);
    const alertSymbols = globalAlerts.map(alert => alert.asset);
    const allSymbols = Array.from(new Set([...tradeSymbols, ...alertSymbols]));

    // Initialize prices for all monitored assets
    const initialPrices: Prices = {};
    allSymbols.forEach(symbol => {
        const trade = activeTrades.find(t => t.asset === symbol);
        initialPrices[symbol] = tradingViewService.getInitialPrice(symbol) || trade?.entryPrice || 0;
    });
    setPrices(initialPrices);

    const checkTriggers = (assetSymbol: string, newPrice: number) => {
      // Check trades
      activeTrades.forEach(trade => {
        if (trade.asset !== assetSymbol || triggeredTradesRef.current.has(trade.id)) return;

        const { direction, stopLoss, takeProfits, priceAlert } = trade;
        const isLong = direction === 'LONG';

        if (priceAlert && !priceAlert.triggered) {
            const conditionMet = 
                (priceAlert.condition === 'ABOVE' && newPrice >= priceAlert.price) ||
