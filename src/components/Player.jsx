import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

export default function Player({ streamUrl }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    let hls;
    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        backBufferLength: 30,
        maxBufferLength: 30,
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch((err) => console.log('Autoplay prevented:', err));
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.play().catch((err) => console.log('Autoplay prevented:', err));
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [streamUrl]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '80vh', backgroundColor: '#000' }}>
      <video
        ref={videoRef}
        controls
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
