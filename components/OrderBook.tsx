

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { OrderBookData, Order } from '../types';
import { orderBookService } from '../services/orderBookService';
import { getAIOrderBookAnalysis } from '../services/geminiService';
import RefreshIcon from './icons/RefreshIcon';

interface OrderBookProps {
  assetSymbol: string;
  basePrice: number;
}

const OrderRow: React.FC<{ order: Order; type: 'bid' | 'ask'; maxTotal: number }> = ({ order, type, maxTotal }) => {
  const isBid = type === 'bid';
  const barWidth = maxTotal > 0 ? (order.total / maxTotal) * 100 : 0;
  
  return (
    <div className="relative grid grid-cols-3 gap-2 text-xs tabular-nums py-1 px-2">
      <div 
        className={`absolute top-0 h-full ${isBid ? 'right-0 bg-accent-green/10' : 'left-0 bg-accent-red/10'}`}
        style={{ width: `${barWidth}%`, transition: 'width 0.3s ease-in-out' }}
      ></div>
      <span className={`relative z-10 ${isBid ? 'text-accent-green' : 'text-text-secondary'}`}>{order.price.toFixed(4)}</span>
      <span className="relative z-10 text-right text-text-primary">{order.quantity.toFixed(4)}</span>
      <span className="relative z-10 text-right text-text-secondary">{order.total.toFixed(2)}</span>
    </div>
  );
};

const OrderBook: React.FC<OrderBookProps> = ({ assetSymbol, basePrice }) => {
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
    // Reset state when asset changes
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
        <div className="bg-background-surface border border-background-light rounded-lg p-4 h-full flex items-center justify-center">
            <p className="text-text-secondary">Loading Order Book...</p>
        </div>
    );
  }

  return (
    <div 
      className="bg-background-surface border border-background-light rounded-lg p-4"
    >
        <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-bold text-text-primary">Order Book</h3>
        </div>

        <div className="bg-background/50 border border-background-light rounded-md p-3 mb-4">
            <div className="flex justify-between items-center mb-1">
                <h4 className="text-sm font-semibold text-accent-blue">🤖 AI Insight</h4>
                <button
                    onClick={() => fetchAICommentary(data)}
                    disabled={isLoadingCommentary}
                    className="p-1.5 text-text-secondary hover:text-white hover:bg-background-light rounded-full disabled:opacity-50"
                    aria-label="Refresh AI analysis"
                >
                    <RefreshIcon />
                </button>
            </div>
            <p className="text-xs text-text-secondary italic">
              {isLoadingCommentary ? 'Analyzing...' : aiCommentary}
            </p>
        </div>
      
      <div>
        <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-text-secondary border-b border-background-light pb-2 mb-1 px-2">
          <span>Price (USD)</span>
          <span className="text-right">Quantity</span>
          <span className="text-right">Total</span>
        </div>
        <div className="space-y-0.5">
          {[...data.asks].reverse().map(ask => (
            <OrderRow key={ask.price} order={ask} type="ask" maxTotal={maxTotal} />
          ))}
        </div>
      </div>

      <div className="py-2 my-2 border-y border-background-light text-center">
        <span className="text-lg font-bold text-text-primary">${basePrice.toFixed(4)}</span>
      </div>

      <div>
        <div className="space-y-0.5">
            {data.bids.map(bid => (
                <OrderRow key={bid.price} order={bid} type="bid" maxTotal={maxTotal} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default OrderBook;
