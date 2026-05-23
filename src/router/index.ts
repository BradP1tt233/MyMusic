import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import discoverRoutes from './modules/discover'
import playlistRoutes from './modules/playlist'
import collectionRoutes from './modules/collection'
import chartRoutes from './modules/chart'
import albumRoutes from './modules/album'
import artistRoutes from './modules/artist'
import searchRoutes from './modules/search'
import userRoutes from './modules/user'
import mvRoutes from './modules/mv'

const layoutChildren: RouteRecordRaw[] = [
  {
    path: '',
    redirect: { name: 'Discover' },
  },
  ...discoverRoutes,
  ...collectionRoutes,
  ...chartRoutes,
  ...playlistRoutes,
  ...albumRoutes,
  ...artistRoutes,
  ...searchRoutes,
  ...userRoutes,
  ...mvRoutes,
]

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: layoutChildren,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.afterEach((to) => {
  const title = (to.meta.title as string) ?? 'myMusicPlayer'
  document.title = `${title} · myMusicPlayer`
})

export default router
