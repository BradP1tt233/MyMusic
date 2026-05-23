import type { RouteRecordRaw } from 'vue-router'

const collectionRoutes: RouteRecordRaw[] = [
  {
    path: 'collection/:slug',
    name: 'Collection',
    component: () => import('@/views/collection/index.vue'),
    meta: { title: '合集' },
  },
]

export default collectionRoutes
