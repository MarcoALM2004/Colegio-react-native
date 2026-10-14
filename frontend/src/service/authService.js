import { apiRequest } from '../config/api';

export async function login(usuario, password) {
  if (!usuario.trim() || !password) {
    throw new Error('Completa todos los campos.');
  }

  const cuentas = {
    C232: { password: '123456', rol: 'teacher' },
    E223: { password: '123456', rol: 'student' },
    A001: { password: '123456', rol: 'admin' },
  };

  const cuenta = cuentas[usuario.trim().toUpperCase()];

  if (!cuenta || cuenta.password !== password) {
    throw new Error('Código o contraseña incorrectos.');
  }

  return { rol: cuenta.rol };
}