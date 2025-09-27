import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MarketData, Trade, TradeDirection, UserSettings, Prices, PriceAlert, GlobalPriceAlert } from '../types';
import { tradingViewService } from '../services/tradingViewService';
import SearchIcon from './icons/SearchIcon';
import CandlestickChart from './CandlestickChart';
import OrderBook from './OrderBook';
import AssetTradeList from './AssetTradeList';
import BellIcon from './icons/BellIcon';

interface MarketViewProps {
  trades: Trade[];
  activeTrades: Trade[];
  onNewTrade: (prefillData: { asset: string; direction: TradeDirection; entryPrice: number; }) => void;
  userSettings: UserSettings;
  selectedAssetSymbol: string | null;
  setSelectedAssetSymbol: (symbol: string | null) => void;
  prices: Prices;
  onEditTrade: (trade: Trade) => void;
  onDeleteTrade: (tradeId: string) => void;
  onSetPriceAlert: (tradeId: string, priceAlert: Omit<PriceAlert, 'triggered'> | null) => void;
  onCloseTrade: (trade: Trade) => void;
  onOpenJournal: (trade: Trade) => void;
  globalPriceAlerts: GlobalPriceAlert[];
  onSetGlobalAlert: (asset: MarketData, alert?: GlobalPriceAlert) => void;
  onDeleteGlobalAlert: (alertId: string) => void;
}

const MarketView = ({
  trades,
  activeTrades,
  onNewTrade,
  userSettings,
  selectedAssetSymbol,
  setSelectedAssetSymbol,
  prices,
  onEditTrade,
  onDeleteTrade,
  onSetPriceAlert,
  onCloseTrade,
  onOpenJournal,
  globalPriceAlerts,
  onSetGlobalAlert,
}: MarketViewProps) => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFlashes, setPriceFlashes] = useState<Record<string, 'up' | 'down'>>({});
  const prevMarketDataRef = useRef<MarketData[]>([]);
  
  const selectedAsset = useMemo(() => {
    if (!selectedAssetSymbol) return null;
    return marketData.find(d => d.symbol === selectedAssetSymbol) || null;
  }, [marketData, selectedAssetSymbol]);

  useEffect(() => {
    try {
        setError(null);
        setIsLoading(true);
        const initialData = tradingViewService.getMarketData();
        setMarketData(initialData);

        const handleUpdate = (updatedAsset: MarketData) => {
            setMarketData(currentData => 
                currentData.map(asset => 
                    asset.symbol === updatedAsset.symbol ? updatedAsset : asset
                )
            );
        };

        const subscriptions: { symbol: string; handler: (asset: MarketData) => void }[] = [];
        initialData.forEach(asset => {
            const handler = (updatedAsset: MarketData) => handleUpdate(updatedAsset);
            tradingViewService.subscribe(asset.symbol, handler);
            subscriptions.push({ symbol: asset.symbol, handler });
        });

        return () => {
            subscriptions.forEach(({ symbol, handler }) => {
                tradingViewService.unsubscribe(symbol, handler);
            });
        };
    } catch (e) {
        setError("Failed to load initial market data. Please refresh the page.");
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
      if (isLoading) return;
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
  }, [marketData, isLoading]);

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
    if (selectedAssetSymbol === asset.symbol) {
      setSelectedAssetSymbol(null);
    } else {
      setSelectedAssetSymbol(asset.symbol);
    }
  };

  const SkeletonRow = () => (
    <tr className="border-b border-border animate-pulse">
      <td className="px-6 py-4"><div className="h-4 bg-border rounded w-3/4"></div><div className="h-3 bg-border rounded w-1/2 mt-2"></div></td>
      <td className="px-6 py-4 text-right"><div className="h-4 bg-border rounded w-full ml-auto"></div></td>
      <td className="px-6 py-4 text-right"><div className="h-4 bg-border rounded w-3/4 ml-auto"></div></td>
      <td className="px-6 py-4 text-right"><div className="h-4 bg-border rounded w-full ml-auto"></div></td>
      <td className="px-6 py-4 text-right"><div className="h-4 bg-border rounded w-full ml-auto"></div></td>
      <td className="px-6 py-4 text-right"><div className="h-4 bg-border rounded w-1/2 ml-auto"></div></td>
      <td className="px-6 py-4 text-center"><div className="h-8 bg-border rounded w-full"></div></td>
    </tr>
  );

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
              className="w-full max-w-sm bg-surface border border-border text-text-primary rounded-md py-2 pl-10 pr-4 focus:ring-2 focus:ring-brand focus:border-brand transition-colors"
              aria-label="Search market data"
          />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left tabular-nums">
          <thead className="text-xs text-text-secondary uppercase border-b border-border">
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
            {isLoading ? (
              [...Array(8)].map((_, i) => <SkeletonRow key={i} />)
            ) : error ? (
              <tr><td colSpan={7} className="text-center py-12 text-accent-red font-semibold">{error}</td></tr>
            ) : filteredMarketData.length > 0 ? (
              filteredMarketData.map((asset) => {
                const isPositive = asset.changePercent >= 0;
                const changeColor = isPositive ? 'text-accent-green' : 'text-accent-red';
                
                const flash = priceFlashes[asset.symbol];
                const flashClass = flash === 'up' ? 'bg-accent-green/10' : flash === 'down' ? 'bg-accent-red/10' : '';
                const isSelected = selectedAssetSymbol === asset.symbol;
                const activeAlert = globalPriceAlerts.find(a => a.asset === asset.symbol);

                return (
                  <tr
                    key={asset.symbol}
                    className={`border-b border-border transition-colors duration-300 cursor-pointer ${flashClass} ${isSelected ? 'bg-brand/10' : 'hover:bg-surface/50'}`}
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
                          <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={() => onSetGlobalAlert(asset, activeAlert)}
                              className={`p-2 bg-surface hover:bg-border rounded-md transition-colors ${activeAlert ? 'text-accent-yellow hover:text-accent-yellow' : 'text-text-secondary hover:text-brand'}`}
                              aria-label={`Set price alert for ${asset.symbol}`}
                          >
                              <BellIcon className="h-4 w-4" />
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
            <div className="lg:col-span-3 mt-6">
              <div className="bg-surface border border-border rounded-lg p-4 sm:p-6">
                <h3 className="text-xl font-bold text-text-primary mb-4">Your Trades for {selectedAsset.symbol}</h3>
                <AssetTradeList 
                  assetSymbol={selectedAsset.symbol}
                  trades={trades}
                  prices={prices}
                  onEditTrade={onEditTrade}
                  onDeleteTrade={onDeleteTrade}
                  onSetPriceAlert={onSetPriceAlert}
                  onCloseTrade={onCloseTrade}
                  onOpenJournal={onOpenJournal}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MarketView;