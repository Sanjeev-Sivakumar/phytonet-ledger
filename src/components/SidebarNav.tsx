import React, { useState } from 'react';
import {
  LayoutDashboard,
  Factory,
  Coins,
  ShieldCheck,
  Terminal,
  Settings,
  HelpCircle,
  Search,
  Sparkles,
  Command,
  Leaf
} from 'lucide-react';
import { NavTabType } from './TopNav';

interface SidebarNavProps {
  activeTab: NavTabType;
  setActiveTab: (tab: NavTabType) => void;
  onOpenAiAgent: () => void;
  onOpenSettings: () => void;
  onOpenDocs: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenAiAgent,
  onOpenSettings,
  onOpenDocs
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const mainNavItems = [
    {
      id: 'overview' as NavTabType,
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      id: 'emissions' as NavTabType,
      label: 'Emissions',
      icon: <Factory className="w-5 h-5" />
    },
    {
      id: 'trading' as NavTabType,
      label: 'Carbon trading',
      icon: <Coins className="w-5 h-5" />
    },
    {
      id: 'supplychain' as NavTabType,
      label: 'Digital passports',
      icon: <ShieldCheck className="w-5 h-5" />
    },
    {
      id: 'terminal' as NavTabType,
      label: 'Hardware terminal',
      icon: <Terminal className="w-5 h-5" />
    },
    {
      id: 'evidence' as NavTabType,
      label: 'Evidence & audit',
      icon: <ShieldCheck className="w-5 h-5 text-rose-500" />
    }
  ];

  return (
    <aside className="w-64 sm:w-72 bg-white flex flex-col justify-between p-5 border-r border-[#E2E8F0] min-h-screen select-none flex-shrink-0">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center space-x-3 px-1 py-1">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#4F46E5] to-[#10B981] flex items-center justify-center shadow-md shadow-indigo-100">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
              PhytoNet Ledger
            </h1>
            <span className="text-[11px] font-mono font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded mt-1 inline-block">
              ClimateChain v2.4
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="flex items-center bg-[#F1F3F9] rounded-2xl px-3.5 py-2.5 border border-transparent focus-within:border-indigo-400 focus-within:bg-white transition-all">
            <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for..."
              className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
            />
            <div className="flex items-center space-x-0.5 bg-white border border-slate-200 text-slate-400 px-1.5 py-0.5 rounded-md text-[10px] font-mono shadow-xs">
              <Command className="w-3 h-3" />
              <span>F</span>
            </div>
          </div>
        </div>

        {/* Section: MAIN */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold text-slate-400 tracking-wider uppercase px-3 mb-2 font-mono">
            MAIN
          </div>

          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-[#EEF2FF] text-[#4F46E5] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={isActive ? 'text-[#4F46E5]' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span className={isActive ? 'font-bold text-[#4338CA]' : 'font-medium'}>
                      {item.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Section: SYSTEM */}
        <div className="space-y-1.5 pt-2">
          <div className="text-[11px] font-bold text-slate-400 tracking-wider uppercase px-3 mb-2 font-mono">
            SYSTEM
          </div>

          <nav className="space-y-1">
            <button
              onClick={onOpenSettings}
              className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
            >
              <Settings className="w-5 h-5 text-slate-400" />
              <span>Settings & Faults</span>
            </button>

            <button
              onClick={onOpenDocs}
              className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
            >
              <HelpCircle className="w-5 h-5 text-slate-400" />
              <span>Protocol Help</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Clean AI Copilot Feature Card */}
      <div className="mt-6 p-4 rounded-3xl bg-slate-900 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white leading-tight">
                PhytoNet AI Copilot
              </h4>
              <span className="text-[11px] text-emerald-400 font-mono font-medium">
                Live Biophysical Reasoner
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-snug">
            Autonomous sap potential telemetry analysis and smart contract arbitrage
          </p>

          <button
            onClick={onOpenAiAgent}
            className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white py-2 rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-all text-center"
          >
            Open AI Agent
          </button>
        </div>
      </div>
    </aside>
  );
};
