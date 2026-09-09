const DATABASE_NAME = 'smart-ops-business-data'
const DATABASE_VERSION = 1
const STORE_NAME = 'business-state'
const SCHEMA_KEY = '__schema_version__'
export const BUSINESS_SCHEMA_VERSION = 1

let databasePromise
let schemaReadyPromise

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

export function getBusinessScope() {
  try {
    const session = JSON.parse(
      localStorage.getItem('smart-ops-session')
      || sessionStorage.getItem('smart-ops-session')
      || 'null',
    )
    return session?.companyName ? `company:${session.companyName}` : 'company:default'
  } catch {
    return 'company:default'
  }
}

function scopedKey(key, scope = getBusinessScope()) {
  return `${scope}:${key}`
}

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function transactionDone(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onabort = () => reject(transaction.error)
    transaction.onerror = () => reject(transaction.error)
  })
}

function openDatabase() {
  if (!('indexedDB' in window)) return Promise.resolve(null)
  if (databasePromise) return databasePromise

  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

  return databasePromise
}

async function ensureSchemaVersion() {
  if (schemaReadyPromise) return schemaReadyPromise

  schemaReadyPromise = (async () => {
    const database = await openDatabase()
    if (!database) return null

    const readTransaction = database.transaction(STORE_NAME, 'readonly')
    const readDone = transactionDone(readTransaction)
    const currentVersion = await requestResult(readTransaction.objectStore(STORE_NAME).get(SCHEMA_KEY))
    await readDone

    if (currentVersion !== BUSINESS_SCHEMA_VERSION) {
      const writeTransaction = database.transaction(STORE_NAME, 'readwrite')
      const store = writeTransaction.objectStore(STORE_NAME)
      store.clear()
      store.put(BUSINESS_SCHEMA_VERSION, SCHEMA_KEY)
      await transactionDone(writeTransaction)
    }

    return database
  })().catch((error) => {
    schemaReadyPromise = null
    throw error
  })

  return schemaReadyPromise
}

export async function loadBusinessState(key, scope = getBusinessScope()) {
  const database = await ensureSchemaVersion()
  if (!database) return null

  const transaction = database.transaction(STORE_NAME, 'readonly')
  const done = transactionDone(transaction)
  const value = await requestResult(transaction.objectStore(STORE_NAME).get(scopedKey(key, scope)))
  await done
  return value ? clone(value) : null
}

export async function saveBusinessState(key, value, scope = getBusinessScope()) {
  const database = await ensureSchemaVersion()
  if (!database) return

  const transaction = database.transaction(STORE_NAME, 'readwrite')
  transaction.objectStore(STORE_NAME).put(clone(value), scopedKey(key, scope))
  await transactionDone(transaction)
}

export async function resetBusinessData() {
  const database = await ensureSchemaVersion()
  if (!database) return

  const transaction = database.transaction(STORE_NAME, 'readwrite')
  const store = transaction.objectStore(STORE_NAME)
  const prefix = `${getBusinessScope()}:`
  const cursorRequest = store.openCursor()
  cursorRequest.onsuccess = () => {
    const cursor = cursorRequest.result
    if (!cursor) return
    if (String(cursor.key).startsWith(prefix)) cursor.delete()
    cursor.continue()
  }
  await transactionDone(transaction)
}

export function createBusinessPersistence(key, getState, applyState) {
  let hydrated = false
  let hydrationPromise
  let hydrationScope
  let pendingSave = Promise.resolve()
  const initialState = clone(getState())

  async function hydrate() {
    const scope = getBusinessScope()
    if (hydrated && hydrationScope === scope) return
    if (hydrationPromise && hydrationScope === scope) return hydrationPromise

    hydrationScope = scope
    hydrated = false

    hydrationPromise = (async () => {
      try {
        const savedState = await loadBusinessState(key, scope)
        applyState(savedState || clone(initialState))
      } catch (error) {
        console.error(`读取 ${key} 本地业务数据失败`, error)
      } finally {
        hydrated = true
      }
    })()

    return hydrationPromise
  }

  function persist() {
    if (!hydrated) return
    const scope = hydrationScope
    const state = clone(getState())
    pendingSave = pendingSave
      .catch(() => undefined)
      .then(() => saveBusinessState(key, state, scope))
      .catch((error) => console.error(`保存 ${key} 本地业务数据失败`, error))
  }

  return { hydrate, persist }
}
