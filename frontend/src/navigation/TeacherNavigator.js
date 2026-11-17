import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TeacherDashboard from '../components/TeacherDashboard';
import CursosTeacher from '../pages/CursosTeacher';
import CursoDetalleTeacher from '../pages/CursoDetalleTeacher';
import TareasTeacher from '../pages/TareasTeacher';
import CalificacionesTeacher from '../pages/CalificacionesTeacher';
import CalendarioTeacher from '../pages/CalendarioTeacher';
import MensajesTeacher from '../pages/MensajesTeacher';
import ConfiguracionTeacher from '../pages/ConfiguracionTeacher';
import PerfilTeacher from '../pages/PerfilTeacher';
import Notificaciones from '../pages/Notificaciones';

const Stack = createNativeStackNavigator();

export const teacherLinking = {
  path: 'teacher',
  screens: {
    TeacherDashboard: 'inicio',
    PerfilTeacher: 'perfil',
    CursosTeacher: 'cursos',
    CursoDetalleTeacher: 'cursos/:id',
    TareasTeacher: 'tareas',
    CalificacionesTeacher: 'calificaciones',
    CalendarioTeacher: 'calendario',
    MensajesTeacher: 'mensajes',
    ConfiguracionTeacher: 'configuracion',
    Notificaciones: 'notificaciones',
  },
};

export default function TeacherNavigator({ route }) {
  const usuario = route?.params?.usuario;

  return (
    <Stack.Navigator
      initialRouteName="TeacherDashboard"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="TeacherDashboard">
        {() => <TeacherDashboard usuario={usuario} />}
      </Stack.Screen>

      <Stack.Screen name="PerfilTeacher">
        {({ navigation }) => (
          <TeacherDashboard usuario={usuario}>
            <PerfilTeacher
              navigation={navigation}
              usuarioInicial={usuario}
            />
          </TeacherDashboard>
        )}
      </Stack.Screen>

      <Stack.Screen name="CursosTeacher">
        {({ navigation }) => (
          <TeacherDashboard usuario={usuario}>
            <CursosTeacher
              navigation={navigation}
              usuario={usuario}
            />
          </TeacherDashboard>
        )}
      </Stack.Screen>

      <Stack.Screen name="CursoDetalleTeacher">
        {({ route: screenRoute, navigation }) => (
          <TeacherDashboard usuario={usuario}>
            <CursoDetalleTeacher
              route={screenRoute}
              navigation={navigation}
            />
          </TeacherDashboard>
        )}
      </Stack.Screen>

      <Stack.Screen name="TareasTeacher">
        {({ navigation }) => (
          <TeacherDashboard usuario={usuario}>
            <TareasTeacher navigation={navigation} />
          </TeacherDashboard>
        )}
      </Stack.Screen>

      <Stack.Screen name="CalificacionesTeacher">
        {({ navigation }) => (
          <TeacherDashboard usuario={usuario}>
            <CalificacionesTeacher
              navigation={navigation}
              usuario={usuario}
            />
          </TeacherDashboard>
        )}
      </Stack.Screen>

      <Stack.Screen name="CalendarioTeacher">
        {({ navigation }) => (
          <TeacherDashboard usuario={usuario}>
            <CalendarioTeacher navigation={navigation} />
          </TeacherDashboard>
        )}
      </Stack.Screen>

      <Stack.Screen name="MensajesTeacher">
        {({ navigation }) => (
          <TeacherDashboard usuario={usuario}>
            <MensajesTeacher
              navigation={navigation}
              usuario={usuario}
            />
          </TeacherDashboard>
        )}
      </Stack.Screen>

      <Stack.Screen name="ConfiguracionTeacher">
        {({ navigation }) => (
          <TeacherDashboard usuario={usuario}>
            <ConfiguracionTeacher navigation={navigation} />
          </TeacherDashboard>
        )}
      </Stack.Screen>

      <Stack.Screen name="Notificaciones">
        {({ navigation }) => (
          <TeacherDashboard usuario={usuario}>
            <Notificaciones
              navigation={navigation}
              usuario={usuario}
            />
          </TeacherDashboard>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
