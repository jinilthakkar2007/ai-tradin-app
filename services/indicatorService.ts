import { CandlestickData, LineData, Time } from 'lightweight-charts';

// Helper to ensure we are working with numbers
type NumericData = { time: Time, value: number };
type OHLCData = { time: Time, open: number, high: number, low: number, close: number };

export const calculateMA = (data: OHLCData[], period: number): LineData[] => {
  const result: LineData[] = [];
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    result.push({
      time: data[i].time,
      value: sum / period,
    });
  }
  return result;
};


export const calculateRSI = (data: OHLCData[], period: number): LineData[] => {
    const result: LineData[] = [];
    if (data.length < period) return [];

    let gains = 0;
    let losses = 0;

    // Calculate initial average gain and loss
    for (let i = 1; i <= period; i++) {
        const change = data[i].close - data[i - 1].close;
        if (change > 0) {
            gains += change;
        } else {
            losses -= change; // losses are positive values
        }
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    const calculateRSIValue = (avgGain: number, avgLoss: number): number => {
        if (avgLoss === 0) return 100;
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    };

    result.push({ time: data[period].time, value: calculateRSIValue(avgGain, avgLoss) });

    // Calculate subsequent RSI values
    for (let i = period + 1; i < data.length; i++) {
        const change = data[i].close - data[i - 1].close;
        let currentGain = 0;
        let currentLoss = 0;

        if (change > 0) {
            currentGain = change;
        } else {
            currentLoss = -change;
        }

        avgGain = (avgGain * (period - 1) + currentGain) / period;
        avgLoss = (avgLoss * (period - 1) + currentLoss) / period;
        
        result.push({ time: data[i].time, value: calculateRSIValue(avgGain, avgLoss) });
    }

    return result;
};