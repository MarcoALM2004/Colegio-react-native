import { ROLES } from '../data/adminMockData';

export const ROLE_TONE = {
  [ROLES.ESTUDIANTE]: 'pink',
  [ROLES.DOCENTE]: 'purple',
  [ROLES.ADMIN]: 'blue',
};

export const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

export const DIAS_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

// Quita tildes y pasa a minúsculas para búsquedas.
export const normalizar = (texto = '') => texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// "2024-03-12" -> "12 mar 2024"
export const formatearFecha = (iso) => {
  if (!iso) return '';
  const [a, m, d] = iso.split('-').map(Number);
  return `${d} ${MESES[m - 1].slice(0, 3)} ${a}`;
};

// Date -> "2026-10-14" (hora local)
export const toISODate = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export const esCorreoValido = (correo) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
