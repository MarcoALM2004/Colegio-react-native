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
    <Stack.Navigator initialRouteName="TeacherDashboard" screenOptions={{ headerShown: false }} >
      
      <Stack.Screen name="TeacherDashboard" component={TeacherDashboard} />
      <Stack.Screen name="PerfilTeacher">
        {() => (
          <TeacherDashboard>
            <PerfilTeacher />
          </TeacherDashboard>
        )}
      </Stack.Screen>

      <Stack.Screen name="CursosTeacher">
        {() => (
          <TeacherDashboard>
            <CursosTeacher />
          </TeacherDashboard>
        )}
      </Stack.Screen>

      <Stack.Screen name="CursoDetalleTeacher">
        {({ route, navigation }) => (
          <TeacherDashboard>
            <CursoDetalleTeacher route={route} navigation={navigation} />
          </TeacherDashboard>
        )}
      </Stack.Screen>

      <Stack.Screen name="TareasTeacher">
        {() => (
          <TeacherDashboard>
            <TareasTeacher />
          </TeacherDashboard>
        )}
      </Stack.Screen>

      <Stack.Screen name="CalificacionesTeacher">
        {() => (
          <TeacherDashboard>
            <CalificacionesTeacher />
          </TeacherDashboard>
        )}
      </Stack.Screen>

      <Stack.Screen name="CalendarioTeacher">
        {() => (
          <TeacherDashboard>
            <CalendarioTeacher />
          </TeacherDashboard>
        )}
      </Stack.Screen>

      <Stack.Screen name="MensajesTeacher">
        {() => (
          <TeacherDashboard>
            <MensajesTeacher />
          </TeacherDashboard>
        )}
      </Stack.Screen>

      <Stack.Screen name="ConfiguracionTeacher">
        {() => (
          <TeacherDashboard>
            <ConfiguracionTeacher />
          </TeacherDashboard>
        )}
      </Stack.Screen>
      
    </Stack.Navigator>
  );
}