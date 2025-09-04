import React from "react"
import Button from "@/components/atoms/Button"
import ApperIcon from "@/components/ApperIcon"

const Header = ({ onMenuClick, title }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <ApperIcon name="Menu" className="h-5 w-5" />
          </Button>
          
          {title && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Quick Actions */}
          <div className="hidden sm:flex items-center gap-2">
            <Button variant="outline" size="sm">
              <ApperIcon name="Download" className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Notifications */}
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative">
            <ApperIcon name="Bell" className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-error text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          {/* Settings */}
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <ApperIcon name="Settings" className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header