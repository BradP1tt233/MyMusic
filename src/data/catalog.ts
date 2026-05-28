import type { DetailEntity, DiscoverSection, MediaCardItem, LibraryPlaylist } from '@/types/media'
import type { Song } from '@/types'
import {
  DAILY_RECOMMENDATIONS_SLUG,
  DAILY_RECOMMENDATIONS_TITLE,
  POPULAR_ARTISTS_SLUG,
  POPULAR_ARTISTS_TITLE,
  RECOMMENDED_PLAYLISTS_SLUG,
  RECOMMENDED_PLAYLISTS_TITLE,
} from '@/constants/discover'

/** API 不可用时的本地兜底数据 */
export const dailyRecommendationFallback: MediaCardItem[] = [
  {
    id: 'hot-1',
    title: 'Janice STFU',
    subtitle: 'Drake',
    image: 'https://i.scdn.co/image/ab67616d00001e028e76f09489ebfa31ac920f08',
    color: '#402830',
    type: 'track',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: 'hot-2',
    title: 'Hit the Wall',
    subtitle: 'Gracie Abrams',
    image: 'https://i.scdn.co/image/ab67616d00001e021f4ba58b0e4dcef24a8df0cf',
    color: '#701818',
    type: 'track',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: 'hot-3',
    title: 'Chicago',
    subtitle: 'Michael Jackson',
    image: 'https://i.scdn.co/image/ab67616d00001e0235f36cb686b0d5a12ab3a9f0',
    color: '#93712D',
    type: 'track',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
  {
    id: 'hot-4',
    title: 'Roundtripski',
    subtitle: 'LUCKI',
    image: 'https://i.scdn.co/image/ab67616d00001e026e9c2723dd7e83489ba7d3b5',
    color: '#B02808',
    type: 'track',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  },
  {
    id: 'hot-5',
    title: 'Twizzler',
    subtitle: 'Cigarettes After Sex',
    image: 'https://i.scdn.co/image/ab67616d00001e0288b902c0f9ed88b08e00d22a',
    type: 'track',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  },
  {
    id: 'hot-6',
    title: 'The Bitch Is Back - Remastered 1995',
    subtitle: 'Elton John',
    image: 'https://i.scdn.co/image/ab67616d00001e0268f5959744717483eed212b2',
    color: '#2C7DB1',
    type: 'track',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
  },
  {
    id: 'hot-7',
    title: 'Cinderella (feat. Ty Dolla $ign)',
    subtitle: 'Mac Miller, Ty Dolla $ign',
    image: 'https://i.scdn.co/image/ab67616d00001e022e92f776279eaf45d14a33fd',
    color: '#827373',
    type: 'track',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
  },
  {
    id: 'hot-8',
    title: 'Baby Now That I Found You',
    subtitle: 'Ella Bright',
    image: 'https://i.scdn.co/image/ab67616d00001e02b32149d244bd49090d04397f',
    color: '#384040',
    type: 'track',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  },
]

export const popularArtistsFallback: MediaCardItem[] = [
  {
    id: 'artist-1',
    title: 'Drake',
    subtitle: '艺人',
    image: 'https://i.scdn.co/image/ab67616d0000b273949988852d2f9a609f053113',
    type: 'artist',
  },
  {
    id: 'artist-2',
    title: 'Taylor Swift',
    subtitle: '艺人',
    image: 'https://i.scdn.co/image/ab67616d0000b273bb54dde68cd23e2a268ae0f5',
    type: 'artist',
  },
  {
    id: 'artist-3',
    title: 'The Weeknd',
    subtitle: '艺人',
    image: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36',
    type: 'artist',
  },
  {
    id: 'artist-4',
    title: 'Billie Eilish',
    subtitle: '艺人',
    image: 'https://i.scdn.co/image/ab67616d0000b27371d62d53bc8683a002747bb2',
    type: 'artist',
  },
  {
    id: 'artist-5',
    title: 'Ariana Grande',
    subtitle: '艺人',
    image: 'https://i.scdn.co/image/ab67616d0000b273c288acf81e958fdbb968086f',
    type: 'artist',
  },
  {
    id: 'artist-6',
    title: 'Ed Sheeran',
    subtitle: '艺人',
    image: 'https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6fbe',
    type: 'artist',
  },
]

export const recommendedPlaylistsFallback: MediaCardItem[] = [
  {
    id: 'playlist-fallback-1',
    title: 'Hit Me Hard and Soft',
    subtitle: '歌单 • 精选',
    image: 'https://i.scdn.co/image/ab67616d0000b27371d62d53bc8683a002747bb2',
    color: '#505050',
    type: 'playlist',
  },
  {
    id: 'playlist-fallback-2',
    title: 'Midnights',
    subtitle: '歌单 • 精选',
    image: 'https://i.scdn.co/image/ab67616d0000b273bb54dde68cd23e2a268ae0f5',
    color: '#2C2C54',
    type: 'playlist',
  },
  {
    id: 'playlist-fallback-3',
    title: 'For All The Dogs',
    subtitle: '歌单 • 精选',
    image: 'https://i.scdn.co/image/ab67616d0000b273949988852d2f9a609f053113',
    color: '#402830',
    type: 'playlist',
  },
  {
    id: 'playlist-fallback-4',
    title: 'The Tortured Poets Department',
    subtitle: '歌单 • 精选',
    image: 'https://i.scdn.co/image/ab67616d0000b273e787cffec20e2db0b86d9a8e',
    color: '#787878',
    type: 'playlist',
  },
  {
    id: 'playlist-fallback-5',
    title: "Short n' Sweet",
    subtitle: '歌单 • 精选',
    image: 'https://i.scdn.co/image/ab67616d0000b273a91c10fe9472d9bd89802e5a',
    color: '#B06040',
    type: 'playlist',
  },
  {
    id: 'playlist-fallback-6',
    title: 'Chromatica',
    subtitle: '歌单 • 精选',
    image: 'https://i.scdn.co/image/ab67616d0000b2730a472635a4e7a2f0c8b8b8b8',
    color: '#303030',
    type: 'playlist',
  },
]

export const featuredChartsFallback: MediaCardItem[] = [
  {
    id: 'chart-1',
    title: 'Top Songs - Global',
    subtitle: '全球最热门歌曲。每周五更新。',
    image: 'https://i.scdn.co/image/ab67706f00000002ca5a75171547305c08902a5ae',
    color: '#503080',
    type: 'playlist',
  },
  {
    id: 'chart-2',
    title: 'Top Songs - United States',
    subtitle: '美国最热门歌曲。每周五更新。',
    image: 'https://i.scdn.co/image/ab67706f00000002b0fe40a02d5620b5087b524',
    color: '#287828',
    type: 'playlist',
  },
  {
    id: 'chart-3',
    title: 'Viral 50 - Global',
    subtitle: '全球最热门病毒式传播歌曲。每日更新。',
    image: 'https://i.scdn.co/image/ab67706f00000002d4a8e4268ad664a2aaaacb6',
    color: '#287828',
    type: 'playlist',
  },
  {
    id: 'chart-4',
    title: 'Viral 50 - United States',
    subtitle: '美国最热门病毒式传播歌曲。每日更新。',
    image: 'https://i.scdn.co/image/ab67706f00000002d2730885c5446f6a0f753177',
    color: '#287828',
    type: 'playlist',
  },
  {
    id: 'chart-5',
    title: 'Top 50 - Global',
    subtitle: '全球最热门歌曲。每周五更新。',
    image: 'https://i.scdn.co/image/ab67706f00000002ca5a75171547305c08902a5ae',
    color: '#503080',
    type: 'playlist',
  },
]

export const discoverSections: DiscoverSection[] = [
  {
    slug: DAILY_RECOMMENDATIONS_SLUG,
    title: DAILY_RECOMMENDATIONS_TITLE,
    items: [],
    itemType: 'track',
  },
  {
    slug: POPULAR_ARTISTS_SLUG,
    title: POPULAR_ARTISTS_TITLE,
    items: [],
    variant: 'circle',
    itemType: 'artist',
  },
  {
    slug: RECOMMENDED_PLAYLISTS_SLUG,
    title: RECOMMENDED_PLAYLISTS_TITLE,
    items: [],
    itemType: 'playlist',
  },
  {
    slug: 'featured-charts',
    title: '精选排行榜',
    items: [],
    itemType: 'playlist',
  },
]

export const defaultLibraryPlaylists: LibraryPlaylist[] = [
  {
    id: 'liked',
    kind: 'liked',
    title: '已点赞的歌曲',
    subtitle: '喜爱的歌曲 • 0 首歌曲',
    cover: 'linear-gradient(135deg, #450af5 0%, #8e7ee7 50%, #c4efd9 100%)',
    pinned: true,
    description: '你点赞的所有歌曲。',
    tracks: [],
    createdAt: 0,
  },
  {
    id: 'pl-collected-demo',
    kind: 'collected',
    title: '我的收藏精选',
    subtitle: '收藏的歌单 • 0 首歌曲',
    cover: 'linear-gradient(135deg, #1e3264 0%, #3d5a80 100%)',
    description: '从发现页收藏的歌单。',
    tracks: [],
    createdAt: 1,
  },
]

const allMediaItems = discoverSections.flatMap((section) => section.items)

function toDetailEntity(
  item: MediaCardItem,
  typeLabel: string,
  coverVariant: 'square' | 'circle' = 'square',
): DetailEntity {
  return {
    id: item.id,
    title: item.title,
    subtitle: item.subtitle,
    description: item.subtitle,
    cover: item.image,
    coverVariant,
    typeLabel,
  }
}

export function getDiscoverSection(slug: string) {
  if (slug === 'hot-tracks') {
    return discoverSections.find((entry) => entry.slug === DAILY_RECOMMENDATIONS_SLUG)
  }

  if (slug === 'popular-albums') {
    return discoverSections.find((entry) => entry.slug === RECOMMENDED_PLAYLISTS_SLUG)
  }

  return discoverSections.find((entry) => entry.slug === slug)
}

export function mediaItemsToSongs(items: MediaCardItem[]): Song[] {
  return items
    .filter((item) => item.type === 'track' || item.src)
    .map((item) => ({
      id: item.id,
      name: item.title,
      artist: item.subtitle,
      cover: item.image,
      src: item.src ?? '',
    }))
}

export function getMediaItemById(id: string) {
  return allMediaItems.find((item) => item.id === id)
}

export function getArtistById(id: string) {
  const item = allMediaItems.find((entry) => entry.id === id && (entry.type ?? '') === 'artist')
  if (!item) return undefined
  return toDetailEntity(item, '艺人', 'circle')
}

export function getAlbumById(id: string) {
  const item = allMediaItems.find((entry) => entry.id === id && entry.type === 'album')
  if (!item) return undefined
  return toDetailEntity(item, '专辑')
}

export function getPlaylistCatalogItem(id: string) {
  const item = allMediaItems.find((entry) => entry.id === id && entry.type === 'playlist')
  if (!item) return undefined
  return toDetailEntity(item, '歌单')
}

export function getLibraryPlaylistById(id: string, playlists: LibraryPlaylist[]) {
  const playlist = playlists.find((entry) => entry.id === id)
  if (!playlist) return undefined

  return {
    id: playlist.id,
    title: playlist.title,
    subtitle: playlist.subtitle,
    description: playlist.description ?? playlist.subtitle,
    cover: playlist.cover,
    coverVariant: 'square' as const,
    typeLabel: '歌单',
  } satisfies DetailEntity
}

export function getPlaylistDetail(id: string, libraryPlaylists: LibraryPlaylist[]) {
  return getPlaylistCatalogItem(id) ?? getLibraryPlaylistById(id, libraryPlaylists)
}
