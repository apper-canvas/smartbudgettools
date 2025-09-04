import transactionData from "@/services/mockData/transactions.json"

class TransactionService {
  constructor() {
    this.transactions = [...transactionData]
  }

  async delay() {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200))
  }

  async getAll() {
    await this.delay()
    return [...this.transactions]
  }

  async getById(id) {
    await this.delay()
    const transaction = this.transactions.find(t => t.Id === parseInt(id))
    if (!transaction) {
      throw new Error(`Transaction with Id ${id} not found`)
    }
    return { ...transaction }
  }

  async create(transactionData) {
    await this.delay()
    const maxId = Math.max(...this.transactions.map(t => t.Id), 0)
    const newTransaction = {
      Id: maxId + 1,
      ...transactionData
    }
    this.transactions.push(newTransaction)
    return { ...newTransaction }
  }

  async update(id, transactionData) {
    await this.delay()
    const index = this.transactions.findIndex(t => t.Id === parseInt(id))
    if (index === -1) {
      throw new Error(`Transaction with Id ${id} not found`)
    }
    this.transactions[index] = { ...this.transactions[index], ...transactionData }
    return { ...this.transactions[index] }
  }

  async delete(id) {
    await this.delay()
    const index = this.transactions.findIndex(t => t.Id === parseInt(id))
    if (index === -1) {
      throw new Error(`Transaction with Id ${id} not found`)
    }
    this.transactions.splice(index, 1)
    return true
  }
}

export const transactionService = new TransactionService()