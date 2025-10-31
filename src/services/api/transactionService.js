import { getApperClient } from "@/services/apperClient"
import { toast } from "react-toastify"

class TransactionService {
  async getAll() {
    try {
      const apperClient = getApperClient()
      if (!apperClient) {
        throw new Error("ApperClient not initialized")
      }

      const response = await apperClient.fetchRecords("transaction_c", {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "type_c" } },
          { field: { Name: "amount_c" } },
          { field: { Name: "category_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "description_c" } }
        ]
      })

      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }

      return response.data || []
    } catch (error) {
      console.error("Failed to fetch transactions:", error?.response?.data?.message || error)
      throw error
    }
  }

  async getById(id) {
    try {
      const apperClient = getApperClient()
      if (!apperClient) {
        throw new Error("ApperClient not initialized")
      }

      const response = await apperClient.getRecordById("transaction_c", id, {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "type_c" } },
          { field: { Name: "amount_c" } },
          { field: { Name: "category_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "description_c" } }
        ]
      })

      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }

      return response.data
    } catch (error) {
      console.error(`Failed to fetch transaction ${id}:`, error?.response?.data?.message || error)
      throw error
    }
  }

  async create(transactionData) {
    try {
      const apperClient = getApperClient()
      if (!apperClient) {
        throw new Error("ApperClient not initialized")
      }

      const payload = {
        records: [
          {
            Name: transactionData.category_c || transactionData.category,
            type_c: transactionData.type_c || transactionData.type,
            amount_c: transactionData.amount_c || transactionData.amount,
            category_c: transactionData.category_c || transactionData.category,
            date_c: transactionData.date_c || transactionData.date,
            description_c: transactionData.description_c || transactionData.description
          }
        ]
      }

      const response = await apperClient.createRecord("transaction_c", payload)

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        throw new Error(response.message)
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} transactions:`, failed)
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`))
            if (record.message) toast.error(record.message)
          })
        }

        return successful.length > 0 ? successful[0].data : null
      }

      return null
    } catch (error) {
      console.error("Failed to create transaction:", error?.response?.data?.message || error)
      throw error
    }
  }

  async update(id, transactionData) {
    try {
      const apperClient = getApperClient()
      if (!apperClient) {
        throw new Error("ApperClient not initialized")
      }

      const payload = {
        records: [
          {
            Id: id,
            Name: transactionData.category_c || transactionData.category,
            type_c: transactionData.type_c || transactionData.type,
            amount_c: transactionData.amount_c || transactionData.amount,
            category_c: transactionData.category_c || transactionData.category,
            date_c: transactionData.date_c || transactionData.date,
            description_c: transactionData.description_c || transactionData.description
          }
        ]
      }

      const response = await apperClient.updateRecord("transaction_c", payload)

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        throw new Error(response.message)
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} transactions:`, failed)
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`))
            if (record.message) toast.error(record.message)
          })
        }

        return successful.length > 0 ? successful[0].data : null
      }

      return null
    } catch (error) {
      console.error("Failed to update transaction:", error?.response?.data?.message || error)
      throw error
    }
  }

  async delete(id) {
    try {
      const apperClient = getApperClient()
      if (!apperClient) {
        throw new Error("ApperClient not initialized")
      }

      const response = await apperClient.deleteRecord("transaction_c", {
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
          console.error(`Failed to delete ${failed.length} transactions:`, failed)
          failed.forEach(record => {
            if (record.message) toast.error(record.message)
          })
          return false
        }

        return true
      }

      return true
    } catch (error) {
      console.error("Failed to delete transaction:", error?.response?.data?.message || error)
      throw error
    }
  }
}

export const transactionService = new TransactionService()