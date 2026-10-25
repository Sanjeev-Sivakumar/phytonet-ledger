import React, { useState, useEffect } from 'react';
import { SidebarNav } from './components/SidebarNav';
import { DashboardTopBar } from './components/DashboardTopBar';
import { AIAgentCopilot } from './components/AIAgentCopilot';
import { AnomalyController } from './components/AnomalyController';
import { NavTabType } from './components/TopNav';
import { OverviewPage } from './pages/OverviewPage';
import { EmissionsVerificationPage } from './pages/EmissionsVerificationPage';
import { SupplyChainDPPPage } from './pages/SupplyChainDPPPage';
import { CircularTradingPage } from './pages/CircularTradingPage';
import { HardwareTerminalPage } from './pages/HardwareTerminalPage';
import { EvidencePage } from './pages/EvidencePage';
import {
  TelemetryData,
  PoVIResult,
  GeminiEvaluation,
  LedgerState
} from './types';
import {
  subscribeTelemetry,
  fetchCurrentTelemetry,
  fetchTelemetryHistory,
  fetchLedgerState,
  evaluateGeminiOracle,
  setOperatingMode
} from './services/api';
import { X, BookOpen, ExternalLink, ShieldCheck } from 'lucide-react';

const getInitialTab = (): NavTabType => {
  try {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['overview', 'emissions', 'supplychain', 'trading', 'terminal', 'evidence'].includes(tabParam)) {
      return tabParam as NavTabType;
    }
    const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
    if (path === 'emissions') return 'emissions';
    if (path === 'supplychain' || path === 'supply-chain') return 'supplychain';
    if (path === 'trading') return 'trading';
    if (path === 'terminal') return 'terminal';
    if (path === 'evidence') return 'evidence';
  } catch (e) {}
  return 'overview';
};

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTabType>(getInitialTab);
  const [connected, setConnected] = useState<boolean>(false);
  const [isEvaluatingOracle, setIsEvaluatingOracle] = useState<boolean>(false);
  const [isAiAgentOpen, setIsAiAgentOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isDocsOpen, setIsDocsOpen] = useState<boolean>(false);

  // Core Telemetry State
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    seq: 1000,
    timestamp: new Date().toISOString(),
    sap_current_mv: 21.8,
    cellular_impedance_kohm: 26.4,
    phase_shift_deg: 9.6,
    photosynthesis_rate_ps: 8.4,
    temp_c: 22.1,
    humidity_pct: 68.4,
    ppfd_umol: 890.0,
    biological_nonce: '0xBIO_CAMBIUM_INIT',
    povi_valid: true,
    failure_mode: 'NONE',
    operating_mode: 'NORMAL'
  });

  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryData[]>([]);

  const [povi, setPoVI] = useState<PoVIResult>({
    povi_valid: true,
    is_slashed: false,
    success: true,
    status: 'VERIFIED_VASCULAR_INTEGRITY',
    slashed: false,
    active_asset_valuation: 322.49,
    token_mint_rate: 2.45
  });

  const [oracle, setOracle] = useState<GeminiEvaluation | null>(null);
  const [ledgerState, setLedgerState] = useState<LedgerState | null>(null);

  // Initial Data Hydration
  useEffect(() => {
    fetchCurrentTelemetry()
      .then((res) => {
        setTelemetry(res.telemetry);
        setPoVI(res.povi);
        if (res.oracle) setOracle(res.oracle);
      })
      .catch((err) => console.warn('Init telemetry notice:', err));

    fetchTelemetryHistory()
      .then((res) => {
        if (res.history) setTelemetryHistory(res.history);
      })
      .catch((err) => console.warn('Init history notice:', err));

    fetchLedgerState()
      .then((res) => setLedgerState(res))
      .catch((err) => console.warn('Init ledger notice:', err));
  }, []);

  // Real-Time WebSocket Telemetry Subscription (5 Hz)
  useEffect(() => {
    const unsubscribe = subscribeTelemetry(
      (frame) => {
        if (frame.type === 'TELEMETRY_FRAME') {
          setTelemetry(frame.telemetry);
          setPoVI(frame.povi);
          setTelemetryHistory((prev) => {
            const next = [...prev, frame.telemetry];
            return next.length > 60 ? next.slice(next.length - 60) : next;
          });
        } else if (frame.type === 'BLOCK_COMMITTED') {
          if (frame.evaluation) setOracle(frame.evaluation);
          if (frame.ledger) setLedgerState(frame.ledger);
        }
      },
      (isConnected) => {
        setConnected(isConnected);
      }
    );

    return () => unsubscribe();
  }, []);

  // Periodic Ledger State Sync (every 6 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLedgerState()
        .then((res) => setLedgerState(res))
        .catch(() => {});
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Sync tab with URL navigation
  useEffect(() => {
    const handleUrlChange = () => {
      setActiveTab(getInitialTab());
    };
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  // Fast Oracle Recalculation Trigger
  const handleTriggerOracle = async () => {
    setIsEvaluatingOracle(true);
    try {
      const evaluation = await evaluateGeminiOracle();
      setOracle(evaluation);
      const ledger = await fetchLedgerState();
      setLedgerState(ledger);
    } catch (err) {
      console.error('Trigger oracle error:', err);
    } finally {
      setIsEvaluatingOracle(false);
    }
  };

  // Operational Mode / Anomaly Injection Handler
  const handleSetMode = async (mode: string) => {
    try {
      await setOperatingMode(mode);
    } catch (err) {
      console.error('Set mode error:', err);
    }
  };

  const isSlashed = Boolean(povi.is_slashed ?? povi.slashed ?? ledgerState?.is_slashed ?? false);
  const valuation = isSlashed ? 0.0 : povi.active_asset_valuation || 322.49;
  const mintRate = isSlashed ? 0.0 : povi.token_mint_rate || 2.45;

  return (
    <div className="min-h-screen bg-[#F4F5F9] text-slate-800 flex flex-col md:flex-row selection:bg-indigo-100 selection:text-indigo-900 font-sans">
      {/* 1. Left Sidebar Navigation matching Image 2 */}
      <SidebarNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAiAgent={() => setIsAiAgentOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenDocs={() => setIsDocsOpen(true)}
      />

      {/* 2. Main Dashboard Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0 p-4 sm:p-6 md:p-8 lg:p-10 overflow-y-auto">
        {/* Top Header Bar matching Image 2 */}
        <DashboardTopBar
          activeTab={activeTab}
          connected={connected}
          isSlashed={isSlashed}
          onRefreshOracle={handleTriggerOracle}
          isEvaluatingOracle={isEvaluatingOracle}
          onOpenAiAgent={() => setIsAiAgentOpen(true)}
        />

        {/* Dynamic Pages */}
        <main className="flex-1 w-full">
          {/* Page 1: Overview */}
          {activeTab === 'overview' && (
            <OverviewPage
              telemetry={telemetry}
              telemetryHistory={telemetryHistory}
              povi={povi}
              valuation={valuation}
              mintRate={mintRate}
              isSlashed={isSlashed}
              oracle={oracle}
              onSetMode={handleSetMode}
              onTriggerOracle={handleTriggerOracle}
              isEvaluatingOracle={isEvaluatingOracle}
            />
          )}

          {/* Page 2: Emissions Verification */}
          {activeTab === 'emissions' && (
            <EmissionsVerificationPage
              telemetry={telemetry}
              isSlashed={isSlashed}
            />
          )}

          {/* Page 3: Digital Product Passports (DPP) */}
          {activeTab === 'supplychain' && (
            <SupplyChainDPPPage />
          )}

          {/* Page 4: Carbon Trading & Dashboard (Image 2 Match) */}
          {activeTab === 'trading' && (
            <CircularTradingPage />
          )}

          {/* Page 5: Hardware Terminal */}
          {activeTab === 'terminal' && (
            <HardwareTerminalPage />
          )}

          {/* Page 6: Evidence & Security Audit */}
          {activeTab === 'evidence' && (
            <EvidencePage />
          )}
        </main>

        {/* Minimal Bottom Bar */}
        <footer className="mt-10 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2 font-mono">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700">PhytoNet Ledger</span>
            <span>•</span>
            <span>IEEE ClimateChain Hackathon</span>
            <span>•</span>
            <span>ESP32 Cambium Node</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className={isSlashed ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
              {isSlashed ? 'Consensus exception' : 'PoVI Active (100% verified)'}
            </span>
            <span>•</span>
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
        </footer>
      </div>

      {/* 3. Interactive Autonomous AI Agent Modal */}
      <AIAgentCopilot
        isOpen={isAiAgentOpen}
        onClose={() => setIsAiAgentOpen(false)}
        telemetry={telemetry}
        povi={povi}
        oracle={oracle}
        onTriggerOracle={handleTriggerOracle}
        isEvaluatingOracle={isEvaluatingOracle}
      />

      {/* 4. Settings & Anomaly Controller Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in select-none">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                System Settings & Fault Simulation Matrix
              </h3>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <AnomalyController
              currentMode={telemetry.operating_mode || 'NORMAL'}
              onSetMode={(m) => {
                handleSetMode(m);
                setIsSettingsOpen(false);
              }}
              onTriggerOracle={handleTriggerOracle}
              isEvaluatingOracle={isEvaluatingOracle}
            />
          </div>
        </div>
      )}

      {/* 5. Protocol Documentation Modal */}
      {isDocsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in select-none">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  PhytoNet Ledger Protocol Architecture
                </h3>
              </div>
              <button
                onClick={() => setIsDocsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-sm text-slate-600 space-y-3 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
              <p>
                <strong>PhytoNet Ledger</strong> is a biological-physical blockchain system designed for the IEEE ClimateChain Hackathon. It converts living tree vascular xylem electrical activity into cryptographically secure carbon tokens (SPNL).
              </p>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-mono space-y-1">
                <div>• Consensus Mechanism: Proof of Vascular Integrity (PoVI)</div>
                <div>• Hardware Node: ESP32 dual stainless-steel cambium probe</div>
                <div>• Biological Nonce: Dynamic micro-voltage signature (21.8 mV)</div>
                <div>• AI Oracle: Autonomous multimodal Gemini ecological model</div>
              </div>
              <p>
                When vascular sap flow is verified, carbon credits are minted with cryptographic zero-knowledge proof of double-count prevention on Polygon ClimateChain.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsDocsOpen(false)}
                className="bg-slate-900 text-white px-5 py-2 rounded-2xl text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Close Documentation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
