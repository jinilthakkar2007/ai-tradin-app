import React from 'react';
import UpgradeToPremium from './UpgradeToPremium';
import BrainCircuitIcon from './icons/BrainCircuitIcon';

interface StrategyBuilderProps {
  isPremium: boolean;
  onUpgradeClick: () => void;
}

const StrategyBuilder: React.FC<StrategyBuilderProps> = ({ isPremium, onUpgradeClick }) => {
  if (!isPremium) {
    return (
      <div className="flex items-center justify-center h-full">
        <UpgradeToPremium onUpgradeClick={onUpgradeClick} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-text-primary">AI Strategy Builder</h1>
      <p className="text-text-secondary">
        Develop and backtest trading strategies with the help of AI.
      </p>
      <div className="bg-background-surface border-2 border-dashed border-accent-blue/30 p-12 rounded-lg text-center shadow-glow-blue">
        <div className="mb-4 inline-block p-4 bg-accent-blue/10 rounded-full">
          <BrainCircuitIcon />
        </div>
        <h3 className="text-2xl font-bold text-text-primary mb-2">Coming Soon!</h3>
        <p className="text-text-secondary max-w-md mx-auto">
          We're developing an advanced AI tool to help you build, backtest, and optimize your trading strategies based on your risk profile and market conditions.
        </p>
      </div>
    </div>
  );
};

export default StrategyBuilder;
