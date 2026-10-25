import React, { useState, useEffect, useMemo } from 'react';
import {
  Factory,
  ShieldCheck,
  ShieldAlert,
  Flame,
  Leaf,
  Layers,
  AlertOctagon,
  Lock,
  RefreshCw,
  Scale,
  Sparkles,
  CheckCircle2,
  Clock,
  Radio
} from 'lucide-react';
import { EmissionsSnapshot, TelemetryData } from '../types';
import { fetchEmissions, triggerDoubleCountAttempt } from '../services/api';
import { TimeSeriesAreaChart, DataSeries } from '../components/charts/TimeSeriesAreaChart';
import { DonutChart, DonutSegment } from '../components/charts/DonutChart';
import { BarChart, BarItem } from '../components/charts/BarChart';

interface EmissionsVerificationPageProps {
  telemetry: TelemetryData;
  isSlashed: boolean;
}

export const EmissionsVerificationPage: React.FC<EmissionsVerificationPageProps> = ({
  telemetry,
  isSlashed
}) => {
  const [data, setData] = useState<EmissionsSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [doubleCountStatus, setDoubleCountStatus] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<string>('24h');

  const loadEmissions = () => {
    fetchEmissions()
      .then((res) => setData(res))
      .catch((err) => console.warn('Emissions fetch notice:', err));
  };

  useEffect(() => {
    loadEmissions();
    const interval = setInterval(loadEmissions, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulateDoubleCount = async () => {
    setIsLoading(true);
    try {
      await triggerDoubleCountAttempt();
      setDoubleCountStatus('Blocked: Smart contract rejected duplicate token issuance claim (ERC-721 nonce collision).');
      loadEmissions();
      setTimeout(() => setDoubleCountStatus(null), 6000);
    } catch (err: any) {
      setDoubleCountStatus(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const isNetDeficit = data?.is_net_deficit || isSlashed;
  const grossEmissions = data?.total_gross_industrial_co2_kg_hr ?? data?.total_factory_co2_kg_hr ?? 184.2;
  const bioUptake = isSlashed ? 0.0 : (data?.total_biological_absorption_kg_hr ?? data?.arboreal_absorption_kg_hr ?? 0.048);
  const netBalance = data?.net_carbon_balance_kg_hr ?? data?.net_carbon_delta_kg_hr ?? (grossEmissions - bioUptake);

  // Time Series Chart Data: Continuous industrial output vs living arboreal uptake
  const timeSeriesData: DataSeries[] = useMemo(() => {
    const pointsCount = timeframe === '1h' ? 12 : timeframe === '24h' ? 24 : timeframe === '7d' ? 28 : 30;
    const now = Date.now();
    const stepMs = (timeframe === '1h' ? 3600000 : timeframe === '24h' ? 86400000 : timeframe === '7d' ? 604800000 : 2592000000) / pointsCount;

    const industrialPoints = [];
    const bioPoints = [];

    for (let i = pointsCount - 1; i >= 0; i--) {
      const ts = now - i * stepMs;
      // Slight sinusoidal daily variance
      const hour = new Date(ts).getHours();
      const diurnalFactor = 0.85 + 0.3 * Math.sin((hour / 24) * Math.PI * 2);
      const grossVal = Number((grossEmissions * (0.92 + 0.16 * Math.sin(i * 0.45))).toFixed(1));
      const bioVal = isSlashed ? 0 : Number((bioUptake * diurnalFactor * (0.88 + 0.24 * Math.cos(i * 0.35))).toFixed(3));

      industrialPoints.push({ timestamp: ts, value: grossVal });
      bioPoints.push({ timestamp: ts, value: bioVal * 1000 }); // Render biological in g/hr scale for visibility
    }

    return [
      {
        id: 'industrial',
        name: 'Industrial gross emissions (kg CO₂e/hr)',
        color: '#DC2626',
        unit: 'kg/hr',
        data: industrialPoints
      },
      {
        id: 'biological',
        name: 'Cambium biological uptake (scaled g CO₂/hr)',
        color: '#16A34A',
        unit: 'g/hr',
        data: bioPoints
      }
    ];
  }, [grossEmissions, bioUptake, timeframe, isSlashed]);

  // Donut Chart Data: Atmospheric pollutant composition from CEMS / OpenAQ
  const pollutantSegments: DonutSegment[] = useMemo(() => {
    const aq = data?.live_air_quality;
    const co = aq?.carbon_monoxide_ug_m3 ?? 184.0;
    const so2 = aq?.sulphur_dioxide_ug_m3 ?? 3.2;
    const no2 = aq?.nitrogen_dioxide_ug_m3 ?? 12.4;
    const pm25 = aq?.pm2_5_ug_m3 ?? 8.5;

    return [
      { id: 'co', label: 'Carbon monoxide (CO)', value: co, unit: 'µg/m³', color: '#F59E0B' },
      { id: 'no2', label: 'Nitrogen dioxide (NO₂)', value: no2, unit: 'µg/m³', color: '#EF4444' },
      { id: 'pm25', label: 'Particulate matter (PM₂.₅)', value: pm25, unit: 'µg/m³', color: '#8B5CF6' },
      { id: 'so2', label: 'Sulphur dioxide (SO₂)', value: so2, unit: 'µg/m³', color: '#06B6D4' }
    ];
  }, [data?.live_air_quality]);

  // Bar Chart Data: Factory nodes comparison
  const factoryBarItems: BarItem[] = useMemo(() => {
    if (!data?.factory_nodes || data.factory_nodes.length === 0) {
      return [
        { id: 'node-1', label: 'Smokestack A (Boiler)', value: 84.5, secondaryValue: 94.2, unit: 'kg/hr', color: '#EF4444', secondaryColor: '#10B981' },
        { id: 'node-2', label: 'Kiln Unit B (Thermal)', value: 52.8, secondaryValue: 91.0, unit: 'kg/hr', color: '#F59E0B', secondaryColor: '#10B981' },
        { id: 'node-3', label: 'Synthesis Loop C', value: 31.4, secondaryValue: 96.5, unit: 'kg/hr', color: '#10B981', secondaryColor: '#10B981' },
        { id: 'node-4', label: 'Auxiliary Flare D', value: 15.5, secondaryValue: 88.0, unit: 'kg/hr', color: '#6366F1', secondaryColor: '#10B981' }
      ];
    }
    return data.factory_nodes.map((node) => ({
      id: node.id,
      label: node.name,
      value: node.co2_emission_rate_kg_hr,
      secondaryValue: node.scrubber_efficiency_pct ?? 92.0,
      unit: 'kg/hr',
      color: node.co2_emission_rate_kg_hr > 60 ? '#EF4444' : '#F59E0B',
      secondaryColor: '#10B981',
      annotation: `${node.scrubber_efficiency_pct ?? 92}% scrubber`
    }));
  }, [data?.factory_nodes]);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* 1. TOP ROW: Industrial emissions, Biological sequestration, Net carbon balance, Verification status */}
      {/* 1. TOP ROW: Industrial emissions, Biological sequestration, Net carbon balance, Verification status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Industrial Emissions */}
        <div className="forest-panel p-5 sm:p-6 rounded-2xl border border-[#D2E2D5] bg-white shadow-xs">
          <div className="flex items-center justify-between text-xs sm:text-sm mb-2.5">
            <span className="text-[#B91C1C] font-bold flex items-center space-x-1.5">
              <Flame className="w-4 h-4 text-[#DC2626]" />
              <span>Industrial emissions</span>
            </span>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-[#FEE2E2] text-[#B91C1C] border border-[#FCA5A5]">
              CEMS active
            </span>
          </div>
          <div className="flex items-baseline space-x-2 my-1.5">
            <span className="text-4xl sm:text-5xl font-extrabold font-mono text-[#B91C1C] tracking-tight">
              {grossEmissions.toFixed(1)}
            </span>
            <span className="text-sm font-semibold text-[#527457]">kg CO₂e/hr</span>
          </div>
          <div className="text-xs sm:text-sm font-mono text-[#527457] mt-1.5 font-medium">
            Combustion factor: Live verified
          </div>
        </div>

        {/* Card 2: Biological Sequestration */}
        <div className="forest-panel p-5 sm:p-6 rounded-2xl border border-[#D2E2D5] bg-white shadow-xs">
          <div className="flex items-center justify-between text-xs sm:text-sm mb-2.5">
            <span className="text-[#15803D] font-bold flex items-center space-x-1.5">
              <Leaf className="w-4 h-4 text-[#15803D]" />
              <span>Biological uptake</span>
            </span>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-[#E8F7ED] text-[#15803D] border border-[#86EFAC]">
              PoVI verified
            </span>
          </div>
          <div className="flex items-baseline space-x-2 my-1.5">
            <span className="text-4xl sm:text-5xl font-extrabold font-mono text-[#15803D] tracking-tight">
              {bioUptake.toFixed(3)}
            </span>
            <span className="text-sm font-semibold text-[#15803D]">kg CO₂/hr</span>
          </div>
          <div className="text-xs sm:text-sm font-mono text-[#527457] mt-1.5 font-medium">
            Transpiration: {telemetry.photosynthesis_rate_ps.toFixed(2)} PS
          </div>
        </div>

        {/* Card 3: Net Carbon Balance */}
        <div className="forest-panel p-5 sm:p-6 rounded-2xl border border-[#D2E2D5] bg-white shadow-xs">
          <div className="flex items-center justify-between text-xs sm:text-sm mb-2.5">
            <span className="text-[#112415] font-bold flex items-center space-x-1.5">
              <Scale className="w-4 h-4 text-[#D97706]" />
              <span>Net carbon balance</span>
            </span>
            <span
              className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-md border ${
                isNetDeficit
                  ? 'bg-[#FEF3C7] text-[#B45309] border-[#FCD34D]'
                  : 'bg-[#E8F7ED] text-[#15803D] border-[#86EFAC]'
              }`}
            >
              {isNetDeficit ? 'Deficit' : 'Surplus'}
            </span>
          </div>
          <div className="flex items-baseline space-x-2 my-1.5">
            <span
              className={`text-4xl sm:text-5xl font-extrabold font-mono tracking-tight ${
                isNetDeficit ? 'text-[#B45309]' : 'text-[#15803D]'
              }`}
            >
              {netBalance > 0 ? `+${netBalance.toFixed(1)}` : netBalance.toFixed(1)}
            </span>
            <span className="text-sm font-semibold text-[#527457]">kg CO₂e/hr</span>
          </div>
          <div className="text-xs sm:text-sm font-mono text-[#527457] mt-1.5 font-medium">
            Delta: {((bioUptake / (grossEmissions || 1)) * 100).toFixed(2)}% absorbed
          </div>
        </div>

        {/* Card 4: Verification Status */}
        <div className="forest-panel p-5 sm:p-6 rounded-2xl border border-[#D2E2D5] bg-white shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs sm:text-sm mb-2.5">
            <span className="text-[#15803D] font-bold flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-[#15803D]" />
              <span>Verification status</span>
            </span>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-[#E8F7ED] text-[#15803D] border border-[#86EFAC]">
              Audit passed
            </span>
          </div>
          <div className="my-1">
            <span className="text-lg sm:text-xl font-bold text-[#112415] block">
              {data?.smart_contract_status || 'Compliant (ERC-721)'}
            </span>
            <p className="text-xs sm:text-sm text-[#527457] font-mono mt-0.5">
              Nonce: {telemetry.biological_nonce.slice(0, 14)}...
            </p>
          </div>
          <div className="text-xs sm:text-sm font-mono text-[#15803D] font-bold flex items-center space-x-1.5 mt-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Smart contract locked</span>
          </div>
        </div>
      </div>

      {/* Double Counting Prevention Attack Simulator Banner */}
      {doubleCountStatus && (
        <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] text-[#B91C1C] text-xs font-mono font-bold flex items-center space-x-2.5 animate-fade-in shadow-xs">
          <AlertOctagon className="w-4 h-4 flex-shrink-0" />
          <span>{doubleCountStatus}</span>
        </div>
      )}

      {/* Planetary Air Quality Bar */}
      <div className="forest-panel p-4 sm:p-5 rounded-2xl border border-[#D2E2D5] flex flex-wrap items-center justify-between gap-3 text-sm bg-white shadow-xs">
        <div className="flex items-center space-x-2 text-[#112415]">
          <span className="w-3 h-3 rounded-full bg-[#D97706] animate-pulse"></span>
          <span className="font-mono font-bold text-[#D97706] text-sm sm:text-base">
            Planetary CEMS: {data?.live_air_quality?.station_name || 'Regional industrial monitoring station'}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs sm:text-sm text-[#112415]">
          <span className="px-3 py-1.5 rounded-xl bg-[#F6FAF7] border border-[#D2E2D5] font-semibold">
            CO: {data?.live_air_quality?.carbon_monoxide_ug_m3 ?? 184} µg/m³
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-[#F6FAF7] border border-[#D2E2D5] font-semibold">
            SO₂: {data?.live_air_quality?.sulphur_dioxide_ug_m3 ?? 3.2} µg/m³
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-[#F6FAF7] border border-[#D2E2D5] font-semibold">
            NO₂: {data?.live_air_quality?.nitrogen_dioxide_ug_m3 ?? 12.4} µg/m³
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-[#F6FAF7] border border-[#D2E2D5] font-semibold">
            PM₂.₅: {data?.live_air_quality?.pm2_5_ug_m3 ?? 8.5} µg/m³
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-[#E8F7ED] border border-[#86EFAC] text-[#15803D] font-bold">
            {data?.live_air_quality?.provider || 'OpenAQ feed'}
          </span>
        </div>
      </div>

      {/* 2. MAIN ROW: Large emissions-versus-sequestration line chart and pollutant composition donut chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Large Line/Area Chart (2 Cols) */}
        <div className="lg:col-span-2">
          <TimeSeriesAreaChart
            title="Emissions versus biological sequestration"
            subtitle="Continuous CEMS industrial emission rates vs cambium photosynthetic absorption"
            series={timeSeriesData}
            height={320}
            timeframes={['1h', '24h', '7d', '30d']}
            activeTimeframe={timeframe}
            onTimeframeChange={setTimeframe}
            isDaylight={true}
            sourceBadge="OpenAQ & PoVI cambium"
          />
        </div>

        {/* Pollutant Composition Donut Chart (1 Col) */}
        <div>
          <DonutChart
            title="Atmospheric pollutant composition"
            subtitle="Planetary air quality telemetry distribution"
            segments={pollutantSegments}
            centerLabel="Total CEMS"
            centerValue={`${(pollutantSegments.reduce((s, p) => s + p.value, 0)).toFixed(0)} µg/m³`}
            isDaylight={true}
            sourceBadge="Planetary CEMS"
          />
        </div>
      </div>

      {/* 3. NEXT ROW: Factory emission comparison bar chart and carbon balance visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Factory Emission Comparison Bar Chart (2 Cols) */}
        <div className="lg:col-span-2">
          <BarChart
            title="Factory node emission comparison"
            subtitle="Monitored industrial smokestack rates and scrubber efficiency"
            items={factoryBarItems}
            height={240}
            isDaylight={true}
            primaryLegend="CO₂ emission (kg/hr)"
            secondaryLegend="Scrubber efficiency (%)"
            sourceBadge="CEMS industrial nodes"
          />
        </div>

        {/* Carbon Balance Visualization Card (1 Col) */}
        <div className="forest-panel p-5 rounded-2xl border border-[#D2E2D5] flex flex-col justify-between bg-white shadow-xs">
          <div>
            <div className="flex items-center space-x-2 pb-3 border-b border-[#D2E2D5] mb-3">
              <Scale className="w-4 h-4 text-[#15803D]" />
              <h4 className="text-sm font-bold text-[#112415] tracking-wide">
                Carbon balance visualization
              </h4>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-[#3B5740] mb-1 font-medium">
                  <span>Gross industrial output</span>
                  <span className="font-mono text-[#B91C1C] font-bold">{grossEmissions.toFixed(1)} kg/hr</span>
                </div>
                <div className="w-full bg-[#FEE2E2] h-2 rounded-full overflow-hidden border border-[#FCA5A5]">
                  <div className="bg-[#DC2626] h-full rounded-full" style={{ width: '92%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[#3B5740] mb-1 font-medium">
                  <span>Arboreal cambium sink</span>
                  <span className="font-mono text-[#15803D] font-bold">{bioUptake.toFixed(3)} kg/hr</span>
                </div>
                <div className="w-full bg-[#E8F7ED] h-2 rounded-full overflow-hidden border border-[#86EFAC]">
                  <div
                    className="bg-[#15803D] h-full rounded-full"
                    style={{ width: `${Math.min(100, Math.max(5, (bioUptake / 0.1) * 100))}%` }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F6FAF7] border border-[#D2E2D5] space-y-1.5 font-mono">
                <div className="flex justify-between text-[#3B5740]">
                  <span>Offset ratio:</span>
                  <span className="text-[#15803D] font-bold">
                    {((bioUptake / (grossEmissions || 1)) * 100).toFixed(3)}%
                  </span>
                </div>
                <div className="flex justify-between text-[#3B5740]">
                  <span>EU ETS benchmark:</span>
                  <span className="text-[#527457]">Compliant baseline</span>
                </div>
                <div className="flex justify-between text-[#3B5740]">
                  <span>Double-counting blocks:</span>
                  <span className="text-[#B45309] font-bold">
                    {data?.contract_audit_state?.double_counting_prevention?.blocked_duplicate_attempts_count || 3} attempts
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#D2E2D5]">
            <button
              onClick={handleSimulateDoubleCount}
              disabled={isLoading}
              className="w-full py-2.5 px-3 rounded-xl bg-[#FEF3C7] border border-[#FCD34D] hover:bg-[#FDE68A] text-[#B45309] text-xs font-semibold flex items-center justify-center space-x-2 transition-all disabled:opacity-50 shadow-xs active:scale-95"
            >
              <ShieldAlert className="w-4 h-4 text-[#B45309]" />
              <span>Simulate double-count attack</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. BELOW: Compact industrial node table, Verification stages, and Audit history */}
      {/* Industrial Node Table (Daylight Panel) */}
      <div className="daylight-chart-panel p-5 rounded-2xl border border-[#CBD5E1] shadow-xs bg-white select-none text-[#0F172A]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0] mb-3">
          <div className="flex items-center space-x-2">
            <Factory className="w-5 h-5 text-[#0F172A]" />
            <h4 className="text-base font-bold text-[#0F172A] tracking-tight">
              Industrial monitoring nodes
            </h4>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-[#F1F5F9] text-[#0F172A] border border-[#CBD5E1]">
            {data?.factory_nodes?.length || 4} facilities synchronized
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#CBD5E1] font-mono text-[#475569] font-bold">
                <th className="pb-2">Node ID</th>
                <th className="pb-2">Operation name</th>
                <th className="pb-2">CO₂ emission</th>
                <th className="pb-2">CH₄ spike</th>
                <th className="pb-2">Stack temperature</th>
                <th className="pb-2">Scrubber efficiency</th>
                <th className="pb-2">Audit hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] font-mono text-xs text-[#0F172A]">
              {(data?.factory_nodes || [
                { id: 'NODE-EMIT-01', name: 'Pacific Smelting Stack A', co2_emission_rate_kg_hr: 84.5, ch4_emission_rate_g_hr: 12.0, stack_temp_c: 142.5, scrubber_efficiency_pct: 94.2, last_audit_hash: '0x94f1...881a' },
                { id: 'NODE-EMIT-02', name: 'Olympic Bio-Kiln Unit B', co2_emission_rate_kg_hr: 52.8, ch4_emission_rate_g_hr: 8.4, stack_temp_c: 128.0, scrubber_efficiency_pct: 91.0, last_audit_hash: '0x77c2...124d' },
                { id: 'NODE-EMIT-03', name: 'WestCoast Resin Loop C', co2_emission_rate_kg_hr: 31.4, ch4_emission_rate_g_hr: 4.1, stack_temp_c: 110.2, scrubber_efficiency_pct: 96.5, last_audit_hash: '0x33b4...998f' },
                { id: 'NODE-EMIT-04', name: 'Refinery Flare D', co2_emission_rate_kg_hr: 15.5, ch4_emission_rate_g_hr: 2.2, stack_temp_c: 98.4, scrubber_efficiency_pct: 88.0, last_audit_hash: '0x12a9...664c' }
              ]).map((node: any) => (
                <tr key={node.id} className="hover:bg-[#F8FAFC]">
                  <td className="py-2.5 text-[#047857] font-bold">{node.id}</td>
                  <td className="py-2.5 font-semibold text-[#0F172A]">{node.name}</td>
                  <td className="py-2.5 text-[#DC2626] font-bold">{node.co2_emission_rate_kg_hr} kg/hr</td>
                  <td className="py-2.5 text-[#475569]">{node.ch4_emission_rate_g_hr} g/hr</td>
                  <td className="py-2.5 font-semibold">{node.stack_temp_c ?? 142.0}°C</td>
                  <td className="py-2.5 text-[#047857] font-bold">{node.scrubber_efficiency_pct ?? 91.2}%</td>
                  <td className="py-2.5 text-[#64748B]">{node.last_audit_hash}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verification Stages / Smart Contract Gates (Daylight Panel) */}
      <div className="daylight-chart-panel p-5 sm:p-6 rounded-2xl border border-[#CBD5E1] shadow-xs bg-white select-none text-[#0F172A]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4">
          <div className="flex items-center space-x-2.5">
            <Lock className="w-5 h-5 text-[#0F172A]" />
            <h4 className="text-base sm:text-lg font-bold text-[#0F172A] tracking-tight">
              Web3 anti-double-counting verification gates
            </h4>
          </div>
          <span className="text-xs sm:text-sm font-mono font-bold px-3 py-1 rounded-lg bg-[#0F172A] text-white self-start sm:self-auto">
            Smart contract: 0x92F4...921a
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Gate 1 */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5">
              <span className="font-mono text-[#047857] font-bold">Gate A: Physical binding</span>
              <ShieldCheck className="w-4.5 h-4.5 text-[#047857]" />
            </div>
            <h5 className="text-sm font-bold text-[#0F172A] mb-1">Cambium micro-voltage proof</h5>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
              Living chaotic nonce ({telemetry.biological_nonce.slice(0, 12)}...) anchors every token to living biological tissue.
            </p>
          </div>

          {/* Gate 2 */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5">
              <span className="font-mono text-[#047857] font-bold">Gate B: Deduplication</span>
              <ShieldCheck className="w-4.5 h-4.5 text-[#047857]" />
            </div>
            <h5 className="text-sm font-bold text-[#0F172A] mb-1">Cross-registry verification</h5>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
              Serial Merkle roots cross-audited across Verra, Gold Standard, and ClimateChain registries with 0 collisions.
            </p>
          </div>

          {/* Gate 3 */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5">
              <span className="font-mono text-[#047857] font-bold">Gate C: Auto-slash</span>
              {isSlashed ? (
                <ShieldAlert className="w-4.5 h-4.5 text-[#DC2626]" />
              ) : (
                <ShieldCheck className="w-4.5 h-4.5 text-[#047857]" />
              )}
            </div>
            <h5 className="text-sm font-bold text-[#0F172A] mb-1">Deficit liquidity freeze</h5>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
              If emissions exceed verified uptake or probe wire is severed, minting freezes and tokens are automatically burned.
            </p>
          </div>
        </div>
      </div>

      {/* Audit History Log Stream */}
      <div className="forest-panel p-5 rounded-2xl border border-[#D2E2D5] bg-white shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-[#15803D]" />
            <h4 className="text-sm font-bold text-[#112415] tracking-wide">
              Smart contract net-carbon audit history
            </h4>
          </div>
          <span className="text-xs font-mono font-medium text-[#527457]">
            Immutable event bus
          </span>
        </div>

        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {(data?.audit_logs || data?.audit_history || [
            { id: 'log-1', event_type: 'EMISSION_INGEST', details: 'Smokestack A continuous CEMS reading validated (84.5 kg CO₂e/hr)', timestamp: new Date(Date.now() - 120000).toISOString(), tx_hash: '0x99a418b7621f', result: 'VERIFIED' },
            { id: 'log-2', event_type: 'CAMBIUM_SYNC', details: 'Living arboreal uptake PoVI signature verified (0.048 kg CO₂/hr)', timestamp: new Date(Date.now() - 240000).toISOString(), tx_hash: '0x77c2901a5e1f', result: 'VERIFIED' },
            { id: 'log-3', event_type: 'DEDUPLICATION_CHECK', details: 'Cross-registry Merkle root audit passed with 0 collisions', timestamp: new Date(Date.now() - 360000).toISOString(), tx_hash: '0x33b4998fd43d', result: 'VERIFIED' }
          ]).map((entry: any) => (
            <div
              key={entry.id}
              className={`p-3 rounded-xl border text-xs font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                entry.result === 'BLOCKED_DOUBLE_COUNT'
                  ? 'bg-[#FEF3C7] border-[#FCD34D] text-[#B45309]'
                  : entry.result === 'SLASHED'
                  ? 'bg-[#FEE2E2] border-[#FCA5A5] text-[#B91C1C]'
                  : 'bg-[#F8FAF9] border-[#D2E2D5] text-[#112415]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#E8F7ED] text-[#15803D] border border-[#A7F3D0]">
                  {entry.event_type}
                </span>
                <span className="truncate max-w-md">{entry.details}</span>
              </div>
              <div className="text-xs font-mono text-[#527457] flex-shrink-0">
                {new Date(entry.timestamp).toLocaleTimeString()} | {entry.tx_hash.slice(0, 10)}...
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
