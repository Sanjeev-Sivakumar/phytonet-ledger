import React, { useState } from 'react';

export interface DonutSegment {
  id: string;
  label: string;
  value: number;
  unit?: string;
  color: string;
}

interface DonutChartProps {
  title?: string;
  subtitle?: string;
  segments: DonutSegment[];
  centerLabel?: string;
  centerValue?: string;
  isDaylight?: boolean;
  sourceBadge?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  title,
  subtitle,
  segments,
  centerLabel = 'Total',
  centerValue,
  isDaylight = false,
  sourceBadge
}) => {
  const [activeSegment, setActiveSegment] = useState<DonutSegment | null>(null);

  const totalValue = segments.reduce((sum, s) => sum + s.value, 0);

  // Geometry calculations for SVG Donut
  const size = 180;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div
      className={`relative w-full rounded-xl transition-all ${
        isDaylight ? 'daylight-chart-panel p-4 sm:p-5' : 'forest-panel p-4 sm:p-5'
      }`}
    >
      {/* Header */}
      {(title || subtitle) && (
        <div className="flex items-center justify-between pb-3 border-b mb-3 border-inherit">
          <div>
            <div className="flex items-center space-x-2">
              <h4
                className={`text-sm font-semibold tracking-tight ${
                  isDaylight ? 'text-[#0F172A]' : 'text-[#F3F5EF]'
                }`}
              >
                {title}
              </h4>
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
        </div>
      )}

      {/* Donut & Legend Container */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-5 my-1">
        {/* SVG Donut Circle */}
        <div className="relative flex items-center justify-center flex-shrink-0">
          <svg width={size} height={size} className="transform -rotate-90 select-none">
            {/* Background ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={isDaylight ? '#F1F5F9' : 'rgba(46, 90, 54, 0.25)'}
              strokeWidth={strokeWidth}
            />

            {/* Segments */}
            {segments.map((s) => {
              const percent = totalValue > 0 ? s.value / totalValue : 0;
              const strokeDasharray = `${percent * circumference} ${circumference}`;
              const strokeDashoffset = -(accumulatedPercent * circumference);
              accumulatedPercent += percent;

              const isHovered = activeSegment?.id === s.id;

              return (
                <circle
                  key={s.id}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={s.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setActiveSegment(s)}
                  onMouseLeave={() => setActiveSegment(null)}
                />
              );
            })}
          </svg>

          {/* Center Callout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span
              className={`text-[11px] font-medium tracking-tight ${
                isDaylight ? 'text-[#64748B]' : 'text-[#A7B5A7]'
              }`}
            >
              {activeSegment ? activeSegment.label : centerLabel}
            </span>
            <span
              className={`text-base font-mono font-bold ${
                isDaylight ? 'text-[#0F172A]' : 'text-[#F3F5EF]'
              }`}
            >
              {activeSegment
                ? `${activeSegment.value.toFixed(1)}${activeSegment.unit ? ` ${activeSegment.unit}` : ''}`
                : centerValue || (totalValue > 0 ? totalValue.toFixed(1) : '—')}
            </span>
            {activeSegment && totalValue > 0 && (
              <span className="text-[10px] font-mono text-[#4ADE80] font-semibold">
                {((activeSegment.value / totalValue) * 100).toFixed(0)}%
              </span>
            )}
          </div>
        </div>

        {/* Breakdown Legend List */}
        <div className="flex-1 w-full space-y-2">
          {segments.map((s) => {
            const pct = totalValue > 0 ? ((s.value / totalValue) * 100).toFixed(0) : '0';
            const isHovered = activeSegment?.id === s.id;

            return (
              <div
                key={`row-${s.id}`}
                onMouseEnter={() => setActiveSegment(s)}
                onMouseLeave={() => setActiveSegment(null)}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                  isHovered
                    ? isDaylight
                      ? 'bg-[#F1F5F9]'
                      : 'bg-[#1B251E] border border-[#2E5A36]/60'
                    : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: s.color }} />
                  <span
                    className={`text-xs font-medium ${
                      isDaylight ? 'text-[#334155]' : 'text-[#F3F5EF]'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                <div className="flex items-center space-x-2 font-mono text-xs">
                  <span className={isDaylight ? 'text-[#0F172A] font-semibold' : 'text-[#F3F5EF] font-semibold'}>
                    {s.value.toFixed(1)} {s.unit || ''}
                  </span>
                  <span className="text-[#6C7D6C] text-[11px] w-8 text-right font-medium">
                    {pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default DonutChart;
