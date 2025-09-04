import { format, isToday, isYesterday, startOfMonth, endOfMonth, parseISO } from "date-fns"

export const formatDate = (date) => {
  const dateObj = typeof date === "string" ? parseISO(date) : date
  
  if (isToday(dateObj)) {
    return "Today"
  }
  
  if (isYesterday(dateObj)) {
    return "Yesterday"
  }
  
  return format(dateObj, "MMM d, yyyy")
}

export const formatDateShort = (date) => {
  const dateObj = typeof date === "string" ? parseISO(date) : date
  return format(dateObj, "MMM d")
}

export const formatDateInput = (date) => {
  const dateObj = typeof date === "string" ? parseISO(date) : date
  return format(dateObj, "yyyy-MM-dd")
}

export const getCurrentMonth = () => {
  const now = new Date()
  return {
    start: startOfMonth(now),
    end: endOfMonth(now),
    key: format(now, "yyyy-MM")
  }
}

export const getMonthKey = (date) => {
  const dateObj = typeof date === "string" ? parseISO(date) : date
  return format(dateObj, "yyyy-MM")
}