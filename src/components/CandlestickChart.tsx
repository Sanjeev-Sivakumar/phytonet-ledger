import React, { useState, useRef, useEffect, useMemo } from 'react';
import { TrendingUp, BarChart2, Activity, Layers, Calendar, ChevronRight } from 'lucide-react';

interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ma7?: number;
  ma25?: number;
}

interface CandlestickChartProps {
  currentPrice: number;
  isSlashed?: boolean;
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
  currentPrice,
  isSlashed = false
}) => {
  const [timeframe, setTimeframe] = useState<'1H' | '24H' | '7D' | '30D'>('24H');
  const [chartStyle, setChartStyle] = useState<'spline' | 'candle'>('spline');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate realistic smooth historical trajectory series based on current price
  const candles: CandleData[] = useMemo(() => {
    const list: CandleData[] = [];
    const count = 48;
    let base = isSlashed ? 0.0 : Math.max(120, currentPrice - 6.5);

    for (let i = 0; i < count; i++) {
      const trend = Math.sin((i / count) * Math.PI * 1.5) * 4.2;
      const volatility = isSlashed ? 0.0 : 1.2 + (Math.sin(i * 0.8) * 0.8);
      const open = base;
      const delta = (Math.random() - 0.46) * volatility * 2.2 + (trend * 0.1);
      const close = isSlashed ? 0.0 : Number((open + delta).toFixed(2));
      const high = isSlashed ? 0.0 : Number((Math.max(open, close) + Math.random() * 1.2).toFixed(2));
      const low = isSlashed ? 0.0 : Number((Math.min(open, close) - Math.random() * 1.1).toFixed(2));
      const volume = Math.round(220 + Math.random() * 380 + (close > open ? 160 : 0));

      const hour = (i * 30) % (24 * 60);
      const hh = String(Math.floor(hour / 60)).padStart(2, '0');
      const mm = String(hour % 60).padStart(2, '0');

      list.push({
        time: `${hh}:${mm}`,
        open,
        high,
        low,
        close,
        volume
      });

      base = close;
    }

    // Compute Moving Averages MA7 & MA25
    for (let i = 0; i < list.length; i++) {
      if (i >= 6) {
        const sum7 = list.slice(i - 6, i + 1).reduce((acc, c) => acc + c.close, 0);
        list[i].ma7 = Number((sum7 / 7).toFixed(2));
      }
      if (i >= 24) {
        const sum25 = list.slice(i - 24, i + 1).reduce((acc, c) => acc + c.close, 0);
        list[i].ma25 = Number((sum25 / 25).toFixed(2));
      }
    }

    return list;
  }, [currentPrice, isSlashed, timeframe]);

  // Active hover point or latest
  const activeCandle = hoverIndex !== null && candles[hoverIndex] ? candles[hoverIndex] : candles[candles.length - 1];

  // Render on HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Solid White Canvas Background (#FFFFFF)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    const padLeft = 15;
    const padRight = 55;
    const padTop = 20;
    const padBottom = 30;
    const plotW = width - padLeft - padRight;
    const chartHeight = (height - padTop - padBottom) * 0.74;
    const volHeight = (height - padTop - padBottom) * 0.22;
    const volTop = padTop + chartHeight + 10;

    // Grid lines
    ctx.strokeStyle = '#F1F5F9';
    ctx.lineWidth = 1;

    for (let c = 0; c <= 6; c++) {
      const x = padLeft + (plotW / 6) * c;
      ctx.beginPath();
      ctx.moveTo(x, padTop);
      ctx.lineTo(x, height - padBottom);
      ctx.stroke();
    }
    for (let r = 0; r <= 4; r++) {
      const y = padTop + (chartHeight / 4) * r;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + plotW, y);
      ctx.stroke();
    }

    // Price scaling
    const allLows = candles.map((c) => c.low).filter((v) => v > 0);
    const allHighs = candles.map((c) => c.high);
    const minP = allLows.length > 0 ? Math.min(...allLows) - 1.0 : 0;
    const maxP = allHighs.length > 0 ? Math.max(...allHighs) + 1.0 : 100;
    const pRange = maxP - minP || 1;

    const getX = (idx: number) => padLeft + (idx / (candles.length - 1)) * plotW;
    const getY = (price: number) => padTop + chartHeight - ((price - minP) / pRange) * chartHeight;

    // Volume scaling
    const maxVol = Math.max(...candles.map((c) => c.volume), 1);
    const getVolH = (vol: number) => (vol / maxVol) * volHeight;

    // Draw Volume Bars
    const barWidth = Math.max(3, (plotW / candles.length) * 0.7);
    candles.forEach((c, i) => {
      const x = getX(i) - barWidth / 2;
      const vH = getVolH(c.volume);
      const y = volTop + volHeight - vH;

      ctx.fillStyle = c.close >= c.open ? 'rgba(34, 197, 94, 0.35)' : 'rgba(239, 68, 68, 0.35)';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(x, y, barWidth, vH, [2, 2, 0, 0]) : ctx.rect(x, y, barWidth, vH);
      ctx.fill();
    });

    if (chartStyle === 'spline') {
      // 1. Spline Area Fill (Smooth Gradient)
      const grad = ctx.createLinearGradient(0, padTop, 0, padTop + chartHeight);
      grad.addColorStop(0, 'rgba(34, 197, 94, 0.22)');
      grad.addColorStop(0.7, 'rgba(34, 197, 94, 0.05)');
      grad.addColorStop(1, 'rgba(34, 197, 94, 0.00)');

      ctx.beginPath();
      ctx.moveTo(getX(0), getY(candles[0].close));
      for (let i = 0; i < candles.length - 1; i++) {
        const xCurrent = getX(i);
        const yCurrent = getY(candles[i].close);
        const xNext = getX(i + 1);
        const yNext = getY(candles[i + 1].close);
        const cx = (xCurrent + xNext) / 2;
        ctx.bezierCurveTo(cx, yCurrent, cx, yNext, xNext, yNext);
      }
      ctx.lineTo(getX(candles.length - 1), padTop + chartHeight);
      ctx.lineTo(getX(0), padTop + chartHeight);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // 2. Main Trajectory Spline Line (Vibrant Emerald)
      ctx.beginPath();
      ctx.moveTo(getX(0), getY(candles[0].close));
      for (let i = 0; i < candles.length - 1; i++) {
        const xCurrent = getX(i);
        const yCurrent = getY(candles[i].close);
        const xNext = getX(i + 1);
        const yNext = getY(candles[i + 1].close);
        const cx = (xCurrent + xNext) / 2;
        ctx.bezierCurveTo(cx, yCurrent, cx, yNext, xNext, yNext);
      }
      ctx.strokeStyle = '#16A34A';
      ctx.lineWidth = 2.5;
      ctx.stroke();

    } else {
      // Candlestick View (High Precision Modern Candlesticks)
      candles.forEach((c, i) => {
        const x = getX(i);
        const isBull = c.close >= c.open;
        const color = isBull ? '#16A34A' : '#EF4444';

        // Wick
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x, getY(c.high));
        ctx.lineTo(x, getY(c.low));
        ctx.stroke();

        // Candle Body
        const yOpen = getY(c.open);
        const yClose = getY(c.close);
        const bodyY = Math.min(yOpen, yClose);
        const bodyH = Math.max(2, Math.abs(yClose - yOpen));

        ctx.fillStyle = color;
        ctx.fillRect(x - barWidth / 2, bodyY, barWidth, bodyH);
      });
    }

    // 3. Moving Average MA(7) — Deep Blue
    ctx.beginPath();
    let ma7Started = false;
    candles.forEach((c, i) => {
      if (c.ma7 !== undefined) {
        const x = getX(i);
        const y = getY(c.ma7);
        if (!ma7Started) {
          ctx.moveTo(x, y);
          ma7Started = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
    });
    ctx.strokeStyle = '#2563EB';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // 4. Moving Average MA(25) — Amber
    ctx.beginPath();
    let ma25Started = false;
    candles.forEach((c, i) => {
      if (c.ma25 !== undefined) {
        const x = getX(i);
        const y = getY(c.ma25);
        if (!ma25Started) {
          ctx.moveTo(x, y);
          ma25Started = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
    });
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Y-Axis Price Labels (Right Hand Side)
    ctx.fillStyle = '#0F172A';
    ctx.font = '500 10px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    for (let r = 0; r <= 4; r++) {
      const priceVal = maxP - (pRange / 4) * r;
      const y = padTop + (chartHeight / 4) * r + 3;
      ctx.fillText(`$${priceVal.toFixed(1)}`, padLeft + plotW + 8, y);
    }

    // Interactive Hover Crosshair
    if (hoverIndex !== null && candles[hoverIndex]) {
      const hX = getX(hoverIndex);
      const hY = getY(candles[hoverIndex].close);

      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(hX, padTop);
      ctx.lineTo(hX, height - padBottom);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(padLeft, hY);
      ctx.lineTo(padLeft + plotW, hY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Point circle
      ctx.fillStyle = '#16A34A';
      ctx.beginPath();
      ctx.arc(hX, hY, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [candles, chartStyle, hoverIndex]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - 15;
    const plotW = rect.width - 70;
    const idx = Math.round((x / plotW) * (candles.length - 1));
    if (idx >= 0 && idx < candles.length) {
      setHoverIndex(idx);
    }
  };

  const firstPrice = candles[0]?.close || currentPrice;
  const lastPrice = activeCandle?.close || currentPrice;
  const priceChange = lastPrice - firstPrice;
  const pctChange = firstPrice > 0 ? ((priceChange / firstPrice) * 100).toFixed(2) : '0.00';

  return (
    <div className="daylight-chart-panel p-5 sm:p-6 rounded-xl border border-[#CBD5E1] select-none shadow-xs">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0] mb-3.5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#16A34A]" />
            <h3 className="text-base font-semibold text-[#0F172A] tracking-tight">
              Tokenized carbon asset spot price ($PNL / USDC)
            </h3>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#15803D] border border-[#BBF7D0] font-semibold">
              Live AMM pool
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Real-time valuation trajectory, moving averages (MA7 &amp; MA25), and liquidity volume
          </p>
        </div>

        {/* View Toggle & Timeframe Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Chart Style Switcher */}
          <div className="flex items-center p-0.5 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0]">
            <button
              onClick={() => setChartStyle('spline')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                chartStyle === 'spline'
                  ? 'bg-[#FFFFFF] text-[#0F172A] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Spline trajectory
            </button>
            <button
              onClick={() => setChartStyle('candle')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                chartStyle === 'candle'
                  ? 'bg-[#FFFFFF] text-[#0F172A] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Candlestick view
            </button>
          </div>

          {/* Timeframe Selectors */}
          <div className="flex items-center p-1 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0]">
            {(['1H', '24H', '7D', '30D'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-mono font-bold transition-all ${
                  timeframe === tf
                    ? 'bg-[#0F172A] text-[#FFFFFF] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metric Callouts Row */}
      <div className="flex flex-wrap items-baseline gap-4 sm:gap-6 mb-3.5 pb-3.5 border-b border-[#E2E8F0]">
        <div>
          <span className="text-xs sm:text-sm font-semibold text-[#64748B] block">Spot price</span>
          <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#0F172A]">
            ${lastPrice.toFixed(2)}
          </span>
        </div>

        <div>
          <span className="text-xs sm:text-sm font-semibold text-[#64748B] block">24-hour change</span>
          <span
            className={`font-mono text-base sm:text-lg font-bold ${
              Number(pctChange) >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'
            }`}
          >
            {Number(pctChange) >= 0 ? `+${pctChange}%` : `${pctChange}%`}
          </span>
        </div>

        <div>
          <span className="text-xs sm:text-sm font-semibold text-[#64748B] block">24-hour high</span>
          <span className="font-mono text-base sm:text-lg font-bold text-[#0F172A]">
            ${Math.max(...candles.map((c) => c.high)).toFixed(2)}
          </span>
        </div>

        <div>
          <span className="text-xs sm:text-sm font-semibold text-[#64748B] block">24-hour low</span>
          <span className="font-mono text-base sm:text-lg font-bold text-[#0F172A]">
            ${Math.min(...candles.map((c) => c.low)).toFixed(2)}
          </span>
        </div>

        {/* Legend Indicators */}
        <div className="ml-auto flex flex-wrap items-center gap-3 text-xs sm:text-sm font-semibold">
          <span className="flex items-center space-x-1.5 text-[#16A34A]">
            <span className="w-2.5 h-1.5 bg-[#16A34A] rounded-full" />
            <span>Spot price</span>
          </span>
          <span className="flex items-center space-x-1.5 text-[#2563EB]">
            <span className="w-2.5 h-1.5 bg-[#2563EB] rounded-full" />
            <span>MA (7)</span>
          </span>
          <span className="flex items-center space-x-1.5 text-[#D97706]">
            <span className="w-2.5 h-1.5 bg-[#D97706] rounded-full" />
            <span>MA (25)</span>
          </span>
          <span className="flex items-center space-x-1.5 text-[#64748B]">
            <span className="w-2.5 h-2.5 bg-[#CBD5E1] rounded-xs" />
            <span>Volume</span>
          </span>
        </div>
      </div>

      {/* Main Canvas Chart Surface */}
      <div className="w-full h-72 sm:h-80 relative rounded-xl overflow-hidden border border-[#E2E8F0] bg-[#FFFFFF]">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIndex(null)}
          className="w-full h-full block cursor-crosshair"
        />
      </div>

      {/* Footer Info Row */}
      <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm font-mono text-[#64748B] mt-3 pt-2.5 border-t border-[#F1F5F9]">
        <span>Total depth: $842,500 USDC</span>
        <span className="text-[#16A34A] font-semibold">Execution: fast finality</span>
        <span>Slippage: 0.15%</span>
      </div>
    </div>
  );
};
