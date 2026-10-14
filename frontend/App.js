import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './src/components/LoginScreen';
import StudentDashboard from './src/components/StudentDashboard';
import TeacherDashboard from './src/components/TeacherDashboard';

import CursoStudent from './src/pages/CursosStudent';

import CursosTeacher from './src/pages/CursosTeacher';
import TareasTeacher from "./src/pages/TareasTeacher";
import CalificacionesTeacher from './src/pages/CalificacionesTeacher';
import CalendarioTeacher from "./src/pages/CalendarioTeacher";
import MensajesTeacher from "./src/pages/MensajesTeacher";
import ConfiguracionTeacher from './src/pages/ConfiguracionTeacher';

import AdminNavigator, { adminLinking } from './src/navigation/AdminNavigator';

const Stack = createNativeStackNavigator();

const linking = {
  prefixes: [],
  config: {
    screens: {
      Login: '/',
      StudentDashboard: '/StudentDashboard/inicio',
      CursosStudent: '/StudentDashboard/cursostudent',

      TeacherDashboard: '/TeacherDashboard/inicio',
      CursosTeacher: '/TeacherDashboard/cursosteacher',
      AsistenciaTeacher: '/TeacherDashboard/asistenciaTeacher',
      TareasTeacher: "/TeacherDashboard/tareasteacher",
      CalificacionesTeacher: "/TeacherDashboard/calificacionesTeacher",
      CalendarioTeacher:'/TeacherDashboard/calendarioTeacher',
      MensajesTeacher:'/TeacherDashboard/mensajesTeacher',
      ConfiguracionTeacher:'/TeacherDashboard/configuracionTeacher',

      Admin: adminLinking,
    }
  },
};

function App() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>

        {/* LOGIN */}
        <Stack.Screen name="Login" component={LoginScreen}  />

        {/* PANEL DEL ESTUDIANTE */}
        <Stack.Screen  name="StudentDashboard"  component={StudentDashboard} />
        <Stack.Screen  name="CursosStudent">
          {() => (
            <StudentDashboard>
              <CursoStudent />
            </StudentDashboard>
          )}
        </Stack.Screen>

        {/* PANEL DEL PROFESOR */}

        <Stack.Screen name="TeacherDashboard" component={TeacherDashboard} />

        <Stack.Screen name="CursosTeacher">
          {() => (
            <TeacherDashboard>
              <CursosTeacher />
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

        <Stack.Screen name="CalendarioTeacher">
          {() => (
            <TeacherDashboard>
              <CalendarioTeacher />
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


        {/* PANEL DEL ADMIN (sus pantallas están en src/navigation/AdminNavigator.js) */}
        <Stack.Screen name="Admin" component={AdminNavigator} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
