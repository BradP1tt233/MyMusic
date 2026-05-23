export type LoginStatusProfile = {
  userId?: number
  nickname?: string
  avatarUrl?: string
}

export type LoginStatusResponse = {
  data?: {
    code?: number
    account?: unknown
    profile?: LoginStatusProfile | null
  }
  profile?: LoginStatusProfile | null
}
