import React, { useState, useEffect } from 'react';
import {
  MoreHorizontal,
  ChevronDown,
  Calendar,
  ArrowUpRight,
  Coins,
  TrendingUp,
  Scale,
  Wallet,
  CheckCircle2,
  Sparkles,
  Layers,
  Plus
} from 'lucide-react';
import { TradingState } from '../types';
import { fetchTradingState, executeOrder, claimRecyclingRewards } from '../services/api';

export const CircularTradingPage: React.FC = () => {
  const [tradingState, setTradingState] = useState<TradingState | null>(null);
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [orderAmount, setOrderAmount] = useState<string>('5.0');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [tradeMessage, setTradeMessage] = useState<string | null>(null);
  const [claimMessage, setClaimMessage] = useState<string | null>(null);
  const [chartTimeframe, setChartTimeframe] = useState<string>('Monthly');
  const [activeTooltipIndex, setActiveTooltipIndex] = useState<number>(3); // Default hover on peak point
  const [showOrderModal, setShowOrderModal] = useState<boolean>(false);

  const loadTrading = () => {
    fetchTradingState()
      .then((res) => setTradingState(res))
      .catch((err) => console.warn('Trading state fetch notice:', err));
  };

  useEffect(() => {
    loadTrading();
    const interval = setInterval(loadTrading, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleExecuteTrade = async () => {
    const amount = parseFloat(orderAmount);
    if (!amount || amount <= 0 || !tradingState) return;

    setIsExecuting(true);
    try {
      const price = tradingState.current_price_pnl;
      const res = await executeOrder(orderType, amount, price);
      setTradeMessage(`Trade executed: ${res.trade.volume_tons} MT settled at $${res.trade.price_pnl} PNL.`);
      loadTrading();
      setShowOrderModal(false);
      setTimeout(() => setTradeMessage(null), 5000);
    } catch (err: any) {
      setTradeMessage(`Execution error: ${err.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleClaimReward = async () => {
    try {
      const res = await claimRecyclingRewards();
      setClaimMessage(`Claimed +${res.reward_claimed_pnl} PNL recycling incentive tokens.`);
      loadTrading();
      setTimeout(() => setClaimMessage(null), 5000);
    } catch (err: any) {
      setClaimMessage(`Claim error: ${err.message}`);
    }
  };

  const currentPrice = tradingState?.current_price_pnl || 322.49;
  const nctPrice = tradingState?.live_market_data?.nct_usd || 0.231;
  const klimaPrice = tradingState?.live_market_data?.klima_usd || 9.861;

  // Spline Data Points for Carbon Asset Valuation (Sep - Mar)
  const splineMonths = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  const splinePoints = [
    { month: 'Sep', val: 240, label: '$240' },
    { month: 'Oct', val: 295, label: '$295' },
    { month: 'Nov', val: 280, label: '$280' },
    { month: 'Dec', val: 322.49, isPeak: true, date: 'Oct 25, 2026', price: '$322.49 PNL', growth: '+2.4%' },
    { month: 'Jan', val: 305, label: '$305' },
    { month: 'Feb', val: 318, label: '$318' },
    { month: 'Mar', val: 335, label: '$335' }
  ];

  // SVG dimensions for edge-to-edge fitting
  const chartW = 760;
  const chartH = 260;
  const padLeft = 50;
  const padRight = 20;
  const padTop = 30;
  const padBottom = 35;
  const plotW = chartW - padLeft - padRight;
  const plotH = chartH - padTop - padBottom;
  const maxVal = 400;

  // Convert points to SVG coordinates
  const coords = splinePoints.map((pt, i) => {
    const x = padLeft + (i / (splinePoints.length - 1)) * plotW;
    const y = padTop + plotH - (pt.val / maxVal) * plotH;
    return { ...pt, x, y };
  });

  // Generate smooth SVG cubic bezier path
  const generateSmoothPath = (pts: Array<{ x: number; y: number }>) => {
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const linePath = generateSmoothPath(coords);
  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${padTop + plotH} L ${coords[0].x} ${padTop + plotH} Z`;

  const activePoint = coords[activeTooltipIndex] || coords[3];

  return (
    <div className="space-y-6 select-none animate-fade-in max-w-[1600px] mx-auto">
      {/* Notifications */}
      {tradeMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center space-x-2.5 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{tradeMessage}</span>
        </div>
      )}
      {claimMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center space-x-2.5 shadow-sm">
          <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{claimMessage}</span>
        </div>
      )}

      {/* 1. TOP ROW: 3 Large Cards with Real Environmental Domain Terms */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Carbon Asset Valuation */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.04)] flex flex-col justify-between hover:shadow-[0_8px_30px_-5px_rgba(0,0,0,0.07)] transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-slate-800">Carbon Asset Valuation</span>
              <button className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-50">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Real-time AMM spot pricing (SPNL / USDC)
            </p>
          </div>

          <div className="mt-5 flex items-baseline space-x-3">
            <span className="text-4xl font-extrabold text-slate-900 tracking-tight font-mono">
              ${currentPrice.toFixed(2)}
            </span>
            <div className="flex items-center space-x-1.5">
              <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5 text-emerald-600" />
                +2.4%
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">
                USDC / MT
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: 24-Hour Trading Volume */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.04)] flex flex-col justify-between hover:shadow-[0_8px_30px_-5px_rgba(0,0,0,0.07)] transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-slate-800">24-Hour Trading Volume</span>
              <button className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-50">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Settled on Polygon ClimateChain
            </p>
          </div>

          <div className="mt-5 flex items-baseline space-x-3">
            <span className="text-4xl font-extrabold text-slate-900 tracking-tight font-mono">
              $1.24M
            </span>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                Active
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">
                6,340 MT CO₂e
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Ecosystem Integrity & Health */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.04)] flex flex-col justify-between md:col-span-2 lg:col-span-1 hover:shadow-[0_8px_30px_-5px_rgba(0,0,0,0.07)] transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-slate-800">Ecosystem Integrity & Health</span>
              <button className="flex items-center space-x-1 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl hover:bg-slate-100 transition-colors">
                <span>Monthly</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Cambium vascular transpiration & PoVI consensus
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center space-x-4 mt-3 text-xs text-slate-500">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#A3E635]"></span>
              <span className="font-medium text-slate-700">Sap Transpiration</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6366F1]"></span>
              <span className="font-medium text-slate-700">Consensus Stability</span>
            </div>
          </div>

          {/* Horizontal Stacked Bars */}
          <div className="mt-4 space-y-3">
            {/* Session 03 */}
            <div className="flex items-center space-x-3 text-xs">
              <span className="w-7 text-slate-400 font-medium">S3</span>
              <div className="flex-1 h-3.5 bg-slate-100 rounded-full flex overflow-hidden">
                <div className="h-full bg-[#A3E635]" style={{ width: '48%' }}></div>
                <div className="h-full bg-[#6366F1]" style={{ width: '42%' }}></div>
              </div>
            </div>

            {/* Session 02 with Tooltip Pin */}
            <div className="relative flex items-center space-x-3 text-xs">
              <span className="w-7 text-slate-400 font-medium">S2</span>
              <div className="flex-1 h-3.5 bg-slate-100 rounded-full flex overflow-hidden">
                <div className="h-full bg-[#A3E635]" style={{ width: '54%' }}></div>
                <div className="h-full bg-[#6366F1]" style={{ width: '38%' }}></div>
              </div>
              {/* Tooltip Pin */}
              <div className="absolute right-10 -top-8 bg-slate-900 text-white px-2 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center space-x-2 shadow-lg">
                <div className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A3E635]"></span>
                  <span>94.2%</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#818CF8]"></span>
                  <span>98.4%</span>
                </div>
              </div>
            </div>

            {/* Session 01 */}
            <div className="flex items-center space-x-3 text-xs">
              <span className="w-7 text-slate-400 font-medium">S1</span>
              <div className="flex-1 h-3.5 bg-slate-100 rounded-full flex overflow-hidden">
                <div className="h-full bg-[#A3E635]" style={{ width: '40%' }}></div>
                <div className="h-full bg-[#6366F1]" style={{ width: '45%' }}></div>
              </div>
            </div>

            {/* Bottom Scale */}
            <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-1 pl-10 pr-2">
              <span>100</span>
              <span>80</span>
              <span>40</span>
              <span>20</span>
              <span>0</span>
              <span>20</span>
              <span>40</span>
              <span>80</span>
              <span>100</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE ROW: Carbon Balance Period */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium block">Carbon Settlement Period</span>
              <span className="text-sm font-bold text-slate-900">Oct 25, 2026</span>
            </div>
          </div>

          <button className="flex items-center space-x-1 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors">
            <span>Day</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* 3 Metrics & Horizontal Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5">
          {/* Minted */}
          <div className="space-y-2">
            <div className="text-xs text-slate-400 font-medium">Minted Living Credits</div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
              5,219 PNL
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#6366F1] to-[#818CF8] rounded-full w-[82%]"></div>
            </div>
          </div>

          {/* Committed */}
          <div className="space-y-2">
            <div className="text-xs text-slate-400 font-medium">Committed Offsets</div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
              3,840 MT
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-slate-300 to-slate-400 rounded-full w-[45%]"></div>
            </div>
          </div>

          {/* Retired */}
          <div className="space-y-2">
            <div className="text-xs text-slate-400 font-medium">Verified Reserve</div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
              8,420 MT
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#84CC16] to-[#A3E635] rounded-full w-[65%]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM MAIN ROW: Carbon Valuation Spline Chart (Left) & Portfolio Allocation Donut Chart (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Carbon Valuation Trajectory Chart (~65% width) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Carbon Valuation Trajectory
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">
                Live market price curve ($PNL / USDC spot) and algorithmic bio-flux forecast
              </p>
            </div>

            <button className="flex items-center space-x-1 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors">
              <span>{chartTimeframe}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* Edge-to-Edge Responsive Spline Canvas */}
          <div className="relative w-full h-[280px] sm:h-[300px] mt-2">
            <svg
              viewBox={`0 0 ${chartW} ${chartH}`}
              className="w-full h-full overflow-visible select-none"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="splineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818CF8" stopOpacity="0.4" />
                  <stop offset="60%" stopColor="#818CF8" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#818CF8" stopOpacity="0.0" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Horizontal Grid Lines */}
              {[400, 300, 200, 100, 0].map((tickVal, i) => {
                const y = padTop + (i / 4) * plotH;
                return (
                  <g key={`tick-${i}`}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={chartW - padRight}
                      y2={y}
                      stroke="#F1F5F9"
                      strokeWidth="1.5"
                    />
                    <text
                      x={padLeft - 10}
                      y={y + 4}
                      textAnchor="end"
                      fill="#94A3B8"
                      fontSize="11"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="500"
                    >
                      {tickVal === 0 ? '$0' : `$${tickVal}`}
                    </text>
                  </g>
                );
              })}

              {/* Area Fill */}
              <path d={areaPath} fill="url(#splineGradient)" />

              {/* Spline Curve Stroke */}
              <path
                d={linePath}
                fill="none"
                stroke="#6366F1"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#glow)"
              />

              {/* Interactive Data Nodes */}
              {coords.map((pt, i) => {
                const isSelected = i === activeTooltipIndex;
                return (
                  <g
                    key={`node-${i}`}
                    className="cursor-pointer"
                    onMouseEnter={() => setActiveTooltipIndex(i)}
                  >
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isSelected ? '7' : '4'}
                      fill={isSelected ? '#6366F1' : '#FFFFFF'}
                      stroke="#6366F1"
                      strokeWidth={isSelected ? '3' : '2'}
                      className="transition-all duration-200"
                    />
                  </g>
                );
              })}

              {/* Bottom X-Axis Month Labels */}
              {coords.map((pt, i) => (
                <text
                  key={`month-${i}`}
                  x={pt.x}
                  y={padTop + plotH + 22}
                  textAnchor="middle"
                  fill="#94A3B8"
                  fontSize="12"
                  fontFamily="sans-serif"
                  fontWeight="500"
                >
                  {pt.month}
                </text>
              ))}
            </svg>

            {/* Floating Dark Tooltip Pin */}
            {activePoint && (
              <div
                style={{
                  left: `${(activePoint.x / chartW) * 100}%`,
                  top: `${(activePoint.y / chartH) * 100}%`
                }}
                className="absolute -translate-x-1/2 -translate-y-[115%] pointer-events-none transition-all duration-200 z-20"
              >
                <div className="bg-slate-900 text-white rounded-2xl px-3.5 py-2 shadow-2xl border border-slate-700/50 flex flex-col items-center">
                  <span className="text-[10px] font-mono text-slate-400">
                    {activePoint.date || 'Oct 25, 2026'}
                  </span>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className="text-xs font-bold font-mono text-white">
                      {activePoint.price || `$${activePoint.val} PNL`}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-emerald-400 flex items-center">
                      <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                      {activePoint.growth || '+2.4%'}
                    </span>
                  </div>
                </div>
                {/* Pointer Tip */}
                <div className="w-2.5 h-2.5 bg-slate-900 rotate-45 mx-auto -mt-1.5 border-r border-b border-slate-700/50"></div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Portfolio Asset Allocation Donut Chart (~35% width) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  Portfolio Allocation
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">
                  Verified environmental assets in connected wallet
                </p>
              </div>

              <button className="flex items-center space-x-1 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors">
                <span>Monthly</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            {/* Donut Chart & Category Breakdown */}
            <div className="flex items-center space-x-6 py-4">
              {/* Donut SVG with 3D Layers Cube in Center */}
              <div className="relative w-36 h-36 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {/* Background Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#F1F5F9"
                    strokeWidth="14"
                  />
                  {/* Segment 1: Lime Green (PNL Credits ~60%) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#A3E635"
                    strokeWidth="14"
                    strokeDasharray="143 238"
                    strokeDashoffset="0"
                  />
                  {/* Segment 2: Deep Purple (KlimaDAO ~15%) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#6366F1"
                    strokeWidth="14"
                    strokeDasharray="40 238"
                    strokeDashoffset="-143"
                  />
                  {/* Segment 3: Lavender (USDC Liquidity ~20%) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#C7D2FE"
                    strokeWidth="14"
                    strokeDasharray="45 238"
                    strokeDashoffset="-183"
                  />
                </svg>

                {/* 3D Layers Icon in Donut Hole */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shadow-xs">
                    <Layers className="w-5 h-5 text-indigo-600" />
                  </div>
                </div>
              </div>

              {/* Legend List (Real Carbon Domain Assets) */}
              <div className="flex-1 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#A3E635]"></span>
                    <span className="text-slate-600 font-medium">PhytoNet (SPNL)</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">$14,250</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C7D2FE]"></span>
                    <span className="text-slate-600 font-medium">USDC reserve</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">$2,000</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#6366F1]"></span>
                    <span className="text-slate-600 font-medium">KlimaDAO ($KLIMA)</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">$3,280</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                    <span className="text-slate-400 font-medium">Toucan ($NCT)</span>
                  </div>
                  <span className="font-mono font-bold text-slate-400">$450</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer: Total Portfolio Value & CTA Button */}
          <div className="pt-5 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-medium block">Total Portfolio Value</span>
              <span className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">
                $19,980.00
              </span>
            </div>

            <button
              onClick={() => setShowOrderModal(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-2xl text-xs font-bold shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center space-x-1.5"
            >
              <span>Execute Trade</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Live Carbon Asset Trade & Order Book Execution */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">
                Live Carbon Asset Order Book & Execution
              </h4>
              <p className="text-xs text-slate-400 font-medium">
                Real-time AMM liquidity depth and smart contract settlement (SPNL / USDC)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              Spot: ${currentPrice.toFixed(2)} USDC
            </span>
            <button
              onClick={() => setShowOrderModal(true)}
              className="flex items-center space-x-1.5 bg-[#4F46E5] text-white hover:bg-[#4338CA] px-4 py-2 rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Order</span>
            </button>
          </div>
        </div>

        {/* Order Book Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5">
          {/* Bids (Buy Orders) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-700 pb-1">
              <span>Bids (Buy Orders)</span>
              <span>Amount (MT) / Total</span>
            </div>
            <div className="space-y-1.5">
              {(tradingState?.order_book.bids || [
                { id: 'b1', price_pnl: 322.40, amount_tons: 8.5, total_usd: 2740.4, trader: '0x88f1...12a' },
                { id: 'b2', price_pnl: 322.25, amount_tons: 14.0, total_usd: 4511.5, trader: '0x44c9...77b' },
                { id: 'b3', price_pnl: 322.00, amount_tons: 22.5, total_usd: 7245.0, trader: '0x11a2...99c' }
              ]).map((bid, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100 text-xs font-mono transition-colors"
                >
                  <span className="font-bold text-emerald-700">${bid.price_pnl.toFixed(2)}</span>
                  <div className="flex items-center space-x-3 text-slate-600">
                    <span>{bid.amount_tons} MT</span>
                    <span className="font-semibold text-slate-900">${bid.total_usd.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Asks (Sell Orders) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-rose-600 pb-1">
              <span>Asks (Sell Orders)</span>
              <span>Amount (MT) / Total</span>
            </div>
            <div className="space-y-1.5">
              {(tradingState?.order_book.asks || [
                { id: 'a1', price_pnl: 322.55, amount_tons: 6.0, total_usd: 1935.3, trader: '0x99b1...55e' },
                { id: 'a2', price_pnl: 322.70, amount_tons: 12.5, total_usd: 4033.7, trader: '0x22d4...88f' },
                { id: 'a3', price_pnl: 323.00, amount_tons: 18.0, total_usd: 5814.0, trader: '0x77f9...11g' }
              ]).map((ask, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50/50 hover:bg-rose-50 border border-rose-100 text-xs font-mono transition-colors"
                >
                  <span className="font-bold text-rose-600">${ask.price_pnl.toFixed(2)}</span>
                  <div className="flex items-center space-x-3 text-slate-600">
                    <span>{ask.amount_tons} MT</span>
                    <span className="font-semibold text-slate-900">${ask.total_usd.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trade Execution Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in select-none">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Execute Carbon Trade</h3>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex rounded-2xl bg-slate-100 p-1">
                <button
                  onClick={() => setOrderType('buy')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                    orderType === 'buy'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Buy Carbon Asset
                </button>
                <button
                  onClick={() => setOrderType('sell')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                    orderType === 'sell'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sell Carbon Asset
                </button>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1.5">
                  Order Volume (Metric Tons CO₂e)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={orderAmount}
                  onChange={(e) => setOrderAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-mono space-y-1.5">
                <div className="flex justify-between text-slate-500">
                  <span>Unit Spot Price:</span>
                  <span className="font-bold text-slate-900">${currentPrice.toFixed(2)} USDC</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Total Settlement:</span>
                  <span className="font-bold text-indigo-600">
                    ${(parseFloat(orderAmount || '0') * currentPrice).toFixed(2)} USDC
                  </span>
                </div>
              </div>

              <button
                onClick={handleExecuteTrade}
                disabled={isExecuting}
                className={`w-full py-3.5 rounded-2xl text-sm font-bold text-white shadow-md active:scale-95 transition-all ${
                  orderType === 'buy' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {isExecuting ? 'Submitting to Smart Contract...' : `Confirm ${orderType.toUpperCase()} Order`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
