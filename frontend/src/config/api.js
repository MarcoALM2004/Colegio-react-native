import { Platform } from 'react-native';

// Emulador Android: accede al servidor de tu computadora.
// Expo Go en celular: reemplaza por la IP local de tu computadora.
export const API_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:8080'
    : 'http://localhost:8080';

export async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Accept: 'text/plain, application/json',
      ...options.headers,
    },
  });

  const data = await response.text();

  if (!response.ok) {
    throw new Error(
      data || `Error del servidor (${response.status})`
    );
  }

  return data;
}