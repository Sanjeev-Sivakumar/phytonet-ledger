import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  Play,
  CheckCircle2,
  Sliders,
  Layers,
  Database,
  Compass
} from 'lucide-react';
import { TelemetryData, SampleDataset } from '../types';
import { fetchSampleSignals, replayDataset, uploadCustomSignal } from '../services/api';

interface AnalyticsPageProps {
  telemetry: TelemetryData;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ telemetry }) => {
  const [datasets, setDatasets] = useState<SampleDataset[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('douglas_fir_cambium_01');
  const [activeReplayName, setActiveReplayName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchSampleSignals()
      .then((res) => {
        if (res.datasets && res.datasets.length > 0) {
          setDatasets(res.datasets);
        }
      })
      .catch((err) => console.warn('Sample signals fetch error:', err));
  }, []);

  const handleReplay = async (id: string) => {
    try {
      const res = await replayDataset(id);
      setActiveReplayName(res.dataset.name);
      setUploadStatus(`Replaying: ${res.dataset.name}`);
    } catch (err: any) {
      setUploadStatus(`Error: ${err.message}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus(`Parsing ${file.name}...`);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        let dataPoints: any[] = [];

        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          dataPoints = Array.isArray(parsed) ? parsed : parsed.data || [];
        } else {
          // Parse CSV
          const lines = text.split('\n').filter((l) => l.trim().length > 0);
          const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
          dataPoints = lines.slice(1).map((line, idx) => {
            const vals = line.split(',').map((v) => parseFloat(v.trim()) || 0);
            return {
              timestamp_offset_s: idx * 5,
              sap_current_mv: vals[0] || 20.0,
              impedance_kohm: vals[1] || 25.0,
              phase_shift_deg: vals[2] || 9.5,
              ps_rate: vals[3] || 8.0,
              ambient_ppfd: vals[4] || 900
            };
          });
        }

        const res = await uploadCustomSignal({
          name: file.name,
          data: dataPoints
        });

        setActiveReplayName(res.dataset.name);
        setUploadStatus(`Ingested ${dataPoints.length} points from ${file.name}`);
      } catch (err: any) {
        setUploadStatus(`Parse error: ${err.message}`);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsText(file);
  };

  // Cole-Cole dispersion calculation points
  const frequencies = [100, 250, 500, 1000, 2500, 5000, 10000];
  const coleColePoints = frequencies.map((freq) => {
    const w = 2 * Math.PI * freq;
    // Approximated plant tissue impedance dispersion
    const rInf = 8.5; // High frequency apoplast resistance
    const r0 = 42.0;  // Low frequency intracellular resistance
    const tau = 0.00018; // Membrane time constant
    const alpha = 0.72;  // Tissue distribution parameter
    const denom = 1 + Math.pow(w * tau, alpha);
    const zReal = rInf + (r0 - rInf) / denom;
    const zImag = ((r0 - rInf) * Math.pow(w * tau, alpha * 0.5)) / (2 * denom);
    return { freq, zReal, zImag };
  });

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in">
      {/* Top Banner / Ingest Status */}
      <div className="forest-panel p-4 rounded border border-[#2E5A36]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-[#A3C9A8]" />
            <h3 className="text-sm font-light tracking-wider uppercase text-[#E8EFE9]">
              Vascular Biophysics &amp; Cellular Impedance Spectroscopy
            </h3>
          </div>
          <p className="text-xs font-light text-[#8FB996] mt-0.5">
            Active Cole-Cole apoplast/symplast dispersion analyzer and pre-recorded telemetry replay engine
          </p>
        </div>

        {activeReplayName && (
          <div className="flex items-center space-x-2 px-3 py-1 rounded bg-[#1E2B21] border border-[#4E8752]/50 text-xs text-[#A3C9A8]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#4E8752]" />
            <span className="font-mono truncate max-w-[220px]">
              Active Ingest: {activeReplayName}
            </span>
          </div>
        )}
      </div>

      {/* Grid: Cole-Cole Nyquist & Phase Spectroscopy (Daylight High-Contrast Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Panel 1: Cole-Cole Cellular Dispersion (Nyquist Plot Representation) */}
        <div className="daylight-chart-panel p-4 rounded border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="chart-title text-xs tracking-wider uppercase">
                Cole-Cole Tissue Impedance Arc (Nyquist Z' vs Z'')
              </h4>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#DCE8DE] text-[#0F1611]">
                100 Hz - 10 kHz SWEEP
              </span>
            </div>
            <p className="chart-meta text-[11px] mb-3">
              Real Resistance R_apoplast vs Imaginary Reactance X_membrane across cambium cell walls.
            </p>

            {/* Custom SVG Nyquist Arc Plot */}
            <div className="w-full h-44 bg-[#F2F7F3] rounded border border-[#D5E2D7] p-2 relative flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 320 140">
                {/* Grid Lines */}
                <line x1="30" y1="120" x2="300" y2="120" stroke="#CBDACD" strokeWidth="1" />
                <line x1="30" y1="20" x2="30" y2="120" stroke="#CBDACD" strokeWidth="1" />
                <line x1="30" y1="70" x2="300" y2="70" stroke="#E2ECE3" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="165" y1="20" x2="165" y2="120" stroke="#E2ECE3" strokeWidth="1" strokeDasharray="3,3" />

                {/* Semicircular Cole-Cole Arc */}
                <path
                  d="M 50 120 A 110 90 0 0 1 270 120"
                  fill="none"
                  stroke="#2E5A36"
                  strokeWidth="2.5"
                />

                {/* Frequency Dots */}
                <circle cx="50" cy="120" r="4" fill="#0F1611" />
                <text x="35" y="134" fontSize="8" fill="#3D4A40" fontFamily="Roboto">10kHz (R∞)</text>

                <circle cx="160" cy="30" r="5" fill="#2E5A36" />
                <circle cx="160" cy="30" r="8" fill="none" stroke="#2E5A36" strokeWidth="1" opacity="0.6" />
                <text x="145" y="20" fontSize="9" fontWeight="bold" fill="#0F1611" fontFamily="Roboto">
                  1.0 kHz (Current: {telemetry.cellular_impedance_kohm.toFixed(1)}kΩ)
                </text>

                <circle cx="270" cy="120" r="4" fill="#0F1611" />
                <text x="250" y="134" fontSize="8" fill="#3D4A40" fontFamily="Roboto">100Hz (R₀)</text>
              </svg>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-[#D5E2D7] grid grid-cols-3 gap-2 text-[10px] font-mono text-[#3D4A40]">
            <div>R∞ (EXTRACELLULAR): <span className="text-[#0F1611] font-regular">8.5 kΩ</span></div>
            <div>R₀ (TOTAL TISSUE): <span className="text-[#0F1611] font-regular">42.0 kΩ</span></div>
            <div>CURRENT Z: <span className="text-[#2E5A36] font-regular">{telemetry.cellular_impedance_kohm.toFixed(1)} kΩ</span></div>
          </div>
        </div>

        {/* Panel 2: Phase Shift Angle vs Transpiration Velocity */}
        <div className="daylight-chart-panel p-4 rounded border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="chart-title text-xs tracking-wider uppercase">
                Phase Shift Metrics &amp; Cambium Transpiration
              </h4>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#DCE8DE] text-[#0F1611]">
                Δθ = {telemetry.phase_shift_deg.toFixed(1)}°
              </span>
            </div>
            <p className="chart-meta text-[11px] mb-3">
              Correlation between capacitive membrane phase lag and sap ionic flow velocity.
            </p>

            <div className="space-y-3">
              {/* Metric bar 1 */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#3D4A40]">Reactive Capacitive Shift (Δθ)</span>
                  <span className="font-mono text-[#0F1611] font-regular">
                    {telemetry.phase_shift_deg.toFixed(2)}°
                  </span>
                </div>
                <div className="w-full bg-[#DCE8DE] h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2E5A36] rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (telemetry.phase_shift_deg / 15) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Metric bar 2 */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#3D4A40]">Apoplastic Electrolyte Conductivity</span>
                  <span className="font-mono text-[#0F1611] font-regular">
                    {(48.5 - telemetry.cellular_impedance_kohm * 0.4).toFixed(1)} µS/cm
                  </span>
                </div>
                <div className="w-full bg-[#DCE8DE] h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#4E8752] rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (telemetry.cellular_impedance_kohm / 50) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Metric bar 3 */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#3D4A40]">Hydraulic Transpiration Velocity</span>
                  <span className="font-mono text-[#0F1611] font-regular">
                    {(16.2 + telemetry.sap_current_mv * 0.35).toFixed(1)} cm/hr
                  </span>
                </div>
                <div className="w-full bg-[#DCE8DE] h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1E6E38] rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, ((16.2 + telemetry.sap_current_mv * 0.35) / 40) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-[#D5E2D7] text-[10px] font-mono text-[#4A594D]">
            MODEL: Granier Thermal Dissipation &amp; Dual-Probe EIS calibration
          </div>
        </div>
      </div>

      {/* Custom File Ingest Mock Component & Pre-Recorded Signal Replay Engine */}
      <div className="forest-panel p-4 sm:p-5 rounded border border-[#2E5A36]/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-[#A3C9A8]" />
            <h4 className="text-xs font-light tracking-wider uppercase text-[#8FB996]">
              Pre-Recorded Raw Plant Signal Ingest &amp; Field Replay
            </h4>
          </div>
          <span className="text-[10px] font-mono text-[#6D7B70]">
            IEEE CLIMATECHAIN ARBOREAL BENCHMARKS
          </span>
        </div>

        {/* 3 Pre-Recorded Datasets Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {datasets.map((d) => (
            <div
              key={d.id}
              className={`p-3 rounded border transition-all ${
                selectedDatasetId === d.id
                  ? 'bg-[#1E2B21] border-[#4E8752] text-[#E8EFE9]'
                  : 'bg-[#151D17] border-[#2E5A36]/30 text-[#8FB996] hover:bg-[#1A251D]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h5 className="text-xs font-regular text-[#E8EFE9] line-clamp-1">
                    {d.name.split('(')[0]}
                  </h5>
                  <p className="text-[10px] italic text-[#6D7B70] mt-0.5">
                    {d.species}
                  </p>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#111612] text-[#A3C9A8]">
                  {d.data?.length || 0} pts
                </span>
              </div>

              <div className="mt-2 text-[10px] font-mono text-[#6D7B70] space-y-0.5">
                <div>PAR: {d.ambient.ppfd_umol} µmol/m²s</div>
                <div>Temp: {d.ambient.temperature_c}°C | RH: {d.ambient.humidity_pct}%</div>
              </div>

              <button
                onClick={() => {
                  setSelectedDatasetId(d.id);
                  handleReplay(d.id);
                }}
                className="mt-3 w-full py-1.5 px-2 rounded bg-[#2E5A36]/60 hover:bg-[#2E5A36] text-[#E8EFE9] text-[11px] font-light flex items-center justify-center space-x-1.5 transition-all"
              >
                <Play className="w-3 h-3 text-[#A3C9A8]" />
                <span>Replay Telemetry</span>
              </button>
            </div>
          ))}
        </div>

        {/* Upload Custom CSV/JSON Array Area */}
        <div className="p-4 rounded border border-dashed border-[#2E5A36]/50 bg-[#121914] flex flex-col items-center justify-center text-center">
          <UploadCloud className="w-6 h-6 text-[#A3C9A8] mb-1.5" />
          <h5 className="text-xs font-light text-[#E8EFE9]">
            Upload Custom Plant Signal Array (CSV or JSON)
          </h5>
          <p className="text-[11px] text-[#6D7B70] max-w-md my-1">
            Accepts time-series arrays containing micro-voltage sap spikes (mV), cellular impedance (kΩ), and photosynthetic wave metrics.
          </p>

          <label className="mt-2 inline-flex items-center space-x-2 px-3 py-1.5 rounded bg-[#1E2B21] border border-[#4E8752]/50 text-xs text-[#A3C9A8] hover:bg-[#2E5A36] hover:text-[#E8EFE9] cursor-pointer transition-all">
            <FileText className="w-3.5 h-3.5" />
            <span>Select File (.csv, .json)</span>
            <input
              type="file"
              accept=".csv,.json"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading}
            />
          </label>

          {uploadStatus && (
            <div className="mt-2 text-[10px] font-mono text-[#A3C9A8]">
              {uploadStatus}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
