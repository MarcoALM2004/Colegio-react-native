
import { apiRequest } from '../config/api';

export async function obtenerPerfilAdmin(codigo) {
  if (!codigo) {
    throw new Error('No se encontró el código del administrador.');
  }

  return apiRequest(
    `/api/admin/perfil/${encodeURIComponent(codigo)}`
  );
}

export async function actualizarPerfilAdmin(codigo, datos) {
  if (!codigo) {
    throw new Error('No se encontró el código del administrador.');
  }

  const respuesta = await apiRequest(
    `/api/admin/perfil/${encodeURIComponent(codigo)}`,
    {
      method: 'PUT',
      body: JSON.stringify({
        correo: datos.correo,
        telefono: datos.telefono,
      }),
    }
  );

  return respuesta.perfil || respuesta;
}
