import { getApperClient } from "@/services/apperClient"
import { toast } from "react-toastify"

class BudgetService {
  async getAll() {
    try {
      const apperClient = getApperClient()
      if (!apperClient) {
        throw new Error("ApperClient not initialized")
      }

      const response = await apperClient.fetchRecords("budget_c", {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "category_c" } },
          { field: { Name: "monthly_limit_c" } },
          { field: { Name: "spent_c" } },
          { field: { Name: "month_c" } },
          { field: { Name: "alert_threshold_c" } },
          { field: { Name: "alert_methods_c" } }
        ]
      })

      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }

      return response.data || []
    } catch (error) {
      console.error("Failed to fetch budgets:", error?.response?.data?.message || error)
      throw error
    }
  }

  async getById(id) {
    try {
      const apperClient = getApperClient()
      if (!apperClient) {
        throw new Error("ApperClient not initialized")
      }

      const response = await apperClient.getRecordById("budget_c", id, {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "category_c" } },
          { field: { Name: "monthly_limit_c" } },
          { field: { Name: "spent_c" } },
          { field: { Name: "month_c" } },
          { field: { Name: "alert_threshold_c" } },
          { field: { Name: "alert_methods_c" } }
        ]
      })

      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }

      return response.data
    } catch (error) {
      console.error(`Failed to fetch budget ${id}:`, error?.response?.data?.message || error)
      throw error
    }
  }

  async create(budgetData) {
    try {
      const apperClient = getApperClient()
      if (!apperClient) {
        throw new Error("ApperClient not initialized")
      }

      const payload = {
        records: [
          {
            Name: budgetData.category_c || budgetData.category,
            category_c: budgetData.category_c || budgetData.category,
            monthly_limit_c: budgetData.monthly_limit_c || budgetData.monthlyLimit,
            spent_c: budgetData.spent_c || budgetData.spent || 0,
            month_c: budgetData.month_c || budgetData.month,
            alert_threshold_c: budgetData.alert_threshold_c || budgetData.alertThreshold || 80,
            alert_methods_c: budgetData.alert_methods_c || budgetData.alertMethods?.join(",") || "email,push"
          }
        ]
      }

      const response = await apperClient.createRecord("budget_c", payload)

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        throw new Error(response.message)
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} budgets:`, failed)
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`))
            if (record.message) toast.error(record.message)
          })
        }

        return successful.length > 0 ? successful[0].data : null
      }

      return null
    } catch (error) {
      console.error("Failed to create budget:", error?.response?.data?.message || error)
      throw error
    }
  }

  async update(id, budgetData) {
    try {
      const apperClient = getApperClient()
      if (!apperClient) {
        throw new Error("ApperClient not initialized")
      }

      const payload = {
        records: [
          {
            Id: id,
            Name: budgetData.category_c || budgetData.category,
            category_c: budgetData.category_c || budgetData.category,
            monthly_limit_c: budgetData.monthly_limit_c || budgetData.monthlyLimit,
            spent_c: budgetData.spent_c || budgetData.spent,
            month_c: budgetData.month_c || budgetData.month,
            alert_threshold_c: budgetData.alert_threshold_c || budgetData.alertThreshold,
            alert_methods_c: budgetData.alert_methods_c || (Array.isArray(budgetData.alertMethods) ? budgetData.alertMethods.join(",") : budgetData.alertMethods)
          }
        ]
      }

      const response = await apperClient.updateRecord("budget_c", payload)

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        throw new Error(response.message)
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} budgets:`, failed)
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`))
            if (record.message) toast.error(record.message)
          })
        }

        return successful.length > 0 ? successful[0].data : null
      }

      return null
    } catch (error) {
      console.error("Failed to update budget:", error?.response?.data?.message || error)
      throw error
    }
  }

  async delete(id) {
    try {
      const apperClient = getApperClient()
      if (!apperClient) {
        throw new Error("ApperClient not initialized")
      }

      const response = await apperClient.deleteRecord("budget_c", {
        RecordIds: [id]
      })

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        throw new Error(response.message)
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success)

        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} budgets:`, failed)
          failed.forEach(record => {
            if (record.message) toast.error(record.message)
          })
          return false
        }

        return true
      }

      return true
    } catch (error) {
      console.error("Failed to delete budget:", error?.response?.data?.message || error)
      throw error
    }
  }
}

export const budgetService = new BudgetService()