// ============================================================
// src/context/FinanceContext.js - Finance Global State
// ============================================================

import { createContext, useContext, useState, useCallback } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

// Create Context
const FinanceContext = createContext(null);

// ── Finance Provider Component ───────────────────────────────
export const FinanceProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ income: 0, expenses: 0, savings: 0 });
  const [analytics, setAnalytics] = useState({ monthlyData: {}, categoryData: {} });
  const [loading, setLoading] = useState(false);

  // ── Fetch All Transactions ─────────────────────────────────
  const fetchTransactions = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(
        Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
      ).toString();
      const { data } = await API.get(`/transactions?${params}`);
      setTransactions(data.transactions);
      setSummary(data.summary);
    } catch (error) {
      toast.error('Failed to load transactions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch Analytics Data ───────────────────────────────────
  const fetchAnalytics = useCallback(async () => {
    try {
      const { data } = await API.get('/transactions/analytics');
      setAnalytics({ monthlyData: data.monthlyData, categoryData: data.categoryData });
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }, []);

  // ── Add Transaction ────────────────────────────────────────
  const addTransaction = async (txData) => {
    try {
      const { data } = await API.post('/transactions', txData);
      toast.success('Transaction added! 💰');
      await fetchTransactions();
      await fetchAnalytics();
      return data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to add transaction';
      toast.error(msg);
      throw error;
    }
  };

  // ── Update Transaction ─────────────────────────────────────
  const updateTransaction = async (id, txData) => {
    try {
      const { data } = await API.put(`/transactions/${id}`, txData);
      toast.success('Transaction updated! ✏️');
      await fetchTransactions();
      await fetchAnalytics();
      return data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update transaction';
      toast.error(msg);
      throw error;
    }
  };

  // ── Delete Transaction ─────────────────────────────────────
  const deleteTransaction = async (id) => {
    try {
      await API.delete(`/transactions/${id}`);
      toast.success('Transaction deleted 🗑️');
      await fetchTransactions();
      await fetchAnalytics();
    } catch (error) {
      toast.error('Failed to delete transaction');
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        summary,
        analytics,
        loading,
        fetchTransactions,
        fetchAnalytics,
        addTransaction,
        updateTransaction,
        deleteTransaction
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

// ── Custom Hook ─────────────────────────────────────────────
export const useFinance = () => {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used inside <FinanceProvider>');
  return ctx;
};
