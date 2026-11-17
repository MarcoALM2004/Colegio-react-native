import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

import { apiRequest } from '../config/api';

// Configuración para mostrar notificaciones cuando la app está abierta.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

let avisoExpoGoMostrado = false;

// Registrar el dispositivo para recibir notificaciones push.
export async function registrarNotificaciones(usuarioId) {
  if (!usuarioId) {
    return null;
  }

  console.info(
    'EduConnect: registro de notificaciones push pendiente de Development Build.'
  );

  return null;
}

// Obtener notificaciones del usuario desde el backend.
export async function obtenerNotificaciones(usuarioId) {
  return apiRequest(
    `/api/notificaciones?usuarioId=${usuarioId}`
  );
}

// Obtener cantidad de notificaciones no leídas.
export async function obtenerNoLeidas(usuarioId) {
  const respuesta = await apiRequest(
    `/api/notificaciones/no-leidas?usuarioId=${usuarioId}`
  );

  return respuesta.total || 0;
}

// Marcar una notificación como leída.
export async function marcarNotificacionLeida(id, usuarioId) {
  return apiRequest(
    `/api/notificaciones/${id}/leida?usuarioId=${usuarioId}`,
    {
      method: 'PUT',
    }
  );
}

// Marcar todas las notificaciones como leídas.
export async function marcarTodasLeidas(usuarioId) {
  return apiRequest(
    `/api/notificaciones/leer-todas?usuarioId=${usuarioId}`,
    {
      method: 'PUT',
    }
  );
}