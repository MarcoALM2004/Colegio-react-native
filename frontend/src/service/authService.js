import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from '../config/api';

export const TOKEN_KEY = '@educonnect_token';

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

  if (!respuesta.token) {
    throw new Error('El servidor no devolvió el token de autenticación.');
  }

  const datos = respuesta.usuario;

  const roles = {
    ADMIN: 'ADMIN',
    ADMINISTRADOR: 'ADMIN',
    DOCENTE: 'TEACHER',
    ALUMNO: 'STUDENT',
    ESTUDIANTE: 'STUDENT',
  };

  const rol = roles[String(datos.rol).toUpperCase()];

  if (!rol) {
    throw new Error('El usuario tiene un rol no reconocido.');
  }

  await AsyncStorage.setItem(TOKEN_KEY, respuesta.token);

  return {
    rol,
    usuario: datos,
    token: respuesta.token,
  };
}

export async function cerrarSesion() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}
