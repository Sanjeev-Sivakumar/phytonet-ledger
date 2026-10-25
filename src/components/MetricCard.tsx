import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  status?: 'normal' | 'active' | 'warning' | 'critical';
  trend?: string;
  progressPercent?: number;
  source?: 'hardware' | 'api' | 'model';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  subtext,
  status = 'normal',
  trend,
  progressPercent,
  source
}) => {
  const getStatusBorder = () => {
    switch (status) {
      case 'critical':
        return 'border-[#FCA5A5] bg-white ring-1 ring-[#FCA5A5]/30';
      case 'warning':
        return 'border-[#FCD34D] bg-white ring-1 ring-[#FCD34D]/30';
      case 'active':
        return 'border-[#A7F3D0] bg-white ring-1 ring-[#A7F3D0]/30';
      case 'normal':
      default:
        return 'border-[#D2E2D5] bg-white';
    }
  };

  const getValueColor = () => {
    switch (status) {
      case 'critical':
        return 'text-[#B91C1C]';
      case 'warning':
        return 'text-[#B45309]';
      case 'active':
        return 'text-[#15803D]';
      case 'normal':
      default:
        return 'text-[#112415]';
    }
  };

  const getSourceBadge = () => {
    if (!source) return null;
    switch (source) {
      case 'hardware':
        return (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-[#E8F7ED] text-[#15803D] border border-[#A7F3D0] font-semibold">
            Physical hardware
          </span>
        );
      case 'api':
        return (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] font-semibold">
            Open-Meteo
          </span>
        );
      case 'model':
      default:
        return (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-[#F0F5F1] text-[#3B5740] border border-[#D2E2D5] font-semibold">
            Biophysical model
          </span>
        );
    }
  };

  return (
    <div
      className={`rounded-2xl p-4 border transition-all duration-200 relative overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-sm ${getStatusBorder()}`}
    >
      {/* Top Label & Source / Trend */}
      <div>
        <div className="flex items-center justify-between mb-2 gap-2">
          <span className="text-sm font-bold text-[#2A442F] truncate">
            {label}
          </span>
          <div className="flex items-center space-x-1.5 flex-shrink-0">
            {getSourceBadge()}
            {trend && (
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#E8F3EA] text-[#1E562A] border border-[#C2DEC6]">
                {trend}
              </span>
            )}
          </div>
        </div>

        {/* Main Value & Unit */}
        <div className="flex items-baseline space-x-2 my-1.5">
          <span className={`text-3xl sm:text-4xl font-extrabold font-mono tracking-tight ${getValueColor()}`}>
            {value}
          </span>
          {unit && (
            <span className="text-sm font-mono font-bold text-[#58745E]">
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* Progress & Subtext */}
      <div>
        {progressPercent !== undefined && (
          <div className="w-full bg-[#EBF2ED] h-2 rounded-full my-2 overflow-hidden border border-[#D2E2D5]/60">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                status === 'critical'
                  ? 'bg-[#DC2626]'
                  : status === 'warning'
                  ? 'bg-[#F59E0B]'
                  : 'bg-[#16A34A]'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>
        )}

        {subtext && (
          <div className="text-xs font-mono text-[#58745E] truncate mt-1">
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
};
export default MetricCard;
