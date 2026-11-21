import React, { useState } from 'react';
import {
  User,
  Settings,
  Sun,
  Moon,
  Layout,
  PanelLeft,
  DollarSign,
  Save,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Check,
  Briefcase,
  Mail,
  Wallet,
  Building,
} from 'lucide-react';
import { AppSettings, FinancialProfile, UserProfile } from '../types/finance';

interface ProfileSettingsProps {
  userProfile: UserProfile;
  appSettings: AppSettings;
  financialProfile: FinancialProfile;
  onSaveUserProfile: (profile: UserProfile) => void;
  onSaveAppSettings: (settings: AppSettings) => void;
  onSaveFinancialProfile: (finProfile: FinancialProfile) => void;
  onLoadSampleData: () => void;
  onResetData: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  userProfile,
  appSettings,
  financialProfile,
  onSaveUserProfile,
  onSaveAppSettings,
  onSaveFinancialProfile,
  onLoadSampleData,
  onResetData,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'appearance' | 'data'>('profile');

  // Form states
  const [fullName, setFullName] = useState(userProfile.fullName);
  const [email, setEmail] = useState(userProfile.email);
  const [occupation, setOccupation] = useState(userProfile.occupation);
  const [currencySymbol, setCurrencySymbol] = useState(userProfile.currencySymbol);
  const [monthlyIncome, setMonthlyIncome] = useState(userProfile.monthlyIncome);
  const [fixedObligations, setFixedObligations] = useState(userProfile.fixedObligations);
  const [riskTolerance, setRiskTolerance] = useState(userProfile.riskTolerance);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const initials = fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'US';

    const updatedUser: UserProfile = {
      fullName,
      email,
      occupation,
      currencySymbol,
      monthlyIncome: Number(monthlyIncome),
      fixedObligations: Number(fixedObligations),
      riskTolerance,
      avatarInitials: initials,
    };

    const updatedFin: FinancialProfile = {
      ...financialProfile,
      monthlyIncome: Number(monthlyIncome),
      fixedObligations: Number(fixedObligations),
      currencySymbol,
    };

    onSaveUserProfile(updatedUser);
    onSaveFinancialProfile(updatedFin);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleThemeChange = (theme: 'light' | 'dark') => {
    onSaveAppSettings({ ...appSettings, theme });
  };

  const handleNavPositionChange = (navPosition: 'top' | 'side') => {
    onSaveAppSettings({ ...appSettings, navPosition });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-xl shadow-md">
              {userProfile.avatarInitials || 'AS'}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {userProfile.fullName}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {userProfile.occupation} • {userProfile.email}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
              Living Model Active
            </span>
          </div>
        </div>

        {/* Sub Tabs */}
        <div className="mt-6 flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeSubTab === 'profile'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <User className="h-4 w-4" />
            <span>Profile & Income</span>
          </button>

          <button
            onClick={() => setActiveSubTab('appearance')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeSubTab === 'appearance'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Theme & Navigation</span>
          </button>

          <button
            onClick={() => setActiveSubTab('data')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeSubTab === 'data'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Wallet className="h-4 w-4" />
            <span>Data & Controls</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Profile & Income Form */}
      {activeSubTab === 'profile' && (
        <form onSubmit={handleProfileSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">User Information & Living Budget</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              These baseline parameters power your living cash flow calculations, emergency runway, and goal timelines.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            {/* Full Name */}
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center space-x-1.5">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
                required
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center space-x-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
                required
              />
            </div>

            {/* Occupation */}
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center space-x-1.5">
                <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                <span>Occupation / Title</span>
              </label>
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* Currency Symbol */}
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center space-x-1.5">
                <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                <span>Primary Currency</span>
              </label>
              <select
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="₹">₹ INR (Indian Rupee)</option>
                <option value="$">$ USD (US Dollar)</option>
                <option value="€">€ EUR (Euro)</option>
                <option value="£">£ GBP (British Pound)</option>
              </select>
            </div>

            {/* Monthly Inflow */}
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center space-x-1.5">
                <Wallet className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>Monthly Inflow / Net Salary ({currencySymbol})</span>
              </label>
              <input
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500 transition"
                required
              />
            </div>

            {/* Fixed Commitments */}
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center space-x-1.5">
                <Building className="h-3.5 w-3.5 text-blue-500" />
                <span>Fixed Commitments: Rent, EMIs, Utilities ({currencySymbol})</span>
              </label>
              <input
                type="number"
                value={fixedObligations}
                onChange={(e) => setFixedObligations(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500 transition"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-5">
            {savedSuccess ? (
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center space-x-1">
                <Check className="h-4 w-4" />
                <span>Profile & Financial Model Updated Successfully!</span>
              </span>
            ) : (
              <span />
            )}

            <button
              type="submit"
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Appearance & Navigation Settings */}
      {activeSubTab === 'appearance' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-8 shadow-xs">
          {/* Theme Option */}
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Sun className="h-5 w-5 text-amber-500" />
              <span>Interface Theme</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select your preferred visual style. Light Mode offers high-contrast clarity, while Dark Mode provides midnight comfort.
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Light Theme Card */}
              <div
                onClick={() => handleThemeChange('light')}
                className={`p-4 rounded-xl border-2 transition cursor-pointer ${
                  appSettings.theme === 'light'
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                      <Sun className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Clean Light Theme</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Crisp white surfaces, clean typography & zero clutter (Recommended)</p>
                    </div>
                  </div>
                  {appSettings.theme === 'light' && <Check className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                </div>
              </div>

              {/* Dark Theme Card */}
              <div
                onClick={() => handleThemeChange('dark')}
                className={`p-4 rounded-xl border-2 transition cursor-pointer ${
                  appSettings.theme === 'dark'
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                      <Moon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Midnight Dark Theme</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Deep slate executive palette for low-light environments</p>
                    </div>
                  </div>
                  {appSettings.theme === 'dark' && <Check className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Position Option */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Layout className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span>Navigation Layout</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Choose between a modern Top Navigation Bar or an expanded Left Sidebar.
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Top Nav Option */}
              <div
                onClick={() => handleNavPositionChange('top')}
                className={`p-4 rounded-xl border-2 transition cursor-pointer ${
                  appSettings.navPosition === 'top'
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600">
                      <Layout className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Top Navigation Bar</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Horizontal header menu maximizing vertical dashboard space</p>
                    </div>
                  </div>
                  {appSettings.navPosition === 'top' && <Check className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                </div>
              </div>

              {/* Sidebar Option */}
              <div
                onClick={() => handleNavPositionChange('side')}
                className={`p-4 rounded-xl border-2 transition cursor-pointer ${
                  appSettings.navPosition === 'side'
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600">
                      <PanelLeft className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Left Sidebar Navigation</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Fixed vertical sidebar layout inspired by enterprise fintech suites</p>
                    </div>
                  </div>
                  {appSettings.navPosition === 'side' && <Check className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Data Controls & Benchmark Reset */}
      {activeSubTab === 'data' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Data Management & Benchmark Sets</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Zenith stores all data locally in your browser storage with zero external tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Load Benchmark Sample Dataset</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 mb-3">
                Quickly populates sample bank CSV statement with live transactions, subscriptions, and goals for demo walkthrough.
              </p>
              <button
                type="button"
                onClick={onLoadSampleData}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Load Sample Dataset</span>
              </button>
            </div>

            <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20">
              <h4 className="text-xs font-bold text-rose-800 dark:text-rose-300">Reset All Stored Data</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 mb-3">
                Wipes all ingested transactions, learned rules, and resets to clean initial state.
              </p>
              <button
                type="button"
                onClick={onResetData}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset to Clean Slate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
