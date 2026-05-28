import { requestJson } from '@/api/http'
import { resolveRequestUrl, withCookie, withTimestamp } from '@/api/url'
import type { UserPlaylistDto, UserPlaylistResponse } from '@/types/playlist'

export type FetchUserPlaylistsOptions = {
  cookie: string
  uid: number
  limit?: number
  offset?: number
}

function buildUserPlaylistUrl(options: FetchUserPlaylistsOptions) {
  const params = new URLSearchParams({
    uid: String(options.uid),
    limit: String(options.limit ?? 50),
    offset: String(options.offset ?? 0),
  })

  let url = withTimestamp(resolveRequestUrl(`/user/playlist?${params.toString()}`))
  url = withCookie(url, options.cookie)
  return url
}

export async function fetchUserPlaylists(
  options: FetchUserPlaylistsOptions,
): Promise<UserPlaylistDto[]> {
  try {
    const payload = await requestJson<UserPlaylistResponse>(buildUserPlaylistUrl(options))
    if (payload.code !== 200 || !Array.isArray(payload.playlist)) {
      return []
    }

    return payload.playlist
  } catch {
    return []
  }
}

export function findLikedPlaylistId(playlists: UserPlaylistDto[]) {
  const liked = playlists.find((playlist) => playlist.specialType === 5)
  return liked?.id != null ? String(liked.id) : null
}
