import { createPinia } from 'pinia'

export const pinia = createPinia()

export { usePlayerStore } from './player'
export { useAuthStore } from './auth'
