import savingsGoalData from "@/services/mockData/savingsGoals.json"

class SavingsGoalService {
  constructor() {
    this.goals = [...savingsGoalData]
  }

  async delay() {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200))
  }

  async getAll() {
    await this.delay()
    return [...this.goals]
  }

  async getById(id) {
    await this.delay()
    const goal = this.goals.find(g => g.Id === parseInt(id))
    if (!goal) {
      throw new Error(`Savings goal with Id ${id} not found`)
    }
    return { ...goal }
  }

  async create(goalData) {
    await this.delay()
    const maxId = Math.max(...this.goals.map(g => g.Id), 0)
    const newGoal = {
      Id: maxId + 1,
      ...goalData
    }
    this.goals.push(newGoal)
    return { ...newGoal }
  }

  async update(id, goalData) {
    await this.delay()
    const index = this.goals.findIndex(g => g.Id === parseInt(id))
    if (index === -1) {
      throw new Error(`Savings goal with Id ${id} not found`)
    }
    this.goals[index] = { ...this.goals[index], ...goalData }
    return { ...this.goals[index] }
  }

  async delete(id) {
    await this.delay()
    const index = this.goals.findIndex(g => g.Id === parseInt(id))
    if (index === -1) {
      throw new Error(`Savings goal with Id ${id} not found`)
    }
    this.goals.splice(index, 1)
    return true
  }
}

export const savingsGoalService = new SavingsGoalService()