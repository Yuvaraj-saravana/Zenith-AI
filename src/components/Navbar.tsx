import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  RotateCcw,
  UploadCloud,
  SlidersHorizontal,
  BrainCircuit,
  MessageSquareText,
  LayoutDashboard,
  Settings,
  Sun,
  Moon,
  PanelLeft,
  CheckCircle2,
} from 'lucide-react';
import { AppSettings, UserProfile } from '../types/finance';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userProfile: UserProfile;
  appSettings: AppSettings;
  onToggleTheme: () => void;
  onSwitchNavPosition: () => void;
  onLoadSampleData: () => void;
  onResetData: () => void;
  rulesCount: number;
  anomaliesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  userProfile,
  appSettings,
  onToggleTheme,
  onSwitchNavPosition,
  onLoadSampleData,
  onResetData,
  rulesCount,
  anomaliesCount,
}) => {
  const [showGuardrailsModal, setShowGuardrailsModal] = useState(false);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ingestion', label: 'Ingestion AI', icon: UploadCloud },
    { id: 'simulator', label: 'Simulation AI', icon: SlidersHorizontal },
    {
      id: 'rules',
      label: 'Memory AI',
      icon: BrainCircuit,
      badge: rulesCount > 0 ? rulesCount : undefined,
    },
    { id: 'coach', label: 'Advisor AI', icon: MessageSquareText },
    { id: 'profile', label: 'Profile & Settings', icon: Settings },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Product Brand */}
            <div
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => setActiveTab('dashboard')}
            >
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md">
                <Sparkles className="h-5 w-5 text-white stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Zenith<span className="text-blue-600 dark:text-blue-400">AI</span>
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40 px-2 py-0.5 rounded-full">
                    Living Money Coach
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                  Autonomous Personal Cash Flow & Living Money Model
                </p>
              </div>
            </div>

            {/* Quick Actions, Theme Switcher & Profile Avatar */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Theme Toggle Button */}
              <button
                onClick={onToggleTheme}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer border border-slate-200 dark:border-slate-800"
                title={`Switch to ${appSettings?.theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              >
                {appSettings?.theme === 'dark' ? (
                  <Sun className="h-4 w-4 text-amber-400" />
                ) : (
                  <Moon className="h-4 w-4 text-indigo-500" />
                )}
              </button>

              {/* Sidebar layout toggle */}
              <button
                onClick={onSwitchNavPosition}
                className="hidden lg:flex items-center space-x-1 p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer border border-slate-200 dark:border-slate-800"
                title="Switch to Sidebar Navigation"
              >
                <PanelLeft className="h-4 w-4 text-slate-500" />
                <span className="text-[11px] font-medium hidden xl:inline">Sidebar Nav</span>
              </button>

              {/* Ethical Guardrail Badge */}
              <button
                onClick={() => setShowGuardrailsModal(true)}
                className="hidden md:flex items-center space-x-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition cursor-pointer"
                title="Click to view financial guardrails policy"
              >
                <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>Guardrails Active</span>
              </button>

              {/* 1-Click Load Sample Demo Dataset */}
              <button
                onClick={onLoadSampleData}
                className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Load Benchmark Statement</span>
                <span className="sm:hidden">Sample</span>
              </button>

              {/* Reset button */}
              <button
                onClick={onResetData}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Reset to clean state"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              {/* User Profile Avatar Pill */}
              <button
                onClick={() => setActiveTab('profile')}
                className="flex items-center space-x-2 pl-2 pr-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition cursor-pointer"
              >
                <div className="h-6 w-6 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-[10px]">
                  {userProfile?.avatarInitials || 'AS'}
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 hidden md:inline">
                  {userProfile?.fullName ? userProfile.fullName.split(' ')[0] : 'Profile'}
                </span>
              </button>
            </div>
          </div>

          {/* Navigation Bar Tabs (All ending with "AI") */}
          <div className="flex space-x-1 overflow-x-auto py-2 no-scrollbar border-t border-slate-200 dark:border-slate-800/80">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        tab.id === 'subscriptions'
                          ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30'
                          : 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Guardrails Policy Modal */}
      {showGuardrailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Ethical Financial Guardrails Policy</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Adhering to SEBI & Global Fiduciary Standards</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-start space-x-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50">
                <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white">Educational & Behavioral Coaching Only:</strong> Zenith models personal cash flow, spending drift, and what-if goal scenarios.
                </div>
              </div>

              <div className="flex items-start space-x-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50">
                <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white">Strict Prohibition on Security Endorsements:</strong> The agent strictly rejects answering requests for individual stock picks, options, crypto tips, or speculative trading.
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowGuardrailsModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition cursor-pointer"
              >
                Understood & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
