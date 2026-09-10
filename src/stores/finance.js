import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { initialFinanceTransactions, initialPayables } from '../mock/finance'
import { createBusinessPersistence } from './persistence'

const clone = (value) => JSON.parse(JSON.stringify(value))
const today = () => new Date().toISOString().slice(0, 10)

function nextCode(prefix, list) {
  const sequence = list.reduce((max, item) => Math.max(max, Number(item.code?.split('-').at(-1)) || 0), 0) + 1
  return `${prefix}-${new Date().getFullYear()}-${String(sequence).padStart(4, '0')}`
}

export const useFinanceStore = defineStore('finance', () => {
  const transactions = ref(clone(initialFinanceTransactions))
  const payables = ref(clone(initialPayables))
  const persistence = createBusinessPersistence(
    'finance',
    () => ({ transactions: transactions.value, payables: payables.value }),
    (state) => {
      if (Array.isArray(state.transactions)) transactions.value = state.transactions
      if (Array.isArray(state.payables)) payables.value = state.payables
    },
  )

  watch([transactions, payables], persistence.persist, { deep: true })

  function addTransaction(payload) {
    const item = { id: Date.now(), code: nextCode('SZ', transactions.value), status: '已确认', ...payload }
    transactions.value.unshift(item)
    return item
  }

  function updateTransaction(id, payload) {
    const item = transactions.value.find((row) => row.id === id)
    if (item) Object.assign(item, payload)
  }

  function removeTransaction(id) {
    transactions.value = transactions.value.filter((item) => item.id !== id)
  }

  function addPayable(payload) {
    const item = { id: Date.now(), code: nextCode('YF', payables.value), settledAmount: 0, status: '未到期', ...payload }
    payables.value.unshift(item)
    return item
  }

  function updatePayable(id, payload) {
    const item = payables.value.find((row) => row.id === id)
    if (item) Object.assign(item, payload)
  }

  function removePayable(id) {
    payables.value = payables.value.filter((item) => item.id !== id)
  }

  function registerPayable(id, amount, paidDate = today()) {
    const item = payables.value.find((row) => row.id === id)
    if (!item) return
    const increment = Math.min(Number(amount), item.amount - item.settledAmount)
    item.settledAmount += increment
    item.status = item.settledAmount >= item.amount ? '已付款' : '部分付款'
    addTransaction({
      date: paidDate,
      direction: '支出',
      category: item.category,
      amount: increment,
      counterparty: item.counterparty,
      customerId: null,
      contractId: null,
      projectId: item.projectId,
      department: '项目交付中心',
      owner: item.owner,
      sourceType: 'payable-payment',
      payableId: item.id,
      remark: `应付单 ${item.code} 付款`,
    })
  }

  return {
    transactions,
    payables,
    hydrate: persistence.hydrate,
    addTransaction,
    updateTransaction,
    removeTransaction,
    addPayable,
    updatePayable,
    removePayable,
    registerPayable,
  }
})
