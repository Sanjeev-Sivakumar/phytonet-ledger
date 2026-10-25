import React, { useRef, useEffect } from 'react';

interface WaveformCanvasProps {
  title: string;
  unit: string;
  currentValue: number;
  dataPoints: number[];
  color?: string;
  minExpected?: number;
  maxExpected?: number;
  zeroLine?: boolean;
  subHeader?: string;
  badgeText?: string;
}

export const WaveformCanvas: React.FC<WaveformCanvasProps> = ({
  title,
  unit,
  currentValue,
  dataPoints,
  color = '#2E5A36',
  minExpected = -10,
  maxExpected = 45,
  zeroLine = true,
  subHeader,
  badgeText
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Clear daylight panel canvas background to pure white #FFFFFF
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Draw Subtle Grid Lines (Daylight styling)
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;

    const gridCols = 8;
    for (let c = 1; c < gridCols; c++) {
      const x = (width / gridCols) * c;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    const gridRows = 4;
    for (let r = 1; r < gridRows; r++) {
      const y = (height / gridRows) * r;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Determine Dynamic Min / Max scale
    let yMin = minExpected;
    let yMax = maxExpected;
    if (dataPoints.length > 0) {
      const actualMin = Math.min(...dataPoints);
      const actualMax = Math.max(...dataPoints);
      if (actualMin < yMin) yMin = actualMin - 2;
      if (actualMax > yMax) yMax = actualMax + 2;
    }
    const yRange = yMax - yMin || 1;

    const getY = (val: number) => {
      const normalized = (val - yMin) / yRange;
      return height - normalized * height * 0.85 - height * 0.08;
    };

    // Draw Zero Baseline (if in range)
    if (zeroLine && yMin < 0 && yMax > 0) {
      const yZero = getY(0);
      ctx.strokeStyle = 'rgba(78, 135, 82, 0.45)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, yZero);
      ctx.lineTo(width, yZero);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (dataPoints.length < 2) return;

    // Draw Waveform Fill Gradient
    const stepX = width / (dataPoints.length - 1);
    ctx.beginPath();
    ctx.moveTo(0, height);

    dataPoints.forEach((val, idx) => {
      const x = idx * stepX;
      const y = getY(val);
      if (idx === 0) ctx.lineTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.lineTo(width, height);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(46, 90, 54, 0.32)');
    gradient.addColorStop(1, 'rgba(46, 90, 54, 0.02)');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw Waveform Line
    ctx.beginPath();
    dataPoints.forEach((val, idx) => {
      const x = idx * stepX;
      const y = getY(val);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.strokeStyle = color;
    ctx.lineWidth = 2.25;
    ctx.stroke();

    // Draw Tracer Head Dot
    const lastX = width;
    const lastY = getY(dataPoints[dataPoints.length - 1]);

    ctx.beginPath();
    ctx.arc(lastX - 3, lastY, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(lastX - 3, lastY, 8.5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(46, 90, 54, 0.4)';
    ctx.lineWidth = 1.75;
    ctx.stroke();

  }, [dataPoints, color, minExpected, maxExpected, zeroLine]);

  return (
    <div className="daylight-chart-panel p-4 sm:p-5 rounded-2xl border border-[#CBD5E1] flex flex-col justify-between select-none shadow-xs">
      {/* Header */}
      <div className="flex items-start justify-between mb-3 gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-[#0F172A] tracking-tight">
              {title}
            </h3>
            {badgeText && (
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
                {badgeText}
              </span>
            )}
          </div>
          {subHeader && (
            <p className="text-xs sm:text-sm text-[#475569] mt-0.5 leading-normal">
              {subHeader}
            </p>
          )}
        </div>

        {/* Current Numeric Readout */}
        <div className="text-right flex-shrink-0">
          <div className="flex items-baseline justify-end space-x-1.5">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono text-[#0F172A] tracking-tight">
              {currentValue.toFixed(2)}
            </span>
            <span className="text-sm font-mono font-bold text-[#047857]">
              {unit}
            </span>
          </div>
          <span className="text-xs font-mono text-[#64748B] block mt-0.5">
            64x oversample
          </span>
        </div>
      </div>

      {/* Real-Time HTML5 Canvas Area */}
      <div className="w-full h-36 sm:h-44 relative rounded-xl overflow-hidden border border-[#E2E8F0]">
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
        />
      </div>

      {/* Footer Axis & Range Indicators */}
      <div className="flex items-center justify-between text-xs sm:text-sm font-mono text-[#64748B] mt-3 pt-2.5 border-t border-[#E2E8F0]">
        <span>Min: {minExpected} {unit}</span>
        <span className="text-[#047857] font-semibold">Stream: 5.0 Hz active</span>
        <span>Max: {maxExpected} {unit}</span>
      </div>
    </div>
  );
};
export default WaveformCanvas;

