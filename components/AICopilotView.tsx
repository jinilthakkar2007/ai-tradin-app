import React, { useState, useEffect } from 'react';
// FIX: Import Variants to correctly type animation variants
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { User, UserStats, Trade, TradeDirection, Prices, TradeActionSuggestion } from '../types';
import { getMarketSentiment, getPersonalizedTradeIdeas, getPortfolioAnalysis, getPerformanceTip, getTradeActionSuggestions } from '../services/geminiService';
import WandIcon from './icons/WandIcon';
import LightbulbIcon from './icons/LightbulbIcon';
import HeartIcon from './icons/HeartIcon';
import BrainCircuitIcon from './icons/BrainCircuitIcon';
import ShieldCheckIcon from './icons/ShieldCheckIcon';
import EditIcon from './icons/EditIcon';
import DoorExitIcon from './icons/DoorExitIcon';


interface AICopilotViewProps {
    user: User;
    stats: UserStats;
    activeTrades: Trade[];
    prices: Prices;
    onQuickTrade: (prefillData: { asset: string; direction: TradeDirection; entryPrice: number; }) => void;
    onCloseTrade: (trade: Trade) => void;
    onUpdateTrade: (trade: Trade) => void;
}

// FIX: Explicitly type containerVariants with the Variants type from framer-motion.
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2,
        },
    },
};

// FIX: Explicitly type itemVariants with the Variants type from framer-motion.
const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: 'spring', stiffness: 100 },
    },
};

const Widget: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; className?: string }> = ({ title, icon, children, className = '' }) => (
    <motion.div variants={itemVariants} className={`bg-surface border border-border rounded-xl p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
            <div className="text-brand">{icon}</div>
            <h2 className="text-xl font-bold text-text-primary">{title}</h2>
        </div>
        <div>{children}</div>
    </motion.div>
);

const SkeletonLoader: React.FC<{ lines?: number; height?: string }> = ({ lines = 3, height = 'h-4' }) => (
    <div className="space-y-3 animate-pulse">
        {[...Array(lines)].map((_, i) => (
            <div key={i} className={`${height} bg-border rounded-md ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}></div>
        ))}
    </div>
);


const AICopilotView = ({ user, stats, activeTrades, prices, onQuickTrade, onCloseTrade, onUpdateTrade }: AICopilotViewProps) => {
    const [sentiment, setSentiment] = useState<{ sentiment: string; summary: string } | null>(null);
    const [ideas, setIdeas] = useState<any[] | null>(null);
    const [health, setHealth] = useState<{ score: number; analysis: string } | null>(null);
    const [tip, setTip] = useState<string | null>(null);
    const [suggestions, setSuggestions] = useState<TradeActionSuggestion[]>([]);

    const [loading, setLoading] = useState({ sentiment: true, ideas: true, health: true, tip: true, suggestions: true });
    const [error, setError] = useState({ sentiment: '', ideas: '', health: '', tip: '', suggestions: '' });

    useEffect(() => {
        const fetchAllData = async () => {
            // Fetch Market Sentiment
            try {
                const sentimentData = await getMarketSentiment();
                setSentiment(sentimentData);
            } catch (e) {
                setError(prev => ({ ...prev, sentiment: 'Could not load sentiment.' }));
            } finally {
                setLoading(prev => ({ ...prev, sentiment: false }));
            }
            // Fetch Personalized Trade Ideas
            try {
                const ideasData = await getPersonalizedTradeIdeas(stats, activeTrades);
                setIdeas(ideasData);
            } catch (e) {
                 setError(prev => ({ ...prev, ideas: 'Could not generate ideas.' }));
            } finally {
                setLoading(prev => ({ ...prev, ideas: false }));
            }

            // Fetch Portfolio Health
            try {
                const healthData = await getPortfolioAnalysis(activeTrades);
                setHealth(healthData);
            } catch (e) {
                setError(prev => ({ ...prev, health: 'Could not analyze portfolio.' }));
            } finally {
                setLoading(prev => ({ ...prev, health: false }));
            }

            // Fetch Performance Tip
            try {
                const tipData = await getPerformanceTip(stats);
                setTip(tipData);
            } catch (e) {
                 setError(prev => ({ ...prev, tip: 'Could not get tip.' }));
            } finally {
                setLoading(prev => ({ ...prev, tip: false }));
            }
            
             // Fetch Proactive Suggestions
            try {
                const suggestionData = await getTradeActionSuggestions(activeTrades, prices);
                setSuggestions(suggestionData);
            } catch (e) {
                 setError(prev => ({ ...prev, suggestions: 'Could not get suggestions.' }));
            } finally {
                setLoading(prev => ({ ...prev, suggestions: false }));
            }
        };

        fetchAllData();
    }, [stats, activeTrades, prices]);

    const handleDeclineSuggestion = (tradeId: string) => {
        setSuggestions(prev => prev.filter(s => s.tradeId !== tradeId));
    };
    
    const handleAcceptSuggestion = (suggestion: TradeActionSuggestion) => {
        const trade = activeTrades.find(t => t.id === suggestion.tradeId);
        if (!trade) return;

        if (suggestion.action === 'CLOSE') {
            onCloseTrade(trade);
        } else if (suggestion.action === 'ADJUST_SL' && suggestion.suggestedPrice) {
            const updatedTrade = { ...trade, stopLoss: suggestion.suggestedPrice };
            onUpdateTrade(updatedTrade);
        }
        handleDeclineSuggestion(suggestion.tradeId);
    };


    const getSentimentColor = (s: string) => {
        if (s === 'Bullish') return 'text-accent-green';
        if (s === 'Bearish') return 'text-accent-red';
        return 'text-accent-yellow';
    };

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <h1 className="text-3xl font-bold text-text-primary">AI Co-Pilot</h1>
                <p className="text-text-secondary mt-1">Your personalized AI-powered trading command center.</p>
            </motion.div>

            <motion.div
                className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                     <Widget title="Proactive Monitoring" icon={<ShieldCheckIcon />}>
                        {loading.suggestions ? <SkeletonLoader /> : error.suggestions ? <p className="text-accent-red text-sm">{error.suggestions}</p> : suggestions.length > 0 ? (
                            <div className="space-y-4">
                                <AnimatePresence>
                                    {suggestions.map((suggestion) => {
                                        const trade = activeTrades.find(t => t.id === suggestion.tradeId);
                                        if (!trade) return null;

                                        const getActionIcon = () => {
                                            switch(suggestion.action) {
                                                case 'CLOSE': return <DoorExitIcon />;
                                                case 'ADJUST_SL': return <EditIcon />;
                                                default: return null;
                                            }
                                        }

                                        return (
                                            <motion.div 
                                                key={suggestion.tradeId}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="bg-background p-4 rounded-lg border border-border/50"
                                            >
                                                <div className="flex justify-between items-start gap-4">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-text-primary">{trade.asset}</span>
                                                            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${trade.direction === 'LONG' ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-red/10 text-accent-red'}`}>{trade.direction}</span>
                                                        </div>
                                                        <p className="text-sm text-text-secondary mt-1">{suggestion.reasoning}</p>
                                                    </div>
                                                    <div className="flex-shrink-0 flex items-center gap-2">
                                                        <motion.button whileTap={{scale: 0.95}} onClick={() => handleDeclineSuggestion(suggestion.tradeId)} className="py-1.5 px-3 bg-white/5 hover:bg-white/10 rounded-md text-text-secondary font-semibold transition-colors text-sm">Decline</motion.button>
                                                        <motion.button whileTap={{scale: 0.95}} onClick={() => handleAcceptSuggestion(suggestion)} className="py-1.5 px-3 bg-brand hover:bg-brand-hover rounded-md text-white font-semibold transition-colors text-sm flex items-center gap-1.5">
                                                            {getActionIcon()} Accept
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </AnimatePresence>
                            </div>
                        ) : <p className="text-sm text-text-secondary">All clear! No immediate actions recommended for your active trades.</p>}
                    </Widget>
                    <Widget title="Personalized Trade Suggestions" icon={<LightbulbIcon />}>
                        {loading.ideas ? <SkeletonLoader /> : error.ideas ? <p className="text-accent-red text-sm">{error.ideas}</p> : (
                            <div className="space-y-4">
                                {ideas?.map((idea, index) => (
                                    <div key={index} className="bg-background p-4 rounded-lg border border-border/50 flex justify-between items-center">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-text-primary">{idea.asset}</span>
                                                <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${idea.direction === 'LONG' ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-red/10 text-accent-red'}`}>{idea.direction}</span>
                                            </div>
                                            <p className="text-sm text-text-secondary mt-1">{idea.rationale}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-brand">{idea.confidence}%</p>
                                            <p className="text-xs text-text-dim">Confidence</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Widget>
                    <Widget title="Portfolio Health Check" icon={<HeartIcon />}>
                        {loading.health ? <SkeletonLoader /> : error.health ? <p className="text-accent-red text-sm">{error.health}</p> : health && (
                             <div className="flex flex-col sm:flex-row items-center gap-6">
                                <div className="flex-shrink-0">
                                    <div className="w-28 h-28 rounded-full bg-background flex items-center justify-center border-4 border-brand">
                                        <span className="text-4xl font-bold text-brand">{health.score}<span className="text-xl">/10</span></span>
                                    </div>
                                </div>
                                <p className="text-text-secondary text-center sm:text-left">{health.analysis}</p>
                            </div>
                        )}
                    </Widget>
                </div>
                
                {/* Right Column */}
                <div className="space-y-6">
                    <Widget title="Market Sentiment" icon={<BrainCircuitIcon />}>
                         {loading.sentiment ? <SkeletonLoader /> : error.sentiment ? <p className="text-accent-red text-sm">{error.sentiment}</p> : sentiment && (
                            <div>
                                <p className={`text-3xl font-bold mb-2 ${getSentimentColor(sentiment.sentiment)}`}>{sentiment.sentiment}</p>
                                <p className="text-text-secondary text-sm">{sentiment.summary}</p>
                            </div>
                        )}
                    </Widget>
                    <Widget title="Performance Tip" icon={<WandIcon />}>
                         {loading.tip ? <SkeletonLoader lines={2} /> : error.tip ? <p className="text-accent-red text-sm">{error.tip}</p> : (
                            <p className="text-text-secondary italic">"{tip}"</p>
                         )}
                    </Widget>
                </div>
            </motion.div>
        </div>
    );
};

export default AICopilotView;