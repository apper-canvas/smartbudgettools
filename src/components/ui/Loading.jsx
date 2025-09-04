import React from "react"
import { motion } from "framer-motion"
import ApperIcon from "@/components/ApperIcon"

const Loading = ({ message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="mb-4"
      >
        <ApperIcon name="Loader2" className="h-8 w-8 text-primary-500" />
      </motion.div>
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  )
}

export default Loading