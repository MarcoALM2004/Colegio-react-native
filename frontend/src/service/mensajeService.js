import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest, API_URL, TOKEN_KEY } from '../config/api';
import * as FileSystem from 'expo-file-system/legacy';

const obtenerApiUrl = (ruta) =>
  `${API_URL.replace(/\/+$/, '')}${ruta.startsWith('/') ? ruta : `/${ruta}`}`;

const interpretarRespuesta = (body) => {
  if (!body) return null;

  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
};

// Obtener contactos.
export async function listarContactos(usuarioId) {
  return apiRequest(
    `/api/mensajes/contactos?usuarioId=${encodeURIComponent(usuarioId)}`
  );
}

// Obtener conversación.
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
  if (!remitenteId || !destinatarioId) {
    throw new Error('No se identificó al remitente o destinatario.');
  }

  if (!contenido?.trim()) {
    throw new Error('Escribe un mensaje antes de enviarlo.');
  }

  return apiRequest('/api/mensajes', {
    method: 'POST',
    body: JSON.stringify({
      remitenteId,
      destinatarioId,
      asunto,
      contenido: contenido.trim(),
    }),
  });
}

// Detectar formato de imagen.
const obtenerMimeType = (imagen) => {
  if (imagen.mimeType) return imagen.mimeType;

  const extension = imagen.uri
    .split('?')[0]
    .split('.')
    .pop()
    .toLowerCase();

  const tipos = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    heic: 'image/heic',
    heif: 'image/heif',
  };

  return tipos[extension] || 'image/jpeg';
};

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

  let respuesta;

  try {
    respuesta = await FileSystem.uploadAsync(
      obtenerApiUrl('/api/mensajes/imagen'),
      imagen.uri,
      {
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        fieldName: 'archivo',
        mimeType: obtenerMimeType(imagen),
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
    console.error('Error al enviar fotografía:', error);
    throw new Error(
      error?.message ||
      'No se pudo conectar con el servidor para enviar la fotografía.'
    );
  }

  const data = interpretarRespuesta(respuesta.body);

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

// Descargar fotografía protegida mediante JWT.
export async function descargarImagen(url, mensajeId) {
  const token = await AsyncStorage.getItem(TOKEN_KEY);

  if (!token) {
    throw new Error('No se encontró el token de sesión.');
  }

  if (!FileSystem.cacheDirectory) {
    throw new Error('No está disponible el directorio de caché.');
  }

  const destino = `${FileSystem.cacheDirectory}educonnect_mensaje_${mensajeId}`;

  try {
    const existente = await FileSystem.getInfoAsync(destino);

    if (existente.exists && existente.size > 0) {
      return destino;
    }

    const respuesta = await FileSystem.downloadAsync(
      url,
      destino,
      {
        headers: {
          Accept: 'image/*',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (respuesta.status !== 200) {
      throw new Error(
        `Error HTTP ${respuesta.status} al descargar la fotografía.`
      );
    }

    return respuesta.uri;
  } catch (error) {
    console.error(
      `Error descargando fotografía del mensaje ${mensajeId}:`,
      error
    );

    throw error;
  }
}

// Marcar mensaje como leído.
export async function marcarMensajeLeido(mensajeId, usuarioId) {
  if (!mensajeId || !usuarioId) {
    throw new Error('Falta identificar el mensaje o el usuario.');
  }

  return apiRequest(
    `/api/mensajes/${mensajeId}/leido?usuarioId=${encodeURIComponent(usuarioId)}`,
    { method: 'PUT' }
  );
}
