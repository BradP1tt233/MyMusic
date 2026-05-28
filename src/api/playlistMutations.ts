import { requestJson } from '@/api/http'
import { appendQuery, resolveRequestUrl, withCookie, withTimestamp } from '@/api/url'
import type {
  LikeSongResponse,
  PlaylistCreateResponse,
  PlaylistMutationResponse,
} from '@/types/playlist'

export type PlaylistCreateOptions = {
  cookie: string
  privacy?: 0 | 10
  type?: 'NORMAL' | 'VIDEO' | 'SHARED'
}

export type AuthenticatedRequestOptions = {
  cookie: string
}

function buildMutationUrl(path: string, params: Record<string, string>, cookie: string) {
  const search = new URLSearchParams(params)
  let url = withTimestamp(resolveRequestUrl(`${path}?${search.toString()}`))
  url = withCookie(url, cookie)
  return url
}

function isMutationSuccess(payload: PlaylistMutationResponse | LikeSongResponse) {
  return payload.code === 200
}

export async function createRemotePlaylist(
  name: string,
  options: PlaylistCreateOptions,
): Promise<{ id: string } | null> {
  const params: Record<string, string> = { name }
  if (options.privacy != null) {
    params.privacy = String(options.privacy)
  }
  if (options.type) {
    params.type = options.type
  }

  const payload = await requestJson<PlaylistCreateResponse>(
    buildMutationUrl('/playlist/create', params, options.cookie),
  )

  if (!isMutationSuccess(payload)) {
    return null
  }

  const id = payload.id ?? payload.playlist?.id
  if (id == null) {
    return null
  }

  return { id: String(id) }
}

export async function deleteRemotePlaylist(
  id: string | number,
  options: AuthenticatedRequestOptions,
): Promise<boolean> {
  const payload = await requestJson<PlaylistMutationResponse>(
    buildMutationUrl('/playlist/delete', { id: String(id) }, options.cookie),
  )

  return isMutationSuccess(payload)
}

export async function subscribeRemotePlaylist(
  t: 1 | 2,
  id: string | number,
  options: AuthenticatedRequestOptions,
): Promise<boolean> {
  const payload = await requestJson<PlaylistMutationResponse>(
    buildMutationUrl('/playlist/subscribe', { t: String(t), id: String(id) }, options.cookie),
  )

  return isMutationSuccess(payload)
}

export async function manipulatePlaylistTracks(
  op: 'add' | 'del',
  pid: string | number,
  tracks: string | number | Array<string | number>,
  options: AuthenticatedRequestOptions,
): Promise<boolean> {
  const trackIds = Array.isArray(tracks)
    ? tracks.map((track) => String(track)).join(',')
    : String(tracks)

  const payload = await requestJson<PlaylistMutationResponse>(
    buildMutationUrl(
      '/playlist/tracks',
      { op, pid: String(pid), tracks: trackIds },
      options.cookie,
    ),
  )

  return isMutationSuccess(payload)
}

export async function likeSong(
  trackId: string | number,
  like: boolean,
  options: AuthenticatedRequestOptions,
): Promise<boolean> {
  let url = withTimestamp(resolveRequestUrl('/like'))
  url = appendQuery(url, 'id', String(trackId))
  url = appendQuery(url, 'like', like ? 'true' : 'false')
  url = withCookie(url, options.cookie)

  const payload = await requestJson<LikeSongResponse>(url)
  return isMutationSuccess(payload)
}
