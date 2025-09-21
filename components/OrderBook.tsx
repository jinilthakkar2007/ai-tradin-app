import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { OrderBookData, Order } from '../types';
import { orderBookService } from '../services/orderBookService';
import { getAIOrderBookAnalysis } from '../services/geminiService';
import RefreshIcon from './icons/RefreshIcon';

interface OrderBookProps {
  assetSymbol: string;
  basePrice: number;
}

interface OrderRowProps {
  order: Order;
  type: 'bid' | 'ask';
  maxTotal: number;
}

const OrderRow = ({ order, type, maxTotal }: OrderRowProps) => {
  const isBid = type === 'bid';
  const barWidth = maxTotal > 0 ? (order.total / maxTotal) * 100 : 0;
  // Using theme colors with opacity for the bar background. Corrected red color value.
  const barColor = isBid ? 'rgba(35, 134, 54, 0.15)' : 'rgba(218, 54, 51, 0.15)';

  const rowStyle: React.CSSProperties = {
    // Gradient direction depends on bid/ask for intuitive visualization
    background: `linear-gradient(${isBid ? 'to left' : 'to right'}, ${barColor} ${barWidth}%, transparent ${barWidth}%)`,
    transition: 'background 0.3s ease-in-out',
  };
  
  return (
    <tr style={rowStyle} className="hover:bg-white/5">
      <td className={`px-2 py-0.5 text-xs font-medium ${isBid ? 'text-accent-green' : 'text-accent-red'}`}>{order.price.toFixed(4)}</td>
      <td className="px-2 py-0.5 text-xs text-right text-text-primary">{order.quantity.toFixed(4)}</td>
      <td className="px-2 py-0.5 text-xs text-right text-text-secondary">{order.total.toFixed(2)}</td>
    </tr>
  );
};

const OrderBook = ({ assetSymbol, basePrice }: OrderBookProps) => {
  const [data, setData] = useState<OrderBookData | null>(null);
  const [aiCommentary, setAiCommentary] = useState<string>('');
  const [isLoadingCommentary, setIsLoadingCommentary] = useState<boolean>(true);
  
  const fetchAICommentary = useCallback(async (orderBookData: OrderBookData) => {
    setIsLoadingCommentary(true);
    try {
      const commentary = await getAIOrderBookAnalysis(assetSymbol, orderBookData);
      setAiCommentary(commentary);
    } catch (error) {
      setAiCommentary('Failed to load AI analysis.');
    } finally {
      setIsLoadingCommentary(false);
    }
  }, [assetSymbol]);

  useEffect(() => {
    // Reset state when asset changes to prevent showing old data
    setData(null);
    setAiCommentary('');
    setIsLoadingCommentary(true);

    const handleUpdate = (newData: OrderBookData) => {
      setData(currentData => {
        // Only fetch commentary on the first data load for a new asset
        if (currentData === null) {
          fetchAICommentary(newData);
        }
        return newData;
      });
    };

    orderBookService.subscribe(assetSymbol, basePrice, handleUpdate);

    return () => {
      orderBookService.unsubscribe(assetSymbol, handleUpdate);
    };
  }, [assetSymbol, basePrice, fetchAICommentary]);

  const maxTotal = useMemo(() => {
    if (!data) return 0;
    const allTotals = [...data.bids.map(o => o.total), ...data.asks.map(o => o.total)];
    return Math.max(...allTotals);
  }, [data]);
  
  if (!data) {
    return (
        <div className="bg-surface border border-border rounded-lg p-4 h-full flex items-center justify-center min-h-[400px]">
            <p className="text-text-secondary animate-pulse">Loading Order Book...</p>
        </div>
    );
  }
  
  const isCooldownMessage = aiCommentary.startsWith('To prevent rate-limiting');

  return (
    <div className="bg-surface border border-border rounded-lg p-4">
        <h3 className="text-lg font-bold text-text-primary mb-3">Order Book</h3>

        <div className="bg-background/50 border border-border rounded-md p-3 mb-4">
            <div className="flex justify-between items-center mb-1">
                <h4 className="text-sm font-semibold text-brand">🤖 AI Insight</h4>
                <button
                    onClick={() => fetchAICommentary(data)}
                    disabled={isLoadingCommentary}
                    className="p-1.5 text-text-secondary hover:text-white hover:bg-surface rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Refresh AI analysis"
                >
                    <RefreshIcon className={isLoadingCommentary ? 'animate-spin' : ''} />
                </button>
            </div>
            <p className={`text-xs italic ${isCooldownMessage ? 'text-accent-yellow' : 'text-text-secondary'}`} aria-live="polite">
              {isLoadingCommentary ? 'Analyzing order book...' : aiCommentary}
            </p>
        </div>
      
      <table className="w-full border-collapse tabular-nums">
        <caption className="sr-only">Order book for {assetSymbol}, showing bids and asks.</caption>
        <thead>
            <tr className="text-xs text-text-secondary border-b border-border">
                <th scope="col" className="px-2 py-2 font-semibold text-left">Price (USD)</th>
                <th scope="col" className="px-2 py-2 font-semibold text-right">Quantity</th>
                <th scope="col" className="px-2 py-2 font-semibold text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            {/* Asks (Sell orders) - rendered in reverse to show lowest ask closest to spread */}
            {[...data.asks].reverse().map(ask => (
                <OrderRow key={`ask-${ask.price}`} order={ask} type="ask" maxTotal={maxTotal} />
            ))}

            {/* Spread */}
            <tr className="border-y border-border bg-background">
                <td colSpan={3} className="py-2 text-center">
                    <span className="text-lg font-bold text-text-primary">${basePrice.toFixed(4)}</span>
                </td>
            </tr>

            {/* Bids (Buy orders) */}
            {data.bids.map(bid => (
                <OrderRow key={`bid-${bid.price}`} order={bid} type="bid" maxTotal={maxTotal} />
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderBook;