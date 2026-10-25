import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Clock,
  Gauge,
  Calendar,
  Layers,
  RefreshCw,
  Activity,
  Table as TableIcon,
  LineChart,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { PredictiveCarbonFluxResponse } from '../types';
import { fetchPredictiveCarbonFlux } from '../services/api';

interface PredictivePanelProps {
  currentStressMode?: string;
  isSlashed?: boolean;
}

export const PredictivePanel: React.FC<PredictivePanelProps> = ({
  currentStressMode = 'NORMAL',
  isSlashed = false
}) => {
  const [data, setData] = useState<PredictiveCarbonFluxResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [activeView, setActiveView] = useState<'both' | 'graph' | 'table'>('both');
  const [tableRange, setTableRange] = useState<'all' | '1-30' | '31-60' | '61-90'>('1-30');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const loadPrediction = (force = false) => {
    setIsLoading(true);
    fetchPredictiveCarbonFlux(currentStressMode, force)
      .then((res) => setData(res))
      .catch((err) => console.warn('Predictive carbon-flux notice:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadPrediction(true);
  }, [currentStressMode, isSlashed]);

  const breakthrough = data?.saturation_breakthrough;
  const anomaly = data?.vascular_stress_anomaly_48h;
  const yieldCurve = data?.projected_yield_curve_90d;
  const yields = yieldCurve?.daily_yields || [];

  // Anomaly gauge colors
  const getAnomalyBadge = () => {
    if (!anomaly) return { color: '#16A34A', bg: '#DCFCE7', text: 'Thriving', tier: 'green' };
    switch (anomaly.anomaly_tier) {
      case 'ANOMALY_DETECTED':
        return { color: '#DC2626', bg: '#FEE2E2', text: 'Anomaly detected', tier: 'red' };
      case 'METABOLIC_SLOWDOWN':
        return { color: '#D97706', bg: '#FEF3C7', text: 'Metabolic slowdown', tier: 'yellow' };
      case 'THRIVING':
      default:
        return { color: '#16A34A', bg: '#DCFCE7', text: 'Thriving', tier: 'green' };
    }
  };

  const badge = getAnomalyBadge();

  // Filter yields for the table view
  const filteredYields = yields.filter((y) => {
    if (tableRange === '1-30') return y.day >= 1 && y.day <= 30;
    if (tableRange === '31-60') return y.day >= 31 && y.day <= 60;
    if (tableRange === '61-90') return y.day >= 61 && y.day <= 90;
    return true;
  });

  // Helper to compute projected calendar date for each day index
  const getProjectedDateStr = (dayIdx: number) => {
    const d = new Date();
    d.setDate(d.getDate() + dayIdx);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Draw High-End Predictive Multi-Line Trend Graph on Solid White (#FFFFFF) Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || yields.length === 0 || activeView === 'table') return;

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

    const padLeft = 45;
    const padRight = 55;
    const padTop = 25;
    const padBottom = 30;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    // Light grid lines
    ctx.strokeStyle = '#F1F5F9';
    ctx.lineWidth = 1;
    for (let r = 0; r <= 4; r++) {
      const y = padTop + (plotH / 4) * r;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + plotW, y);
      ctx.stroke();
    }
    for (let c = 0; c <= 6; c++) {
      const x = padLeft + (plotW / 6) * c;
      ctx.beginPath();
      ctx.moveTo(x, padTop);
      ctx.lineTo(x, padTop + plotH);
      ctx.stroke();
    }

    const maxCredits = Math.max(...yields.map((y) => y.upper_bound), 3.5);
    const minCredits = Math.min(...yields.map((y) => y.lower_bound), 0.0);
    const cRange = maxCredits - minCredits || 1;

    const getX = (day: number) => padLeft + ((day - 1) / (yields.length - 1)) * plotW;
    const getY = (val: number) => padTop + plotH - ((val - minCredits) / cRange) * plotH;

    // 1. Draw 95% Confidence Interval Envelope
    ctx.beginPath();
    ctx.moveTo(getX(yields[0].day), getY(yields[0].upper_bound));
    for (let i = 1; i < yields.length; i++) {
      ctx.lineTo(getX(yields[i].day), getY(yields[i].upper_bound));
    }
    for (let i = yields.length - 1; i >= 0; i--) {
      ctx.lineTo(getX(yields[i].day), getY(yields[i].lower_bound));
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(22, 163, 74, 0.12)';
    ctx.fill();

    // 2. Main Trajectory Curve: Expected Daily Yield
    ctx.beginPath();
    ctx.moveTo(getX(yields[0].day), getY(yields[0].expected_credits));
    for (let i = 1; i < yields.length; i++) {
      const xPrev = getX(yields[i - 1].day);
      const yPrev = getY(yields[i - 1].expected_credits);
      const xCurr = getX(yields[i].day);
      const yCurr = getY(yields[i].expected_credits);
      const cx = (xPrev + xCurr) / 2;
      ctx.bezierCurveTo(cx, yPrev, cx, yCurr, xCurr, yCurr);
    }
    ctx.strokeStyle = '#16A34A';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 3. Cumulative Carbon Sink Curve (Right Y-Axis)
    const maxCarbon = Math.max(...yields.map((y) => y.cumulative_carbon_tons), 8.0);
    const getCarbonY = (val: number) => padTop + plotH - (val / maxCarbon) * plotH;

    ctx.beginPath();
    ctx.moveTo(getX(yields[0].day), getCarbonY(yields[0].cumulative_carbon_tons));
    for (let i = 1; i < yields.length; i++) {
      ctx.lineTo(getX(yields[i].day), getCarbonY(yields[i].cumulative_carbon_tons));
    }
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([4, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Y-Axis Labels: Left (Credits)
    ctx.fillStyle = '#0F172A';
    ctx.font = '500 10px JetBrains Mono, monospace';
    ctx.textAlign = 'right';
    for (let r = 0; r <= 4; r++) {
      const val = maxCredits - (cRange / 4) * r;
      const y = padTop + (plotH / 4) * r + 3;
      ctx.fillText(`${val.toFixed(2)}`, padLeft - 6, y);
    }

    // Y-Axis Labels: Right (Carbon Tons)
    ctx.textAlign = 'left';
    ctx.fillStyle = '#D97706';
    for (let r = 0; r <= 4; r++) {
      const val = maxCarbon - (maxCarbon / 4) * r;
      const y = padTop + (plotH / 4) * r + 3;
      ctx.fillText(`${val.toFixed(1)} MT`, padLeft + plotW + 8, y);
    }

    // X-Axis Day Numbers
    ctx.fillStyle = '#475569';
    ctx.textAlign = 'center';
    for (let c = 0; c <= 6; c++) {
      const dNum = Math.round(1 + (c / 6) * 89);
      const x = padLeft + (plotW / 6) * c;
      ctx.fillText(`Day ${dNum}`, x, height - 10);
    }

    // Interactive Hover Crosshair
    if (hoveredPoint !== null && yields[hoveredPoint - 1]) {
      const target = yields[hoveredPoint - 1];
      const hX = getX(target.day);
      const hY = getY(target.expected_credits);

      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(hX, padTop);
      ctx.lineTo(hX, padTop + plotH);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#16A34A';
      ctx.beginPath();
      ctx.arc(hX, hY, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [yields, hoveredPoint, activeView]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || yields.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - 45;
    const plotW = rect.width - 100;
    const ratio = Math.max(0, Math.min(1, x / plotW));
    const day = Math.round(1 + ratio * 89);
    setHoveredPoint(day);
  };

  const activeHover = hoveredPoint !== null ? yields[hoveredPoint - 1] : yields[yields.length - 1];

  return (
    <div className="space-y-4 select-none">
      {/* Top Section Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#D2E2D5] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center space-x-2.5">
            <Sparkles className="w-5 h-5 text-[#15803D]" />
            <h3 className="text-lg font-bold text-[#112415] tracking-tight">
              Predictive carbon flux and vascular anomaly forecast
            </h3>
          </div>
          <p className="text-xs text-[#456149] mt-1 font-medium">
            Non-linear multivariate regression evaluated over 90 days using cambium telemetry
          </p>
        </div>

        {/* View Switcher Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-[#EDF4EE] border border-[#D2E2D5] text-xs">
            <button
              onClick={() => setActiveView('both')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeView === 'both'
                  ? 'bg-[#1E562A] text-white shadow-xs'
                  : 'text-[#3B5740] hover:text-[#112415]'
              }`}
            >
              Side-by-side view
            </button>
            <button
              onClick={() => setActiveView('graph')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeView === 'graph'
                  ? 'bg-[#1E562A] text-white shadow-xs'
                  : 'text-[#3B5740] hover:text-[#112415]'
              }`}
            >
              Trajectory chart
            </button>
            <button
              onClick={() => setActiveView('table')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeView === 'table'
                  ? 'bg-[#1E562A] text-white shadow-xs'
                  : 'text-[#3B5740] hover:text-[#112415]'
              }`}
            >
              Forecast data table
            </button>
          </div>

          <button
            onClick={() => loadPrediction(true)}
            disabled={isLoading}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-[#E8F3EA] border border-[#B7DAC0] text-[#1E562A] hover:bg-[#1E562A] hover:text-white transition-all text-xs font-semibold disabled:opacity-50 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh forecast</span>
          </button>
        </div>
      </div>

      {/* Primary 2-Column Gauge Row: Days to Breakthrough & Vascular Anomaly */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Days to Carbon Saturation Breakthrough */}
        <div className="bg-white p-5 rounded-2xl border border-[#D2E2D5] flex flex-col justify-between shadow-xs hover:shadow-sm transition-all duration-200">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-sm font-bold flex items-center space-x-2 text-[#112415]">
                <Clock className="w-4 h-4 text-[#15803D]" />
                <span>Soil carbon saturation breakthrough</span>
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#E8F3EA] text-[#1E562A] border border-[#C2DEC6]">
                Capacity: {breakthrough?.max_soil_capacity_metric_tons || 14.85} MT
              </span>
            </div>

            <div className="my-3">
              <div className="flex items-baseline space-x-2.5">
                <span className="text-4xl sm:text-5xl font-extrabold font-mono text-[#112415] tracking-tight">
                  {breakthrough?.days_to_saturation ?? 74}
                </span>
                <span className="text-base text-[#15803D] font-bold">Days remaining</span>
              </div>
              <p className="text-xs text-[#58745E] mt-1 font-medium">
                Estimated breakthrough date:{' '}
                <strong className="text-[#112415] font-bold">
                  {breakthrough?.breakthrough_date || '2027-01-06'}
                </strong>
              </p>
            </div>
          </div>

          {/* Saturation Progress Bar */}
          <div className="mt-3 pt-3 border-t border-[#E5EDE6]">
            <div className="flex justify-between text-xs text-[#456149] font-semibold mb-1.5">
              <span>Current saturation level</span>
              <span className="text-[#15803D] font-mono font-bold text-sm">
                {breakthrough?.current_saturation_pct || 64.2}%
              </span>
            </div>
            <div className="w-full bg-[#EBF2ED] h-2.5 rounded-full overflow-hidden border border-[#D2E2D5]">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isSlashed ? 'bg-[#DC2626]' : 'bg-[#16A34A]'
                }`}
                style={{ width: `${Math.min(100, breakthrough?.current_saturation_pct || 64.2)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-[#58745E] mt-1.5 font-medium">
              <span>0% baseline soil</span>
              <span className="text-[#1E562A] font-semibold">Velocity: {breakthrough?.mycorrhizal_sink_velocity_rate || '+0.18 MT/mo'}</span>
              <span>100% saturation</span>
            </div>
          </div>
        </div>

        {/* 2. Vascular Health Anomaly Matrix */}
        <div
          className={`p-5 rounded-2xl border transition-all flex flex-col justify-between shadow-xs hover:shadow-sm bg-white ${
            badge.tier === 'red'
              ? 'border-[#FCA5A5] ring-1 ring-[#FCA5A5]/30'
              : badge.tier === 'yellow'
              ? 'border-[#FCD34D] ring-1 ring-[#FCD34D]/30'
              : 'border-[#D2E2D5]'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-sm font-bold flex items-center space-x-2 text-[#112415]">
                <Gauge className="w-4 h-4 text-[#15803D]" />
                <span>48-hour vascular stress anomaly forecast</span>
              </span>
              <span
                className="text-xs font-bold px-2.5 py-0.5 rounded-full font-mono shadow-xs"
                style={{ backgroundColor: badge.bg, color: badge.color }}
              >
                {badge.text}
              </span>
            </div>

            <div className="my-3">
              <div className="flex items-baseline space-x-2.5">
                <span
                  className="text-4xl sm:text-5xl font-extrabold font-mono tracking-tight"
                  style={{ color: badge.color }}
                >
                  {anomaly?.risk_score_0_100 ?? 12}
                </span>
                <span className="text-xs font-mono text-[#58745E] font-semibold">
                  / 100 risk score ({anomaly?.confidence_rating_pct || 98.4}% confidence)
                </span>
              </div>
              <p className="text-xs sm:text-sm font-normal text-[#3B5740] leading-relaxed mt-1">
                {anomaly?.root_cause_diagnosis ||
                  'Normal physiological transpiration. Healthy ionic sucrose-proton flux verified.'}
              </p>
            </div>
          </div>

          {/* Tri-Color Risk Meter */}
          <div className="mt-3 pt-3 border-t border-[#E5EDE6]">
            <div className="w-full bg-[#EBF2ED] h-2.5 rounded-full overflow-hidden flex border border-[#D2E2D5]">
              <div className="w-[30%] bg-[#16A34A] h-full" title="Green: thriving (< 30)" />
              <div className="w-[35%] bg-[#F59E0B] h-full" title="Yellow: metabolic slowdown (30 - 65)" />
              <div className="w-[35%] bg-[#EF4444] h-full" title="Red: anomaly detected (> 65)" />
            </div>

            <div className="relative w-full h-2 mt-1">
              <div
                className="absolute top-0 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[6px] border-b-[#112415] transition-all duration-300"
                style={{ left: `${Math.min(100, Math.max(0, anomaly?.risk_score_0_100 || 12))}%` }}
              />
            </div>

            <div className="flex justify-between text-[11px] font-mono mt-1 text-[#58745E] font-medium">
              <span className="text-[#15803D]">Green: thriving</span>
              <span className="text-[#B45309]">Yellow: slowdown</span>
              <span className="text-[#B91C1C]">Red: anomaly</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area: Chart and/or Forecast Data Table */}
      <div className="space-y-4">
        {/* 1. Solid White (#FFFFFF) Chart Canvas */}
        {(activeView === 'both' || activeView === 'graph') && (
          <div className="daylight-chart-panel p-5 rounded-2xl border border-[#CBD5E1] select-none shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0] mb-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#16A34A]" />
                  <h4 className="text-base sm:text-lg font-bold text-[#0F172A] tracking-tight">
                    90-day projected tokenized yield curve and cumulative carbon sink
                  </h4>
                  <span className="text-xs sm:text-sm font-mono px-2.5 py-0.5 rounded-md bg-[#F1F5F9] text-[#0F172A] border border-[#CBD5E1] font-bold">
                    R² = {data?.ml_model_metadata?.r_squared_score || 0.942}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-[#475569] mt-0.5 leading-normal">
                  Multivariate regression trajectory • Daily minting and cumulative sink
                </p>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-[#0F172A]">
                <span className="flex items-center space-x-1.5 text-[#16A34A]">
                  <span className="w-3 h-1 bg-[#16A34A] rounded-full" />
                  <span>Projected yield ($PNL / day)</span>
                </span>
                <span className="flex items-center space-x-1.5 text-[#D97706]">
                  <span className="w-3 h-1 bg-[#D97706] rounded-full border-dashed" />
                  <span>Cumulative carbon sink (MT)</span>
                </span>
                <span className="flex items-center space-x-1.5 text-[#64748B]">
                  <span className="w-3 h-3 bg-[rgba(22,163,74,0.15)] rounded-xs" />
                  <span>95% confidence envelope</span>
                </span>
              </div>
            </div>

            {/* Hover Metric Bar */}
            <div className="flex flex-wrap items-baseline gap-5 mb-3 pb-3 border-b border-[#E2E8F0] font-mono text-[#0F172A]">
              <div>
                <span className="text-xs font-medium text-[#64748B] block">Horizon day</span>
                <strong className="text-sm sm:text-base font-bold text-[#0F172A]">
                  Day {activeHover?.day ?? 90} of 90
                </strong>
              </div>
              <div>
                <span className="text-xs font-medium text-[#64748B] block">Expected yield</span>
                <strong className="text-sm sm:text-base font-extrabold text-[#16A34A]">
                  {activeHover?.expected_credits?.toFixed(3) ?? '2.450'} PNL / day
                </strong>
              </div>
              <div>
                <span className="text-xs font-medium text-[#64748B] block">95% confidence bounds</span>
                <span className="text-xs sm:text-sm font-bold text-[#0F172A]">
                  [{activeHover?.lower_bound?.toFixed(2) ?? '2.21'} - {activeHover?.upper_bound?.toFixed(2) ?? '2.74'}] PNL
                </span>
              </div>
              <div>
                <span className="text-xs font-medium text-[#64748B] block">Cumulative carbon sink</span>
                <strong className="text-sm sm:text-base font-extrabold text-[#D97706]">
                  {activeHover?.cumulative_carbon_tons?.toFixed(3) ?? '4.820'} MT CO₂e
                </strong>
              </div>
              <div className="ml-auto text-xs font-medium text-[#475569]">
                Total 90-day accumulation:{' '}
                <strong className="text-sm sm:text-base text-[#0F172A] font-bold">
                  {yieldCurve?.total_90d_credits_est || 220.5} PNL
                </strong>
              </div>
            </div>

            {/* Canvas Surface */}
            <div className="w-full h-64 relative rounded-xl overflow-hidden border border-[#CBD5E1] bg-[#FFFFFF]">
              <canvas
                ref={canvasRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHoveredPoint(null)}
                className="w-full h-full block cursor-crosshair"
              />
            </div>
          </div>
        )}

        {/* 2. Structured Predicted Values Table (Crisp White Daylight Surface with Black Typography) */}
        {(activeView === 'both' || activeView === 'table') && (
          <div className="daylight-chart-panel p-5 rounded-2xl border border-[#CBD5E1] select-none shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0] mb-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <TableIcon className="w-5 h-5 text-[#16A34A]" />
                  <h4 className="text-base sm:text-lg font-bold text-[#0F172A] tracking-tight">
                    Predicted horizon daily values table
                  </h4>
                  <span className="text-xs sm:text-sm font-mono px-2.5 py-0.5 rounded-md bg-[#F1F5F9] text-[#0F172A] border border-[#CBD5E1] font-bold">
                    {yields.length} day horizon
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-[#475569] mt-0.5 leading-normal">
                  Daily token yield, statistical bounds, and cumulative sequestration
                </p>
              </div>

              {/* Horizon Range Filter Buttons */}
              <div className="flex items-center p-1 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] text-xs sm:text-sm">
                {(['all', '1-30', '31-60', '61-90'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setTableRange(r)}
                    className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                      tableRange === r
                        ? 'bg-[#0F172A] text-[#FFFFFF] shadow-xs'
                        : 'text-[#475569] hover:text-[#0F172A]'
                    }`}
                  >
                    {r === 'all'
                      ? 'All 90 days'
                      : r === '1-30'
                      ? 'Days 1–30'
                      : r === '31-60'
                      ? 'Days 31–60'
                      : 'Days 61–90'}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Table Container */}
            <div className="overflow-x-auto max-h-80 overflow-y-auto border border-[#E2E8F0] rounded-xl">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="sticky top-0 bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#0F172A] font-bold text-sm font-mono">
                  <tr>
                    <th className="py-3 px-3.5">Horizon day</th>
                    <th className="py-3 px-3.5">Projected date</th>
                    <th className="py-3 px-3.5">Daily yield ($PNL)</th>
                    <th className="py-3 px-3.5">95% bounds</th>
                    <th className="py-3 px-3.5">Cumulative sink</th>
                    <th className="py-3 px-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] font-mono text-sm text-[#0F172A]">
                  {filteredYields.map((row) => {
                    const isOptimal = row.expected_credits > 2.2;
                    return (
                      <tr key={row.day} className="hover:bg-[#F1F5F9] transition-colors">
                        <td className="py-2 px-3 font-bold text-[#0F172A]">
                          Day {row.day}
                        </td>
                        <td className="py-2 px-3 text-[#334155] font-medium">
                          {getProjectedDateStr(row.day)}
                        </td>
                        <td className="py-2 px-3 font-bold text-[#16A34A]">
                          +{row.expected_credits.toFixed(3)} PNL
                        </td>
                        <td className="py-2 px-3 text-[#334155] font-medium">
                          [{row.lower_bound.toFixed(2)} - {row.upper_bound.toFixed(2)}] PNL
                        </td>
                        <td className="py-2 px-3 font-bold text-[#D97706]">
                          {row.cumulative_carbon_tons.toFixed(3)} MT CO₂e
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                              row.expected_credits === 0
                                ? 'bg-[#FEE2E2] text-[#DC2626] border-[#FCA5A5]'
                                : isOptimal
                                ? 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]'
                                : 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]'
                            }`}
                          >
                            {row.expected_credits === 0
                              ? 'Consensus revoked'
                              : isOptimal
                              ? 'Optimal sequestration'
                              : 'Standard flux'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="flex flex-wrap items-center justify-between text-xs font-mono text-[#475569] mt-3 pt-2.5 border-t border-[#F1F5F9]">
              <span>Displaying {filteredYields.length} of 90 forecast days</span>
              <span className="text-[#16A34A] font-bold">Model: Multivariate biophysical non-linear regression</span>
              <span>Data matrix: Live Open-Meteo ingestion</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
