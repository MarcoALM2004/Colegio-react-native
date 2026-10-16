import { apiRequest } from '../config/api';

export async function obtenerPerfil(codigo) {
  if (!codigo) {
    throw new Error('No se encontró el código del usuario.');
  }

  return apiRequest(`/api/perfil/${encodeURIComponent(codigo)}`);
}

export async function actualizarPerfil(codigo, datos) {
  if (!codigo) {
    throw new Error('No se encontró el código del usuario.');
  }

  const respuesta = await apiRequest(
    `/api/perfil/${encodeURIComponent(codigo)}`,
    {
      method: 'PUT',
      body: JSON.stringify({
        nombres: datos.nombres,
        apellidos: datos.apellidos,
        correo: datos.correo || null,
        telefono: datos.telefono || null,
      }),
    }
  );

  return respuesta.perfil || respuesta;
}