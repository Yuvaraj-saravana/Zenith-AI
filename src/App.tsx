import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LivingDashboard } from './components/LivingDashboard';
import { IngestionLab } from './components/IngestionLab';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { SubscriptionRadar } from './components/SubscriptionRadar';
import { RuleMemoryCenter } from './components/RuleMemoryCenter';
import { GuardrailsChatModal } from './components/GuardrailsChatModal';
import { ProfileSettings } from './components/ProfileSettings';

import {
  AppSettings,
  FinancialProfile,
  LearnedRule,
  Nudge,
  SubscriptionItem,
  Transaction,
  UserProfile,
} from './types/finance';
import { StorageService } from './services/storage';
import { AgentEngine } from './services/agentEngine';
import { SAMPLE_CSV_DATA } from './services/sampleData';
import { CheckCircle2 } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [userProfile, setUserProfile] = useState<UserProfile>(StorageService.getUserProfile());
  const [appSettings, setAppSettings] = useState<AppSettings>(StorageService.getSettings());
  const [profile, setProfile] = useState<FinancialProfile>(StorageService.getProfile());
  const [transactions, setTransactions] = useState<Transaction[]>(StorageService.getTransactions());
  const [categories, setCategories] = useState<string[]>(StorageService.getCategories());
  const [rules, setRules] = useState<LearnedRule[]>(StorageService.getRules());
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>(StorageService.getSubscriptions());
  const [nudges, setNudges] = useState<Nudge[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync HTML root element class for dark mode styling
  useEffect(() => {
    if (appSettings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [appSettings.theme]);

  // Recalculate dynamic subscriptions & nudges whenever transactions change
  useEffect(() => {
    if (transactions.length > 0) {
      const updatedSubs = AgentEngine.detectSubscriptionAnomalies(transactions, subscriptions);
      setSubscriptions(updatedSubs);
      StorageService.saveSubscriptions(updatedSubs);

      const generatedNudges = AgentEngine.generateNudges(transactions, profile, updatedSubs);
      setNudges(generatedNudges);
      StorageService.saveNudges(generatedNudges);
    } else {
      setNudges([]);
    }
  }, [transactions, profile]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Theme & Layout handlers
  const handleToggleTheme = () => {
    const nextTheme = appSettings.theme === 'light' ? 'dark' : 'light';
    const nextSettings: AppSettings = { ...appSettings, theme: nextTheme };
    setAppSettings(nextSettings);
    StorageService.saveSettings(nextSettings);
    showToast(`Switched to ${nextTheme === 'light' ? 'Clean Light' : 'Midnight Dark'} Mode`);
  };

  const handleSwitchNavPosition = () => {
    const nextPos = appSettings.navPosition === 'top' ? 'side' : 'top';
    const nextSettings: AppSettings = { ...appSettings, navPosition: nextPos };
    setAppSettings(nextSettings);
    StorageService.saveSettings(nextSettings);
    showToast(`Switched navigation layout to ${nextPos === 'top' ? 'Top Bar' : 'Left Sidebar'}`);
  };

  // 1. Ingestion Handler (Real Statement Parser)
  const handleIngest = (rawContent: string, format: 'csv' | 'pdf' | 'sms') => {
    const parsed = AgentEngine.parseTransactions(rawContent, format);
    const combined = [...parsed, ...transactions];
    // Deduplicate
    const unique = combined.filter(
      (v, i, a) => a.findIndex((t) => t.rawDescription === v.rawDescription && t.amount === v.amount) === i
    );

    StorageService.saveTransactions(unique);
    setTransactions(unique);
    showToast(`Ingestion AI processed & added ${parsed.length} transactions! Please assign categories.`);
  };

  // 2. Category update on single transaction
  const handleUpdateCategory = (txnId: string, newCategory: string) => {
    const updated = transactions.map((t) => (t.id === txnId ? { ...t, category: newCategory } : t));
    StorageService.saveTransactions(updated);
    setTransactions(updated);
    showToast(`Category assigned: "${newCategory}"`);
  };

  // 3. Dynamic Rule Learning (Memory AI)
  const handleLearnRule = (merchantPattern: string, newCategory: string) => {
    const { updatedRules, updatedTransactions } = AgentEngine.learnCategoryRule(
      merchantPattern,
      newCategory,
      transactions
    );
    setRules(updatedRules);
    setTransactions(updatedTransactions);
    showToast(`⚡ Memory AI: Future "${merchantPattern}" txns will map to "${newCategory}"!`);
  };

  // 4. Add Custom Rule
  const handleAddCustomRule = (pattern: string, category: string) => {
    const newRule: LearnedRule = {
      id: `rule-${Date.now()}`,
      merchantPattern: pattern,
      category,
      source: 'user_correction',
      createdAt: new Date().toISOString().slice(0, 10),
      applyCount: 0,
    };
    const updatedRules = StorageService.saveRule(newRule);
    setRules(updatedRules);
    showToast(`Added custom rule for "${pattern}" to Memory AI`);
  };

  // 5. Delete Rule
  const handleDeleteRule = (ruleId: string) => {
    const updatedRules = StorageService.deleteRule(ruleId);
    setRules(updatedRules);
    showToast('Rule removed from Memory AI');
  };

  // 6. Category Management (Requirement #3)
  const handleAddCategory = (newCat: string) => {
    const updated = StorageService.saveCategory(newCat);
    setCategories(updated);
    showToast(`Category "${newCat}" added! Available in Ingestion AI.`);
  };

  const handleDeleteCategory = (cat: string) => {
    const updated = StorageService.deleteCategory(cat);
    setCategories(updated);
    showToast(`Category "${cat}" removed`);
  };

  // 7. Transaction CRUD (Requirement #1: Review, Edit, Delete)
  const handleDeleteTransaction = (txnId: string) => {
    const updated = StorageService.deleteTransaction(txnId);
    setTransactions(updated);
    showToast('Transaction removed from ledger');
  };

  const handleEditTransaction = (updatedTxn: Transaction) => {
    const updated = StorageService.updateTransaction(updatedTxn);
    setTransactions(updated);
    showToast('Transaction details updated successfully');
  };

  // 8. Toggle Subscription status
  const handleToggleSubStatus = (subId: string) => {
    const updated = subscriptions.map((s) => {
      if (s.id === subId) {
        return {
          ...s,
          status: 'active' as const,
          inactivityNote: 'Paused & money leak eliminated!',
          priceChangeNote: 'Price hike acknowledged.',
        };
      }
      return s;
    });
    StorageService.saveSubscriptions(updated);
    setSubscriptions(updated);
    showToast('Subscription updated & savings redirected to living goals!');
  };

  // 9. Load Benchmark Statement (1-Click Sample Ingestion)
  const handleLoadSampleData = () => {
    const sampleTxns = AgentEngine.parseTransactions(SAMPLE_CSV_DATA, 'csv');
    StorageService.saveTransactions(sampleTxns);
    setTransactions(sampleTxns);
    setActiveTab('dashboard');
    showToast('Benchmark statement ingested with live transactions & active subscriptions!');
  };

  // 10. Reset Data to Clean Slate
  const handleResetData = () => {
    StorageService.resetAll();
    setTransactions([]);
    setRules(StorageService.getRules());
    setCategories(StorageService.getCategories());
    setProfile(StorageService.getProfile());
    setUserProfile(StorageService.getUserProfile());
    setSubscriptions([]);
    setNudges([]);
    showToast('Reset to clean initial slate (Zero mock data)');
  };

  const isSidebar = appSettings.navPosition === 'side';

  return (
    <div className={`min-h-screen ${appSettings.theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} flex ${isSidebar ? 'flex-row' : 'flex-col'} font-sans antialiased transition-colors`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-3 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-2xl animate-bounce">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Render Sidebar Navigation if enabled */}
      {isSidebar && (
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userProfile={userProfile}
          appSettings={appSettings}
          onToggleTheme={handleToggleTheme}
          onSwitchNavPosition={handleSwitchNavPosition}
          rulesCount={rules.length}
          anomaliesCount={subscriptions.filter((s) => s.status !== 'active').length}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Render Top Navbar if enabled */}
        {!isSidebar && (
          <Navbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            userProfile={userProfile}
            appSettings={appSettings}
            onToggleTheme={handleToggleTheme}
            onSwitchNavPosition={handleSwitchNavPosition}
            onLoadSampleData={handleLoadSampleData}
            onResetData={handleResetData}
            rulesCount={rules.length}
            anomaliesCount={subscriptions.filter((s) => s.status !== 'active').length}
          />
        )}

        {/* View Tabs */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'dashboard' && (
            <LivingDashboard
              profile={profile}
              userProfile={userProfile}
              transactions={transactions}
              subscriptions={subscriptions}
              nudges={nudges}
              onNavigateTab={setActiveTab}
              onLoadSampleData={handleLoadSampleData}
            />
          )}

          {activeTab === 'ingestion' && (
            <IngestionLab
              transactions={transactions}
              categories={categories}
              rules={rules}
              onIngest={handleIngest}
              onUpdateCategory={handleUpdateCategory}
              onLearnRule={handleLearnRule}
              onDeleteTransaction={handleDeleteTransaction}
              onEditTransaction={handleEditTransaction}
              currencySymbol={profile.currencySymbol}
            />
          )}

          {activeTab === 'simulator' && (
            <WhatIfSimulator
              profile={profile}
              transactions={transactions}
              subscriptions={subscriptions}
              currencySymbol={profile.currencySymbol}
              onUpdateGoals={(updatedGoals) => {
                const updated = { ...profile, goals: updatedGoals };
                setProfile(updated);
                StorageService.saveProfile(updated);
                showToast('Goals and budget updated successfully!');
              }}
              onUpdateProfile={(updatedProfile) => {
                setProfile(updatedProfile);
                StorageService.saveProfile(updatedProfile);
                showToast('Financial profile & budget updated!');
              }}
            />
          )}

          {activeTab === 'subscriptions' && (
            <SubscriptionRadar
              subscriptions={subscriptions}
              onToggleStatus={handleToggleSubStatus}
              currencySymbol={profile.currencySymbol}
            />
          )}

          {activeTab === 'rules' && (
            <RuleMemoryCenter
              rules={rules}
              categories={categories}
              transactions={transactions}
              currencySymbol={profile.currencySymbol}
              onAddRule={handleAddCustomRule}
              onDeleteRule={handleDeleteRule}
              onAddCategory={handleAddCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          )}

          {activeTab === 'coach' && (
            <GuardrailsChatModal
              profile={profile}
              transactions={transactions}
              subscriptions={subscriptions}
              currencySymbol={profile.currencySymbol}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileSettings
              userProfile={userProfile}
              appSettings={appSettings}
              financialProfile={profile}
              onSaveUserProfile={(up) => {
                setUserProfile(up);
                StorageService.saveUserProfile(up);
              }}
              onSaveAppSettings={(as) => {
                setAppSettings(as);
                StorageService.saveSettings(as);
              }}
              onSaveFinancialProfile={(fp) => {
                setProfile(fp);
                StorageService.saveProfile(fp);
              }}
              onLoadSampleData={handleLoadSampleData}
              onResetData={handleResetData}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 py-5 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-center space-x-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">Zenith AI</span>
            <span>•</span>
            <span>The Living Money Coach</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
