import { apiRequest } from '../config/api';

const COLORES_CURSOS = {
  blue: '#2994F5',
  green: '#40BF7A',
  orange: '#FF941F',
  purple: '#A56BF5',
  red: '#EF4444',
  pink: '#E9579D',
  cyan: '#20B7C5',
  indigo: '#6366D9',
};

function normalizarCurso(curso) {
  const colorGuardado = String(curso.color || 'blue').toLowerCase();

  return {
    ...curso,
    id: Number(curso.id),
    nombre: curso.nombre || 'Curso sin nombre',
    descripcion: curso.descripcion || '',
    nivel: curso.nivel || '',
    grado: curso.grado || '',
    seccion: curso.seccion || '',
    seccionCodigo: curso.seccionCodigo || '',
    icono: curso.icono || 'book-outline',
    color: COLORES_CURSOS[colorGuardado] || colorGuardado,
    docente: curso.docente || '',
    alumnos: Number(curso.cantidadEstudiantes || 0),
    anio: Number(curso.anio || new Date().getFullYear()),
  };
}

export async function listarMisCursos() {
  const respuesta = await apiRequest('/api/cursos/mis-cursos');

  if (!Array.isArray(respuesta)) {
    return [];
  }

  return respuesta.map(normalizarCurso);
}
