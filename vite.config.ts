import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:3000'

  return {
    plugins: [vue(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: {
        '/login': {
          target: apiTarget,
          changeOrigin: true,
        },
        '/recommend': {
          target: apiTarget,
          changeOrigin: true,
        },
        '/song': {
          target: apiTarget,
          changeOrigin: true,
        },
        '/top': {
          target: apiTarget,
          changeOrigin: true,
        },
        '/personalized': {
          target: apiTarget,
          changeOrigin: true,
        },
        '/chart': {
          target: apiTarget,
          changeOrigin: true,
        },
        '/artists': {
          target: apiTarget,
          changeOrigin: true,
        },
        '/artist': {
          target: apiTarget,
          changeOrigin: true,
        },
        '/simi': {
          target: apiTarget,
          changeOrigin: true,
        },
        '/playlist/detail': {
          target: apiTarget,
          changeOrigin: true,
        },
        '/playlist/track': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
