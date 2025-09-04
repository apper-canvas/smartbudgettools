import React from "react"
import Label from "@/components/atoms/Label"
import Input from "@/components/atoms/Input"
import Select from "@/components/atoms/Select"
import { cn } from "@/utils/cn"

const FormField = ({ 
  label, 
  type = "input", 
  error, 
  className,
  children,
  ...props 
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label htmlFor={props.id}>{label}</Label>}
      {type === "input" && <Input {...props} />}
      {type === "select" && <Select {...props}>{children}</Select>}
      {type === "textarea" && (
        <textarea
          className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
          {...props}
        />
      )}
      {error && (
        <p className="text-sm text-error font-medium">{error}</p>
      )}
    </div>
  )
}

export default FormField