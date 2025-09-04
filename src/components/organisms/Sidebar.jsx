import React from "react"
import { NavLink, useLocation } from "react-router-dom"
import ApperIcon from "@/components/ApperIcon"
import { motion } from "framer-motion"

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation()

  const navigation = [
    { name: "Dashboard", href: "/", icon: "LayoutDashboard" },
    { name: "Transactions", href: "/transactions", icon: "Receipt" },
    { name: "Budgets", href: "/budgets", icon: "Target" },
    { name: "Goals", href: "/goals", icon: "Trophy" },
    { name: "Reports", href: "/reports", icon: "BarChart3" }
  ]

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo and Brand */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-100">
        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg">
          <ApperIcon name="DollarSign" className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
            SmartBudget
          </h1>
          <p className="text-xs text-gray-500">Finance Tracker</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item, index) => {
          const isActive = location.pathname === item.href
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.1 }}
            >
              <NavLink
                to={item.href}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
              >
                <ApperIcon name={item.icon} className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
                {isActive && (
                  <motion.div
                    className="ml-auto w-2 h-2 bg-primary-500 rounded-full"
                    layoutId="activeIndicator"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </NavLink>
            </motion.div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
            <ApperIcon name="User" className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Personal Account</p>
            <p className="text-xs text-gray-500">Free Plan</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block lg:w-64 lg:flex-shrink-0">
        <div className="flex flex-col w-full h-screen bg-white border-r border-gray-200">
          {sidebarContent}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="lg:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl"
          >
            <div className="absolute top-4 right-4">
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <ApperIcon name="X" className="h-5 w-5" />
              </button>
            </div>
            {sidebarContent}
          </motion.div>
        </div>
      )}
    </>
  )
}

export default Sidebar