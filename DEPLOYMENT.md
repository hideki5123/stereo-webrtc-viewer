# Deployment Guide

## Running from WSL

The application is now running and accessible at:

- **Local (WSL)**: https://localhost:3000/
- **Network**: https://172.26.167.3:3000/
- **Network**: https://10.255.255.254:3000/

## Testing the Application

1. **Access the app** using any of the URLs above in a modern browser
2. **Configure Sora settings**:
   - Enter your Sora WebRTC signaling URL
   - Set left camera channel ID
   - Set right camera channel ID
3. **Connect** to start receiving stereo camera streams
4. **View stereoscopic output** in the bottom panel
5. **Enter VR** (if supported) for immersive viewing

## Requirements

### Browser Support
- **WebRTC**: Chrome, Firefox, Safari, Edge
- **WebXR VR**: Chrome 79+, Edge 79+
- **HTTPS**: Required for camera access and WebXR

### Hardware
- **VR Headset** (optional): Oculus Quest, HTC Vive, etc.
- **Stereo cameras**: Two cameras connected to Sora channels

## Architecture Notes

Since Sora WebRTC only supports one video track per connection, this application:
1. Creates **two separate WebRTC connections**
2. Connects to **different Sora channels** for left/right cameras
3. Synchronizes streams for **stereoscopic display**
4. Renders **side-by-side** for VR compatibility

## Security

- Application requires **HTTPS** for WebRTC and WebXR
- Vite dev server includes self-signed certificate
- For production, use proper SSL certificates

## Troubleshooting

- **Connection issues**: Verify Sora signaling URL and channel IDs
- **VR not working**: Ensure HTTPS and compatible browser/headset
- **No video**: Check camera permissions and Sora channel configuration