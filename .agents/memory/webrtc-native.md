---
name: WebRTC native support
description: How react-native-webrtc is loaded and guarded in VoiceCallView.
---

`react-native-webrtc` is installed in `artifacts/interview-ace`.

`VoiceCallView.tsx` calls `loadWebRTC()` at module level which:
- On web: returns browser globals (`RTCPeerConnection`, `navigator.mediaDevices`)
- On native: does `require('react-native-webrtc')` inside a try/catch; returns `isSupported: true` if successful
- On native without the package (Expo Go): returns `isSupported: false`

The main export gates on `WebRTCNative.isSupported`:
- `false` → renders `NativeFallback` ("Voice calls need a custom app build")
- `true` → renders `VoiceCallCore` (full WebRTC call)

**Why:** react-native-webrtc is a native module — it works in custom Expo builds but crashes/throws in Expo Go. The try/catch + isSupported guard lets the app degrade gracefully in Expo Go while being ready for production builds.

Remote audio on native: react-native-webrtc auto-routes audio to earpiece; no HTMLAudioElement needed. The `pc.ontrack` handler only creates an `Audio()` element when `Platform.OS === 'web'`.
