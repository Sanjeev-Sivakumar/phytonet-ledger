import React, { useMemo } from 'react';
import { ShieldCheck, Leaf, QrCode, Scan } from 'lucide-react';

interface BlockchainQRCodeProps {
  hash: string;
  batchNumber: string;
  size?: number;
  onScanClick?: () => void;
  showVerificationBadge?: boolean;
  isScanning?: boolean;
}

export const BlockchainQRCode: React.FC<BlockchainQRCodeProps> = ({
  hash,
  batchNumber,
  size = 190,
  onScanClick,
  showVerificationBadge = true,
  isScanning = false
}) => {
  // Deterministic 25x25 QR Matrix Generator
  const matrix = useMemo(() => {
    const N = 25;
    const grid: boolean[][] = Array(N)
      .fill(false)
      .map(() => Array(N).fill(false));

    let seed = 0;
    for (let i = 0; i < hash.length; i++) {
      seed = (seed * 31 + hash.charCodeAt(i)) >>> 0;
    }
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return (seed >>> 16) / 65536;
    };

    const paintFinder = (r0: number, c0: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (
            r === 0 ||
            r === 6 ||
            c === 0 ||
            c === 6 ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)
          ) {
            grid[r0 + r][c0 + c] = true;
          } else {
            grid[r0 + r][c0 + c] = false;
          }
        }
      }
    };

    paintFinder(0, 0);
    paintFinder(0, N - 7);
    paintFinder(N - 7, 0);

    for (let i = 8; i < N - 8; i++) {
      grid[6][i] = i % 2 === 0;
      grid[i][6] = i % 2 === 0;
    }

    const ar0 = 16;
    const ac0 = 16;
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (r === 0 || r === 4 || c === 0 || c === 4 || (r === 2 && c === 2)) {
          grid[ar0 + r][ac0 + c] = true;
        } else {
          grid[ar0 + r][ac0 + c] = false;
        }
      }
    }

    const centerStart = Math.floor(N / 2) - 2;
    const centerEnd = Math.floor(N / 2) + 2;

    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (
          (r <= 7 && c <= 7) ||
          (r <= 7 && c >= N - 8) ||
          (r >= N - 8 && c <= 7)
        ) {
          continue;
        }
        if (r === 6 || c === 6) continue;
        if (r >= ar0 && r < ar0 + 5 && c >= ac0 && c < ac0 + 5) continue;
        if (r >= centerStart && r <= centerEnd && c >= centerStart && c <= centerEnd) {
          grid[r][c] = false;
          continue;
        }

        grid[r][c] = rand() > 0.48;
      }
    }

    return grid;
  }, [hash]);

  const N = 25;
  const cellSize = 10;
  const viewBoxSize = N * cellSize;

  return (
    <div className="flex flex-col items-center select-none w-full">
      {/* QR Code Container with Interactive Laser Scan Overlay */}
      <div
        onClick={onScanClick}
        className="relative p-3.5 bg-white rounded-2xl border-2 border-slate-200 hover:border-indigo-400 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center overflow-hidden"
        style={{ width: size, height: size }}
        title="Click to scan QR code and trigger on-chain project actions"
      >
        {/* SVG QR Code */}
        <svg
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
          className="w-full h-full"
          shapeRendering="crispEdges"
        >
          {matrix.map((row, r) =>
            row.map((filled, c) => {
              if (!filled) return null;
              return (
                <rect
                  key={`${r}-${c}`}
                  x={c * cellSize}
                  y={r * cellSize}
                  width={cellSize}
                  height={cellSize}
                  fill="#0F172A"
                />
              );
            })
          )}

          {/* Center Logo Shield Badge */}
          <g transform={`translate(${10 * cellSize}, ${10 * cellSize})`}>
            <rect
              x="2"
              y="2"
              width={5 * cellSize - 4}
              height={5 * cellSize - 4}
              rx="8"
              fill="#FFFFFF"
              stroke="#10B981"
              strokeWidth="3"
            />
            <path
              d="M25 14 C18 14 14 20 14 28 C22 28 32 26 32 18 C32 15 28 14 25 14 Z"
              fill="#10B981"
            />
            <path
              d="M18 32 C26 32 30 26 30 18"
              stroke="#047857"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        </svg>

        {/* Dynamic Laser Scanning Beam Animation */}
        {isScanning && (
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_12px_rgba(239,68,68,1)] animate-bounce pointer-events-none z-20"></div>
        )}

        {/* Hover Overlay "Click to Scan QR Code" */}
        <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 text-center text-white z-10">
          <Scan className="w-8 h-8 text-emerald-400 mb-1.5 animate-pulse" />
          <span className="text-xs font-bold tracking-wide">
            Click to Scan QR Code
          </span>
          <span className="text-[10px] font-mono text-emerald-300 mt-0.5">
            Triggers On-Chain Actions
          </span>
        </div>
      </div>

      {/* Direct "Scan QR Code Now" Action Button */}
      <button
        onClick={onScanClick}
        disabled={isScanning}
        className="mt-3 w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm active:scale-95 transition-all"
      >
        <Scan className={`w-3.5 h-3.5 text-emerald-400 ${isScanning ? 'animate-spin' : ''}`} />
        <span>{isScanning ? 'Scanning QR Code...' : 'Scan QR Code Now'}</span>
      </button>

      {showVerificationBadge && (
        <div className="mt-2.5 text-center">
          <div className="flex items-center justify-center space-x-1.5 text-xs font-mono font-bold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Merkle Root: {hash.slice(0, 10)}...{hash.slice(-4)}</span>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 block mt-0.5">
            EU ESPR 2026 Batch: {batchNumber}
          </span>
        </div>
      )}
    </div>
  );
};
