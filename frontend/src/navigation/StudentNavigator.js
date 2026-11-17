import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import StudentDashboard from '../components/StudentDashboard';
import CursosStudent from '../pages/CursosStudent';
import CursoDetalleStudent from '../pages/CursoDetalleStudent';
import TareasStudent from '../pages/TareasStudent';
import CalendarioStudent from '../pages/CalendarioStudent';
import CalificacionesStudent from '../pages/CalificacionesStudent';
import MensajesStudent from '../pages/MensajesStudent';
import PerfilStudent from '../pages/PerfilStudent';
import ConfiguracionStudent from '../pages/ConfiguracionStudent';
import Notificaciones from '../pages/Notificaciones';

import { registrarNotificaciones } from '../service/notificacionService';

const Stack = createNativeStackNavigator();

export const studentLinking = {
  path: 'student',
  screens: {
    StudentDashboard: 'inicio',
    CursosStudent: 'cursos',
    CursoDetalleStudent: 'cursos/:id',
    TareasStudent: 'tareas',
    CalendarioStudent: 'calendario',
    CalificacionesStudent: 'calificaciones',
    MensajesStudent: 'mensajes',
    PerfilStudent: 'perfil',
    ConfiguracionStudent: 'configuracion',
    Notificaciones: 'notificaciones',
  },
};

export default function StudentNavigator({ route }) {
  const usuario = route?.params?.usuario;

  useEffect(() => {
    if (usuario?.id) {
      registrarNotificaciones(usuario.id).catch((error) => {
        console.warn(
          'No se pudo registrar el dispositivo:',
          error.message
        );
      });
    }
  }, [usuario?.id]);

  return (
    <Stack.Navigator
      initialRouteName="StudentDashboard"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="StudentDashboard">
        {() => <StudentDashboard usuario={usuario} />}
      </Stack.Screen>

      <Stack.Screen name="CursosStudent">
        {({ navigation }) => (
          <StudentDashboard usuario={usuario}>
            <CursosStudent
              navigation={navigation}
              usuario={usuario}
            />
          </StudentDashboard>
        )}
      </Stack.Screen>

      <Stack.Screen name="CursoDetalleStudent">
        {({ route: screenRoute, navigation }) => (
          <StudentDashboard usuario={usuario}>
            <CursoDetalleStudent
              route={screenRoute}
              navigation={navigation}
            />
          </StudentDashboard>
        )}
      </Stack.Screen>

      <Stack.Screen name="TareasStudent">
        {({ navigation }) => (
          <StudentDashboard usuario={usuario}>
            <TareasStudent navigation={navigation} />
          </StudentDashboard>
        )}
      </Stack.Screen>

      <Stack.Screen name="CalendarioStudent">
        {({ navigation }) => (
          <StudentDashboard usuario={usuario}>
            <CalendarioStudent navigation={navigation} />
          </StudentDashboard>
        )}
      </Stack.Screen>

      <Stack.Screen name="CalificacionesStudent">
        {({ navigation }) => (
          <StudentDashboard usuario={usuario}>
            <CalificacionesStudent navigation={navigation} />
          </StudentDashboard>
        )}
      </Stack.Screen>

      <Stack.Screen name="MensajesStudent">
        {({ navigation }) => (
          <StudentDashboard usuario={usuario}>
            <MensajesStudent
              navigation={navigation}
              usuario={usuario}
            />
          </StudentDashboard>
        )}
      </Stack.Screen>

      <Stack.Screen name="PerfilStudent">
        {({ navigation }) => (
          <StudentDashboard usuario={usuario}>
            <PerfilStudent
              navigation={navigation}
              usuarioInicial={usuario}
            />
          </StudentDashboard>
        )}
      </Stack.Screen>

      <Stack.Screen name="ConfiguracionStudent">
        {({ navigation }) => (
          <StudentDashboard usuario={usuario}>
            <ConfiguracionStudent
              navigation={navigation}
              usuarioInicial={usuario}
            />
          </StudentDashboard>
        )}
      </Stack.Screen>

      <Stack.Screen name="Notificaciones">
        {({ navigation }) => (
          <StudentDashboard usuario={usuario}>
            <Notificaciones
              navigation={navigation}
              usuario={usuario}
            />
          </StudentDashboard>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
