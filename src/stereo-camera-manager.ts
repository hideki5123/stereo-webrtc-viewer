import { SoraConnection } from './sora-connection'

export interface StereoCameraConfig {
  signalingUrl: string
  leftChannelId: string
  rightChannelId: string
  metadata?: Record<string, any>
}

export class StereoCameraManager {
  private leftConnection: SoraConnection | null = null
  private rightConnection: SoraConnection | null = null
  private leftStream: MediaStream | null = null
  private rightStream: MediaStream | null = null
  
  constructor(private config: StereoCameraConfig) {}

  async connect(): Promise<{ left: MediaStream; right: MediaStream }> {
    try {
      // Create connections for both cameras
      this.leftConnection = new SoraConnection({
        signalingUrl: this.config.signalingUrl,
        channelId: this.config.leftChannelId,
        metadata: this.config.metadata
      })

      this.rightConnection = new SoraConnection({
        signalingUrl: this.config.signalingUrl,
        channelId: this.config.rightChannelId,
        metadata: this.config.metadata
      })

      // Connect to both streams in parallel
      const [leftStream, rightStream] = await Promise.all([
        this.leftConnection.connect(),
        this.rightConnection.connect()
      ])

      this.leftStream = leftStream
      this.rightStream = rightStream

      return { left: leftStream, right: rightStream }
    } catch (error) {
      console.error('Failed to connect to stereo cameras:', error)
      this.disconnect()
      throw error
    }
  }

  disconnect(): void {
    if (this.leftConnection) {
      this.leftConnection.disconnect()
      this.leftConnection = null
    }
    
    if (this.rightConnection) {
      this.rightConnection.disconnect()
      this.rightConnection = null
    }
    
    this.leftStream = null
    this.rightStream = null
  }

  getStreams(): { left: MediaStream | null; right: MediaStream | null } {
    return {
      left: this.leftStream,
      right: this.rightStream
    }
  }

  isConnected(): boolean {
    return this.leftConnection?.getConnectionState() && this.rightConnection?.getConnectionState() || false
  }

  onConnectionStateChange(callback: (state: { left: boolean; right: boolean }) => void): void {
    // Set up connection state monitoring
    const checkState = () => {
      callback({
        left: this.leftConnection?.getConnectionState() || false,
        right: this.rightConnection?.getConnectionState() || false
      })
    }

    if (this.leftConnection) {
      this.leftConnection.onConnect(checkState)
      this.leftConnection.onDisconnect(checkState)
    }

    if (this.rightConnection) {
      this.rightConnection.onConnect(checkState)
      this.rightConnection.onDisconnect(checkState)
    }
  }
}