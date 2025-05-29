import { StereoCameraManager } from './stereo-camera-manager'
import { WebXRManager } from './webxr-manager'

class StereoViewer {
  private cameraManager: StereoCameraManager | null = null
  private webxrManager: WebXRManager
  private isConnected = false

  // DOM elements
  private signalingUrlInput!: HTMLInputElement
  private leftChannelInput!: HTMLInputElement
  private rightChannelInput!: HTMLInputElement
  private connectBtn!: HTMLButtonElement
  private disconnectBtn!: HTMLButtonElement
  private vrBtn!: HTMLButtonElement
  private statusEl!: HTMLElement
  private leftVideo!: HTMLVideoElement
  private rightVideo!: HTMLVideoElement
  private stereoLeftVideo!: HTMLVideoElement
  private stereoRightVideo!: HTMLVideoElement

  constructor() {
    this.webxrManager = new WebXRManager()
    this.initializeElements()
    this.setupEventListeners()
    this.updateUI()
  }

  private initializeElements(): void {
    this.signalingUrlInput = document.getElementById('signaling-url') as HTMLInputElement
    this.leftChannelInput = document.getElementById('channel-id-left') as HTMLInputElement
    this.rightChannelInput = document.getElementById('channel-id-right') as HTMLInputElement
    this.connectBtn = document.getElementById('connect-btn') as HTMLButtonElement
    this.disconnectBtn = document.getElementById('disconnect-btn') as HTMLButtonElement
    this.vrBtn = document.getElementById('vr-btn') as HTMLButtonElement
    this.statusEl = document.getElementById('status') as HTMLElement
    this.leftVideo = document.getElementById('left-video') as HTMLVideoElement
    this.rightVideo = document.getElementById('right-video') as HTMLVideoElement
    this.stereoLeftVideo = document.getElementById('stereo-left') as HTMLVideoElement
    this.stereoRightVideo = document.getElementById('stereo-right') as HTMLVideoElement
  }

  private setupEventListeners(): void {
    this.connectBtn.addEventListener('click', () => this.connect())
    this.disconnectBtn.addEventListener('click', () => this.disconnect())
    this.vrBtn.addEventListener('click', () => this.toggleVR())
  }

  private async connect(): Promise<void> {
    try {
      this.updateStatus('Connecting to stereo cameras...', 'info')
      this.connectBtn.disabled = true

      const config = {
        signalingUrl: this.signalingUrlInput.value,
        leftChannelId: this.leftChannelInput.value,
        rightChannelId: this.rightChannelInput.value
      }

      this.cameraManager = new StereoCameraManager(config)

      // Set up connection state monitoring
      this.cameraManager.onConnectionStateChange((state) => {
        console.log('Connection state:', state)
        if (state.left && state.right) {
          this.updateStatus('Connected to both cameras', 'success')
        } else if (state.left || state.right) {
          this.updateStatus('Partially connected (only one camera)', 'warning')
        } else {
          this.updateStatus('Disconnected', 'error')
        }
      })

      const streams = await this.cameraManager.connect()
      
      // Set up video streams
      this.leftVideo.srcObject = streams.left
      this.rightVideo.srcObject = streams.right
      this.stereoLeftVideo.srcObject = streams.left
      this.stereoRightVideo.srcObject = streams.right

      this.isConnected = true
      this.updateStatus('Connected to stereo cameras', 'success')
      this.updateUI()

    } catch (error) {
      console.error('Connection failed:', error)
      this.updateStatus(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
      this.connectBtn.disabled = false
    }
  }

  private disconnect(): void {
    if (this.cameraManager) {
      this.cameraManager.disconnect()
      this.cameraManager = null
    }

    // Clear video streams
    this.leftVideo.srcObject = null
    this.rightVideo.srcObject = null
    this.stereoLeftVideo.srcObject = null
    this.stereoRightVideo.srcObject = null

    this.isConnected = false
    this.updateStatus('Disconnected', 'info')
    this.updateUI()
  }

  private async toggleVR(): Promise<void> {
    try {
      if (this.webxrManager.isInVR()) {
        this.webxrManager.exitVR()
        this.updateStatus('Exited VR mode', 'info')
      } else {
        if (!this.webxrManager.isSupported()) {
          throw new Error('WebXR VR not supported in this browser')
        }
        
        await this.webxrManager.enterVR(this.leftVideo, this.rightVideo)
        this.updateStatus('Entered VR mode', 'success')
      }
      this.updateUI()
    } catch (error) {
      console.error('VR toggle failed:', error)
      this.updateStatus(`VR error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
    }
  }

  private updateStatus(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info'): void {
    this.statusEl.textContent = message
    this.statusEl.className = `status ${type === 'success' ? 'connected' : type === 'error' ? 'error' : ''}`
  }

  private updateUI(): void {
    this.connectBtn.disabled = this.isConnected
    this.disconnectBtn.disabled = !this.isConnected
    this.vrBtn.disabled = !this.isConnected || !this.webxrManager.isSupported()
    
    if (this.webxrManager.isInVR()) {
      this.vrBtn.textContent = 'Exit VR Mode'
    } else {
      this.vrBtn.textContent = 'Enter VR Mode'
    }

    // Show WebXR support status
    if (!this.webxrManager.isSupported()) {
      this.vrBtn.title = 'WebXR VR not supported in this browser'
    }
  }
}

// Initialize the application
new StereoViewer()