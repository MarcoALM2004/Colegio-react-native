
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  useWindowDimensions, KeyboardAvoidingView, ScrollView,
  Platform, ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { login } from '../service/authService';
import logoLogin from '../assets/logo-login.jpg';

export default function LoginScreen({ navigation }) {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  const iniciarSesion = async () => {
    if (!usuario.trim() || !password) {
      setError('Ingresa tu usuario y contraseña.');
      return;
    }

    setCargando(true);
    setError('');

    try {
      const resultado = await login(usuario, password);

      const rutas = {
        teacher: 'TeacherDashboard',
        student: 'StudentDashboard',
        admin: 'Admin',
      };

      const ruta = rutas[resultado.rol];

      if (!ruta) {
        setError('No se reconoce el tipo de usuario.');
        return;
      }

      navigation.navigate(ruta);
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.card, { width: isMobile ? '92%' : 420 }]}>
            <Image
              source={logoLogin}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="Logo de EduConnect"
            />

            <Text style={styles.brand}>EduConnect</Text>
            <Text style={styles.subtitle}>Colegio Salcantay</Text>

            <View style={styles.headingContainer}>
              <Text style={styles.title}>¡Bienvenido de nuevo!</Text>
              <Text style={styles.description}>
                Ingresa tus credenciales para continuar.
              </Text>
            </View>

            <Text style={styles.label}>Usuario</Text>

            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#7B8798" />
              <TextInput
                style={styles.input}
                placeholder="Ej. C232 o E223"
                placeholderTextColor="#9CA7B7"
                value={usuario}
                onChangeText={(value) => {
                  setUsuario(value);
                  setError('');
                }}
                autoCapitalize="characters"
                autoCorrect={false}
                editable={!cargando}
                returnKeyType="next"
              />
            </View>

            <Text style={styles.label}>Contraseña</Text>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#7B8798" />
              <TextInput
                style={styles.input}
                placeholder="Ingresa tu contraseña"
                placeholderTextColor="#9CA7B7"
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  setError('');
                }}
                secureTextEntry={!mostrarPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!cargando}
                returnKeyType="done"
                onSubmitEditing={iniciarSesion}
              />

              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setMostrarPassword(!mostrarPassword)}
                disabled={cargando}
              >
                <Ionicons
                  name={mostrarPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={21}
                  color="#7B8798"
                />
              </TouchableOpacity>
            </View>

            {!!error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={19} color="#DC2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.button, cargando && styles.buttonDisabled]}
              onPress={iniciarSesion}
              disabled={cargando}
              activeOpacity={0.85}
            >
              {cargando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Iniciar sesión</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>

          </View>

          <Text style={styles.copyright}>
            EduConnect · Plataforma educativa
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5FB',
  },
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 30,
    alignItems: 'stretch',
    borderWidth: 1,
    borderColor: '#E8EDF5',
    elevation: 5,
    shadowColor: '#19345C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
  },
  logo: {
    width: 100,
    height: 90,
    alignSelf: 'center',
    marginBottom: 10,
  },
  brand: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1E3A66',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  subtitle: {
    color: '#7B8798',
    textAlign: 'center',
    fontSize: 12,
    marginTop: 5,
  },
  headingContainer: {
    marginTop: 28,
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#202D42',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#7B8798',
    lineHeight: 21,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#344258',
    marginBottom: 9,
  },
  inputContainer: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DFE6F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 19,
    backgroundColor: '#FBFCFE',
  },
  input: {
    flex: 1,
    minWidth: 0,
    height: 50,
    marginLeft: 10,
    color: '#263244',
    fontSize: 14,
  },
  eyeButton: {
    padding: 5,
    marginLeft: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    padding: 11,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    color: '#B91C1C',
    fontSize: 12,
    lineHeight: 18,
  },
  button: {
    minHeight: 52,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  copyright: {
    marginTop: 22,
    fontSize: 11,
    color: '#8A96A8',
    textAlign: 'center',
  },
});
