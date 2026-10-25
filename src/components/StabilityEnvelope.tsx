import React from 'react';
import { Compass, Shield, Activity, Radio } from 'lucide-react';
import { TelemetryData } from '../types';

interface StabilityEnvelopeProps {
  telemetry: TelemetryData;
  isSlashed: boolean;
}

export const StabilityEnvelope: React.FC<StabilityEnvelopeProps> = ({
  telemetry,
  isSlashed
}) => {
  const { cellular_impedance_kohm, phase_shift_deg, sap_current_mv } = telemetry;

  // Calculate normalized positions inside healthy boundaries
  const zNorm = Math.min(100, Math.max(0, ((cellular_impedance_kohm - 10) / (60 - 10)) * 100));
  const phaseNorm = Math.min(100, Math.max(0, ((phase_shift_deg - 2) / (16 - 2)) * 100));
  const sapNorm = Math.min(100, Math.max(0, ((sap_current_mv + 10) / (50 + 10)) * 100));

  const isEnvelopeBreached = isSlashed || cellular_impedance_kohm < 10.0 || cellular_impedance_kohm > 65.0 || phase_shift_deg < 2.5;

  return (
    <div className="bg-white p-5 rounded-2xl border border-[#D2E2D5] select-none shadow-xs hover:shadow-sm transition-all duration-200">
      {/* Title & Status */}
      <div className="flex items-center justify-between mb-4 pb-3.5 border-b border-[#E5EDE6]">
        <div className="flex items-center space-x-2.5">
          <Compass className="w-5 h-5 text-[#15803D]" />
          <h4 className="text-base font-bold text-[#112415] tracking-wide">
            System stability envelope
          </h4>
        </div>
        <span
          className={`text-xs sm:text-sm font-mono font-bold px-3 py-1 rounded-lg border ${
            isEnvelopeBreached
              ? 'bg-[#FEE2E2] text-[#B91C1C] border-[#FCA5A5]'
              : 'bg-[#E8F7ED] text-[#15803D] border-[#A7F3D0]'
          }`}
        >
          {isEnvelopeBreached ? 'Envelope breached' : 'Envelope stable'}
        </span>
      </div>

      {/* 3 Parameter Stability Sliders with Bounds */}
      <div className="space-y-4">
        {/* 1. Cellular Impedance Boundary */}
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-[#2A442F] font-semibold flex items-center space-x-2">
              <Shield className="w-4 h-4 text-[#15803D]" />
              <span>Membrane impedance (Z)</span>
            </span>
            <span className="font-mono font-bold text-[#112415] text-sm sm:text-base">
              {cellular_impedance_kohm.toFixed(1)} <span className="font-normal text-[#58745E]">kΩ</span>
            </span>
          </div>
          <div className="w-full bg-[#EBF2ED] h-3 rounded-full relative overflow-hidden border border-[#D2E2D5]">
            {/* Safe zone highlight [10kΩ to 60kΩ] */}
            <div className="absolute left-[15%] right-[15%] top-0 bottom-0 bg-[#D4E8D9] rounded-full" />
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                cellular_impedance_kohm < 10 || cellular_impedance_kohm > 60
                  ? 'bg-[#DC2626]'
                  : 'bg-[#16A34A]'
              }`}
              style={{ width: `${zNorm}%` }}
            />
          </div>
          <div className="flex justify-between text-xs font-mono text-[#58745E] mt-1 font-medium">
            <span>Low: &lt;10 kΩ</span>
            <span className="text-[#15803D] font-bold">Healthy [15–45 kΩ]</span>
            <span>High: &gt;60 kΩ</span>
          </div>
        </div>

        {/* 2. Phase-Shift Angle Boundary */}
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-[#2A442F] font-semibold flex items-center space-x-2">
              <Activity className="w-4 h-4 text-[#15803D]" />
              <span>Phase shift (Δθ lag)</span>
            </span>
            <span className="font-mono font-bold text-[#112415] text-sm sm:text-base">
              {phase_shift_deg.toFixed(1)}°
            </span>
          </div>
          <div className="w-full bg-[#EBF2ED] h-3 rounded-full relative overflow-hidden border border-[#D2E2D5]">
            <div className="absolute left-[20%] right-[10%] top-0 bottom-0 bg-[#D4E8D9] rounded-full" />
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                phase_shift_deg < 2.5 ? 'bg-[#DC2626]' : 'bg-[#16A34A]'
              }`}
              style={{ width: `${phaseNorm}%` }}
            />
          </div>
          <div className="flex justify-between text-xs font-mono text-[#58745E] mt-1 font-medium">
            <span>0° flatline</span>
            <span className="text-[#15803D] font-bold">Healthy [6°–14°]</span>
            <span>&gt;16°</span>
          </div>
        </div>

        {/* 3. Sap Flux Dynamics */}
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-[#2A442F] font-semibold flex items-center space-x-2">
              <Radio className="w-4 h-4 text-[#15803D]" />
              <span>Phloem sap potential</span>
            </span>
            <span className="font-mono font-bold text-[#112415] text-sm sm:text-base">
              {sap_current_mv.toFixed(2)} <span className="font-normal text-[#58745E]">mV</span>
            </span>
          </div>
          <div className="w-full bg-[#EBF2ED] h-3 rounded-full relative overflow-hidden border border-[#D2E2D5]">
            <div className="absolute left-[20%] right-[20%] top-0 bottom-0 bg-[#D4E8D9] rounded-full" />
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                sap_current_mv < -5 ? 'bg-[#DC2626]' : 'bg-[#16A34A]'
              }`}
              style={{ width: `${sapNorm}%` }}
            />
          </div>
          <div className="flex justify-between text-xs font-mono text-[#58745E] mt-1 font-medium">
            <span>-10 mV</span>
            <span className="text-[#15803D] font-bold">Active flux [0–40 mV]</span>
            <span>+50 mV</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default StabilityEnvelope;
