import React, { useState, useMemo, useRef } from 'react';

export interface DataSeries {
  id: string;
  name: string;
  color: string;
  unit: string;
  data: Array<{ timestamp: string | number; value: number }>;
}

interface TimeSeriesAreaChartProps {
  title?: string;
  subtitle?: string;
  series: DataSeries[];
  height?: number;
  timeframes?: string[];
  activeTimeframe?: string;
  onTimeframeChange?: (tf: string) => void;
  showLegend?: boolean;
  isDaylight?: boolean;
  isLoading?: boolean;
  emptyMessage?: string;
  sourceBadge?: string;
}

export const TimeSeriesAreaChart: React.FC<TimeSeriesAreaChartProps> = ({
  title,
  subtitle,
  series,
  height = 240,
  timeframes = ['1h', '24h', '7d', '30d'],
  activeTimeframe,
  onTimeframeChange,
  showLegend = true,
  isDaylight = false,
  isLoading = false,
  emptyMessage = 'No telemetry data available',
  sourceBadge
}) => {
  const [selectedTf, setSelectedTf] = useState(activeTimeframe || timeframes[0]);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTfClick = (tf: string) => {
    setSelectedTf(tf);
    if (onTimeframeChange) onTimeframeChange(tf);
  };

  // Find min/max values across all series
  const { allPoints, minVal, maxVal, timestamps } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    const timestampsList: Array<string | number> = [];

    series.forEach((s) => {
      s.data.forEach((pt) => {
        if (pt.value < min) min = pt.value;
        if (pt.value > max) max = pt.value;
        if (!timestampsList.includes(pt.timestamp)) {
          timestampsList.push(pt.timestamp);
        }
      });
    });

    if (min === Infinity) min = 0;
    if (max === -Infinity) max = 100;
    if (min === max) {
      min -= 10;
      max += 10;
    }

    // Add 10% breathing room on top
    const range = max - min;
    max += range * 0.08;
    if (min > 0) min = Math.max(0, min - range * 0.05);

    return {
      allPoints: series,
      minVal: min,
      maxVal: max,
      timestamps: timestampsList
    };
  }, [series]);

  const width = 800; // SVG viewBox coordinate width
  const padLeft = 46;
  const padRight = 16;
  const padTop = 18;
  const padBottom = 26;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  const getX = (idx: number, total: number) => {
    if (total <= 1) return padLeft + plotWidth / 2;
    return padLeft + (idx / (total - 1)) * plotWidth;
  };

  const getY = (val: number) => {
    const norm = (val - minVal) / (maxVal - minVal || 1);
    return padTop + (1 - norm) * plotHeight;
  };

  // Horizontal grid lines
  const gridTicks = [0, 0.25, 0.5, 0.75, 1];

  const hasData = series.some((s) => s.data && s.data.length > 0);

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-xl transition-all ${
        isDaylight ? 'daylight-chart-panel p-4 sm:p-5' : 'forest-panel p-4 sm:p-5'
      }`}
    >
      {/* Header with Title, Source Badge, and Timeframe Filters */}
      {(title || subtitle || timeframes.length > 0) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b mb-3.5 border-inherit">
          <div>
            <div className="flex items-center space-x-2">
              {title && (
                <h4
                  className={`text-sm font-semibold tracking-tight ${
                    isDaylight ? 'text-[#0F172A]' : 'text-[#F3F5EF]'
                  }`}
                >
                  {title}
                </h4>
              )}
              {sourceBadge && (
                <span
                  className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded ${
                    isDaylight
                      ? 'bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1]'
                      : 'bg-[#1B251E] text-[#86EFAC] border border-[#2E5A36]/50'
                  }`}
                >
                  {sourceBadge}
                </span>
              )}
            </div>
            {subtitle && (
              <p
                className={`text-xs mt-0.5 ${
                  isDaylight ? 'text-[#64748B]' : 'text-[#A7B5A7]'
                }`}
              >
                {subtitle}
              </p>
            )}
          </div>

          {/* Timeframe Selector */}
          {timeframes && timeframes.length > 0 && (
            <div
              className={`flex items-center space-x-1 p-0.5 rounded-lg border self-start sm:self-auto ${
                isDaylight
                  ? 'bg-[#F8FAFC] border-[#E2E8F0]'
                  : 'bg-[#151D17] border-[#2E5A36]/40'
              }`}
            >
              {timeframes.map((tf) => (
                <button
                  key={tf}
                  onClick={() => handleTfClick(tf)}
                  className={`px-2.5 py-1 text-xs font-mono font-medium rounded transition-all ${
                    selectedTf === tf
                      ? isDaylight
                        ? 'bg-[#0F172A] text-white shadow-xs'
                        : 'bg-[#2E5A36] text-[#F3F5EF] shadow-xs'
                      : isDaylight
                      ? 'text-[#64748B] hover:text-[#0F172A]'
                      : 'text-[#A7B5A7] hover:text-[#F3F5EF]'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SVG Canvas Area */}
      {isLoading ? (
        <div
          style={{ height }}
          className="flex items-center justify-center text-xs font-mono text-[#86EFAC]"
        >
          <span className="animate-pulse">Loading telemetry points...</span>
        </div>
      ) : !hasData ? (
        <div
          style={{ height }}
          className="flex items-center justify-center text-xs font-mono text-[#64748B]"
        >
          <span>{emptyMessage}</span>
        </div>
      ) : (
        <div className="relative">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto overflow-visible select-none"
            style={{ maxHeight: height }}
            onMouseLeave={() => setHoverIndex(null)}
          >
            <defs>
              {series.map((s) => (
                <linearGradient
                  key={`grad-${s.id}`}
                  id={`area-grad-${s.id}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={s.color} stopOpacity={isDaylight ? 0.25 : 0.35} />
                  <stop offset="95%" stopColor={s.color} stopOpacity={0.0} />
                </linearGradient>
              ))}
            </defs>

            {/* Horizontal Grid Lines */}
            {gridTicks.map((t, i) => {
              const y = padTop + t * plotHeight;
              const val = maxVal - t * (maxVal - minVal);
              return (
                <g key={`grid-${i}`}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={width - padRight}
                    y2={y}
                    stroke={isDaylight ? '#E2E8F0' : 'rgba(46, 90, 54, 0.25)'}
                    strokeDasharray={i === gridTicks.length - 1 ? undefined : '3,3'}
                    strokeWidth="1"
                  />
                  <text
                    x={padLeft - 6}
                    y={y + 3.5}
                    textAnchor="end"
                    fill={isDaylight ? '#64748B' : '#6C7D6C'}
                    fontSize="9"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val.toFixed(val < 10 ? 1 : 0)}
                  </text>
                </g>
              );
            })}

            {/* Render Each Series Line and Shaded Area */}
            {series.map((s) => {
              const total = s.data.length;
              if (total === 0) return null;

              const points = s.data.map((pt, idx) => ({
                x: getX(idx, total),
                y: getY(pt.value),
                value: pt.value,
                timestamp: pt.timestamp
              }));

              const linePath = points
                .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
                .join(' ');

              const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(padTop + plotHeight).toFixed(1)} L ${points[0].x.toFixed(1)} ${(padTop + plotHeight).toFixed(1)} Z`;

              return (
                <g key={`series-group-${s.id}`}>
                  <path d={areaPath} fill={`url(#area-grad-${s.id})`} />
                  <path
                    d={linePath}
                    fill="none"
                    stroke={s.color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              );
            })}

            {/* Interactive Overlay for Hover Detection */}
            {series[0] &&
              series[0].data.map((pt, idx) => {
                const total = series[0].data.length;
                const x = getX(idx, total);
                const colWidth = plotWidth / Math.max(1, total - 1);

                return (
                  <rect
                    key={`hover-col-${idx}`}
                    x={x - colWidth / 2}
                    y={padTop}
                    width={colWidth}
                    height={plotHeight}
                    fill="transparent"
                    className="cursor-crosshair"
                    onMouseEnter={() => setHoverIndex(idx)}
                  />
                );
              })}

            {/* Hover Crosshair and Dot Highlights */}
            {hoverIndex !== null && series[0] && series[0].data[hoverIndex] && (
              <g>
                <line
                  x1={getX(hoverIndex, series[0].data.length)}
                  y1={padTop}
                  x2={getX(hoverIndex, series[0].data.length)}
                  y2={padTop + plotHeight}
                  stroke={isDaylight ? '#94A3B8' : '#86EFAC'}
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />

                {series.map((s) => {
                  const pt = s.data[hoverIndex];
                  if (!pt) return null;
                  const cx = getX(hoverIndex, s.data.length);
                  const cy = getY(pt.value);

                  return (
                    <g key={`hover-dot-${s.id}`}>
                      <circle cx={cx} cy={cy} r="5" fill={s.color} />
                      <circle cx={cx} cy={cy} r="2" fill="#FFFFFF" />
                    </g>
                  );
                })}
              </g>
            )}
          </svg>

          {/* Floating Hover Tooltip Box */}
          {hoverIndex !== null && series[0] && series[0].data[hoverIndex] && (
            <div
              className={`absolute top-2 pointer-events-none p-2.5 rounded-lg border text-xs shadow-md transition-all ${
                isDaylight
                  ? 'bg-white/95 border-[#E2E8F0] text-[#0F172A]'
                  : 'bg-[#151D17]/95 border-[#2E5A36] text-[#F3F5EF]'
              }`}
              style={{
                left: `${Math.min(
                  75,
                  Math.max(
                    15,
                    (getX(hoverIndex, series[0].data.length) / width) * 100
                  )
                )}%`
              }}
            >
              <div className="font-mono text-[11px] text-[#A7B5A7] pb-1 border-b border-inherit mb-1">
                {String(series[0].data[hoverIndex].timestamp)}
              </div>
              {series.map((s) => {
                const pt = s.data[hoverIndex];
                if (!pt) return null;
                return (
                  <div key={`tip-${s.id}`} className="flex items-center justify-between space-x-3 text-xs">
                    <span className="flex items-center space-x-1.5 font-medium">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                      <span>{s.name}:</span>
                    </span>
                    <span className="font-mono font-semibold" style={{ color: s.color }}>
                      {pt.value.toFixed(pt.value < 10 ? 2 : 1)} {s.unit}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      {showLegend && series.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 pt-2.5 mt-2 border-t border-inherit text-xs">
          {series.map((s) => (
            <div key={`legend-${s.id}`} className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
              <span className={`font-medium ${isDaylight ? 'text-[#334155]' : 'text-[#A7B5A7]'}`}>
                {s.name}
              </span>
              <span className="font-mono text-[11px] text-[#6C7D6C]">
                ({s.unit})
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default TimeSeriesAreaChart;
