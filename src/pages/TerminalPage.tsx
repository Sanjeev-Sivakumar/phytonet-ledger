import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal as TerminalIcon,
  Play,
  RotateCcw,
  Sliders,
  Cpu,
  Radio,
  CheckCircle,
  AlertTriangle,
  Send
} from 'lucide-react';
import { TerminalLog } from '../types';
import { fetchTerminalLogs, sendTerminalCommand } from '../services/api';

export const TerminalPage: React.FC = () => {
  const [logs, setLogs] = useState<TerminalLog[]>([]);
  const [inputCommand, setInputCommand] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const terminalBottomRef = useRef<HTMLDivElement | null>(null);

  // Poll terminal logs periodically
  useEffect(() => {
    const updateLogs = () => {
      fetchTerminalLogs()
        .then((res) => {
          if (res.logs) setLogs(res.logs);
        })
        .catch((err) => console.warn('Terminal log fetch notice:', err));
    };

    updateLogs();
    const interval = setInterval(updateLogs, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    if (autoScroll && terminalBottomRef.current) {
      terminalBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendCommand();
    }
  };

  const getLogColor = (category: string) => {
    switch (category) {
      case 'CRITICAL':
        return 'text-[#D34B4B] font-regular';
      case 'WARN':
        return 'text-[#D99B32]';
      case 'SUCCESS':
        return 'text-[#A3C9A8]';
      case 'BOOT':
        return 'text-[#8FB996]';
      case 'COMMAND':
        return 'text-[#E8EFE9] font-regular';
      case 'REPLY':
        return 'text-[#C2DFC3]';
      case 'TELEMETRY':
      default:
        return 'text-[#A3C9A8]/80';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in">
      {/* Top Banner */}
      <div className="forest-panel p-4 rounded border border-[#2E5A36]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <TerminalIcon className="w-4 h-4 text-[#A3C9A8]" />
            <h3 className="text-sm font-light tracking-wider uppercase text-[#E8EFE9]">
              ESP32 Edge Microcontroller Terminal &amp; TinyML Diagnostics
            </h3>
          </div>
          <p className="text-xs font-light text-[#8FB996] mt-0.5">
            Interactive UART serial console streaming hardware boot sequences, ADC/DAC loops, and DSP filters
          </p>
        </div>

        {/* Quick Command Shortcuts */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['STATUS', 'CALIBRATE', 'POVI VERIFY', 'GEMINI QUERY'].map((cmd) => (
            <button
              key={cmd}
              onClick={() => handleSendCommand(cmd)}
              className="px-2 py-1 rounded bg-[#1E2B21] border border-[#2E5A36]/50 text-[10px] font-mono text-[#A3C9A8] hover:bg-[#2E5A36] hover:text-[#E8EFE9] transition-all"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Edge Hardware Metrics & Interactive Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Column: ESP32 Hardware Status Sidebar (1 Col) */}
        <div className="forest-panel p-4 rounded border border-[#2E5A36]/40 space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-[#2E5A36]/30">
            <Cpu className="w-3.5 h-3.5 text-[#A3C9A8]" />
            <h4 className="text-xs font-light tracking-wider uppercase text-[#8FB996]">
              Microcontroller State
            </h4>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="text-[10px] text-[#6D7B70] uppercase">TARGET MCU</div>
              <div className="font-mono text-[#E8EFE9] mt-0.5">ESP32-WROOM-32D</div>
              <div className="text-[10px] text-[#8FB996]">Dual Tensilica @ 240MHz</div>
            </div>

            <div>
              <div className="text-[10px] text-[#6D7B70] uppercase">PROBE A (ADC1_CH4)</div>
              <div className="font-mono text-[#A3C9A8] mt-0.5">GPIO Pin 32</div>
              <div className="text-[10px] text-[#6D7B70]">64x Hardware Oversampling</div>
            </div>

            <div>
              <div className="text-[10px] text-[#6D7B70] uppercase">PROBE B (DAC_CH1)</div>
              <div className="font-mono text-[#A3C9A8] mt-0.5">GPIO Pin 25</div>
              <div className="text-[10px] text-[#6D7B70]">1.04kHz AC Sine (350mVpp)</div>
            </div>

            <div>
              <div className="text-[10px] text-[#6D7B70] uppercase">RHIZOSPHERE GND</div>
              <div className="font-mono text-[#E8EFE9] mt-0.5">Copper Stake (30cm)</div>
              <div className="text-[10px] text-[#8FB996]">Ground baseline &lt; 2.1Ω</div>
            </div>

            <div>
              <div className="text-[10px] text-[#6D7B70] uppercase">TINYML DSP NOTCH</div>
              <div className="font-mono text-[#E8EFE9] mt-0.5">50Hz/60Hz Q=12.0</div>
              <div className="text-[10px] text-[#8FB996]">-46dB Mains Attenuation</div>
            </div>

            <div>
              <div className="text-[10px] text-[#6D7B70] uppercase">ENTROPY RATING</div>
              <div className="font-mono text-[#A3C9A8] mt-0.5">7.89 bits/byte</div>
              <div className="text-[10px] text-[#6D7B70]">Chaotic Nonce Pool Active</div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Serial Terminal Console (3 Cols) */}
        <div className="lg:col-span-3 forest-panel rounded border border-[#2E5A36]/40 flex flex-col h-[520px] overflow-hidden bg-[#0D110E]">
          {/* Terminal Title Bar */}
          <div className="px-4 py-2.5 bg-[#141C16] border-b border-[#2E5A36]/30 flex items-center justify-between select-none">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D34B4B]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#D99B32]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#4E8752]" />
              <span className="text-xs font-mono text-[#8FB996] ml-2">
                serial:///dev/ttyUSB0 @ 115200 baud
              </span>
            </div>

            <div className="flex items-center space-x-3 text-[11px] font-mono">
              <button
                onClick={() => setAutoScroll(!autoScroll)}
                className={`hover:text-[#E8EFE9] transition-all ${
                  autoScroll ? 'text-[#A3C9A8]' : 'text-[#6D7B70]'
                }`}
              >
                Auto-scroll: {autoScroll ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={() => setLogs([])}
                className="text-[#6D7B70] hover:text-[#D34B4B] transition-all"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Terminal Output Area */}
          <div className="flex-1 p-4 overflow-y-auto font-mono text-xs leading-relaxed space-y-1 scanlines">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start space-x-2">
                <span className="text-[#4E6252] select-none text-[10px] pt-0.5">
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
          <div className="p-3 bg-[#131A14] border-t border-[#2E5A36]/30 flex items-center space-x-2">
            <span className="font-mono text-xs text-[#A3C9A8] pl-1">$</span>
            <input
              type="text"
              value={inputCommand}
              onChange={(e) => setInputCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type command (e.g. HELP, STATUS, CALIBRATE, INJECT WIRE_CUT, POVI VERIFY)..."
              className="flex-1 bg-transparent border-none outline-none font-mono text-xs text-[#E8EFE9] placeholder-[#4E6252]"
              disabled={isSending}
            />
            <button
              onClick={() => handleSendCommand()}
              disabled={isSending || !inputCommand.trim()}
              className="p-1.5 rounded bg-[#1E2B21] border border-[#4E8752]/40 text-[#A3C9A8] hover:bg-[#2E5A36] hover:text-[#E8EFE9] disabled:opacity-40 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
