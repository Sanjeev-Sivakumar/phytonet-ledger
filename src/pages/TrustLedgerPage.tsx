import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Hash,
  Clock,
  Layers,
  ArrowRight,
  CheckCircle2,
  XCircle,
  FileCode,
  Zap,
  Sparkles,
  Lock,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { LedgerState, LedgerBlock } from '../types';
import { mineBlock } from '../services/api';

interface TrustLedgerPageProps {
  ledgerState: LedgerState | null;
  onRefreshLedger: () => void;
}

export const TrustLedgerPage: React.FC<TrustLedgerPageProps> = ({
  ledgerState,
  onRefreshLedger
}) => {
  const [selectedBlock, setSelectedBlock] = useState<LedgerBlock | null>(null);
  const [isMining, setIsMining] = useState<boolean>(false);

  const handleManualMine = async () => {
    setIsMining(true);
    try {
      await mineBlock();
      onRefreshLedger();
    } catch (err) {
      console.error('Mine block error:', err);
    } finally {
      setIsMining(false);
    }
  };

  const isSlashed = ledgerState?.is_slashed || false;
  const pipeline = ledgerState?.stage_gate_pipeline || ledgerState?.stage_gates;

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in">
      {/* Top Banner / Chain State Summary */}
      <div className="forest-panel p-4 sm:p-5 rounded border border-[#2E5A36]/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#A3C9A8]" />
            <h3 className="text-sm font-light tracking-wider uppercase text-[#E8EFE9]">
              Proof-of-Vascular-Integrity (PoVI) Cryptographic Ledger
            </h3>
          </div>
          <p className="text-xs font-light text-[#8FB996] mt-0.5">
            Decentralized biophysical consensus engine binding living cambium entropy to on-chain carbon tokens
          </p>
        </div>

        {/* Action: Manual Block Commit & Status */}
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-[10px] font-mono text-[#6D7B70]">CHAIN HEIGHT</div>
            <div className="text-sm font-mono text-[#A3C9A8]">
              #{ledgerState?.chain_height || ledgerState?.total_blocks || 1} BLOCKS
            </div>
          </div>

          <button
            onClick={handleManualMine}
            disabled={isMining}
            className="px-3 py-1.5 rounded bg-[#1E2B21] border border-[#4E8752]/50 hover:bg-[#2E5A36] text-[#E8EFE9] text-xs font-light flex items-center space-x-1.5 transition-all disabled:opacity-50"
          >
            <Lock className="w-3.5 h-3.5 text-[#A3C9A8]" />
            <span>{isMining ? 'Sealing...' : 'Seal Block'}</span>
          </button>
        </div>
      </div>

      {/* STAGE-GATE BLOCK VISUALIZER: Proof-of-Vascular-Integrity (PoVI) Pipeline */}
      <div className="forest-panel p-4 sm:p-5 rounded border border-[#2E5A36]/40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-[#A3C9A8]" />
            <h4 className="text-xs font-light tracking-wider uppercase text-[#8FB996]">
              PoVI Stage-Gate Validation Pipeline
            </h4>
          </div>
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded ${
              isSlashed
                ? 'bg-[#D34B4B]/20 text-[#D34B4B] border border-[#D34B4B]/40'
                : 'bg-[#1E2B21] text-[#A3C9A8] border border-[#4E8752]/40'
            }`}
          >
            {isSlashed ? 'GATE FAILED: ASSET BURNED' : 'ALL 4 GATES VERIFIED'}
          </span>
        </div>

        {/* 4 Pipeline Gate Nodes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Gate 1: Chaotic Nonce */}
          <div
            className={`p-3 rounded border transition-all ${
              pipeline?.gate1_chaos_nonce.passed
                ? 'bg-[#151D17] border-[#4E8752]/40 text-[#E8EFE9]'
                : 'bg-[#2A1515] border-[#D34B4B]/50 text-[#D34B4B]'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-mono text-[10px] text-[#8FB996]">STAGE 01</span>
              {pipeline?.gate1_chaos_nonce.passed ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4E8752]" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-[#D34B4B]" />
              )}
            </div>
            <h5 className="text-xs font-regular mb-1">Biological Nonce</h5>
            <p className="text-[10px] text-[#6D7B70] leading-tight">
              Harvests chaotic cambium micro-voltage quantum noise to generate unforgeable physical seeds.
            </p>
          </div>

          {/* Gate 2: Cellular Impedance */}
          <div
            className={`p-3 rounded border transition-all ${
              pipeline?.gate2_impedance_phase.passed
                ? 'bg-[#151D17] border-[#4E8752]/40 text-[#E8EFE9]'
                : 'bg-[#2A1515] border-[#D34B4B]/50 text-[#D34B4B]'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-mono text-[10px] text-[#8FB996]">STAGE 02</span>
              {pipeline?.gate2_impedance_phase.passed ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4E8752]" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-[#D34B4B]" />
              )}
            </div>
            <h5 className="text-xs font-regular mb-1">Impedance Phase Check</h5>
            <p className="text-[10px] text-[#6D7B70] leading-tight">
              Enforces Cole-Cole membrane bounds [10kΩ - 65kΩ] &amp; Δθ &gt; 2.5°. Detects severed wires or necrosis.
            </p>
          </div>

          {/* Gate 3: Gemini Oracle */}
          <div
            className={`p-3 rounded border transition-all ${
              pipeline?.gate3_gemini_oracle.passed
                ? 'bg-[#151D17] border-[#4E8752]/40 text-[#E8EFE9]'
                : 'bg-[#2A1515] border-[#D34B4B]/50 text-[#D34B4B]'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-mono text-[10px] text-[#8FB996]">STAGE 03</span>
              {pipeline?.gate3_gemini_oracle.passed ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4E8752]" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-[#D34B4B]" />
              )}
            </div>
            <h5 className="text-xs font-regular mb-1">Gemini AI Oracle</h5>
            <p className="text-[10px] text-[#6D7B70] leading-tight">
              Executes biophysical Farquhar carbon flux calculation and verifies empirical sequestration rate.
            </p>
          </div>

          {/* Gate 4: SHA-256 State Hash */}
          <div
            className={`p-3 rounded border transition-all ${
              pipeline?.gate4_state_hash.passed
                ? 'bg-[#151D17] border-[#4E8752]/40 text-[#E8EFE9]'
                : 'bg-[#2A1515] border-[#D34B4B]/50 text-[#D34B4B]'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-mono text-[10px] text-[#8FB996]">STAGE 04</span>
              {pipeline?.gate4_state_hash.passed ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4E8752]" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-[#D34B4B]" />
              )}
            </div>
            <h5 className="text-xs font-regular mb-1">SHA-256 State Hash</h5>
            <p className="text-[10px] text-[#6D7B70] leading-tight">
              Cryptographically chains previous block hash, Merkle tree root, and dynamic asset valuation.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Transaction Timeline Rows & Real-Time Audit Event Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Transaction Timeline Blocks (2 Cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-light tracking-wider uppercase text-[#8FB996]">
              Immutable Block Ledger Timeline
            </h4>
            <span className="text-[10px] font-mono text-[#6D7B70]">
              RECENT 10 BLOCKS
            </span>
          </div>

          <div className="space-y-2">
            {ledgerState?.recent_blocks?.map((block) => {
              const bHash = block.block_hash || block.hash || `0xBLOCK_${block.index}`;
              const isSelected = (selectedBlock?.block_hash || selectedBlock?.hash) === bHash;
              return (
                <div
                  key={bHash}
                  onClick={() => setSelectedBlock(isSelected ? null : block)}
                  className={`p-3 rounded border cursor-pointer transition-all ${
                    block.povi_status.includes('SLASH')
                      ? 'bg-[#251515] border-[#D34B4B]/50 text-[#E8EFE9]'
                      : 'bg-[#151D17] border-[#2E5A36]/30 text-[#E8EFE9] hover:bg-[#1A251D]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[#A3C9A8] font-regular">
                        #{block.index}
                      </span>
                      <span className="font-mono text-[11px] text-[#6D7B70] truncate max-w-[140px] sm:max-w-[200px]">
                        {bHash}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                          block.povi_status.includes('SLASH')
                            ? 'bg-[#D34B4B]/20 text-[#D34B4B]'
                            : 'bg-[#1E2B21] text-[#A3C9A8]'
                        }`}
                      >
                        {block.povi_status.includes('SLASH') ? 'SLASHED / BURNED' : 'POVI VERIFIED'}
                      </span>
                      <span className="text-xs font-mono text-[#E8EFE9]">
                        ${block.dynamic_asset_valuation.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-[#6D7B70]">
                    <span className="truncate max-w-[180px]">
                      NONCE: {block.biological_nonce}
                    </span>
                    <span>{new Date(block.timestamp).toLocaleTimeString()}</span>
                  </div>

                  {/* Expanded Raw Cryptographic Block Proof */}
                  {isSelected && (
                    <div className="mt-3 p-2.5 rounded bg-[#111612] border border-[#2E5A36]/40 text-[10px] font-mono text-[#A3C9A8] space-y-1">
                      <div>PREV_HASH: <span className="text-[#6D7B70]">{block.previous_hash}</span></div>
                      <div>MERKLE_ROOT: <span className="text-[#6D7B70]">{block.merkle_root}</span></div>
                      <div>CARBON_FLUX: <span className="text-[#E8EFE9]">{block.carbon_sequestration_g_hr} gCO₂/hr</span></div>
                      <div>MINT_RATE: <span className="text-[#E8EFE9]">{block.token_mint_rate} PNL/hr</span></div>
                      <div>ORACLE_MODEL: <span className="text-[#E8EFE9]">{block.oracle_model || 'gemini-3.8-flash'}</span></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Real-Time Audit Event Ledger (1 Col) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-light tracking-wider uppercase text-[#8FB996]">
              Real-Time Audit Event Ledger
            </h4>
            <span className="text-[10px] font-mono text-[#6D7B70]">
              IMMUTABLE LOGS
            </span>
          </div>

          <div className="forest-panel p-3 rounded border border-[#2E5A36]/40 max-h-[460px] overflow-y-auto space-y-2">
            {(ledgerState?.audit_logs || ledgerState?.audit_ledger || [])?.map((event: any) => (
              <div
                key={event.id}
                className={`p-2 rounded border text-[11px] font-light leading-snug ${
                  event.severity === 'CRITICAL'
                    ? 'bg-[#2A1515] border-[#D34B4B]/40 text-[#D34B4B]'
                    : event.severity === 'INFO'
                    ? 'bg-[#151D17] border-[#2E5A36]/30 text-[#8FB996]'
                    : 'bg-[#18231B] border-[#4E8752]/30 text-[#E8EFE9]'
                }`}
              >
                <div className="flex items-center justify-between text-[9px] font-mono mb-1">
                  <span className="text-[#6D7B70]">{event.type}</span>
                  <span className="text-[#6D7B70]">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p>{event.description}</p>
                <div className="mt-1 text-[9px] font-mono text-[#6D7B70] truncate">
                  HASH: {event.block_hash}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
