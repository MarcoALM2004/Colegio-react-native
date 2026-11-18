import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_URL = 'http://192.168.100.5:8080';
export const TOKEN_KEY = '@educonnect_token';

export async function apiRequest(endpoint, options = {}) {
  const tokenGuardado = await AsyncStorage.getItem(TOKEN_KEY);
  const token = tokenGuardado?.trim();

  const headers = {
    Accept: 'application/json',
    ...options.headers,
  };

  if (endpoint !== '/login' && endpoint.startsWith('/api/')) {
    if (!token) {
      throw new Error(
        'No hay una sesión activa. Inicia sesión nuevamente.'
      );
    }

    headers.Authorization = `Bearer ${
      token.replace(/^Bearer\s+/i, '')
    }`;
  }

  const esFormData =
    typeof FormData !== 'undefined' &&
    options.body instanceof FormData;

  if (options.body !== undefined && !esFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const texto = await response.text();

  let data = null;

  try {
    data = texto ? JSON.parse(texto) : null;
  } catch {
    data = texto;
  }

  if (!response.ok) {
    const mensaje =
      data && typeof data === 'object'
        ? data.mensaje || data.message || data.error
        : data;

    throw new Error(
      mensaje || `Error del servidor (${response.status})`
    );
  }

  return data;
}
