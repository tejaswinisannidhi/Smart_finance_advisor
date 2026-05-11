// ============================================================
// controllers/aiController.js - AI Financial Advice Logic
// ============================================================

const OpenAI = require('openai');
const Transaction = require('../models/Transaction');

// ============================================================
// @desc    Get AI financial advice based on user's spending
// @route   POST /api/ai/advice
// @access  Private
// ============================================================
const getAdvice = async (req, res) => {
  try {
    const userId = req.user._id;
    const userName = req.user.name;

    // Get last 3 months of transactions
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const transactions = await Transaction.find({
      userId,
      date: { $gte: threeMonthsAgo }
    });

    // Handle no transactions case
    if (transactions.length === 0) {
      return res.json({
        success: true,
        advice: {
          budgetSuggestions: [
            'Start by logging your daily expenses to track your spending patterns!',
            'Add your monthly income (salary, freelance) first to set a baseline.',
            'Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings.'
          ],
          savingRecommendations: [
            'Open a high-yield savings account to earn interest on idle money.',
            'Set a savings goal - even ₹500/month adds up to ₹6,000/year!',
            'Automate savings transfers on the day you receive your salary.'
          ],
          investmentSuggestions: [
            'Start a SIP (Systematic Investment Plan) with just ₹500/month in index funds.',
            'Explore Zerodha or Groww apps - perfect for beginner investors in India.',
            'Consider PPF (Public Provident Fund) for tax-free long-term savings.'
          ],
          overspendingAlerts: [],
          summary: "Welcome to Smart Finance Advisor! 🎉 Start adding your income and expenses to get personalized AI advice based on your actual spending habits!"
        }
      });
    }

    // ── Calculate Financial Summary ──────────────────────────
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const savings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0
      ? ((savings / totalIncome) * 100).toFixed(1)
      : 0;

    // ── Category Breakdown ───────────────────────────────────
    const categorySpend = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        categorySpend[t.category] = (categorySpend[t.category] || 0) + t.amount;
      });

    const spendingBreakdown = Object.entries(categorySpend)
      .map(([cat, amt]) => `${cat}: ₹${amt.toFixed(2)}`)
      .join(', ');

    // ── Check if OpenAI API Key is configured ───────────────
    const hasOpenAIKey =
      process.env.OPENAI_API_KEY &&
      process.env.OPENAI_API_KEY !== 'sk-your-openai-api-key-here';

    if (!hasOpenAIKey) {
      // Return intelligent rule-based advice
      return res.json({
        success: true,
        advice: generateSmartAdvice(totalIncome, totalExpenses, savings, savingsRate, categorySpend),
        note: '🤖 Using smart rule-based advice. Add your OpenAI API key in backend/.env for GPT-powered personalized advice!'
      });
    }

    // ── OpenAI API Call ──────────────────────────────────────
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `You are a friendly, modern financial advisor for GenZ Indians (ages 18-27).

Analyze this user's finances and give practical advice in Indian context (use ₹ symbol):

User: ${userName}
Period: Last 3 months
Total Income: ₹${totalIncome.toFixed(2)}
Total Expenses: ₹${totalExpenses.toFixed(2)}
Net Savings: ₹${savings.toFixed(2)}
Savings Rate: ${savingsRate}%
Spending Breakdown: ${spendingBreakdown || 'No expenses recorded'}

Respond ONLY with a valid JSON object (no markdown, no extra text):
{
  "budgetSuggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "savingRecommendations": ["tip1", "tip2", "tip3"],
  "investmentSuggestions": ["invest1", "invest2", "invest3"],
  "overspendingAlerts": ["alert1", "alert2"],
  "summary": "One paragraph friendly summary with emojis"
}

Make advice relevant to India: mention SIP, Zerodha, Groww, PPF, FD, UPI savings, Nifty50 index funds, etc. Use casual GenZ language. Be encouraging but honest about overspending.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 900,
      temperature: 0.7
    });

    const rawResponse = completion.choices[0].message.content.trim();

    let advice;
    try {
      // Try to parse OpenAI JSON response
      advice = JSON.parse(rawResponse);
    } catch {
      // Fallback to rule-based if parsing fails
      advice = generateSmartAdvice(totalIncome, totalExpenses, savings, savingsRate, categorySpend);
    }

    res.json({ success: true, advice });

  } catch (error) {
    console.error('AI Advice Error:', error.message);
    res.json({
      success: true,
      advice: {
        budgetSuggestions: [
          'Apply the 50/30/20 rule: 50% for needs, 30% for wants, 20% for savings',
          'Track every expense for 30 days to find hidden spending leaks',
          'Set monthly spending limits for each category in advance'
        ],
        savingRecommendations: [
          'Pay yourself first - transfer savings to a separate account on payday',
          'Build an emergency fund of 3-6 months of expenses before investing',
          'Cancel subscriptions you haven\'t used in the last 3 months'
        ],
        investmentSuggestions: [
          'Start a SIP of ₹500/month in Nifty 50 index fund for long-term wealth',
          'Open a PPF account for tax-free savings with government-backed returns',
          'Use Groww or Zerodha to start your investment journey commission-free'
        ],
        overspendingAlerts: [],
        summary: 'Your financial journey is just beginning! 🚀 Small, consistent habits today will build massive wealth tomorrow. Start with tracking, then saving, then investing!'
      },
      note: 'AI service unavailable - showing general advice.'
    });
  }
};

// ── Smart Rule-Based Advice Generator ───────────────────────
const generateSmartAdvice = (income, expenses, savings, savingsRate, categorySpend) => {
  const alerts = [];
  const budgetSuggestions = [];
  const savingRecs = [];
  const investmentSuggestions = [];

  // Check for overspending by category
  if (income > 0) {
    if (categorySpend['Food'] && (categorySpend['Food'] / income) > 0.3) {
      alerts.push(`🍕 Food is ${((categorySpend['Food'] / income) * 100).toFixed(0)}% of your income! Try meal prepping to cut costs by 40%.`);
    }
    if (categorySpend['Entertainment'] && (categorySpend['Entertainment'] / income) > 0.15) {
      alerts.push(`🎮 Entertainment costs ${((categorySpend['Entertainment'] / income) * 100).toFixed(0)}% of income. Look for free events and OTT plan sharing.`);
    }
    if (categorySpend['Shopping'] && (categorySpend['Shopping'] / income) > 0.2) {
      alerts.push(`🛍️ Shopping is ${((categorySpend['Shopping'] / income) * 100).toFixed(0)}% of income. Try a 48-hour rule before non-essential purchases.`);
    }
    if (categorySpend['Travel'] && (categorySpend['Travel'] / income) > 0.2) {
      alerts.push(`✈️ Travel spending at ${((categorySpend['Travel'] / income) * 100).toFixed(0)}% of income. Use metro/bus passes for daily commute to save.`);
    }
  }

  // Budget suggestions based on savings rate
  if (parseFloat(savingsRate) < 10) {
    budgetSuggestions.push(`⚠️ Your savings rate is only ${savingsRate}% - try to cut one major expense to reach at least 20%.`);
  } else {
    budgetSuggestions.push(`✅ ${savingsRate}% savings rate - great start! Push towards 30% for faster wealth building.`);
  }
  budgetSuggestions.push(`Apply 50/30/20 to ₹${income.toFixed(0)} income: ₹${(income * 0.5).toFixed(0)} needs, ₹${(income * 0.3).toFixed(0)} wants, ₹${(income * 0.2).toFixed(0)} savings`);
  budgetSuggestions.push('Use UPI transaction history to review and categorize all spending monthly.');

  // Saving recommendations
  if (savings > 0) {
    savingRecs.push(`You saved ₹${savings.toFixed(2)}! Move this to a High-Yield FD or liquid fund earning 6-7% APY.`);
  } else {
    savingRecs.push('Expenses exceed income this period. Identify the top 2 expense categories and cut them by 20%.');
  }
  savingRecs.push('Set up automatic transfer to savings account on the 1st of every month.');
  savingRecs.push('Use separate bank accounts: one for bills, one for spending, one for savings.');

  // Investment suggestions
  investmentSuggestions.push('Start a ₹500/month SIP in Nifty 50 index fund on Groww or Zerodha - historically 12% annual returns.');
  investmentSuggestions.push('Open a PPF account: ₹500/year minimum, tax-free returns, government backed, 7.1% interest.');
  investmentSuggestions.push('Keep 3-6 months emergency fund in a liquid fund before investing in equity markets.');

  const summary = `${parseFloat(savingsRate) >= 20 ? '🚀 Crushing it!' : parseFloat(savingsRate) >= 10 ? '💪 Decent progress!' : '⚠️ Needs attention!'} Your savings rate is ${savingsRate}%. ${
    parseFloat(savingsRate) >= 20
      ? 'You\'re building serious wealth! Now focus on investing your savings in index funds and PPF for long-term growth.'
      : parseFloat(savingsRate) >= 10
      ? 'You\'re on the right track. Cut one major expense category by 20% to unlock the next level of financial freedom.'
      : 'Time to audit your expenses! Identify your top spending categories and set strict limits. Every rupee saved now = financial freedom later.'
  } 🎯`;

  return { budgetSuggestions, savingRecommendations: savingRecs, investmentSuggestions, overspendingAlerts: alerts, summary };
};

// ============================================================
// @desc    Get savings prediction and 6-month forecast
// @route   GET /api/ai/predict
// @access  Private
// ============================================================
const getSavingsPrediction = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    // Get last 3 months for pattern analysis
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const transactions = await Transaction.find({
      userId,
      date: { $gte: threeMonthsAgo }
    });

    // ── Monthly Averages ─────────────────────────────────────
    const monthlyStats = {};
    transactions.forEach((t) => {
      const key = `${t.date.getFullYear()}-${t.date.getMonth()}`;
      if (!monthlyStats[key]) monthlyStats[key] = { income: 0, expenses: 0 };
      if (t.type === 'income') monthlyStats[key].income += t.amount;
      else monthlyStats[key].expenses += t.amount;
    });

    const months = Object.values(monthlyStats);
    const avgIncome = months.length
      ? months.reduce((s, m) => s + m.income, 0) / months.length
      : 0;
    const avgExpenses = months.length
      ? months.reduce((s, m) => s + m.expenses, 0) / months.length
      : 0;
    const avgSavings = avgIncome - avgExpenses;

    // ── Current Month Data ───────────────────────────────────
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentTxns = transactions.filter((t) => t.date >= currentMonthStart);

    const currentIncome = currentTxns
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);
    const currentExpenses = currentTxns
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);

    // Use actual current month values directly (no daily projection scaling)
    // projectedIncome  = current income so far (or avg if none yet)
    // projectedExpenses = current expenses so far (or avg if none yet)
 const projectedIncome   = currentIncome   > 0 ? currentIncome   : avgIncome;
const projectedExpenses = currentExpenses > 0 ? currentExpenses : avgExpenses;
const endOfMonthSavings = projectedIncome - projectedExpenses;

    // ── 6-Month Forecast ─────────────────────────────────────
    const forecast = [];
    let cumulativeSavings = 0;

    for (let i = 1; i <= 6; i++) {
      const forecastDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      cumulativeSavings += avgSavings;

      forecast.push({
        month: forecastDate.toLocaleString('default', {
          month: 'short',
          year: 'numeric'
        }),
        projectedIncome: parseFloat(avgIncome.toFixed(2)),
        projectedExpenses: parseFloat(avgExpenses.toFixed(2)),
        projectedSavings: parseFloat(avgSavings.toFixed(2)),
        cumulativeSavings: parseFloat(cumulativeSavings.toFixed(2))
      });
    }

    res.json({
      success: true,
      currentMonth: {
        income: parseFloat(currentIncome.toFixed(2)),
        expenses: parseFloat(currentExpenses.toFixed(2)),
        projectedEndOfMonth: parseFloat(endOfMonthSavings.toFixed(2))
      },
      averages: {
        income: parseFloat(avgIncome.toFixed(2)),
        expenses: parseFloat(avgExpenses.toFixed(2)),
        savings: parseFloat(avgSavings.toFixed(2))
      },
      sixMonthForecast: forecast
    });

  } catch (error) {
    console.error('Prediction Error:', error);
    res.status(500).json({ message: 'Server error generating predictions' });
  }
};

module.exports = { getAdvice, getSavingsPrediction };