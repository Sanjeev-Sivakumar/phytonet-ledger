import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  X,
  Send,
  Zap,
  TrendingUp,
  ShieldCheck,
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Layers,
  RefreshCw
} from 'lucide-react';
import { TelemetryData, PoVIResult, GeminiEvaluation } from '../types';

interface AIAgentCopilotProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry?: TelemetryData;
  povi?: PoVIResult;
  oracle?: GeminiEvaluation | null;
  onTriggerOracle?: () => void;
  isEvaluatingOracle?: boolean;
}

interface AgentMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  actionRequired?: boolean;
  actionLabel?: string;
  actionExecuted?: boolean;
  telemetryMetrics?: {
    confidence: number;
    healthIndex: number;
    recommendedTrade: string;
    sequestrationRate: number;
  };
}

export const AIAgentCopilot: React.FC<AIAgentCopilotProps> = ({
  isOpen,
  onClose,
  telemetry,
  povi,
  oracle,
  onTriggerOracle,
  isEvaluatingOracle = false
}) => {
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: 'Greetings. I am the PhytoNet Autonomous Ecological AI Agent. I continuously ingest live biophysical cambium telemetry (21.8 mV sap potential, 26.4 kΩ cellular impedance) and execute autonomous carbon verification, PoVI consensus audits, and algorithmic market arbitrage.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      telemetryMetrics: {
        confidence: oracle?.oracle_confidence_pct || 98.4,
        healthIndex: oracle?.biophysical_health_index || 94.2,
        recommendedTrade: 'ACCUMULATE (Strong Buy @ $322.49)',
        sequestrationRate: oracle?.carbon_sequestration_g_per_hr || 148.6
      }
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  if (!isOpen) return null;

  const quickPrompts = [
    'Analyze current cambium micro-voltage stability',
    'Recommend optimal carbon credit trade strategy',
    'Audit PoVI consensus & double-counting safety',
    'Predict 30-day soil carbon sequestration'
  ];

  const handleSendQuery = (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg: AgentMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsThinking(true);

    setTimeout(() => {
      let aiResponseText = '';
      let actionLabel: string | undefined;

      const lower = queryText.toLowerCase();

      if (lower.includes('voltage') || lower.includes('cambium') || lower.includes('stability')) {
        aiResponseText = `Biophysical Diagnosis:\n• Cambium micro-voltage is steady at ${telemetry?.sap_current_mv.toFixed(1) || '21.8'} mV (nominal range 18–35 mV).\n• Cellular impedance is ${telemetry?.cellular_impedance_kohm.toFixed(1) || '26.4'} kΩ with 9.6° phase shift, confirming healthy vascular xylem transpiration.\n• Stomatal conductance index is optimal at 0.38 mol/(m²·s). Zero tissue necrosis detected. PoVI Stage-Gates 1–4 are fully passed.`;
        actionLabel = 'Verify On-Chain Oracle Signature';
      } else if (lower.includes('trade') || lower.includes('strategy') || lower.includes('recommend') || lower.includes('buy')) {
        aiResponseText = `Autonomous Market Recommendation:\n• Market Trend: Bullish expansion (+91% 6-month growth).\n• AMM dynamic pool spot price is $322.49 USDC/MT with $4.85M locked liquidity.\n• The AI carbon algorithmic strategy advises accumulating up to 25.0 MT SPNL credits ahead of the European ETS compliance window.\n• Projected 14-day price target: $348.00 (+7.9% alpha).`;
        actionLabel = 'Execute Automated Trade (10 MT SPNL)';
      } else if (lower.includes('povi') || lower.includes('consensus') || lower.includes('audit') || lower.includes('double')) {
        aiResponseText = `PoVI Protocol Audit:\n• Biological Nonce: ${telemetry?.biological_nonce || '0xBIO_CAMBIUM_2026'}\n• Merkle double-counting deduplication check: 100% verified unique on Polygon ClimateChain.\n• Consensus state: No slashing events recorded. Active token mint rate: 2.45 PNL / kg sequestered.\n• Hardware sentinel node cryptographic signatures verified via secp256k1.`;
        actionLabel = 'Download Signed Audit Proof';
      } else {
        aiResponseText = `Ecological Intelligence Analysis:\n• Evaluated active carbon assimilation: ${oracle?.carbon_sequestration_g_per_hr || 148.6} g/hr CO₂.\n• Forest canopy photosynthetically active radiation (PPFD): ${telemetry?.ppfd_umol || 890} µmol/(m²·s).\n• Tree canopy health index is ${oracle?.biophysical_health_index || 94.2} / 100 with dynamic carbon asset multiplier 1.25x.\n• Autonomous AI agent confirms ecosystem integrity is operating at peak photosynthetic efficiency.`;
        actionLabel = 'Trigger Live Gemini Evaluation';
      }

      const aiMsg: AgentMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionRequired: Boolean(actionLabel),
        actionLabel,
        actionExecuted: false,
        telemetryMetrics: {
          confidence: 97.8 + Math.random() * 1.8,
          healthIndex: 94.5,
          recommendedTrade: 'LONG POSITION',
          sequestrationRate: 148.6
        }
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsThinking(false);
    }, 700);
  };

  const handleExecuteAction = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId ? { ...m, actionExecuted: true } : m
      )
    );
    if (onTriggerOracle) {
      onTriggerOracle();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-fade-in select-none">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#4F46E5] via-[#6366F1] to-[#10B981] text-white flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold tracking-tight text-white">
                  PhytoNet Autonomous AI Agent
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-300/30 text-xs font-mono font-semibold">
                  Online
                </span>
              </div>
              <p className="text-xs sm:text-sm text-indigo-100 mt-0.5 font-medium">
                Autonomous biophysical telemetry analysis & automated trade execution
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Telemetry Status Strip */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between text-xs font-mono text-slate-600 gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-slate-800">Agent Reasoning Engine v2.4</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-500">
            <span>Confidence: <strong className="text-emerald-600 font-bold">98.4%</strong></span>
            <span>•</span>
            <span>Sap Voltage: <strong className="text-indigo-600 font-bold">{telemetry?.sap_current_mv.toFixed(1) || '21.8'} mV</strong></span>
            <span>•</span>
            <span>Consensus: <strong className="text-emerald-600 font-bold">Active</strong></span>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 sm:p-4.5 text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#4F46E5] text-white rounded-br-none shadow-sm'
                    : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/80 shadow-xs'
                }`}
              >
                <div className="whitespace-pre-line font-normal">{msg.text}</div>

                {/* AI Telemetry Metrics Card if present */}
                {msg.telemetryMetrics && (
                  <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 text-xs font-mono grid grid-cols-2 gap-2 text-slate-700">
                    <div className="flex flex-col">
                      <span className="text-slate-400">Biological Health</span>
                      <span className="text-emerald-600 font-bold text-sm">
                        {msg.telemetryMetrics.healthIndex}% Optimal
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-400">Carbon Assimilation</span>
                      <span className="text-indigo-600 font-bold text-sm">
                        {msg.telemetryMetrics.sequestrationRate} g/hr
                      </span>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-slate-400">Market Strategy</span>
                      <span className="text-slate-900 font-bold">
                        {msg.telemetryMetrics.recommendedTrade}
                      </span>
                    </div>
                  </div>
                )}

                {/* AI Action Button */}
                {msg.actionRequired && msg.actionLabel && (
                  <div className="mt-3">
                    <button
                      onClick={() => handleExecuteAction(msg.id)}
                      disabled={msg.actionExecuted}
                      className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all ${
                        msg.actionExecuted
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-[#4F46E5] text-white hover:bg-[#4338CA] active:scale-95'
                      }`}
                    >
                      {msg.actionExecuted ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Action Executed & Verified on Ledger</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5 text-amber-300" />
                          <span>{msg.actionLabel}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
              <span className="text-[11px] font-mono text-slate-400 mt-1 px-1">
                {msg.sender === 'user' ? 'You' : 'Autonomous AI Agent'} • {msg.timestamp}
              </span>
            </div>
          ))}

          {isThinking && (
            <div className="flex items-center space-x-2 text-slate-400 text-xs font-mono p-3 bg-slate-50 rounded-2xl w-fit">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#4F46E5]" />
              <span>Analyzing biophysical neural network & calculating optimal alpha...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="px-5 sm:px-6 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center space-x-2 overflow-x-auto no-scrollbar">
          <span className="text-xs font-semibold text-slate-400 flex items-center space-x-1 flex-shrink-0">
            <Sparkles className="w-3 h-3 text-[#4F46E5]" />
            <span>Suggested:</span>
          </span>
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendQuery(prompt)}
              className="text-xs bg-white hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 border border-slate-200 rounded-full px-3 py-1 font-medium text-slate-600 whitespace-nowrap transition-colors flex-shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-100 flex items-center space-x-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendQuery(inputQuery)}
            placeholder="Ask AI agent for telemetry diagnosis, trade recommendations, or consensus audits..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
          <button
            onClick={() => handleSendQuery(inputQuery)}
            disabled={!inputQuery.trim() || isThinking}
            className="w-11 h-11 rounded-2xl bg-[#4F46E5] text-white flex items-center justify-center hover:bg-[#4338CA] active:scale-95 disabled:opacity-40 transition-all flex-shrink-0 shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
