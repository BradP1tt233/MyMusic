import { requestJson } from '@/api/http'
import { resolveRequestUrl, withCookie, withTimestamp } from '@/api/url'
import type { LoginStatusResponse } from '@/types/loginStatus'

function extractUserId(payload: LoginStatusResponse) {
  return payload.data?.profile?.userId ?? payload.profile?.userId ?? null
}

export async function fetchLoginUserId(cookie?: string): Promise<number | null> {
  if (!cookie) return null

  const url = withCookie(withTimestamp(resolveRequestUrl('/login/status')), cookie)

  try {
    const payload = await requestJson<LoginStatusResponse>(url)
    const userId = extractUserId(payload)
    return userId != null ? Number(userId) : null
  } catch {
    return null
  }
}
