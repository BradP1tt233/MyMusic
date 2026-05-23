import { requestJson } from '@/api/http'
import { resolveRequestUrl, withTimestamp } from '@/api/url'
import type {
  QrCheckResponse,
  QrCheckResult,
  QrCreateResponse,
  QrCreateResult,
  QrKeyResponse,
} from '@/types/qrLogin'

function extractKey(payload: QrKeyResponse) {
  return payload.data?.unikey ?? payload.data?.key ?? payload.unikey ?? payload.key ?? ''
}

function extractQrCreate(payload: QrCreateResponse): QrCreateResult {
  return {
    qrurl: payload.data?.qrurl ?? payload.qrurl,
    qrimg: payload.data?.qrimg ?? payload.qrimg,
  }
}

function extractCookie(payload: QrCheckResponse) {
  return payload.data?.cookie ?? payload.cookie
}

function normalizeQrImage(qrimg?: string) {
  if (!qrimg) return undefined
  if (qrimg.startsWith('data:image')) return qrimg
  return `data:image/png;base64,${qrimg}`
}

export async function fetchQrKey(): Promise<string> {
  const url = withTimestamp(resolveRequestUrl('/login/qr/key'))
  const payload = await requestJson<QrKeyResponse>(url)
  const key = extractKey(payload)

  if (!key) {
    throw new Error('未能获取二维码 key')
  }

  return key
}

export async function createQrCode(key: string): Promise<QrCreateResult> {
  const path = `/login/qr/create?key=${encodeURIComponent(key)}&qrimg=true`
  const url = withTimestamp(resolveRequestUrl(path))
  const payload = await requestJson<QrCreateResponse>(url)
  const result = extractQrCreate(payload)

  return {
    ...result,
    qrimg: normalizeQrImage(result.qrimg),
  }
}

export async function checkQrStatus(key: string, noCookie = false): Promise<QrCheckResult> {
  let path = `/login/qr/check?key=${encodeURIComponent(key)}`
  if (noCookie) {
    path += '&noCookie=true'
  }

  const url = withTimestamp(resolveRequestUrl(path))
  const payload = await requestJson<QrCheckResponse>(url)
  const code = payload.code ?? 0

  return {
    code,
    cookie: extractCookie(payload),
  }
}
