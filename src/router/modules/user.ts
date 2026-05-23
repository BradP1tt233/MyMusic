import type { RouteRecordRaw } from 'vue-router'

const userRoutes: RouteRecordRaw[] = [
  {
    path: 'user',
    name: 'User',
    component: () => import('@/views/user/index.vue'),
    meta: { title: '用户' },
  },
]

export default userRoutes
