import { API_BASE_URL } from '@/api'

export function resolveRequestUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path
  }

  const base = API_BASE_URL.replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalizedPath}`
}

/** 所有 QR 登录请求必须带时间戳，防止缓存 */
export function withTimestamp(url: string) {
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}timestamp=${Date.now()}`
}

export function appendQuery(url: string, key: string, value: string) {
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}${key}=${encodeURIComponent(value)}`
}

export function withCookie(url: string, cookie?: string) {
  if (!cookie) return url
  return appendQuery(url, 'cookie', cookie)
}
