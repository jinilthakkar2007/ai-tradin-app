import React, { useEffect, useRef } from 'react';
import { createChart, ISeriesApi, ColorType, Time, LineData, IChartApi, CandlestickData, SeriesMarker } from 'lightweight-charts';

interface BacktestChartProps {
    data: CandlestickData[];
    fastMaData: LineData[];
    slowMaData: LineData[];
    signals: SeriesMarker<Time>[];
    fastMaPeriod: number;
    slowMaPeriod: number;
}

const BacktestChart: React.FC<BacktestChartProps> = ({ data, fastMaData, slowMaData, signals, fastMaPeriod, slowMaPeriod }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      layout: { background: { type: ColorType.Solid, color: '#0D1117' }, textColor: '#8B949E' },
      grid: { vertLines: { color: '#161B22' }, horzLines: { color: '#161B22' } },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: { borderColor: '#21262D' },
      rightPriceScale: { borderColor: '#21262D' },
    });

    // FIX: Cast to 'any' to work around a TypeScript error where series creation methods are not found on IChartApi. This is likely due to a type definition issue in the environment.
    const candlestickSeries = (chart as any).addCandlestickSeries({
      upColor: '#238636', downColor: '#DA3633', borderDownColor: '#DA3633', borderUpColor: '#238636', wickDownColor: '#DA3633', wickUpColor: '#238636',
    });
    
    const formattedData = data.map(d => ({...d, time: d.time as Time}));
    candlestickSeries.setData(formattedData);
    candlestickSeries.setMarkers(signals);

    const fastMaSeries = (chart as any).addLineSeries({ color: '#1F6FEB', lineWidth: 2, priceLineVisible: false, lastValueVisible: false });
    fastMaSeries.setData(fastMaData);

    const slowMaSeries = (chart as any).addLineSeries({ color: '#F7B93E', lineWidth: 2, priceLineVisible: false, lastValueVisible: false });
    slowMaSeries.setData(slowMaData);
    
    chart.timeScale().fitContent();

    const handleResize = () => {
      chart.resize(chartContainerRef.current?.clientWidth || 0, 400);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, fastMaData, slowMaData, signals]);

  return (
    <div>
        <div className="flex items-center gap-4 mb-2 text-sm">
            <div className="flex items-center gap-2"><div className="w-4 h-0.5 bg-[#1F6FEB]"></div><span>MA({fastMaPeriod})</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-0.5 bg-[#F7B93E]"></div><span>MA({slowMaPeriod})</span></div>
        </div>
        <div ref={chartContainerRef} className="w-full h-[400px]" />
    </div>
  );
};

export default BacktestChart;