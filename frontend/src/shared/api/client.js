export const AUTH_UNAUTHORIZED_EVENT = 'auth:unauthorized';

const MATCH_API_BASE = '/api/matches';
const AUTH_API_BASE = '/api/auth';
const TEAMMATE_API_BASE = '/api/teammates';
const GAME_ACCOUNT_API_BASE = '/api/game-accounts';

function notifyUnauthorized(url) {
  if (typeof window === 'undefined') {
    return;
  }

  if (url.startsWith(AUTH_API_BASE)) {
    return;
  }

  window.dispatchEvent(new CustomEvent(AUTH_UNAUTHORIZED_EVENT));
}

async function parseResponse(response, url) {
  if (!response.ok) {
    let message = 'Request failed';
    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      message = response.statusText || message;
    }

    if (response.status === 401) {
      notifyUnauthorized(url);
    }

    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  const contentType = response.headers.get('content-type') || '';
  if (response.status === 204 || !contentType.includes('application/json')) {
    return null;
  }

  return response.json();
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  return parseResponse(response, url);
}

export function fetchMatches() {
  return request(MATCH_API_BASE, { method: 'GET' });
}

export function createMatch(payload) {
  return request(MATCH_API_BASE, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function createMatchesBatch(payload) {
  return request(`${MATCH_API_BASE}/batch`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function updateMatch(id, payload) {
  return request(`${MATCH_API_BASE}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export function deleteMatch(id) {
  return request(`${MATCH_API_BASE}/${id}`, {
    method: 'DELETE'
  });
}

export function fetchTeammates() {
  return request(TEAMMATE_API_BASE, { method: 'GET' });
}

export function createTeammate(payload) {
  return request(TEAMMATE_API_BASE, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function deleteTeammate(id) {
  return request(`${TEAMMATE_API_BASE}/${id}`, {
    method: 'DELETE'
  });
}

export function fetchGameAccounts() {
  return request(GAME_ACCOUNT_API_BASE, { method: 'GET' });
}

export function createGameAccount(payload) {
  return request(GAME_ACCOUNT_API_BASE, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function updateGameAccount(id, payload) {
  return request(`${GAME_ACCOUNT_API_BASE}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export function deleteGameAccount(id) {
  return request(`${GAME_ACCOUNT_API_BASE}/${id}`, {
    method: 'DELETE'
  });
}

export function login(payload) {
  return request(`${AUTH_API_BASE}/login`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function fetchCurrentUser() {
  return request(`${AUTH_API_BASE}/me`, {
    method: 'GET',
    headers: {}
  });
}

export function logout() {
  return request(`${AUTH_API_BASE}/logout`, {
    method: 'POST',
    body: JSON.stringify({})
  });
}


