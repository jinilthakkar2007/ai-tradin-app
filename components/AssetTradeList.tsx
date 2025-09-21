

import React from 'react';
import { Trade, Prices, PriceAlert } from '../types';
import TradeItem from './TradeItem';
import { motion } from 'framer-motion';

interface AssetTradeListProps {
  assetSymbol: string;
  trades: Trade[];
  prices: Prices;
  onEditTrade: (trade: Trade) => void;
  onDeleteTrade: (tradeId: string) => void;
  onSetPriceAlert: (tradeId: string, priceAlert: Omit<PriceAlert, 'triggered'> | null) => void;
  onOpenJournal: (trade: Trade) => void;
}

// FIX: Refactored from React.FC to a standard function component to fix framer-motion prop type errors.
const AssetTradeList = ({ assetSymbol, trades, prices, onEditTrade, onDeleteTrade, onSetPriceAlert, onOpenJournal }: AssetTradeListProps) => {
  const assetTrades = trades.filter(t => t.asset === assetSymbol);
  const active = assetTrades.filter(t => t.status === 'ACTIVE').sort((a,b) => new Date(b.openDate).getTime() - new Date(a.openDate).getTime());
  const history = assetTrades.filter(t => t.status !== 'ACTIVE').sort((a,b) => new Date(b.closeDate!).getTime() - new Date(a.closeDate!).getTime());

  if (assetTrades.length === 0) {
    return (
      <div className="text-center text-text-secondary text-sm py-8">
        You have no trades for {assetSymbol}.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {active.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <h4 className="text-lg font-semibold text-text-primary mb-2">Active Positions</h4>
          <div className="space-y-2">
            {active.map(trade => (
                <TradeItem 
                    key={trade.id} 
                    trade={trade} 
                    currentPrice={prices[trade.asset]}
                    onEditTrade={onEditTrade}
                    onDeleteTrade={onDeleteTrade}
                    onSetPriceAlert={onSetPriceAlert}
                    onOpenJournal={onOpenJournal}
                />
            ))}
          </div>
        </motion.div>
      )}
      {history.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <h4 className="text-lg font-semibold text-text-primary mb-2">Trade History</h4>
          <div className="space-y-2">
            {history.map(trade => (
                <TradeItem 
                    key={trade.id} 
                    trade={trade} 
                    currentPrice={prices[trade.asset]}
                    onOpenJournal={onOpenJournal}
                />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AssetTradeList;
