
import { apiRequest } from '../config/api';

export async function listarUsuariosAdmin() {
  const respuesta = await apiRequest('/api/admin/usuarios');
  return Array.isArray(respuesta) ? respuesta : [];
}

export async function obtenerUsuarioAdmin(codigo) {
  return apiRequest(
    `/api/admin/usuarios/${encodeURIComponent(codigo)}`
  );
}

export async function crearUsuarioAdmin(datos) {
  return apiRequest('/api/admin/usuarios', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}

export async function actualizarUsuarioAdmin(codigo, datos) {
  return apiRequest(
    `/api/admin/usuarios/${encodeURIComponent(codigo)}`,
    {
      method: 'PUT',
      body: JSON.stringify(datos),
    }
  );
}


export async function eliminarUsuarioAdmin(codigo) {
  return apiRequest(
    `/api/admin/usuarios/${encodeURIComponent(codigo)}`,
    { method: 'DELETE' }
  );
}

