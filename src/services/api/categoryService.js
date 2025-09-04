import categoryData from "@/services/mockData/categories.json"

class CategoryService {
  constructor() {
    this.categories = [...categoryData]
  }

  async delay() {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200))
  }

  async getAll() {
    await this.delay()
    return [...this.categories]
  }

  async getById(id) {
    await this.delay()
    const category = this.categories.find(c => c.Id === parseInt(id))
    if (!category) {
      throw new Error(`Category with Id ${id} not found`)
    }
    return { ...category }
  }

  async getByType(type) {
    await this.delay()
    return this.categories.filter(c => c.type === type)
  }
}

export const categoryService = new CategoryService()