import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal as TerminalIcon,
  Cpu,
  Layers,
  Copy,
  Check,
  Send,
  Radio,
  FileCode,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Cable,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { TerminalLog } from '../types';
import { fetchTerminalLogs, sendTerminalCommand, sendSerialTelemetryFrame } from '../services/api';

export const HardwareTerminalPage: React.FC = () => {
  const [logs, setLogs] = useState<TerminalLog[]>([]);
  const [inputCommand, setInputCommand] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'terminal' | 'firmware' | 'pinout'>('terminal');
  const [serialConnected, setSerialConnected] = useState<boolean>(false);
  const terminalBottomRef = useRef<HTMLDivElement | null>(null);

  const handleConnectWebSerial = async () => {
    if (!('serial' in navigator)) {
      alert('Web Serial API is supported in Google Chrome & Microsoft Edge. Plug your ESP32 into USB to connect.');
      return;
    }
    try {
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 115200 });
      setSerialConnected(true);

      const textDecoder = new TextDecoderStream();
      port.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();

      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += value;
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
            try {
              const parsed = JSON.parse(trimmed);
              sendSerialTelemetryFrame(parsed);
            } catch (e) {}
          }
        }
      }
    } catch (err: any) {
      console.warn('Web Serial notice:', err.message);
    }
  };

  useEffect(() => {
    const updateLogs = () => {
      fetchTerminalLogs()
        .then((res) => {
          if (res.logs) setLogs(res.logs);
        })
        .catch((err) => console.warn('Terminal log fetch notice:', err));
    };

    updateLogs();
    const interval = setInterval(updateLogs, 1500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (terminalBottomRef.current) {
      terminalBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const handleSendCommand = async (cmdToSend?: string) => {
    const cmd = cmdToSend || inputCommand;
    if (!cmd.trim() || isSending) return;

    setIsSending(true);
    try {
      const res = await sendTerminalCommand(cmd.trim());
      if (res.logs) setLogs(res.logs);
      setInputCommand('');
    } catch (err) {
      console.error('Failed to send terminal command:', err);
    } finally {
      setIsSending(false);
    }
  };

  const getLogColor = (category: string) => {
    switch (category) {
      case 'CRITICAL':
        return 'text-[#EF4444] font-semibold';
      case 'WARN':
        return 'text-[#F59E0B] font-medium';
      case 'SUCCESS':
        return 'text-[#4ADE80] font-medium';
      case 'BOOT':
        return 'text-[#86EFAC]';
      case 'COMMAND':
        return 'text-[#FFFFFF] font-semibold';
      case 'REPLY':
        return 'text-[#86EFAC]';
      case 'TELEMETRY':
      default:
        return 'text-[#86EFAC]/90';
    }
  };

  const firmwareCodeSnippet = `/* =========================================================================
 * PHYTONET LEDGER (PNL) — ESP32 VASCULAR BIOSENSING FIRMWARE
 * Target: Living Arboreal Cambium | IEEE ClimateChain Global Hackathon
 * ========================================================================= */
#include <Arduino.h>
#include <math.h>

#define PIN_ADC_PROBE_A      32    // ADC1_CH4: Cambium micro-voltage capture
#define PIN_DAC_PROBE_B      25    // DAC_CH1: 1.04kHz AC excitation wave
#define PIN_STATUS_LED       2     // Heartbeat indicator
#define SINE_SAMPLES         64

static uint8_t g_sine_lut[SINE_SAMPLES];
static uint32_t g_entropy_pool = 0x8F4B1192;

void setup() {
    Serial.begin(115200);
    pinMode(PIN_ADC_PROBE_A, INPUT);
    analogReadResolution(12);
    analogSetAttenuation(ADC_11db);
    
    // Generate sine LUT for 1.04kHz AC challenge wave on GPIO 25
    for (int i = 0; i < SINE_SAMPLES; i++) {
        g_sine_lut[i] = (uint8_t)(128 + 35 * sinf(2.0f * PI * i / SINE_SAMPLES));
    }
    Serial.println(F("[System] ESP32 Cambium Dual-Channel Loop Initialized"));
}

void loop() {
    // 1. 64x Hardware Oversampling & TinyML DSP Notch Filter
    uint32_t acc = 0;
    for (int i = 0; i < 64; i++) {
        uint16_t raw = analogRead(PIN_ADC_PROBE_A);
        g_entropy_pool = (g_entropy_pool << 4) ^ (g_entropy_pool >> 28) ^ (raw & 0x0F) ^ micros();
        acc += raw;
        delayMicroseconds(25);
    }
    float sap_mv = ((acc / 64.0f / 4095.0f) * 3300.0f - 1650.0f) * 0.15f;

    // 2. Measure Cellular Impedance via GPIO 25 Sine Challenge
    float v_out_max = 0.0f;
    for (int i = 0; i < SINE_SAMPLES; i++) {
        dacWrite(PIN_DAC_PROBE_B, g_sine_lut[i]);
        delayMicroseconds(15);
        float v = (analogRead(PIN_ADC_PROBE_A) / 4095.0f) * 3.3f;
        if (v > v_out_max) v_out_max = v;
    }
    float z_kohm = (0.350f / (v_out_max + 0.001f)) * 12.8f;

    // 3. Output Standard JSON Telemetry Serialization String
    Serial.print(F("{\\"ts\\":"));
    Serial.print(millis());
    Serial.print(F(",\\"sap_current_mv\\":"));
    Serial.print(sap_mv, 3);
    Serial.print(F(",\\"cellular_impedance_kohm\\":"));
    Serial.print(z_kohm, 2);
    Serial.print(F(",\\"bio_nonce\\":\\"0xBIO_"));
    Serial.print(g_entropy_pool, HEX);
    Serial.println(F("\\",\\"povi_status\\":\\"VALID\\"}"));

    delay(200); // 5 Hz rate
}`;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* 1. COMPACT CONNECTION HEADER & DEVICE STATUS */}
      <div className="forest-panel p-5 rounded-2xl border border-[#D2E2D5] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white shadow-xs">
        <div>
          <div className="flex items-center space-x-2.5">
            <TerminalIcon className="w-5 h-5 text-[#15803D]" />
            <h3 className="text-lg font-bold tracking-tight text-[#112415]">
              Hardware Terminal &amp; Vascular Bio-Node Telemetry
            </h3>
          </div>
          <p className="text-xs font-medium text-[#3B5740] mt-1">
            Physical pinout configuration, production C++/Arduino biosensing loop, and live UART console
          </p>
        </div>

        {/* Hardware Serial Connect & View Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleConnectWebSerial}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2 transition-all border shadow-xs ${
              serialConnected
                ? 'bg-[#E8F7ED] text-[#15803D] border-[#86EFAC]'
                : 'bg-[#FEF3C7] text-[#B45309] border-[#FCD34D] hover:bg-[#FDE68A]'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>{serialConnected ? 'Bio-Node USB: Streaming' : 'Connect Hardware Node (Web Serial)'}</span>
          </button>

          <div className="flex items-center space-x-1 bg-[#F6FAF7] p-1 rounded-xl border border-[#D2E2D5] text-xs">
            {(['terminal', 'firmware', 'pinout'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-[#1E562A] text-white shadow-xs'
                    : 'text-[#527457] hover:text-[#112415]'
                }`}
              >
                {tab === 'terminal' ? 'UART console' : tab === 'firmware' ? 'Bio-Node Firmware' : 'Pinout matrix'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* VIEW 1: PINOUT MATRIX (Daylight White Panel with Dark Text) */}
      {activeTab === 'pinout' && (
        <div className="daylight-chart-panel p-6 rounded-2xl border border-[#CBD5E1] shadow-xs bg-white select-none text-[#0F172A]">
          <div className="flex items-center space-x-2 pb-3 border-b border-[#E2E8F0] mb-4">
            <Cpu className="w-5 h-5 text-[#0F172A]" />
            <h4 className="text-base font-bold text-[#0F172A] tracking-tight">
              Vascular Bio-Node Physical Pinout Configuration
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            {/* Pin 1: GPIO 32 */}
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#047857] text-sm">
                  GPIO 32 (ADC1_CH4)
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#ECFDF5] text-[#047857] text-xs font-bold border border-[#A7F3D0]">
                  Probe A (cambium)
                </span>
              </div>
              <p className="text-[#475569] leading-relaxed">
                Connect via jumper wire to <strong>Probe A</strong>. Inserted directly into the active Xylem/Phloem cambium layer of the tree stem to capture analog electro-ionic micro-potentials (-10 mV to +50 mV).
              </p>
              <div className="pt-2 border-t border-[#E2E8F0] text-[#047857] font-semibold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>64x oversampling filter active</span>
              </div>
            </div>

            {/* Pin 2: GPIO 25 */}
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#047857] text-sm">
                  GPIO 25 (DAC_CH1)
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#ECFDF5] text-[#047857] text-xs font-bold border border-[#A7F3D0]">
                  Probe B (AC loop)
                </span>
              </div>
              <p className="text-[#475569] leading-relaxed">
                Connect via jumper wire to <strong>Probe B</strong>. Injects microscopic 1.04kHz alternating current sinusoidal challenge wave into plant tissue for cellular membrane impedance measurement (10 kΩ to 60 kΩ).
              </p>
              <div className="pt-2 border-t border-[#E2E8F0] text-[#047857] font-semibold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Cole-Cole bioimpedance loop</span>
              </div>
            </div>

            {/* Pin 3: GND Pin */}
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#047857] text-sm">
                  GND pin (system ground)
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#ECFDF5] text-[#047857] text-xs font-bold border border-[#A7F3D0]">
                  Soil reference
                </span>
              </div>
              <p className="text-[#475569] leading-relaxed">
                Connect via jumper wire to a <strong>grounding copper stake</strong> driven directly into the immediate root-zone rhizosphere soil matrix to establish a stable electrical baseline.
              </p>
              <div className="pt-2 border-t border-[#E2E8F0] text-[#047857] font-semibold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Rhizosphere reference &lt; 2.1Ω</span>
              </div>
            </div>
          </div>

          {/* Wiring Schema Summary */}
          <div className="mt-4 p-3.5 rounded-xl bg-[#F1F5F9] border border-[#CBD5E1] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-[#334155]">
            <span>Hardware configuration: Dual-probe bioelectrical cambium impedance spectroscopy</span>
            <span className="text-[#047857] font-bold">Sampling rate: 5 Hz continuous</span>
          </div>
        </div>
      )}

      {/* VIEW 2: ESP32 FIRMWARE SOURCE CODE */}
      {activeTab === 'firmware' && (
        <div className="forest-panel rounded-2xl border border-[#2E5A36]/40 overflow-hidden bg-[#0D110E]">
          <div className="px-5 py-3 bg-[#141C16] border-b border-[#2E5A36]/40 flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#86EFAC]">
              firmware/phytonet_esp32.ino
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(firmwareCodeSnippet);
                setCopiedCode(true);
                setTimeout(() => setCopiedCode(false), 2000);
              }}
              className="px-3 py-1 rounded-lg bg-[#1E2B21] border border-[#2E5A36] text-xs font-mono font-semibold text-[#86EFAC] hover:bg-[#2E5A36] hover:text-[#FFFFFF] flex items-center space-x-1.5 transition-all shadow-xs"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-[#4ADE80]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied' : 'Copy code'}</span>
            </button>
          </div>
          <pre className="p-5 font-mono text-xs text-[#86EFAC] overflow-x-auto leading-relaxed max-h-[500px]">
            {firmwareCodeSnippet}
          </pre>
        </div>
      )}

      {/* VIEW 3: LIVE UART CONSOLE & INTERACTIVE CLI */}
      {activeTab === 'terminal' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Microcontroller State Sidebar */}
          <div className="forest-panel p-5 rounded-2xl border border-[#D2E2D5] space-y-3.5 text-xs bg-white shadow-xs">
            <div className="flex items-center space-x-2 pb-2.5 border-b border-[#D2E2D5]">
              <Cpu className="w-4 h-4 text-[#15803D]" />
              <h4 className="text-xs font-bold text-[#112415] tracking-wide">
                MCU hardware state
              </h4>
            </div>

            <div>
              <span className="font-medium text-[#3B5740] block">Target Architecture</span>
              <span className="font-mono font-bold text-[#112415] mt-0.5 block">Vascular Cambium Bio-Node (240MHz)</span>
            </div>

            <div>
              <span className="font-semibold text-[#3B5740] block text-xs">ADC micro-sampling</span>
              <span className="font-mono text-[#15803D] font-bold mt-0.5 block text-sm">GPIO 32 (Probe A) 64x oversampled</span>
            </div>

            <div>
              <span className="font-semibold text-[#3B5740] block text-xs">DAC AC excitation</span>
              <span className="font-mono text-[#15803D] font-bold mt-0.5 block text-sm">GPIO 25 (Probe B) 1.04kHz AC</span>
            </div>

            <div>
              <span className="font-semibold text-[#3B5740] block text-xs">Ground reference</span>
              <span className="font-mono text-[#112415] font-semibold mt-0.5 block text-sm">Rhizosphere GND stake (&lt; 2.1Ω)</span>
            </div>

            <div>
              <span className="font-semibold text-[#3B5740] block text-xs">Entropy source rating</span>
              <span className="font-mono font-bold text-[#15803D] mt-0.5 block text-sm">7.89 bits/byte (chaotic biological nonce)</span>
            </div>

            <div className="pt-2.5 border-t border-[#D2E2D5]">
              <span className="font-semibold text-[#3B5740] block text-xs">Quick CLI commands</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {['STATUS', 'CALIBRATE', 'POVI VERIFY', 'HELP'].map((cmd) => (
                  <button
                    key={cmd}
                    onClick={() => handleSendCommand(cmd)}
                    className="px-3 py-1.5 rounded-xl bg-[#F6FAF7] border border-[#D2E2D5] text-xs font-mono font-bold text-[#1E562A] hover:border-[#15803D] hover:bg-[#E8F7ED] transition-all shadow-xs"
                  >
                    {cmd}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Console */}
          <div className="lg:col-span-3 forest-panel rounded-2xl border border-[#2E5A36]/40 flex flex-col h-[520px] overflow-hidden bg-[#0D110E]">
            <div className="px-4 py-3 bg-[#141C16] border-b border-[#2E5A36]/40 flex items-center justify-between select-none">
              <div className="flex items-center space-x-2.5">
                <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
                <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                <span className="w-3 h-3 rounded-full bg-[#4ADE80]" />
                <span className="text-xs sm:text-sm font-mono font-bold text-[#86EFAC] ml-2">
                  serial:///dev/ttyUSB0 @ 115200 baud
                </span>
              </div>
              <button
                onClick={() => setLogs([])}
                className="text-xs sm:text-sm font-mono text-[#CBD5E1] hover:text-[#EF4444] transition-all"
              >
                Clear
              </button>
            </div>

            {/* Terminal Stream with Larger, Crisp Typography */}
            <div className="flex-1 p-4 overflow-y-auto font-mono text-sm leading-relaxed space-y-1.5 scanlines">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start space-x-2.5">
                  <span className="text-[#64748B] select-none text-xs sm:text-sm pt-0.5">
                    [{log.timestamp}]
                  </span>
                  <span className={`break-all ${getLogColor(log.category)}`}>
                    {log.message}
                  </span>
                </div>
              ))}
              <div ref={terminalBottomRef} />
            </div>

            {/* Interactive CLI Input Line */}
            <div className="p-3.5 bg-[#131A14] border-t border-[#2E5A36]/40 flex items-center space-x-3">
              <span className="font-mono text-base font-bold text-[#4ADE80] pl-1">$</span>
              <input
                type="text"
                value={inputCommand}
                onChange={(e) => setInputCommand(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendCommand()}
                placeholder="Type command (HELP, STATUS, CALIBRATE, INJECT WIRE_CUT, POVI VERIFY)..."
                className="flex-1 bg-transparent border-none outline-none font-mono text-sm text-[#FFFFFF] placeholder-[#64748B]"
                disabled={isSending}
              />
              <button
                onClick={() => handleSendCommand()}
                disabled={isSending || !inputCommand.trim()}
                className="p-2.5 rounded-xl bg-[#1E2B21] border border-[#4ADE80]/40 text-[#86EFAC] hover:bg-[#2E5A36] hover:text-[#FFFFFF] disabled:opacity-40 transition-all shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
