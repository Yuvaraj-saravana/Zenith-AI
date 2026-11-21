import React from 'react';
import {
  Flame,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  PauseCircle,
  UploadCloud,
} from 'lucide-react';
import { SubscriptionItem } from '../types/finance';

interface SubscriptionRadarProps {
  subscriptions: SubscriptionItem[];
  onToggleStatus: (subId: string) => void;
  currencySymbol: string;
}

export const SubscriptionRadar: React.FC<SubscriptionRadarProps> = ({
  subscriptions,
  onToggleStatus,
  currencySymbol,
}) => {
  const totalMonthly = subscriptions.reduce((s, item) => s + item.amount, 0);
  const zombieSubs = subscriptions.filter((s) => s.status === 'zombie_unused');
  const hikedSubs = subscriptions.filter((s) => s.status === 'price_increased');
  const annualSavingsLeak = zombieSubs.reduce((s, item) => s + item.amount * 12, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1">
              <Flame className="h-4 w-4" />
              <span>Subscription AI • Recurring Cadence & Leak Radar</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Subscription Radar & Anomaly Hunter
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Subscription AI audits recurring statements, detects subtle price hikes, and flags "zombie subscriptions" where you pay monthly with zero corresponding utilization.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-right shrink-0">
            <span className="text-xs text-rose-700 dark:text-rose-400 font-bold block">Annual Recoverable Leak</span>
            <span className="text-2xl font-black text-rose-700 dark:text-rose-300">
              {currencySymbol}{annualSavingsLeak.toLocaleString()}
              <span className="text-xs font-normal text-slate-500">/yr</span>
            </span>
          </div>
        </div>
      </div>

      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Monthly Recurring Outflow</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {currencySymbol}{totalMonthly.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Across {subscriptions.length} tracked services</span>
        </div>

        <div className="p-5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/10 border border-rose-200 dark:border-rose-900/40 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-rose-800 dark:text-rose-300 font-bold">Zombie / Unused Subscriptions</span>
            <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-1">{zombieSubs.length}</p>
          <span className="text-[11px] text-rose-600 dark:text-rose-300/80">Services with zero recorded usage</span>
        </div>

        <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/40 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-800 dark:text-amber-300 font-bold">Price Hikes Detected</span>
            <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">{hikedSubs.length}</p>
          <span className="text-[11px] text-amber-600 dark:text-amber-300/80">Hikes detected without your explicit consent</span>
        </div>
      </div>

      {/* Detected Subscriptions List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Detected Recurring Commitments</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
          Audited directly from recurring statement patterns & auto-debits
        </p>

        {subscriptions.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 space-y-2">
            <p>No recurring subscriptions detected yet.</p>
            <p className="text-[11px] text-slate-500">Ingest a bank statement in Ingestion AI to automatically audit recurring services.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {subscriptions.map((sub) => {
              const isZombie = sub.status === 'zombie_unused';
              const isHike = sub.status === 'price_increased';

              return (
                <div
                  key={sub.id}
                  className={`p-4 rounded-xl border transition ${
                    isZombie
                      ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/50 hover:border-rose-300'
                      : isHike
                      ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50 hover:border-amber-300'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <div
                        className={`p-2.5 rounded-xl mt-0.5 ${
                          isZombie
                            ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400'
                            : isHike
                            ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
                            : 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'
                        }`}
                      >
                        {isZombie ? (
                          <PauseCircle className="h-5 w-5" />
                        ) : isHike ? (
                          <TrendingUp className="h-5 w-5" />
                        ) : (
                          <CheckCircle2 className="h-5 w-5" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{sub.merchant}</h4>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              isZombie
                                ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30'
                                : isHike
                                ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30'
                                : 'bg-blue-100 dark:bg-blue-500/10 text-blue-800 dark:text-blue-400 border border-blue-300 dark:border-blue-500/20'
                            }`}
                          >
                            {isZombie ? 'Zombie / Unused' : isHike ? 'Price Hike Alert' : 'Active'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                          {isZombie && sub.inactivityNote}
                          {isHike && sub.priceChangeNote}
                          {!isZombie && !isHike && 'Regular monthly cadence detected & utilized.'}
                        </p>

                        <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                          Last charged: {sub.lastChargedDate} • Category: {sub.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end space-x-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 dark:border-slate-800">
                      <div className="text-right">
                        <span className="text-base font-black text-slate-900 dark:text-white">
                          {currencySymbol}{sub.amount.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 block">/month</span>
                      </div>

                      {isZombie && (
                        <button
                          onClick={() => onToggleStatus(sub.id)}
                          className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition cursor-pointer"
                        >
                          Cancel & Save ₹{(sub.amount * 12).toLocaleString()}/yr
                        </button>
                      )}

                      {isHike && (
                        <button
                          onClick={() => onToggleStatus(sub.id)}
                          className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer"
                        >
                          Acknowledge Hike
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
