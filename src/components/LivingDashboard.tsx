import React from 'react';
import {
  TrendingUp,
  ShieldAlert,
  Target,
  Sparkles,
  ArrowUpRight,
  ChevronRight,
  Coins,
  Building,
  Plane,
  Home,
  UploadCloud,
  FileSpreadsheet,
} from 'lucide-react';
import { FinancialProfile, Nudge, SubscriptionItem, Transaction, UserProfile } from '../types/finance';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface LivingDashboardProps {
  profile: FinancialProfile;
  userProfile?: UserProfile;
  transactions: Transaction[];
  subscriptions: SubscriptionItem[];
  nudges: Nudge[];
  onNavigateTab: (tab: string) => void;
  onLoadSampleData?: () => void;
}

const COLORS = ['#2563eb', '#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#64748b'];

export const LivingDashboard: React.FC<LivingDashboardProps> = ({
  profile,
  transactions,
  subscriptions,
  nudges,
  onNavigateTab,
  onLoadSampleData,
}) => {
  // Financial computations
  const totalInflow = transactions.filter((t) => t.type === 'credit').reduce((s, t) => s + t.amount, 0) || profile.monthlyIncome;
  const totalOutflow = transactions.filter((t) => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
  const netSavings = Math.max(0, totalInflow - totalOutflow);
  const savingsRate = totalInflow > 0 ? Math.round((netSavings / totalInflow) * 100) : 0;

  // Emergency runway
  const monthlyBurn = profile.fixedObligations + Math.max(0, totalOutflow - profile.fixedObligations) * 0.4;
  const runwayMonths = monthlyBurn > 0 ? (profile.emergencyFundCurrent / monthlyBurn).toFixed(1) : '6.0';
  const runwayPercent = Math.min(100, Math.round((Number(runwayMonths) / profile.emergencyFundTargetMonths) * 100));

  // Category spending breakdown for charts
  const categoryMap: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'debit')
    .forEach((t) => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });

  const chartData = Object.entries(categoryMap)
    .map(([name, value]) => ({
      name,
      value,
    }))
    .sort((a, b) => b.value - a.value);

  const hasTransactions = transactions.length > 0;

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Financial Dashboard</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Real-time ledger overview & living cash flow health</p>
        </div>
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => onNavigateTab('simulator')}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Simulation AI</span>
          </button>
          <button
            onClick={() => onNavigateTab('ingestion')}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-300 dark:border-slate-700 transition cursor-pointer"
          >
            Ingest Statement
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Monthly Income Inflow */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Monthly Inflow</span>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {profile.currencySymbol}{totalInflow.toLocaleString()}
            </div>
            <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 flex items-center font-medium">
              <ArrowUpRight className="h-3 w-3 mr-0.5" />
              <span>{hasTransactions ? 'Verified via payroll deposit' : 'Configured in profile'}</span>
            </p>
          </div>
        </div>

        {/* Metric 2: Fixed Commitments */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Fixed Obligations</span>
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <Building className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {profile.currencySymbol}{profile.fixedObligations.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {totalInflow > 0 ? Math.round((profile.fixedObligations / totalInflow) * 100) : 30}% of income (Rent, Bills, EMIs)
            </p>
          </div>
        </div>

        {/* Metric 3: Emergency Fund Runway Gauge */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Emergency Runway</span>
            <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{runwayMonths}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">/ {profile.emergencyFundTargetMonths} Mo Target</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-sky-500 to-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${runwayPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Metric 4: Living Savings Rate */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Living Savings Rate</span>
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <Coins className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{savingsRate}%</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {profile.currencySymbol}{netSavings.toLocaleString()} monthly free surplus
            </p>
          </div>
        </div>
      </div>

      {/* If No Transactions Ingested Yet: Show Clean, Welcoming Empty State */}
      {!hasTransactions && (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
            <UploadCloud className="h-7 w-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No Bank Statements Ingested Yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Upload your bank CSV, paste a statement PDF extract, or paste SMS transaction alerts in <strong>Ingestion AI</strong> to populate your live cash flow, detect leaks, and run simulations.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigateTab('ingestion')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition cursor-pointer"
            >
              <UploadCloud className="h-4 w-4" />
              <span>Go to Ingestion AI</span>
            </button>
            {onLoadSampleData && (
              <button
                onClick={onLoadSampleData}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-300 dark:border-slate-700 transition cursor-pointer"
              >
                <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                <span>Load Benchmark Demo Statement</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Grid: Goals & Living Money Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Goals & Living Money Architecture */}
        <div className="lg:col-span-2 space-y-6">
          {/* Goals Tracker */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span>Living Financial Goals</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Milestones dynamically adjusted by your real savings velocity</p>
              </div>
              <button
                onClick={() => onNavigateTab('simulator')}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center space-x-1 cursor-pointer"
              >
                <span>Simulate Timeline</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {profile.goals.map((goal) => {
                const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
                const GoalIcon = goal.iconName === 'Plane' ? Plane : goal.iconName === 'Home' ? Home : ShieldAlert;

                return (
                  <div
                    key={goal.id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400">
                          <GoalIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{goal.title}</h4>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                goal.priority === 'high'
                                  ? 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20'
                                  : 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20'
                              }`}
                            >
                              {goal.priority}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Target Date: <span className="font-semibold text-slate-700 dark:text-slate-300">{goal.targetDate}</span> • Current: {profile.currencySymbol}{goal.currentAmount.toLocaleString()} of {profile.currencySymbol}{goal.targetAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-black text-slate-900 dark:text-white">{percent}%</span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{profile.currencySymbol}{remaining.toLocaleString()} left</p>
                      </div>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Living Money Architecture Visualizer */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Living Money Architecture</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">How your monthly income is allocated across lifestyle buckets</p>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50">
                <span className="text-xs text-slate-500 dark:text-slate-400">1. Total Inflow</span>
                <p className="text-base font-bold text-blue-600 dark:text-blue-400 mt-1">{profile.currencySymbol}{totalInflow.toLocaleString()}</p>
                <span className="text-[10px] text-slate-400">100% of income</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50">
                <span className="text-xs text-slate-500 dark:text-slate-400">2. Fixed Commitments</span>
                <p className="text-base font-bold text-indigo-600 dark:text-indigo-400 mt-1">{profile.currencySymbol}{profile.fixedObligations.toLocaleString()}</p>
                <span className="text-[10px] text-slate-400">Rent, EMIs, Utilities</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50">
                <span className="text-xs text-slate-500 dark:text-slate-400">3. Goals Allocation</span>
                <p className="text-base font-bold text-sky-600 dark:text-sky-400 mt-1">
                  {profile.currencySymbol}
                  {profile.goals.reduce((s, g) => s + g.monthlyAllocation, 0).toLocaleString()}
                </p>
                <span className="text-[10px] text-slate-400">Target goal SIPs</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50">
                <span className="text-xs text-slate-500 dark:text-slate-400">4. Free Surplus</span>
                <p className="text-base font-bold text-purple-600 dark:text-purple-400 mt-1">{profile.currencySymbol}{netSavings.toLocaleString()}</p>
                <span className="text-[10px] text-slate-400">Available for What-Ifs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Spending Breakdown + Proactive Nudges */}
        <div className="space-y-6">
          {/* Spending Distribution Donut */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Expense Breakdown</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Total debits: {profile.currencySymbol}{totalOutflow.toLocaleString()}</p>

            {chartData.length > 0 ? (
              <>
                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                      >
                        {chartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any) => [`${profile.currencySymbol}${Number(val || 0).toLocaleString()}`, 'Amount']}
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          color: '#0f172a',
                          borderColor: '#cbd5e1',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2 mt-2 max-h-40 overflow-y-auto pr-1">
                  {chartData.slice(0, 4).map((item, idx) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span className="text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{item.name}</span>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">{profile.currencySymbol}{item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                No expense transactions recorded yet.
              </div>
            )}
          </div>

          {/* Proactive Spending Nudges */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>Autonomous Nudges</span>
              </h3>
              <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full">
                {nudges.length} Active
              </span>
            </div>

            <div className="space-y-3">
              {nudges.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center text-xs text-slate-500 dark:text-slate-400">
                  All systems nominal. Ingest statements to activate autonomous drift detection!
                </div>
              ) : (
                nudges.slice(0, 3).map((nudge) => (
                  <div
                    key={nudge.id}
                    className={`p-3.5 rounded-xl border transition ${
                      nudge.type === 'warning'
                        ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40 text-rose-800 dark:text-rose-200'
                        : nudge.type === 'opportunity'
                        ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-200'
                        : 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/40 text-blue-800 dark:text-blue-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{nudge.title}</h4>
                      {nudge.metricBadge && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                          {nudge.metricBadge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{nudge.message}</p>

                    {nudge.actionText && (
                      <button
                        onClick={() => onNavigateTab(nudge.type === 'warning' ? 'simulator' : 'subscriptions')}
                        className="mt-2 text-[10px] font-bold text-blue-700 dark:text-blue-400 flex items-center space-x-1 hover:underline cursor-pointer"
                      >
                        <span>{nudge.actionText}</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
