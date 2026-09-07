# webOS IPTV Stream Player

An IPTV / M3U / M3U8 / Xtream Codes API Stream Player built for LG webOS Smart TVs using Enact (React) and HLS.js.

## Features

- **Xtream Codes API Support**: Seamless integration with `player_api.php` for Live TV, VOD Movies, Series, and EPG.
- **M3U / M3U8 Playlist Parser**: High-performance Web Worker parser with chunked loading for large playlists (50k+ streams).
- **Spatial Navigation**: Built-in 5-way D-Pad remote control focus support via Enact Spotlight.
- **HLS Playback Engine**: Accelerated streaming using `hls.js` with webOS buffer tuning.
- **LG Content Store Ready**: Structured according to webOS app specifications and seller guidelines.

## Quick Start

### Prerequisites
- Node.js (v18+)
- LG webOS TV SDK / CLI (`ares-package`, `ares-install`, `ares-launch`)

### Installation & Development

```bash
# Install dependencies
npm install

# Start local dev server
npm start

# Build production bundle
npm run build

# Package for LG webOS TV (.ipk)
npm run pack
```

### Deploying to TV

```bash
# Install on target TV
ares-install --device myTV ./dist_pkg/com.laduygaga.iptvplayer_1.0.0_all.ipk

# Launch on TV
ares-launch --device myTV com.laduygaga.iptvplayer
```

## License
MIT
