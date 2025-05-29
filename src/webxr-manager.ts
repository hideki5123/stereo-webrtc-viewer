export class WebXRManager {
  private xrSession: XRSession | null = null
  private isXRSupported = false

  constructor() {
    this.checkXRSupport()
  }

  private async checkXRSupport(): Promise<void> {
    if ('xr' in navigator && navigator.xr) {
      try {
        this.isXRSupported = await navigator.xr.isSessionSupported('immersive-vr')
      } catch (error) {
        console.warn('WebXR not supported:', error)
        this.isXRSupported = false
      }
    }
  }

  async enterVR(leftVideo: HTMLVideoElement, rightVideo: HTMLVideoElement): Promise<void> {
    if (!this.isXRSupported) {
      throw new Error('WebXR VR not supported')
    }

    try {
      // Request VR session
      if (!navigator.xr) {
        throw new Error('WebXR not available')
      }
      
      this.xrSession = await navigator.xr.requestSession('immersive-vr', {
        requiredFeatures: ['local-floor']
      })

      // Set up WebXR rendering
      await this.setupVRRendering(leftVideo, rightVideo)

      // Handle session end
      this.xrSession.addEventListener('end', () => {
        this.xrSession = null
      })

    } catch (error) {
      console.error('Failed to enter VR:', error)
      throw error
    }
  }

  private async setupVRRendering(leftVideo: HTMLVideoElement, rightVideo: HTMLVideoElement): Promise<void> {
    if (!this.xrSession) return

    // Create WebGL context for VR rendering
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2', { xrCompatible: true }) as WebGL2RenderingContext
    
    if (!gl) {
      throw new Error('WebGL2 not supported')
    }

    // Set up XR rendering layer
    const baseLayer = new XRWebGLLayer(this.xrSession, gl)
    await this.xrSession.updateRenderState({ baseLayer })

    // Create video textures
    const leftTexture = gl.createTexture()
    const rightTexture = gl.createTexture()

    // Set up shader program for stereo rendering
    const vertexShader = this.createShader(gl, gl.VERTEX_SHADER, `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
      }
    `)

    const fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, `
      precision mediump float;
      uniform sampler2D u_texture;
      varying vec2 v_texCoord;
      
      void main() {
        gl_FragColor = texture2D(u_texture, v_texCoord);
      }
    `)

    const program = this.createProgram(gl, vertexShader!, fragmentShader!)

    // Get reference space
    const refSpace = await this.xrSession.requestReferenceSpace('local-floor')

    // Start render loop
    const renderFrame = (_time: number, frame: XRFrame) => {
      if (!this.xrSession) return

      const session = this.xrSession
      const pose = frame.getViewerPose(refSpace)

      if (pose) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, baseLayer.framebuffer)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

        for (let i = 0; i < pose.views.length; i++) {
          const view = pose.views[i]
          const viewport = baseLayer.getViewport(view)
          
          gl.viewport(viewport!.x, viewport!.y, viewport!.width, viewport!.height)
          
          // Render left eye with left video, right eye with right video
          const video = i === 0 ? leftVideo : rightVideo
          const texture = i === 0 ? leftTexture : rightTexture
          
          this.updateVideoTexture(gl, texture!, video)
          this.renderEye(gl, program!, texture!)
        }
      }

      session.requestAnimationFrame(renderFrame)
    }

    this.xrSession.requestAnimationFrame(renderFrame)
  }

  private createShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null {
    const shader = gl.createShader(type)
    if (!shader) return null
    
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', gl.getShaderInfoLog(shader))
      gl.deleteShader(shader)
      return null
    }
    
    return shader
  }

  private createProgram(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram | null {
    const program = gl.createProgram()
    if (!program) return null
    
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking error:', gl.getProgramInfoLog(program))
      gl.deleteProgram(program)
      return null
    }
    
    return program
  }

  private updateVideoTexture(gl: WebGL2RenderingContext, texture: WebGLTexture, video: HTMLVideoElement): void {
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  }

  private renderEye(gl: WebGL2RenderingContext, program: WebGLProgram, texture: WebGLTexture): void {
    gl.useProgram(program)
    
    // Create quad vertices
    const vertices = new Float32Array([
      -1, -1, 0, 1,
       1, -1, 1, 1,
      -1,  1, 0, 0,
       1,  1, 1, 0
    ])
    
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
    
    const positionLocation = gl.getAttribLocation(program, 'a_position')
    const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord')
    
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 16, 0)
    
    gl.enableVertexAttribArray(texCoordLocation)
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 16, 8)
    
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  exitVR(): void {
    if (this.xrSession) {
      this.xrSession.end()
      this.xrSession = null
    }
  }

  isSupported(): boolean {
    return this.isXRSupported
  }

  isInVR(): boolean {
    return this.xrSession !== null
  }
}