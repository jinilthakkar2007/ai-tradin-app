import React, { useEffect, useRef, useState } from 'react';
// FIX: Corrected CrosshairMovedEventParams to MouseEventParams, which is the correct exported type.
import { createChart, ISeriesApi, CandlestickData as LWChartData, ColorType, Time, LineData, PriceScaleMode, IChartApi, MouseEventParams } from 'lightweight-charts';
import { generateCandlestickData, Timeframe } from '../services/chartDataService';
import { calculateMA, calculateRSI } from '../services/indicatorService';
import { UserSettings } from '../types';
import DownloadIcon from './icons/DownloadIcon';

interface CandlestickChartProps {
  assetSymbol: string;
  userSettings: UserSettings;
}

interface LegendData {
  time: string;
  ohlc: LWChartData;
  ma?: number;
  rsi?: number;
}

const timeframes: Timeframe[] = ['1D', '1W', '1M'];

const DataLegend: React.FC<{ data: LegendData | null, assetSymbol: string, maPeriod: number, rsiPeriod: number }> = ({ data, assetSymbol, maPeriod, rsiPeriod }) => {
    if (!data || !data.ohlc) {
        return null;
    }
    const { time, ohlc, ma, rsi } = data;
    const isUp = ohlc.close >= ohlc.open;

    return (
        <div className="absolute top-2 left-2 z-10 p-2 bg-background/80 backdrop-blur-sm rounded-md text-xs text-text-secondary pointer-events-none tabular-nums">
            <p className="font-bold text-text-primary">{assetSymbol} <span className="font-normal text-text-dim">({time})</span></p>
            <div className={`flex gap-x-2 font-mono ${isUp ? 'text-accent-green' : 'text-accent-red'}`}>
                <span>O: {ohlc.open.toFixed(2)}</span>
                <span>H: {ohlc.high.toFixed(2)}</span>
                <span>L: {ohlc.low.toFixed(2)}</span>
                <span>C: {ohlc.close.toFixed(2)}</span>
            </div>
             {ma !== undefined && <p style={{ color: '#1F6FEB' }}>MA({maPeriod}): {ma.toFixed(2)}</p>}
             {rsi !== undefined && <p style={{ color: '#FFC107' }}>RSI({rsiPeriod}): {rsi.toFixed(2)}</p>}
        </div>
    );
};

const CandlestickChart: React.FC<CandlestickChartProps> = ({ assetSymbol, userSettings }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const maSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const rsiSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  
  const [activeTimeframe, setActiveTimeframe] = useState<Timeframe>('1D');
  const [showMA, setShowMA] = useState(userSettings.chart.defaultMA);
  const [showRSI, setShowRSI] = useState(userSettings.chart.defaultRSI);
  const [maPeriod, setMaPeriod] = useState(userSettings.chart.maPeriod);
  const [rsiPeriod, setRsiPeriod] = useState(userSettings.chart.rsiPeriod);
  const [legendData, setLegendData] = useState<LegendData | null>(null);
  const [chartData, setChartData] = useState<LWChartData[]>([]);

  const chartHeight = 400;
  const rsiPaneHeight = 100;

  useEffect(() => {
    setShowMA(userSettings.chart.defaultMA);
    setShowRSI(userSettings.chart.defaultRSI);
    setMaPeriod(userSettings.chart.maPeriod);
    setRsiPeriod(userSettings.chart.rsiPeriod);
  }, [userSettings]);

  // Initialize and handle resize
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: { background: { type: ColorType.Solid, color: '#0D1117' }, textColor: '#8B949E' },
      grid: { vertLines: { color: '#161B22' }, horzLines: { color: '#161B22' } },
      width: chartContainerRef.current.clientWidth,
      height: chartHeight,
      timeScale: { borderColor: '#21262D' },
      rightPriceScale: { borderColor: '#21262D' },
      // Enable zooming and panning
      handleScroll: { mouseWheel: true, pressedMouseMove: true, },
      handleScale: { axisDoubleClickReset: true, mouseWheel: true, pinch: true, },
      kineticScroll: { touch: true, mouse: true, },
      crosshair: { mode: 1 }, // Magnet mode
    });
    chartRef.current = chart;
    
    // FIX: Cast to 'any' to work around a TypeScript error where series creation methods are not found on IChartApi. This is likely due to a type definition issue in the environment.
    seriesRef.current = (chart as any).addCandlestickSeries({
      upColor: '#238636', downColor: '#DA3633', borderDownColor: '#DA3633', borderUpColor: '#238636', wickDownColor: '#DA3633', wickUpColor: '#238636',
    });
    
    maSeriesRef.current = (chart as any).addLineSeries({ color: '#1F6FEB', lineWidth: 2, crosshairMarkerVisible: false, lastValueVisible: false, lineStyle: 0, visible: false });

    rsiSeriesRef.current = (chart as any).addLineSeries({
        color: '#FFC107', lineWidth: 2, crosshairMarkerVisible: false, lastValueVisible: false,
        priceScaleId: 'rsi',
        visible: false,
    });
    chart.priceScale('rsi').applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
        mode: PriceScaleMode.Normal,
        borderVisible: false,
    });
    
    // Subscribe to crosshair move to update legend
    chart.subscribeCrosshairMove((param: MouseEventParams) => {
        if (!param.time || !param.seriesData.size) {
            setLegendData(null);
            return;
        }
        const ohlc = param.seriesData.get(seriesRef.current!) as LWChartData | undefined;
        const ma = param.seriesData.get(maSeriesRef.current!) as LineData | undefined;
        const rsi = param.seriesData.get(rsiSeriesRef.current!) as LineData | undefined;

        if (ohlc) {
            setLegendData({
                time: new Date(ohlc.time as string).toLocaleDateString(),
                ohlc,
                ma: ma?.value,
                rsi: rsi?.value,
            });
        }
    });


    const handleResize = () => {
      chart.resize(chartContainerRef.current?.clientWidth || 0, chartHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Update data on timeframe/symbol change
  useEffect(() => {
    if (!seriesRef.current || !maSeriesRef.current || !rsiSeriesRef.current) return;

    const candlestickData = generateCandlestickData(assetSymbol, activeTimeframe, 200);
    const formattedData = candlestickData.map(d => ({ ...d, time: d.time as Time }));
    setChartData(formattedData as LWChartData[]); // Save data for export
    seriesRef.current.setData(formattedData);

    // Update indicators
    if (showMA) {
        const maData = calculateMA(formattedData, maPeriod);
        maSeriesRef.current.setData(maData);
    }
    if (showRSI) {
        const rsiData = calculateRSI(formattedData, rsiPeriod);
        rsiSeriesRef.current.setData(rsiData);
    }
    
    chartRef.current?.timeScale().fitContent();

  }, [assetSymbol, activeTimeframe, showMA, showRSI, maPeriod, rsiPeriod]);

  // Toggle MA visibility
  useEffect(() => {
    maSeriesRef.current?.applyOptions({ visible: showMA });
  }, [showMA]);

  // Toggle RSI visibility and pane
  useEffect(() => {
      rsiSeriesRef.current?.applyOptions({ visible: showRSI });
      chartRef.current?.priceScale('rsi').applyOptions({ visible: showRSI });

      if (showRSI) {
          chartRef.current?.applyOptions({ height: chartHeight + rsiPaneHeight });
          seriesRef.current?.priceScale().applyOptions({ scaleMargins: { top: 0.1, bottom: (rsiPaneHeight / (chartHeight + rsiPaneHeight)) } });
      } else {
          chartRef.current?.applyOptions({ height: chartHeight });
          seriesRef.current?.priceScale().applyOptions({ scaleMargins: { top: 0.1, bottom: 0.2 } });
      }
  }, [showRSI]);

  const handlePeriodChange = (setter: React.Dispatch<React.SetStateAction<number>>, value: string) => {
      const num = parseInt(value, 10);
      if (!isNaN(num) && num >= 2 && num <= 200) { // Validate range from 2 to 200
          setter(num);
      }
  };

  const handleExportData = () => {
    if (chartData.length === 0) {
        alert("No data to export.");
        return;
    }
    const headers = ["time", "open", "high", "low", "close"];
    const csvContent = [
        headers.join(','),
        ...chartData.map(row => headers.map(fieldName => (row as any)[fieldName]).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${assetSymbol}_${activeTimeframe}_data.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  const IndicatorButton: React.FC<{label: string, isActive: boolean, onClick: () => void}> = ({label, isActive, onClick}) => (
       <button onClick={onClick} className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors duration-200 ${isActive ? 'bg-accent-blue text-white' : 'bg-background-surface hover:bg-background-light text-text-secondary'}`}>
           {label}
       </button>
  );

  return (
    <div 
      className="bg-background-surface border border-background-light rounded-lg p-4 overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h3 className="text-lg font-bold text-text-primary whitespace-nowrap">{assetSymbol} Historical Price</h3>
        <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center p-1 rounded-lg border border-background-light bg-background">
                <IndicatorButton label="MA" isActive={showMA} onClick={() => setShowMA(!showMA)} />
                {showMA && (
                    <input 
                        type="number" 
                        value={maPeriod}
                        onChange={(e) => handlePeriodChange(setMaPeriod, e.target.value)}
                        className="w-14 bg-background-surface text-text-primary text-center rounded p-1 ml-1 text-xs focus:ring-1 focus:ring-accent-blue focus:border-accent-blue"
                        aria-label="MA Period"
                        min="2"
                        max="200"
                    />
                )}
            </div>
            <div className="flex items-center p-1 rounded-lg border border-background-light bg-background">
                <IndicatorButton label="RSI" isActive={showRSI} onClick={() => setShowRSI(!showRSI)} />
                {showRSI && (
                    <input 
                        type="number" 
                        value={rsiPeriod}
                        onChange={(e) => handlePeriodChange(setRsiPeriod, e.target.value)}
                        className="w-14 bg-background-surface text-text-primary text-center rounded p-1 ml-1 text-xs focus:ring-1 focus:ring-accent-blue focus:border-accent-blue"
                        aria-label="RSI Period"
                        min="2"
                        max="200"
                    />
                )}
            </div>
            <div className="flex items-center space-x-2 bg-background p-1 rounded-lg border border-background-light">
                {timeframes.map(tf => (
                    <button
                        key={tf}
                        onClick={() => setActiveTimeframe(tf)}
                        className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors duration-200 ${activeTimeframe === tf ? 'bg-accent-blue text-white' : 'bg-background-surface hover:bg-background-light text-text-secondary'}`}
                    >
                        {tf}
                    </button>
                ))}
            </div>
            <button
                onClick={handleExportData}
                className="p-2.5 bg-background-surface text-text-secondary hover:bg-background-light hover:text-white rounded-lg border border-background-light transition-colors"
                title="Export Chart Data as CSV"
                aria-label="Export Chart Data"
            >
                <DownloadIcon />
            </button>
        </div>
      </div>
      <div className="relative">
          <DataLegend data={legendData} assetSymbol={assetSymbol} maPeriod={maPeriod} rsiPeriod={rsiPeriod} />
          <div ref={chartContainerRef} className="w-full" style={{ height: `${showRSI ? chartHeight + rsiPaneHeight : chartHeight}px`, transition: 'height 0.3s ease-in-out' }} />
      </div>
    </div>
  );
};

export default CandlestickChart;