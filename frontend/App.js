
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { SchoolDataProvider } from './src/context/SchoolDataContext';
import LoginScreen from './src/components/LoginScreen';

import AdminNavigator, {
  adminLinking,
} from './src/navigation/AdminNavigator';

import TeacherNavigator, {
  teacherLinking,
} from './src/navigation/TeacherNavigator';

import StudentNavigator, {
  studentLinking,
} from './src/navigation/StudentNavigator';

const Stack = createNativeStackNavigator();

const linking = {
  prefixes: [],
  config: {
    screens: {
      Login: '/',
      Student: studentLinking,
      Teacher: teacherLinking,
      Admin: adminLinking,
    },
  },
};

export default function App() {
  useEffect(() => {
    if (Platform.OS === 'android') {
      import('expo-navigation-bar')
        .then((NavigationBar) => {
          const setBackground =
            NavigationBar.setBackgroundColorAsync;
          const setButtonStyle =
            NavigationBar.setButtonStyleAsync;

          if (typeof setBackground === 'function') {
            setBackground('#000000').catch(() => {});
          }

          if (typeof setButtonStyle === 'function') {
            setButtonStyle('light').catch(() => {});
          }
        })
        .catch(() => {});
    }
  }, []);

  return (
    <SchoolDataProvider>
      <NavigationContainer linking={linking}>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen
            name="Login"
            component={LoginScreen}
          />

          <Stack.Screen
            name="Student"
            component={StudentNavigator}
          />

          <Stack.Screen
            name="Teacher"
            component={TeacherNavigator}
          />

          <Stack.Screen
            name="Admin"
            component={AdminNavigator}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SchoolDataProvider>
  );
}
