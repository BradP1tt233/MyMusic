import type { RouteRecordRaw } from 'vue-router'

const chartRoutes: RouteRecordRaw[] = [
  {
    path: 'chart/:id',
    name: 'Chart',
    component: () => import('@/views/chart/index.vue'),
    meta: { title: '排行榜' },
  },
]

export default chartRoutes
