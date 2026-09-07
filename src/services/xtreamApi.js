/**
 * Xtream Codes API Helper
 */

export async function authenticateXtream(serverUrl, username, password) {
  const endpoint = `${serverUrl}/player_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`Xtream Auth Failed: ${response.statusText}`);
  }
  return await response.json();
}

export async function getLiveCategories(serverUrl, username, password) {
  const endpoint = `${serverUrl}/player_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&action=get_live_categories`;
  const response = await fetch(endpoint);
  return await response.json();
}

export async function getLiveStreams(serverUrl, username, password, categoryId = null) {
  let endpoint = `${serverUrl}/player_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&action=get_live_streams`;
  if (categoryId) {
    endpoint += `&category_id=${categoryId}`;
  }
  const response = await fetch(endpoint);
  return await response.json();
}

export function buildLiveStreamUrl(serverUrl, username, password, streamId, extension = 'ts') {
  return `${serverUrl}/live/${username}/${password}/${streamId}.${extension}`;
}
