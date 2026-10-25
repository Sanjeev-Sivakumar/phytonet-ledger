import React from 'react';
import {
  Bell,
  Sparkles,
  RefreshCw,
  Box,
  Radio
} from 'lucide-react';
import { NavTabType } from './TopNav';

interface DashboardTopBarProps {
  activeTab: NavTabType;
  connected: boolean;
  isSlashed: boolean;
  onRefreshOracle?: () => void;
  isEvaluatingOracle?: boolean;
  onOpenAiAgent: () => void;
}

export const DashboardTopBar: React.FC<DashboardTopBarProps> = ({
  activeTab,
  connected,
  isSlashed,
  onRefreshOracle,
  isEvaluatingOracle = false,
  onOpenAiAgent
}) => {
  const getTabTitle = (tab: NavTabType) => {
    switch (tab) {
      case 'overview':
        return 'Dashboard';
      case 'trading':
        return 'Carbon Trading';
      case 'emissions':
        return 'Emissions Engine';
      case 'supplychain':
        return 'Digital Passports';
      case 'terminal':
        return 'Hardware Terminal';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 select-none">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {getTabTitle(activeTab)}
        </h2>
      </div>

      {/* Right Controls: Station Status, Ledger, Bell, AI Copilot, Sanjeev Profile */}
      <div className="flex items-center flex-wrap gap-3">
        {/* Hardware Station Status Badge */}
        <div className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full border text-xs font-mono font-semibold shadow-xs ${
          isSlashed
            ? 'bg-rose-50 border-rose-200 text-rose-700'
            : connected
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-amber-50 border-amber-200 text-amber-700'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            isSlashed
              ? 'bg-rose-600 animate-pulse'
              : connected
              ? 'bg-emerald-600 animate-pulse'
              : 'bg-amber-500'
          }`} />
          <span>{isSlashed ? 'Consensus exception' : connected ? 'Bio-Node Online' : 'Connecting Bio-Node'}</span>
        </div>

        {/* Blockchain Ledger Subnet */}
        <div
          title="Polygon ClimateChain Subnet: Active"
          className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition-colors shadow-xs cursor-pointer"
        >
          <Box className="w-4 h-4" />
        </div>

        {/* Notifications */}
        <div
          title="Verified PoVI consensus blocks committed"
          className="relative w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition-colors shadow-xs cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
        </div>

        {/* AI Agent Trigger */}
        <button
          onClick={onOpenAiAgent}
          className="flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#4F46E5] to-[#6366F1] text-white hover:from-[#4338CA] hover:to-[#4F46E5] text-xs font-bold shadow-sm active:scale-95 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>AI Agent</span>
        </button>

        {/* Recalculate Oracle */}
        {onRefreshOracle && (
          <button
            onClick={onRefreshOracle}
            disabled={isEvaluatingOracle}
            title="Recalculate Gemini AI carbon flux oracle"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs disabled:opacity-50 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${isEvaluatingOracle ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Evaluate</span>
          </button>
        )}

        {/* User Profile Pill - Clean 'Sanjeev' */}
        <div className="flex items-center space-x-2.5 bg-white pl-2 pr-4 py-1.5 rounded-full border border-slate-200 shadow-xs">
          <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold font-mono">
            S
          </div>
          <span className="text-xs font-bold text-slate-900">
            Sanjeev
          </span>
        </div>
      </div>
    </header>
  );
};
