

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
// FIX: Added JournalEntry to imports
import { Trade, View, Alert, PriceAlert, User, UserStats, UserSettings, TradeDirection, ProTrader, Prices, GlobalPriceAlert, MarketData, JournalEntry } from './types';
import { useAuth } from './hooks/useAuth';
import { useTradeMonitor } from './hooks/useTradeMonitor';

// Components
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import NewTradeForm from './components/NewTradeForm';
import EditTradeModal from './components/EditTradeModal';
import AlertsView from './components/AlertsView';
import AlertModal from './components/AlertModal';
import TradeChatbot from './components/TradeChatbot';
import MarketView from './components/MarketView';
import PortfolioView from './components/PortfolioView';
import StrategyBuilder from './components/StrategyBuilder';
import JournalModal from './components/JournalModal';
import QuickTradeModal from './components/QuickTradeModal';
import OnboardingModal from './components/OnboardingModal';
import BacktestingView from './components/BacktestingView';
import CopyTradingView from './components/CopyTradingView';
import HistoryView from './components/HistoryView';
import GlobalPriceAlertModal from './components/GlobalPriceAlertModal';
import CloseTradeModal from './components/CloseTradeModal';
import UpgradeToPremium from './components/UpgradeToPremium';
import AICopilotView from './components/AICopilotView';

// Modals for User/Auth
import AccountModal from './components/AccountModal';
import UpgradeModal from './components/UpgradeModal';
import SettingsModal from './components/SettingsModal';
import AuthPage from './components/AuthPage';

// Toasts
import ToastContainer from './components/ToastContainer';

// Constants and services
import { MOCK_TRADES, DEFAULT_USER_SETTINGS } from './constants';
import { proTraderService } from './services/proTraderService';

const ALERT_AUDIO_SRC = `data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaW5nIGNyZWF0ZWQgYnkgSm9zZXBoIFNhcmRpbiBhdCBqc2FyZGluLmNvbS9zb3VuZG-lZmZlY3RzLwAAAIBvAAAAANIAAAARMQ8EAKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq-qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqADRAAAGkAAAAAAAAAABQSU5GTwAAAAwAAAABAAADSAAAAABMYXZjNTguMjkuMTAwAAAAAAAAAAAAAAAAAAAAAAAAAAAA//MQxAAD/GkAAAAAAAAAAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX1UQxAAD/GkAAAAAAAAAAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/UQxRAD/8GkAAAAAAAAAAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/UQxRAD/8GkAAAAAAAAAAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/UQxRAD/8GkAAAAAAAAAAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/9UQxRAD/8GkAAAAAAAAAAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/9UQxBAD/8GkAAAAAAAAAAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/9UQxBAD/8GkAAAAAAAAAAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/1UQxBAD/8GkAAAAAAAAAAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/5UQxRAD/8GkAAAAAAAAAAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/5UQxRAD/8GkAAAAAAAAAAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/1UQxBAD/8GkAAAAAAAAAAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/1UQxBAD/8GkAAAAAAAAAAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/1UQxBAD/8GkAAAAAAAAAAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/5UQxRAD/8GkAAAAAAAAAAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/5UQxRAD/8GkAAAAAAAAAAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/1UQxBAD/8GkAAAAAAAAAAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX`;

const App: React.FC = () => {
    // Main state
    const [trades, setTrades] = useState<Trade[]>(() => {
        const savedTrades = localStorage.getItem('trades');
        return savedTrades ? JSON.parse(savedTrades) : MOCK_TRADES;
    });
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [globalPriceAlerts, setGlobalPriceAlerts] = useState<GlobalPriceAlert[]>(() => {
        const saved = localStorage.getItem('globalPriceAlerts');
        return saved ? JSON.parse(saved) : [];
    });
    const [view, setView] = useState<View>('copilot');
    const { user, setUser, logout, loadingAuth, authError } = useAuth();
    const [userSettings, setUserSettings] = useState<UserSettings>(() => {
        try {
            const savedSettings = localStorage.getItem('userSettings');
            if (savedSettings) {
                const parsedSettings = JSON.parse(savedSettings);
                // Perform a deep merge to ensure all keys from defaults are present
                const mergedSettings: UserSettings = {
                    ...DEFAULT_USER_SETTINGS,
                    ...parsedSettings,
                    notifications: {
                        ...DEFAULT_USER_SETTINGS.notifications,
                        ...(parsedSettings.notifications || {}),
                    },
                    chart: {
                        ...DEFAULT_USER_SETTINGS.chart,
                        ...(parsedSettings.chart || {}),
                    },
                };
                return mergedSettings;
            }
        } catch (error) {
            console.error("Failed to parse user settings from localStorage, using defaults.", error);
        }
        return DEFAULT_USER_SETTINGS;
    });
    const [hasOnboarded, setHasOnboarded] = useState<boolean>(() => {
        return localStorage.getItem('hasOnboarded') === 'true';
    });
    const [copiedTraders, setCopiedTraders] = useState<Set<string>>(() => {
        const saved = localStorage.getItem('copiedTraders');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });
    const [selectedMarketAsset, setSelectedMarketAsset] = useState<string | null>(null);
    
    // Modal states
    const [isNewTradeFormVisible, setIsNewTradeFormVisible] = useState(false);
    const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
    const [closingTrade, setClosingTrade] = useState<Trade | null>(null);
    const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
    const [journalingTrade, setJournalingTrade] = useState<Trade | null>(null);
    const [quickTradeData, setQuickTradeData] = useState<Partial<Omit<Trade, 'id' | 'status' | 'openDate'>> | null>(null);
    const [globalAlertData, setGlobalAlertData] = useState<{ asset: MarketData; alert?: GlobalPriceAlert } | null>(null);

    // Auth/User modal states
    const [isAccountModalVisible, setIsAccountModalVisible] = useState(false);
    const [isUpgradeModalVisible, setIsUpgradeModalVisible] = useState(false);
    const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);

    // Toast state
    const [toasts, setToasts] = useState<Alert[]>([]);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        localStorage.setItem('trades', JSON.stringify(trades));
    }, [trades]);

    useEffect(() => {
        localStorage.setItem('userSettings', JSON.stringify(userSettings));
    }, [userSettings]);

    useEffect(() => {
        localStorage.setItem('copiedTraders', JSON.stringify(Array.from(copiedTraders)));
    }, [copiedTraders]);
    
    useEffect(() => {
        localStorage.setItem('globalPriceAlerts', JSON.stringify(globalPriceAlerts));
    }, [globalPriceAlerts]);

    // Derived state
    const activeTrades = useMemo(() => trades.filter(t => t.status === 'ACTIVE'), [trades]);
    const tradeHistory = useMemo(() => trades.filter(t => t.status !== 'ACTIVE').sort((a, b) => new Date(b.closeDate!).getTime() - new Date(a.closeDate!).getTime()), [trades]);
    const unreadAlerts = useMemo(() => alerts.filter(a => !a.read), [alerts]);

    const createAlert = useCallback((trade: Trade | { asset: string, id?: string }, message: string, type: 'success' | 'error' | 'info', skipToast = false) => {
        const newAlert: Alert = {
            id: `alert-${Date.now()}-${Math.random()}`,
            tradeId: 'id' in trade ? trade.id : 'system-global',
            asset: trade.asset,
            message,
            timestamp: new Date().toISOString(),
            type,
            read: false,
        };
        setAlerts(prev => [newAlert, ...prev]);
        if (!skipToast) {
            setToasts(prev => [newAlert, ...prev]);
            if (userSettings.notifications.soundAlerts) {
                audioRef.current?.play().catch(error => console.error("Audio playback failed:", error));
            }
        }
    }, [userSettings.notifications.soundAlerts]);
    
    const handleTradeTrigger = useCallback((trade: Trade, status: 'CLOSED_TP' | 'CLOSED_SL', price: number) => {
        setTrades(prev => prev.map(t => {
            if (t.id === trade.id) {
                const updatedTrade = {
                    ...t,
                    status,
                    closePrice: price,
                    closeDate: new Date().toISOString(),
                };

                const isWin = (t.direction === 'LONG' && price > t.entryPrice) || (t.direction === 'SHORT' && price < t.entryPrice);
                const message = `${status === 'CLOSED_TP' ? 'Take profit hit' : 'Stop loss triggered'} for ${t.asset} at $${price.toLocaleString()}.`;
                createAlert(updatedTrade, message, isWin ? 'success' : 'error');

                return updatedTrade;
            }
            return t;
        }));
    }, [createAlert]);

    const handleManualClose = useCallback((tradeToClose: Trade, closePrice: number) => {
        setTrades(prev => prev.map(t => {
            if (t.id === tradeToClose.id) {
                const isWin = (t.direction === 'LONG' && closePrice > t.entryPrice) || (t.direction === 'SHORT' && closePrice < t.entryPrice);
                const status: 'CLOSED_TP' | 'CLOSED_SL' = isWin ? 'CLOSED_TP' : 'CLOSED_SL';

                const updatedTrade = { ...t, status, closePrice, closeDate: new Date().toISOString() };
                
                const message = `Manually closed ${t.asset} trade at $${closePrice.toLocaleString()}.`;
                createAlert(updatedTrade, message, isWin ? 'success' : 'error');
                
                return updatedTrade;
            }
            return t;
        }));
        setClosingTrade(null);
    }, [createAlert]);

    const handleCustomAlert = useCallback((trade: Trade) => {
        setTrades(prev => prev.map(t => {
            if (t.id === trade.id && t.priceAlert && !t.priceAlert.triggered) {
                const message = `Price alert for ${t.asset}: Price is now ${t.priceAlert.condition.toLowerCase()} $${t.priceAlert.price.toLocaleString()}.`;
                createAlert(t, message, 'info');
                return { ...t, priceAlert: { ...t.priceAlert, triggered: true } };
            }
            return t;
        }));
    }, [createAlert]);
    
    const handleGlobalAlertTrigger = useCallback((globalAlert: GlobalPriceAlert) => {
        const message = `Price alert for ${globalAlert.asset}: Price is now ${globalAlert.condition.toLowerCase()} $${globalAlert.price.toLocaleString()}.`;
        createAlert({ asset: globalAlert.asset }, message, 'info');
        setGlobalPriceAlerts(prev => prev.filter(a => a.id !== globalAlert.id));
    }, [createAlert]);

    const { prices } = useTradeMonitor(activeTrades, handleTradeTrigger, handleCustomAlert, globalPriceAlerts, handleGlobalAlertTrigger);

    const addTrade = useCallback((tradeData: Omit<Trade, 'id' | 'status' | 'openDate'>) => {
        const newTrade: Trade = {
            ...tradeData,
            id: `trade-${Date.now()}`,
            status: 'ACTIVE',
            openDate: new Date().toISOString(),
        };
        setTrades(prev => [newTrade, ...prev]);
        setIsNewTradeFormVisible(false);
        setQuickTradeData(null);
        createAlert(newTrade, `New ${newTrade.direction} trade logged for ${newTrade.asset}.`, 'info', true);

        // Navigate to market view and select the new asset
        setView('market');
        setSelectedMarketAsset(newTrade.asset);

        return newTrade; // Return the created trade for notifications
    }, [createAlert]);
    
    // Copy Trading logic
    useEffect(() => {
        const handleNewProTrade = (trader: ProTrader, trade: Omit<Trade, 'id' | 'status' | 'openDate'>) => {
            if (copiedTraders.has(trader.id)) {
                const newCopiedTrade = addTrade(trade);
                // Create a special toast for copied trades
                // FIX: Fill in all required properties for the Alert type.
                const toastAlert: Alert = {
                    id: `toast-${Date.now()}`,
                    tradeId: newCopiedTrade.id,
                    asset: newCopiedTrade.asset,
                    message: `Copied ${trader.name}'s new ${newCopiedTrade.direction} trade.`,
                    timestamp: new Date().toISOString(),
                    type: 'info',
                    read: false,
                };
                setToasts(prev => [toastAlert, ...prev]);
            }
        };

        if (user?.subscriptionTier === 'Premium') {
            proTraderService.subscribe(handleNewProTrade);
        }

        return () => proTraderService.unsubscribe();
    }, [copiedTraders, addTrade, user?.subscriptionTier]);

    // Additional handlers for UI interactivity
    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const markAlertAsRead = useCallback((alertId: string) => {
        setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, read: true } : a));
    }, []);
    
    const updateTrade = useCallback((updatedTrade: Trade) => {
        setTrades(prev => prev.map(t => t.id === updatedTrade.id ? updatedTrade : t));
        setEditingTrade(null);
        createAlert(updatedTrade, `Trade for ${updatedTrade.asset} has been updated.`, 'info', true);
    }, [createAlert]);

    const deleteTrade = useCallback((tradeId: string) => {
        if (window.confirm('Are you sure you want to delete this active trade? This cannot be undone.')) {
            setTrades(prev => prev.filter(t => t.id !== tradeId));
        }
    }, []);
    
    const deleteTrades = useCallback((tradeIds: string[]) => {
        setTrades(prev => prev.filter(t => !tradeIds.includes(t.id)));
    }, []);

    const setPriceAlert = useCallback((tradeId: string, priceAlert: Omit<PriceAlert, 'triggered'> | null) => {
        setTrades(prev => prev.map(t =>
            t.id === tradeId ? { ...t, priceAlert: priceAlert ? { ...priceAlert, triggered: false } : null } : t
        ));
    }, []);

    const addJournalNote = useCallback((tradeId: string, note: string) => {
        const newEntry: JournalEntry = {
            timestamp: new Date().toISOString(),
            note,
        };
        setTrades(prev => prev.map(t => {
            if (t.id === tradeId) {
                const updatedTrade = { ...t, journal: [...(t.journal || []), newEntry] };
                setJournalingTrade(updatedTrade);
                return updatedTrade;
            }
            return t;
        }));
    }, []);
    
    const addTradeAndSimulate = useCallback((tradeData: Omit<Trade, 'id' | 'status' | 'openDate'>) => {
        const newTrade = addTrade(tradeData);
        if (newTrade) {
            setTimeout(() => {
                const isWin = Math.random() > 0.5;
                const status = isWin ? 'CLOSED_TP' : 'CLOSED_SL';
                const closePrice = isWin ? newTrade.takeProfits[0].price : newTrade.stopLoss;
                handleTradeTrigger(newTrade, status, closePrice);
                createAlert(newTrade, `Simulated trade for ${newTrade.asset} closed as a ${isWin ? 'win' : 'loss'}.`, isWin ? 'success' : 'error');
            }, 500);
        }
        setIsNewTradeFormVisible(false);
    }, [addTrade, handleTradeTrigger, createAlert]);
    
    const simulateTradeOutcome = useCallback((tradeId: string) => {
        const trade = trades.find(t => t.id === tradeId);
        if (trade) {
            const isWin = Math.random() > 0.5;
            const status = isWin ? 'CLOSED_TP' : 'CLOSED_SL';
            const closePrice = isWin ? trade.takeProfits[0].price : trade.stopLoss;
            handleTradeTrigger(trade, status, closePrice);
        }
        setEditingTrade(null);
    }, [trades, handleTradeTrigger]);
    
    const handleCommentaryFetched = useCallback((alertId: string, commentary: string) => {
        setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, aiCommentary: commentary } : a));
    }, []);

    const handleSetGlobalAlert = useCallback((alertData: Omit<GlobalPriceAlert, 'createdAt'>) => {
        setGlobalPriceAlerts(prev => {
            const existing = prev.find(a => a.id === alertData.id);
            if (existing) {
                return prev.map(a => a.id === alertData.id ? { ...a, ...alertData, createdAt: a.createdAt } : a);
            }
            return [...prev, { ...alertData, createdAt: new Date().toISOString() }];
        });
        setGlobalAlertData(null);
    }, []);
    
    const handleDeleteGlobalAlert = useCallback((alertId: string) => {
        setGlobalPriceAlerts(prev => prev.filter(a => a.id !== alertId));
        setGlobalAlertData(null);
    }, []);
    
    const handleUpgrade = useCallback(() => {
        if (user) {
            setUser({ ...user, subscriptionTier: 'Premium' });
            setIsUpgradeModalVisible(false);
        }
    }, [user, setUser]);

    const updateUserSettings = useCallback((newSettings: UserSettings) => {
        setUserSettings(newSettings);
    }, []);
    
    const toggleCopiedTrader = useCallback((traderId: string) => {
        setCopiedTraders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(traderId)) {
                newSet.delete(traderId);
            } else {
                newSet.add(traderId);
            }
            return newSet;
        });
    }, []);

    const stats: UserStats = useMemo(() => {
        const closedTrades = tradeHistory;
        const totalTrades = trades.length;
        
        let totalPL = 0;
        let wins = 0;
        let grossProfit = 0;
        let grossLoss = 0;

        closedTrades.forEach(trade => {
            if (trade.closePrice) {
                const pnl = (trade.closePrice - trade.entryPrice) * trade.quantity * (trade.direction === 'LONG' ? 1 : -1);
                totalPL += pnl;
                if (pnl > 0) {
                    wins++;
                    grossProfit += pnl;
                } else {
                    grossLoss += Math.abs(pnl);
                }
            }
        });
        
        activeTrades.forEach(trade => {
            const currentPrice = prices[trade.asset] || trade.entryPrice;
            const unrealizedPnl = (currentPrice - trade.entryPrice) * trade.quantity * (trade.direction === 'LONG' ? 1 : -1);
            totalPL += unrealizedPnl;
        });

        const closedTradesCount = closedTrades.length;
        if (closedTradesCount === 0) {
            return { totalTrades, winRate: 0, totalPL: parseFloat(totalPL.toFixed(2)), avgWin: 0, avgLoss: 0, profitFactor: 0 };
        }

        const winRate = (wins / closedTradesCount) * 100;
        const avgWin = wins > 0 ? grossProfit / wins : 0;
        const avgLoss = (closedTradesCount - wins) > 0 ? grossLoss / (closedTradesCount - wins) : 0;
        const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : Infinity;

        return {
            totalTrades,
            winRate: parseFloat(winRate.toFixed(2)),
            totalPL: parseFloat(totalPL.toFixed(2)),
            avgWin: parseFloat(avgWin.toFixed(2)),
            avgLoss: parseFloat(avgLoss.toFixed(2)),
            profitFactor: isFinite(profitFactor) ? parseFloat(profitFactor.toFixed(2)) : 0,
        };
    }, [trades, tradeHistory, activeTrades, prices]);

    const renderView = () => {
        if (!user) return null;
        switch (view) {
            case 'copilot':
                return user.subscriptionTier === 'Premium' ? <AICopilotView user={user} stats={stats} activeTrades={activeTrades} onQuickTrade={setQuickTradeData} prices={prices} onCloseTrade={setClosingTrade} onUpdateTrade={updateTrade} /> : <UpgradeToPremium onUpgradeClick={() => setIsUpgradeModalVisible(true)} />;
            case 'dashboard':
                return <Dashboard stats={stats} trades={trades} prices={prices} onNewTrade={() => setIsNewTradeFormVisible(true)} onEditTrade={setEditingTrade} onDeleteTrade={deleteTrade} onSetPriceAlert={setPriceAlert} onCloseTrade={setClosingTrade} onOpenJournal={setJournalingTrade} onQuickTrade={setQuickTradeData} />;
            case 'history':
                return <HistoryView tradeHistory={tradeHistory} onOpenJournal={setJournalingTrade} onDeleteTrades={deleteTrades} />;
            case 'alerts':
                return <AlertsView alerts={alerts} onShowAlert={(alert) => { setSelectedAlert(alert); markAlertAsRead(alert.id); }} />;
            case 'chatbot':
                return user.subscriptionTier === 'Premium' ? <TradeChatbot onAddTrade={addTrade} /> : <UpgradeToPremium onUpgradeClick={() => setIsUpgradeModalVisible(true)} />;
            case 'market':
                return <MarketView trades={trades} activeTrades={activeTrades} onNewTrade={(data) => setQuickTradeData(data)} userSettings={userSettings} selectedAssetSymbol={selectedMarketAsset} setSelectedAssetSymbol={setSelectedMarketAsset} prices={prices} onEditTrade={setEditingTrade} onDeleteTrade={deleteTrade} onSetPriceAlert={setPriceAlert} onCloseTrade={setClosingTrade} onOpenJournal={setJournalingTrade} globalPriceAlerts={globalPriceAlerts} onSetGlobalAlert={(asset, alert) => setGlobalAlertData({ asset, alert })} onDeleteGlobalAlert={handleDeleteGlobalAlert} />;
            case 'portfolio':
                return <PortfolioView stats={stats} activeTrades={activeTrades} tradeHistory={tradeHistory} prices={prices} />;
            case 'strategy':
                return <StrategyBuilder isPremium={user.subscriptionTier === 'Premium'} onUpgradeClick={() => setIsUpgradeModalVisible(true)} />;
            case 'backtesting':
                return <BacktestingView isPremium={user.subscriptionTier === 'Premium'} onUpgradeClick={() => setIsUpgradeModalVisible(true)} />;
            case 'copy-trading':
                return <CopyTradingView isPremium={user.subscriptionTier === 'Premium'} onUpgradeClick={() => setIsUpgradeModalVisible(true)} copiedTraders={copiedTraders} onToggleCopy={toggleCopiedTrader} />;
            default:
                return <Dashboard stats={stats} trades={trades} prices={prices} onNewTrade={() => setIsNewTradeFormVisible(true)} onEditTrade={setEditingTrade} onDeleteTrade={deleteTrade} onSetPriceAlert={setPriceAlert} onCloseTrade={setClosingTrade} onOpenJournal={setJournalingTrade} onQuickTrade={setQuickTradeData} />;
        }
    };

    if (loadingAuth) {
        return (
            <div className="bg-background min-h-screen flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-t-brand border-border rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return <AuthPage authError={authError} />;
    }
    
    // FIX: Add the main JSX return to render the application.
    return (
        <div className="bg-background text-text-primary min-h-screen font-sans">
            {!hasOnboarded && <OnboardingModal onComplete={() => { setHasOnboarded(true); localStorage.setItem('hasOnboarded', 'true'); }} />}
            <audio ref={audioRef} src={ALERT_AUDIO_SRC} />
            <ToastContainer
                toasts={toasts}
                onDismiss={removeToast}
                onShowAlert={(alert) => { setSelectedAlert(alert); markAlertAsRead(alert.id); }}
            />

            <div className="flex">
                <Sidebar 
                    user={user}
                    activeView={view}
                    onNavigate={setView}
                    onLogout={logout}
                    alertCount={unreadAlerts.length}
                    onShowAccount={() => setIsAccountModalVisible(true)}
                    onShowSettings={() => setIsSettingsModalVisible(true)}
                />
                <main className="flex-1 p-6 sm:p-8 h-screen overflow-y-auto">
                    {renderView()}
                </main>
            </div>

            <AnimatePresence>
                {isNewTradeFormVisible && <NewTradeForm onClose={() => setIsNewTradeFormVisible(false)} onAddTrade={addTrade} onAddAndSimulate={addTradeAndSimulate} />}
                {editingTrade && <EditTradeModal trade={editingTrade} onClose={() => setEditingTrade(null)} onUpdateTrade={updateTrade} onSimulateOutcome={simulateTradeOutcome} />}
                {closingTrade && <CloseTradeModal trade={closingTrade} prices={prices} onClose={() => setClosingTrade(null)} onConfirmClose={(closePrice) => handleManualClose(closingTrade, closePrice)} />}
                {selectedAlert && <AlertModal alert={selectedAlert} trades={trades} onClose={() => setSelectedAlert(null)} onCommentaryFetched={handleCommentaryFetched} />}
                {journalingTrade && <JournalModal trade={journalingTrade} onClose={() => setJournalingTrade(null)} onAddNote={(note) => addJournalNote(journalingTrade.id, note)} />}
                {quickTradeData && <QuickTradeModal prefillData={quickTradeData} onClose={() => setQuickTradeData(null)} onAddTrade={addTrade} />}
                {globalAlertData && <GlobalPriceAlertModal data={globalAlertData} onClose={() => setGlobalAlertData(null)} onSave={handleSetGlobalAlert} onDelete={handleDeleteGlobalAlert}/>}
                
                {isAccountModalVisible && user && <AccountModal user={user} stats={stats} onClose={() => setIsAccountModalVisible(false)} onOpenUpgradeModal={() => { setIsAccountModalVisible(false); setIsUpgradeModalVisible(true); }} />}
                {isUpgradeModalVisible && <UpgradeModal onClose={() => setIsUpgradeModalVisible(false)} onUpgrade={handleUpgrade} />}
                {isSettingsModalVisible && <SettingsModal settings={userSettings} onClose={() => setIsSettingsModalVisible(false)} onSave={updateUserSettings} />}
            </AnimatePresence>
        </div>
    );
};

export default App;