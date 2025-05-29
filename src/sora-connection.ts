import Sora from 'sora-js-sdk'

export interface SoraConfig {
  signalingUrl: string
  channelId: string
  metadata?: Record<string, any>
}

export class SoraConnection {
  private sora: any
  private connection: any
  private isConnected = false

  constructor(private config: SoraConfig) {
    this.sora = Sora.connection(config.signalingUrl, false)
  }

  async connect(): Promise<MediaStream> {
    try {
      this.connection = this.sora.recvonly(
        this.config.channelId,
        this.config.metadata || {}
      )

      const mediaStream = await this.connection.connect()
      this.isConnected = true
      
      return mediaStream
    } catch (error) {
      console.error('Failed to connect to Sora:', error)
      throw error
    }
  }

  disconnect(): void {
    if (this.connection) {
      this.connection.disconnect()
      this.isConnected = false
    }
  }

  getConnectionState(): boolean {
    return this.isConnected
  }

  onTrack(callback: (event: RTCTrackEvent) => void): void {
    if (this.connection) {
      this.connection.on('track', callback)
    }
  }

  onConnect(callback: (event: any) => void): void {
    if (this.connection) {
      this.connection.on('connect', callback)
    }
  }

  onDisconnect(callback: (event: any) => void): void {
    if (this.connection) {
      this.connection.on('disconnect', callback)
    }
  }
}