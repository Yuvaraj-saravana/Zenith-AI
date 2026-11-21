import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  FolderPlus,
  Tag,
  Check,
} from 'lucide-react';
import { LearnedRule, Transaction } from '../types/finance';

interface RuleMemoryCenterProps {
  rules: LearnedRule[];
  categories: string[];
  transactions?: Transaction[];
  currencySymbol?: string;
  onAddRule: (pattern: string, category: string) => void;
  onDeleteRule: (id: string) => void;
  onAddCategory: (categoryName: string) => void;
  onDeleteCategory: (categoryName: string) => void;
}

export const RuleMemoryCenter: React.FC<RuleMemoryCenterProps> = ({
  rules = [],
  categories = [],
  transactions = [],
  currencySymbol = '₹',
  onAddRule,
  onDeleteRule,
  onAddCategory,
  onDeleteCategory,
}) => {
  // New Rule form state
  const [showAddRuleForm, setShowAddRuleForm] = useState(false);
  const [newPattern, setNewPattern] = useState('');
  const [newRuleCategory, setNewRuleCategory] = useState(categories[0] || 'Food & Dining');

  // New Category input state (Requirement #3)
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [categoryAddedSuccess, setCategoryAddedSuccess] = useState(false);

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPattern.trim()) return;
    onAddRule(newPattern.trim().toUpperCase(), newRuleCategory);
    setNewPattern('');
    setShowAddRuleForm(false);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryInput.trim();
    if (!trimmed) return;
    onAddCategory(trimmed);
    setNewCategoryInput('');
    setCategoryAddedSuccess(true);
    setTimeout(() => setCategoryAddedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">


      {/* SECTION 1: Categories Management (Requirement #3) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Tag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Active Category Registry ({categories.length})</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Categories available across Ingestion AI dropdowns and financial reports
            </p>
          </div>

          {/* Add Category Form */}
          <form onSubmit={handleCreateCategory} className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Add new category (e.g. Pet Care, Education)..."
              value={newCategoryInput}
              onChange={(e) => setNewCategoryInput(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 w-64"
            />
            <button
              type="submit"
              disabled={!newCategoryInput.trim()}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              <FolderPlus className="h-4 w-4" />
              <span>Add Category</span>
            </button>
          </form>
        </div>

        {categoryAddedSuccess && (
          <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 text-xs font-semibold flex items-center space-x-2">
            <Check className="h-4 w-4" />
            <span>Category added! It is now instantly selectable in Ingestion AI.</span>
          </div>
        )}

        {/* Categories Table (Requirement #3) */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Category Name</th>
                <th className="py-3 px-4">Ingested Volume</th>
                <th className="py-3 px-4 text-right">Total Ingested Amount</th>
                <th className="py-3 px-4">Classification Type</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {categories.map((cat, idx) => {
                const isDefault = [
                  'Housing & Rent',
                  'Groceries & Supplies',
                  'Food & Dining',
                  'Subscriptions & Entertainment',
                  'Utilities & Bills',
                  'Transport & Fuel',
                  'Shopping & Lifestyle',
                  'Healthcare & Wellness',
                  'Investment & Savings',
                  'Income & Salary',
                  'Miscellaneous',
                ].includes(cat);

                const matchingTxns = transactions.filter((t) => t.category === cat);
                const totalCatAmount = matchingTxns.reduce((s, t) => s + t.amount, 0);
                const count = matchingTxns.length;
                const isIncome = cat === 'Income & Salary';

                return (
                  <tr key={cat} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-2.5 px-4 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          totalCatAmount > 0
                            ? isIncome
                              ? 'bg-emerald-500'
                              : 'bg-blue-600'
                            : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      />
                      <span>{cat}</span>
                    </td>
                    <td className="py-2.5 px-4">
                      {count > 0 ? (
                        <span className="font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          {count} {count === 1 ? 'txn' : 'txns'}
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-600">0 txns</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono">
                      {totalCatAmount > 0 ? (
                        <span
                          className={`font-black text-xs ${
                            isIncome
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {isIncome ? '+' : ''}{currencySymbol}{totalCatAmount.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-600 font-normal">
                          {currencySymbol}0
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          isDefault
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40'
                        }`}
                      >
                        {isDefault ? 'Standard Default' : 'Custom Category'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      {!isDefault && (
                        <button
                          onClick={() => onDeleteCategory(cat)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer"
                          title="Delete Custom Category"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: Learned Merchant Rules */}
      {showAddRuleForm && (
        <form
          onSubmit={handleCreateRule}
          className="bg-white dark:bg-slate-900 border border-blue-500/40 rounded-2xl p-5 shadow-xl space-y-4"
        >
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Create New Merchant Memory Rule</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1 font-semibold">Merchant Keyword / Pattern</label>
              <input
                type="text"
                placeholder="e.g. ZEPTO, ZARA, CHASE"
                value={newPattern}
                onChange={(e) => setNewPattern(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white uppercase focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1 font-semibold">Target Category</label>
              <select
                value={newRuleCategory}
                onChange={(e) => setNewRuleCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowAddRuleForm(false)}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 cursor-pointer"
            >
              Save Rule to Memory
            </button>
          </div>
        </form>
      )}

      {/* Rules Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Learned Merchant Rules ({rules.length})</h3>
          <button
            onClick={() => setShowAddRuleForm(!showAddRuleForm)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Merchant Rule</span>
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Merchant Pattern</th>
                <th className="py-3 px-4">Target Category</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-center">Times Applied</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {rules.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No rules recorded yet. Correct a category in Ingestion AI to teach the agent!
                  </td>
                </tr>
              ) : (
                rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700 dark:text-blue-400">
                      <span className="bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded border border-slate-200 dark:border-slate-800">
                        {rule.merchantPattern}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{rule.category}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          rule.source === 'user_correction'
                            ? 'bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30'
                            : 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30'
                        }`}
                      >
                        {rule.source === 'user_correction' ? 'User Correction' : 'AI Inferred'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono">{rule.createdAt}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        {rule.applyCount}x
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onDeleteRule(rule.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer"
                        title="Delete Rule"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
