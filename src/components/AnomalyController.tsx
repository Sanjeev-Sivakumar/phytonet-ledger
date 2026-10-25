import React from 'react';
import { Scissors, ShieldCheck, Sun, Skull, Droplets, Sparkles } from 'lucide-react';

interface AnomalyControllerProps {
  currentMode: string;
  onSetMode: (mode: string) => void;
  onTriggerOracle: () => void;
  isEvaluatingOracle: boolean;
}

export const AnomalyController: React.FC<AnomalyControllerProps> = ({
  currentMode,
  onSetMode,
  onTriggerOracle,
  isEvaluatingOracle
}) => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-[#D2E2D5] select-none shadow-xs hover:shadow-sm transition-all duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4 pb-3.5 border-b border-[#E5EDE6]">
        <div className="flex items-center space-x-2.5">
          <span className="w-3 h-3 rounded-full bg-[#15803D]" />
          <span className="text-base font-bold text-[#112415] tracking-wide">
            Hardware fault and anomaly injection matrix
          </span>
        </div>
        <span className="text-xs sm:text-sm font-mono font-semibold text-[#58745E]">
          Consensus fault simulator
        </span>
      </div>

      {/* Button Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {/* 1. Normal State */}
        <button
          onClick={() => onSetMode('NORMAL')}
          className={`flex items-center justify-center space-x-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
            currentMode === 'NORMAL'
              ? 'bg-[#1E562A] border-[#1E562A] text-white shadow-xs'
              : 'border-[#D2E2D5] bg-[#F4F8F5] text-[#3B5740] hover:text-[#112415] hover:bg-[#EBF2ED]'
          }`}
        >
          <ShieldCheck className={`w-4 h-4 ${currentMode === 'NORMAL' ? 'text-[#86EFAC]' : 'text-[#15803D]'}`} />
          <span>Normal cambium</span>
        </button>

        {/* 2. Wire Cut */}
        <button
          onClick={() => onSetMode('WIRE_CUT')}
          className={`flex items-center justify-center space-x-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
            currentMode === 'WIRE_CUT'
              ? 'bg-[#FEE2E2] border-[#EF4444] text-[#B91C1C] shadow-xs'
              : 'border-[#D2E2D5] bg-[#F4F8F5] text-[#3B5740] hover:text-[#B91C1C] hover:bg-[#FEE2E2]/50'
          }`}
          title="Disconnects probe wire: Triggers instant PoVI consensus exception & burns asset valuation"
        >
          <Scissors className="w-4 h-4 text-[#DC2626]" />
          <span>Cut probe wire</span>
        </button>

        {/* 3. Dead Tissue */}
        <button
          onClick={() => onSetMode('DEAD_TISSUE')}
          className={`flex items-center justify-center space-x-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
            currentMode === 'DEAD_TISSUE'
              ? 'bg-[#FEE2E2] border-[#EF4444] text-[#B91C1C] shadow-xs'
              : 'border-[#D2E2D5] bg-[#F4F8F5] text-[#3B5740] hover:text-[#B91C1C] hover:bg-[#FEE2E2]/50'
          }`}
          title="Simulates necrotic/desiccated tissue (Z > 70kΩ): Triggers slash & burn"
        >
          <Skull className="w-4 h-4 text-[#DC2626]" />
          <span>Dead tissue</span>
        </button>

        {/* 4. Sun Burst */}
        <button
          onClick={() => onSetMode('SUN_BURST')}
          className={`flex items-center justify-center space-x-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
            currentMode === 'SUN_BURST'
              ? 'bg-[#FEF3C7] border-[#F59E0B] text-[#B45309] shadow-xs'
              : 'border-[#D2E2D5] bg-[#F4F8F5] text-[#3B5740] hover:text-[#B45309] hover:bg-[#FEF3C7]/50'
          }`}
          title="Simulates solar noon PAR surge: Boosts photosynthesis and asset valuation"
        >
          <Sun className="w-4 h-4 text-[#D97706]" />
          <span>Solar noon peak</span>
        </button>

        {/* 5. Drought Stress */}
        <button
          onClick={() => onSetMode('DROUGHT')}
          className={`flex items-center justify-center space-x-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
            currentMode === 'DROUGHT'
              ? 'bg-[#FEF3C7] border-[#F59E0B] text-[#B45309] shadow-xs'
              : 'border-[#D2E2D5] bg-[#F4F8F5] text-[#3B5740] hover:text-[#B45309] hover:bg-[#FEF3C7]/50'
          }`}
          title="Simulates low soil moisture: Triggers hydraulic cavitation warning"
        >
          <Droplets className="w-4 h-4 text-[#0284C7]" />
          <span>Drought stress</span>
        </button>

        {/* 6. Gemini Oracle Recalculate */}
        <button
          onClick={onTriggerOracle}
          disabled={isEvaluatingOracle}
          className="flex items-center justify-center space-x-2 p-3 rounded-xl border border-[#B7DAC0] bg-[#E8F3EA] text-[#1E562A] hover:bg-[#1E562A] hover:text-white transition-all disabled:opacity-50 text-sm font-semibold shadow-xs"
          title="Calls Gemini AI to re-evaluate carbon flux"
        >
          <Sparkles className={`w-4 h-4 ${isEvaluatingOracle ? 'animate-spin' : ''}`} />
          <span>{isEvaluatingOracle ? 'Evaluating...' : 'Query Gemini'}</span>
        </button>
      </div>
    </div>
  );
};
export default AnomalyController;
