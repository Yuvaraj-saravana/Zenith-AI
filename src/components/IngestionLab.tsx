import React, { useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  FileText,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  BrainCircuit,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  Eye,
  Pencil,
  Trash2,
  X,
  Save,
} from 'lucide-react';
import { LearnedRule, Transaction } from '../types/finance';
import { SAMPLE_CSV_DATA, SAMPLE_PDF_TEXT, SAMPLE_SMS_DUMP } from '../services/sampleData';

interface IngestionLabProps {
  transactions: Transaction[];
  categories: string[];
  rules: LearnedRule[];
  onIngest: (rawContent: string, format: 'csv' | 'pdf' | 'sms') => void;
  onUpdateCategory: (txnId: string, newCategory: string) => void;
  onLearnRule: (merchantPattern: string, newCategory: string) => void;
  onDeleteTransaction: (txnId: string) => void;
  onEditTransaction: (updatedTxn: Transaction) => void;
  currencySymbol: string;
}

export const IngestionLab: React.FC<IngestionLabProps> = ({
  transactions = [],
  categories = [],
  onIngest,
  onUpdateCategory,
  onLearnRule,
  onDeleteTransaction,
  onEditTransaction,
  currencySymbol,
}) => {
  const [activeFormat, setActiveFormat] = useState<'csv' | 'pdf' | 'sms'>('csv');
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modals state
  const [reviewTxn, setReviewTxn] = useState<Transaction | null>(null);
  const [editingTxn, setEditingTxn] = useState<Transaction | null>(null);
  const [deleteConfirmTxn, setDeleteConfirmTxn] = useState<Transaction | null>(null);

  // Correction prompt modal state
  const [pendingCorrection, setPendingCorrection] = useState<{
    txn: Transaction;
    newCategory: string;
  } | null>(null);

  const handleFormatChange = (fmt: 'csv' | 'pdf' | 'sms') => {
    setActiveFormat(fmt);
    setInputText('');
  };

  const handleInsertSample = () => {
    if (activeFormat === 'csv') setInputText(SAMPLE_CSV_DATA);
    else if (activeFormat === 'pdf') setInputText(SAMPLE_PDF_TEXT);
    else if (activeFormat === 'sms') setInputText(SAMPLE_SMS_DUMP);
  };

  const handleCategorySelect = (txn: Transaction, newCategory: string) => {
    if (!newCategory || txn.category === newCategory) return;
    setPendingCorrection({ txn, newCategory });
  };

  const confirmLearnRule = () => {
    if (!pendingCorrection) return;
    const { txn, newCategory } = pendingCorrection;
    const merchantKeyword = txn.cleanMerchant.split(' ')[0].toUpperCase();
    onLearnRule(merchantKeyword, newCategory);
    setPendingCorrection(null);
  };

  const applyJustOnce = () => {
    if (!pendingCorrection) return;
    const { txn, newCategory } = pendingCorrection;
    onUpdateCategory(txn.id, newCategory);
    setPendingCorrection(null);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTxn) return;
    onEditTransaction(editingTxn);
    setEditingTxn(null);
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.cleanMerchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.rawDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header Info (Cleaned: removed noisy text & badge per requirement #4) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
              <UploadCloud className="h-4 w-4" />
              <span>Ingestion AI • Multi-Format Parser</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Ingest Statements, PDFs & Transaction SMS
            </h2>
          </div>
        </div>

        {/* Format Selector Tabs */}
        <div className="mt-5 flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          <button
            onClick={() => handleFormatChange('csv')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeFormat === 'csv'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Bank CSV Statement</span>
          </button>

          <button
            onClick={() => handleFormatChange('pdf')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeFormat === 'pdf'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Bank PDF Text Extract</span>
          </button>

          <button
            onClick={() => handleFormatChange('sms')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeFormat === 'sms'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Transaction SMS Stream</span>
          </button>
        </div>

        {/* Input Textarea & Action */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Paste your raw {activeFormat.toUpperCase()} data or use the benchmark sample:</span>
            <button
              onClick={handleInsertSample}
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center space-x-1 cursor-pointer"
            >
              <Sparkles className="h-3 w-3" />
              <span>Insert Sample {activeFormat.toUpperCase()} Data</span>
            </button>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={5}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition"
            placeholder={`Paste raw ${activeFormat.toUpperCase()} data here, or click 'Insert Sample' above to test immediately...`}
          />

          <div className="flex justify-end">
            <button
              disabled={!inputText.trim()}
              onClick={() => onIngest(inputText, activeFormat)}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 disabled:opacity-40 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Ingest & Categorize with Ingestion AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Section & Action Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <span>Ingested Transactions</span>
              <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full font-bold">
                {filteredTransactions.length} of {transactions.length}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select a category for unassigned transactions or manage with the action buttons
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search merchant or text..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="relative">
              <Filter className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Transactions Table: Removed "Confidence / Rule", Added "Actions" (Review, Edit, Delete) */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Merchant & Description</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Assigned Category (Click to Edit)</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No transactions ingested yet. Click "Insert Sample CSV Data" above and click "Ingest" to test!
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    {/* Date */}
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono whitespace-nowrap">{txn.date}</td>

                    {/* Merchant & Narration */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-bold text-slate-900 dark:text-white truncate">{txn.cleanMerchant}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate" title={txn.rawDescription}>
                        {txn.rawDescription}
                      </div>
                    </td>

                    {/* Channel */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {txn.channel}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 whitespace-nowrap font-bold">
                      <span className={txn.type === 'credit' ? 'text-emerald-600 dark:text-emerald-400 flex items-center' : 'text-slate-900 dark:text-slate-100 flex items-center'}>
                        {txn.type === 'credit' ? (
                          <ArrowDownLeft className="h-3 w-3 mr-1 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <ArrowUpRight className="h-3 w-3 mr-1 text-slate-400" />
                        )}
                        {currencySymbol}
                        {txn.amount.toLocaleString()}
                      </span>
                    </td>

                    {/* Category Dropdown (Defaults to empty string unless assigned) */}
                    <td className="py-3 px-4">
                      <select
                        value={txn.category || ''}
                        onChange={(e) => handleCategorySelect(txn, e.target.value)}
                        className={`border text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 transition cursor-pointer ${
                          !txn.category
                            ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700/60 text-amber-800 dark:text-amber-300 font-medium'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200'
                        }`}
                      >
                        <option value="">-- Select Category --</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Actions Column (Review, Edit, Delete icon buttons per requirement #1) */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-1.5">
                        {/* 1. Review Icon */}
                        <button
                          onClick={() => setReviewTxn(txn)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition cursor-pointer"
                          title="Review Full Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {/* 2. Edit Icon */}
                        <button
                          onClick={() => setEditingTxn(txn)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition cursor-pointer"
                          title="Edit Transaction"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        {/* 3. Delete Icon */}
                        <button
                          onClick={() => setDeleteConfirmTxn(txn)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                          title="Delete Transaction"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. Review Modal (Shows full details of the transaction) */}
      {reviewTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                  <Eye className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Transaction Details</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Audit metadata and raw statement narration</p>
                </div>
              </div>
              <button
                onClick={() => setReviewTxn(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Transaction Date</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">{reviewTxn.date}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Channel</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{reviewTxn.channel}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Amount</span>
                  <span className={`text-sm font-black ${reviewTxn.type === 'credit' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                    {currencySymbol}{reviewTxn.amount.toLocaleString()} ({reviewTxn.type.toUpperCase()})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Category</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {reviewTxn.category || 'Unassigned'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">Clean Merchant</span>
                <p className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold">
                  {reviewTxn.cleanMerchant}
                </p>
              </div>

              <div>
                <span className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">Raw Statement Narration</span>
                <p className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300 break-all">
                  {reviewTxn.rawDescription}
                </p>
              </div>

              {reviewTxn.isRecurring && (
                <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 text-purple-700 dark:text-purple-300">
                  ⚡ Recurring monthly cadence detected for this merchant.
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setReviewTxn(null)}
                className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Edit Modal (Modify transaction fields) */}
      {editingTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSaveEdit}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                  <Pencil className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Transaction</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingTxn(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">Merchant Name</label>
                <input
                  type="text"
                  value={editingTxn.cleanMerchant}
                  onChange={(e) => setEditingTxn({ ...editingTxn, cleanMerchant: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">Date</label>
                  <input
                    type="date"
                    value={editingTxn.date}
                    onChange={(e) => setEditingTxn({ ...editingTxn, date: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">Amount ({currencySymbol})</label>
                  <input
                    type="number"
                    value={editingTxn.amount}
                    onChange={(e) => setEditingTxn({ ...editingTxn, amount: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">Category</label>
                <select
                  value={editingTxn.category || ''}
                  onChange={(e) => setEditingTxn({ ...editingTxn, category: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setEditingTxn(null)}
                className="px-3.5 py-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition"
              >
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. Delete Confirmation Modal */}
      {deleteConfirmTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center">
            <div className="h-12 w-12 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Transaction?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Are you sure you want to remove <strong className="text-slate-800 dark:text-slate-200">"{deleteConfirmTxn.cleanMerchant}"</strong> ({currencySymbol}{deleteConfirmTxn.amount.toLocaleString()}) from your ledger?
            </p>

            <div className="mt-5 flex justify-center space-x-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmTxn(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteTransaction(deleteConfirmTxn.id);
                  setDeleteConfirmTxn(null);
                }}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xs transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Rule-Learning Confirmation Modal */}
      {pendingCorrection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-blue-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <BrainCircuit className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Teach Zenith a New Rule?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Continuous feedback loop memory</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-2 mb-4">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Target Merchant: </span>
                <span className="font-bold text-slate-900 dark:text-white">{pendingCorrection.txn.cleanMerchant}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">New Category: </span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{pendingCorrection.newCategory}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              Would you like Zenith to permanently store this rule in memory so all future transactions matching{' '}
              <strong className="text-slate-900 dark:text-white">"{pendingCorrection.txn.cleanMerchant.split(' ')[0].toUpperCase()}"</strong> are automatically classified as{' '}
              <strong className="text-blue-600 dark:text-blue-400">"{pendingCorrection.newCategory}"</strong>?
            </p>

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={applyJustOnce}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Only This Once
              </button>
              <button
                onClick={confirmLearnRule}
                className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Yes, Learn & Save Rule</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
