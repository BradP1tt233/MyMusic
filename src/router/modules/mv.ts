import type { RouteRecordRaw } from 'vue-router'

const mvRoutes: RouteRecordRaw[] = [
  {
    path: 'mv',
    name: 'Mv',
    component: () => import('@/views/mv/index.vue'),
    meta: { title: 'MV' },
  },
]

export default mvRoutes
