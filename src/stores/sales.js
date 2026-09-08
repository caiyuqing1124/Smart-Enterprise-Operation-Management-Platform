import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { initialContacts, initialContracts, initialCustomers, initialFollowUps, initialOpportunities, initialPaymentPlans } from '../mock/sales'

const clone = (value) => JSON.parse(JSON.stringify(value))
export const useSalesStore = defineStore('sales', () => {
  const customers = ref(clone(initialCustomers)), contacts = ref(clone(initialContacts)), followUps = ref(clone(initialFollowUps))
  const opportunities = ref(clone(initialOpportunities)), contracts = ref(clone(initialContracts)), paymentPlans = ref(clone(initialPaymentPlans))
  const customerMap = computed(() => Object.fromEntries(customers.value.map((item) => [item.id, item])))
  const nextCode = (prefix, list) => `${prefix}-${new Date().getFullYear()}-${String(list.length + 1).padStart(3, '0')}`

  function addCustomer(payload) { const item = { id: Date.now(), code: nextCode('KH', customers.value), contractAmount: 0, paidAmount: 0, lastFollowUp: '', credit: '待评估', createdAt: new Date().toISOString().slice(0, 10), tags: [], ...payload }; customers.value.unshift(item); return item }
  function updateCustomer(id, payload) { const item = customers.value.find((row) => row.id === id); if (item) Object.assign(item, payload) }
  function removeCustomer(id) { const contractIds = contracts.value.filter((item) => item.customerId === id).map((item) => item.id); customers.value = customers.value.filter((item) => item.id !== id); contacts.value = contacts.value.filter((item) => item.customerId !== id); followUps.value = followUps.value.filter((item) => item.customerId !== id); opportunities.value = opportunities.value.filter((item) => item.customerId !== id); contracts.value = contracts.value.filter((item) => item.customerId !== id); paymentPlans.value = paymentPlans.value.filter((item) => !contractIds.includes(item.contractId)) }
  function addContact(payload) { contacts.value.push({ id: Date.now(), primary: false, ...payload }) }
  function updateContact(id, payload) { const item = contacts.value.find((row) => row.id === id); if (item) Object.assign(item, payload) }
  function removeContact(id) { contacts.value = contacts.value.filter((item) => item.id !== id) }
  function addFollowUp(payload) { followUps.value.unshift({ id: Date.now(), date: new Date().toISOString().slice(0, 16).replace('T', ' '), ...payload }); const customer = customers.value.find((item) => item.id === payload.customerId); if (customer) customer.lastFollowUp = new Date().toISOString().slice(0, 10) }
  function addOpportunity(payload) { const item = { id: Date.now(), code: nextCode('SJ', opportunities.value), updatedAt: new Date().toISOString().slice(0, 10), ...payload }; opportunities.value.unshift(item); return item }
  function updateOpportunity(id, payload) { const item = opportunities.value.find((row) => row.id === id); if (item) Object.assign(item, payload, { updatedAt: new Date().toISOString().slice(0, 10) }) }
  function removeOpportunity(id) { opportunities.value = opportunities.value.filter((item) => item.id !== id) }
  function changeOpportunityStage(id, stage) { const payload = { stage }; if (stage === '赢单') payload.probability = 100; if (stage === '输单') payload.probability = 0; updateOpportunity(id, payload) }
  function addContract(payload) { const item = { id: Date.now(), code: nextCode('HT', contracts.value), invoiced: 0, paid: 0, ...payload }; contracts.value.unshift(item); const customer = customers.value.find((row) => row.id === payload.customerId); if (customer) customer.contractAmount += Number(payload.amount); return item }
  function updateContract(id, payload) { const item = contracts.value.find((row) => row.id === id); if (!item) return; const oldCustomer = customers.value.find((row) => row.id === item.customerId); const newCustomer = customers.value.find((row) => row.id === payload.customerId); if (oldCustomer) { oldCustomer.contractAmount -= item.amount; oldCustomer.paidAmount -= item.paid } Object.assign(item, payload); if (newCustomer) { newCustomer.contractAmount += item.amount; newCustomer.paidAmount += item.paid } }
  function removeContract(id) { const contract = contracts.value.find((item) => item.id === id); if (contract) { const customer = customers.value.find((item) => item.id === contract.customerId); if (customer) { customer.contractAmount -= contract.amount; customer.paidAmount -= contract.paid } } contracts.value = contracts.value.filter((item) => item.id !== id); paymentPlans.value = paymentPlans.value.filter((item) => item.contractId !== id) }
  function addPaymentPlan(payload) { paymentPlans.value.push({ id: Date.now(), paidAmount: 0, paidDate: '', status: '未到期', ...payload }) }
  function registerPayment(planId, amount, paidDate) { const plan = paymentPlans.value.find((item) => item.id === planId); if (!plan) return; const increment = Math.min(Number(amount), plan.amount - plan.paidAmount); plan.paidAmount += increment; plan.paidDate = paidDate; plan.status = plan.paidAmount >= plan.amount ? '已回款' : '部分回款'; const contract = contracts.value.find((item) => item.id === plan.contractId); if (contract) { contract.paid += increment; const customer = customers.value.find((item) => item.id === contract.customerId); if (customer) customer.paidAmount += increment } }
  return { customers, contacts, followUps, opportunities, contracts, paymentPlans, customerMap, addCustomer, updateCustomer, removeCustomer, addContact, updateContact, removeContact, addFollowUp, addOpportunity, updateOpportunity, removeOpportunity, changeOpportunityStage, addContract, updateContract, removeContract, addPaymentPlan, registerPayment }
})
