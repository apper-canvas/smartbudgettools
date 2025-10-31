import React, { useState, useEffect } from "react"
import { useOutletContext } from "react-router-dom"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import Button from "@/components/atoms/Button"
import Card from "@/components/atoms/Card"
import FormField from "@/components/molecules/FormField"
import ProgressRing from "@/components/molecules/ProgressRing"
import CategoryIcon from "@/components/molecules/CategoryIcon"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import ApperIcon from "@/components/ApperIcon"
import { budgetService } from "@/services/api/budgetService"
import { categoryService } from "@/services/api/categoryService"
import { transactionService } from "@/services/api/transactionService"
import { formatCurrency } from "@/utils/currency"
import { getCurrentMonth } from "@/utils/date"

const Budgets = () => {
  const outletContext = useOutletContext()
const [budgets, setBudgets] = useState([])
  const [categories, setCategories] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showBudgetForm, setShowBudgetForm] = useState(false)
  const [showAlertSettings, setShowAlertSettings] = useState(null)
  const [formData, setFormData] = useState({
    category: "",
    monthlyLimit: ""
  })
  const [alertSettings, setAlertSettings] = useState({
    threshold: 80,
    methods: ["email", "push"]
  })
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setError("")
      const [budgetsData, categoriesData, transactionsData] = await Promise.all([
        budgetService.getAll(),
        categoryService.getAll(),
        transactionService.getAll()
      ])

      const currentMonth = getCurrentMonth()
      const currentBudgets = budgetsData.filter(b => b.month === currentMonth.key)
      
      setBudgets(currentBudgets)
      setCategories(categoriesData.filter(c => c.type === "expense"))
      setTransactions(transactionsData)
    } catch (err) {
      console.error("Failed to load budget data:", err)
      setError("Failed to load budget data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const calculateSpentAmount = (category) => {
    const currentMonth = getCurrentMonth()
    const categoryTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date)
      return t.type === "expense" && 
             t.category === category &&
             transactionDate >= currentMonth.start && 
             transactionDate <= currentMonth.end
    })
    return categoryTransactions.reduce((sum, t) => sum + t.amount, 0)
  }

const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.category || !formData.monthlyLimit) {
      toast.error("Please fill in all fields")
      return
    }

    const monthlyLimit = parseFloat(formData.monthlyLimit)
    if (monthlyLimit <= 0) {
      toast.error("Budget amount must be greater than zero")
      return
    }

    // Check if budget already exists for this category
    const existingBudget = budgets.find(b => b.category === formData.category)
    if (existingBudget) {
      toast.error("Budget already exists for this category")
      return
    }

    try {
      const currentMonth = getCurrentMonth()
      const budgetData = {
        category: formData.category,
        monthlyLimit: monthlyLimit,
        spent: calculateSpentAmount(formData.category),
        month: currentMonth.key,
        alertThreshold: alertSettings.threshold,
        alertMethods: alertSettings.methods
      }

      const newBudget = await budgetService.create(budgetData)
      setBudgets(prev => [...prev, newBudget])
      
      setFormData({ category: "", monthlyLimit: "" })
      setShowBudgetForm(false)
      toast.success("Budget created successfully!")
    } catch (err) {
      console.error("Failed to create budget:", err)
      toast.error("Failed to create budget. Please try again.")
    }
  }

  const handleUpdateAlerts = async (budgetId, newAlertSettings) => {
    try {
      const updatedBudget = await budgetService.update(budgetId, {
        alertThreshold: newAlertSettings.threshold,
        alertMethods: newAlertSettings.methods
      })
      setBudgets(prev => prev.map(b => b.Id === budgetId ? updatedBudget : b))
      toast.success("Alert settings updated successfully!")
    } catch (err) {
      console.error("Failed to update alert settings:", err)
      toast.error("Failed to update alert settings. Please try again.")
    }
  }

  const toggleAlertSettings = (budgetId) => {
    if (showAlertSettings === budgetId) {
      setShowAlertSettings(null)
    } else {
      const budget = budgets.find(b => b.Id === budgetId)
      if (budget) {
        setAlertSettings({
          threshold: budget.alertThreshold || 80,
          methods: budget.alertMethods || ["email", "push"]
        })
      }
      setShowAlertSettings(budgetId)
    }
  }

  const handleDeleteBudget = async (id) => {
    if (!window.confirm("Are you sure you want to delete this budget?")) {
      return
    }

    try {
      await budgetService.delete(id)
      setBudgets(prev => prev.filter(b => b.Id !== id))
      toast.success("Budget deleted successfully!")
    } catch (err) {
      console.error("Failed to delete budget:", err)
      toast.error("Failed to delete budget. Please try again.")
    }
  }

  const availableCategories = categories.filter(c => 
    !budgets.some(b => b.category === c.name)
  )

  if (loading) {
    return <Loading message="Loading budgets..." />
  }

  if (error) {
    return <Error message={error} onRetry={loadData} />
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
            Budget Management
          </h1>
          <p className="text-gray-600 mt-1">
            Set and track your spending limits by category
          </p>
        </div>
        <Button
          onClick={() => setShowBudgetForm(true)}
          className="shadow-lg"
          disabled={availableCategories.length === 0}
        >
          <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
          Add Budget
        </Button>
      </motion.div>

      {/* Budget Form Modal */}
      {showBudgetForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <Card className="w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Create Budget</h3>
              <button
                onClick={() => setShowBudgetForm(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ApperIcon name="X" className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <FormField
                label="Category"
                type="select"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                required
              >
                <option value="">Select a category</option>
                {availableCategories.map(category => (
                  <option key={category.Id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </FormField>

              <FormField
                label="Monthly Budget Limit"
                type="input"
                inputType="number"
                step="0.01"
                placeholder="0.00"
                value={formData.monthlyLimit}
                onChange={(e) => setFormData(prev => ({ ...prev, monthlyLimit: e.target.value }))}
                required
              />

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1">
                  <ApperIcon name="Check" className="h-4 w-4 mr-2" />
                  Create Budget
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowBudgetForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* Budgets Grid */}
      {budgets.length === 0 ? (
        <Empty
          title="No budgets set"
          description="Create your first budget to start tracking your spending limits."
          actionLabel="Create Budget"
          onAction={() => setShowBudgetForm(true)}
          icon="Target"
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {budgets.map((budget, index) => {
            const spent = calculateSpentAmount(budget.category)
            const progress = (spent / budget.monthlyLimit) * 100
            const remaining = budget.monthlyLimit - spent
            const isOverBudget = spent > budget.monthlyLimit

            return (
              <motion.div
                key={budget.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
<Card className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <CategoryIcon category={budget.category} size="lg" />
                      <div>
                        <h3 className="font-semibold text-gray-900">{budget.category}</h3>
                        <p className="text-sm text-gray-500">Monthly Budget</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleAlertSettings(budget.Id)}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Alert Settings"
                      >
                        <ApperIcon name="Settings" className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBudget(budget.Id)}
                        className="p-2 text-gray-400 hover:text-error hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <ApperIcon name="Trash2" className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-center mb-6">
                    <ProgressRing
                      progress={Math.min(progress, 100)}
                      size={100}
                      strokeWidth={8}
                      color={isOverBudget ? "#F5222D" : progress > 80 ? "#FAAD14" : "#00875A"}
                      showPercentage={true}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Spent</span>
                      <span className={`font-semibold ${isOverBudget ? "text-error" : "text-gray-900"}`}>
                        {formatCurrency(spent)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Budget</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(budget.monthlyLimit)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <span className="text-sm font-medium text-gray-700">Remaining</span>
                      <span className={`font-bold ${remaining >= 0 ? "text-success" : "text-error"}`}>
                        {formatCurrency(remaining)}
                      </span>
                    </div>
                  </div>

                  {isOverBudget && (
                    <div className="mt-4 p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <ApperIcon name="AlertTriangle" className="h-4 w-4 text-error" />
                        <span className="text-sm font-medium text-error">Over Budget</span>
                      </div>
                      <p className="text-xs text-red-600 mt-1">
                        You've exceeded your budget by {formatCurrency(Math.abs(remaining))}
                      </p>
                    </div>
)}

                  {/* Alert Settings Panel */}
                  {showAlertSettings === budget.Id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-gray-100"
                    >
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Alert Configuration</h4>
                      
                      <div className="space-y-4">
                        {/* Alert Threshold */}
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-2 block">
                            Alert Threshold: {alertSettings.threshold}%
                          </label>
                          <input
                            type="range"
                            min="50"
                            max="95"
                            step="5"
                            value={alertSettings.threshold}
                            onChange={(e) => setAlertSettings(prev => ({ ...prev, threshold: parseInt(e.target.value) }))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                          />
                          <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>50%</span>
                            <span>95%</span>
                          </div>
                        </div>

                        {/* Notification Methods */}
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-2 block">
                            Notification Methods
                          </label>
                          <div className="space-y-2">
                            {[
                              { value: "email", label: "Email Notifications", icon: "Mail" },
                              { value: "push", label: "Push Notifications", icon: "Bell" },
                              { value: "sms", label: "SMS Messages", icon: "MessageSquare" }
                            ].map((method) => (
                              <label key={method.value} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={alertSettings.methods.includes(method.value)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setAlertSettings(prev => ({ 
                                        ...prev, 
                                        methods: [...prev.methods, method.value] 
                                      }))
                                    } else {
                                      setAlertSettings(prev => ({ 
                                        ...prev, 
                                        methods: prev.methods.filter(m => m !== method.value) 
                                      }))
                                    }
                                  }}
                                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                <ApperIcon name={method.icon} className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-700">{method.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleUpdateAlerts(budget.Id, alertSettings)}
                          >
                            Save Settings
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setShowAlertSettings(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}

export default Budgets