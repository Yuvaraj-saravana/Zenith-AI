export type TransactionCategory = string;


export type PaymentChannel = 'UPI' | 'CARD' | 'NETBANKING' | 'NEFT' | 'SMS' | 'AUTO_DEBIT';

export interface Transaction {
  id: string;
  date: string;
  rawDescription: string;
  cleanMerchant: string;
  amount: number;
  type: 'debit' | 'credit';
  category: TransactionCategory;
  originalCategory?: TransactionCategory;
  channel: PaymentChannel;
  confidenceScore: number; // 0 to 1
  learnedRuleApplied?: boolean;
  ruleMatchedPattern?: string;
  notes?: string;
  isRecurring?: boolean;
}

export interface LearnedRule {
  id: string;
  merchantPattern: string; // e.g. "SWIGGY", "NETFLIX", "STARBUCKS"
  category: TransactionCategory;
  source: 'user_correction' | 'ai_inferred';
  createdAt: string;
  applyCount: number;
}

export interface SubscriptionItem {
  id: string;
  merchant: string;
  amount: number;
  billingCycle: 'monthly' | 'yearly';
  category: TransactionCategory;
  lastChargedDate: string;
  status: 'active' | 'price_increased' | 'zombie_unused';
  priceChangeNote?: string;
  inactivityNote?: string;
  potentialAnnualSavings: number;
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM
  category: string;
  priority: 'high' | 'medium' | 'low';
  monthlyAllocation: number;
  iconName?: string;
}

export interface FinancialProfile {
  monthlyIncome: number;
  fixedObligations: number; // Rent, EMIs, insurance
  emergencyFundCurrent: number;
  emergencyFundTargetMonths: number;
  currencySymbol: string;
  goals: Goal[];
}

export interface UserProfile {
  fullName: string;
  email: string;
  occupation: string;
  riskTolerance: 'Conservative' | 'Moderate' | 'Aggressive';
  avatarInitials: string;
  monthlyIncome: number;
  fixedObligations: number;
  currencySymbol: string;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  navPosition: 'top' | 'side';
}

export interface WhatIfParams {
  diningCutPercent: number; // e.g., 0% to 50%
  rentChangeAmount: number; // e.g., -5000 to +10000
  cancelUnusedSubscriptions: boolean;
  additionalMonthlyIncome: number;
}

export interface SimulationResult {
  monthlySavingsBaseline: number;
  monthlySavingsSimulated: number;
  monthlySurplusDelta: number;
  emergencyRunwayMonths: number;
  emergencyTargetAchieved: boolean;
  goalsProgress: {
    goalId: string;
    goalTitle: string;
    baselineMonthsRemaining: number;
    simulatedMonthsRemaining: number;
    monthsSaved: number;
    acceleratedCompletionDate: string;
  }[];
}

export interface Nudge {
  id: string;
  type: 'warning' | 'opportunity' | 'achievement' | 'tip';
  title: string;
  message: string;
  metricBadge?: string;
  actionText?: string;
  timestamp: string;
}

export interface MonthlyReview {
  monthName: string;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  topSpendingCategory: { category: string; amount: number; percent: number };
  detectedLeaksCount: number;
  annualSavingsOpportunity: number;
  coachSummary: string;
  actionPlan: string[];
}
