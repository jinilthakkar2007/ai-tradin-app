import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Trade, PriceAlert } from '../types';
import EditIcon from './icons/EditIcon';
import TrashIcon from './icons/TrashIcon';
import BellIcon from './icons/BellIcon';
import JournalIcon from './icons/JournalIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';

interface TradeItemProps {
  trade: Trade;
  currentPrice?: number;
  isHistory: boolean;
  onEditTrade?: (trade: Trade) => void;
  onDeleteTrade?: (tradeId: string) => void;
  onSetPriceAlert?: (tradeId: string, priceAlert: Omit<PriceAlert, 'triggered'> | null) => void;
  onOpenJournal?: (trade: Trade) => void;
  isSelected?: boolean;
  onToggleSelect?: (tradeId: string) => void;
}

const detailsVariants: Variants = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: 'auto', transition: { duration: 0.3, ease: 'easeInOut' } },
  exit: { opacity: 0, height: 0, transition: { duration: 0.2, ease: 'easeInOut' } },
};

const alertFormVariants: Variants = {
  hidden: { opacity: 0, height: 0, marginTop: 0 },
  visible: { opacity: 1, height: 'auto', marginTop: '16px', transition: { duration: 0.3, ease: 'easeInOut' } },
  exit: { opacity: 0, height: 0, marginTop: 0, transition: { duration: 0.2, ease: 'easeInOut' } },
};

const DetailMetric: React.FC<{ label: string; value: string | React.ReactNode; className?: string; tooltip?: string }> = ({ label, value, className, tooltip }) => (
    <div title={tooltip}>
        <p className="text-xs text-text-secondary">{label}</p>
        <p className={`text-sm font-semibold text-text-primary tabular-nums ${className}`}>{value}</p>
    </div>
);


const TradeItem: React.FC<TradeItemProps> = ({ trade, currentPrice, isHistory, onEditTrade, onDeleteTrade, onSetPriceAlert, onOpenJournal, isSelected, onToggleSelect }) => {
  const { asset, direction, entryPrice, stopLoss, takeProfits, status, closePrice, riskPercentage, quantity, priceAlert, journal } = trade;
  const isLong = direction === 'LONG';
  
  // Component State
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const [isAlertFormVisible, setIsAlertFormVisible] = useState(false);
  const [alertPrice, setAlertPrice] = useState(priceAlert?.price.toString() || '');
  const [alertCondition, setAlertCondition] = useState<'ABOVE' | 'BELOW'>(priceAlert?.condition || 'ABOVE');
  const [showTriggerGlow, setShowTriggerGlow] = useState(false);
  const wasTriggeredRef = useRef(priceAlert?.triggered || false);
  
  // Effect to manage the glow when an alert is triggered
  useEffect(() => {
    const isNowTriggered = priceAlert?.triggered === true;
    if (isNowTriggered && !wasTriggeredRef.current) {
        setShowTriggerGlow(true);
        const timer = setTimeout(() => setShowTriggerGlow(false), 3000);
        return () => clearTimeout(timer);
    }
    wasTriggeredRef.current = isNowTriggered;
  }, [priceAlert?.triggered]);


  // Derived values for display
  const displayPrice = isHistory ? (closePrice ?? entryPrice) : (currentPrice ?? entryPrice);
  
  const { profitLoss, profitLossPercentage, pnlColor, pnlBgColor } = useMemo(() => {
    const pl = (displayPrice - entryPrice) * quantity * (isLong ? 1 : -1);
    const initialPositionValue = entryPrice * quantity;
    const plPercentage = initialPositionValue > 0 ? (pl / initialPositionValue) * 100 : 0;
    const color = pl >= 0 ? 'text-accent-green' : 'text-accent-red';
    const bgColor = pl >= 0 ? 'bg-accent-green' : 'bg-accent-red';
    return { 
        profitLoss: pl, 
        profitLossPercentage: plPercentage, 
        pnlColor: color,
        pnlBgColor: bgColor
    };
  }, [displayPrice, entryPrice, quantity, isLong]);
  
  const finalTpPrice = React.useMemo(() => {
    if (!takeProfits || takeProfits.length === 0) return entryPrice;
    const tpPrices = takeProfits.map(tp => tp.price);
    return isLong ? Math.max(...tpPrices) : Math.min(...tpPrices);
  }, [takeProfits, isLong, entryPrice]);

  const totalRange = Math.abs(finalTpPrice - stopLoss);
  const currentProgress = Math.abs((displayPrice ?? entryPrice) - stopLoss);
  let progressPercentage = totalRange > 0 ? Math.min(100, (currentProgress / totalRange) * 100) : 0;
  
  const riskPerUnit = Math.abs(entryPrice - stopLoss);
  const rewardPerUnit = Math.abs(finalTpPrice - entryPrice);
  const riskRewardRatio = riskPerUnit > 0 ? rewardPerUnit / riskPerUnit : 0;
  const rrColor = riskRewardRatio >= 2 ? 'text-accent-green' : riskRewardRatio >= 1 ? 'text-accent-yellow' : 'text-accent-red';
  
  // New detailed metrics
  const riskAmount = riskPerUnit * quantity;
  const rewardAmount = rewardPerUnit * quantity;
  const positionValue = displayPrice * quantity;

  const hasActiveAlert = priceAlert && !priceAlert.triggered;
  const journalEntryCount = journal?.length || 0;

  const getStatusBadge = () => {
    switch(status) {
      case 'ACTIVE': return <span className="px-2 py-1 text-xs font-semibold text-brand bg-brand/10 rounded-full">ACTIVE</span>;
      case 'CLOSED_TP': return <span className="px-2 py-1 text-xs font-semibold text-accent-green bg-accent-green/10 rounded-full">PROFIT</span>;
      case 'CLOSED_SL': return <span className="px-2 py-1 text-xs font-semibold text-accent-red bg-accent-red/10 rounded-full">LOSS</span>;
      default: return null;
    }
  }
  
  const handleDelete = () => {
      if (onDeleteTrade && window.confirm(`Are you sure you want to delete the trade for ${trade.asset}? This action cannot be undone.`)) {
          onDeleteTrade(trade.id);
      }
  };
  
  const handleSetAlert = () => {
      const price = parseFloat(alertPrice);
      if (!isNaN(price) && price > 0 && onSetPriceAlert) {
          onSetPriceAlert(trade.id, { price, condition: alertCondition });
          setIsAlertFormVisible(false);
      }
  };

  const handleRemoveAlert = () => {
      if (onSetPriceAlert) {
          onSetPriceAlert(trade.id, null);
          setAlertPrice('');
          setIsAlertFormVisible(false);
      }
  };

  const SelectionCheckbox: React.FC = () => (
    <div className="absolute top-4 left-4 z-20" onClick={(e) => e.stopPropagation()}>
      <button 
        onClick={() => onToggleSelect!(trade.id)}
        className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors border-2 ${isSelected ? 'bg-brand border-brand' : 'bg-surface border-border hover:border-brand/50'}`}
        aria-label={`Select trade ${trade.asset}`}
      >
        {isSelected && (
          <motion.svg initial={{scale: 0.5}} animate={{scale: 1}} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </motion.svg>
        )}
      </button>
    </div>
  );

  return (
    <motion.div 
      className={`bg-surface rounded-xl border transition-all duration-300 relative group overflow-hidden ${isSelected ? 'border-brand shadow-glow-brand' : 'border-border hover:border-brand/50'} ${showTriggerGlow ? 'shadow-glow-yellow' : ''}`}
      whileHover={{ y: isSelected ? 0 : -2 }}
      layout
    >
        {isHistory && onToggleSelect && <SelectionCheckbox />}
        {/* Main Header */}
        <div className={`p-4 cursor-pointer ${isHistory ? 'pl-12' : ''}`} onClick={() => setIsDetailsVisible(!isDetailsVisible)}>
            <div className="flex justify-between items-center gap-4">
                {/* Left Side */}
                <div className="flex items-center gap-3 flex-shrink-0">
                    <div>
                        <div className="flex items-center gap-3">
                            <h3 className="text-lg md:text-xl font-bold text-text-primary">{asset}</h3>
                            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${isLong ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-red/10 text-accent-red'}`}>
                                {direction}
                            </span>
                        </div>
                        <div className="mt-1 flex items-center gap-3">
                            {getStatusBadge()}
                            {!isHistory && hasActiveAlert && (
                                <span className="text-accent-yellow" title={`Alert active: ${priceAlert.condition} $${priceAlert.price.toLocaleString()}`}>
                                    <BellIcon className="h-4 w-4" />
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-4">
                    <div className="text-right tabular-nums flex-shrink-0">
                        <div className={`text-base md:text-lg font-bold ${pnlColor}`}>
                            {profitLoss >= 0 ? '+' : ''}{profitLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                        </div>
                        <div className={`text-sm font-semibold ${pnlColor}`}>
                            {profitLossPercentage.toFixed(2)}%
                        </div>
                    </div>
                    {/* Action buttons are positioned absolutely within this relative container */}
                    <div className="relative flex items-center">
                         <motion.div
                            animate={{ rotate: isDetailsVisible ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronDownIcon />
                        </motion.div>
                        <div className="absolute right-8 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus-within:opacity-100">
                             {onOpenJournal && (
                                <motion.button whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); onOpenJournal(trade);}} className="p-2 bg-white/5 rounded-full text-text-secondary hover:bg-brand hover:text-white transition-all relative" aria-label="Open Trade Journal" title={`Journal (${journalEntryCount} entries)`}>
                                    <JournalIcon />
                                    {journalEntryCount > 0 && ( <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">{journalEntryCount}</span> )}
                                </motion.button>
                            )}
                            {!isHistory && onSetPriceAlert && (
                                <motion.button whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); setIsAlertFormVisible(!isAlertFormVisible); }} className={`p-2 bg-white/5 rounded-full transition-all ${hasActiveAlert ? 'text-brand' : 'text-text-secondary'} hover:bg-brand hover:text-white`} aria-label="Set Price Alert" title={hasActiveAlert ? `Alert set: ${priceAlert.condition} $${priceAlert.price}` : 'Set price alert'}>
                                    <BellIcon />
                                </motion.button>
                            )}
                            {!isHistory && onEditTrade && (
                                <motion.button whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); onEditTrade(trade); }} className="p-2 bg-white/5 rounded-full text-text-secondary hover:bg-brand hover:text-white transition-all" aria-label="Edit Trade">
                                    <EditIcon />
                                </motion.button>
                            )}
                            {!isHistory && onDeleteTrade && (
                                <motion.button whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); handleDelete(); }} className="p-2 bg-white/5 rounded-full text-text-secondary hover:bg-accent-red hover:text-white transition-all" aria-label="Delete Trade">
                                    <TrashIcon />
                                </motion.button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Progress Bar */}
        {!isHistory && (
            <div className="px-4 pb-2">
                <div className="bg-border h-1.5 w-full rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${pnlBgColor} transition-all duration-500`} style={{ width: `${Math.abs(progressPercentage)}%`, marginLeft: progressPercentage < 0 ? `calc(50% - ${Math.abs(progressPercentage) / 2}%)` : '50%', transform: `scaleX(${isLong ? 1 : -1})` }}></div>
                </div>
                 <div className="flex justify-between text-xs text-text-dim mt-1 px-1">
                    <span>SL: ${stopLoss.toLocaleString()}</span>
                    <span>TP: ${finalTpPrice.toLocaleString()}</span>
                </div>
            </div>
        )}

        {/* Expandable Details Section */}
        <AnimatePresence>
            {isDetailsVisible && (
                <motion.div
                    variants={detailsVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="overflow-hidden"
                >
                    <div className="pb-4 px-4 border-t border-border">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                           <DetailMetric label="Entry Price" value={`$${entryPrice.toLocaleString()}`} />
                           <DetailMetric label={isHistory ? 'Closed Price' : 'Current Price'} value={`$${displayPrice.toLocaleString()}`} />
                           <DetailMetric label="Stop Loss" value={`$${stopLoss.toLocaleString()}`} />
                           <DetailMetric label="Take Profit" value={`$${finalTpPrice.toLocaleString()}`} />

                           <DetailMetric label="Position Size" value={quantity.toLocaleString()} />
                           <DetailMetric label="Position Value" value={`$${positionValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} />
                           <DetailMetric label="Risk %" value={`${riskPercentage.toFixed(2)}%`} tooltip="Percentage of position value at risk" />
                           <DetailMetric label="R:R Ratio" value={`${riskRewardRatio.toFixed(2)} : 1`} className={rrColor} />
                           
                           <DetailMetric label="Risk Amount" value={`$${riskAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} className="text-accent-red" tooltip="Potential loss if SL is hit" />
                           <DetailMetric label="Reward Amount" value={`$${rewardAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} className="text-accent-green" tooltip="Potential profit if TP is hit" />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Alert Form */}
        <AnimatePresence>
            {!isHistory && isAlertFormVisible && (
            <motion.div
                variants={alertFormVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-background/50 p-4 rounded-b-lg border-t border-border overflow-hidden"
            >
                <h4 className="text-sm font-semibold text-text-primary mb-3">Set Price Alert</h4>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <span className="text-text-secondary">Alert me when price is</span>
                    <select 
                        value={alertCondition} 
                        onChange={e => setAlertCondition(e.target.value as 'ABOVE' | 'BELOW')}
                        className="bg-surface border border-border text-text-primary rounded-md p-2 focus:ring-2 focus:ring-brand"
                    >
                        <option value="ABOVE">Above</option>
                        <option value="BELOW">Below</option>
                    </select>
                    <input 
                        type="number" 
                        value={alertPrice}
                        onChange={e => setAlertPrice(e.target.value)}
                        placeholder="Enter price"
                        className="flex-grow w-full sm:w-auto bg-surface border border-border text-text-primary rounded-md p-2 focus:ring-2 focus:ring-brand"
                        step="any"
                    />
                    <div className="flex items-center gap-2">
                        <button onClick={handleSetAlert} className="px-4 py-2 bg-brand hover:bg-brand-hover text-white rounded-md text-sm font-semibold">Set Alert</button>
                        {priceAlert && <button onClick={handleRemoveAlert} className="px-4 py-2 bg-border hover:bg-opacity-80 text-text-secondary rounded-md text-sm font-semibold">Remove</button>}
                    </div>
                </div>
            </motion.div>
            )}
        </AnimatePresence>
    </motion.div>
  );
};

export default TradeItem;