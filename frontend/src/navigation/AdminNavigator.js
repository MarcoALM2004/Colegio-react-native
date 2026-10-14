import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AdminDataProvider } from '../context/AdminDataContext';

import InicioAdmin from '../pages/admin/InicioAdmin';
import UsuariosAdmin from '../pages/admin/UsuariosAdmin';
import UsuarioDetalleAdmin from '../pages/admin/UsuarioDetalleAdmin';
import UsuarioFormAdmin from '../pages/admin/UsuarioFormAdmin';
import CursosAdmin from '../pages/admin/CursosAdmin';
import CursoDetalleAdmin from '../pages/admin/CursoDetalleAdmin';
import CursoFormAdmin from '../pages/admin/CursoFormAdmin';
import BibliotecaAdmin from '../pages/admin/BibliotecaAdmin';
import CalendarioAdmin from '../pages/admin/CalendarioAdmin';
import ReportesAdmin from '../pages/admin/ReportesAdmin';
import ReporteDetalleAdmin from '../pages/admin/ReporteDetalleAdmin';
import MensajesAdmin from '../pages/admin/MensajesAdmin';
import ChatAdmin from '../pages/admin/ChatAdmin';
import ConfiguracionAdmin from '../pages/admin/ConfiguracionAdmin';
import PerfilAdmin from '../pages/admin/PerfilAdmin';
import PerfilFormAdmin from '../pages/admin/PerfilFormAdmin';
import MasAdmin from '../pages/admin/MasAdmin';

const Stack = createNativeStackNavigator();

// Rutas web del panel (se usan en el `linking` de App.js)
export const adminLinking = {
  path: 'admin',
  screens: {
    AdminInicio: 'inicio',
    AdminUsuarios: 'usuarios',
    AdminUsuarioDetalle: 'usuarios/:id',
    AdminUsuarioForm: 'usuarios/form',
    AdminCursos: 'cursos',
    AdminCursoDetalle: 'cursos/:id',
    AdminCursoForm: 'cursos/form',
    AdminBiblioteca: 'biblioteca',
    AdminCalendario: 'calendario',
    AdminReportes: 'reportes',
    AdminReporteDetalle: 'reportes/:key',
    AdminMensajes: 'mensajes',
    AdminChat: 'mensajes/:id',
    AdminConfiguracion: 'configuracion',
    AdminPerfil: 'perfil',
    AdminPerfilForm: 'perfil/editar',
    AdminMas: 'mas',
  },
};

export default function AdminNavigator() {
  return (
    <AdminDataProvider>
      <Stack.Navigator initialRouteName="AdminInicio" screenOptions={{ headerShown: false }}>
        {/* Secciones principales */}
        <Stack.Screen name="AdminInicio" component={InicioAdmin} />
        <Stack.Screen name="AdminUsuarios" component={UsuariosAdmin} />
        <Stack.Screen name="AdminCursos" component={CursosAdmin} />
        <Stack.Screen name="AdminBiblioteca" component={BibliotecaAdmin} />
        <Stack.Screen name="AdminCalendario" component={CalendarioAdmin} />
        <Stack.Screen name="AdminReportes" component={ReportesAdmin} />
        <Stack.Screen name="AdminMensajes" component={MensajesAdmin} />
        <Stack.Screen name="AdminConfiguracion" component={ConfiguracionAdmin} />
        <Stack.Screen name="AdminMas" component={MasAdmin} />

        {/* Detalles y formularios */}
        <Stack.Screen name="AdminUsuarioDetalle" component={UsuarioDetalleAdmin} />
        <Stack.Screen name="AdminUsuarioForm" component={UsuarioFormAdmin} />
        <Stack.Screen name="AdminCursoDetalle" component={CursoDetalleAdmin} />
        <Stack.Screen name="AdminCursoForm" component={CursoFormAdmin} />
        <Stack.Screen name="AdminReporteDetalle" component={ReporteDetalleAdmin} />
        <Stack.Screen name="AdminChat" component={ChatAdmin} />
        <Stack.Screen name="AdminPerfil" component={PerfilAdmin} />
        <Stack.Screen name="AdminPerfilForm" component={PerfilFormAdmin} />
      </Stack.Navigator>
    </AdminDataProvider>
  );
}
