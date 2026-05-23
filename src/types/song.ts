export interface Song {
  id: string | number
  name: string
  artist?: string
  cover?: string
  /** 音频资源地址（本地 public 路径或静态 mock URL） */
  src: string
  duration?: number
}
