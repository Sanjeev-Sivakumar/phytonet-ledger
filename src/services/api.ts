/**
 * PhytoNet Ledger (PNL) — Production API & WebSocket Service
 * IEEE ClimateChain Global Hackathon — 5-Page Architecture
 */

import {
  TelemetryData,
  PoVIResult,
  GeminiEvaluation,
  ForecastData,
  PredictiveCarbonFluxResponse,
  EmissionsSnapshot,
  DPPItem,
  RecyclingTraceability,
  TradingState,
  LedgerState,
  TerminalLog,
  SampleDataset
} from '../types';

const API_BASE = '/api';

// --- Page 1: System Overview & Telemetry & Predictions ---
export async function fetchCurrentTelemetry(): Promise<{
  telemetry: TelemetryData;
  povi: PoVIResult;
  oracle: GeminiEvaluation | null;
}> {
  const res = await fetch(`${API_BASE}/telemetry/current`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchTelemetryHistory(): Promise<{ history: TelemetryData[] }> {
  const res = await fetch(`${API_BASE}/telemetry/history`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function setOperatingMode(mode: string): Promise<{ success: boolean; mode: string }> {
  const res = await fetch(`${API_BASE}/telemetry/mode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function evaluateGeminiOracle(): Promise<GeminiEvaluation> {
  const res = await fetch(`${API_BASE}/gemini/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchForecast(days: number = 90): Promise<ForecastData> {
  const res = await fetch(`${API_BASE}/gemini/forecast`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ days })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchPredictiveCarbonFlux(mode?: string, forceRefresh?: boolean): Promise<PredictiveCarbonFluxResponse> {
  const res = await fetch(`${API_BASE}/predict/carbon-flux`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode, forceRefresh })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// --- Page 2: Real-Time Emissions & Smart Contract Net Audits ---
export async function fetchEmissions(): Promise<EmissionsSnapshot> {
  const res = await fetch(`${API_BASE}/emissions/current`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function triggerDoubleCountAttempt(): Promise<any> {
  const res = await fetch(`${API_BASE}/emissions/trigger-double-count`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchLedgerState(): Promise<LedgerState> {
  const res = await fetch(`${API_BASE}/ledger/state`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function mineBlock(): Promise<any> {
  const res = await fetch(`${API_BASE}/ledger/mine`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// --- Page 3: Sustainable Supply Chains & Digital Product Passports (DPP) ---
export async function fetchDPPList(): Promise<{ passports: DPPItem[] }> {
  const res = await fetch(`${API_BASE}/dpp/list`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchRecyclingTraceability(): Promise<{ recycling: RecyclingTraceability }> {
  const res = await fetch(`${API_BASE}/dpp/recycling`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// --- Page 4: Carbon Trading Platform & Circular Incentives ---
export async function fetchTradingState(): Promise<TradingState> {
  const res = await fetch(`${API_BASE}/trading/state`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function executeOrder(type: 'buy' | 'sell', amount: number, price: number): Promise<any> {
  const res = await fetch(`${API_BASE}/trading/order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, amount, price, amountTons: amount, pricePnl: price })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function sendSerialTelemetryFrame(frame: any): Promise<any> {
  const res = await fetch(`${API_BASE}/telemetry/serial-frame`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(frame)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function claimRecyclingRewards(): Promise<any> {
  const res = await fetch(`${API_BASE}/trading/claim-rewards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// --- Page 5: Hardware Terminal & Diagnostics ---
export async function fetchTerminalLogs(): Promise<{ logs: TerminalLog[] }> {
  const res = await fetch(`${API_BASE}/terminal/logs`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function sendTerminalCommand(command: string): Promise<{
  success: boolean;
  reply: string;
  logs: TerminalLog[];
}> {
  const res = await fetch(`${API_BASE}/terminal/command`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchSampleSignals(): Promise<{ datasets: SampleDataset[] }> {
  const res = await fetch(`${API_BASE}/signals/samples`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function replayDataset(datasetId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/signals/replay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ datasetId })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function uploadCustomSignal(dataset: {
  name: string;
  data: any[];
  ambient?: any;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/signals/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dataset)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// --- WebSocket Streaming Subscription ---
export interface WsFrameData {
  type: string;
  telemetry: TelemetryData;
  povi: PoVIResult;
  valuation: number;
  mint_rate: number;
  is_slashed: boolean;
  block?: any;
  ledger?: LedgerState;
  evaluation?: GeminiEvaluation;
}

export function subscribeTelemetry(
  onFrame: (data: WsFrameData) => void,
  onStatusChange?: (connected: boolean) => void
): () => void {
  let socket: WebSocket | null = null;
  let isClosed = false;
  let pollInterval: any = null;

  function connect() {
    if (isClosed) return;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        onStatusChange?.(true);
        if (pollInterval) {
          clearInterval(pollInterval);
          pollInterval = null;
        }
      };

      socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          onFrame(parsed);
        } catch (e) {
          console.warn('[WS Parse Error]', e);
        }
      };

      socket.onclose = () => {
        onStatusChange?.(false);
        if (!isClosed) {
          if (!pollInterval) {
            pollInterval = setInterval(async () => {
              try {
                const res = await fetchCurrentTelemetry();
                onFrame({
                  type: 'TELEMETRY_FRAME',
                  telemetry: res.telemetry,
                  povi: res.povi,
                  valuation: res.povi.active_asset_valuation ?? 195.45,
                  mint_rate: res.povi.token_mint_rate ?? 2.45,
                  is_slashed: Boolean(res.povi.is_slashed ?? res.povi.slashed)
                });
              } catch (_) {}
            }, 500);
          }
          setTimeout(connect, 2000);
        }
      };

      socket.onerror = () => {
        socket?.close();
      };
    } catch (err) {
      setTimeout(connect, 3000);
    }
  }

  connect();

  return () => {
    isClosed = true;
    if (pollInterval) clearInterval(pollInterval);
    if (socket) socket.close();
  };
}
