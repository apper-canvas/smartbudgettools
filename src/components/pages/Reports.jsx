import React, { useState, useEffect } from "react"
import { useOutletContext } from "react-router-dom"
import { motion } from "framer-motion"
import Card from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import SpendingChart from "@/components/organisms/SpendingChart"
import CategoryIcon from "@/components/molecules/CategoryIcon"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import ApperIcon from "@/components/ApperIcon"
import { transactionService } from "@/services/api/transactionService"
import { formatCurrency } from "@/utils/currency"
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns"

const Reports = () => {
  const outletContext = useOutletContext()
  const [transactions, setTransactions] = useState([])
  const [categoryAnalysis, setCategoryAnalysis] = useState([])
  const [monthlyTrends, setMonthlyTrends] = useState([])
  const [selectedPeriod, setSelectedPeriod] = useState("6months")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadReportData()
  }, [selectedPeriod])

  const loadReportData = async () => {
    try {
      setError("")
      const data = await transactionService.getAll()
      setTransactions(data)
      generateCategoryAnalysis(data)
      generateMonthlyTrends(data)
    } catch (err) {
      console.error("Failed to load report data:", err)
      setError("Failed to load report data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const generateCategoryAnalysis = (transactions) => {
    const now = new Date()
    let startDate
    
    switch (selectedPeriod) {
      case "1month":
        startDate = startOfMonth(now)
        break
      case "3months":
        startDate = startOfMonth(subMonths(now, 2))
        break
      case "6months":
        startDate = startOfMonth(subMonths(now, 5))
        break
      default:
        startDate = startOfMonth(subMonths(now, 5))
    }

    const filteredTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date)
      return transactionDate >= startDate && t.type === "expense"
    })

    const categoryTotals = {}
    const categoryTransactions = {}

    filteredTransactions.forEach(t => {
      if (!categoryTotals[t.category]) {
        categoryTotals[t.category] = 0
        categoryTransactions[t.category] = 0
      }
      categoryTotals[t.category] += t.amount
      categoryTransactions[t.category] += 1
    })

    const totalExpenses = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0)
    
    const analysis = Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      transactions: categoryTransactions[category],
      averageTransaction: categoryTransactions[category] > 0 ? amount / categoryTransactions[category] : 0
    })).sort((a, b) => b.amount - a.amount)

    setCategoryAnalysis(analysis)
  }

  const generateMonthlyTrends = (transactions) => {
    const months = []
    const now = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const startDate = startOfMonth(date)
      const endDate = endOfMonth(date)
      
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date)
        return transactionDate >= startDate && transactionDate <= endDate
      })

      const income = monthTransactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0)

      const expenses = monthTransactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0)

      months.push({
        month: format(date, "MMM yyyy"),
        income,
        expenses,
        net: income - expenses,
        transactionCount: monthTransactions.length
      })
    }

    setMonthlyTrends(months)
  }

  const exportData = () => {
    const csvData = [
      ["Date", "Type", "Category", "Amount", "Description"],
      ...transactions.map(t => [
        new Date(t.date).toLocaleDateString(),
        t.type,
        t.category,
        t.amount,
        t.description || ""
      ])
    ]

    const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    
    link.setAttribute("href", url)
    link.setAttribute("download", `smartbudget-transactions-${format(new Date(), "yyyy-MM-dd")}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return <Loading message="Generating reports..." />
  }

  if (error) {
    return <Error message={error} onRetry={loadReportData} />
  }

  if (transactions.length === 0) {
    return (
      <Empty
        title="No data for reports"
        description="Add some transactions to generate detailed financial reports."
        actionLabel="Add Transaction"
        onAction={() => window.location.href = "/transactions"}
        icon="BarChart3"
      />
    )
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
            Financial Reports
          </h1>
          <p className="text-gray-600 mt-1">
            Detailed insights into your spending patterns and trends
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
          </select>
          <Button onClick={exportData} variant="outline">
            <ApperIcon name="Download" className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SpendingChart 
          type="pie" 
          title="Spending Distribution" 
        />
        <SpendingChart 
          type="line" 
          title="Income vs Expenses Trend" 
        />
      </div>

      {/* Category Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Category Analysis</h3>
            <span className="text-sm text-gray-500">
              {selectedPeriod === "1month" ? "Last Month" : selectedPeriod === "3months" ? "Last 3 Months" : "Last 6 Months"}
            </span>
          </div>

          {categoryAnalysis.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No expense data available for the selected period</p>
            </div>
          ) : (
            <div className="space-y-4">
              {categoryAnalysis.map((item, index) => (
                <motion.div
                  key={item.category}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <CategoryIcon category={item.category} size="lg" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900">{item.category}</h4>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{item.percentage.toFixed(1)}% of total expenses</span>
                      <span>•</span>
                      <span>{item.transactions} transaction{item.transactions !== 1 ? "s" : ""}</span>
                      <span>•</span>
                      <span>Avg: {formatCurrency(item.averageTransaction)}</span>
                    </div>
                    <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                        className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Monthly Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Monthly Summary</h3>
            <p className="text-gray-500 mt-1">Income, expenses, and net balance by month</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-medium text-gray-900">Month</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-900">Income</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-900">Expenses</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-900">Net</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-900">Transactions</th>
                </tr>
              </thead>
              <tbody>
                {monthlyTrends.map((month, index) => (
                  <motion.tr
                    key={month.month}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-2 font-medium text-gray-900">{month.month}</td>
                    <td className="py-4 px-2 text-right text-success font-semibold">
                      {formatCurrency(month.income)}
                    </td>
                    <td className="py-4 px-2 text-right text-error font-semibold">
                      {formatCurrency(month.expenses)}
                    </td>
                    <td className={`py-4 px-2 text-right font-bold ${
                      month.net >= 0 ? "text-success" : "text-error"
                    }`}>
                      {formatCurrency(month.net)}
                    </td>
                    <td className="py-4 px-2 text-right text-gray-600">
                      {month.transactionCount}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

export default Reports