import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Trade } from '../types';

interface PerformanceChartProps {
  tradeHistory: Trade[];
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ tradeHistory }) => {
  const data = tradeHistory.map(trade => {
    const pnl = (trade.closePrice! - trade.entryPrice) * (trade.direction === 'LONG' ? 1 : -1);
    return {
      name: trade.asset,
      pnl: parseFloat(pnl.toFixed(2)),
      date: new Date(trade.closeDate!).toLocaleDateString(),
    };
  }).reverse(); // Show oldest first

  if (tradeHistory.length === 0) {
    return (
        <div className="bg-surface/50 border-2 border-dashed border-border p-12 rounded-lg text-center text-text-secondary h-80 flex items-center justify-center">
            <p className="text-lg">No trading history available to display performance.</p>
        </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-3 border border-border rounded-lg shadow-lg">
          <p className="label text-text-primary font-semibold">{`${label} (${payload[0].payload.date})`}</p>
          <p className={`intro tabular-nums ${payload[0].value >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
              P/L: ${payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#21262D" />
          <XAxis dataKey="name" stroke="#8B949E" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#8B949E" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(56, 139, 253, 0.1)' }}/>
          <Legend wrapperStyle={{fontSize: "14px", color: "#8B949E"}}/>
          <Bar dataKey="pnl" name="Profit/Loss ($)" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Bar key={`bar-${index}`} dataKey="pnl" fill={entry.pnl >= 0 ? '#238636' : '#DA3633'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceChart;