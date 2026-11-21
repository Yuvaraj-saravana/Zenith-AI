# 🌟 Zenith AI — The Living Money Coach
> Built for the **Product Space Agentic AI Hackathon (Problem Statement 04: Personal Finance Coach with a Living Money Model)**

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF.svg)](https://vite.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Compliance](https://img.shields.io/badge/Compliance-SEBI%20%2F%20Fiduciary%20Guardrails-green.svg)](#8-ethical-guardrails--compliance-badge)

---

## 🎯 Executive Summary & Problem Understanding

Most budgeting apps merely categorize transactions into static buckets and stop there. They don't understand a person's life milestones, fail to adapt when life happens, make the same classification mistakes repeatedly, and leave users stranded with historical graphs.

**Zenith AI** solves this with an **autonomous Living Money Model** that:
1. Ingests messy, noisy real-world statements (**Bank CSV, PDF statement extracts, and raw SMS transaction streams**).
2. Closes the loop with **dynamic rule-learning**: when a user corrects a category, Zenith remembers and retroactively updates historical and future transactions.
3. Automatically hunts for **recurring subscription leaks** (e.g. unused gym passes, silent price hikes).
4. Maintains a **living financial profile** tracking cash flow velocity and emergency runway.
5. Features an **interactive What-If goal simulator** (e.g. *"What if I cut dining out by 30%?"* or *"What if my rent increases?"*).
6. Delivers **proactive spending velocity nudges** before you blow your budget.
7. Produces an **Executive Monthly Financial Review** ready for export.
8. Enforces **strict SEBI/SEC fiduciary guardrails**, educating and modeling scenarios without illegal security endorsements.

---

## 🏗️ Technical Architecture & Mandatory Features Checklist

| # | Hackathon Requirement | Zenith Implementation & Feature | Status |
| :---: | :--- | :--- | :---: |
| **01** | **Messy Statement Ingestion** | Ingests CSVs, messy PDF text, and raw SMS stream with automated normalization, noise-stripping, and payment channel identification. | ✅ Complete |
| **02** | **Continuous Rule Learning** | Interactive category dropdown triggers instant modal: *"Teach Zenith this rule for future txns?"*. Rules persist in long-term memory. | ✅ Complete |
| **03** | **Subscription & Leak Radar** | Detects cadence anomalies, flags 23% Netflix price hikes, and catches zombie subscriptions (e.g., Cult.fit gym pass with 0 visits in 48 days). | ✅ Complete |
| **04** | **Persistent Financial Profile** | Live tracking of Inflow, Fixed Obligations, Emergency Fund Runway (months), and 3 prioritized life goals. | ✅ Complete |
| **05** | **Goal Planner & What-If Sim** | Real-time sliders for Dining Cut (0-50%), Rent Adjustments, and Subscription Cancellation. Calculates exact months saved per goal with 12-month wealth projection. | ✅ Complete |
| **06** | **Spending Drift Nudges** | Autonomous velocity alerts warn when dining pace exceeds safe thresholds or when surplus can be deployed to goals. | ✅ Complete |
| **07** | **Monthly Review Report** | Institutional-grade executive health check with AI synthesis narrative, leak audit, and 3-step action plan. | ✅ Complete |
| **08** | **Ethical Guardrails & Compliance** | Dedicated compliance filter that deflects stock tips and crypto speculation while providing safe asset-allocation education. | ✅ Complete |

---

## 🚀 Quickstart & Demo Setup

### 1. Run Locally
```bash
# Clone and enter directory
cd "Agentic AI"

# Install dependencies (if not already installed)
npm install

# Start the Vite development server
npm run dev
```

Open your browser at: **`http://localhost:5173/`**

---

## 🎬 3-Minute Hackathon Demo Script (For Demo Day / Video)

1. **The Problem (0:00 - 0:30)**:
   - "Traditional budgeting apps are passive rear-view mirrors. Meet Zenith AI: an autonomous living money coach."
2. **Messy Ingestion & Rule-Learning (0:30 - 1:15)**:
   - Click **"Ingestion & Data Lab"**. Show raw SMS / CSV / PDF text with cryptic merchant codes (`POS 401209 SWIGGY`).
   - Click **"Ingest & Categorize"**. Notice instant classification.
   - Change a category for *Swiggy* or *Starbucks*. Show the prompt: *"Teach Zenith this rule?"*. Click **Yes, Learn Rule**.
   - Navigate to **"Agent Memory"** to show the rule stored in the agent's persistent memory!
3. **Subscription Leak Radar (1:15 - 1:45)**:
   - Switch to **"Subscription Radar"**. Highlight the red alert: *Cult.fit Gym (₹2,400/mo, 0 visits in 48 days — ₹28,800/yr leak)* and *Netflix +23% price hike*.
   - Click **Cancel & Save**, redirecting that cash flow directly to the living money model!
4. **Interactive What-If Simulation (1:45 - 2:30)**:
   - Open **"What-If Simulator"**. Drag the **"Cut Dining Out"** slider to 30%.
   - Watch the live recalculation: *Monthly surplus jumps by +₹3,500/mo*, and the **"Japan Trip 2027"** goal finishes **3 months earlier**!
   - Click **"Celebrate Goal Acceleration"** for confetti!
5. **Guardrail Defense & AI Coach (2:30 - 3:00)**:
   - Open **"AI Coach & Guardrails"**. Click the test prompt: *"Which stock should I buy today to double my money?"*.
   - Watch Zenith trigger the **Ethical Guardrail Shield**, refusing stock speculation and explaining fiduciary guidelines.

---

## 📱 Bonus Points: LinkedIn Streak Posts (Ready to Copy & Post)

### 📌 Post 1 (Kickoff - Share Today)
```markdown
🚀 Excited to be building in the Product Space Agentic AI Hackathon today!

I’m tackling Problem Statement 04: Building a "Personal Finance Coach with a Living Money Model".

The core thesis:
Traditional budgeting apps are broken. They categorize transactions into rigid buckets, make the same mistakes repeatedly, and show you what you spent instead of how your decisions impact tomorrow.

Today, I’m building Zenith AI:
✨ Ingests messy, raw bank PDFs, CSVs, and SMS transaction streams.
🧠 Dynamic rule learning: When you correct a category, Zenith remembers it permanently.
🔮 Interactive What-If simulation: "What happens if I cut Swiggy by 30% or my rent goes up?"
🛡️ Strict SEBI-aligned ethical financial guardrails.

Let's see what can be built in one single day! Stay tuned for the progress demo later today.

Huge shoutout to @Product Space for hosting this challenge! 🚀

#AgenticAI #AIHackathon #ProductManagement #Fintech #BuildInPublic #AIProductManager
```

---

### 📌 Post 2 (Midway Build Progress - Share This Evening)
```markdown
⚡ Midway update from the Product Space Agentic AI Hackathon!

Here is what we've engineered over the last few hours for Zenith AI:
1. Ingestion Lab: Multi-format parser capable of cleaning noisy SMS strings (`Txn of INR 850 at SWIGGY...`) and bank CSV/PDF statements.
2. The Correction Feedback Loop: Instead of static classifiers, Zenith features an adaptive memory engine. Change a merchant once, and it updates all past and future transactions.
3. Subscription Radar: Detected a silent ₹28,800/yr leak from an unused gym subscription and an unannounced 23% streaming price hike!

Next up: Connecting the Living Money Model to real-time What-If trajectory charts and finishing the automated monthly executive audit.

Building fast with React, Vite, and Agentic workflows!

@Product Space #AgenticAI #BuildInPublic #Fintech #PersonalFinance #Hackathon
```

---

### 📌 Post 3 (Final Submission - Share by Tomorrow)
```markdown
🏆 It’s a wrap! Zenith AI — The Living Money Coach is live!

Built from scratch in 1 day for the @Product Space Agentic AI Hackathon.

Watch the full demo walk-through:
✨ Messy Statement Ingestion (PDF, CSV, and raw SMS dumps)
✨ Continuous Rule Learning Engine with long-term memory
✨ Subscription Anomaly Hunter (catches zombie subscriptions & price hikes)
✨ Interactive Goal Planner with What-If Simulation ("What if I cut dining out by 30%?")
✨ Automated Executive Monthly Health Review
✨ Strict Regulatory Guardrails (educates on cash flow, rejects speculative stock tipping)

Huge thanks to the mentors and organizers at @Product Space!

#ProductSpace #AgenticAI #GenerativeAI #Fintech #HackathonWinner #BuildInPublic
```
"# Zenith-AI" 
