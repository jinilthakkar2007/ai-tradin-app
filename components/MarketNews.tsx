import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NewsArticle, Trade } from '../types';
import { marketNewsService } from '../services/marketNewsService';
import NewspaperIcon from './icons/NewspaperIcon';

interface MarketNewsProps {
  activeTrades: Trade[];
}

const NewsItem: React.FC<{ article: NewsArticle; isRelevant: boolean }> = ({ article, isRelevant }) => {
  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex items-start gap-3 p-3 hover:bg-background-light/50 rounded-lg"
    >
      <div className="flex-shrink-0 mt-1 text-text-dim">
        <NewspaperIcon />
      </div>
      <div className="flex-grow">
        <p className="text-sm font-semibold text-text-primary leading-tight">{article.headline}</p>
        <div className="flex items-center gap-2 mt-1">
           {isRelevant && (
            <span className="px-1.5 py-0.5 text-xs font-semibold bg-accent-blue/20 text-accent-blue rounded-full">
              Relevant
            </span>
          )}
          <span className="text-xs text-text-secondary">{article.source}</span>
          <span className="text-xs text-text-dim">&bull;</span>
          <span className="text-xs text-text-dim">{timeAgo(article.timestamp)}</span>
        </div>
      </div>
    </motion.div>
  );
};

const MarketNews: React.FC<MarketNewsProps> = ({ activeTrades }) => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const MAX_NEWS_ITEMS = 7;

  const relevantSymbols = useMemo(() => new Set(activeTrades.map(t => t.asset)), [activeTrades]);

  useEffect(() => {
    const handleNewArticle = (article: NewsArticle) => {
      setNews(prev => [article, ...prev].slice(0, MAX_NEWS_ITEMS));
    };

    marketNewsService.subscribe(handleNewArticle);

    return () => marketNewsService.unsubscribe();
  }, []);

  if (news.length === 0) {
    return (
      <div className="text-center text-text-secondary text-sm py-8">
        <p>Awaiting market news...</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 -m-3">
      <AnimatePresence initial={false}>
        {news.map(article => (
          <NewsItem
            key={article.id}
            article={article}
            isRelevant={article.symbols.some(symbol => relevantSymbols.has(symbol))}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default MarketNews;
