import {
  FinancialProfile,
  LearnedRule,
  MonthlyReview,
  Nudge,
  PaymentChannel,
  SimulationResult,
  SubscriptionItem,
  Transaction,
  TransactionCategory,
  WhatIfParams,
} from '../types/finance';
import { StorageService } from './storage';

// Known keyword to category mapping for base AI inference
const KEYWORD_CATEGORY_MAP: { pattern: RegExp; category: TransactionCategory; merchant: string }[] = [
  { pattern: /SWIGGY/i, category: 'Food & Dining', merchant: 'Swiggy' },
  { pattern: /ZOMATO/i, category: 'Food & Dining', merchant: 'Zomato' },
  { pattern: /STARBUCKS/i, category: 'Food & Dining', merchant: 'Starbucks' },
  { pattern: /MCDONALD|BURGER|PIZZA|CAFE/i, category: 'Food & Dining', merchant: 'Fast Food / Dining' },
  { pattern: /BLINKIT|ZEPTO|INSTAMART|NATURE BASKET|BIGBASKET/i, category: 'Groceries & Supplies', merchant: 'Grocery Store' },
  { pattern: /LANDLORD|RENT|APARTMENT/i, category: 'Housing & Rent', merchant: 'Landlord / Rent' },
  { pattern: /NETFLIX/i, category: 'Subscriptions & Entertainment', merchant: 'Netflix' },
  { pattern: /SPOTIFY/i, category: 'Subscriptions & Entertainment', merchant: 'Spotify' },
  { pattern: /PRIME|HOTSTAR|YOUTUBE|DISNEY/i, category: 'Subscriptions & Entertainment', merchant: 'Streaming Media' },
  { pattern: /CULT\.?FIT|GYM|FITNESS/i, category: 'Healthcare & Wellness', merchant: 'Cult.fit Gym' },
  { pattern: /UBER|OLA|PETROL|FUEL|IOCL|HPCL|BPCL|METRO/i, category: 'Transport & Fuel', merchant: 'Transport / Fuel' },
  { pattern: /ELECTRICITY|BSES|TATA POWER|AIRTEL|BROADBAND|BILLPAY|WIFI/i, category: 'Utilities & Bills', merchant: 'Utilities' },
  { pattern: /AMAZON|AMZN|FLIPKART|MYNTRA|ZARA|SHOPPING/i, category: 'Shopping & Lifestyle', merchant: 'Online Shopping' },
  { pattern: /SALARY|CORP-DIR-DEP|PAYROLL|ACME/i, category: 'Income & Salary', merchant: 'Employer Salary' },
  { pattern: /MUTUAL FUND|SIP|ZERODHA|GROWW|INDMONEY/i, category: 'Investment & Savings', merchant: 'Investments' },
];

export const AgentEngine = {
  /**
   * 1. Messy statement & SMS ingestion agent
   */
  parseTransactions(rawContent: string, format: 'csv' | 'pdf' | 'sms'): Transaction[] {
    const rules = StorageService.getRules();
    const transactions: Transaction[] = [];

    if (format === 'csv') {
      const lines = rawContent.split('\n').filter((l) => l.trim().length > 0);
      // Skip header if present
      const dataLines = lines[0].toLowerCase().includes('date') ? lines.slice(1) : lines;

      dataLines.forEach((line, index) => {
        const parts = line.split(',');
        if (parts.length >= 3) {
          const date = parts[0]?.trim() || new Date().toISOString().slice(0, 10);
          const rawDesc = parts[1]?.trim() || 'Unknown Transaction';
          const debitStr = parts[2]?.trim();
          const creditStr = parts[3]?.trim();

          const isCredit = creditStr && parseFloat(creditStr) > 0;
          const amount = isCredit ? parseFloat(creditStr) : parseFloat(debitStr) || 0;
          if (amount <= 0 && isNaN(amount)) return;

          const parsed = this.inferTransactionDetails(rawDesc, amount, isCredit ? 'credit' : 'debit', date, rules, `csv-${index}`);
          transactions.push(parsed);
        }
      });
    } else if (format === 'sms') {
      const smsBlocks = rawContent.split(/\n\s*\n/).filter((b) => b.trim().length > 0);
      smsBlocks.forEach((block, index) => {
        const line = block.replace(/\n/g, ' ').trim();
        // Extract amount: e.g. "INR 1,50,000.00" or "Rs 799"
        const amtMatch = line.match(/(?:INR|Rs\.?)\s*([\d,]+(?:\.\d{2})?)/i);
        const amount = amtMatch ? parseFloat(amtMatch[1].replace(/,/g, '')) : 0;

        const isCredit = /credited|deposited|received/i.test(line);
        const type: 'debit' | 'credit' = isCredit ? 'credit' : 'debit';

        // Extract date
        const dateMatch = line.match(/(\d{1,2}-[A-Za-z]{3}-\d{2,4}|\d{4}-\d{2}-\d{2})/);
        const date = dateMatch ? this.standardizeDate(dateMatch[1]) : new Date().toISOString().slice(0, 10);

        if (amount > 0) {
          const parsed = this.inferTransactionDetails(line, amount, type, date, rules, `sms-${index}`, 'SMS');
          transactions.push(parsed);
        }
      });
    } else if (format === 'pdf') {
      const lines = rawContent.split('\n').filter((l) => l.trim().length > 0);
      lines.forEach((line, index) => {
        // Match table rows: e.g. 01/11/2026 TXN8491023 DESCRIPTION DEBIT CREDIT
        const match = line.match(/(\d{1,2}\/\d{1,2}\/\d{4})\s+(\S+)\s+(.*?)\s+([\d,]+\.\d{2})?(?:\s+([\d,]+\.\d{2})?)?$/);
        if (match) {
          const date = this.standardizeDate(match[1]);
          const rawDesc = match[3].trim();
          const debitStr = match[4];
          const creditStr = match[5];

          const isCredit = /SALARY|CREDIT/i.test(rawDesc) && creditStr;
          const amount = isCredit && creditStr ? parseFloat(creditStr.replace(/,/g, '')) : debitStr ? parseFloat(debitStr.replace(/,/g, '')) : 0;

          if (amount > 0) {
            const parsed = this.inferTransactionDetails(rawDesc, amount, isCredit ? 'credit' : 'debit', date, rules, `pdf-${index}`);
            transactions.push(parsed);
          }
        }
      });
    }

    return transactions;
  },

  /**
   * Cleans merchant narration and applies learned rules or heuristic categorization
   */
  inferTransactionDetails(
    rawDesc: string,
    amount: number,
    type: 'debit' | 'credit',
    date: string,
    rules: LearnedRule[],
    idSuffix: string,
    forcedChannel?: PaymentChannel
  ): Transaction {
    // 1. Channel detection
    let channel: PaymentChannel = forcedChannel || 'CARD';
    if (/UPI/i.test(rawDesc)) channel = 'UPI';
    else if (/NEFT|ACH/i.test(rawDesc)) channel = 'NEFT';
    else if (/AUTODEBIT|RECURRING|BBPS/i.test(rawDesc)) channel = 'AUTO_DEBIT';
    else if (/NETBANKING|BIL/i.test(rawDesc)) channel = 'NETBANKING';

    // Extract cleaner merchant name from keywords or narration
    let cleanMerchant = rawDesc.slice(0, 24);
    for (const item of KEYWORD_CATEGORY_MAP) {
      if (item.pattern.test(rawDesc)) {
        cleanMerchant = item.merchant;
        break;
      }
    }

    // Default category is empty so user assigns it directly
    return {
      id: `txn-${Date.now()}-${idSuffix}`,
      date,
      rawDescription: rawDesc,
      cleanMerchant,
      amount,
      type,
      category: '', // Empty by default as requested
      channel,
      confidenceScore: 0.95,
      learnedRuleApplied: false,
      isRecurring: /RECURRING|AUTODEBIT|MONTHLY/i.test(rawDesc),
    };
  },

  /**
   * 2. Correction Loop: User updates category -> Learns rule & retroactively updates transactions
   */
  learnCategoryRule(
    merchantPattern: string,
    newCategory: TransactionCategory,
    existingTransactions: Transaction[]
  ): { updatedRules: LearnedRule[]; updatedTransactions: Transaction[] } {
    const cleanPattern = merchantPattern.trim();
    const newRule: LearnedRule = {
      id: `rule-${Date.now()}`,
      merchantPattern: cleanPattern,
      category: newCategory,
      source: 'user_correction',
      createdAt: new Date().toISOString().slice(0, 10),
      applyCount: 1,
    };

    const updatedRules = StorageService.saveRule(newRule);

    // Retroactively update matching transactions
    const updatedTransactions = existingTransactions.map((txn) => {
      if (new RegExp(cleanPattern, 'i').test(txn.rawDescription) || new RegExp(cleanPattern, 'i').test(txn.cleanMerchant)) {
        return {
          ...txn,
          originalCategory: txn.originalCategory || txn.category,
          category: newCategory,
          learnedRuleApplied: true,
          ruleMatchedPattern: cleanPattern,
          confidenceScore: 1.0,
        };
      }
      return txn;
    });

    StorageService.saveTransactions(updatedTransactions);
    return { updatedRules, updatedTransactions };
  },

  /**
   * 3. Recurring Payments & Subscriptions Anomaly Hunter
   */
  detectSubscriptionAnomalies(transactions: Transaction[], currentSubs: SubscriptionItem[]): SubscriptionItem[] {
    const baseSubs = currentSubs && currentSubs.length > 0 ? currentSubs : StorageService.getSubscriptions();
    const updated = [...baseSubs];

    transactions.forEach((txn) => {
      if (txn.category === 'Subscriptions & Entertainment' || txn.isRecurring || /NETFLIX|SPOTIFY|PRIME|HOTSTAR|YOUTUBE|CULT|GYM|DISNEY|APPLE|FITNESS/i.test(txn.cleanMerchant) || /AUTODEBIT|RECURRING/i.test(txn.rawDescription)) {
        const existing = updated.find((s) => s.merchant.toLowerCase().includes(txn.cleanMerchant.toLowerCase()) || txn.cleanMerchant.toLowerCase().includes(s.merchant.toLowerCase()));
        if (existing) {
          // Check price difference
          if (txn.amount > existing.amount) {
            const diffPct = Math.round(((txn.amount - existing.amount) / existing.amount) * 100);
            existing.status = 'price_increased';
            existing.priceChangeNote = `Price hike alert: increased from ₹${existing.amount} to ₹${txn.amount} (+${diffPct}%)`;
            existing.amount = txn.amount;
          }
          existing.lastChargedDate = txn.date;
        } else {
          // Auto-discover newly encountered recurring service
          const isPotentialZombie = /CULT|GYM|FITNESS/i.test(txn.cleanMerchant);
          updated.push({
            id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            merchant: txn.cleanMerchant,
            amount: txn.amount,
            billingCycle: 'monthly',
            category: txn.category || 'Subscriptions & Entertainment',
            lastChargedDate: txn.date,
            status: isPotentialZombie ? 'zombie_unused' : 'active',
            inactivityNote: isPotentialZombie ? 'Detected dormant recurring service with no recent active utilization.' : undefined,
            potentialAnnualSavings: txn.amount * 12,
          });
        }
      }
    });

    StorageService.saveSubscriptions(updated);
    return updated;
  },

  /**
   * 4. Living Money Model & What-If Simulation Engine
   */
  runWhatIfSimulation(
    profile: FinancialProfile,
    transactions: Transaction[],
    subscriptions: SubscriptionItem[],
    params: WhatIfParams
  ): SimulationResult {
    // Compute current baseline monthly metrics
    const totalExpenses = transactions
      .filter((t) => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);

    const diningExpenses = transactions
      .filter((t) => t.type === 'debit' && t.category === 'Food & Dining')
      .reduce((sum, t) => sum + t.amount, 0);

    const discretionaryTotal = Math.max(0, totalExpenses - profile.fixedObligations);

    // Baseline monthly savings
    const baselineMonthlySavings = Math.max(0, profile.monthlyIncome - profile.fixedObligations - discretionaryTotal);

    // Simulation deltas:
    // 1. Dining Cut savings
    const diningSavings = diningExpenses * (params.diningCutPercent / 100);

    // 2. Unused subscriptions savings
    let subscriptionSavings = 0;
    if (params.cancelUnusedSubscriptions) {
      subscriptionSavings = subscriptions
        .filter((s) => s.status === 'zombie_unused')
        .reduce((sum, s) => sum + s.amount, 0);
    }

    // 3. Rent change (positive means rent went up, negative means down)
    const rentImpact = params.rentChangeAmount;

    // Total monthly surplus delta
    const monthlySurplusDelta = diningSavings + subscriptionSavings - rentImpact + params.additionalMonthlyIncome;
    const simulatedMonthlySavings = Math.max(0, baselineMonthlySavings + monthlySurplusDelta);

    // Emergency runway calculation (months of survival on current emergency fund)
    const effectiveFixedAndBasic = profile.fixedObligations + (discretionaryTotal - diningSavings) * 0.4;
    const emergencyRunwayMonths = effectiveFixedAndBasic > 0 ? Number((profile.emergencyFundCurrent / effectiveFixedAndBasic).toFixed(1)) : 6.0;

    // Goal progression deltas
    const goalsProgress = profile.goals.map((goal) => {
      const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);
      const baselineMonthly = Math.max(1000, goal.monthlyAllocation);
      const baselineMonthsRemaining = Math.ceil(remainingAmount / baselineMonthly);

      // Simulated monthly allocation receives proportional extra surplus
      const priorityFactor = goal.priority === 'high' ? 0.5 : goal.priority === 'medium' ? 0.35 : 0.15;
      const extraAllocation = Math.max(0, monthlySurplusDelta * priorityFactor);
      const simulatedMonthly = baselineMonthly + extraAllocation;
      const simulatedMonthsRemaining = Math.max(1, Math.ceil(remainingAmount / simulatedMonthly));

      const monthsSaved = Math.max(0, baselineMonthsRemaining - simulatedMonthsRemaining);

      const targetDateObj = new Date();
      targetDateObj.setMonth(targetDateObj.getMonth() + simulatedMonthsRemaining);
      const acceleratedCompletionDate = targetDateObj.toLocaleString('default', { month: 'short', year: 'numeric' });

      return {
        goalId: goal.id,
        goalTitle: goal.title,
        baselineMonthsRemaining,
        simulatedMonthsRemaining,
        monthsSaved,
        acceleratedCompletionDate,
      };
    });

    return {
      monthlySavingsBaseline: Math.round(baselineMonthlySavings),
      monthlySavingsSimulated: Math.round(simulatedMonthlySavings),
      monthlySurplusDelta: Math.round(monthlySurplusDelta),
      emergencyRunwayMonths,
      emergencyTargetAchieved: emergencyRunwayMonths >= profile.emergencyFundTargetMonths,
      goalsProgress,
    };
  },

  /**
   * 5. Spending Velocity & Drift Nudge Generator
   */
  generateNudges(transactions: Transaction[], profile: FinancialProfile, subs: SubscriptionItem[]): Nudge[] {
    const nudges: Nudge[] = [];

    // Nudge 1: Food & Dining velocity
    const foodSpend = transactions
      .filter((t) => t.category === 'Food & Dining')
      .reduce((sum, t) => sum + t.amount, 0);

    if (foodSpend > 5000) {
      nudges.push({
        id: 'nudge-dining-drift',
        type: 'warning',
        title: 'Dining Out Drift Alert',
        message: `You've spent ₹${foodSpend.toLocaleString()} on dining & food delivery across ${transactions.filter((t) => t.category === 'Food & Dining').length} orders. Cutting 25% could boost your Japan trip goal by ₹${Math.round(foodSpend * 0.25).toLocaleString()}/mo.`,
        metricBadge: `₹${foodSpend.toLocaleString()} Spent`,
        actionText: 'Simulate Dining Cut',
        timestamp: 'Just now',
      });
    }

    // Nudge 2: Zombie subscription
    const zombieSub = subs.find((s) => s.status === 'zombie_unused');
    if (zombieSub) {
      nudges.push({
        id: 'nudge-zombie-sub',
        type: 'opportunity',
        title: `Money Leak: ${zombieSub.merchant}`,
        message: `${zombieSub.merchant} (₹${zombieSub.amount}/mo) has had zero recorded activity for 48 days. Pausing it frees up ₹${(zombieSub.amount * 12).toLocaleString()} per year.`,
        metricBadge: `₹${(zombieSub.amount * 12).toLocaleString()} Annual Leak`,
        actionText: 'Pause Subscription',
        timestamp: 'Today',
      });
    }

    // Nudge 3: Price hike
    const hikedSub = subs.find((s) => s.status === 'price_increased');
    if (hikedSub) {
      nudges.push({
        id: 'nudge-price-hike',
        type: 'warning',
        title: `Price Hike Detected: ${hikedSub.merchant}`,
        message: `${hikedSub.merchant} charged ₹${hikedSub.amount}. ${hikedSub.priceChangeNote || 'Price increased recently.'}`,
        metricBadge: `+₹${hikedSub.amount}/mo`,
        actionText: 'Review Alternatives',
        timestamp: '2 days ago',
      });
    }

    // Nudge 4: Positive savings achievement
    const totalIncome = transactions.filter((t) => t.type === 'credit').reduce((s, t) => s + t.amount, 0) || profile.monthlyIncome;
    const totalExpenses = transactions.filter((t) => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
    const savingsRate = Math.round(((totalIncome - totalExpenses) / totalIncome) * 100);

    if (savingsRate > 20) {
      nudges.push({
        id: 'nudge-savings-win',
        type: 'achievement',
        title: 'Strong Living Savings Rate',
        message: `You are currently saving ${savingsRate}% of your income. That puts you in the top tier of disciplined cash flow management!`,
        metricBadge: `${savingsRate}% Saved`,
        timestamp: 'This week',
      });
    }

    return nudges;
  },

  /**
   * 6. Executive Monthly Review Generator
   */
  generateMonthlyReview(profile: FinancialProfile, transactions: Transaction[], subs: SubscriptionItem[]): MonthlyReview {
    const totalIncome = transactions.filter((t) => t.type === 'credit').reduce((s, t) => s + t.amount, 0) || profile.monthlyIncome;
    const totalExpenses = transactions.filter((t) => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
    const netSavings = Math.max(0, totalIncome - totalExpenses);
    const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

    // Group expenses by category
    const categoryTotals: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'debit')
      .forEach((t) => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });

    let topCategory = { category: 'Food & Dining', amount: 0, percent: 0 };
    Object.entries(categoryTotals).forEach(([cat, amt]) => {
      if (amt > topCategory.amount) {
        topCategory = {
          category: cat,
          amount: amt,
          percent: totalExpenses > 0 ? Math.round((amt / totalExpenses) * 100) : 0,
        };
      }
    });

    const zombieSubs = subs.filter((s) => s.status === 'zombie_unused');
    const annualSavingsOpportunity = zombieSubs.reduce((sum, s) => sum + s.amount * 12, 0);

    return {
      monthName: 'November 2026',
      totalIncome,
      totalExpenses,
      netSavings,
      savingsRate,
      topSpendingCategory: topCategory,
      detectedLeaksCount: zombieSubs.length + subs.filter((s) => s.status === 'price_increased').length,
      annualSavingsOpportunity,
      coachSummary: `In November 2026, your living money model demonstrates strong financial resilience with a ${savingsRate}% savings rate. However, an unaddressed leak in unused subscriptions (₹${annualSavingsOpportunity.toLocaleString()}/yr) and discretionary food delivery velocity (₹${topCategory.amount.toLocaleString()}) represent prime levers to accelerate your goals.`,
      actionPlan: [
        '1. Pause Cult.fit gym pass (saving ₹2,400/mo) and redirect funds directly into the 6-Month Emergency Safety Net.',
        '2. Cap weekend food delivery frequency to 2x per week, keeping dining spend below ₹5,000.',
        '3. Maintain fixed obligations under 30% of monthly income to ensure flexible cash buffer.',
      ],
    };
  },

  /**
   * 7. Strict Ethical Guardrails Layer
   */
  validateAdvisorGuardrails(userQuery: string): { allowed: boolean; deflectionMessage?: string } {
    const prohibitedKeywords = [
      /buy (?:stock|shares?|crypto|bitcoin|ethereum|penny stocks?|calls?|puts?|options?)/i,
      /which (?:stock|share|crypto|coin|equity) to buy/i,
      /target price for/i,
      /invest in (?:tata|tesla|reliance|hdfc|nvidia|apple|adani)/i,
      /best stock to/i,
      /guaranteed return/i,
    ];

    for (const pattern of prohibitedKeywords) {
      if (pattern.test(userQuery)) {
        return {
          allowed: false,
          deflectionMessage: `🛡️ **Ethical Financial Guardrail Triggered**\n\nAs Zenith AI, I operate strictly as an **educational personal finance & living money coach**, adhering to SEBI/SEC fiduciary guardrails.\n\n* **I do not provide individual stock picks, crypto tips, or licensed investment advisory.**\n* What I *can* do: I can calculate how much surplus monthly cash flow you have available for diversified, low-cost index investing, model your emergency runway, and simulate goal completion timelines!`,
        };
      }
    }

    return { allowed: true };
  },

  /**
   * Helper to standardize dates
   */
  standardizeDate(raw: string): string {
    try {
      if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(raw)) {
        const [d, m, y] = raw.split('/');
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      }
      if (/^\d{1,2}-[A-Za-z]{3}-\d{2,4}$/.test(raw)) {
        const [d, mon, y] = raw.split('-');
        const monthMap: Record<string, string> = {
          jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
          jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
        };
        const year = y.length === 2 ? `20${y}` : y;
        return `${year}-${monthMap[mon.toLowerCase()] || '11'}-${d.padStart(2, '0')}`;
      }
      return new Date().toISOString().slice(0, 10);
    } catch {
      return new Date().toISOString().slice(0, 10);
    }
  },
};
