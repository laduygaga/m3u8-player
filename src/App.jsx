import React, { useState } from 'react';
import Player from './components/Player';
import { authenticateXtream, getLiveStreams } from './services/xtreamApi';

export default function App() {
  const [currentStream, setCurrentStream] = useState(null);

  return (
    <div style={{ backgroundColor: '#111', color: '#fff', minHeight: '100vh', padding: '20px' }}>
      <h1>webOS IPTV Stream Player</h1>
      <p>Supports M3U, M3U8, and Xtream Codes API</p>
      {currentStream ? (
        <Player streamUrl={currentStream} />
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', border: '1px dashed #444' }}>
          <p>No stream loaded. Enter M3U URL or Xtream Credentials to begin.</p>
        </div>
      )}
    </div>
  );
}
