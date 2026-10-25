/**
 * PhytoNet Ledger (PNL) — Edge Telemetry Simulator & Hardware Emulation Engine
 * Generates continuous biophysical micro-potential signals, Cole-Cole impedance,
 * chaotic biological nonces, and serial terminal logs matching ESP32 firmware output.
 */

import crypto from 'crypto';

export class TelemetrySimulator {
  constructor() {
    this.mode = 'NORMAL'; // 'NORMAL' | 'WIRE_CUT' | 'DEAD_TISSUE' | 'SUN_BURST' | 'DROUGHT'
    this.sequence = 1000;
    this.entropyBuffer = 0x8A7C5E19;
    this.terminalLogs = [];
    this.replayingDataset = null;
    this.replayIndex = 0;
    this.startTime = Date.now();

    // Baseline physiological variables
    this.baseSapMV = 22.5;
    this.baseImpedance = 26.4;
    this.basePhaseDeg = 9.4;
    this.basePSRate = 8.2;
    this.basePPFD = 880.0;
    this.baseTempC = 21.8;
    this.baseHumidity = 66.5;

    this._initializeTerminalBootLog();
  }

  _initializeTerminalBootLog() {
    const bootLines = [
      'rst:0x1 (POWERON_RESET),boot:0x13 (SPI_FAST_FLASH_BOOT)',
      'configsip: 0, SPIWP:0xee',
      'clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00',
      'mode:DIO, clock div:2',
      'load:0x3fff0018,len:4',
      'load:0x3fff001c,len:1044',
      'load:0x40078000,len:10124',
      'load:0x40080400,len:5828',
      'entry 0x400806ac',
      '[SYSTEM] ESP32-WROOM-32D Dual Core Tensilica LX6 @ 240MHz initialized',
      '[HARDWARE] GPIO 32 (ADC1_CH4) mapped to Probe A (Cambium Sensing Electrode)',
      '[HARDWARE] GPIO 25 (DAC_CH1) mapped to Probe B (1kHz Challenge Excitation)',
      '[GROUND] Rhizosphere Cu Reference Stake verified (GND impedance < 2.1Ω)',
      '[TINYML] Biquad 50Hz/60Hz notch filter initialized (Q=12.0, Attenuation: -46dB)',
      '[TINYML] Exponential Moving Average (alpha=0.15) active for baseline drift correction',
      '[ENTROPY] Cambium micro-voltage thermal noise harvester seeded (Shannon entropy: 7.89)',
      '[POVI_ENGINE] Firmware v1.0.4-PROD ready. Telemetry stream started at 5.0 Hz'
    ];

    bootLines.forEach(line => this.addTerminalLog(line, 'BOOT'));
  }

  addTerminalLog(message, category = 'INFO') {
    const timestamp = new Date().toISOString().substring(11, 23);
    const entry = {
      id: 'LOG_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
      timestamp,
      category,
      message
    };
    this.terminalLogs.push(entry);
    if (this.terminalLogs.length > 250) {
      this.terminalLogs.shift();
    }
    return entry;
  }

  setFaultMode(mode) {
    this.mode = mode;
    this.replayingDataset = null; // Clear dataset replay if fault changed
    this.addTerminalLog(`[COMMAND_OVERRIDE] Operational Mode switched to: ${mode}`, 'WARN');
    if (mode === 'WIRE_CUT') {
      this.addTerminalLog('[ALARM] GPIO 32 ADC impedance dropped below 1.0kΩ. Cable disconnection or probe pull-out detected!', 'CRITICAL');
      this.addTerminalLog('[POVI] Local watchdog asserted: Tamper interrupt triggered on GPIO 4', 'CRITICAL');
    } else if (mode === 'NORMAL') {
      this.addTerminalLog('[POVI] Biophysical baseline restored. Cellular impedance re-established.', 'SUCCESS');
    } else if (mode === 'DEAD_TISSUE') {
      this.addTerminalLog('[ALARM] Cellular resistance exceeded 70kΩ. Severe tissue desiccation or necrosis!', 'CRITICAL');
    }
  }

  loadDatasetReplay(dataset) {
    this.replayingDataset = dataset;
    this.replayIndex = 0;
    this.mode = 'DATASET_REPLAY';
    this.addTerminalLog(`[INGEST] Loaded biophysical dataset: ${dataset.name} (${dataset.data.length} sample points)`, 'SUCCESS');
  }

  getSnapshot() {
    this.sequence++;
    const now = Date.now();
    const elapsedSec = (now - this.startTime) / 1000;

    // Generate chaotic biological nonce
    const entropyRaw = crypto.randomBytes(8).toString('hex').toUpperCase();
    const biologicalNonce = '0xBIO_' + entropyRaw;

    // If replaying pre-recorded dataset
    if (this.replayingDataset && this.replayingDataset.data.length > 0) {
      const point = this.replayingDataset.data[this.replayIndex];
      this.replayIndex = (this.replayIndex + 1) % this.replayingDataset.data.length;

      return {
        seq: this.sequence,
        timestamp: new Date().toISOString(),
        sap_current_mv: point.sap_current_mv,
        cellular_impedance_kohm: point.impedance_kohm,
        phase_shift_deg: point.phase_shift_deg,
        photosynthesis_rate_ps: point.ps_rate,
        temp_c: this.replayingDataset.ambient?.temperature_c || 22.0,
        humidity_pct: this.replayingDataset.ambient?.humidity_pct || 70.0,
        ppfd_umol: point.ambient_ppfd || 900.0,
        biological_nonce: biologicalNonce,
        povi_valid: true,
        failure_mode: 'NONE',
        operating_mode: 'DATASET_REPLAY',
        dataset_name: this.replayingDataset.name
      };
    }

    // Default continuous biophysical simulation
    let sapMV = 0.0;
    let impedanceKohm = 0.0;
    let phaseShiftDeg = 0.0;
    let psRate = 0.0;
    let ppfd = this.basePPFD;
    let tempC = this.baseTempC;
    let humidity = this.baseHumidity;
    let poviValid = true;
    let failureMode = 'NONE';

    // Harmonic plant wave oscillation + micro-jitter
    const wave1 = Math.sin(elapsedSec * 0.4) * 3.8;
    const wave2 = Math.cos(elapsedSec * 0.12) * 2.1;
    const jitter = (Math.random() - 0.5) * 0.65;

    switch (this.mode) {
      case 'WIRE_CUT':
        // Simulates probe physically removed or severed line
        sapMV = 0.02 + ((Math.random() - 0.5) * 0.01);
        impedanceKohm = 0.18 + ((Math.random() - 0.5) * 0.04); // Short/broken (< 1 kΩ)
        phaseShiftDeg = 0.04;
        psRate = 0.0;
        poviValid = false;
        failureMode = 'WIRE_DISCONNECTED_SHORT_CIRCUIT';
        break;

      case 'DEAD_TISSUE':
        // Simulates dead dried stem
        sapMV = 0.15 + ((Math.random() - 0.5) * 0.02);
        impedanceKohm = 82.5 + (Math.random() * 4.0); // Extreme desiccation (> 70 kΩ)
        phaseShiftDeg = 0.65;
        psRate = 0.1;
        poviValid = false;
        failureMode = 'TISSUE_NECROSIS_DESICCATION';
        break;

      case 'SUN_BURST':
        ppfd = 1380.0 + (Math.random() * 40);
        sapMV = this.baseSapMV + 16.5 + wave1 + jitter;
        impedanceKohm = this.baseImpedance - 4.2 + (jitter * 0.2);
        phaseShiftDeg = this.basePhaseDeg + 2.8;
        psRate = this.basePSRate + 6.2 + (wave1 * 0.3);
        tempC = 27.8;
        humidity = 54.0;
        break;

      case 'DROUGHT':
        ppfd = 1250.0;
        sapMV = Math.max(1.5, 4.2 + wave1 * 0.3 + jitter);
        impedanceKohm = 48.2 + wave2;
        phaseShiftDeg = 4.1;
        psRate = 2.4;
        tempC = 31.5;
        humidity = 32.0;
        break;

      case 'NORMAL':
      default:
        sapMV = this.baseSapMV + wave1 + wave2 + jitter;
        impedanceKohm = this.baseImpedance - (wave1 * 0.15) + (jitter * 0.1);
        phaseShiftDeg = this.basePhaseDeg + (wave2 * 0.2);
        psRate = this.basePSRate + (wave1 * 0.25) + (jitter * 0.15);
        break;
    }

    // Periodically add realistic TinyML log to edge terminal
    if (this.sequence % 15 === 0) {
      if (poviValid) {
        this.addTerminalLog(
          `[DSP_FRAME #${this.sequence}] ADC1_CH4:${sapMV.toFixed(2)}mV | Z_1kHz:${impedanceKohm.toFixed(1)}kΩ | Δθ:${phaseShiftDeg.toFixed(1)}° | Nonce:${biologicalNonce.slice(0, 10)}... | PoVI:OK`,
          'TELEMETRY'
        );
      } else {
        this.addTerminalLog(
          `[DSP_FRAME #${this.sequence}] EXCEPTION: Z_1kHz=${impedanceKohm.toFixed(1)}kΩ (BOUND:10-65kΩ) | Δθ=${phaseShiftDeg.toFixed(1)}° | FAULT:${failureMode}`,
          'CRITICAL'
        );
      }
    }

    return {
      seq: this.sequence,
      timestamp: new Date().toISOString(),
      sap_current_mv: Number(sapMV.toFixed(3)),
      cellular_impedance_kohm: Number(impedanceKohm.toFixed(2)),
      phase_shift_deg: Number(phaseShiftDeg.toFixed(2)),
      photosynthesis_rate_ps: Number(psRate.toFixed(2)),
      temp_c: Number(tempC.toFixed(1)),
      humidity_pct: Number(humidity.toFixed(1)),
      ppfd_umol: Number(ppfd.toFixed(1)),
      biological_nonce: biologicalNonce,
      povi_valid: poviValid,
      failure_mode: failureMode,
      operating_mode: this.mode
    };
  }

  getTerminalLogs() {
    return this.terminalLogs;
  }
}
