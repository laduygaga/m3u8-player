/* eslint-disable no-restricted-globals */
self.onmessage = function (e) {
  const { m3uText } = e.data;
  if (!m3uText) return;

  const lines = m3uText.split(/\r?\n/);
  let currentChannel = null;
  const batch = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('#EXTINF:')) {
      const tvgId = (line.match(/tvg-id="([^"]*)"/) || [])[1] || '';
      const tvgLogo = (line.match(/tvg-logo="([^"]*)"/) || [])[1] || '';
      const groupTitle = (line.match(/group-title="([^"]*)"/) || [])[1] || 'Uncategorized';
      const name = line.split(',')[1] || 'Unknown';

      currentChannel = { tvgId, tvgLogo, groupTitle, name };
    } else if (line.startsWith('http://') || line.startsWith('https://')) {
      if (currentChannel) {
        currentChannel.url = line;
        batch.push(currentChannel);
        currentChannel = null;
      }
    }

    if (batch.length >= 1000) {
      self.postMessage({ type: 'CHUNK', data: batch.splice(0, batch.length) });
    }
  }

  if (batch.length > 0) {
    self.postMessage({ type: 'CHUNK', data: batch });
  }

  self.postMessage({ type: 'COMPLETE' });
};
