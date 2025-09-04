import React from "react"
import Card from "@/components/atoms/Card"
import ApperIcon from "@/components/ApperIcon"
import { formatCurrency } from "@/utils/currency"
import { motion } from "framer-motion"

const StatCard = ({ 
  title, 
  amount, 
  icon, 
  trend,
  trendValue,
  color = "primary",
  delay = 0
}) => {
  const colorClasses = {
    primary: "text-primary-600 bg-primary-50",
    success: "text-success bg-green-50",
    warning: "text-warning bg-yellow-50",
    error: "text-error bg-red-50",
    info: "text-info bg-blue-50"
  }

  const trendColors = {
    up: "text-success",
    down: "text-error",
    neutral: "text-gray-500"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card className="relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <motion.p 
              className="text-2xl font-bold text-gray-900 mb-2"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: delay + 0.1 }}
            >
              {formatCurrency(amount)}
            </motion.p>
            {trend && trendValue && (
              <div className="flex items-center gap-1">
                <ApperIcon 
                  name={trend === "up" ? "TrendingUp" : trend === "down" ? "TrendingDown" : "Minus"} 
                  className={`h-4 w-4 ${trendColors[trend]}`} 
                />
                <span className={`text-sm font-medium ${trendColors[trend]}`}>
                  {formatCurrency(Math.abs(trendValue))}
                </span>
                <span className="text-sm text-gray-500">vs last month</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <ApperIcon name={icon} className="h-6 w-6" />
          </div>
        </div>
        
        {/* Gradient overlay for premium look */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-transparent to-gray-50/50 rounded-full -translate-y-6 translate-x-6" />
      </Card>
    </motion.div>
  )
}

export default StatCard