import type { RouteRecordRaw } from 'vue-router'

const albumRoutes: RouteRecordRaw[] = [
  {
    path: 'album/:id',
    name: 'Album',
    component: () => import('@/views/album/index.vue'),
    meta: { title: '专辑' },
  },
]

export default albumRoutes
