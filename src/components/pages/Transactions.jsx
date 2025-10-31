import React, { useState } from "react"
import { useOutletContext } from "react-router-dom"
import { motion } from "framer-motion"
import Button from "@/components/atoms/Button"
import TransactionList from "@/components/organisms/TransactionList"
import TransactionForm from "@/components/organisms/TransactionForm"
import ApperIcon from "@/components/ApperIcon"

const Transactions = () => {
  const outletContext = useOutletContext()
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleTransactionSaved = () => {
    setShowTransactionForm(false)
    setEditingTransaction(null)
    setRefreshTrigger(prev => prev + 1)
  }

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction)
    setShowTransactionForm(true)
  }

  const handleAddTransaction = () => {
    setEditingTransaction(null)
    setShowTransactionForm(true)
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
            Transactions
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your income and expense transactions
          </p>
        </div>
        <Button
          onClick={handleAddTransaction}
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
              transaction={editingTransaction}
              onSave={handleTransactionSaved}
              onCancel={() => {
                setShowTransactionForm(false)
                setEditingTransaction(null)
              }}
            />
          </div>
        </motion.div>
      )}

      {/* Transactions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <TransactionList 
          refreshTrigger={refreshTrigger}
          onEdit={handleEditTransaction}
        />
      </motion.div>
    </div>
  )
}

export default Transactions