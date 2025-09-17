import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MarketData, Trade, TradeDirection, UserSettings } from '../types';
import { tradingViewService } from '../services/tradingViewService';
import SearchIcon from './icons/SearchIcon';
import CandlestickChart from './CandlestickChart';
import OrderBook from './OrderBook';

interface MarketViewProps {
  activeTrades: Trade[];
  onNewTrade: (prefillData: { asset: string; direction: TradeDirection; entryPrice: number; }) => void;
  userSettings: UserSettings;
}

const MarketView: React.FC<MarketViewProps> = ({ activeTrades, onNewTrade, userSettings }) => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFlashes, setPriceFlashes] = useState<Record<string, 'up' | 'down'>>({});
  const [selectedAsset, setSelectedAsset] = useState<MarketData | null>(null);
  const prevMarketDataRef = useRef<MarketData[]>([]);

  const activeSymbols = useMemo(() => new Set(activeTrades.map(t => t.asset)), [activeTrades]);

  useEffect(() => {
    setMarketData(tradingViewService.getMarketData()); // Initial fetch
    
    const interval = setInterval(() => {
      setMarketData(tradingViewService.getMarketData());
    }, 2000); // Refresh every 2 seconds to match service

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
      const flashes: Record<string, 'up' | 'down'> = {};
      const prevPrices = new Map(prevMarketDataRef.current.map(d => [d.symbol, d.price]));
      
      marketData.forEach(asset => {
        const prevPrice = prevPrices.get(asset.symbol);
        if (prevPrice !== undefined && asset.price !== prevPrice) {
          if (asset.price > prevPrice) flashes[asset.symbol] = 'up';
          else if (asset.price < prevPrice) flashes[asset.symbol] = 'down';
        }
      });
      
      if (Object.keys(flashes).length > 0) {
        setPriceFlashes(flashes);
        const timer = setTimeout(() => setPriceFlashes({}), 700);
        return () => clearTimeout(timer);
      }
      
      prevMarketDataRef.current = marketData;
  }, [marketData]);

  // When market data updates, also update the selectedAsset object to get the latest price
  useEffect(() => {
    if (selectedAsset) {
      const updatedAsset = marketData.find(d => d.symbol === selectedAsset.symbol);
      if (updatedAsset) {
        setSelectedAsset(updatedAsset);
      }
    }
  }, [marketData, selectedAsset]);

  const filteredMarketData = useMemo(() => {
    if (!searchTerm) {
        return marketData;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    return marketData.filter(asset => 
        asset.symbol.toLowerCase().includes(lowercasedFilter) ||
        asset.name.toLowerCase().includes(lowercasedFilter)
    );
  }, [marketData, searchTerm]);
  
  const handleRowClick = (asset: MarketData) => {
    if (selectedAsset?.symbol === asset.symbol) {
      setSelectedAsset(null); // Toggle off if clicking the same asset
    } else {
      setSelectedAsset(asset);
    }
  };

  return (
    <div>
      <div className="mb-4 relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <SearchIcon />
          </span>
          <input
              type="text"
              placeholder="Search by symbol or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-sm bg-background border border-background-light text-text-primary rounded-md py-2 pl-10 pr-4 focus:ring-2 focus:ring-accent-blue focus:border-accent-blue transition-colors"
              aria-label="Search market data"
          />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left tabular-nums">
          <thead className="text-xs text-text-secondary uppercase border-b border-background-light">
            <tr>
              <th scope="col" className="px-6 py-3">Asset</th>
              <th scope="col" className="px-6 py-3 text-right">Last Price</th>
              <th scope="col" className="px-6 py-3 text-right">24h Change</th>
              <th scope="col" className="px-6 py-3 text-right">24h High</th>
              <th scope="col" className="px-6 py-3 text-right">24h Low</th>
              <th scope="col" className="px-6 py-3 text-right">24h Volume</th>
              <th scope="col" className="px-6 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredMarketData.length > 0 ? (
              filteredMarketData.map((asset) => {
                const isPositive = asset.changePercent >= 0;
                const changeColor = isPositive ? 'text-accent-green' : 'text-accent-red';
                
                const flash = priceFlashes[asset.symbol];
                const flashClass = flash === 'up' ? 'bg-accent-green/10' : flash === 'down' ? 'bg-accent-red/10' : '';
                const isSelected = selectedAsset?.symbol === asset.symbol;

                return (
                  <tr
                    key={asset.symbol}
                    className={`border-b border-background-light transition-colors duration-300 cursor-pointer ${flashClass} ${isSelected ? 'bg-accent-blue/10' : 'hover:bg-background-light/50'}`}
                    onClick={() => handleRowClick(asset)}
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-text-primary">{asset.symbol}</div>
                      <div className="text-sm text-text-secondary">{asset.name}</div>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-text-primary">
                      ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                    </td>
                    <td className={`px-6 py-4 text-right font-semibold ${changeColor}`}>
                      <div>{isPositive ? '+' : ''}{asset.change.toFixed(4)}</div>
                      <div>{isPositive ? '+' : ''}{asset.changePercent.toFixed(2)}%</div>
                    </td>
                    <td className="px-6 py-4 text-right text-text-primary">${asset.high24h.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</td>
                    <td className="px-6 py-4 text-right text-text-primary">${asset.low24h.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</td>
                    <td className="px-6 py-4 text-right text-text-secondary">{asset.volume}</td>
                    <td className="px-6 py-4 text-center">
                        <div onClick={(e) => e.stopPropagation()} className="flex items-center justify-center gap-2">
                           <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={() => onNewTrade({ asset: asset.symbol, direction: 'LONG', entryPrice: asset.price })}
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-accent-green hover:bg-accent-greenHover rounded-md transition-colors w-[50px]"
                              aria-label={`Buy ${asset.symbol}`}
                          >
                              Buy
                          </motion.button>
                          <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={() => onNewTrade({ asset: asset.symbol, direction: 'SHORT', entryPrice: asset.price })}
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-accent-red hover:bg-accent-redHover rounded-md transition-colors w-[50px]"
                              aria-label={`Sell ${asset.symbol}`}
                          >
                              Sell
                          </motion.button>
                        </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-12 text-text-secondary">
                    <p className="font-semibold">No assets found for "{searchTerm}"</p>
                    <p className="text-sm mt-1">Try a different search term.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
       <AnimatePresence>
        {selectedAsset && (
          <motion.div
            key={selectedAsset.symbol}
            className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <div className="lg:col-span-2">
              <CandlestickChart assetSymbol={selectedAsset.symbol} userSettings={userSettings} />
            </div>
            <div className="lg:col-span-1">
              <OrderBook assetSymbol={selectedAsset.symbol} basePrice={selectedAsset.price} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MarketView;