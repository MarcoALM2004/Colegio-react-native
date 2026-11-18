import { apiRequest, API_URL, TOKEN_KEY } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UploadType } from 'expo-file-system';

const contenidoUrl = (cursoId) => {
  return `/api/cursos/${cursoId}/contenido`;
};

// Subida multipart usando la API moderna de expo-file-system.
// El selector File.pickFileAsync entrega un File basado en el URI SAF
// (content://), que mantiene permiso de lectura en Android/Expo Go.
const enviarArchivo = async (endpoint, archivo, campos = {}) => {
  if (
    !archivo?.uri ||
    typeof archivo.upload !== 'function'
  ) {
    throw new Error(
      'El archivo seleccionado ya no está disponible. Selecciónalo nuevamente.'
    );
  }

  const tokenGuardado = await AsyncStorage.getItem(TOKEN_KEY);
  const token = tokenGuardado?.trim();

  if (!token) {
    throw new Error(
      'No hay una sesión activa. Cierra sesión e inicia sesión nuevamente.'
    );
  }

  const parametros = {};
  Object.entries(campos).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      parametros[key] = String(value);
    }
  });

  let resultado;
  try {
    resultado = await archivo.upload(`${API_URL}${endpoint}`, {
      httpMethod: 'POST',
      uploadType: UploadType.MULTIPART,
      fieldName: 'archivo',
      mimeType: archivo.type || 'application/octet-stream',
      parameters: parametros,
      headers: {
        Accept: 'application/json',
        Authorization: token.startsWith('Bearer ')
          ? token
          : `Bearer ${token}`,
      },
    });
  } catch (error) {
    throw new Error(
      `No se pudo leer o enviar "${archivo.name || 'el archivo'}". ` +
      `Vuelve a abrir el selector y elige el archivo desde el almacenamiento. ` +
      `${error?.message || ''}`.trim()
    );
  }

  let data = null;
  try {
    data = resultado.body ? JSON.parse(resultado.body) : null;
  } catch {
    data = resultado.body;
  }

  if (resultado.status < 200 || resultado.status >= 300) {
    const mensaje =
      data && typeof data === 'object'
        ? data.mensaje || data.message || data.error
        : data;

    throw new Error(
      mensaje || `El servidor rechazó el archivo (${resultado.status}).`
    );
  }

  return data;
};

// UNIDADES
// =====================================================

export const listarUnidades = (cursoId) => {
  return apiRequest(`${contenidoUrl(cursoId)}/unidades`);
};

export const crearUnidad = (cursoId, datos) => {
  return apiRequest(`${contenidoUrl(cursoId)}/unidades`, {
    method: 'POST',
    body: JSON.stringify(datos),
  });
};

export const actualizarUnidad = (cursoId, unidadId, datos) => {
  return apiRequest(
    `${contenidoUrl(cursoId)}/unidades/${unidadId}`,
    {
      method: 'PUT',
      body: JSON.stringify(datos),
    }
  );
};

export const eliminarUnidad = (cursoId, unidadId) => {
  return apiRequest(
    `${contenidoUrl(cursoId)}/unidades/${unidadId}`,
    {
      method: 'DELETE',
    }
  );
};

// =====================================================
// ARCHIVOS DE UNIDADES
// =====================================================

export const listarArchivosUnidad = (cursoId, unidadId) => {
  return apiRequest(
    `${contenidoUrl(cursoId)}/unidades/${unidadId}/archivos`
  );
};

export const subirArchivoUnidad = (
  cursoId,
  unidadId,
  archivo
) => {
  return enviarArchivo(
    `${contenidoUrl(cursoId)}/unidades/${unidadId}/archivos`,
    archivo
  );
};

export const eliminarArchivoUnidad = (
  cursoId,
  archivoId
) => {
  return apiRequest(
    `${contenidoUrl(cursoId)}/archivos-unidad/${archivoId}`,
    {
      method: 'DELETE',
    }
  );
};

// =====================================================
// MATERIALES
// =====================================================

export const listarMateriales = (cursoId) => {
  return apiRequest(`${contenidoUrl(cursoId)}/materiales`);
};

export const crearMaterial = (
  cursoId,
  datos,
  archivo
) => {
  return enviarArchivo(
    `${contenidoUrl(cursoId)}/materiales`,
    archivo,
    {
      titulo: datos.titulo,
      descripcion: datos.descripcion,
      modoLibro: datos.modoLibro,
    }
  );
};

export const eliminarMaterial = (
  cursoId,
  materialId
) => {
  return apiRequest(
    `${contenidoUrl(cursoId)}/materiales/${materialId}`,
    {
      method: 'DELETE',
    }
  );
};

// =====================================================
// TAREAS
// =====================================================

export const listarTareas = (cursoId) => {
  return apiRequest(`${contenidoUrl(cursoId)}/tareas`);
};

export const crearTarea = (cursoId, datos) => {
  return apiRequest(`${contenidoUrl(cursoId)}/tareas`, {
    method: 'POST',
    body: JSON.stringify(datos),
  });
};

export const actualizarTarea = (
  cursoId,
  tareaId,
  datos
) => {
  return apiRequest(
    `${contenidoUrl(cursoId)}/tareas/${tareaId}`,
    {
      method: 'PUT',
      body: JSON.stringify(datos),
    }
  );
};

export const eliminarTarea = (cursoId, tareaId) => {
  return apiRequest(
    `${contenidoUrl(cursoId)}/tareas/${tareaId}`,
    {
      method: 'DELETE',
    }
  );
};

// =====================================================
// ARCHIVOS DE TAREAS
// =====================================================

export const listarArchivosTarea = (
  cursoId,
  tareaId
) => {
  return apiRequest(
    `${contenidoUrl(cursoId)}/tareas/${tareaId}/archivos`
  );
};

export const subirArchivoTarea = (
  cursoId,
  tareaId,
  archivo
) => {
  return enviarArchivo(
    `${contenidoUrl(cursoId)}/tareas/${tareaId}/archivos`,
    archivo
  );
};

export const eliminarArchivoTarea = (
  cursoId,
  archivoId
) => {
  return apiRequest(
    `${contenidoUrl(cursoId)}/archivos-tarea/${archivoId}`,
    {
      method: 'DELETE',
    }
  );
};

// =====================================================
// ENTREGAS DE TAREAS
// =====================================================

export const listarEntregas = (
  cursoId,
  tareaId
) => {
  return apiRequest(
    `${contenidoUrl(cursoId)}/tareas/${tareaId}/entregas`
  );
};

export const calificarEntrega = (
  cursoId,
  entregaId,
  datos
) => {
  return apiRequest(
    `${contenidoUrl(cursoId)}/entregas/${entregaId}/calificar`,
    {
      method: 'PUT',
      body: JSON.stringify(datos),
    }
  );
};

export const entregarTarea = (
  cursoId,
  tareaId,
  archivo,
  comentario
) => {
  return enviarArchivo(
    `${contenidoUrl(cursoId)}/tareas/${tareaId}/entregas`,
    archivo,
    {
      comentario,
    }
  );
};

// =====================================================
// FORO
// =====================================================

export const listarPublicaciones = (cursoId) => {
  return apiRequest(`${contenidoUrl(cursoId)}/foro`);
};

export const crearPublicacion = (
  cursoId,
  contenido
) => {
  return apiRequest(`${contenidoUrl(cursoId)}/foro`, {
    method: 'POST',
    body: JSON.stringify({
      contenido,
    }),
  });
};

export const listarRespuestas = (cursoId, publicacionId) => {
  return apiRequest(
    `${contenidoUrl(cursoId)}/foro/${publicacionId}/respuestas`
  );
};

export const crearRespuesta = (
  cursoId,
  publicacionId,
  contenido
) => {
  return apiRequest(
    `${contenidoUrl(cursoId)}/foro/${publicacionId}/respuestas`,
    {
      method: 'POST',
      body: JSON.stringify({
        contenido,
      }),
    }
  );
};

export const eliminarPublicacion = (
  cursoId,
  publicacionId
) => {
  return apiRequest(
    `${contenidoUrl(cursoId)}/foro/${publicacionId}`,
    {
      method: 'DELETE',
    }
  );
};

export const eliminarRespuesta = (
  cursoId,
  publicacionId,
  respuestaId
) => {
  return apiRequest(
    `${contenidoUrl(cursoId)}/foro/respuestas/${respuestaId}`,
    {
      method: 'DELETE',
    }
  );
};

// =====================================================
// DESCARGAS
// =====================================================

export const descargarArchivo = async (cursoId, tipo, id) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);

  const rutas = {
    unidad: `/archivos-unidad/${id}`,
    material: `/materiales/${id}`,
    tarea: `/archivos-tarea/${id}`,
    entrega: `/entregas/${id}/archivo`,
  };

  const ruta = rutas[tipo];

  if (!ruta) {
    throw new Error('Tipo de archivo no válido.');
  }

  return {
    url: `${API_URL}${contenidoUrl(cursoId)}${ruta}`,
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
  };
};