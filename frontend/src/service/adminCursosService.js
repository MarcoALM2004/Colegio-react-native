  import { apiRequest } from '../config/api';

  const BASE = '/api/admin/cursos';

  export async function listarCursosAdmin() {
    const data = await apiRequest(BASE);
    return Array.isArray(data) ? data : [];
  }

  export function obtenerCursoAdmin(id) {
    return apiRequest(`${BASE}/${encodeURIComponent(id)}`);
  }

  export function crearCursoAdmin(datos) {
    return apiRequest(BASE, {
      method: 'POST',
      body: JSON.stringify(datos),
    });
  }

  export function actualizarCursoAdmin(id, datos) {
    return apiRequest(`${BASE}/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(datos),
    });
  }

  export function eliminarCursoAdmin(id) {
    return apiRequest(`${BASE}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  export async function listarDocentesCursoAdmin(busqueda = '') {
    const data = await apiRequest(
      `${BASE}/docentes?busqueda=${encodeURIComponent(busqueda)}`
    );
    return Array.isArray(data) ? data : [];
  }

  export async function listarEstudiantesCursoAdmin(cursoId) {
    const data = await apiRequest(
      `${BASE}/${encodeURIComponent(cursoId)}/estudiantes`
    );
    return Array.isArray(data) ? data : [];
  }

  export async function listarEstudiantesDisponiblesCursoAdmin(
    cursoId,
    busqueda = ''
  ) {
    const data = await apiRequest(
      `${BASE}/${encodeURIComponent(cursoId)}/estudiantes/disponibles?busqueda=${encodeURIComponent(busqueda)}`
    );
    return Array.isArray(data) ? data : [];
  }

  export function matricularEstudiantesCursoAdmin(cursoId, estudiantesIds) {
    return apiRequest(`${BASE}/${encodeURIComponent(cursoId)}/estudiantes`, {
      method: 'POST',
      body: JSON.stringify(estudiantesIds),
    });
  }

  export function retirarEstudianteCursoAdmin(cursoId, estudianteId) {
    return apiRequest(
      `${BASE}/${encodeURIComponent(cursoId)}/estudiantes/${encodeURIComponent(estudianteId)}`,
      { method: 'DELETE' }
    );
  }