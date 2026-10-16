
import { apiRequest } from '../config/api';

export async function login(usuario, password) {
  if (!usuario.trim() || !password) {
    throw new Error('Completa todos los campos.');
  }


  const respuesta = await apiRequest('/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      identificador: usuario.trim(),
      password,
    }),
  });


  if (!respuesta.usuario) {
    throw new Error(
      respuesta.mensaje || 'No se recibieron los datos del usuario.'
    );
  }

  const datos = respuesta.usuario;

  const roles = {
    ADMIN: 'ADMIN',
    DOCENTE: 'TEACHER',
    ALUMNO: 'STUDENT',
  };

  const rol = roles[String(datos.rol).toUpperCase()];

  if (!rol) {
    throw new Error('El usuario tiene un rol no reconocido.');
  }

  return { rol, usuario: datos };
}
