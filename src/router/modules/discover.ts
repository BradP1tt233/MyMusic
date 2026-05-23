import type { RouteRecordRaw } from 'vue-router'

const discoverRoutes: RouteRecordRaw[] = [
  {
    path: 'discover',
    name: 'Discover',
    component: () => import('@/views/discover/index.vue'),
    meta: { title: '发现' },
  },
]

export default discoverRoutes
