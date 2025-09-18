import React from 'react';
import { Trade } from '../types';

interface TradeDetailsProps {
    trade: Trade;
    currentPrice?: number;
}

const DetailMetric: React.FC<{ label: string; value: string | React.ReactNode; className?: string; tooltip?: string }> = ({ label, value, className, tooltip }) => (
    <div title={tooltip}>
        <p className="text-xs text-text-secondary">{label}</p>
        <p className={`text-sm font-semibold text-text-primary tabular-nums ${className}`}>{value}</p>
    </div>
);

const TradeDetails: React.FC<TradeDetailsProps> = ({ trade, currentPrice }) => {
    const {
        entryPrice,
        stopLoss,
        takeProfits,
        status,
        closePrice,
        riskPercentage,
        quantity,
        direction,
        journal
    } = trade;

    const isLong = direction === 'LONG';
    const isHistory = status !== 'ACTIVE';
    const displayPrice = isHistory ? (closePrice ?? entryPrice) : (currentPrice ?? entryPrice);

    const finalTpPrice = React.useMemo(() => {
        if (!takeProfits || takeProfits.length === 0) return entryPrice;
        const tpPrices = takeProfits.map(tp => tp.price);
        return isLong ? Math.max(...tpPrices) : Math.min(...tpPrices);
    }, [takeProfits, isLong, entryPrice]);

    const riskPerUnit = Math.abs(entryPrice - stopLoss);
    const rewardPerUnit = Math.abs(finalTpPrice - entryPrice);
    const riskRewardRatio = riskPerUnit > 0 ? rewardPerUnit / riskPerUnit : 0;
    const rrColor = riskRewardRatio >= 2 ? 'text-accent-green' : riskRewardRatio >= 1 ? 'text-accent-yellow' : 'text-accent-red';
    
    const riskAmount = riskPerUnit * quantity;
    const rewardAmount = rewardPerUnit * quantity;
    const positionValue = displayPrice * quantity;

    return (
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

            {journal && journal.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                    <h4 className="text-sm font-semibold text-text-primary mb-2">Journal Entries</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {[...journal].reverse().map((entry, index) => (
                            <div key={index} className="bg-surface p-2 rounded-md border border-border/50">
                                <p className="text-xs text-text-primary whitespace-pre-wrap">{entry.note}</p>
                                <p className="text-xs text-text-dim mt-1 text-right">
                                    {new Date(entry.timestamp).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TradeDetails;