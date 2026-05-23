import type { RouteRecordRaw } from 'vue-router'

const playlistRoutes: RouteRecordRaw[] = [
  {
    path: 'playlist/:id',
    name: 'Playlist',
    component: () => import('@/views/playlist/index.vue'),
    meta: { title: '歌单' },
  },
]

export default playlistRoutes
