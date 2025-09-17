import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ASSET_SYMBOLS } from '../constants';
import { generateCandlestickData, Timeframe, CandlestickData } from '../services/chartDataService';
import { calculateMA } from '../services/indicatorService';
import { LineData, Time } from 'lightweight-charts';
import UpgradeToPremium from './UpgradeToPremium';
import BacktestChart from './BacktestChart';
import StatCard from './StatCard';
import { PlusIcon, CheckCircleIcon, XCircleIcon, ScaleIcon } from './icons/StatIcons';

interface BacktestingViewProps {
  isPremium: boolean;
  onUpgradeClick: () => void;
}

interface SimulatedTrade {
    entryDate: string;
    entryPrice: number;
    exitDate: string;
    exitPrice: number;
    pnl: number;
}

interface BacktestResults {
    totalPL: number;
    winRate: number;
    profitFactor: number;
    totalTrades: number;
    avgWin: number;
    avgLoss: number;
    trades: SimulatedTrade[];
}

const BacktestingView: React.FC<BacktestingViewProps> = ({ isPremium, onUpgradeClick }) => {
  const [asset, setAsset] = useState(ASSET_SYMBOLS[0]);
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [fastMa, setFastMa] = useState(10);
  const [slowMa, setSlowMa] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<BacktestResults | null>(null);
  const [chartData, setChartData] = useState<{
      ohlc: CandlestickData[],
      fastMa: LineData[],
      slowMa: LineData[],
      signals: { time: Time, position: 'aboveBar' | 'belowBar', color: string, shape: 'arrowUp' | 'arrowDown' }[]
  } | null>(null);

  const runBacktest = useCallback(() => {
    setIsLoading(true);
    setResults(null);
    setChartData(null);
    
    setTimeout(() => { // Simulate async operation
        const historicalData = generateCandlestickData(asset, timeframe, 200);
        const fastMaData = calculateMA(historicalData, fastMa);
        const slowMaData = calculateMA(historicalData, slowMa);

        const trades: SimulatedTrade[] = [];
        const signals: any[] = [];
        let inPosition = false;
        let entryPrice = 0;
        let entryDate = '';
        
        const fastMaMap = new Map(fastMaData.map(d => [(d.time as string), d.value]));
        const slowMaMap = new Map(slowMaData.map(d => [(d.time as string), d.value]));

        for (let i = 1; i < historicalData.length; i++) {
            const currentDate = historicalData[i].time;
            const prevDate = historicalData[i-1].time;

            const currentFast = fastMaMap.get(currentDate);
            const currentSlow = slowMaMap.get(currentDate);
            const prevFast = fastMaMap.get(prevDate);
            const prevSlow = slowMaMap.get(prevDate);

            if (!currentFast || !currentSlow || !prevFast || !prevSlow) continue;

            // Golden Cross (Buy Signal)
            if (prevFast <= prevSlow && currentFast > currentSlow && !inPosition) {
                inPosition = true;
                entryPrice = historicalData[i].close;
                entryDate = historicalData[i].time;
                signals.push({ time: currentDate, position: 'belowBar', color: '#238636', shape: 'arrowUp' });
            }
            // Death Cross (Sell Signal)
            else if (prevFast >= prevSlow && currentFast < currentSlow && inPosition) {
                inPosition = false;
                const exitPrice = historicalData[i].close;
                trades.push({
                    entryDate,
                    entryPrice,
                    exitDate: historicalData[i].time,
                    exitPrice,
                    pnl: exitPrice - entryPrice,
                });
                entryPrice = 0;
                entryDate = '';
                signals.push({ time: currentDate, position: 'aboveBar', color: '#DA3633', shape: 'arrowDown' });
            }
        }
        
        // Calculate metrics
        let totalPL = 0;
        let wins = 0;
        let grossProfit = 0;
        let grossLoss = 0;
        trades.forEach(t => {
            totalPL += t.pnl;
            if (t.pnl > 0) {
                wins++;
                grossProfit += t.pnl;
            } else {
                grossLoss += Math.abs(t.pnl);
            }
        });

        const totalTrades = trades.length;
        const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
        const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : Infinity;
        const avgWin = wins > 0 ? grossProfit / wins : 0;
        const avgLoss = (totalTrades - wins) > 0 ? grossLoss / (totalTrades - wins) : 0;
        
        setResults({
            totalPL,
            winRate,
            profitFactor,
            totalTrades,
            avgWin,
            avgLoss,
            trades,
        });
        
        setChartData({ ohlc: historicalData, fastMa: fastMaData, slowMa: slowMaData, signals });

        setIsLoading(false);
    }, 500); // Simulate network latency
  }, [asset, timeframe, fastMa, slowMa]);

  if (!isPremium) {
    return (
      <div className="flex items-center justify-center h-full">
        <UpgradeToPremium onUpgradeClick={onUpgradeClick} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-text-primary">Strategy Backtester</h1>
      <p className="text-text-secondary">Test a simple Moving Average (MA) Crossover strategy on historical data.</p>
      
      {/* Configuration Panel */}
      <div className="bg-background-surface border border-background-light rounded-lg p-4 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label htmlFor="asset" className="block text-sm font-medium text-text-secondary mb-1">Asset</label>
            <select id="asset" value={asset} onChange={e => setAsset(e.target.value)} className="w-full bg-background border border-background-light text-text-primary rounded-md p-2 focus:ring-2 focus:ring-accent-blue focus:border-accent-blue">
              {ASSET_SYMBOLS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="timeframe" className="block text-sm font-medium text-text-secondary mb-1">Timeframe</label>
            <select id="timeframe" value={timeframe} onChange={e => setTimeframe(e.target.value as Timeframe)} className="w-full bg-background border border-background-light text-text-primary rounded-md p-2 focus:ring-2 focus:ring-accent-blue focus:border-accent-blue">
                <option value="1D">1 Day</option>
                <option value="1W">1 Week</option>
            </select>
          </div>
          <div>
            <label htmlFor="fastMa" className="block text-sm font-medium text-text-secondary mb-1">Fast MA Period</label>
            <input type="number" id="fastMa" value={fastMa} onChange={e => setFastMa(parseInt(e.target.value))} className="w-full bg-background border border-background-light text-text-primary rounded-md p-2 focus:ring-2 focus:ring-accent-blue focus:border-accent-blue" min="2" max="50"/>
          </div>
           <div>
            <label htmlFor="slowMa" className="block text-sm font-medium text-text-secondary mb-1">Slow MA Period</label>
            <input type="number" id="slowMa" value={slowMa} onChange={e => setSlowMa(parseInt(e.target.value))} className="w-full bg-background border border-background-light text-text-primary rounded-md p-2 focus:ring-2 focus:ring-accent-blue focus:border-accent-blue" min="5" max="200"/>
          </div>
          <motion.button 
            onClick={runBacktest} 
            disabled={isLoading}
            whileTap={{ scale: 0.95 }} 
            className="w-full py-2 px-5 bg-accent-blue hover:bg-accent-blueHover rounded-md text-white font-semibold transition-colors disabled:bg-background-light disabled:cursor-not-allowed"
          >
            {isLoading ? 'Running...' : 'Run Backtest'}
          </motion.button>
      </div>

      {/* Results */}
      {isLoading && <div className="text-center py-10 text-text-secondary">Calculating results...</div>}

      {results && chartData && (
          <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-2xl font-bold text-text-primary">Backtest Results for {asset}</h2>

              <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5, staggerChildren: 0.1 }}>
                  <StatCard icon={<PlusIcon />} label="Total P/L" value={`${results.totalPL >= 0 ? '+' : ''}$${results.totalPL.toFixed(2)}`} isCurrency={true} intent={results.totalPL >= 0 ? 'positive' : 'negative'} />
                  <StatCard icon={<CheckCircleIcon />} label="Win Rate" value={`${results.winRate.toFixed(2)}%`} intent={results.winRate >= 50 ? 'positive' : 'negative'} />
                  <StatCard icon={<ScaleIcon />} label="Profit Factor" value={results.profitFactor.toFixed(2)} tooltip="Gross Profit / Gross Loss. Higher is better." intent={results.profitFactor >= 1 ? 'positive' : 'neutral'} />
                  <StatCard icon={<XCircleIcon />} label="Total Trades" value={results.totalTrades} />
              </motion.div>

              <div className="bg-background-surface border border-background-light rounded-lg p-4">
                  <BacktestChart 
                      data={chartData.ohlc}
                      fastMaData={chartData.fastMa}
                      slowMaData={chartData.slowMa}
                      signals={chartData.signals}
                      fastMaPeriod={fastMa}
                      slowMaPeriod={slowMa}
                  />
              </div>

              <div className="bg-background-surface border border-background-light rounded-lg p-4">
                  <h3 className="text-xl font-semibold mb-4">Trade History</h3>
                  <div className="overflow-x-auto max-h-96">
                      <table className="w-full text-left tabular-nums">
                          <thead className="text-xs text-text-secondary uppercase border-b border-background-light sticky top-0 bg-background-surface">
                              <tr>
                                  <th scope="col" className="px-4 py-3">Entry Date</th>
                                  <th scope="col" className="px-4 py-3">Entry Price</th>
                                  <th scope="col" className="px-4 py-3">Exit Date</th>
                                  <th scope="col" className="px-4 py-3">Exit Price</th>
                                  <th scope="col" className="px-4 py-3">P/L</th>
                              </tr>
                          </thead>
                          <tbody>
                              {results.trades.map((trade, index) => (
                                  <tr key={index} className="border-b border-background-light hover:bg-background-light/50">
                                      <td className="px-4 py-3 text-text-secondary">{trade.entryDate}</td>
                                      <td className="px-4 py-3 text-text-primary">${trade.entryPrice.toFixed(2)}</td>
                                      <td className="px-4 py-3 text-text-secondary">{trade.exitDate}</td>
                                      <td className="px-4 py-3 text-text-primary">${trade.exitPrice.toFixed(2)}</td>
                                      <td className={`px-4 py-3 font-semibold ${trade.pnl >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                                        ${trade.pnl.toFixed(2)}
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          </motion.div>
      )}

    </div>
  );
};

export default BacktestingView;
