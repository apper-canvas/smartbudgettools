import React, { useState, useEffect } from "react"
import { useOutletContext } from "react-router-dom"
import { motion } from "framer-motion"
import StatCard from "@/components/molecules/StatCard"
import TransactionList from "@/components/organisms/TransactionList"
import SpendingChart from "@/components/organisms/SpendingChart"
import Button from "@/components/atoms/Button"
import TransactionForm from "@/components/organisms/TransactionForm"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import ApperIcon from "@/components/ApperIcon"
import { transactionService } from "@/services/api/transactionService"
import { budgetService } from "@/services/api/budgetService"
import { formatCurrency } from "@/utils/currency"
import { getCurrentMonth } from "@/utils/date"

const Dashboard = () => {
  const outletContext = useOutletContext()
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    remainingBudget: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    loadDashboardData()
  }, [refreshTrigger])

  const loadDashboardData = async () => {
    try {
      setError("")
      const [transactions, budgets] = await Promise.all([
        transactionService.getAll(),
        budgetService.getAll()
      ])

      const currentMonth = getCurrentMonth()
      const currentMonthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date)
        return transactionDate >= currentMonth.start && transactionDate <= currentMonth.end
      })

      const income = currentMonthTransactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0)

      const expenses = currentMonthTransactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0)

      const totalBudget = budgets
        .filter(b => b.month === currentMonth.key)
        .reduce((sum, b) => sum + b.monthlyLimit, 0)

      const remaining = totalBudget - expenses

      setStats({
        totalIncome: income,
        totalExpenses: expenses,
        netBalance: income - expenses,
        remainingBudget: remaining
      })
    } catch (err) {
      console.error("Failed to load dashboard data:", err)
      setError("Failed to load dashboard data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleTransactionSaved = () => {
    setShowTransactionForm(false)
    setRefreshTrigger(prev => prev + 1)
  }

  const handleEditTransaction = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  if (loading) {
    return <Loading message="Loading dashboard..." />
  }

  if (error) {
    return <Error message={error} onRetry={loadDashboardData} />
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
            Financial Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Track your income, expenses, and financial goals
          </p>
        </div>
        <Button
          onClick={() => setShowTransactionForm(true)}
          className="shadow-lg"
        >
          <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
      </motion.div>

      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <TransactionForm
              onSave={handleTransactionSaved}
              onCancel={() => setShowTransactionForm(false)}
            />
          </div>
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Income"
          amount={stats.totalIncome}
          icon="TrendingUp"
          color="success"
          trend="up"
          trendValue={stats.totalIncome * 0.12}
          delay={0}
        />
        <StatCard
          title="Total Expenses"
          amount={stats.totalExpenses}
          icon="TrendingDown"
          color="error"
          trend="down"
          trendValue={stats.totalExpenses * 0.08}
          delay={0.1}
        />
        <StatCard
          title="Net Balance"
          amount={stats.netBalance}
          icon="DollarSign"
          color={stats.netBalance >= 0 ? "success" : "error"}
          trend={stats.netBalance >= 0 ? "up" : "down"}
          trendValue={Math.abs(stats.netBalance * 0.05)}
          delay={0.2}
        />
        <StatCard
          title="Remaining Budget"
          amount={stats.remainingBudget}
          icon="Target"
          color={stats.remainingBudget >= 0 ? "primary" : "warning"}
          trend={stats.remainingBudget >= 0 ? "up" : "down"}
          trendValue={Math.abs(stats.remainingBudget * 0.1)}
          delay={0.3}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SpendingChart 
          type="pie" 
          title="Expenses by Category" 
        />
        <SpendingChart 
          type="line" 
          title="Income vs Expenses Trend" 
        />
      </div>

      {/* Recent Transactions */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = "/transactions"}
          >
            <ApperIcon name="ArrowRight" className="h-4 w-4 ml-2" />
            View All
          </Button>
        </div>
        <TransactionList 
          refreshTrigger={refreshTrigger}
          onEdit={handleEditTransaction}
        />
      </div>
    </div>
  )
}

export default Dashboard