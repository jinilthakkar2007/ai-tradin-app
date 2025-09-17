import { MOCK_MARKET_DATA } from '../constants';

export interface CandlestickData {
  time: string; // 'YYYY-MM-DD'
  open: number;
  high: number;
  low: number;
  close: number;
}

export type Timeframe = '1D' | '1W' | '1M';

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

export const generateCandlestickData = (
  symbol: string,
  timeframe: Timeframe,
  count: number
): CandlestickData[] => {
  const asset = MOCK_MARKET_DATA.find(d => d.symbol === symbol);
  let lastClose = asset ? asset.price : 100;
  
  const data: CandlestickData[] = [];
  const today = new Date();

  for (let i = count; i > 0; i--) {
    let date: Date;

    if (timeframe === '1D') {
      date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    } else if (timeframe === '1W') {
      date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (i * 7));
    } else { // '1M'
      date = new Date(today.getFullYear(), today.getMonth() - i, today.getDate());
      const daysInMonth = getDaysInMonth(date.getFullYear(), date.getMonth());
      if (date.getDate() > daysInMonth) {
        date.setDate(daysInMonth);
      }
    }

    const open = lastClose * (1 + (Math.random() - 0.5) * 0.02);
    const close = open * (1 + (Math.random() - 0.5) * 0.05);
    const high = Math.max(open, close) * (1 + Math.random() * 0.03);
    const low = Math.min(open, close) * (1 - Math.random() * 0.03);

    data.push({
      time: date.toISOString().split('T')[0], // format to 'YYYY-MM-DD'
      open: parseFloat(open.toFixed(4)),
      high: parseFloat(high.toFixed(4)),
      low: parseFloat(low.toFixed(4)),
      close: parseFloat(close.toFixed(4)),
    });
    
    lastClose = close;
  }
  
  return data;
};