import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_URL = 'http://192.168.100.5:8080';

export const TOKEN_KEY = '@educonnect_token';

export async function apiRequest(endpoint, options = {}) {
  const token = await AsyncStorage.getItem(TOKEN_KEY);

  const headers = {
    Accept: 'application/json',
    ...options.headers,
  };

  const esFormData =
    typeof FormData !== 'undefined' &&
    options.body instanceof FormData;

  if (!esFormData && options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (token && endpoint !== '/login') {
    headers.Authorization = `Bearer ${token}`;
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
