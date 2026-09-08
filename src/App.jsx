import React, { useState } from 'react';
import Player from './components/Player';
import { authenticateXtream, getLiveStreams, buildLiveStreamUrl } from './services/xtreamApi';
import { parseM3UWithWorker } from './services/m3uParser';

const SAMPLES = [
  {
    name: 'Big Buck Bunny (HLS)',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  },
  {
    name: 'Sintel (HLS Multi-audio)',
    url: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
  },
  {
    name: 'Tears of Steel (HLS)',
    url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('samples'); // 'samples' | 'm3u' | 'xtream'
  const [currentStream, setCurrentStream] = useState(null);
  const [streamName, setStreamName] = useState('');

  // M3U state
  const [m3uUrl, setM3uUrl] = useState('');
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Xtream state
  const [xtreamServer, setXtreamServer] = useState('');
  const [xtreamUser, setXtreamUser] = useState('');
  const [xtreamPass, setXtreamPass] = useState('');

  const handlePlayStream = (url, name = 'Stream') => {
    setCurrentStream(url);
    setStreamName(name);
  };

  const handleFetchM3u = async () => {
    if (!m3uUrl) return;
    setLoading(true);
    setError(null);
    setChannels([]);

    try {
      const res = await fetch(m3uUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch playlist`);
      const text = await res.text();

      const parsedChannels = [];
      parseM3UWithWorker(
        text,
        (chunk) => parsedChannels.push(...chunk),
        () => {
          setChannels(parsedChannels);
          setLoading(false);
        }
      );
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleXtreamConnect = async () => {
    if (!xtreamServer || !xtreamUser || !xtreamPass) {
      setError('Please fill in Server URL, Username, and Password');
      return;
    }
    setLoading(true);
    setError(null);
    setChannels([]);

    try {
      const auth = await authenticateXtream(xtreamServer, xtreamUser, xtreamPass);
      if (auth.user_info?.status !== 'Active') {
        throw new Error(`Account status: ${auth.user_info?.status || 'Invalid'}`);
      }
      const streams = await getLiveStreams(xtreamServer, xtreamUser, xtreamPass);
      const mapped = (streams || []).slice(0, 200).map((s) => ({
        name: s.name,
        tvgLogo: s.stream_icon,
        url: buildLiveStreamUrl(xtreamServer, xtreamUser, xtreamPass, s.stream_id, 'm3u8'),
      }));
      setChannels(mapped);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Xtream connection failed');
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>webOS IPTV Stream Player</h1>
        {currentStream && (
          <button style={styles.backBtn} onClick={() => setCurrentStream(null)}>
            ← Back to Playlist
          </button>
        )}
      </header>

      {currentStream ? (
        <div style={styles.playerWrapper}>
          <div style={styles.nowPlaying}>Now Playing: {streamName}</div>
          <Player streamUrl={currentStream} />
        </div>
      ) : (
        <main style={styles.main}>
          <nav style={styles.tabs}>
            <button
              style={{ ...styles.tab, ...(activeTab === 'samples' ? styles.activeTab : {}) }}
              onClick={() => { setActiveTab('samples'); setError(null); }}
            >
              📺 Sample Streams
            </button>
            <button
              style={{ ...styles.tab, ...(activeTab === 'm3u' ? styles.activeTab : {}) }}
              onClick={() => { setActiveTab('m3u'); setError(null); }}
            >
              🔗 M3U / M3U8 URL
            </button>
            <button
              style={{ ...styles.tab, ...(activeTab === 'xtream' ? styles.activeTab : {}) }}
              onClick={() => { setActiveTab('xtream'); setError(null); }}
            >
              ⚡ Xtream Codes API
            </button>
          </nav>

          {error && <div style={styles.errorBox}>{error}</div>}

          {/* TAB 1: SAMPLES */}
          {activeTab === 'samples' && (
            <div style={styles.section}>
              <h2>Test Public HLS Streams</h2>
              <p>Click any stream below to test player instantly:</p>
              <div style={styles.grid}>
                {SAMPLES.map((item, idx) => (
                  <button
                    key={idx}
                    style={styles.card}
                    onClick={() => handlePlayStream(item.url, item.name)}
                  >
                    <div style={styles.cardTitle}>▶ {item.name}</div>
                    <div style={styles.cardUrl}>{item.url}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: M3U URL */}
          {activeTab === 'm3u' && (
            <div style={styles.section}>
              <h2>Play M3U / M3U8 URL</h2>
              <div style={styles.formRow}>
                <input
                  type="text"
                  placeholder="Enter http://.../playlist.m3u8 or .m3u URL"
                  value={m3uUrl}
                  onChange={(e) => setM3uUrl(e.target.value)}
                  style={styles.input}
                />
                <button
                  style={styles.btnPrimary}
                  onClick={() => handlePlayStream(m3uUrl, 'Direct Stream')}
                >
                  Play Directly
                </button>
                <button style={styles.btnSecondary} onClick={handleFetchM3u} disabled={loading}>
                  {loading ? 'Parsing...' : 'Load Playlist'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: XTREAM CODES */}
          {activeTab === 'xtream' && (
            <div style={styles.section}>
              <h2>Xtream Codes Login</h2>
              <div style={styles.formCol}>
                <input
                  type="text"
                  placeholder="Server URL (e.g. http://xtream.server:8080)"
                  value={xtreamServer}
                  onChange={(e) => setXtreamServer(e.target.value)}
                  style={styles.input}
                />
                <input
                  type="text"
                  placeholder="Username"
                  value={xtreamUser}
                  onChange={(e) => setXtreamUser(e.target.value)}
                  style={styles.input}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={xtreamPass}
                  onChange={(e) => setXtreamPass(e.target.value)}
                  style={styles.input}
                />
                <button style={styles.btnPrimary} onClick={handleXtreamConnect} disabled={loading}>
                  {loading ? 'Connecting...' : 'Connect & Load Channels'}
                </button>
              </div>
            </div>
          )}

          {/* PARSED CHANNELS GRID */}
          {channels.length > 0 && (
            <div style={styles.section}>
              <h3>Loaded Channels ({channels.length})</h3>
              <div style={styles.grid}>
                {channels.map((ch, idx) => (
                  <button
                    key={idx}
                    style={styles.channelCard}
                    onClick={() => handlePlayStream(ch.url, ch.name)}
                  >
                    {ch.tvgLogo && (
                      <img
                        src={ch.tvgLogo}
                        alt=""
                        style={styles.channelLogo}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                    <span>{ch.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#0f0f12',
    color: '#ffffff',
    minHeight: '100vh',
    fontFamily: 'Segoe UI, Helvetica, Arial, sans-serif',
    padding: '24px 40px',
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    borderBottom: '1px solid #222',
    paddingBottom: '16px',
  },
  title: {
    margin: 0,
    fontSize: '28px',
    color: '#e50914',
  },
  backBtn: {
    backgroundColor: '#333',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  tabs: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
  },
  tab: {
    backgroundColor: '#1f1f24',
    color: '#aaa',
    border: '1px solid #333',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  activeTab: {
    backgroundColor: '#e50914',
    color: '#fff',
    borderColor: '#e50914',
  },
  section: {
    backgroundColor: '#18181c',
    padding: '24px',
    borderRadius: '12px',
    marginBottom: '24px',
    border: '1px solid #282830',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
    marginTop: '16px',
  },
  card: {
    backgroundColor: '#22222a',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '16px',
    color: '#fff',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'transform 0.15s, border-color 0.15s',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '8px',
  },
  cardUrl: {
    fontSize: '12px',
    color: '#888',
    wordBreak: 'break-all',
  },
  formRow: {
    display: 'flex',
    gap: '12px',
    marginTop: '16px',
  },
  formCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '16px',
    maxWidth: '500px',
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    backgroundColor: '#101014',
    border: '1px solid #444',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '16px',
  },
  btnPrimary: {
    backgroundColor: '#e50914',
    color: '#fff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  btnSecondary: {
    backgroundColor: '#333',
    color: '#fff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  errorBox: {
    backgroundColor: '#3b1212',
    color: '#ff6b6b',
    padding: '12px 16px',
    borderRadius: '6px',
    marginBottom: '16px',
    border: '1px solid #631c1c',
  },
  channelCard: {
    backgroundColor: '#22222a',
    border: '1px solid #333',
    borderRadius: '6px',
    padding: '12px',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  channelLogo: {
    width: '40px',
    height: '40px',
    objectFit: 'contain',
    borderRadius: '4px',
  },
  playerWrapper: {
    width: '100%',
  },
  nowPlaying: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '12px',
  },
};
