
import React, { useEffect } from 'react';
import { Platform, StatusBar } from 'react-native';

import {NavigationContainer} from '@react-navigation/native';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {  SafeAreaProvider,  SafeAreaView} from 'react-native-safe-area-context';

import { SchoolDataProvider } from './src/context/SchoolDataContext';
import LoginScreen from './src/components/LoginScreen';

import AdminNavigator, {adminLinking} from './src/navigation/AdminNavigator';
import TeacherNavigator, {teacherLinking} from './src/navigation/TeacherNavigator';
import StudentNavigator, { studentLinking} from './src/navigation/StudentNavigator';

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
        .then(async (NavigationBar) => {
          await NavigationBar.setPositionAsync('relative');

          await NavigationBar.setBackgroundColorAsync('#F2F5FA');

          await NavigationBar.setButtonStyleAsync('dark');
        })
        .catch((error) => {
          console.warn('Error configurando navegación Android:', error);
        });
    }
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F2F5FA"
        translucent={false}
      />

      <SafeAreaView
        style={{ flex: 1, backgroundColor: '#F2F5FA' }}
        edges={['top', 'bottom']}
      >
        <SchoolDataProvider>
          <NavigationContainer linking={linking}>
            <Stack.Navigator
              initialRouteName="Login"
              screenOptions={{
                headerShown: false,
                contentStyle: {
                  backgroundColor: '#F2F5FA',
                },
              }}
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
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
