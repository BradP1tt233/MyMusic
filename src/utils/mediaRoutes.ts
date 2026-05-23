import type { MediaCardItem, MediaItemType } from '@/types/media'
import type { RouteLocationRaw } from 'vue-router'
import { isChartCardId } from '@/utils/chart'

export function getCollectionRoute(slug: string): RouteLocationRaw {
  return { name: 'Collection', params: { slug } }
}

export function getChartRoute(id: string): RouteLocationRaw {
  return { name: 'Chart', params: { id } }
}

export function getMediaItemRoute(
  item: MediaCardItem,
  fallbackType: MediaItemType,
): RouteLocationRaw | null {
  const type = item.type ?? fallbackType

  if (type === 'track') {
    return null
  }

  if (isChartCardId(item.id)) {
    return getChartRoute(item.id)
  }

  switch (type) {
    case 'artist':
      return { name: 'Artist', params: { id: item.id } }
    case 'album':
      return { name: 'Album', params: { id: item.id } }
    case 'playlist':
    default:
      return { name: 'Playlist', params: { id: item.id } }
  }
}

export function getPlaylistRoute(id: string): RouteLocationRaw {
  return { name: 'Playlist', params: { id } }
}
