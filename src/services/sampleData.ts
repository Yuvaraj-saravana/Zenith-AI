import { FinancialProfile, LearnedRule, SubscriptionItem, Transaction } from '../types/finance';

export const SAMPLE_CSV_DATA = `Date,Transaction Description,Debit,Credit,Balance
2026-11-01,ACH CR ACME CORP SALARY CORP-DIR-DEP,,150000,195000
2026-11-02,NEFT DR LANDLORD RENT APARTMENT 402,32000,,163000
2026-11-03,POS 401209 SWIGGY BANGALORE IN,849,,162151
2026-11-04,UPI/33214567/NETFLIX RECURRING MUMBAI,799,,161352
2026-11-05,POS 882910 STARBUCKS CONNAUGHT PL,420,,160932
2026-11-07,UPI/441209/UBER TRIP NEW DELHI,380,,160552
2026-11-08,POS BLINKIT GROCERIES DLF PHASE 3,2450,,158102
2026-11-10,BIL/DIRECT/BSES ELECTRICITY POWER,2850,,155252
2026-11-11,POS 491024 SWIGGY GOURMET ORDER,1240,,154012
2026-11-12,UPI/9817234/CULTFIT MONTHLY GYM SUB,2400,,151612
2026-11-14,AMZN MKTP IN*LUXURY WATCH ACC,3890,,147722
2026-11-15,POS 901248 STARBUCKS COFFEE CYBERHUB,510,,147212
2026-11-16,UPI/883912/SPOTIFY INDIA RECURRING,199,,147013
2026-11-17,POS 401209 SWIGGY DINING OUT,1680,,145333
2026-11-18,IOCL PETROL PUMP FUEL REFILL,3500,,141833
2026-11-19,AIRTEL DIGITAL BROADBAND FIBER BILL,1199,,140634
2026-11-20,POS 992314 ZOMATO RESTAURANT ORDER,980,,139654
`;

export const SAMPLE_PDF_TEXT = `-----------------------------------------------------------------------------------------
                           HDFC BANK LIMITED - ACCOUNT STATEMENT
Account Number: 50100492817291                      Currency: INR
Period: 01-Nov-2026 to 20-Nov-2026                   Branch: Indiranagar, Bengaluru
-----------------------------------------------------------------------------------------
DATE         TXN ID        DESCRIPTION                              DEBIT (₹)   CREDIT (₹)
01/11/2026   TXN8491023    NEFT CR-ACME TECH SOLUTIONS-SALARY                   1,50,000.00
02/11/2026   TXN8491024    UPI/649102/RENT TO LANDLORD SHARMA      32,000.00
03/11/2026   TXN8491025    POS 401209 SWIGGY FOOD ORDER               849.00
04/11/2026   TXN8491026    UPI/33214567/NETFLIX RECURRING (REV)       799.00
06/11/2026   TXN8491027    POS NATURE BASKET GROCERY STORE          3,120.00
08/11/2026   TXN8491028    UPI/771923/UBER DAILY COMMUTE              410.00
10/11/2026   TXN8491029    BBPS BILLPAY TATA POWER DELHI            2,850.00
12/11/2026   TXN8491030    AUTODEBIT CULT FIT FITNESS PASS          2,400.00
14/11/2026   TXN8491031    POS 882910 STARBUCKS COFFEE                420.00
15/11/2026   TXN8491032    POS SWIGGY INSTAMART ESSENTIALS          1,150.00
16/11/2026   TXN8491033    UPI SPOTIFY PREMIUM AUTODEBIT              199.00
17/11/2026   TXN8491034    POS ZOMATO ONLINE FOOD                   1,680.00
18/11/2026   TXN8491035    HPCL AUTO FUEL FILL                      3,500.00
19/11/2026   TXN8491036    AIRTEL XSTREAM BROADBAND                 1,199.00
-----------------------------------------------------------------------------------------
Total Debits: ₹50,577.00 | Total Credits: ₹1,50,000.00 | Closing Balance: ₹1,39,423.00
`;

export const SAMPLE_SMS_DUMP = `Txn Alert: INR 1,50,000.00 credited to your A/c XX7291 on 01-Nov-26 by ACME TECH SALARY. Avail Bal: INR 1,95,000.00

Rent payment of INR 32,000.00 done from A/c XX7291 to LANDLORD SHARMA via UPI ref 381920 on 02-Nov-26.

Txn of INR 849.00 done on HDFC Card xx4102 at SWIGGY BANGALORE on 03-Nov-26. Bal: INR 1,62,151.00

AutoDebit: Rs 799.00 debited from A/c XX7291 towards NETFLIX COM on 04-Nov-26. (Plan revised from Rs 649).

Spent INR 420.00 on your Card xx4102 at STARBUCKS CP on 05-Nov-26.

UPI Txn of INR 380.00 sent to UBER INDIA on 07-Nov-26. Ref: 441209.

INR 2,450.00 debited on Card xx4102 at BLINKIT GROCERIES Gurgaon on 08-Nov-26.

Bill Alert: INR 2,850.00 paid towards BSES ELECTRICITY on 10-Nov-26 via BBPS.

AutoDebit Alert: INR 2,400.00 debited for CULT.FIT GYM PASS on 12-Nov-26. Ref: CF-99214.

Txn of INR 3,890.00 on Amazon Pay ICICI card at AMAZON INDIA on 14-Nov-26.

INR 510.00 spent at STARBUCKS CYBERHUB on 15-Nov-26.

AutoDebit: Rs 199.00 debited from A/c XX7291 towards SPOTIFY MUSIC on 16-Nov-26.

INR 1,680.00 debited for SWIGGY GOURMET DINING on 17-Nov-26 via UPI.

Fuel Txn: INR 3,500.00 debited at IOCL PETROL STATION on 18-Nov-26.

Bill Paid: INR 1,199.00 debited for AIRTEL FIBER BROADBAND on 19-Nov-26.
`;

export const INITIAL_PROFILE: FinancialProfile = {
  monthlyIncome: 150000,
  fixedObligations: 45000, // Rent 32k, Utilities/Bills 5k, Insurance/Misc 8k
  emergencyFundCurrent: 180000,
  emergencyFundTargetMonths: 6,
  currencySymbol: '₹',
  goals: [
    {
      id: 'goal-emergency',
      title: '6-Month Emergency Safety Net',
      targetAmount: 390000,
      currentAmount: 180000,
      targetDate: '2027-06',
      category: 'Security',
      priority: 'high',
      monthlyAllocation: 15000,
      iconName: 'ShieldCheck',
    },
    {
      id: 'goal-japan',
      title: 'Japan Autumn Trip 2027',
      targetAmount: 250000,
      currentAmount: 70000,
      targetDate: '2027-10',
      category: 'Travel',
      priority: 'medium',
      monthlyAllocation: 12000,
      iconName: 'Plane',
    },
    {
      id: 'goal-home',
      title: 'Apartment Down Payment',
      targetAmount: 1500000,
      currentAmount: 350000,
      targetDate: '2028-12',
      category: 'Asset',
      priority: 'high',
      monthlyAllocation: 25000,
      iconName: 'Home',
    },
  ],
};

export const INITIAL_SUBSCRIPTIONS: SubscriptionItem[] = [
  {
    id: 'sub-netflix',
    merchant: 'Netflix',
    amount: 799,
    billingCycle: 'monthly',
    category: 'Subscriptions & Entertainment',
    lastChargedDate: '2026-11-04',
    status: 'price_increased',
    priceChangeNote: 'Price increased by 23% from ₹649/mo to ₹799/mo',
    potentialAnnualSavings: 9588,
  },
  {
    id: 'sub-cultfit',
    merchant: 'Cult.fit Gym & Fitness',
    amount: 2400,
    billingCycle: 'monthly',
    category: 'Healthcare & Wellness',
    lastChargedDate: '2026-11-12',
    status: 'zombie_unused',
    inactivityNote: 'No gym check-ins detected for 48 days. Silent money leak!',
    potentialAnnualSavings: 28800,
  },
  {
    id: 'sub-spotify',
    merchant: 'Spotify Premium',
    amount: 199,
    billingCycle: 'monthly',
    category: 'Subscriptions & Entertainment',
    lastChargedDate: '2026-11-16',
    status: 'active',
    potentialAnnualSavings: 2388,
  },
  {
    id: 'sub-airtel',
    merchant: 'Airtel Broadband Fiber',
    amount: 1199,
    billingCycle: 'monthly',
    category: 'Utilities & Bills',
    lastChargedDate: '2026-11-19',
    status: 'active',
    potentialAnnualSavings: 14388,
  },
];

export const INITIAL_LEARNED_RULES: LearnedRule[] = [
  {
    id: 'rule-salary',
    merchantPattern: 'ACME',
    category: 'Income & Salary',
    source: 'ai_inferred',
    createdAt: '2026-11-01',
    applyCount: 4,
  },
  {
    id: 'rule-rent',
    merchantPattern: 'LANDLORD',
    category: 'Housing & Rent',
    source: 'user_correction',
    createdAt: '2026-11-02',
    applyCount: 2,
  },
];

export const DEFAULT_USER_PROFILE = {
  fullName: 'Arjun Sharma',
  email: 'arjun.sharma@productspace.ai',
  occupation: 'Lead AI Product Manager',
  riskTolerance: 'Moderate' as const,
  avatarInitials: 'AS',
  monthlyIncome: 150000,
  fixedObligations: 45000,
  currencySymbol: '₹',
};

export const DEFAULT_SETTINGS = {
  theme: 'light' as const,
  navPosition: 'top' as const,
};

