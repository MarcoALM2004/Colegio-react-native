
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest, API_URL, TOKEN_KEY } from '../config/api';
import * as FileSystem from 'expo-file-system/legacy';

// Obtener contactos del usuario.
export async function listarContactos(usuarioId) {
  return apiRequest(
    `/api/mensajes/contactos?usuarioId=${encodeURIComponent(usuarioId)}`
  );
}

// Obtener historial de una conversación.
export async function obtenerConversacion(usuarioId, contactoId) {
  return apiRequest(
    `/api/mensajes/conversacion?usuarioId=${encodeURIComponent(usuarioId)}&contactoId=${encodeURIComponent(contactoId)}`
  );
}

// Enviar mensaje de texto.
export async function enviarMensaje({
  remitenteId,
  destinatarioId,
  contenido,
  asunto = null,
}) {
  return apiRequest('/api/mensajes', {
    method: 'POST',
    body: JSON.stringify({
      remitenteId,
      destinatarioId,
      asunto,
      contenido,
    }),
  });
}

// Enviar fotografía con autenticación JWT.
export async function enviarImagen({
  remitenteId,
  destinatarioId,
  imagen,
}) {
  if (!remitenteId || !destinatarioId) {
    throw new Error('No se identificó al remitente o destinatario.');
  }

  if (!imagen?.uri) {
    throw new Error('No se seleccionó ninguna fotografía.');
  }

  const token = await AsyncStorage.getItem(TOKEN_KEY);

  if (!token) {
    throw new Error('Tu sesión ha expirado. Inicia sesión nuevamente.');
  }

  const mimeType = imagen.mimeType || 'image/jpeg';

  let respuesta;

  try {
    respuesta = await FileSystem.uploadAsync(
      `${API_URL}/api/mensajes/imagen`,
      imagen.uri,
      {
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        fieldName: 'archivo',
        mimeType,
        parameters: {
          remitenteId: String(remitenteId),
          destinatarioId: String(destinatarioId),
        },
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    throw new Error(
      error?.message ||
      'No se pudo conectar con el servidor para enviar la fotografía.'
    );
  }

  let data = null;

  try {
    data = respuesta.body
      ? JSON.parse(respuesta.body)
      : null;
  } catch {
    data = respuesta.body;
  }

  if (respuesta.status < 200 || respuesta.status >= 300) {
    const mensaje =
      data && typeof data === 'object'
        ? data.mensaje || data.message || data.error
        : data;

    throw new Error(
      mensaje ||
      `No se pudo enviar la fotografía. Código HTTP: ${respuesta.status}.`
    );
  }

  return data;
}

// Marcar mensaje como leído.
export async function marcarMensajeLeido(mensajeId, usuarioId) {
  return apiRequest(
    `/api/mensajes/${mensajeId}/leido?usuarioId=${encodeURIComponent(usuarioId)}`,
    {
      method: 'PUT',
    }
  );
}
