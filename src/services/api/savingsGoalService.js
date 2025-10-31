import { getApperClient } from "@/services/apperClient"
import { toast } from "react-toastify"

class SavingsGoalService {
  async getAll() {
    try {
      const apperClient = getApperClient()
      if (!apperClient) {
        throw new Error("ApperClient not initialized")
      }

      const response = await apperClient.fetchRecords("savings_goal_c", {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "name_c" } },
          { field: { Name: "target_amount_c" } },
          { field: { Name: "current_amount_c" } },
          { field: { Name: "deadline_c" } }
        ]
      })

      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }

      return response.data || []
    } catch (error) {
      console.error("Failed to fetch savings goals:", error?.response?.data?.message || error)
      throw error
    }
  }

  async getById(id) {
    try {
      const apperClient = getApperClient()
      if (!apperClient) {
        throw new Error("ApperClient not initialized")
      }

      const response = await apperClient.getRecordById("savings_goal_c", id, {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "name_c" } },
          { field: { Name: "target_amount_c" } },
          { field: { Name: "current_amount_c" } },
          { field: { Name: "deadline_c" } }
        ]
      })

      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }

      return response.data
    } catch (error) {
      console.error(`Failed to fetch savings goal ${id}:`, error?.response?.data?.message || error)
      throw error
    }
  }

  async create(goalData) {
    try {
      const apperClient = getApperClient()
      if (!apperClient) {
        throw new Error("ApperClient not initialized")
      }

      const payload = {
        records: [
          {
            Name: goalData.name_c || goalData.name,
            name_c: goalData.name_c || goalData.name,
            target_amount_c: goalData.target_amount_c || goalData.targetAmount,
            current_amount_c: goalData.current_amount_c || goalData.currentAmount,
            deadline_c: goalData.deadline_c || goalData.deadline
          }
        ]
      }

      const response = await apperClient.createRecord("savings_goal_c", payload)

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        throw new Error(response.message)
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} savings goals:`, failed)
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`))
            if (record.message) toast.error(record.message)
          })
        }

        return successful.length > 0 ? successful[0].data : null
      }

      return null
    } catch (error) {
      console.error("Failed to create savings goal:", error?.response?.data?.message || error)
      throw error
    }
  }

  async update(id, goalData) {
    try {
      const apperClient = getApperClient()
      if (!apperClient) {
        throw new Error("ApperClient not initialized")
      }

      const payload = {
        records: [
          {
            Id: id,
            Name: goalData.name_c || goalData.name,
            name_c: goalData.name_c || goalData.name,
            target_amount_c: goalData.target_amount_c || goalData.targetAmount,
            current_amount_c: goalData.current_amount_c || goalData.currentAmount,
            deadline_c: goalData.deadline_c || goalData.deadline
          }
        ]
      }

      const response = await apperClient.updateRecord("savings_goal_c", payload)

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        throw new Error(response.message)
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} savings goals:`, failed)
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`))
            if (record.message) toast.error(record.message)
          })
        }

        return successful.length > 0 ? successful[0].data : null
      }

      return null
    } catch (error) {
      console.error("Failed to update savings goal:", error?.response?.data?.message || error)
      throw error
    }
  }

  async delete(id) {
    try {
      const apperClient = getApperClient()
      if (!apperClient) {
        throw new Error("ApperClient not initialized")
      }

      const response = await apperClient.deleteRecord("savings_goal_c", {
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
          console.error(`Failed to delete ${failed.length} savings goals:`, failed)
          failed.forEach(record => {
            if (record.message) toast.error(record.message)
          })
          return false
        }

        return true
      }

      return true
    } catch (error) {
      console.error("Failed to delete savings goal:", error?.response?.data?.message || error)
      throw error
    }
  }
}

export const savingsGoalService = new SavingsGoalService()