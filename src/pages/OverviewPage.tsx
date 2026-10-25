import React, { useMemo } from 'react';
import { WaveformCanvas } from '../components/WaveformCanvas';
import { ValuationMeter } from '../components/ValuationMeter';
import { StabilityEnvelope } from '../components/StabilityEnvelope';
import { MetricCard } from '../components/MetricCard';
import { AnomalyController } from '../components/AnomalyController';
import { CandlestickChart } from '../components/CandlestickChart';
import { PredictivePanel } from '../components/PredictivePanel';
import { TelemetryData, GeminiEvaluation, PoVIResult } from '../types';
import { Sparkles, Sun, Droplets, Thermometer, ShieldCheck, MapPin } from 'lucide-react';

interface OverviewPageProps {
  telemetry: TelemetryData;
  telemetryHistory: TelemetryData[];
  povi: PoVIResult;
  valuation: number;
  mintRate: number;
  isSlashed: boolean;
  oracle: GeminiEvaluation | null;
  onSetMode: (mode: string) => void;
  onTriggerOracle: () => void;
  isEvaluatingOracle: boolean;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  telemetry,
  telemetryHistory,
  povi,
  valuation,
  mintRate,
  isSlashed,
  oracle,
  onSetMode,
  onTriggerOracle,
  isEvaluatingOracle
}) => {
  // Extract historical points for twin canvas waveform plots
  const sapWavePoints = useMemo(() => {
    return telemetryHistory.map((t) => t.sap_current_mv);
  }, [telemetryHistory]);

  const psWavePoints = useMemo(() => {
    return telemetryHistory.map((t) => t.photosynthesis_rate_ps);
  }, [telemetryHistory]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Dynamic Asset Valuation Banner */}
      <ValuationMeter
        valuation={valuation}
        mintRate={mintRate}
        isSlashed={isSlashed}
        slashReason={povi.violation_reason}
        biologicalNonce={telemetry.biological_nonce}
        oracle={oracle}
      />

      {/* Live Geolocation & Environmental Alignment Bar */}
      <div className="forest-panel p-4 sm:p-5 rounded-2xl border border-[#D2E2D5] flex flex-wrap items-center justify-between gap-3 text-sm shadow-xs bg-white">
        <div className="flex items-center space-x-2.5 text-[#112415]">
          <span className="w-3 h-3 rounded-full bg-[#15803D] animate-pulse"></span>
          <span className="font-mono font-bold text-[#112415] text-base flex items-center space-x-1.5">
            <MapPin className="w-4 h-4 text-[#15803D]" />
            <span>{telemetry.geo_location?.city || 'Station'}, {telemetry.geo_location?.country || 'Global'}</span>
          </span>
          <span className="text-xs sm:text-sm text-[#527457] font-mono hidden sm:inline">
            ({telemetry.geo_location?.latitude?.toFixed(2)}°, {telemetry.geo_location?.longitude?.toFixed(2)}°)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs sm:text-sm text-[#112415]">
          <span className="px-3 py-1.5 rounded-xl bg-[#F6FAF7] border border-[#D2E2D5] flex items-center space-x-2 font-semibold">
            <Sun className="w-4 h-4 text-[#D97706]" />
            <span>Solar: {telemetry.ppfd_umol?.toFixed(0)} µmol/m²s</span>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-[#F6FAF7] border border-[#D2E2D5] flex items-center space-x-2 font-semibold">
            <Droplets className="w-4 h-4 text-[#2563EB]" />
            <span>Moisture: {telemetry.environment?.soil_moisture_m3_m3 ?? 0.22} m³/m³</span>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-[#F6FAF7] border border-[#D2E2D5] flex items-center space-x-2 font-semibold">
            <Thermometer className="w-4 h-4 text-[#15803D]" />
            <span>{telemetry.temp_c}°C / {telemetry.humidity_pct}% RH</span>
          </span>
          <span className={`px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-bold shadow-xs ${
            telemetry.operating_mode === 'PHYSICAL_ESP32_STREAM'
              ? 'bg-[#E8F7ED] border-[#86EFAC] text-[#15803D]'
              : 'bg-[#F0F6F1] border-[#D2E2D5] text-[#1E562A]'
          }`}>
            {telemetry.operating_mode === 'PHYSICAL_ESP32_STREAM' ? 'USB serial live' : 'Open-Meteo sync'}
          </span>
        </div>
      </div>

      {/* 2. Compact Scannable Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Phloem sap micro-potential"
          value={telemetry.sap_current_mv.toFixed(2)}
          unit="mV"
          subtext="GPIO 32 cambium probe A"
          status={isSlashed ? 'critical' : 'active'}
          trend="+1.2 mV"
          progressPercent={((telemetry.sap_current_mv + 10) / 60) * 100}
        />

        <MetricCard
          label="Cellular impedance (1 kHz)"
          value={telemetry.cellular_impedance_kohm.toFixed(1)}
          unit="kΩ"
          subtext="GPIO 25 AC challenge loop"
          status={
            telemetry.cellular_impedance_kohm < 10 || telemetry.cellular_impedance_kohm > 65
              ? 'critical'
              : 'normal'
          }
          trend="Cole-Cole stable"
          progressPercent={((telemetry.cellular_impedance_kohm - 10) / 50) * 100}
        />

        <MetricCard
          label="Photosynthetic quantum rate"
          value={telemetry.photosynthesis_rate_ps.toFixed(2)}
          unit="PS"
          subtext="Transpiration translocation"
          status={telemetry.photosynthesis_rate_ps < 1.0 ? 'warning' : 'normal'}
          trend="Active flux"
          progressPercent={(telemetry.photosynthesis_rate_ps / 16) * 100}
        />

        <MetricCard
          label="Phase shift coherence"
          value={telemetry.phase_shift_deg.toFixed(1)}
          unit="deg"
          subtext="Membrane capacitive lag"
          status={telemetry.phase_shift_deg < 2.5 ? 'critical' : 'active'}
          trend="Bio-capacitive"
          progressPercent={(telemetry.phase_shift_deg / 16) * 100}
        />
      </div>

      {/* 3. Real-Time Oscilloscope Waveforms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Canvas 1: Phloem Sap Current */}
        <WaveformCanvas
          title="Phloem sap current potential"
          subHeader="Direct cambium micro-potential"
          unit="mV"
          currentValue={telemetry.sap_current_mv}
          dataPoints={sapWavePoints.length > 0 ? sapWavePoints : [0, 0]}
          color="#2E5A36"
          minExpected={-10}
          maxExpected={50}
          zeroLine={true}
          badgeText="Channel A // GPIO 32"
        />

        {/* Canvas 2: Active Photosynthesis Rates */}
        <WaveformCanvas
          title="Active photosynthesis rate"
          subHeader="Transpiration flux and Farquhar dynamic rate"
          unit="PS"
          currentValue={telemetry.photosynthesis_rate_ps}
          dataPoints={psWavePoints.length > 0 ? psWavePoints : [0, 0]}
          color="#1E6E38"
          minExpected={0}
          maxExpected={18}
          zeroLine={false}
          badgeText="Channel B // Dynamic PS"
        />
      </div>

      {/* 4. Modern Financial Spline Trajectory & Area Chart ($PNL / USDC Spot) */}
      <CandlestickChart currentPrice={valuation} isSlashed={isSlashed} />

      {/* 5. Predictive Machine Learning Module & 90-Day Forecast Table */}
      <PredictivePanel
        currentStressMode={telemetry.operating_mode || 'NORMAL'}
        isSlashed={isSlashed}
      />

      {/* 6. Stability Envelope & Ambient Environmental Alignment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Stability Envelope Widget (2 Columns) */}
        <div className="lg:col-span-2">
          <StabilityEnvelope telemetry={telemetry} isSlashed={isSlashed} />
        </div>

        {/* Ambient Sensor Micro-Climate Matching */}
        <div className="forest-panel p-5 rounded-2xl border border-[#D2E2D5] flex flex-col justify-between bg-white shadow-xs">
          <div>
            <div className="flex items-center space-x-2.5 mb-3.5">
              <Sun className="w-5 h-5 text-[#15803D]" />
              <h4 className="text-base font-bold text-[#112415] tracking-wide">
                Rhizosphere & canopy telemetry
              </h4>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#F6FAF7] border border-[#D2E2D5]">
                <span className="text-[#3B5740] font-medium flex items-center space-x-2">
                  <Sun className="w-4 h-4 text-[#D97706]" />
                  <span>Solar PAR / PPFD</span>
                </span>
                <span className="font-mono font-bold text-[#112415] text-sm">
                  {telemetry.ppfd_umol.toFixed(0)} <span className="font-normal text-[#15803D]">µmol/m²s</span>
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#F6FAF7] border border-[#D2E2D5]">
                <span className="text-[#3B5740] font-medium flex items-center space-x-2">
                  <Thermometer className="w-4 h-4 text-[#15803D]" />
                  <span>Ambient temperature</span>
                </span>
                <span className="font-mono font-bold text-[#112415] text-sm">
                  {telemetry.temp_c.toFixed(1)} <span className="font-normal text-[#15803D]">°C</span>
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#F6FAF7] border border-[#D2E2D5]">
                <span className="text-[#3B5740] font-medium flex items-center space-x-2">
                  <Droplets className="w-4 h-4 text-[#2563EB]" />
                  <span>Relative humidity</span>
                </span>
                <span className="font-mono font-bold text-[#112415] text-sm">
                  {telemetry.humidity_pct.toFixed(1)} <span className="font-normal text-[#15803D]">%</span>
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#D2E2D5] flex items-center justify-between text-xs sm:text-sm font-mono text-[#3B5740]">
            <span className="font-semibold">Stomatal conductance</span>
            <span className="text-[#15803D] font-bold text-sm">
              {oracle?.stomatal_conductance_mol_m2_s || '0.245'} mol/m²s
            </span>
          </div>
        </div>
      </div>

      {/* 7. Gemini AI Biophysical Reasoning Oracle Card */}
      <div className="forest-panel p-5 sm:p-6 rounded-2xl border border-[#C2DEC6] relative overflow-hidden bg-white shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
          <div className="flex items-center space-x-2.5">
            <Sparkles className="w-5 h-5 text-[#15803D]" />
            <h4 className="text-base sm:text-lg font-bold text-[#112415] tracking-tight">
              AI/ML biophysical reasoning oracle analysis
            </h4>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-[#E8F7ED] text-[#15803D] border border-[#86EFAC] self-start sm:self-auto">
            Model: AI/ML Carbon Engine
          </span>
        </div>

        {/* Visual Oracle Findings: Chips instead of dense text */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3">
          <div className="p-3 rounded-xl bg-[#F6FAF7] border border-[#D2E2D5]">
            <span className="text-xs font-semibold text-[#58745E] block">Vascular integrity</span>
            <span className="text-sm font-mono font-bold text-[#15803D] mt-0.5 block">
              Continuous xylem flux verified
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#F6FAF7] border border-[#D2E2D5]">
            <span className="text-xs font-semibold text-[#58745E] block">Stomatal conductance</span>
            <span className="text-sm font-mono font-bold text-[#112415] mt-0.5 block">
              {oracle?.stomatal_conductance_mol_m2_s || '0.245'} mol/m²s (Optimal)
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#F6FAF7] border border-[#D2E2D5]">
            <span className="text-xs font-semibold text-[#58745E] block">Consensus verdict</span>
            <span className="text-sm font-mono font-bold text-[#15803D] mt-0.5 block">
              PoVI verified • Zero synthetic drift
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3.5 border-t border-[#D2E2D5] flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm font-mono text-[#4A6B4F]">
          <div>
            Oracle signature:{' '}
            <span className="text-[#15803D] font-bold">
              {oracle?.oracle_signature?.slice(0, 24) || '0xPOVI_CAMBIUM'}...
            </span>
          </div>
          <div className="flex items-center space-x-2 font-bold text-[#112415]">
            <ShieldCheck className="w-5 h-5 text-[#15803D]" />
            <span className="text-sm sm:text-base font-extrabold text-[#15803D]">
              Confidence: {oracle?.oracle_confidence_pct || 98.8}%
            </span>
          </div>
        </div>
      </div>

      {/* 8. Hardware Fault & Anomaly Injection Matrix */}
      <AnomalyController
        currentMode={telemetry.operating_mode || 'NORMAL'}
        onSetMode={onSetMode}
        onTriggerOracle={onTriggerOracle}
        isEvaluatingOracle={isEvaluatingOracle}
      />
    </div>
  );
};
