/** API 请求模块入口 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export { resolveRequestUrl, withTimestamp } from './url'
export { fetchDailyRecommendations, mapDailyRecommendationToMediaItem } from './dailyRecommendations'
export { fetchTopArtists, mapTopArtistToMediaItem } from './topArtists'
export {
  fetchPersonalizedPlaylists,
  mapPersonalizedPlaylistToMediaItem,
} from './personalizedPlaylists'
export { fetchLoginUserId } from './loginStatus'
export { fetchFeaturedChartCards, fetchChartDetail } from './chartDetail'
export { fetchFeaturedChartTracks, fetchChartListTracks } from './chartList'
export { fetchArtistPageData, fetchArtistHotTracks } from './artist'
export {
  fetchPlaylistDetail,
  fetchPlaylistPageData,
  fetchPlaylistTracks,
  fetchPlaylistTracksForPlay,
} from './playlist'
export { fetchQrKey, createQrCode, checkQrStatus } from './qrLogin'
