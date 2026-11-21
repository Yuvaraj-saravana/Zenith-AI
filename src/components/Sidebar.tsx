import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  UploadCloud,
  SlidersHorizontal,
  BrainCircuit,
  MessageSquareText,
  LayoutDashboard,
  Settings,
  Sun,
  Moon,
  Layout,
  CheckCircle2,
} from 'lucide-react';
import { AppSettings, UserProfile } from '../types/finance';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userProfile: UserProfile;
  appSettings: AppSettings;
  onToggleTheme: () => void;
  onSwitchNavPosition: () => void;
  rulesCount: number;
  anomaliesCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  userProfile,
  appSettings,
  onToggleTheme,
  onSwitchNavPosition,
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
      <aside className="w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between h-screen sticky top-0 transition-colors">
        {/* Brand Top Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800">
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md">
              <Sparkles className="h-5 w-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  Zenith<span className="text-blue-600 dark:text-blue-400">AI</span>
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40 px-1.5 py-0.5 rounded">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Living Money Coach</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="p-3 space-y-1 overflow-y-auto flex-1">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Autonomous Modules
          </div>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800/60'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </div>
                {tab.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      tab.id === 'subscriptions'
                        ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40'
                        : 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Actions & User Profile Card */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          {/* Quick theme & layout toggles */}
          <div className="flex items-center justify-between">
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-xs flex items-center space-x-1.5"
              title="Toggle Light / Dark Theme"
            >
              {appSettings?.theme === 'dark' ? (
                <>
                  <Sun className="h-4 w-4 text-amber-400" />
                  <span className="text-[11px]">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-indigo-500" />
                  <span className="text-[11px]">Dark Mode</span>
                </>
              )}
            </button>

            <button
              onClick={onSwitchNavPosition}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-xs flex items-center space-x-1"
              title="Switch to Top Navigation"
            >
              <Layout className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-[11px]">Top Nav</span>
            </button>
          </div>

          {/* Guardrails active pill */}
          <button
            onClick={() => setShowGuardrailsModal(true)}
            className="w-full flex items-center justify-center space-x-1.5 text-[11px] font-semibold py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40 hover:bg-blue-100 transition cursor-pointer"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Fiduciary Guardrails</span>
          </button>

          {/* User Profile Footer Pill */}
          <div
            onClick={() => setActiveTab('profile')}
            className="flex items-center space-x-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/50 cursor-pointer transition"
          >
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
              {userProfile?.avatarInitials || 'AS'}
            </div>
            <div className="truncate flex-1">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{userProfile?.fullName || 'Profile'}</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{userProfile?.occupation || 'Manage Settings'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Guardrails Modal */}
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
