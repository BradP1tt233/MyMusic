import { onUnmounted, ref } from 'vue'
import { checkQrStatus, createQrCode, fetchQrKey } from '@/api/qrLogin'
import { useLibraryPlaylists } from '@/composables/useLibraryPlaylists'
import { useAuthStore } from '@/stores/auth'

export type QrLoginPhase = 'idle' | 'loading' | 'waiting' | 'confirming' | 'expired' | 'success' | 'error'

const POLL_INTERVAL_MS = 2000

export function useQrLogin() {
  const authStore = useAuthStore()
  const { syncFromRemoteUserPlaylists } = useLibraryPlaylists()

  const phase = ref<QrLoginPhase>('idle')
  const qrImage = ref('')
  const statusMessage = ref('')
  const errorMessage = ref('')

  let pollTimer: ReturnType<typeof setInterval> | null = null
  let activeKey = ''
  let disposed = false

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  function reset() {
    stopPolling()
    activeKey = ''
    phase.value = 'idle'
    qrImage.value = ''
    statusMessage.value = ''
    errorMessage.value = ''
  }

  async function pollOnce() {
    if (!activeKey || disposed) return

    try {
      let result = await checkQrStatus(activeKey)

      if (result.code === 502) {
        result = await checkQrStatus(activeKey, true)
      }

      if (result.code === 801) {
        phase.value = 'waiting'
        statusMessage.value = '请使用 App 扫描二维码'
        return
      }

      if (result.code === 802) {
        phase.value = 'confirming'
        statusMessage.value = '扫码成功，请在手机上确认登录'
        return
      }

      if (result.code === 800) {
        stopPolling()
        phase.value = 'expired'
        statusMessage.value = '二维码已过期，请刷新'
        return
      }

      if (result.code === 803) {
        stopPolling()

        if (!result.cookie) {
          phase.value = 'error'
          errorMessage.value = '登录成功但未返回 cookie'
          return
        }

        authStore.setCookie(result.cookie)
        const userId = await authStore.refreshUserProfile()
        if (userId != null) {
          await syncFromRemoteUserPlaylists(result.cookie, userId)
        }
        phase.value = 'success'
        statusMessage.value = '登录成功'
        return
      }

      phase.value = 'waiting'
      statusMessage.value = '等待扫码…'
    } catch (err: unknown) {
      stopPolling()
      phase.value = 'error'
      errorMessage.value = err instanceof Error ? err.message : '检测扫码状态失败'
    }
  }

  function startPolling() {
    stopPolling()
    void pollOnce()
    pollTimer = setInterval(() => {
      void pollOnce()
    }, POLL_INTERVAL_MS)
  }

  async function startLogin() {
    reset()
    disposed = false
    phase.value = 'loading'
    statusMessage.value = '正在生成二维码…'

    try {
      activeKey = await fetchQrKey()
      const qr = await createQrCode(activeKey)

      if (!qr.qrimg && !qr.qrurl) {
        throw new Error('未能生成二维码')
      }

      qrImage.value = qr.qrimg ?? ''
      phase.value = 'waiting'
      statusMessage.value = '请使用 App 扫描二维码'
      startPolling()
    } catch (err: unknown) {
      phase.value = 'error'
      errorMessage.value = err instanceof Error ? err.message : '生成二维码失败'
    }
  }

  onUnmounted(() => {
    disposed = true
    stopPolling()
  })

  return {
    phase,
    qrImage,
    statusMessage,
    errorMessage,
    startLogin,
    refreshLogin: startLogin,
    reset,
    stopPolling,
  }
}
