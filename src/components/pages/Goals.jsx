import React, { useState, useEffect } from "react"
import { useOutletContext } from "react-router-dom"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import Button from "@/components/atoms/Button"
import Card from "@/components/atoms/Card"
import FormField from "@/components/molecules/FormField"
import ProgressRing from "@/components/molecules/ProgressRing"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import ApperIcon from "@/components/ApperIcon"
import { savingsGoalService } from "@/services/api/savingsGoalService"
import { formatCurrency } from "@/utils/currency"
import { formatDate, formatDateInput } from "@/utils/date"

const Goals = () => {
  const outletContext = useOutletContext()
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [showContributeModal, setShowContributeModal] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState(null)
  const [contributionAmount, setContributionAmount] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    deadline: ""
  })

  useEffect(() => {
    loadGoals()
  }, [])

  const loadGoals = async () => {
    try {
      setError("")
      const data = await savingsGoalService.getAll()
      setGoals(data)
    } catch (err) {
      console.error("Failed to load goals:", err)
      setError("Failed to load savings goals. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.targetAmount || !formData.deadline) {
      toast.error("Please fill in all required fields")
      return
    }

    const targetAmount = parseFloat(formData.targetAmount)
    const currentAmount = parseFloat(formData.currentAmount) || 0

    if (targetAmount <= 0) {
      toast.error("Target amount must be greater than zero")
      return
    }

    if (currentAmount < 0) {
      toast.error("Current amount cannot be negative")
      return
    }

    if (currentAmount > targetAmount) {
      toast.error("Current amount cannot exceed target amount")
      return
    }

    try {
      const goalData = {
        name: formData.name,
        targetAmount: targetAmount,
        currentAmount: currentAmount,
        deadline: new Date(formData.deadline).toISOString()
      }

      if (editingGoal) {
        const updatedGoal = await savingsGoalService.update(editingGoal.Id, goalData)
        setGoals(prev => prev.map(g => g.Id === editingGoal.Id ? updatedGoal : g))
        toast.success("Savings goal updated successfully!")
      } else {
        const newGoal = await savingsGoalService.create(goalData)
        setGoals(prev => [...prev, newGoal])
        toast.success("Savings goal created successfully!")
      }

      resetForm()
    } catch (err) {
      console.error("Failed to save goal:", err)
      toast.error("Failed to save savings goal. Please try again.")
    }
  }

  const handleContribute = async (e) => {
    e.preventDefault()

    const amount = parseFloat(contributionAmount)
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid contribution amount")
      return
    }

    const newCurrentAmount = selectedGoal.currentAmount + amount
    if (newCurrentAmount > selectedGoal.targetAmount) {
      toast.error("Contribution would exceed target amount")
      return
    }

    try {
      const updatedGoal = await savingsGoalService.update(selectedGoal.Id, {
        ...selectedGoal,
        currentAmount: newCurrentAmount
      })
      
      setGoals(prev => prev.map(g => g.Id === selectedGoal.Id ? updatedGoal : g))
      setShowContributeModal(false)
      setSelectedGoal(null)
      setContributionAmount("")
      toast.success(`Added ${formatCurrency(amount)} to ${selectedGoal.name}!`)
    } catch (err) {
      console.error("Failed to add contribution:", err)
      toast.error("Failed to add contribution. Please try again.")
    }
  }

  const handleEditGoal = (goal) => {
    setEditingGoal(goal)
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      deadline: formatDateInput(goal.deadline)
    })
    setShowGoalForm(true)
  }

  const handleDeleteGoal = async (id) => {
    if (!window.confirm("Are you sure you want to delete this savings goal?")) {
      return
    }

    try {
      await savingsGoalService.delete(id)
      setGoals(prev => prev.filter(g => g.Id !== id))
      toast.success("Savings goal deleted successfully!")
    } catch (err) {
      console.error("Failed to delete goal:", err)
      toast.error("Failed to delete savings goal. Please try again.")
    }
  }

  const openContributeModal = (goal) => {
    setSelectedGoal(goal)
    setShowContributeModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      targetAmount: "",
      currentAmount: "",
      deadline: ""
    })
    setShowGoalForm(false)
    setEditingGoal(null)
  }

  if (loading) {
    return <Loading message="Loading savings goals..." />
  }

  if (error) {
    return <Error message={error} onRetry={loadGoals} />
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
            Savings Goals
          </h1>
          <p className="text-gray-600 mt-1">
            Set and track your financial savings objectives
          </p>
        </div>
        <Button
          onClick={() => setShowGoalForm(true)}
          className="shadow-lg"
        >
          <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
          Add Goal
        </Button>
      </motion.div>

      {/* Goal Form Modal */}
      {showGoalForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <Card className="w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingGoal ? "Edit Savings Goal" : "Create Savings Goal"}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ApperIcon name="X" className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <FormField
                label="Goal Name"
                type="input"
                placeholder="e.g., Emergency Fund, Vacation, New Car"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Target Amount"
                  type="input"
                  inputType="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
                  required
                />

                <FormField
                  label="Current Amount"
                  type="input"
                  inputType="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.currentAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentAmount: e.target.value }))}
                />
              </div>

              <FormField
                label="Target Date"
                type="input"
                inputType="date"
                value={formData.deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                required
              />

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1">
                  <ApperIcon name="Check" className="h-4 w-4 mr-2" />
                  {editingGoal ? "Update Goal" : "Create Goal"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={resetForm}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* Contribute Modal */}
      {showContributeModal && selectedGoal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <Card className="w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Add Contribution</h3>
              <button
                onClick={() => {
                  setShowContributeModal(false)
                  setSelectedGoal(null)
                  setContributionAmount("")
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ApperIcon name="X" className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-2">{selectedGoal.name}</h4>
              <p className="text-sm text-gray-500">
                Current: {formatCurrency(selectedGoal.currentAmount)} of {formatCurrency(selectedGoal.targetAmount)}
              </p>
            </div>

            <form onSubmit={handleContribute} className="space-y-6">
              <FormField
                label="Contribution Amount"
                type="input"
                inputType="number"
                step="0.01"
                placeholder="0.00"
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value)}
                required
              />

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1">
                  <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
                  Add Contribution
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowContributeModal(false)
                    setSelectedGoal(null)
                    setContributionAmount("")
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <Empty
          title="No savings goals yet"
          description="Create your first savings goal to start building your financial future."
          actionLabel="Create Goal"
          onAction={() => setShowGoalForm(true)}
          icon="Trophy"
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {goals.map((goal, index) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100
            const remaining = goal.targetAmount - goal.currentAmount
            const isCompleted = goal.currentAmount >= goal.targetAmount
            const isOverdue = new Date(goal.deadline) < new Date() && !isCompleted

            return (
              <motion.div
                key={goal.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${
                        isCompleted ? "bg-success text-white" : "bg-primary-50 text-primary-600"
                      }`}>
                        <ApperIcon name={isCompleted ? "CheckCircle" : "Trophy"} className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{goal.name}</h3>
                        <p className="text-sm text-gray-500">
                          Target: {formatDate(goal.deadline)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditGoal(goal)}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <ApperIcon name="Edit" className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal.Id)}
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
                      color={isCompleted ? "#52C41A" : isOverdue ? "#F5222D" : "#00875A"}
                      showPercentage={true}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Current</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(goal.currentAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Target</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(goal.targetAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <span className="text-sm font-medium text-gray-700">Remaining</span>
                      <span className={`font-bold ${isCompleted ? "text-success" : "text-primary-600"}`}>
                        {formatCurrency(remaining)}
                      </span>
                    </div>
                  </div>

                  {isCompleted && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <ApperIcon name="CheckCircle" className="h-4 w-4 text-success" />
                        <span className="text-sm font-medium text-success">Goal Achieved!</span>
                      </div>
                      <p className="text-xs text-green-600 mt-1">
                        Congratulations on reaching your savings goal!
                      </p>
                    </div>
                  )}

                  {isOverdue && !isCompleted && (
                    <div className="mt-4 p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <ApperIcon name="AlertTriangle" className="h-4 w-4 text-error" />
                        <span className="text-sm font-medium text-error">Overdue</span>
                      </div>
                      <p className="text-xs text-red-600 mt-1">
                        This goal is past its target date
                      </p>
                    </div>
                  )}

                  {!isCompleted && (
                    <div className="mt-4">
                      <Button
                        onClick={() => openContributeModal(goal)}
                        variant="outline"
                        className="w-full"
                        size="sm"
                      >
                        <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
                        Add Contribution
                      </Button>
                    </div>
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

export default Goals