import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage, Trade, TradeDirection, TakeProfit } from '../types';
import ChatMessageComponent from './ChatMessage';
import { getAITradeAnalysis } from '../services/geminiService';

interface TradeChatbotProps {
    onAddTrade: (trade: Omit<Trade, 'id' | 'status' | 'openDate'>) => void;
}

type ConversationStep = 'IDLE' | 'AWAITING_USER_INPUT' | 'PROCESSING' | 'AWAITING_CONFIRMATION';

interface ProposedTrade {
  asset: string;
  direction: TradeDirection;
  entryPrice: number;
  stopLoss: number;
  takeProfits: TakeProfit[];
}

const TradeChatbot: React.FC<TradeChatbotProps> = ({ onAddTrade }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [step, setStep] = useState<ConversationStep>('IDLE');
    const [proposedTrade, setProposedTrade] = useState<ProposedTrade | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const addMessage = useCallback((sender: 'user' | 'bot', text: string) => {
        const newMessage: ChatMessage = {
            id: `${sender}-${Date.now()}`,
            sender,
            text,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, newMessage]);
    }, []);

    const replaceLastBotMessage = useCallback((text: string) => {
        setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage && lastMessage.sender === 'bot') {
                return [...prev.slice(0, -1), { ...lastMessage, text }];
            }
            // if no bot message to replace, just add a new one
            addMessage('bot', text);
            return prev;
        });
    }, [addMessage]);

    // Initial message
    useEffect(() => {
        if (step === 'IDLE') {
            addMessage('bot', "Hello! I'm your AI Trade Assistant. How can I help you today? You can ask me to analyze an asset or set up a trade (e.g., 'Analyze TSLA' or 'Set up a long for BTC/USD').");
            setStep('AWAITING_USER_INPUT');
        }
    }, [step, addMessage]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleUserInput = async (e: React.FormEvent) => {
        e.preventDefault();
        const query = userInput.trim();
        if (!query || step === 'PROCESSING') return;

        addMessage('user', query);
        setUserInput('');

        if (step === 'AWAITING_CONFIRMATION' && proposedTrade) {
            const quantity = parseFloat(query);
            if (!isNaN(quantity) && quantity > 0) {
                const risk = Math.abs(((proposedTrade.entryPrice - proposedTrade.stopLoss) / proposedTrade.entryPrice) * 100);
                const newTrade: Omit<Trade, 'id' | 'status' | 'openDate'> = {
                    ...proposedTrade,
                    quantity: quantity,
                    riskPercentage: parseFloat(risk.toFixed(2)),
                };
                onAddTrade(newTrade);
                addMessage('bot', `✅ **Trade logged!** I've added a ${proposedTrade.direction} trade for ${proposedTrade.asset}. You can view it on the dashboard.`);
                setProposedTrade(null);
                setStep('AWAITING_USER_INPUT');
            } else if (query.toLowerCase().includes('cancel')) {
                addMessage('bot', "Okay, I've cancelled that trade setup. What would you like to do next?");
                setProposedTrade(null);
                setStep('AWAITING_USER_INPUT');
            } else {
                addMessage('bot', "Please enter a valid positive number for the quantity, or type 'cancel'.");
            }
        } else {
            setStep('PROCESSING');
            addMessage('bot', "Analyzing...");

            try {
                const result = await getAITradeAnalysis(query);
                let botResponse = result.analysis;

                if (result.setup) {
                    const { direction, entryPrice, stopLoss, takeProfits: tpPrices, asset } = result.setup;
                    const finalTPs = tpPrices.map((price, i) => ({ level: i + 1, price, hit: false as const }));
                    
                    const newProposedTrade: ProposedTrade = { asset, direction, entryPrice, stopLoss, takeProfits: finalTPs };
                    setProposedTrade(newProposedTrade);

                    botResponse += `\n\nI've also prepared a potential **${direction}** trade setup for you:
- **Entry:** ~$${entryPrice.toLocaleString()}
- **Stop Loss:** $${stopLoss.toLocaleString()}
- **Take Profits:** ${finalTPs.map(tp => `$${tp.price.toLocaleString()}`).join(', ')}

What **quantity** would you like to use for this trade? Or you can type **'cancel'** to ignore.`;

                    replaceLastBotMessage(botResponse);
                    setStep('AWAITING_CONFIRMATION');
                } else {
                    replaceLastBotMessage(botResponse);
                    setStep('AWAITING_USER_INPUT');
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Sorry, I couldn't process that request. Please try again.";
                replaceLastBotMessage(errorMessage);
                setStep('AWAITING_USER_INPUT');
            }
        }
    };
    
    const getPlaceholderText = () => {
        switch (step) {
            case 'PROCESSING':
                return 'AI is thinking...';
            case 'AWAITING_CONFIRMATION':
                return 'Enter quantity to confirm, or "cancel"';
            case 'IDLE':
                 return 'Initializing...';
            default:
                return 'Ask for analysis or to set up a trade...';
        }
    };

    return (
        <div className="flex flex-col h-[80vh] bg-surface border border-border rounded-lg shadow-lg">
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                {messages.map((msg) => <ChatMessageComponent key={msg.id} message={msg} />)}
                <div ref={chatEndRef} />
            </div>
            <div className="p-4 bg-surface/50 border-t border-border">
                <form onSubmit={handleUserInput}>
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder={getPlaceholderText()}
                        disabled={step === 'PROCESSING' || step === 'IDLE'}
                        className="w-full bg-background border border-border text-text-primary rounded-md py-2 px-4 focus:ring-2 focus:ring-brand focus:border-brand transition-colors"
                        aria-label="Chat input"
                    />
                </form>
            </div>
        </div>
    );
};

export default TradeChatbot;
