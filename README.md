# Stereo Camera Viewer

A web-based stereoscopic camera viewing application using Sora WebRTC and WebXR for VR viewing.

## Features

- **Dual Camera Streaming**: Connect to two separate camera streams via Sora WebRTC
- **Stereoscopic Display**: Side-by-side stereo view for 3D perception
- **VR Support**: WebXR integration for immersive VR viewing
- **TypeScript**: Fully typed for better development experience
- **WSL Compatible**: Designed to work seamlessly in WSL environment

## Architecture

The application works around Sora's single video track limitation by establishing separate WebRTC connections for each camera:

- **Left Camera**: Connected via one Sora channel
- **Right Camera**: Connected via another Sora channel
- **Synchronized Display**: Both streams displayed simultaneously for stereoscopic effect

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Access the application:
   - Local: https://localhost:3000
   - WSL: https://[WSL-IP]:3000

## Configuration

Configure your Sora connection settings in the web interface:

- **Signaling URL**: Your Sora WebRTC signaling server URL
- **Left Camera Channel**: Channel ID for the left camera stream
- **Right Camera Channel**: Channel ID for the right camera stream

## VR Requirements

For VR functionality:
- WebXR compatible browser (Chrome, Edge)
- VR headset (Oculus, HTC Vive, etc.)
- HTTPS connection (required for WebXR)

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run typecheck` - Type checking

## Browser Compatibility

- **WebRTC**: All modern browsers
- **WebXR**: Chrome 79+, Edge 79+
- **HTTPS**: Required for camera access and WebXR

## License

MIT