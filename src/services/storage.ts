import { AppSettings, FinancialProfile, LearnedRule, Nudge, SubscriptionItem, Transaction, UserProfile } from '../types/finance';
import { DEFAULT_SETTINGS, DEFAULT_USER_PROFILE, INITIAL_LEARNED_RULES, INITIAL_PROFILE, INITIAL_SUBSCRIPTIONS } from './sampleData';

export const DEFAULT_CATEGORIES: string[] = [
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
];

const STORAGE_KEYS = {
  TRANSACTIONS: 'zenith_transactions_v2',
  RULES: 'zenith_rules_v2',
  CATEGORIES: 'zenith_categories_v2',
  PROFILE: 'zenith_profile_v2',
  USER_PROFILE: 'zenith_user_profile_v2',
  SETTINGS: 'zenith_settings_v2',
  SUBSCRIPTIONS: 'zenith_subscriptions_v2',
  NUDGES: 'zenith_nudges_v2',
};

export const StorageService = {
  getTransactions(): Transaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveTransactions(transactions: Transaction[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save transactions to localStorage', e);
    }
  },

  deleteTransaction(id: string): Transaction[] {
    const list = this.getTransactions().filter((t) => t.id !== id);
    this.saveTransactions(list);
    return list;
  },

  updateTransaction(updatedTxn: Transaction): Transaction[] {
    const list = this.getTransactions().map((t) => (t.id === updatedTxn.id ? updatedTxn : t));
    this.saveTransactions(list);
    return list;
  },

  getCategories(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  },

  saveCategory(newCat: string): string[] {
    const trimmed = newCat.trim();
    if (!trimmed) return this.getCategories();
    const categories = this.getCategories();
    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      return categories;
    }
    const updated = [...categories, trimmed];
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
    return updated;
  },

  deleteCategory(catToDelete: string): string[] {
    const categories = this.getCategories().filter((c) => c.toLowerCase() !== catToDelete.toLowerCase());
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    return categories;
  },

  getUserProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return data ? JSON.parse(data) : DEFAULT_USER_PROFILE;
    } catch {
      return DEFAULT_USER_PROFILE;
    }
  },

  saveUserProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save user profile', e);
    }
  },

  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  },

  getRules(): LearnedRule[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RULES);
      return data ? JSON.parse(data) : INITIAL_LEARNED_RULES;
    } catch {
      return INITIAL_LEARNED_RULES;
    }
  },

  saveRule(newRule: LearnedRule): LearnedRule[] {
    const rules = this.getRules();
    const existingIndex = rules.findIndex(
      (r) => r.merchantPattern.toUpperCase() === newRule.merchantPattern.toUpperCase()
    );
    let updated: LearnedRule[];
    if (existingIndex >= 0) {
      updated = [...rules];
      updated[existingIndex] = {
        ...updated[existingIndex],
        category: newRule.category,
        applyCount: updated[existingIndex].applyCount + 1,
      };
    } else {
      updated = [newRule, ...rules];
    }
    localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(updated));
    return updated;
  },

  deleteRule(id: string): LearnedRule[] {
    const rules = this.getRules().filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(rules));
    return rules;
  },

  getProfile(): FinancialProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? JSON.parse(data) : INITIAL_PROFILE;
    } catch {
      return INITIAL_PROFILE;
    }
  },

  saveProfile(profile: FinancialProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile', e);
    }
  },

  getSubscriptions(): SubscriptionItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
      return data ? JSON.parse(data) : INITIAL_SUBSCRIPTIONS;
    } catch {
      return INITIAL_SUBSCRIPTIONS;
    }
  },

  saveSubscriptions(subscriptions: SubscriptionItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subscriptions));
    } catch (e) {
      console.error('Failed to save subscriptions', e);
    }
  },

  getNudges(): Nudge[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NUDGES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveNudges(nudges: Nudge[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.NUDGES, JSON.stringify(nudges));
    } catch (e) {
      console.error('Failed to save nudges', e);
    }
  },

  resetAll(): void {
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(INITIAL_LEARNED_RULES));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(INITIAL_PROFILE));
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(DEFAULT_USER_PROFILE));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTIONS);
    localStorage.removeItem(STORAGE_KEYS.NUDGES);
  },
};
