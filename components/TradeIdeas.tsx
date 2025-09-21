import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TradeDirection } from '../types';
import { TradeIdea } from '../services/tradeIdeaService';
import LightbulbIcon from './icons/LightbulbIcon';
import PlayIcon from './icons/PlayIcon';

interface TradeIdeasProps {
    ideas: TradeIdea[];
    onQuickTrade: (prefillData: { asset: string; direction: TradeDirection; entryPrice: number; }) => void;
}

// FIX: Refactored from React.FC to a standard function component to fix framer-motion prop type errors.
const TradeIdeas = ({ ideas, onQuickTrade }: TradeIdeasProps) => {
    if (ideas.length === 0) {
        return (
            <div className="text-center text-text-secondary text-sm py-8">
                <p>Waiting for new trade ideas from AI...</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-3 -m-3">
            <AnimatePresence initial={false}>
                {ideas.map(idea => (
                    <motion.div
                        key={idea.suggestion} // suggestion should be unique enough for a key
                        layout
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -20, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="p-3 hover:bg-border/50 rounded-lg"
                    >
                        <div className="flex items-start gap-3">
                            <div className={`flex-shrink-0 mt-1 rounded-full p-1.5 ${idea.direction === 'LONG' ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-red/10 text-accent-red'}`}>
                                <LightbulbIcon />
                            </div>
                            <div className="flex-grow">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-text-primary">{idea.asset}</span>
                                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${idea.direction === 'LONG' ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-red/10 text-accent-red'}`}>
                                        {idea.direction}
                                    </span>
                                </div>
                                <p className="text-sm text-text-secondary mt-1">{idea.suggestion}</p>
                            </div>
                            <motion.button
                                onClick={() => onQuickTrade({ asset: idea.asset, direction: idea.direction, entryPrice: idea.entryPrice })}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="self-center flex items-center gap-1.5 py-1 px-3 text-xs font-semibold text-brand bg-brand/10 hover:bg-brand/20 rounded-full transition-colors"
                                title="Open Quick Trade modal"
                            >
                                <PlayIcon />
                                Trade
                            </motion.button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default TradeIdeas;
