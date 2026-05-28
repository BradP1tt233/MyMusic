/** 侧边栏音乐库最多保存的歌单数量 */
export const LIBRARY_PLAYLIST_MAX = 20

export const LIBRARY_PLAYLIST_STORAGE_KEY = 'mymusic:library-playlists'

export const LIKED_PLAYLIST_ID = 'liked'

export const LIKED_PLAYLIST_COVER =
  'linear-gradient(135deg, #450af5 0%, #8e7ee7 50%, #c4efd9 100%)'

export const DEFAULT_EMPTY_PLAYLIST_COVER =
  'linear-gradient(135deg, #2a2a2a 0%, #525252 100%)'

export const LIBRARY_PLAYLIST_KIND_LABEL: Record<
  'liked' | 'created' | 'collected',
  string
> = {
  liked: '喜爱的歌曲',
  created: '自建歌单',
  collected: '收藏的歌单',
}
