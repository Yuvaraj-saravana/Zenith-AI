import React, { useState, useEffect, useRef } from 'react';
import {
  SlidersHorizontal,
  TrendingUp,
  Percent,
  Home,
  Zap,
  Plus,
  Trash2,
  Edit3,
  Target,
  ShieldCheck,
  ShieldAlert,
  Plane,
  Car,
  GraduationCap,
  DollarSign,
  X,
  BarChart3,
  LineChart as LineChartIcon,
  PartyPopper,
  UtensilsCrossed,
  Coffee,
  CookingPot,
  ChefHat,
  Building2,
  Crown,
  ArrowDownLeft,
  Laptop,
  Briefcase,
  Moon,
  Flame,
  Rocket,
} from 'lucide-react';
import { FinancialProfile, Goal, SubscriptionItem, Transaction, WhatIfParams } from '../types/finance';
import { AgentEngine } from '../services/agentEngine';
import confetti from 'canvas-confetti';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

interface WhatIfSimulatorProps {
  profile: FinancialProfile;
  transactions: Transaction[];
  subscriptions: SubscriptionItem[];
  currencySymbol: string;
  onUpdateGoals?: (updatedGoals: Goal[]) => void;
  onUpdateProfile?: (updatedProfile: FinancialProfile) => void;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  profile,
  transactions,
  subscriptions,
  currencySymbol,
  onUpdateGoals,
  onUpdateProfile: _onUpdateProfile,
}) => {
  // Scenario levers state
  const [params, setParams] = useState<WhatIfParams>({
    diningCutPercent: 30, // 30% cut by default as requested in hackathon benchmark
    rentChangeAmount: 0,
    cancelUnusedSubscriptions: true,
    additionalMonthlyIncome: 0,
  });

  // Chart view toggle: Area trajectory vs Goal timeline bars
  const [activeChartView, setActiveChartView] = useState<'trajectory' | 'timeline'>('trajectory');

  // Automatic celebration notification state
  const [celebrationEvent, setCelebrationEvent] = useState<{
    goalTitle: string;
    monthsSaved: number;
    completionDate: string;
  } | null>(null);

  // Modal state for Add/Edit Goal
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [goalForm, setGoalForm] = useState<{
    title: string;
    category: string;
    targetAmount: number;
    currentAmount: number;
    monthlyAllocation: number;
    targetDate: string;
    priority: 'high' | 'medium' | 'low';
    iconName: string;
  }>({
    title: '',
    category: 'Security',
    targetAmount: 200000,
    currentAmount: 50000,
    monthlyAllocation: 15000,
    targetDate: '2027-12',
    priority: 'high',
    iconName: 'Target',
  });

  // Execute Living Money Model simulation
  const simulation = AgentEngine.runWhatIfSimulation(profile, transactions, subscriptions, params);

  // Compute dining out baseline expenditure
  const diningExpense = transactions
    .filter((t) => t.type === 'debit' && t.category === 'Food & Dining')
    .reduce((s, t) => s + t.amount, 0);

  const diningSaved = Math.round(diningExpense * (params.diningCutPercent / 100));

  // Compute total monthly budget allocated to goals
  const totalGoalsBudget = profile.goals.reduce((sum, g) => sum + g.monthlyAllocation, 0);
  const totalMonthsSaved = simulation.goalsProgress.reduce((sum, g) => sum + g.monthsSaved, 0);

  // Automatic Goal Celebration Trigger:
  // When a goal achieves acceleration or milestone completion due to user's what-if configuration
  const lastCelebratedKeyRef = useRef<string>('');
  useEffect(() => {
    // Check if any goal is accelerated by at least 1 month
    const acceleratedGoal = simulation.goalsProgress.find((g) => g.monthsSaved > 0);
    if (acceleratedGoal && simulation.monthlySurplusDelta > 0) {
      const currentCelebrationKey = `${acceleratedGoal.goalId}-${acceleratedGoal.monthsSaved}-${params.diningCutPercent}-${params.cancelUnusedSubscriptions}-${params.additionalMonthlyIncome}`;
      if (lastCelebratedKeyRef.current !== currentCelebrationKey) {
        lastCelebratedKeyRef.current = currentCelebrationKey;
        setCelebrationEvent({
          goalTitle: acceleratedGoal.goalTitle,
          monthsSaved: acceleratedGoal.monthsSaved,
          completionDate: acceleratedGoal.acceleratedCompletionDate,
        });

        // Trigger colorful confetti celebration automatically!
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.65 },
          colors: ['#2563eb', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4'],
        });

        const timer = setTimeout(() => {
          setCelebrationEvent(null);
        }, 7000);
        return () => clearTimeout(timer);
      }
    }
  }, [simulation.monthlySurplusDelta, simulation.goalsProgress, params]);

  // Generate 12-Month Net Worth Trajectory Area Chart Data
  const projectionData = Array.from({ length: 12 }, (_, i) => {
    const month = `M${i + 1}`;
    const baseline = profile.emergencyFundCurrent + simulation.monthlySavingsBaseline * (i + 1);
    const simulated = profile.emergencyFundCurrent + simulation.monthlySavingsSimulated * (i + 1);
    return {
      month,
      Baseline: baseline,
      Simulated: simulated,
      Gain: Math.max(0, simulated - baseline),
    };
  });

  // Goal Timeline Acceleration comparison data
  const timelineComparisonData = simulation.goalsProgress.map((g) => ({
    name: g.goalTitle.length > 18 ? `${g.goalTitle.slice(0, 16)}...` : g.goalTitle,
    OriginalMonths: g.baselineMonthsRemaining,
    SimulatedMonths: g.simulatedMonthsRemaining,
    Saved: g.monthsSaved,
  }));

  // Open Add Goal Modal
  const handleOpenAddGoal = () => {
    setEditingGoalId(null);
    setGoalForm({
      title: '',
      category: 'Security',
      targetAmount: 250000,
      currentAmount: 50000,
      monthlyAllocation: 15000,
      targetDate: '2027-12',
      priority: 'high',
      iconName: 'Target',
    });
    setShowGoalModal(true);
  };

  // Open Edit Goal Modal
  const handleOpenEditGoal = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setGoalForm({
      title: goal.title,
      category: goal.category,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      monthlyAllocation: goal.monthlyAllocation,
      targetDate: goal.targetDate,
      priority: goal.priority,
      iconName: goal.iconName || 'Target',
    });
    setShowGoalModal(true);
  };

  // Save Goal Handler
  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalForm.title.trim()) return;

    if (editingGoalId) {
      // Edit existing goal
      const updatedGoals = profile.goals.map((g) =>
        g.id === editingGoalId
          ? {
              ...g,
              ...goalForm,
              targetAmount: Number(goalForm.targetAmount),
              currentAmount: Number(goalForm.currentAmount),
              monthlyAllocation: Number(goalForm.monthlyAllocation),
            }
          : g
      );
      if (onUpdateGoals) onUpdateGoals(updatedGoals);
    } else {
      // Create new custom goal
      const newGoal: Goal = {
        id: `goal-${Date.now()}`,
        title: goalForm.title.trim(),
        category: goalForm.category,
        targetAmount: Number(goalForm.targetAmount),
        currentAmount: Number(goalForm.currentAmount),
        monthlyAllocation: Number(goalForm.monthlyAllocation),
        targetDate: goalForm.targetDate,
        priority: goalForm.priority,
        iconName: goalForm.iconName,
      };
      const updatedGoals = [...profile.goals, newGoal];
      if (onUpdateGoals) onUpdateGoals(updatedGoals);
    }

    setShowGoalModal(false);
  };

  // Delete Goal Handler
  const handleDeleteGoal = (goalId: string) => {
    if (confirm('Are you sure you want to remove this financial goal?')) {
      const updatedGoals = profile.goals.filter((g) => g.id !== goalId);
      if (onUpdateGoals) onUpdateGoals(updatedGoals);
    }
  };

  // Quick Preset Helper for Goal Creation
  const handleApplyPreset = (preset: {
    title: string;
    category: string;
    targetAmount: number;
    monthlyAllocation: number;
    iconName: string;
  }) => {
    setGoalForm((prev) => ({
      ...prev,
      title: preset.title,
      category: preset.category,
      targetAmount: preset.targetAmount,
      monthlyAllocation: preset.monthlyAllocation,
      iconName: preset.iconName,
    }));
  };

  // Category Icon & Color Mapping
  const getCategoryDetails = (category: string, iconName?: string) => {
    if (iconName === 'Plane' || category === 'Travel') {
      return {
        Icon: Plane,
        bg: 'bg-sky-50 dark:bg-sky-950/30',
        border: 'border-sky-200 dark:border-sky-800/40',
        text: 'text-sky-700 dark:text-sky-400',
        bar: 'from-sky-500 to-blue-500',
      };
    }
    if (iconName === 'Home' || category === 'Asset' || category === 'Housing') {
      return {
        Icon: Home,
        bg: 'bg-indigo-50 dark:bg-indigo-950/30',
        border: 'border-indigo-200 dark:border-indigo-800/40',
        text: 'text-indigo-700 dark:text-indigo-400',
        bar: 'from-indigo-500 to-purple-500',
      };
    }
    if (iconName === 'Car' || category === 'Vehicle') {
      return {
        Icon: Car,
        bg: 'bg-amber-50 dark:bg-amber-950/30',
        border: 'border-amber-200 dark:border-amber-800/40',
        text: 'text-amber-700 dark:text-amber-400',
        bar: 'from-amber-500 to-orange-500',
      };
    }
    if (iconName === 'GraduationCap' || category === 'Education') {
      return {
        Icon: GraduationCap,
        bg: 'bg-violet-50 dark:bg-violet-950/30',
        border: 'border-violet-200 dark:border-violet-800/40',
        text: 'text-violet-700 dark:text-violet-400',
        bar: 'from-violet-500 to-fuchsia-500',
      };
    }
    return {
      Icon: ShieldCheck,
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      border: 'border-emerald-200 dark:border-emerald-800/40',
      text: 'text-emerald-700 dark:text-emerald-400',
      bar: 'from-emerald-500 to-teal-500',
    };
  };

  return (
    <div className="space-y-6">
      {/* Top Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Simulation AI
            </h2>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
              Live Money Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time algebraic scenario modeling & living goals acceleration
          </p>
        </div>

        <button
          onClick={handleOpenAddGoal}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Goal & Budget</span>
        </button>
      </div>

      {/* Automatic Goal Celebration Banner */}
      {celebrationEvent && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 text-white p-4 sm:p-5 shadow-xl animate-fade-in">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                <PartyPopper className="h-6 w-6 text-yellow-300 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs uppercase font-extrabold tracking-wider bg-white/20 px-2 py-0.5 rounded">
                    Goal Milestone Accelerated!
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black mt-1">
                  "{celebrationEvent.goalTitle}" reaches completion{' '}
                  <span className="text-yellow-300 underline font-extrabold">
                    {celebrationEvent.monthsSaved} Months Sooner
                  </span>{' '}
                  in {celebrationEvent.completionDate}!
                </h3>
              </div>
            </div>
            <button
              onClick={() => setCelebrationEvent(null)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition cursor-pointer shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* 4 Top Colorful KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Baseline Savings */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/70 via-white to-blue-100/30 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/20 border border-blue-200/80 dark:border-blue-900/40 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Baseline Monthly Savings</span>
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {currencySymbol}{simulation.monthlySavingsBaseline.toLocaleString()}
              <span className="text-xs font-normal text-slate-400">/mo</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Current unoptimized run-rate</p>
          </div>
        </div>

        {/* Metric 2: Simulated Monthly Savings */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-white to-teal-100/30 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 dark:text-emerald-400">
            <span>Simulated Savings</span>
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight">
              {currencySymbol}{simulation.monthlySavingsSimulated.toLocaleString()}
              <span className="text-xs font-normal text-emerald-600">/mo</span>
            </div>
            <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/20 px-2 py-0.5 rounded-full mt-1">
              +{currencySymbol}{simulation.monthlySurplusDelta.toLocaleString()}/mo Surplus Delta
            </span>
          </div>
        </div>

        {/* Metric 3: Total Goal Budget Allocation */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50/70 via-white to-violet-100/30 dark:from-slate-900 dark:via-slate-900 dark:to-purple-950/20 border border-purple-200/80 dark:border-purple-800/40 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-purple-800 dark:text-purple-400">
            <span>Total Goal Budget</span>
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <Target className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-black text-purple-700 dark:text-purple-300 tracking-tight">
              {currencySymbol}{totalGoalsBudget.toLocaleString()}
              <span className="text-xs font-normal text-purple-500">/mo</span>
            </div>
            <p className="text-[11px] text-purple-600 dark:text-purple-400 mt-1">
              Across {profile.goals.length} living goal milestones
            </p>
          </div>
        </div>

        {/* Metric 4: Goal Acceleration Velocity */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/70 via-white to-orange-100/30 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-800 dark:text-amber-400">
            <span>Living Milestone Speedup</span>
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
              +{totalMonthsSaved} Months
            </div>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">Combined time saved on all goals</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Tactical Controls on Left, Visualizations on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scenario Controls Column (5 cols) - 3 UNIQUE DISTINCT DESIGNS */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-sm relative overflow-hidden">
            {/* Header with Master Surplus Power HUD */}
            <div className="flex flex-col gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
                    <SlidersHorizontal className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                      Simulation Levers
                    </h3>
                    <p className="text-[10px] text-slate-400">Tactical Money Controls</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 font-extrabold text-xs shadow-xs">
                  <Zap className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
                  <span>+{currencySymbol}{simulation.monthlySurplusDelta.toLocaleString()}/mo Power</span>
                </div>
              </div>

              {/* Graphical Master Energy Velocity Meter (5-segment LED gauge) */}
              <div className="space-y-1 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <span>Surplus Intensity Meter</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-black">
                    {simulation.monthlySurplusDelta > 20000
                      ? '⚡ Maximum Thrust'
                      : simulation.monthlySurplusDelta > 5000
                      ? '🔥 High Acceleration'
                      : '🌱 Steady Run'}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5 h-2 pt-0.5">
                  {[1, 2, 3, 4, 5].map((lvl) => {
                    const activeThreshold = lvl * 6000;
                    const isActive = simulation.monthlySurplusDelta >= (lvl === 1 ? 500 : activeThreshold - 3000);
                    return (
                      <div
                        key={lvl}
                        className={`rounded-full transition-all duration-300 ${
                          isActive
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-xs shadow-emerald-500/50'
                            : 'bg-slate-200 dark:bg-slate-700/60'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* LEVER 1 [STYLE A: CIRCULAR DIAL & NOTCH STEP GAUGE]: Dining Out Spending */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-transparent border border-emerald-500/25 dark:border-emerald-500/20 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <UtensilsCrossed className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-white block tracking-tight">
                      Cut Dining Out Spending
                    </span>
                    <span className="text-[10px] text-slate-400">Home meals vs. delivery</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-emerald-300/60 dark:border-emerald-800">
                    {params.diningCutPercent}% Cut (+{currencySymbol}{diningSaved.toLocaleString()}/mo)
                  </span>
                </div>
              </div>

              {/* 10-Notch Graduated Step Bar */}
              <div className="space-y-1">
                <div className="flex justify-between items-center gap-1">
                  {Array.from({ length: 10 }).map((_, idx) => {
                    const stepThreshold = (idx + 1) * 5;
                    const isLit = params.diningCutPercent >= stepThreshold;
                    return (
                      <div
                        key={idx}
                        className={`flex-1 h-1.5 rounded-full transition-all duration-200 ${
                          isLit
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-xs shadow-emerald-500/40'
                            : 'bg-slate-200 dark:bg-slate-700/60'
                        }`}
                      />
                    );
                  })}
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={params.diningCutPercent}
                  onChange={(e) => setParams({ ...params, diningCutPercent: Number(e.target.value) })}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              {/* 4 Floating Circular Pods with Real SVG Icons */}
              <div className="grid grid-cols-4 gap-2 pt-1">
                {[
                  { pct: 0, label: 'Normal', desc: 'Takeout', Icon: UtensilsCrossed },
                  { pct: 15, label: 'Mindful', desc: '+1 Cook', Icon: Coffee },
                  { pct: 30, label: 'Optimal', desc: '+2 Cook', Icon: CookingPot },
                  { pct: 50, label: 'Monk', desc: 'Chef Mode', Icon: ChefHat },
                ].map((item) => {
                  const ItemIcon = item.Icon;
                  const isSelected = params.diningCutPercent === item.pct;
                  return (
                    <button
                      key={item.pct}
                      type="button"
                      onClick={() => setParams({ ...params, diningCutPercent: item.pct })}
                      className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 scale-102 font-bold'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-emerald-400/60'
                      }`}
                    >
                      <div
                        className={`p-1.5 rounded-xl mb-1 ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        <ItemIcon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-[11px] font-black leading-none">{item.pct}%</span>
                      <span
                        className={`text-[9px] mt-0.5 ${
                          isSelected ? 'text-emerald-100 font-semibold' : 'text-slate-400'
                        }`}
                      >
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* LEVER 2 [STYLE B: DUAL-POLARITY ARCHITECTURAL BALANCE SCALE]: Rent / Housing Adjustment */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/5 via-slate-500/5 to-rose-500/5 border border-indigo-500/20 dark:border-indigo-500/20 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-white block tracking-tight">
                      Rent / Housing Adjustment
                    </span>
                    <span className="text-[10px] text-slate-400">Relocation or lease revision</span>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-black px-2.5 py-1 rounded-xl border ${
                    params.rentChangeAmount > 0
                      ? 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800'
                      : params.rentChangeAmount < 0
                      ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800'
                      : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {params.rentChangeAmount > 0
                    ? `+${currencySymbol}${params.rentChangeAmount.toLocaleString()} Hike`
                    : params.rentChangeAmount < 0
                    ? `-${currencySymbol}${Math.abs(params.rentChangeAmount).toLocaleString()} Cut`
                    : '₹0 Baseline'}
                </span>
              </div>

              {/* Center-Pivot Dual-Polarity Slider */}
              <div className="space-y-1">
                <div className="relative pt-1">
                  <input
                    type="range"
                    min="-5000"
                    max="10000"
                    step="1000"
                    value={params.rentChangeAmount}
                    onChange={(e) => setParams({ ...params, rentChangeAmount: Number(e.target.value) })}
                    className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  {/* Zero-point center reference tick */}
                  <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 px-1 pt-0.5">
                    <span className="text-emerald-600 font-extrabold">-₹5,000 (Relocate)</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-black">| ₹0 Baseline</span>
                    <span className="text-rose-600 font-extrabold">+₹10,000 (Upgrade)</span>
                  </div>
                </div>
              </div>

              {/* 4 Architectural Blueprint Ribbons with Real SVG Icons */}
              <div className="grid grid-cols-4 gap-2 pt-1">
                {[
                  { val: -5000, label: 'Downsize', badge: '-₹5k', Icon: ArrowDownLeft, theme: 'emerald' },
                  { val: 0, label: 'Baseline', badge: '₹0', Icon: Home, theme: 'indigo' },
                  { val: 5000, label: 'Modest', badge: '+₹5k', Icon: Building2, theme: 'amber' },
                  { val: 10000, label: 'Upgrade', badge: '+₹10k', Icon: Crown, theme: 'rose' },
                ].map((item) => {
                  const ItemIcon = item.Icon;
                  const isSelected = params.rentChangeAmount === item.val;
                  return (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setParams({ ...params, rentChangeAmount: item.val })}
                      className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 scale-102 font-bold'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-400/60'
                      }`}
                    >
                      <div
                        className={`p-1.5 rounded-xl mb-1 ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        <ItemIcon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-[11px] font-black leading-none">{item.badge}</span>
                      <span
                        className={`text-[9px] mt-0.5 ${
                          isSelected ? 'text-indigo-100 font-semibold' : 'text-slate-400'
                        }`}
                      >
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* LEVER 3: ⚡ Zombie Subscription Surge Breaker (High-Voltage Switch) */}
            <div
              onClick={() => setParams({ ...params, cancelUnusedSubscriptions: !params.cancelUnusedSubscriptions })}
              className={`p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                params.cancelUnusedSubscriptions
                  ? 'bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border-emerald-500/40 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2.5 rounded-xl border transition-colors ${
                      params.cancelUnusedSubscriptions
                        ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-600/40'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500 border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {params.cancelUnusedSubscriptions ? (
                      <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <ShieldAlert className="h-5 w-5 text-amber-500 animate-pulse" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                        Cancel Unused Subscriptions
                      </span>
                      <span
                        className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded ${
                          params.cancelUnusedSubscriptions
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {params.cancelUnusedSubscriptions ? 'ARMED & SEALED' : 'DRAIN ACTIVE'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                      {params.cancelUnusedSubscriptions
                        ? `Recovers Cult.fit pass: +${currencySymbol}2,400/mo into living runway`
                        : `Vampire pass draining ${currencySymbol}2,400/mo unaddressed`}
                    </span>
                  </div>
                </div>

                {/* Tactile Big Switch Indicator */}
                <div
                  className={`w-12 h-7 rounded-full p-1 transition-colors ${
                    params.cancelUnusedSubscriptions ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                      params.cancelUnusedSubscriptions ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* LEVER 4 [STYLE C: CYBERPUNK 4-STAGE ENERGY BATTERY STACK]: Side Hustle Turbocharger */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 via-violet-500/5 to-fuchsia-500/10 border border-purple-500/30 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                    <Rocket className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-white block tracking-tight">
                      Side Hustle / Extra Inflow
                    </span>
                    <span className="text-[10px] text-slate-400">Freelance, consulting, monetization</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-black text-purple-700 dark:text-purple-300 bg-purple-100/80 dark:bg-purple-950/60 px-2.5 py-1 rounded-xl border border-purple-300/60 dark:border-purple-800">
                    +{currencySymbol}{params.additionalMonthlyIncome.toLocaleString()}/mo
                  </span>
                </div>
              </div>

              {/* 4-Stage Energy Battery Stack Display */}
              <div className="space-y-1">
                <div className="grid grid-cols-4 gap-1.5 h-2">
                  {[0, 10000, 20000, 40000].map((threshold, idx) => {
                    const isCharged = params.additionalMonthlyIncome >= threshold && threshold > 0;
                    return (
                      <div
                        key={idx}
                        className={`rounded-full transition-all duration-300 ${
                          isCharged
                            ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 shadow-xs shadow-purple-500/50'
                            : params.additionalMonthlyIncome === 0 && idx === 0
                            ? 'bg-purple-400/40'
                            : 'bg-slate-200 dark:bg-slate-700/60'
                        }`}
                      />
                    );
                  })}
                </div>
                <input
                  type="range"
                  min="0"
                  max="40000"
                  step="5000"
                  value={params.additionalMonthlyIncome}
                  onChange={(e) => setParams({ ...params, additionalMonthlyIncome: Number(e.target.value) })}
                  className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              {/* 4 Cyberpunk Energy Core Nodes with Real SVG Icons */}
              <div className="grid grid-cols-4 gap-2 pt-1">
                {[
                  { amt: 0, label: 'Idle', badge: '₹0', Icon: Moon },
                  { amt: 10000, label: 'Freelance', badge: '+₹10k', Icon: Laptop },
                  { amt: 20000, label: 'Consulting', badge: '+₹20k', Icon: Briefcase },
                  { amt: 40000, label: 'Turbo', badge: '+₹40k', Icon: Flame },
                ].map((item) => {
                  const ItemIcon = item.Icon;
                  const isSelected = params.additionalMonthlyIncome === item.amt;
                  return (
                    <button
                      key={item.amt}
                      type="button"
                      onClick={() => setParams({ ...params, additionalMonthlyIncome: item.amt })}
                      className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/30 scale-102 font-bold'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-purple-400/60'
                      }`}
                    >
                      <div
                        className={`p-1.5 rounded-xl mb-1 ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        <ItemIcon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-[11px] font-black leading-none">{item.badge}</span>
                      <span
                        className={`text-[9px] mt-0.5 ${
                          isSelected ? 'text-purple-100 font-semibold' : 'text-slate-400'
                        }`}
                      >
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Graphical Representation Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  {activeChartView === 'trajectory' ? '12-Month Net Worth Trajectory' : 'Goal Timeline Acceleration'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {activeChartView === 'trajectory'
                    ? 'Comparing baseline accumulation with what-if simulated savings velocity'
                    : 'Months required to achieve goal milestone under baseline vs simulated surplus'}
                </p>
              </div>

              {/* View Switcher Buttons */}
              <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveChartView('trajectory')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    activeChartView === 'trajectory'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <LineChartIcon className="h-3.5 w-3.5" />
                  <span>Trajectory</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveChartView('timeline')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    activeChartView === 'timeline'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  <span>Speedup Bars</span>
                </button>
              </div>
            </div>

            {/* Chart Area */}
            <div className="h-68 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                {activeChartView === 'trajectory' ? (
                  <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSimulated" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.35} />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
                    />
                    <Tooltip
                      formatter={(val: any, name: any) => [
                        `${currencySymbol}${Number(val || 0).toLocaleString()}`,
                        name === 'Simulated' ? 'Simulated Path' : 'Baseline Path',
                      ]}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        color: '#0f172a',
                        borderColor: '#cbd5e1',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        fontSize: '11px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                    <Area
                      type="monotone"
                      dataKey="Baseline"
                      stroke="#94a3b8"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      fillOpacity={0}
                    />
                    <Area
                      type="monotone"
                      dataKey="Simulated"
                      stroke="#2563eb"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorSimulated)"
                    />
                  </AreaChart>
                ) : (
                  <BarChart data={timelineComparisonData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.35} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${v}m`} />
                    <Tooltip
                      formatter={(val: any, name: any) => [
                        `${val} Months`,
                        name === 'OriginalMonths' ? 'Original Timeline' : 'Simulated Timeline',
                      ]}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        color: '#0f172a',
                        borderColor: '#cbd5e1',
                        borderRadius: '12px',
                        fontSize: '11px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                    <Bar dataKey="OriginalMonths" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Baseline Months" />
                    <Bar dataKey="SimulatedMonths" fill="#2563eb" radius={[4, 4, 0, 0]} name="Simulated Months" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* FULL WIDTH SECTION: Living Financial Goals & Budgets */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span>Active Financial Goals & Monthly Budgets ({profile.goals.length})</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              User-defined goals. Add your custom targets, set monthly budgets, and see how what-if surpluses accelerate milestones!
            </p>
          </div>

          <button
            onClick={handleOpenAddGoal}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create New Goal</span>
          </button>
        </div>

        {/* Goals Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profile.goals.map((goal) => {
            const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
            const style = getCategoryDetails(goal.category, goal.iconName);
            const Icon = style.Icon;

            // Find simulation acceleration result for this goal
            const goalSim = simulation.goalsProgress.find((g) => g.goalId === goal.id);

            return (
              <div
                key={goal.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-4 sm:p-5 flex flex-col justify-between hover:border-blue-400 dark:hover:border-blue-600 transition shadow-xs group"
              >
                <div>
                  {/* Card Header: Category & Priority & Actions */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-xl ${style.bg} ${style.border} ${style.text} border`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          {goal.category}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                          {goal.title}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenEditGoal(goal)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition cursor-pointer"
                        title="Edit Goal & Budget"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer"
                        title="Delete Goal"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Numbers */}
                  <div className="flex items-baseline justify-between mt-3 mb-1.5">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Saved: <strong className="text-slate-900 dark:text-white">{currencySymbol}{goal.currentAmount.toLocaleString()}</strong>
                    </span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Target: {currencySymbol}{goal.targetAmount.toLocaleString()}
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${style.bar} transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1 font-medium">
                    <span>{percent}% funded</span>
                    <span>Remaining: {currencySymbol}{remaining.toLocaleString()}</span>
                  </div>

                  {/* Budget Allocation Pill */}
                  <div className="mt-3 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Monthly Budget:</span>
                    <span className="font-extrabold text-blue-600 dark:text-blue-400">
                      {currencySymbol}{goal.monthlyAllocation.toLocaleString()}/mo
                    </span>
                  </div>
                </div>

                {/* Acceleration Footer */}
                <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800/80">
                  {goalSim && goalSim.monthsSaved > 0 ? (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center space-x-1">
                        <Zap className="h-3.5 w-3.5" />
                        <span>{goalSim.monthsSaved} Mo Sooner!</span>
                      </span>
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        {goalSim.acceleratedCompletionDate}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Timeline:</span>
                      <span>{goal.targetDate}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add / Edit Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-600" />
                <span>{editingGoalId ? 'Edit Financial Goal & Budget' : 'Add New Financial Goal & Budget'}</span>
              </h3>
              <button
                onClick={() => setShowGoalModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Presets for New Goals */}
            {!editingGoalId && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Quick Presets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { title: 'Emergency Shield', category: 'Security', targetAmount: 300000, monthlyAllocation: 15000, iconName: 'ShieldCheck' },
                    { title: 'Dream Vacation 2027', category: 'Travel', targetAmount: 200000, monthlyAllocation: 12000, iconName: 'Plane' },
                    { title: 'Apartment Down Payment', category: 'Asset', targetAmount: 1500000, monthlyAllocation: 25000, iconName: 'Home' },
                    { title: 'Electric Vehicle / Car', category: 'Vehicle', targetAmount: 800000, monthlyAllocation: 18000, iconName: 'Car' },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 transition cursor-pointer"
                    >
                      {preset.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Goal Title / Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Wedding Savings, Tesla Down Payment, Japan Trip"
                  value={goalForm.title}
                  onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Category
                  </label>
                  <select
                    value={goalForm.category}
                    onChange={(e) => setGoalForm({ ...goalForm, category: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Security">Security & Emergency</option>
                    <option value="Travel">Travel & Vacations</option>
                    <option value="Asset">Home & Real Estate</option>
                    <option value="Vehicle">Vehicle & Automobile</option>
                    <option value="Education">Education & Courses</option>
                    <option value="Lifestyle">Lifestyle & Luxury</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Priority
                  </label>
                  <select
                    value={goalForm.priority}
                    onChange={(e) => setGoalForm({ ...goalForm, priority: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Target Goal Amount ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="5000"
                    value={goalForm.targetAmount}
                    onChange={(e) => setGoalForm({ ...goalForm, targetAmount: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Already Saved ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={goalForm.currentAmount}
                    onChange={(e) => setGoalForm({ ...goalForm, currentAmount: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Monthly Budget Allocation ({currencySymbol}/mo)
                  </label>
                  <input
                    type="number"
                    min="500"
                    step="1000"
                    value={goalForm.monthlyAllocation}
                    onChange={(e) => setGoalForm({ ...goalForm, monthlyAllocation: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Target Completion Date
                  </label>
                  <input
                    type="month"
                    value={goalForm.targetDate}
                    onChange={(e) => setGoalForm({ ...goalForm, targetDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="px-4 py-2 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  {editingGoalId ? 'Save Changes' : 'Create Living Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
