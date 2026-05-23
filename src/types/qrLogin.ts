export type QrLoginStatusCode = 800 | 801 | 802 | 803 | 502

export type QrKeyResponse = {
  code?: number
  data?: {
    unikey?: string
    key?: string
  }
  unikey?: string
  key?: string
}

export type QrCreateResponse = {
  code?: number
  data?: {
    qrurl?: string
    qrimg?: string
  }
  qrurl?: string
  qrimg?: string
}

export type QrCheckResponse = {
  code?: QrLoginStatusCode | number
  data?: {
    cookie?: string
    [key: string]: unknown
  }
  cookie?: string
}

export type QrCreateResult = {
  qrimg?: string
  qrurl?: string
}

export type QrCheckResult = {
  code: number
  cookie?: string
}
