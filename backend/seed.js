// ============================================================
// seed.js - Populate MongoDB with Indian Sample Data
// Run: npm run seed
// ============================================================

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Transaction = require('./models/Transaction');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Transaction.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // ── Create Demo User ─────────────────────────────────────
    const user = await User.create({
      name: 'Aryan Sharma',
      email: 'aryan@demo.com',
      password: 'password123'
    });
    console.log('👤 Created demo user: aryan@demo.com / password123');

    // ── Generate 3 Months of Transactions ───────────────────
    const transactions = [];
    const now = new Date();

    for (let monthOffset = 2; monthOffset >= 0; monthOffset--) {
      const year = now.getFullYear();
      const month = now.getMonth() - monthOffset;

      // Income transactions
      transactions.push(
        {
          userId: user._id, type: 'income', amount: 45000,
          category: 'Salary', description: 'Monthly salary - TCS',
          date: new Date(year, month, 1)
        },
        {
          userId: user._id, type: 'income', amount: 8000 + Math.floor(Math.random() * 5000),
          category: 'Freelance', description: 'Freelance web project',
          date: new Date(year, month, 12)
        }
      );

      // Expense transactions
      transactions.push(
        {
          userId: user._id, type: 'expense', amount: 12000,
          category: 'Rent', description: 'Monthly flat rent - Pune',
          date: new Date(year, month, 1)
        },
        {
          userId: user._id, type: 'expense', amount: 4500 + Math.floor(Math.random() * 1500),
          category: 'Food', description: 'Groceries + Zomato orders',
          date: new Date(year, month, 8)
        },
        {
          userId: user._id, type: 'expense', amount: 1200,
          category: 'Entertainment', description: 'Netflix + Hotstar + Spotify',
          date: new Date(year, month, 5)
        },
        {
          userId: user._id, type: 'expense', amount: 2800 + Math.floor(Math.random() * 1200),
          category: 'Shopping', description: 'Flipkart + Amazon orders',
          date: new Date(year, month, 15)
        },
        {
          userId: user._id, type: 'expense', amount: 900 + Math.floor(Math.random() * 400),
          category: 'Travel', description: 'Ola/Uber + metro pass',
          date: new Date(year, month, 18)
        },
        {
          userId: user._id, type: 'expense', amount: 3000,
          category: 'Investment', description: 'SIP - Nifty 50 Index Fund',
          date: new Date(year, month, 10)
        },
        {
          userId: user._id, type: 'expense', amount: 599,
          category: 'Utilities', description: 'Jio postpaid + electricity',
          date: new Date(year, month, 20)
        },
        {
          userId: user._id, type: 'expense', amount: 1500,
          category: 'Education', description: 'Udemy courses',
          date: new Date(year, month, 25)
        }
      );
    }

    await Transaction.insertMany(transactions);
    console.log(`💰 Created ${transactions.length} sample transactions`);

    // Summary
    const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    console.log(`\n📊 Data Summary:`);
    console.log(`   Total Income:   ₹${income.toLocaleString('en-IN')}`);
    console.log(`   Total Expenses: ₹${expenses.toLocaleString('en-IN')}`);
    console.log(`   Net Savings:    ₹${(income - expenses).toLocaleString('en-IN')}`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Login Email: aryan@demo.com');
    console.log('🔑 Password:    password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seedDatabase();
