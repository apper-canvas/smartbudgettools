import { getApperClient } from "@/services/apperClient"

class CategoryService {
  async getAll() {
    try {
      const apperClient = getApperClient()
      if (!apperClient) {
        throw new Error("ApperClient not initialized")
      }

      const response = await apperClient.fetchRecords("category_c", {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "name_c" } },
          { field: { Name: "type_c" } },
          { field: { Name: "icon_c" } },
          { field: { Name: "color_c" } }
        ]
      })

      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }

      return response.data || []
    } catch (error) {
      console.error("Failed to fetch categories:", error?.response?.data?.message || error)
      throw error
    }
  }

  async getById(id) {
    try {
      const apperClient = getApperClient()
      if (!apperClient) {
        throw new Error("ApperClient not initialized")
      }

      const response = await apperClient.getRecordById("category_c", id, {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "name_c" } },
          { field: { Name: "type_c" } },
          { field: { Name: "icon_c" } },
          { field: { Name: "color_c" } }
        ]
      })

      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }

      return response.data
    } catch (error) {
      console.error(`Failed to fetch category ${id}:`, error?.response?.data?.message || error)
      throw error
    }
  }

  async getByType(type) {
    try {
      const apperClient = getApperClient()
      if (!apperClient) {
        throw new Error("ApperClient not initialized")
      }

      const response = await apperClient.fetchRecords("category_c", {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "name_c" } },
          { field: { Name: "type_c" } },
          { field: { Name: "icon_c" } },
          { field: { Name: "color_c" } }
        ],
        where: [
          {
            FieldName: "type_c",
            Operator: "EqualTo",
            Values: [type]
          }
        ]
      })

      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }

      return response.data || []
    } catch (error) {
      console.error("Failed to fetch categories by type:", error?.response?.data?.message || error)
      throw error
    }
  }
}

export const categoryService = new CategoryService()