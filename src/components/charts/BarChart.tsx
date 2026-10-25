import React, { useState } from 'react';

export interface BarItem {
  id: string;
  label: string;
  value: number;
  secondaryValue?: number;
  unit: string;
  color?: string;
  secondaryColor?: string;
  annotation?: string;
}

interface BarChartProps {
  title?: string;
  subtitle?: string;
  items: BarItem[];
  height?: number;
  isDaylight?: boolean;
  orientation?: 'horizontal' | 'vertical';
  sourceBadge?: string;
  secondaryLegend?: string;
  primaryLegend?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  title,
  subtitle,
  items,
  height = 220,
  isDaylight = false,
  orientation = 'vertical',
  sourceBadge,
  primaryLegend,
  secondaryLegend
}) => {
  const [hoverId, setHoverId] = useState<string | null>(null);

  const maxValue = Math.max(
    ...items.map((i) => Math.max(i.value, i.secondaryValue || 0)),
    10
  );

  return (
    <div
      className={`relative w-full rounded-xl transition-all ${
        isDaylight ? 'daylight-chart-panel p-4 sm:p-5' : 'forest-panel p-4 sm:p-5'
      }`}
    >
      {/* Header */}
      {(title || subtitle) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b mb-3 border-inherit">
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

          {(primaryLegend || secondaryLegend) && (
            <div className="flex items-center space-x-3 text-xs font-mono">
              {primaryLegend && (
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#4ADE80]" />
                  <span className={isDaylight ? 'text-[#475569]' : 'text-[#A7B5A7]'}>
                    {primaryLegend}
                  </span>
                </div>
              )}
              {secondaryLegend && (
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#EF4444]" />
                  <span className={isDaylight ? 'text-[#475569]' : 'text-[#A7B5A7]'}>
                    {secondaryLegend}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Vertical Bars Visualization */}
      {orientation === 'vertical' ? (
        <div className="relative pt-2" style={{ height }}>
          <div className="flex items-end justify-between gap-2 h-full pb-6">
            {items.map((item) => {
              const heightPct = (item.value / maxValue) * 100;
              const secHeightPct = item.secondaryValue
                ? (item.secondaryValue / maxValue) * 100
                : null;
              const isHovered = hoverId === item.id;

              return (
                <div
                  key={item.id}
                  className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer"
                  onMouseEnter={() => setHoverId(item.id)}
                  onMouseLeave={() => setHoverId(null)}
                >
                  {/* Tooltip on Hover */}
                  {isHovered && (
                    <div
                      className={`absolute top-0 pointer-events-none px-2 py-1 rounded border text-[11px] font-mono z-20 shadow-md ${
                        isDaylight
                          ? 'bg-white border-[#CBD5E1] text-[#0F172A]'
                          : 'bg-[#151D17] border-[#2E5A36] text-[#86EFAC]'
                      }`}
                    >
                      {item.label}: {item.value} {item.unit}
                      {item.secondaryValue !== undefined && ` / ${item.secondaryValue} ${item.unit}`}
                    </div>
                  )}

                  {/* Dual or Single Bar Columns */}
                  <div className="w-full flex items-end justify-center space-x-1 max-w-[48px]">
                    {/* Primary Bar */}
                    <div
                      className={`w-full rounded-t-md transition-all duration-200 ${
                        isHovered ? 'brightness-110' : ''
                      }`}
                      style={{
                        height: `${Math.max(4, heightPct)}%`,
                        backgroundColor: item.color || '#4ADE80'
                      }}
                    />

                    {/* Secondary Bar if exists */}
                    {secHeightPct !== null && (
                      <div
                        className={`w-full rounded-t-md transition-all duration-200 ${
                          isHovered ? 'brightness-110' : ''
                        }`}
                        style={{
                          height: `${Math.max(4, secHeightPct)}%`,
                          backgroundColor: item.secondaryColor || '#EF4444'
                        }}
                      />
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={`mt-2 text-[11px] font-mono truncate max-w-full text-center transition-colors ${
                      isHovered
                        ? isDaylight
                          ? 'text-[#0F172A] font-semibold'
                          : 'text-[#F3F5EF] font-semibold'
                        : isDaylight
                        ? 'text-[#64748B]'
                        : 'text-[#6C7D6C]'
                    }`}
                    title={item.label}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Baseline */}
          <div
            className={`absolute bottom-6 left-0 right-0 border-b ${
              isDaylight ? 'border-[#E2E8F0]' : 'border-[rgba(46,90,54,0.35)]'
            }`}
          />
        </div>
      ) : (
        /* Horizontal Bars Visualization */
        <div className="space-y-3">
          {items.map((item) => {
            const widthPct = (item.value / maxValue) * 100;
            const isHovered = hoverId === item.id;

            return (
              <div
                key={item.id}
                className="space-y-1 cursor-pointer"
                onMouseEnter={() => setHoverId(item.id)}
                onMouseLeave={() => setHoverId(null)}
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span
                    className={`font-medium truncate ${
                      isDaylight ? 'text-[#334155]' : 'text-[#F3F5EF]'
                    }`}
                  >
                    {item.label}
                  </span>
                  <span className="font-semibold" style={{ color: item.color || '#4ADE80' }}>
                    {item.value.toFixed(1)} {item.unit}
                  </span>
                </div>
                <div
                  className={`w-full h-2 rounded-full overflow-hidden ${
                    isDaylight ? 'bg-[#F1F5F9]' : 'bg-[#151D17]'
                  }`}
                >
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.max(2, widthPct)}%`,
                      backgroundColor: item.color || '#4ADE80'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default BarChart;
