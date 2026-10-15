import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { SchoolDataProvider } from './src/context/SchoolDataContext';

import LoginScreen from './src/components/LoginScreen';

import AdminNavigator, { adminLinking } from './src/navigation/AdminNavigator';
import TeacherNavigator, { teacherLinking } from './src/navigation/TeacherNavigator';
import StudentNavigator, { studentLinking } from './src/navigation/StudentNavigator';

const Stack = createNativeStackNavigator();

const linking = {
  prefixes: [],
  config: {
    screens: {
      Login: '/',
      Student: studentLinking,
      Teacher: teacherLinking,
      Admin: adminLinking,
    }
  },
};

function App() {
  return (
    <SchoolDataProvider>
      <NavigationContainer linking={linking}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>

          {/* LOGIN */}
          <Stack.Screen name="Login" component={LoginScreen} />

          {/* PANEL DEL ESTUDIANTE */}
          <Stack.Screen  name="Student"  component={StudentNavigator} />

          {/* PANEL DEL PROFESOR */}

          <Stack.Screen name="Teacher"  component={TeacherNavigator} />

          {/* PANEL DEL ADMIN (sus pantallas están en src/navigation/AdminNavigator.js) */}
          <Stack.Screen name="Admin" component={AdminNavigator} />

        </Stack.Navigator>
      </NavigationContainer>
    </SchoolDataProvider>
  );
}

export default App;
