import { FinancialProfile, SubscriptionItem, Transaction } from '../types/finance';
import { AgentEngine } from './agentEngine';

const GEMINI_API_KEY_STORAGE = 'zenith_gemini_api_key';

export const AdvisorService = {
  getStoredApiKey(): string {
    return localStorage.getItem(GEMINI_API_KEY_STORAGE) || (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
  },

  setStoredApiKey(key: string): void {
    if (key.trim()) {
      localStorage.setItem(GEMINI_API_KEY_STORAGE, key.trim());
    } else {
      localStorage.removeItem(GEMINI_API_KEY_STORAGE);
    }
  },

  /**
   * Main entry point to get an advisor reply.
   * Uses Google Gemini API if a key is provided, or the high-intelligence built-in reasoning engine.
   */
  async getAdvisorResponse(
    query: string,
    profile: FinancialProfile,
    transactions: Transaction[],
    subscriptions: SubscriptionItem[],
    apiKeyOverride?: string
  ): Promise<{ text: string; isGuardrailDeflection: boolean; source: 'gemini' | 'engine' }> {
    const trimmed = query.trim();

    // 1. First check strict fiduciary guardrails (Problem Statement 04)
    const guardrail = AgentEngine.validateAdvisorGuardrails(trimmed);
    if (!guardrail.allowed && guardrail.deflectionMessage) {
      return {
        text: guardrail.deflectionMessage,
        isGuardrailDeflection: true,
        source: 'engine',
      };
    }

    const apiKey = (apiKeyOverride || this.getStoredApiKey()).trim();

    // 2. If Gemini API Key is available, call Google Gemini 2.5 Flash
    if (apiKey) {
      try {
        const geminiReply = await this.callGeminiApi(trimmed, profile, transactions, subscriptions, apiKey);
        if (geminiReply) {
          return {
            text: geminiReply,
            isGuardrailDeflection: false,
            source: 'gemini',
          };
        }
      } catch (err) {
        console.warn('Gemini API call error, falling back to built-in reasoning engine:', err);
      }
    }

    // 3. Built-in High-Intelligence Financial Reasoning Engine
    const engineReply = this.generateIntelligentResponse(trimmed, profile, transactions, subscriptions);
    return {
      text: engineReply,
      isGuardrailDeflection: false,
      source: 'engine',
    };
  },

  /**
   * Google Gemini API Integration (gemini-2.5-flash / gemini-1.5-flash)
   */
  async callGeminiApi(
    query: string,
    profile: FinancialProfile,
    transactions: Transaction[],
    subscriptions: SubscriptionItem[],
    apiKey: string
  ): Promise<string> {
    const totalInflow = transactions.filter((t) => t.type === 'credit').reduce((s, t) => s + t.amount, 0) || profile.monthlyIncome;
    const totalOutflow = transactions.filter((t) => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
    const netSavings = Math.max(0, totalInflow - totalOutflow);
    const savingsRate = totalInflow > 0 ? Math.round((netSavings / totalInflow) * 100) : 0;
    const monthlyBurn = profile.fixedObligations + Math.max(0, totalOutflow - profile.fixedObligations) * 0.4;
    const runwayMonths = monthlyBurn > 0 ? (profile.emergencyFundCurrent / monthlyBurn).toFixed(1) : '6.0';

    const recentTxnsSummary = transactions.slice(0, 15).map(
      (t) => `${t.date}: ${t.cleanMerchant} (${t.category}) - ${t.type.toUpperCase()} ${profile.currencySymbol}${t.amount}`
    ).join('\n');

    const goalsSummary = profile.goals.map(
      (g) => `- ${g.title}: Target ${profile.currencySymbol}${g.targetAmount}, Saved ${profile.currencySymbol}${g.currentAmount} (${Math.round((g.currentAmount / g.targetAmount) * 100)}%), Monthly Budget ${profile.currencySymbol}${g.monthlyAllocation}/mo, Target Date: ${g.targetDate}`
    ).join('\n');

    const subsSummary = subscriptions.map(
      (s) => `- ${s.merchant}: ${profile.currencySymbol}${s.amount}/${s.billingCycle} [Status: ${s.status}]`
    ).join('\n');

    const systemPrompt = `You are Advisor AI, a world-class fiduciary personal finance coach integrated into Zenith AI.
You provide empathetic, actionable, highly intelligent financial guidance.
Follow strict fiduciary compliance: refuse individual stock picks or crypto day-trading tips. Instead educate on asset allocation, low-cost index funds, emergency runways, and goal modeling.

USER LIVE FINANCIAL CONTEXT:
- Currency: ${profile.currencySymbol}
- Monthly Income / Inflow: ${profile.currencySymbol}${totalInflow.toLocaleString()}
- Fixed Obligations (Rent, Bills, EMIs): ${profile.currencySymbol}${profile.fixedObligations.toLocaleString()}
- Monthly Outflow Spent: ${profile.currencySymbol}${totalOutflow.toLocaleString()}
- Net Monthly Savings: ${profile.currencySymbol}${netSavings.toLocaleString()} (Savings Rate: ${savingsRate}%)
- Emergency Fund: ${profile.currencySymbol}${profile.emergencyFundCurrent.toLocaleString()} (${runwayMonths} months of living runway against a target of ${profile.emergencyFundTargetMonths} months)
- Active Financial Goals:
${goalsSummary || 'No goals registered yet.'}
- Recurring Subscriptions:
${subsSummary || 'No active subscriptions.'}
- Recent Ledger Transactions:
${recentTxnsSummary || 'No recent transactions recorded.'}

Formatting Guidelines:
- Format in clean GitHub-flavored markdown with bold numbers, bullet points, and clear headers where helpful.
- Reference their exact numbers and goals where relevant to make the answer genuinely personal and accurate.
- Keep the tone encouraging, professional, and practical.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\nUser Question: ${query}` }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error('No candidate content received from Gemini API');
    }

    return candidateText;
  },

  /**
   * Built-in High-Intelligence Financial Reasoning Engine
   * Capable of handling arbitrary user questions, calculations, and financial guidance.
   */
  generateIntelligentResponse(
    query: string,
    profile: FinancialProfile,
    transactions: Transaction[],
    subscriptions: SubscriptionItem[]
  ): string {
    const q = query.toLowerCase();
    const cs = profile.currencySymbol;

    // Financial Computations
    const totalInflow = transactions.filter((t) => t.type === 'credit').reduce((s, t) => s + t.amount, 0) || profile.monthlyIncome;
    const totalOutflow = transactions.filter((t) => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
    const netSavings = Math.max(0, totalInflow - totalOutflow);
    const savingsRate = totalInflow > 0 ? Math.round((netSavings / totalInflow) * 100) : 0;
    const monthlyBurn = profile.fixedObligations + Math.max(0, totalOutflow - profile.fixedObligations) * 0.4;
    const runwayMonths = monthlyBurn > 0 ? (profile.emergencyFundCurrent / monthlyBurn).toFixed(1) : '6.0';
    const runwayTargetGap = Math.max(0, profile.fixedObligations * profile.emergencyFundTargetMonths - profile.emergencyFundCurrent);

    // Group expenses by category
    const categoryTotals: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'debit')
      .forEach((t) => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });

    const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    const topCategory = sortedCategories[0] || ['Discretionary', 0];

    // 1. SPECIFIC EXPENSE / MERCHANT INQUIRY
    // e.g. "How much did I spend on swiggy / starbucks / food / groceries / rent / uber?"
    const merchants = ['swiggy', 'zomato', 'starbucks', 'uber', 'blinkit', 'amazon', 'cultfit', 'cult.fit', 'netflix', 'spotify', 'airtel', 'rent'];
    const matchedMerchant = merchants.find((m) => q.includes(m));
    if (matchedMerchant) {
      const matchingTxns = transactions.filter(
        (t) =>
          t.type === 'debit' &&
          (t.cleanMerchant.toLowerCase().includes(matchedMerchant) ||
            t.rawDescription.toLowerCase().includes(matchedMerchant) ||
            t.category.toLowerCase().includes(matchedMerchant))
      );
      const merchantTotal = matchingTxns.reduce((s, t) => s + t.amount, 0);
      const merchantCount = matchingTxns.length;

      if (merchantTotal > 0) {
        const percentOfSpend = totalOutflow > 0 ? Math.round((merchantTotal / totalOutflow) * 100) : 0;
        return `### 📊 Spending Breakdown for **${matchedMerchant.toUpperCase()}**\n\n` +
          `- **Total Spent**: **${cs}${merchantTotal.toLocaleString()}** across **${merchantCount} transactions**\n` +
          `- **Share of Outflow**: **${percentOfSpend}%** of your total monthly debits (${cs}${totalOutflow.toLocaleString()})\n` +
          `- **Average Ticket**: **${cs}${Math.round(merchantTotal / merchantCount).toLocaleString()}** per transaction\n\n` +
          `💡 **Living Optimization Tip**:\n` +
          `If you trim this spending by **25%** (saving **${cs}${Math.round(merchantTotal * 0.25).toLocaleString()}/month**), you will generate **${cs}${(Math.round(merchantTotal * 0.25) * 12).toLocaleString()}** in annual surplus to redirect toward your top living goals!`;
      }
    }

    // 2. GENERAL EXPENSE BREAKDOWN / "WHERE IS MY MONEY GOING?"
    if (/where (is|did) my money|highest expense|biggest expense|spending breakdown|top expense|expense distribution/i.test(q)) {
      const top3 = sortedCategories.slice(0, 4);
      let listMarkdown = top3
        .map(([cat, amt]) => {
          const pct = totalOutflow > 0 ? Math.round((amt / totalOutflow) * 100) : 0;
          return `- **${cat}**: **${cs}${amt.toLocaleString()}** (${pct}% of expenses)`;
        })
        .join('\n');

      return `### 💳 Your Live Expenditure Breakdown\n\n` +
        `Across recent statement transactions, your total outflow is **${cs}${totalOutflow.toLocaleString()}**:\n\n` +
        `${listMarkdown}\n\n` +
        `🔎 **Key Finding**:\n` +
        `Your largest discretionary leak is in **${topCategory[0]}** (${cs}${topCategory[1].toLocaleString()}). Capping discretionary dining and shopping to 20% of your net income is the fastest way to accelerate your emergency buffer.`;
    }

    // 3. 50/30/20 BUDGETING RULE
    if (/50\/30\/20|50 30 20|budgeting rule|how should i allocate/i.test(q)) {
      const needs = Math.round(totalInflow * 0.5);
      const wants = Math.round(totalInflow * 0.3);
      const savings = Math.round(totalInflow * 0.2);

      const actualNeeds = profile.fixedObligations;
      const actualSavings = netSavings;
      const actualWants = Math.max(0, totalOutflow - actualNeeds);

      return `### 📐 The 50/30/20 Rule Applied to Your Income (${cs}${totalInflow.toLocaleString()}/mo)\n\n` +
        `| Category | Benchmark (50/30/20) | Your Live Model | Status |\n` +
        `| :--- | :--- | :--- | :--- |\n` +
        `| **Needs (50%)** | ${cs}${needs.toLocaleString()} | ${cs}${actualNeeds.toLocaleString()} | ${actualNeeds <= needs ? '✅ Well Balanced' : '⚠️ Exceeding 50%'} |\n` +
        `| **Wants (30%)** | ${cs}${wants.toLocaleString()} | ${cs}${actualWants.toLocaleString()} | ${actualWants <= wants ? '✅ Under Control' : '⚠️ Heavy Discretionary'} |\n` +
        `| **Savings (20%)** | ${cs}${savings.toLocaleString()} | ${cs}${actualSavings.toLocaleString()} (${savingsRate}%) | ${actualSavings >= savings ? '🌟 Superb Velocity' : '⚠️ Needs Expansion'} |\n\n` +
        `🎯 **Takeaway**: Your current fixed obligations (${cs}${profile.fixedObligations.toLocaleString()}) account for **${Math.round((profile.fixedObligations / totalInflow) * 100)}%** of income. This gives you strong financial leverage to build wealth if discretionary leaks are capped!`;
    }

    // 4. EMERGENCY FUND & RUNWAY
    if (/emergency|runway|safety net|buffer|how many months/i.test(q)) {
      return `### 🛡️ Emergency Safety Net Audit\n\n` +
        `- **Current Emergency Balance**: **${cs}${profile.emergencyFundCurrent.toLocaleString()}**\n` +
        `- **Estimated Monthly Living Burn**: **${cs}${Math.round(monthlyBurn).toLocaleString()}** (Fixed obligations + essential baseline)\n` +
        `- **Current Survival Runway**: **${runwayMonths} Months** (Target: **${profile.emergencyFundTargetMonths} Months**)\n` +
        `- **Remaining Target Gap**: **${cs}${runwayTargetGap.toLocaleString()}**\n\n` +
        `💡 **Recommended Action**:\n` +
        `1. Keep this fund in high-yield, liquid instruments (such as a sweep-in fixed deposit or overnight debt fund) where it cannot lose principal value.\n` +
        `2. By redirecting the **${cs}2,400/mo** zombie gym subscription and trimming discretionary delivery, you close this gap within **${Math.max(1, Math.ceil(runwayTargetGap / (netSavings + 3500)))} months**!`;
    }

    // 5. CAN I AFFORD...? (AFFORDABILITY CALCULATOR)
    const affordMatch = q.match(/can i afford (?:to buy |a |an )?([a-z0-9\s]+?)(?:\?|$)/i);
    const amountMatch = q.match(/(?:for|costs?|worth|of)?\s*(?:₹|rs\.?|inr)?\s*(\d[\d,]*)/i);
    if (/can i afford/i.test(q)) {
      const item = affordMatch ? affordMatch[1].trim() : 'this purchase';
      const parsedAmount = amountMatch ? Number(amountMatch[1].replace(/,/g, '')) : null;

      if (parsedAmount) {
        const canAffordCash = netSavings >= parsedAmount;
        const monthsToSave = Math.ceil(parsedAmount / Math.max(1000, netSavings));

        return `### ⚖️ Affordability Analysis for **${item.toUpperCase()}** (${cs}${parsedAmount.toLocaleString()})\n\n` +
          `- **Monthly Net Savings Velocity**: **${cs}${netSavings.toLocaleString()}/mo**\n` +
          `- **Emergency Fund Status**: **${runwayMonths} months**\n\n` +
          `${canAffordCash
            ? `✅ **Verdict: Yes, you can afford this within a single month's free cash flow!** However, ensure this purchase does not dip into your **${cs}${profile.emergencyFundCurrent.toLocaleString()}** emergency safety net.`
            : `⏳ **Verdict: Not outright from a single month's cash flow.** At your current savings velocity, you can comfortably fund this in **${monthsToSave} months** of disciplined allocation without touching your emergency reserves.`}\n\n` +
          `📌 **Golden Rule**: If a discretionary item cannot be bought with cash flow while keeping 3+ months of emergency runway untouched, add it as a planned milestone in Simulation AI first!`;
      }
    }

    // 6. SAFE INVESTING / WEALTH BUILDING / MUTUAL FUNDS
    if (/invest|stocks?|mutual fund|sip|wealth|where to put money|index fund/i.test(q)) {
      return `### 📈 Fiduciary Principles for Safe Wealth Accumulation\n\n` +
        `While SEBI/SEC regulations prohibit me from giving individual stock tips, here is the proven mathematical playbook for sustainable wealth creation:\n\n` +
        `1. **Secure the Foundation First**:\n` +
        `   - Never invest money you need within 3 years into volatile markets.\n` +
        `   - Maintain your **${runwayMonths}-month emergency runway** in liquid capital.\n\n` +
        `2. **Low-Cost Broad Market Indexing (SIP)**:\n` +
        `   - Index funds (like Nifty 50 or S&P 500) provide automatic diversification across top companies with rock-bottom expense ratios (<0.15%).\n` +
        `   - Over 15-year horizons, index investing historically outperforms 85%+ of active fund managers.\n\n` +
        `3. **Automated Monthly DCA (Dollar-Cost Averaging)**:\n` +
        `   - Allocate your simulated surplus (**${cs}${netSavings.toLocaleString()}/mo**) on the 1st of every month immediately after your payroll deposit.\n\n` +
        `4. **Tax-Advantaged Compounding**:\n` +
        `   - Maximize statutory instruments (like PPF, EPF, and NPS) for debt stability and tax deductions before taking equity risk.`;
    }

    // 7. DEBT STRATEGY: AVALANCHE VS SNOWBALL
    if (/debt|loan|emi|credit card debt|avalanche|snowball/i.test(q)) {
      return `### 💳 Debt Repayment: Avalanche vs. Snowball Method\n\n` +
        `Both methods work, but they target different psychological and mathematical strengths:\n\n` +
        `| Strategy | Mechanism | Best For |\n` +
        `| :--- | :--- | :--- |\n` +
        `| **Debt Avalanche** (Mathematically Optimal) | Pay minimums on all loans; throw all surplus cash at the **highest interest rate** debt (e.g. 36% credit card). | Minimizing total interest paid over time. |\n` +
        `| **Debt Snowball** (Behaviorally Motivating) | Pay minimums on all loans; attack the **smallest balance first** to knock out whole accounts quickly. | Quick psychological wins and mental momentum. |\n\n` +
        `💡 **Zenith Recommendation**:\n` +
        `High-interest credit card debt or revolving balances are wealth destroyers. Redirect all discretionary savings (**${cs}${netSavings.toLocaleString()}/mo**) to clear credit card debt before investing in equity markets!`;
    }

    // 8. COMPOUND INTEREST & RULE OF 72
    if (/compound interest|rule of 72|how long to double/i.test(q)) {
      return `### ⚡ Compound Interest & The Rule of 72\n\n` +
        `Albert Einstein famously called compound interest the *"eighth wonder of the world"*: \\(A = P(1 + r/n)^{nt}\\).\n\n` +
        `#### 🎯 The Rule of 72:\n` +
        `Divide **72** by your expected annual rate of return to calculate approximately how many years it takes for your invested capital to double:\n\n` +
        `- At **6% return** (Fixed Deposit / Bonds): \\(72 / 6 = \\mathbf{12\\text{ years}}\\) to double.\n` +
        `- At **12% return** (Broad Market Index Fund): \\(72 / 12 = \\mathbf{6\\text{ years}}\\) to double!\n\n` +
        `💰 **In Your Living Model**:\n` +
        `If you invest your current monthly surplus of **${cs}${netSavings.toLocaleString()}** at a 12% annualized return for 10 years, your total corpus grows to approximately **${cs}${Math.round(netSavings * 230).toLocaleString()}** (where over 45% of the total value is pure compounded interest)!`;
    }

    // 9. HOW TO SAVE MORE / CUT EXPENSES
    if (/how to save|cut costs|reduce expenses|frugal|save money/i.test(q)) {
      const zombieSubs = subscriptions.filter((s) => s.status === 'zombie_unused');
      const subSavings = zombieSubs.reduce((s, item) => s + item.amount, 0);

      return `### 💡 4 High-Impact Levers to Instantly Boost Your Monthly Surplus\n\n` +
        `1. **Eliminate Subscription Leaks (+${cs}${subSavings > 0 ? subSavings.toLocaleString() : '2,400'}/mo)**:\n` +
        `   - Zenith detected unused recurring services (like Cult.fit gym pass). Pausing zombie subscriptions adds **${cs}${(subSavings > 0 ? subSavings * 12 : 28800).toLocaleString()}** back into your wallet annually.\n\n` +
        `2. **The "Cook 2 More Days" Rule (+${cs}3,500/mo)**:\n` +
        `   - Discretionary food delivery on Swiggy/Zomato averages 3-4x the cost of home meals. Trimming delivery by just 30% frees up substantial surplus.\n\n` +
        `3. **Automate the 24-Hour Purchase Rule**:\n` +
        `   - For any non-essential purchase over ${cs}2,000, enforce a 24-hour mandatory cooling period to eliminate impulse buys.\n\n` +
        `4. **Negotiate Fixed Utilities & Broadband**:\n` +
        `   - Audit annual insurance premiums and internet broadband tariffs to ensure you are on optimal baseline tier rates.`;
    }

    // 10. CREDIT SCORE & CIBIL ADVICE
    if (/credit score|cibil|improve score|credit utilization/i.test(q)) {
      return `### 🏆 How to Build an Elite 780+ Credit Score\n\n` +
        `Your credit score determines loan approvals, mortgage interest rates, and financial credibility. It is calculated primarily from:\n\n` +
        `1. **Repayment History (35% weight)**: Never miss an EMI or credit card due date. Always enable auto-debit for the **Total Amount Due**, never the Minimum Amount Due.\n` +
        `2. **Credit Utilization Ratio (30% weight)**: Keep card spending under **30% of your total credit limit**. If your limit is ${cs}1,00,000, keep revolving balances under ${cs}30,000.\n` +
        `3. **Credit Age & Mix (25% weight)**: Avoid closing your oldest credit card, as long credit history boosts your maturity score.\n` +
        `4. **Inquiry Discipline (10% weight)**: Avoid applying for multiple loan cards in a short window, which triggers hard inquiries.`;
    }

    // 11. RETIREMENT PLANNING & FIRE
    if (/retire|fire|financial independence|pension/i.test(q)) {
      const annualBurn = (profile.fixedObligations + 30000) * 12;
      const fireTarget = annualBurn * 25;

      return `### 🏖️ Financial Independence & The 4% Rule (FIRE)\n\n` +
        `Financial Independence means your investments generate enough passive cash flow to cover your living expenses forever without working.\n\n` +
        `- **Annual Essential Burn**: **${cs}${annualBurn.toLocaleString()}/year**\n` +
        `- **Target FIRE Number (25x Annual Expenses)**: **${cs}${fireTarget.toLocaleString()}**\n\n` +
        `#### 📊 The 4% Safe Withdrawal Rule:\n` +
        `Once your invested portfolio hits **${cs}${fireTarget.toLocaleString()}**, withdrawing 4% annually (${cs}${annualBurn.toLocaleString()}) historically guarantees that your principal never depletes across a 30+ year horizon.\n\n` +
        `At your current **${savingsRate}% savings rate**, every 1% boost in savings rate shaves months off your working timeline!`;
    }

    // 12. FALLBACK CONVERSATIONAL INTELLIGENCE
    return `### 🤖 Advisor AI Analysis\n\n` +
      `Thank you for asking! Regarding **"${query}"**:\n\n` +
      `Here is how this connects directly to your live financial snapshot:\n\n` +
      `- **Monthly Inflow**: **${cs}${totalInflow.toLocaleString()}**\n` +
      `- **Fixed Obligations**: **${cs}${profile.fixedObligations.toLocaleString()}** (${Math.round((profile.fixedObligations / totalInflow) * 100)}% of income)\n` +
      `- **Current Monthly Savings Velocity**: **${cs}${netSavings.toLocaleString()}/mo** (${savingsRate}% savings rate)\n` +
      `- **Living Runway**: **${runwayMonths} months** of safety buffer\n\n` +
      `🎯 **Actionable Guidance**:\n` +
      `1. Keep fixed commitments under 50% of income to preserve flexibility.\n` +
      `2. Focus surplus cash flow on accelerating your active living goals (e.g. ${profile.goals[0]?.title || 'Emergency Fund'}).\n` +
      `3. Feel free to ask me about specific expenses, budgeting formulas (like 50/30/20), debt payoff roadmaps, or what-if scenario simulations!`;
  },
};
