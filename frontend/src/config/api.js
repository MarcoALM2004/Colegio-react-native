
import { Platform } from 'react-native';

export const API_URL = 'http://192.168.100.5:8080';

export async function apiRequest(endpoint, options = {}) {
  const headers = {
    Accept: 'application/json',
    ...options.headers,
  };

  // FormData establece automáticamente el Content-Type
  // y el boundary necesario para multipart/form-data.
  if (!(options.body instanceof FormData)) {
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

