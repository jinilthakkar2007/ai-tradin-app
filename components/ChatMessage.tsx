

import React from 'react';
// FIX: Import Variants to correctly type the animation variants.
import { motion, Variants } from 'framer-motion';
import { ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ThinkingIndicator: React.FC = () => {
    // FIX: Explicitly type dotVariants with the Variants type from framer-motion to resolve type inference issues.
    const dotVariants: Variants = {
        animate: {
            y: [0, -3, 0],
            backgroundColor: ["#484F58", "#8B949E", "#484F58"],
            transition: {
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };
  
    return (
        <motion.div className="flex items-center gap-1.5" aria-label="AI is thinking">
            <motion.div className="w-2 h-2 rounded-full" variants={dotVariants} animate="animate" style={{ animationDelay: '0s' }} />
            <motion.div className="w-2 h-2 rounded-full" variants={dotVariants} animate="animate" style={{ animationDelay: '0.2s' }} />
            <motion.div className="w-2 h-2 rounded-full" variants={dotVariants} animate="animate" style={{ animationDelay: '0.4s' }} />
        </motion.div>
    );
};


const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.sender === 'bot';
  const isThinking = message.text === 'Analyzing...';

  return (
    <div className={`flex items-end gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}>
      {isBot && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-blue flex items-center justify-center text-white font-bold text-sm">
          AI
        </div>
      )}
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow-md ${
          isBot
            ? 'bg-background-surface text-text-primary rounded-bl-none'
            : 'bg-accent-green text-white rounded-br-none'
        }`}
      >
        {isThinking ? (
            <ThinkingIndicator />
        ) : (
            <div className="text-sm prose-p:my-0" style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: message.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/(\n\s*-\s.*)+/g, (match) => {
                const items = match.trim().split('\n').map(item => `<li>${item.replace(/^\s*-\s/, '')}</li>`).join('');
                return `<ul class="list-disc list-inside space-y-1 my-2">${items}</ul>`;
            })}} />
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
