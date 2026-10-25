import React from 'react';
import {
  Activity,
  Factory,
  Truck,
  Landmark,
  Terminal,
  RefreshCw,
  Leaf,
  ShieldCheck
} from 'lucide-react';

export type NavTabType = 'overview' | 'emissions' | 'supplychain' | 'trading' | 'terminal' | 'evidence';

interface TopNavProps {
  activeTab: NavTabType;
  setActiveTab: (tab: NavTabType) => void;
  connected: boolean;
  isSlashed: boolean;
  onRefreshOracle?: () => void;
  isEvaluatingOracle?: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  connected,
  isSlashed,
  onRefreshOracle,
  isEvaluatingOracle
}) => {
  const tabs: Array<{ id: NavTabType; label: string; icon: React.ReactNode }> = [
    { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
    { id: 'emissions', label: 'Emissions', icon: <Factory className="w-4 h-4" /> },
    { id: 'supplychain', label: 'Digital passports', icon: <Truck className="w-4 h-4" /> },
    { id: 'trading', label: 'Carbon trading', icon: <Landmark className="w-4 h-4" /> },
    { id: 'terminal', label: 'Hardware terminal', icon: <Terminal className="w-4 h-4" /> },
    { id: 'evidence', label: 'Security & evidence', icon: <ShieldCheck className="w-4 h-4" /> }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-white/95 backdrop-blur-md border-b border-[#D2E2D5] px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-14 flex items-center select-none shadow-[0_1px_4px_rgba(20,45,25,0.03)]">
      <div className="w-full flex items-center justify-between">
        {/* Brand Identity */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl border border-[#A7F3D0] flex items-center justify-center bg-[#E8F7ED] shadow-xs">
            <Leaf className="w-5 h-5 text-[#15803D]" />
          </div>
          <div className="flex items-center space-x-2.5">
            <span className="text-xl font-bold tracking-tight text-[#112415]">
              PhytoNet Ledger
            </span>
            <span className="hidden sm:inline-block text-xs font-mono font-bold text-[#1E562A] bg-[#E8F3EA] px-2.5 py-0.5 rounded-md border border-[#C2DEC6]">
              IEEE ClimateChain
            </span>
          </div>
        </div>

        {/* Navigation Tabs (Sentence Case) */}
        <nav className="flex items-center space-x-1.5 bg-[#EDF4EE] p-1.5 rounded-xl border border-[#D2E2D5]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150 outline-none ${
                  isActive
                    ? 'bg-[#1E562A] text-white shadow-xs'
                    : 'text-[#3B5740] hover:text-[#112415] hover:bg-white/70'
                }`}
              >
                <span className={isActive ? 'text-[#86EFAC]' : 'text-[#58745E]'}>{tab.icon}</span>
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Status & Oracle Button */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          {/* Station Status Pill */}
          <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-mono font-semibold border ${
            isSlashed
              ? 'bg-[#FEE2E2] border-[#FCA5A5] text-[#B91C1C]'
              : connected
              ? 'bg-[#E8F7ED] border-[#A7F3D0] text-[#15803D]'
              : 'bg-[#FEF3C7] border-[#FCD34D] text-[#B45309]'
          }`}>
            <span
              className={`w-2 h-2 rounded-full ${
                isSlashed
                  ? 'bg-[#DC2626] pulse-crimson'
                  : connected
                  ? 'bg-[#16A34A] pulse-green'
                  : 'bg-[#F59E0B]'
              }`}
            />
            <span className="hidden sm:inline">
              {isSlashed ? 'Consensus slashed' : connected ? 'Station online' : 'Connecting'}
            </span>
          </div>

          {/* Evaluate Oracle Action */}
          {onRefreshOracle && (
            <button
              onClick={onRefreshOracle}
              disabled={isEvaluatingOracle}
              title="Recalculate Gemini AI carbon flux oracle"
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-[#E8F3EA] border border-[#B7DAC0] text-[#1E562A] hover:bg-[#1E562A] hover:text-white active:scale-95 transition-all disabled:opacity-50 text-xs sm:text-sm font-semibold shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isEvaluatingOracle ? 'animate-spin' : ''}`} />
              <span className="hidden lg:inline">Evaluate oracle</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
