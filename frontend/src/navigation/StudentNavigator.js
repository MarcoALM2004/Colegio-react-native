import React from 'react';
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
  },
};

export default function StudentNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="StudentDashboard"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name="StudentDashboard"
        component={StudentDashboard}
      />

      <Stack.Screen name="CursosStudent">
        {() => (
          <StudentDashboard>
            <CursosStudent />
          </StudentDashboard>
        )}
      </Stack.Screen>

      <Stack.Screen name="CursoDetalleStudent">
        {({ route, navigation }) => (
          <StudentDashboard>
            <CursoDetalleStudent route={route} navigation={navigation} />
          </StudentDashboard>
        )}
      </Stack.Screen>

      <Stack.Screen name="TareasStudent">
        {() => (
          <StudentDashboard>
            <TareasStudent />
          </StudentDashboard>
        )}
      </Stack.Screen>

      <Stack.Screen name="CalendarioStudent">
        {() => (
          <StudentDashboard>
            <CalendarioStudent />
          </StudentDashboard>
        )}
      </Stack.Screen>

      <Stack.Screen name="CalificacionesStudent">
        {() => (
          <StudentDashboard>
            <CalificacionesStudent />
          </StudentDashboard>
        )}
      </Stack.Screen>

      <Stack.Screen name="MensajesStudent">
        {() => (
          <StudentDashboard>
            <MensajesStudent />
          </StudentDashboard>
        )}
      </Stack.Screen>

      <Stack.Screen name="PerfilStudent">
        {() => (
          <StudentDashboard>
            <PerfilStudent />
          </StudentDashboard>
        )}
      </Stack.Screen>

      <Stack.Screen name="ConfiguracionStudent">
        {() => (
          <StudentDashboard>
            <ConfiguracionStudent />
          </StudentDashboard>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}