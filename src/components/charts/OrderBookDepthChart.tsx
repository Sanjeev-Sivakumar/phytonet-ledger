import React, { useState, useMemo } from 'react';
import { OrderBookItem } from '../../types';

interface OrderBookDepthChartProps {
  title?: string;
  subtitle?: string;
  bids: OrderBookItem[];
  asks: OrderBookItem[];
  currentPrice: number;
  height?: number;
  isDaylight?: boolean;
}

export const OrderBookDepthChart: React.FC<OrderBookDepthChartProps> = ({
  title = 'Order book market depth',
  subtitle = 'Cumulative buy & sell volume ($PNL / USDC)',
  bids,
  asks,
  currentPrice,
  height = 180,
  isDaylight = true
}) => {
  const [hoverData, setHoverData] = useState<{
    side: 'bid' | 'ask';
    price: number;
    depth: number;
  } | null>(null);

  // Compute cumulative depth curves
  const { sortedBids, sortedAsks, maxDepth } = useMemo(() => {
    // Sort bids descending by price
    const sBids = [...bids].sort((a, b) => b.price_pnl - a.price_pnl);
    let cumBids = 0;
    const bidCurve = sBids.map((b) => {
      cumBids += b.amount_tons;
      return { price: b.price_pnl, cumVolume: cumBids };
    });

    // Sort asks ascending by price
    const sAsks = [...asks].sort((a, b) => a.price_pnl - b.price_pnl);
    let cumAsks = 0;
    const askCurve = sAsks.map((a) => {
      cumAsks += a.amount_tons;
      return { price: a.price_pnl, cumVolume: cumAsks };
    });

    const maxD = Math.max(cumBids, cumAsks, 10);

    return {
      sortedBids: bidCurve,
      sortedAsks: askCurve,
      maxDepth: maxD
    };
  }, [bids, asks]);

  const width = 600;
  const padLeft = 40;
  const padRight = 40;
  const padTop = 15;
  const padBottom = 25;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;
  const halfWidth = plotWidth / 2;

  // Bids render on left, asks on right
  // Left half (Bids): 0 (midPrice) -> -x (lower prices)
  const bidPoints = sortedBids.map((b, idx) => {
    const x = padLeft + halfWidth - (idx / Math.max(1, sortedBids.length - 1)) * halfWidth;
    const y = padTop + (1 - b.cumVolume / maxDepth) * plotHeight;
    return { x, y, price: b.price, cumVolume: b.cumVolume };
  });

  const askPoints = sortedAsks.map((a, idx) => {
    const x = padLeft + halfWidth + (idx / Math.max(1, sortedAsks.length - 1)) * halfWidth;
    const y = padTop + (1 - a.cumVolume / maxDepth) * plotHeight;
    return { x, y, price: a.price, cumVolume: a.cumVolume };
  });

  const bidPath =
    bidPoints.length > 0
      ? `M ${padLeft + halfWidth} ${padTop + plotHeight} ` +
        bidPoints.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') +
        ` L ${padLeft} ${padTop + plotHeight} Z`
      : '';

  const askPath =
    askPoints.length > 0
      ? `M ${padLeft + halfWidth} ${padTop + plotHeight} ` +
        askPoints.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') +
        ` L ${width - padRight} ${padTop + plotHeight} Z`
      : '';

  return (
    <div
      className={`relative w-full rounded-xl transition-all ${
        isDaylight ? 'daylight-chart-panel p-4 sm:p-5' : 'forest-panel p-4 sm:p-5'
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b mb-3 border-inherit">
        <div>
          <h4
            className={`text-sm font-semibold tracking-tight ${
              isDaylight ? 'text-[#0F172A]' : 'text-[#F3F5EF]'
            }`}
          >
            {title}
          </h4>
          <p
            className={`text-xs mt-0.5 ${
              isDaylight ? 'text-[#64748B]' : 'text-[#A7B5A7]'
            }`}
          >
            {subtitle}
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#047857]" />
            <span className={isDaylight ? 'text-[#475569]' : 'text-[#A7B5A7]'}>
              Bids (Buy)
            </span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#DC2626]" />
            <span className={isDaylight ? 'text-[#475569]' : 'text-[#A7B5A7]'}>
              Asks (Sell)
            </span>
          </div>
        </div>
      </div>

      {/* SVG Depth Chart */}
      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
          style={{ maxHeight: height }}
          onMouseLeave={() => setHoverData(null)}
        >
          <defs>
            <linearGradient id="bidGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#047857" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#047857" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="askGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#DC2626" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#DC2626" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((t, idx) => {
            const y = padTop + t * plotHeight;
            return (
              <line
                key={`grid-${idx}`}
                x1={padLeft}
                y1={y}
                x2={width - padRight}
                y2={y}
                stroke={isDaylight ? '#E2E8F0' : 'rgba(46,90,54,0.25)'}
                strokeDasharray="3,3"
              />
            );
          })}

          {/* Center Mid-Market Line */}
          <line
            x1={padLeft + halfWidth}
            y1={padTop}
            x2={padLeft + halfWidth}
            y2={padTop + plotHeight}
            stroke={isDaylight ? '#94A3B8' : '#86EFAC'}
            strokeWidth="1.5"
            strokeDasharray="2,2"
          />

          {/* Bid Area & Line */}
          {bidPath && (
            <path d={bidPath} fill="url(#bidGrad)" stroke="#047857" strokeWidth="1.5" />
          )}

          {/* Ask Area & Line */}
          {askPath && (
            <path d={askPath} fill="url(#askGrad)" stroke="#DC2626" strokeWidth="1.5" />
          )}

          {/* Interactive Rectangles for Tooltips */}
          {bidPoints.map((p, idx) => (
            <rect
              key={`bid-hov-${idx}`}
              x={p.x - 5}
              y={padTop}
              width={10}
              height={plotHeight}
              fill="transparent"
              className="cursor-crosshair"
              onMouseEnter={() =>
                setHoverData({ side: 'bid', price: p.price, depth: p.cumVolume })
              }
            />
          ))}

          {askPoints.map((p, idx) => (
            <rect
              key={`ask-hov-${idx}`}
              x={p.x - 5}
              y={padTop}
              width={10}
              height={plotHeight}
              fill="transparent"
              className="cursor-crosshair"
              onMouseEnter={() =>
                setHoverData({ side: 'ask', price: p.price, depth: p.cumVolume })
              }
            />
          ))}

          {/* X Axis Labels */}
          <text
            x={padLeft}
            y={height - 8}
            fill={isDaylight ? '#64748B' : '#A7B5A7'}
            fontSize="10"
            fontFamily="JetBrains Mono, monospace"
          >
            ${(currentPrice * 0.94).toFixed(2)}
          </text>

          <text
            x={padLeft + halfWidth}
            y={height - 8}
            textAnchor="middle"
            fill={isDaylight ? '#0F172A' : '#86EFAC'}
            fontSize="10"
            fontWeight="600"
            fontFamily="JetBrains Mono, monospace"
          >
            Mid: ${currentPrice.toFixed(2)}
          </text>

          <text
            x={width - padRight}
            y={height - 8}
            textAnchor="end"
            fill={isDaylight ? '#64748B' : '#A7B5A7'}
            fontSize="10"
            fontFamily="JetBrains Mono, monospace"
          >
            ${(currentPrice * 1.06).toFixed(2)}
          </text>
        </svg>

        {/* Hover Tooltip */}
        {hoverData && (
          <div
            className={`absolute top-2 right-4 px-2.5 py-1.5 rounded-lg border text-xs font-mono shadow-sm z-20 ${
              isDaylight
                ? 'bg-white border-[#CBD5E1] text-[#0F172A]'
                : 'bg-[#151D17] border-[#2E5A36] text-[#F3F5EF]'
            }`}
          >
            <span
              className={
                hoverData.side === 'bid'
                  ? 'text-[#047857] font-bold'
                  : 'text-[#DC2626] font-bold'
              }
            >
              {hoverData.side === 'bid' ? 'Buy depth' : 'Sell depth'}:
            </span>{' '}
            {hoverData.depth.toFixed(1)} MT @ ${hoverData.price.toFixed(2)}
          </div>
        )}
      </div>
    </div>
  );
};
export default OrderBookDepthChart;
