export const SEARCH_DEFAULT_LIMIT = 30
export const SEARCH_SUGGEST_SONG_LIMIT = 4
export const SEARCH_SUGGEST_ARTIST_LIMIT = 3

export const SEARCH_TYPE = {
  song: 1,
  album: 10,
  artist: 100,
  playlist: 1000,
} as const

export type SearchTypeValue = (typeof SEARCH_TYPE)[keyof typeof SEARCH_TYPE]

export const SEARCH_TABS: Array<{ type: SearchTypeValue; label: string }> = [
  { type: SEARCH_TYPE.song, label: '单曲' },
  { type: SEARCH_TYPE.album, label: '专辑' },
  { type: SEARCH_TYPE.artist, label: '歌手' },
  { type: SEARCH_TYPE.playlist, label: '歌单' },
]

export function parseSearchType(value: unknown): SearchTypeValue {
  const parsed = Number(value)
  if (parsed === SEARCH_TYPE.album) return SEARCH_TYPE.album
  if (parsed === SEARCH_TYPE.artist) return SEARCH_TYPE.artist
  if (parsed === SEARCH_TYPE.playlist) return SEARCH_TYPE.playlist
  return SEARCH_TYPE.song
}

export function getSearchTypeLabel(type: SearchTypeValue) {
  return SEARCH_TABS.find((tab) => tab.type === type)?.label ?? '单曲'
}
