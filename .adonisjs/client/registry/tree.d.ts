/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  auth: {
    signup: {
      store: typeof routes['auth.signup.store']
    }
    login: {
      store: typeof routes['auth.login.store']
      destroy: typeof routes['auth.login.destroy']
    }
  }
  clients: {
    index: typeof routes['clients.index']
    show: typeof routes['clients.show']
    store: typeof routes['clients.store']
    update: typeof routes['clients.update']
    destroy: typeof routes['clients.destroy']
  }
  products: {
    index: typeof routes['products.index']
    show: typeof routes['products.show']
    store: typeof routes['products.store']
    update: typeof routes['products.update']
    destroy: typeof routes['products.destroy']
  }
  transactions: {
    store: typeof routes['transactions.store']
    index: typeof routes['transactions.index']
    show: typeof routes['transactions.show']
    refund: typeof routes['transactions.refund']
    destroy: typeof routes['transactions.destroy']
  }
  gateways: {
    toggleStatus: typeof routes['gateways.toggle_status']
    updatePriority: typeof routes['gateways.update_priority']
  }
}
