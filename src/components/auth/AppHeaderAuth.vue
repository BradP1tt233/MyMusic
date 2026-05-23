<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useQrLogin } from '@/composables/useQrLogin'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const showModal = ref(false)
const showMenu = ref(false)

const {
  phase,
  qrImage,
  statusMessage,
  errorMessage,
  startLogin,
  refreshLogin,
  reset,
  stopPolling,
} = useQrLogin()

const isLoading = computed(() => phase.value === 'loading')
const canRefresh = computed(() => phase.value === 'expired' || phase.value === 'error')

function openLoginModal() {
  showModal.value = true
  void startLogin()
}

function closeLoginModal() {
  showModal.value = false
  stopPolling()
  reset()
}

function handleLoginSuccess() {
  window.setTimeout(() => {
    closeLoginModal()
  }, 800)
}

watch(phase, (next) => {
  if (next === 'success') {
    handleLoginSuccess()
  }
})

function toggleMenu() {
  showMenu.value = !showMenu.value
}

function handleLogout() {
  authStore.logout()
  showMenu.value = false
}

function handleDocumentClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  if (!target?.closest('[data-auth-menu-root]')) {
    showMenu.value = false
  }
}

watch(showMenu, (open) => {
  if (open) {
    document.addEventListener('click', handleDocumentClick)
    return
  }

  document.removeEventListener('click', handleDocumentClick)
})
</script>

<template>
  <div class="header-auth flex items-center gap-4">
    <template v-if="authStore.isLoggedIn">
      <div class="relative" data-auth-menu-root>
        <button
          type="button"
          data-testid="header-profile-button"
          aria-label="账号菜单"
          aria-haspopup="menu"
          :aria-expanded="showMenu ? 'true' : 'false'"
          class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#535353] text-sm font-bold text-white transition-transform duration-150 hover:scale-[1.04] focus-visible:outline-none"
          @click="toggleMenu"
        >
          <span aria-hidden="true">我</span>
        </button>

        <div
          v-if="showMenu"
          role="menu"
          class="absolute top-[calc(100%+8px)] right-0 z-50 min-w-[160px] rounded-md border border-white/10 bg-[#282828] py-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            class="block w-full cursor-pointer border-0 bg-transparent px-4 py-2 text-left text-sm text-white hover:bg-white/10"
            @click="handleLogout"
          >
            退出登录
          </button>
        </div>
      </div>
    </template>

    <template v-else>
      <button
        type="button"
        data-testid="header-login-button"
        data-encore-id="buttonPrimary"
        class="header-login-btn cursor-pointer rounded-full border-0 bg-white px-6 py-2 text-sm font-bold text-black transition-transform duration-150 hover:scale-[1.04] active:scale-[0.98] focus-visible:outline-none"
        @click="openLoginModal"
      >
        登录
      </button>
    </template>

    <Teleport to="body">
      <div
        v-if="showModal"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
        @click.self="closeLoginModal"
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="qr-login-title"
          class="qr-login-dialog w-full max-w-[420px] rounded-lg bg-[#282828] p-8 shadow-2xl"
        >
          <div class="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 id="qr-login-title" class="text-2xl font-bold text-white">
                扫码登录
              </h2>
              <p class="mt-2 text-sm text-[#b3b3b3]">
                使用手机 App 扫描下方二维码
              </p>
            </div>

            <button
              type="button"
              aria-label="关闭"
              class="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-[#b3b3b3] transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none"
              @click="closeLoginModal"
            >
              <svg aria-hidden="true" class="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M3.293 3.293a1 1 0 0 1 1.414 0L12 10.586l7.293-7.293a1 1 0 1 1 1.414 1.414L13.414 12l7.293 7.293a1 1 0 0 1-1.414 1.414L12 13.414l-7.293 7.293a1 1 0 0 1-1.414-1.414L10.586 12 3.293 4.707a1 1 0 0 1 0-1.414"
                />
              </svg>
            </button>
          </div>

          <div class="flex flex-col items-center">
            <div
              class="qr-login-frame flex h-[220px] w-[220px] items-center justify-center rounded-md bg-white p-3"
            >
              <img
                v-if="qrImage"
                :src="qrImage"
                alt="登录二维码"
                class="h-full w-full object-contain"
              />
              <div
                v-else-if="isLoading"
                class="h-10 w-10 animate-spin rounded-full border-4 border-[#535353] border-t-[#1ed760]"
              />
              <p v-else class="px-4 text-center text-sm text-[#535353]">
                暂无二维码
              </p>
            </div>

            <p
              class="mt-4 min-h-[20px] text-center text-sm"
              :class="phase === 'error' ? 'text-[#f15e6c]' : 'text-[#b3b3b3]'"
            >
              {{ errorMessage || statusMessage }}
            </p>

            <button
              v-if="canRefresh"
              type="button"
              class="mt-4 cursor-pointer rounded-full border-0 bg-white px-5 py-2 text-sm font-bold text-black transition-transform hover:scale-[1.04] active:scale-[0.98] focus-visible:outline-none"
              @click="refreshLogin()"
            >
              刷新二维码
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.header-login-btn {
  font-family: inherit;
}
</style>
