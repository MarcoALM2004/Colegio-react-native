import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './src/components/LoginScreen';
import StudentDashboard from './src/components/StudentDashboard';

import CursoStudent from './src/pages/CursosStudent';

const Stack = createNativeStackNavigator();

const linking = {
  prefixes: [],
  config: {
    screens: {
      Login: '/',
      StudentDashboard: '/StudentDashboard/inicio',
      CursosStudent: '/StudentDashboard/cursostudent',
    },
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

        {/* PANEL DEL ADMIN */}

      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;