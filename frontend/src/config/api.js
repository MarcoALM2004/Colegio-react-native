import { Platform } from 'react-native';

export const API_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:8080'
    : 'http://localhost:8080';

export async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const texto = await response.text();

  let data;

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
