export async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response

  try {
    response = await fetch(url, init)
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error(
        '网络请求失败（Failed to fetch）：请确认 API 服务已在 localhost:3000 启动，并重启 npm run dev 使代理生效',
      )
    }

    throw err
  }

  if (!response.ok) {
    if (response.status === 502) {
      throw new Error(
        '502 Bad Gateway：API 服务未启动或无法连接。请在 api-enhanced 目录运行 npm start',
      )
    }

    throw new Error(`Request failed: ${response.status} ${response.statusText}`)
  }

  const text = await response.text()

  try {
    return JSON.parse(text) as T
  } catch {
    throw new Error('API 返回非 JSON，请检查接口地址或代理配置')
  }
}
