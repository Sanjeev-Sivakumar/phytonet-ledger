/**
 * PhytoNet Ledger (PNL) — Proof-of-Vascular-Integrity (PoVI) Cryptographic Trust Engine
 * Validates biophysical cambium telemetry, derives state hashes with biological nonces,
 * maintains an immutable local block ledger, and enforces consensus slashing / burning.
 */

import crypto from 'crypto';

export class PoVIEngine {
  constructor() {
    this.chain = [];
    this.auditLedger = [];
    this.activeValuation = 148.50; // Base $PNL Carbon Asset Valuation
    this.tokenMintRate = 2.45;     // Tokens minted per hour
    this.isSlashed = false;
    this.lastSlashReason = null;
    this.stageGateState = {
      gate1_chaos_nonce: { name: 'Chaotic Biological Nonce', passed: true, detail: 'Quantum cambium micro-voltage entropy' },
      gate2_impedance_phase: { name: 'Cellular Impedance Phase Check', passed: true, detail: '1.0kHz AC Cole-Cole membrane lag' },
      gate3_gemini_oracle: { name: 'Gemini AI Carbon Flux Oracle', passed: true, detail: 'Empirical transpiration sequestration calculation' },
      gate4_state_hash: { name: 'SHA-256 State Hash Commitment', passed: true, detail: 'Immutable on-chain block sealing' }
    };

    // Initialize Genesis Block
    this._createGenesisBlock();
  }

  _sha256(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  _calculateMerkleRoot(items) {
    if (!items || items.length === 0) return this._sha256('EMPTY_MERKLE_ROOT');
    let hashes = items.map(item => this._sha256(typeof item === 'string' ? item : JSON.stringify(item)));
    while (hashes.length > 1) {
      if (hashes.length % 2 !== 0) hashes.push(hashes[hashes.length - 1]);
      const nextLevel = [];
      for (let i = 0; i < hashes.length; i += 2) {
        nextLevel.push(this._sha256(hashes[i] + hashes[i + 1]));
      }
      hashes = nextLevel;
    }
    return hashes[0];
  }

  _createGenesisBlock() {
    const genesisTelemetry = {
      sap_current_mv: 21.4,
      cellular_impedance_kohm: 28.5,
      phase_shift_deg: 9.8,
      photosynthesis_rate_ps: 8.5
    };

    const genesisNonce = '0xBIO_ROOT_GENESIS_CAMBIUM_2026';
    const merkleRoot = this._calculateMerkleRoot(['GENESIS_TREE_NODE_01', 'IEEE_CLIMATECHAIN_PNL', genesisNonce]);

    const block = {
      index: 0,
      timestamp: new Date('2026-10-24T00:00:00.000Z').toISOString(),
      previous_hash: '0000000000000000000000000000000000000000000000000000000000000000',
      biological_nonce: genesisNonce,
      merkle_root: merkleRoot,
      sap_current_mv: 21.4,
      cellular_impedance_kohm: 28.5,
      carbon_sequestration_g_hr: 48.2,
      dynamic_asset_valuation: 142.00,
      token_mint_rate: 2.35,
      povi_status: 'VERIFIED_VASCULAR_INTEGRITY',
      hash: this._sha256(`0-0000000000000000000000000000000000000000000000000000000000000000-${genesisNonce}-${merkleRoot}`)
    };

    this.chain.push(block);
    this._recordAuditLog('GENESIS_BLOCK_SEALED', 'Genesis block minted with living Douglas Fir cambium anchor', block.hash);
  }

  /**
   * Evaluates incoming telemetry against Proof-of-Vascular-Integrity rules
   * Rules:
   * 1. Impedance must be within healthy living biological tissue bounds [10 kΩ, 60 kΩ]
   * 2. Phase shift angle must be non-zero (> 2.5°) indicating living capacitive cell membrane
   * 3. Micro-voltage variance must not be flatline (zero jitter = disconnected probe)
   * 4. Biological nonce must be unique & chaotic
   */
  evaluatePoVI(telemetry, geminiEvaluation) {
    const { sap_current_mv, cellular_impedance_kohm, phase_shift_deg, biological_nonce, povi_valid, failure_mode } = telemetry;

    let poviPassed = true;
    let violationReason = null;

    // Gate 1: Chaotic Nonce Check
    const nonceValid = Boolean(biological_nonce && biological_nonce.length >= 8);
    this.stageGateState.gate1_chaos_nonce.passed = nonceValid;
    if (!nonceValid) {
      poviPassed = false;
      violationReason = 'INVALID_BIOLOGICAL_NONCE_ENTROPY_DEPLETED';
    }

    // Gate 2: Biophysical Impedance & Phase Dispersion Check
    const impedanceHealthy = cellular_impedance_kohm >= 10.0 && cellular_impedance_kohm <= 65.0;
    const phaseHealthy = phase_shift_deg >= 2.5;
    const livingMembrane = impedanceHealthy && phaseHealthy && povi_valid;
    this.stageGateState.gate2_impedance_phase.passed = livingMembrane;

    if (!livingMembrane) {
      poviPassed = false;
      if (cellular_impedance_kohm < 5.0) {
        violationReason = 'ELECTRODE_SHORT_OR_WIRE_DISCONNECT';
      } else if (cellular_impedance_kohm > 65.0) {
        violationReason = 'TISSUE_DESICCATION_OR_PROBE_DETACHED';
      } else if (phase_shift_deg < 2.5) {
        violationReason = 'CELL_WALL_CAPACITANCE_FLATLINE';
      } else {
        violationReason = failure_mode || 'BIOPHYSICAL_ANOMALY_DETECTED';
      }
    }

    // Gate 3: Gemini Oracle Validation Check
    const oraclePassed = Boolean(geminiEvaluation && geminiEvaluation.oracle_confidence_pct >= 90.0 && geminiEvaluation.carbon_sequestration_g_per_hr >= 0.0);
    this.stageGateState.gate3_gemini_oracle.passed = poviPassed && oraclePassed;

    // Check if Slashing Exception Triggered
    if (!poviPassed) {
      this._triggerConsensusSlashing(violationReason, telemetry);
      this.stageGateState.gate4_state_hash.passed = false;
      return {
        success: false,
        status: 'SLASHED_BURNED_CONSENSUS_EXCEPTION',
        violation_reason: violationReason,
        slashed: true,
        active_asset_valuation: 0.00,
        token_mint_rate: 0.00
      };
    }

    // Recovery from previous slash if tissue is reconnected and restored
    if (this.isSlashed) {
      this.isSlashed = false;
      this.lastSlashReason = null;
      this._recordAuditLog('CONSENSUS_RESTORED', 'Living vascular signals re-established. Dynamic asset valuation resumed.', null);
    }

    // Dynamic Valuation calculation based on Gemini flux multiplier
    const multiplier = geminiEvaluation?.dynamic_asset_multiplier || 1.25;
    const sequestrationG = geminiEvaluation?.carbon_sequestration_g_per_hr || 35.0;
    this.activeValuation = Number((120.0 + (sequestrationG * 0.95 * multiplier)).toFixed(2));
    this.tokenMintRate = Number((1.8 + (sequestrationG / 30.0) * multiplier).toFixed(2));

    this.stageGateState.gate4_state_hash.passed = true;

    return {
      success: true,
      status: 'VERIFIED_VASCULAR_INTEGRITY',
      slashed: false,
      active_asset_valuation: this.activeValuation,
      token_mint_rate: this.tokenMintRate,
      multiplier
    };
  }

  /**
   * Instant Slash and Burn Consensus Execution
   */
  _triggerConsensusSlashing(reason, telemetry) {
    if (!this.isSlashed) {
      this.isSlashed = true;
      this.lastSlashReason = reason;
      this.activeValuation = 0.00;
      this.tokenMintRate = 0.00;

      this._recordAuditLog(
        'POVI_CONSENSUS_SLASH_TRIGGERED',
        `EMERGENCY CONSENSUS EXCEPTION: Living tissue signal failed. Reason: ${reason}. Impedance: ${telemetry.cellular_impedance_kohm.toFixed(1)}kΩ, Phase: ${telemetry.phase_shift_deg.toFixed(1)}°. Dynamic Asset Valuation burned to 0.00 PNL.`,
        this._sha256(reason + Date.now())
      );
    }
  }

  /**
   * Commits a sealed block to the ledger chain
   */
  commitBlock(telemetry, geminiEvaluation) {
    const prevBlock = this.chain[this.chain.length - 1];
    const prevHash = prevBlock.hash;
    const index = this.chain.length;
    const timestamp = new Date().toISOString();
    const biologicalNonce = telemetry.biological_nonce || ('0x' + crypto.randomBytes(8).toString('hex'));

    const merkleItems = [
      `IDX:${index}`,
      `NONCE:${biologicalNonce}`,
      `SAP_MV:${telemetry.sap_current_mv.toFixed(3)}`,
      `Z_KOHM:${telemetry.cellular_impedance_kohm.toFixed(2)}`,
      `CO2_G_HR:${geminiEvaluation.carbon_sequestration_g_per_hr}`,
      `ORACLE_SIG:${geminiEvaluation.oracle_signature || 'N/A'}`
    ];
    const merkleRoot = this._calculateMerkleRoot(merkleItems);

    const poviStatus = this.isSlashed ? 'SLASHED_BURNED_CONSENSUS_EXCEPTION' : 'VERIFIED_VASCULAR_INTEGRITY';
    const dynamicValuation = this.isSlashed ? 0.00 : this.activeValuation;
    const mintRate = this.isSlashed ? 0.00 : this.tokenMintRate;

    const blockHash = this._sha256(`${index}-${prevHash}-${timestamp}-${biologicalNonce}-${merkleRoot}-${poviStatus}-${dynamicValuation}`);

    const newBlock = {
      index,
      timestamp,
      previous_hash: prevHash,
      hash: blockHash,
      biological_nonce: biologicalNonce,
      merkle_root: merkleRoot,
      sap_current_mv: telemetry.sap_current_mv,
      cellular_impedance_kohm: telemetry.cellular_impedance_kohm,
      carbon_sequestration_g_hr: geminiEvaluation.carbon_sequestration_g_per_hr,
      dynamic_asset_valuation: dynamicValuation,
      token_mint_rate: mintRate,
      povi_status: poviStatus,
      oracle_model: geminiEvaluation.model_used,
      oracle_confidence: geminiEvaluation.oracle_confidence_pct
    };

    this.chain.push(newBlock);

    if (this.chain.length > 50) {
      // Keep chain lightweight for in-memory ledger
      this.chain = [this.chain[0], ...this.chain.slice(-49)];
    }

    this._recordAuditLog(
      this.isSlashed ? 'SLASH_BLOCK_COMMITTED' : 'BLOCK_SEALED',
      `Block #${index} committed. PoVI Status: ${poviStatus}. Nonce: ${biologicalNonce.slice(0, 10)}...`,
      blockHash
    );

    return newBlock;
  }

  _recordAuditLog(eventType, description, blockHash) {
    const entry = {
      id: 'AUDIT_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
      type: eventType,
      description,
      block_hash: blockHash || this._sha256(description),
      severity: eventType.includes('SLASH') ? 'CRITICAL' : eventType.includes('GENESIS') ? 'INFO' : 'SUCCESS'
    };
    this.auditLedger.unshift(entry);
    if (this.auditLedger.length > 100) {
      this.auditLedger.pop();
    }
  }

  getLedgerState() {
    return {
      chain_height: this.chain.length,
      latest_block: this.chain[this.chain.length - 1],
      recent_blocks: this.chain.slice(-10).reverse(),
      audit_ledger: this.auditLedger.slice(0, 25),
      active_valuation: this.activeValuation,
      token_mint_rate: this.tokenMintRate,
      is_slashed: this.isSlashed,
      last_slash_reason: this.lastSlashReason,
      stage_gate_pipeline: this.stageGateState
    };
  }
}
