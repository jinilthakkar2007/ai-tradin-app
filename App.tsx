
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Trade, View, Alert, PriceAlert, User, UserStats, UserSettings, TradeDirection, ProTrader } from './types';
import { useAuth } from './hooks/useAuth';

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

// Modals for User/Auth
import AccountModal from './components/AccountModal';
import UpgradeModal from './components/UpgradeModal';
import SettingsModal from './components/SettingsModal';

// Toasts
import ToastContainer from './components/ToastContainer';

// Constants and services
import { MOCK_TRADES, DEFAULT_USER_SETTINGS } from './constants';
import { proTraderService } from './services/proTraderService';

const App: React.FC = () => {
    // Main state
    const [trades, setTrades] = useState<Trade[]>(() => {
        const savedTrades = localStorage.getItem('trades');
        return savedTrades ? JSON.parse(savedTrades) : MOCK_TRADES;
    });
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [view, setView] = useState<View>('dashboard');
    const { user, setUser, logout } = useAuth();
    const [userSettings, setUserSettings] = useState<UserSettings>(() => {
        const savedSettings = localStorage.getItem('userSettings');
        return savedSettings ? JSON.parse(savedSettings) : DEFAULT_USER_SETTINGS;
    });
    const [hasOnboarded, setHasOnboarded] = useState<boolean>(() => {
        return localStorage.getItem('hasOnboarded') === 'true';
    });
    const [copiedTraders, setCopiedTraders] = useState<Set<string>>(() => {
        const saved = localStorage.getItem('copiedTraders');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });
    
    // Modal states
    const [isNewTradeFormVisible, setIsNewTradeFormVisible] = useState(false);
    const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
    const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
    const [journalingTrade, setJournalingTrade] = useState<Trade | null>(null);
    const [quickTradeData, setQuickTradeData] = useState<Partial<Omit<Trade, 'id' | 'status' | 'openDate'>> | null>(null);
    
    // Auth/User modal states
    const [isAccountModalVisible, setIsAccountModalVisible] = useState(false);
    const [isUpgradeModalVisible, setIsUpgradeModalVisible] = useState(false);
    const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);

    // Toast state
    const [toasts, setToasts] = useState<Alert[]>([]);

    useEffect(() => {
        localStorage.setItem('trades', JSON.stringify(trades));
    }, [trades]);

    useEffect(() => {
        localStorage.setItem('userSettings', JSON.stringify(userSettings));
    }, [userSettings]);

    useEffect(() => {
        localStorage.setItem('copiedTraders', JSON.stringify(Array.from(copiedTraders)));
    }, [copiedTraders]);

    // Derived state
    const activeTrades = useMemo(() => trades.filter(t => t.status === 'ACTIVE'), [trades]);
    const tradeHistory = useMemo(() => trades.filter(t => t.status !== 'ACTIVE').sort((a, b) => new Date(b.closeDate!).getTime() - new Date(a.closeDate!).getTime()), [trades]);
    const unreadAlerts = useMemo(() => alerts.filter(a => !a.read), [alerts]);

    const createAlert = useCallback((trade: Trade, message: string, type: 'success' | 'error' | 'info', skipToast = false) => {
        const newAlert: Alert = {
            id: `alert-${Date.now()}-${Math.random()}`,
            tradeId: trade.id,
            asset: trade.asset,
            message,
            timestamp: new Date().toISOString(),
            type,
            read: false,
        };
        setAlerts(prev => [newAlert, ...prev]);
        if (!skipToast) {
            setToasts(prev => [newAlert, ...prev]);
        }
    }, []);
    
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
        return newTrade; // Return the created trade for notifications
    }, [createAlert]);
    
    // Copy Trading logic
    useEffect(() => {
        const handleNewProTrade = (trader: ProTrader, trade: Omit<Trade, 'id' | 'status' | 'openDate'>) => {
            if (copiedTraders.has(trader.id)) {
                const newCopiedTrade = addTrade(trade);
                // Create a special toast for copied trades
                const toastAlert: Alert = {
                    id: `toast-${Date.now()}`,
                    tradeId: newCopiedTrade.id,
                    asset: newCopiedTrade.asset,
                    message: `Copied new ${trade.direction} trade from ${trader.name}.`,
                    timestamp: new Date().toISOString(),
                    type: 'info',
                    read: true, // It's just a toast, not a permanent alert
                };
                setToasts(prev => [toastAlert, ...prev]);
            }
        };
        
        proTraderService.subscribe(handleNewProTrade);
        return () => proTraderService.unsubscribe();
    }, [copiedTraders, addTrade]);
    
    const simulateTrade = (tradeData: Omit<Trade, 'id' | 'status' | 'openDate'>) => {
        const newTrade: Trade = {
            ...tradeData,
            id: `trade-${Date.now()}-sim-`,
            status: 'ACTIVE',
            openDate: new Date().toISOString(),
        };

        // Simulate a random outcome
        const isWin = Math.random() > 0.5;
        const closePrice = isWin 
            ? newTrade.takeProfits[0].price
            : newTrade.stopLoss;

        const closedTrade: Trade = {
            ...newTrade,
            status: isWin ? 'CLOSED_TP' : 'CLOSED_SL',
            closePrice,
            closeDate: new Date(Date.now() + 1000).toISOString() // a moment later
        };

        setTrades(prev => [closedTrade, ...prev]);
        setIsNewTradeFormVisible(false);

        const message = `Simulated trade for ${closedTrade.asset} closed as a ${isWin ? 'WIN' : 'LOSS'}.`;
        createAlert(closedTrade, message, isWin ? 'success' : 'error');
    };

    const updateTrade = useCallback((updatedTrade: Trade) => {
        setTrades(prev => prev.map(t => t.id === updatedTrade.id ? updatedTrade : t));
        setEditingTrade(null);
    }, []);

    const deleteTrade = useCallback((tradeId: string) => {
        setTrades(prev => prev.filter(t => t.id !== tradeId));
    }, []);

    const deleteTrades = useCallback((tradeIds: string[]) => {
        setTrades(prev => prev.filter(t => !tradeIds.includes(t.id)));
    }, []);

    const setPriceAlert = useCallback((tradeId: string, priceAlert: Omit<PriceAlert, 'triggered'> | null) => {
        setTrades(prev => prev.map(t => t.id === tradeId ? { ...t, priceAlert: priceAlert ? { ...priceAlert, triggered: false } : null } : t));
    }, []);

    const addJournalNote = useCallback((tradeId: string, note: string) => {
        setTrades(prev => prev.map(t => {
            if (t.id === tradeId) {
                const newEntry = { timestamp: new Date().toISOString(), note };
                return { ...t, journal: [...(t.journal || []), newEntry] };
            }
            return t;
        }));
    }, []);
    
    const handleSimulateOutcome = useCallback((tradeId: string) => {
         const trade = trades.find(t => t.id === tradeId);
         if (!trade) return;
         
         const isWin = Math.random() > 0.5;
         const price = isWin ? trade.takeProfits[0].price : trade.stopLoss;
         const status = isWin ? 'CLOSED_TP' : 'CLOSED_SL';
         
         handleTradeTrigger(trade, status, price);
         setEditingTrade(null);
    }, [trades, handleTradeTrigger]);

    const handleShowAlertDetails = useCallback((alert: Alert) => {
        setSelectedAlert(alert);
        setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, read: true } : a));
    }, []);

    const handleCommentaryFetched = useCallback((alertId: string, commentary: string) => {
        setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, aiCommentary: commentary } : a));
    }, []);

    const handleDismissToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const handleUpgrade = useCallback(() => {
        if(user) {
            setUser({ ...user, subscriptionTier: 'Premium' });
        }
        setIsUpgradeModalVisible(false);
    }, [user, setUser]);

    const handleToggleCopyTrader = useCallback((traderId: string) => {
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

    const userStats: UserStats = useMemo(() => {
        const closedTrades = tradeHistory;
        const totalTrades = closedTrades.length;
        if (totalTrades === 0) {
            return { totalTrades: trades.length, winRate: 0, totalPL: 0, avgWin: 0, avgLoss: 0, profitFactor: 0 };
        }
        
        let wins = 0;
        let totalPL = 0;
        let grossProfit = 0;
        let grossLoss = 0;
        let winningTrades = 0;
        let losingTrades = 0;

        closedTrades.forEach(t => {
            const pnl = (t.closePrice! - t.entryPrice) * t.quantity * (t.direction === 'LONG' ? 1 : -1);
            totalPL += pnl;
            if (pnl > 0) {
                wins++;
                winningTrades++;
                grossProfit += pnl;
            } else {
                losingTrades++;
                grossLoss += Math.abs(pnl);
            }
        });

        return {
            totalTrades: trades.length,
            winRate: parseFloat(((wins / totalTrades) * 100).toFixed(2)),
            totalPL: parseFloat(totalPL.toFixed(2)),
            avgWin: winningTrades > 0 ? parseFloat((grossProfit / winningTrades).toFixed(2)) : 0,
            avgLoss: losingTrades > 0 ? parseFloat((grossLoss / losingTrades).toFixed(2)) : 0,
            profitFactor: grossLoss > 0 ? parseFloat((grossProfit / grossLoss).toFixed(2)) : Infinity,
        };
    }, [trades, tradeHistory]);

    if (!user) {
        // In a real app, you would show a login page.
        // For this demo, useAuth provides a mock user.
        return <div>Loading user...</div>;
    }
    
    const handleOnboardingComplete = () => {
        localStorage.setItem('hasOnboarded', 'true');
        setHasOnboarded(true);
    }
    
    const handleQuickTrade = (prefillData: { asset: string, direction: TradeDirection, entryPrice: number }) => {
        setQuickTradeData(prefillData);
    };

    const motionProps = {
      initial: { opacity: 0, y: 15 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -15 },
      transition: { duration: 0.25 },
      className: "w-full h-full"
    };

    return (
        <div className="bg-background text-text-primary min-h-screen flex">
            <Sidebar 
                activeView={view} 
                onNavigate={setView} 
                user={user} 
                onLogout={logout} 
                onShowAccount={() => setIsAccountModalVisible(true)}
                onShowSettings={() => setIsSettingsModalVisible(true)}
                alertCount={unreadAlerts.length}
            />
            <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto">
                <AnimatePresence mode="wait">
                    {view === 'dashboard' && (
                        <motion.div key="dashboard" {...motionProps}>
                            <Dashboard 
                                stats={userStats} 
                                trades={trades} 
                                onNewTrade={() => setIsNewTradeFormVisible(true)}
                                onEditTrade={setEditingTrade}
                                onDeleteTrade={deleteTrade}
                                onSetPriceAlert={setPriceAlert}
                                onOpenJournal={setJournalingTrade}
                                onQuickTrade={handleQuickTrade}
                                handleTradeTrigger={handleTradeTrigger}
                                handleCustomAlert={handleCustomAlert}
                            />
                        </motion.div>
                    )}
                    {view === 'alerts' && (
                         <motion.div key="alerts" {...motionProps}>
                            <AlertsView alerts={alerts} onShowAlert={handleShowAlertDetails} />
                        </motion.div>
                    )}
                    {view === 'history' && (
                        <motion.div key="history" {...motionProps}>
                            <HistoryView 
                                tradeHistory={tradeHistory} 
                                onOpenJournal={setJournalingTrade}
                                onDeleteTrades={deleteTrades}
                            />
                        </motion.div>
                    )}
                    {view === 'copy-trading' && (
                        <motion.div key="copy-trading" {...motionProps}>
                            <CopyTradingView 
                                isPremium={user.subscriptionTier === 'Premium'} 
                                onUpgradeClick={() => setIsUpgradeModalVisible(true)}
                                copiedTraders={copiedTraders}
                                onToggleCopy={handleToggleCopyTrader}
                            />
                        </motion.div>
                    )}
                    {view === 'chatbot' && (
                        <motion.div key="chatbot" {...motionProps}>
                            {user.subscriptionTier === 'Premium' ? 
                                <TradeChatbot onAddTrade={addTrade} /> : 
                                <StrategyBuilder isPremium={false} onUpgradeClick={() => setIsUpgradeModalVisible(true)} />}
                        </motion.div>
                    )}
                    {view === 'market' && (
                        <motion.div key="market" {...motionProps}>
                            <MarketView activeTrades={activeTrades} onNewTrade={handleQuickTrade} userSettings={userSettings} />
                        </motion.div>
                    )}
                    {view === 'portfolio' && (
                        <motion.div key="portfolio" {...motionProps}>
                            <PortfolioView stats={userStats} activeTrades={activeTrades} tradeHistory={tradeHistory} />
                        </motion.div>
                    )}
                    {view === 'strategy' && (
                        <motion.div key="strategy" {...motionProps}>
                            <StrategyBuilder isPremium={user.subscriptionTier === 'Premium'} onUpgradeClick={() => setIsUpgradeModalVisible(true)} />
                        </motion.div>
                    )}
                    {view === 'backtesting' && (
                        <motion.div key="backtesting" {...motionProps}>
                            <BacktestingView isPremium={user.subscriptionTier === 'Premium'} onUpgradeClick={() => setIsUpgradeModalVisible(true)} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <AnimatePresence>
                {!hasOnboarded && <OnboardingModal onComplete={handleOnboardingComplete} />}

                {isNewTradeFormVisible && (
                    <NewTradeForm 
                        onAddTrade={addTrade}
                        onAddAndSimulate={simulateTrade}
                        onClose={() => setIsNewTradeFormVisible(false)} 
                    />
                )}
                {editingTrade && (
                    <EditTradeModal 
                        trade={editingTrade}
                        onUpdateTrade={updateTrade}
                        onSimulateOutcome={handleSimulateOutcome}
                        onClose={() => setEditingTrade(null)}
                    />
                )}
                {selectedAlert && (
                    <AlertModal 
                        alert={selectedAlert}
                        trades={trades}
                        onClose={() => setSelectedAlert(null)}
                        onCommentaryFetched={handleCommentaryFetched}
                    />
                )}
                {journalingTrade && (
                    <JournalModal
                        trade={journalingTrade}
                        onClose={() => setJournalingTrade(null)}
                        onAddNote={(note) => addJournalNote(journalingTrade.id, note)}
                    />
                )}
                {quickTradeData && (
                    <QuickTradeModal
                        prefillData={quickTradeData}
                        onAddTrade={addTrade}
                        onClose={() => setQuickTradeData(null)}
                    />
                )}
                {isAccountModalVisible && (
                    <AccountModal 
                        user={user} 
                        stats={userStats} 
                        onClose={() => setIsAccountModalVisible(false)} 
                        onOpenUpgradeModal={() => { setIsAccountModalVisible(false); setIsUpgradeModalVisible(true); }}
                    />
                )}
                {isUpgradeModalVisible && (
                    <UpgradeModal
                        onClose={() => setIsUpgradeModalVisible(false)}
                        onUpgrade={handleUpgrade}
                    />
                )}
                {isSettingsModalVisible && (
                    <SettingsModal
                        settings={userSettings}
                        onClose={() => setIsSettingsModalVisible(false)}
                        onSave={setUserSettings}
                    />
                )}
            </AnimatePresence>
            
            <ToastContainer toasts={toasts} onDismiss={handleDismissToast} onShowAlert={handleShowAlertDetails} />
        </div>
    );
};

export default App;
