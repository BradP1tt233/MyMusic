import type { RouteRecordRaw } from 'vue-router'

const artistRoutes: RouteRecordRaw[] = [
  {
    path: 'artist/:id',
    name: 'Artist',
    component: () => import('@/views/artist/index.vue'),
    meta: { title: '艺人' },
  },
]

export default artistRoutes
