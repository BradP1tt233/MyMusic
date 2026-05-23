import type { RouteRecordRaw } from 'vue-router'

const searchRoutes: RouteRecordRaw[] = [
  {
    path: 'search',
    name: 'Search',
    component: () => import('@/views/search/index.vue'),
    meta: { title: '搜索' },
  },
]

export default searchRoutes
