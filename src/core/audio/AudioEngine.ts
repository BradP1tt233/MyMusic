export type AudioEngineHandlers = {
  onTimeUpdate?: (currentTime: number) => void
  onDurationChange?: (duration: number) => void
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
  onError?: (event: Event) => void
}

/** 全项目唯一 Audio 实例封装 */
class AudioEngine {
  private static instance: AudioEngine | null = null

  private readonly audio: HTMLAudioElement

  private handlers: AudioEngineHandlers = {}

  private constructor() {
    this.audio = new Audio()
    this.audio.preload = 'metadata'
    this.bindNativeEvents()
  }

  static getInstance(): AudioEngine {
    AudioEngine.instance ??= new AudioEngine()
    return AudioEngine.instance
  }

  setHandlers(handlers: AudioEngineHandlers) {
    this.handlers = handlers
  }

  async load(src: string): Promise<void> {
    if (this.audio.src === src || this.audio.currentSrc === src) {
      return
    }

    this.audio.src = src
    this.audio.load()

    await new Promise<void>((resolve, reject) => {
      const onCanPlay = () => {
        cleanup()
        resolve()
      }
      const onError = () => {
        cleanup()
        reject(new Error(`Failed to load audio: ${src}`))
      }
      const cleanup = () => {
        this.audio.removeEventListener('canplay', onCanPlay)
        this.audio.removeEventListener('error', onError)
      }

      this.audio.addEventListener('canplay', onCanPlay, { once: true })
      this.audio.addEventListener('error', onError, { once: true })
    })
  }

  async play(): Promise<void> {
    await this.audio.play()
  }

  pause() {
    this.audio.pause()
  }

  seek(seconds: number) {
    const duration = Number.isFinite(this.audio.duration) ? this.audio.duration : seconds
    this.audio.currentTime = Math.min(Math.max(seconds, 0), duration)
  }

  setVolume(volume: number) {
    this.audio.volume = Math.min(Math.max(volume, 0), 1)
  }

  setMuted(muted: boolean) {
    this.audio.muted = muted
  }

  getCurrentTime() {
    return this.audio.currentTime
  }

  getDuration() {
    return Number.isFinite(this.audio.duration) ? this.audio.duration : 0
  }

  getSrc() {
    return this.audio.currentSrc || this.audio.src
  }

  isPaused() {
    return this.audio.paused
  }

  private bindNativeEvents() {
    this.audio.addEventListener('timeupdate', () => {
      this.handlers.onTimeUpdate?.(this.audio.currentTime)
    })

    this.audio.addEventListener('durationchange', () => {
      this.handlers.onDurationChange?.(this.getDuration())
    })

    this.audio.addEventListener('loadedmetadata', () => {
      this.handlers.onDurationChange?.(this.getDuration())
    })

    this.audio.addEventListener('play', () => {
      this.handlers.onPlay?.()
    })

    this.audio.addEventListener('pause', () => {
      this.handlers.onPause?.()
    })

    this.audio.addEventListener('ended', () => {
      this.handlers.onEnded?.()
    })

    this.audio.addEventListener('error', (event) => {
      this.handlers.onError?.(event)
    })
  }
}

export const audioEngine = AudioEngine.getInstance()
