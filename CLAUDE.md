# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **stereo-webrtc-viewer** - a web-based stereoscopic camera viewing application that uses Sora WebRTC for dual camera streaming and WebXR for VR viewing.

### Key Architecture Constraints

**Sora WebRTC Limitation**: Sora only supports one video track per connection, so the application creates **two separate WebRTC connections** - one for each camera channel. This is handled by `StereoCameraManager` which coordinates dual `SoraConnection` instances.

**Dual Channel Design**: 
- Left camera connects to one Sora channel
- Right camera connects to another Sora channel  
- Both streams are synchronized for stereoscopic display

## Development Commands

```bash
# Development
npm run dev          # Start dev server (HTTPS on 0.0.0.0:3000)
npm run build        # Build for production (tsc + vite build)
npm run typecheck    # TypeScript type checking
npm run preview      # Preview production build
```

## Core Module Structure

- **`main.ts`**: Main application entry point. Handles UI interactions, collects Sora configuration (signaling URL, channel IDs) from user input, and coordinates `StereoCameraManager` and `WebXRManager`.
- **`stereo-camera-manager.ts`**: Manages dual WebRTC connections to overcome Sora's single-track limitation
- **`sora-connection.ts`**: Individual Sora WebRTC connection wrapper
- **`webxr-manager.ts`**: WebXR VR rendering with stereo video textures and WebGL shaders

## Network Configuration

The Vite dev server is configured for:
- **HTTPS required** (for WebRTC/WebXR)
- **Host: 0.0.0.0** (WSL network access)
- **Port: 3000**

## Browser Requirements

- **WebRTC**: All modern browsers
- **WebXR VR**: Chrome 79+, Edge 79+ only
- **HTTPS**: Mandatory for camera access and WebXR