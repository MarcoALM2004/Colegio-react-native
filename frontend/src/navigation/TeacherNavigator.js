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
  },
};

export default function TeacherNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="TeacherDashboard"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name="TeacherDashboard"
        component={TeacherDashboard}
      />

      <Stack.Screen name="PerfilTeacher">
        {({ navigation }) => (
          <TeacherDashboard>
            <PerfilTeacher navigation={navigation} />
          </TeacherDashboard>
        )}
      </Stack.Screen>

      <Stack.Screen name="CursosTeacher">
        {({ navigation }) => (
          <TeacherDashboard>
            <CursosTeacher navigation={navigation} />
          </TeacherDashboard>
        )}
      </Stack.Screen>

      <Stack.Screen name="CursoDetalleTeacher">
        {({ route, navigation }) => (
          <TeacherDashboard>
            <CursoDetalleTeacher
              route={route}
              navigation={navigation}
            />
          </TeacherDashboard>
        )}
      </Stack.Screen>

      <Stack.Screen name="TareasTeacher">
        {({ navigation }) => (
          <TeacherDashboard>
            <TareasTeacher navigation={navigation} />
          </TeacherDashboard>
        )}
      </Stack.Screen>

      <Stack.Screen name="CalificacionesTeacher">
        {({ navigation }) => (
          <TeacherDashboard>
            <CalificacionesTeacher navigation={navigation} />
          </TeacherDashboard>
        )}
      </Stack.Screen>

      <Stack.Screen name="CalendarioTeacher">
        {({ navigation }) => (
          <TeacherDashboard>
            <CalendarioTeacher navigation={navigation} />
          </TeacherDashboard>
        )}
      </Stack.Screen>

      <Stack.Screen name="MensajesTeacher">
        {({ navigation }) => (
          <TeacherDashboard>
            <MensajesTeacher navigation={navigation} />
          </TeacherDashboard>
        )}
      </Stack.Screen>

      <Stack.Screen name="ConfiguracionTeacher">
        {({ navigation }) => (
          <TeacherDashboard>
            <ConfiguracionTeacher navigation={navigation} />
          </TeacherDashboard>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}