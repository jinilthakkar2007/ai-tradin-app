import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { OrderBookData, Order } from '../types';
import { orderBookService } from '../services/orderBookService';
import { getAIOrderBookAnalysis } from '../services/geminiService';
import RefreshIcon from './icons/RefreshIcon';

interface OrderBookProps {
  assetSymbol: string;
  basePrice: number;
}

const OrderRow: React.FC<{ order: Order; type: 'bid' | 'ask'; maxTotal: number; }> = ({ order, type, maxTotal }) => {
  const isBid = type === 'bid';
  const barWidth = maxTotal > 0 ? (order.total / maxTotal) * 100 : 0;
  const barColor = isBid ? 'rgba(35, 134, 54, 0.15)' : 'rgba(218, 54, 51, 0.15)';

  const rowStyle: React.CSSProperties = {
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
  const [commentaryError, setCommentaryError] = useState<{ message: string; isCooldown: boolean } | null>(null);
  const [isLoadingCommentary, setIsLoadingCommentary] = useState<boolean>(true);
  
  const fetchAICommentary = useCallback(async (orderBookData: OrderBookData) => {
    setIsLoadingCommentary(true);
    setCommentaryError(null);
    setAiCommentary('');

    const result = await getAIOrderBookAnalysis(assetSymbol, orderBookData);
    
    // FIX: Explicitly checking for `result.success === false` allows TypeScript to correctly narrow the type and access `isCooldown` in the failure case.
    if (result.success === false) {
      setCommentaryError({ message: result.message, isCooldown: result.isCooldown });
    } else {
      setAiCommentary(result.message);
    }
    setIsLoadingCommentary(false);
  }, [assetSymbol]);

  useEffect(() => {
    setData(null);
    setAiCommentary('');
    setCommentaryError(null);
    setIsLoadingCommentary(true);

    const handleUpdate = (newData: OrderBookData) => {
      setData(currentData => {
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
  
  return (
    <div className="bg-surface border border-border rounded-lg p-4">
        <h3 className="text-lg font-bold text-text-primary mb-3">Order Book</h3>

        <div className="bg-background/50 border border-border rounded-md p-3 mb-4 min-h-[60px]">
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
            {isLoadingCommentary ? (
                <p className="text-xs italic text-text-secondary">Analyzing order book...</p>
            ) : commentaryError ? (
                <p className={`text-xs italic ${commentaryError.isCooldown ? 'text-accent-yellow' : 'text-accent-red'}`}>{commentaryError.message}</p>
            ) : (
                <p className="text-xs italic text-text-secondary" aria-live="polite">{aiCommentary}</p>
            )}
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
            {[...data.asks].reverse().map(ask => (
                <OrderRow key={`ask-${ask.price}`} order={ask} type="ask" maxTotal={maxTotal} />
            ))}
            <tr className="border-y border-border bg-background">
                <td colSpan={3} className="py-2 text-center">
                    <span className="text-lg font-bold text-text-primary">${basePrice.toFixed(4)}</span>
                </td>
            </tr>
            {data.bids.map(bid => (
                <OrderRow key={`bid-${bid.price}`} order={bid} type="bid" maxTotal={maxTotal} />
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderBook;