/**
 * Web Worker Wrapper for M3U Parsing
 */

export function parseM3UWithWorker(m3uText, onChunk, onComplete) {
  const worker = new Worker(new URL('../workers/m3u.worker.js', import.meta.url));

  worker.onmessage = (event) => {
    const { type, data } = event.data;
    if (type === 'CHUNK') {
      onChunk(data);
    } else if (type === 'COMPLETE') {
      if (onComplete) onComplete();
      worker.terminate();
    }
  };

  worker.postMessage({ m3uText });
  return worker;
}
