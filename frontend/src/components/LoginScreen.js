import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen({ navigation }) {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const { width } = useWindowDimensions();

  const isMobile = width < 600;

  const iniciarSesion = async () => {

    if (!email || !password) {
      alert('Completa todos los campos');
      return;
    }

    try {

      const response = await fetch('http://localhost:8080/login' || 'http://10.0.2.2:8080/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
        }
      );

      const resultado = await response.text();

      if (resultado === 'Inicio de sesión correcto') {
        navigation.navigate('StudentDashboard');
      } else {
        alert('Correo o contraseña incorrectos');
      }

    } catch (error) {
      alert('No se pudo conectar con el servidor y no se el por que :v');
      console.log(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      <View
        style={[
          styles.loginBox,
          {
            width: isMobile
              ? '90%'
              : 400,
          },
        ]}
      >

        <Text style={styles.title}>
          Iniciar secion
        </Text>


        {/* CORREO */}

        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />


        {/* CONTRASEÑA */}

        <View style={styles.passwordContainer}>

          <TextInput
            style={styles.passwordInput}
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!mostrarPassword}
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() =>
              setMostrarPassword(!mostrarPassword)
            }
          >

            <Ionicons
              name={
                mostrarPassword
                  ? 'eye-outline'
                  : 'eye-off-outline'
              }
              size={21}
              color="#718096"
            />

          </TouchableOpacity>

        </View>


        {/* BOTÓN */}

        <TouchableOpacity
          style={styles.button}
          onPress={iniciarSesion}
        >

          <Text style={styles.buttonText}>
            Iniciar sesión
          </Text>

        </TouchableOpacity>

      </View>

    </SafeAreaView>
  );
}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FB',
  },


  loginBox: {
    alignItems: 'stretch',
  },


  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#263244',
  },


  input: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#D9DEE8',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
  },


  /* CONTRASEÑA */

  passwordContainer: {
    width: '100%',
    height: 48,
    position: 'relative',
    marginBottom: 15,
  },


  passwordInput: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#D9DEE8',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingRight: 45,
    backgroundColor: '#FFFFFF',
  },


  eyeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 45,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },


  /* BOTÓN */

  button: {
    width: '100%',
    height: 48,
    backgroundColor: '#2563EB',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },


  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

});