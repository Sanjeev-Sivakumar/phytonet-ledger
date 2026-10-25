import React, { useState } from 'react';
import { ShieldAlert, TrendingUp, Zap, ChevronDown, ChevronUp, Wallet, CheckCircle2 } from 'lucide-react';
import { GeminiEvaluation } from '../types';

interface ValuationMeterProps {
  valuation: number;
  mintRate: number;
  isSlashed: boolean;
  slashReason?: string | null;
  biologicalNonce: string;
  oracle: GeminiEvaluation | null;
  walletBalance?: number;
}

export const ValuationMeter: React.FC<ValuationMeterProps> = ({
  valuation,
  mintRate,
  isSlashed,
  slashReason,
  biologicalNonce,
  oracle,
  walletBalance = 142.50
}) => {
  const [isNonceExpanded, setIsNonceExpanded] = useState(false);

  return (
    <div
      className={`rounded-2xl p-5 border transition-all duration-200 shadow-xs hover:shadow-sm ${
        isSlashed
          ? 'bg-[#FEF2F2] border-[#FCA5A5]'
          : 'bg-white border-[#D2E2D5]'
      }`}
    >
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3.5 border-b border-[#E5EDE6]">
        <div className="flex items-center space-x-2.5">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isSlashed ? 'bg-[#DC2626] pulse-crimson' : 'bg-[#16A34A] pulse-green'
            }`}
          />
          <span className="text-xs font-semibold text-[#456149]">
            Carbon asset valuation
          </span>
          <span
            className={`text-[11px] font-mono px-2 py-0.5 rounded-md flex items-center space-x-1 font-bold ${
              isSlashed
                ? 'bg-[#FEE2E2] text-[#B91C1C] border border-[#FCA5A5]'
                : 'bg-[#E8F7ED] text-[#15803D] border border-[#A7F3D0]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" />
            <span>{isSlashed ? 'Consensus slashed' : 'PoVI verified active'}</span>
          </span>
        </div>

        {/* Wallet Balance & Expandable Nonce Trigger */}
        <div className="flex items-center space-x-2 text-xs font-mono">
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-[#E8F3EA] border border-[#C2DEC6] text-[#1E562A] font-bold">
            <Wallet className="w-3.5 h-3.5 text-[#1E562A]" />
            <span>{walletBalance.toFixed(2)} PNL</span>
          </div>

          <button
            onClick={() => setIsNonceExpanded(!isNonceExpanded)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#F0F5F1] border border-[#D2E2D5] text-[#3B5740] hover:text-[#112415] hover:bg-[#E5ECE7] transition-all font-semibold"
            title="Toggle biological nonce details"
          >
            <Zap className="w-3.5 h-3.5 text-[#15803D]" />
            <span className="text-[11px]">Nonce</span>
            {isNonceExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Expandable Technical Nonce Detail */}
      {isNonceExpanded && (
        <div className="my-2.5 p-3 rounded-xl bg-[#F4F8F5] border border-[#D2E2D5] text-xs font-mono flex items-center justify-between text-[#1E562A] animate-fade-in">
          <span className="text-[#456149] font-medium">Biological entropy nonce:</span>
          <span className="select-all font-bold break-all text-right ml-2 text-[#112415]">
            {biologicalNonce || '0xBIO_CAMBIUM_POVI_ENTROPY'}
          </span>
        </div>
      )}

      {/* Main Valuation Display */}
      <div className="my-3.5 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3">
        <div className="flex items-baseline space-x-2.5">
          <span
            className={`text-4xl sm:text-5xl font-extrabold font-mono tracking-tight ${
              isSlashed ? 'text-[#B91C1C]' : 'text-[#112415]'
            }`}
          >
            {isSlashed ? '$0.00' : `$${valuation.toFixed(2)}`}
          </span>
          <span className="text-base font-semibold text-[#15803D]">
            PNL <span className="text-[#58745E] font-normal">/ metric tonne CO₂e</span>
          </span>
        </div>

        {/* Dynamic Yield Multiplier Pill */}
        <div className="flex items-center space-x-2">
          {!isSlashed ? (
            <div className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#E8F3EA] border border-[#C2DEC6] text-[#1E562A] text-sm font-mono font-bold">
              <TrendingUp className="w-4 h-4 text-[#15803D]" />
              <span>
                {oracle?.dynamic_asset_multiplier ? `${oracle.dynamic_asset_multiplier.toFixed(2)}x` : '1.35x'} yield rate
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#FEE2E2] border border-[#FCA5A5] text-[#B91C1C] text-sm font-mono font-bold">
              <ShieldAlert className="w-4 h-4" />
              <span>Asset burned</span>
            </div>
          )}
        </div>
      </div>

      {/* Critical Slashing Alert Banner */}
      {isSlashed && (
        <div className="mt-2.5 p-3 rounded-xl bg-[#FEE2E2] border border-[#FCA5A5] text-[#B91C1C] text-sm font-semibold flex items-center space-x-2">
          <ShieldAlert className="w-4.5 h-4.5 flex-shrink-0" />
          <span>
            Consensus exception triggered: {slashReason || 'Vascular integrity loss detected'}. Minting paused.
          </span>
        </div>
      )}

      {/* Secondary Metrics Grid */}
      <div className="mt-4 pt-4 border-t border-[#E5EDE6] grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <span className="text-sm font-semibold text-[#456149] block">Mint cadence</span>
          <span className="font-mono text-lg sm:text-xl font-bold text-[#112415] mt-1 block">
            {isSlashed ? '0.00' : mintRate.toFixed(2)}{' '}
            <span className="text-xs font-semibold text-[#58745E]">PNL/hr</span>
          </span>
        </div>

        <div>
          <span className="text-sm font-semibold text-[#456149] block">Stability index</span>
          <span className="font-mono text-lg sm:text-xl font-bold text-[#15803D] mt-1 block">
            {oracle?.biophysical_health_index || 94.2}%
          </span>
        </div>

        <div>
          <span className="text-sm font-semibold text-[#456149] block">Verification layer</span>
          <span className="font-mono text-base sm:text-lg font-bold text-[#112415] mt-1 block">
            PoVI cambium consensus
          </span>
        </div>

        <div>
          <span className="text-sm font-semibold text-[#456149] block">Oracle status</span>
          <span className="font-mono text-base sm:text-lg font-bold text-[#1E562A] mt-1 block">
            {oracle?.oracle_status || 'Synchronized'}
          </span>
        </div>
      </div>
    </div>
  );
};
export default ValuationMeter;
