import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';

import CursosCompartidos from '../components/CursosCompartidos';
import { listarMisCursos } from '../service/cursosService';

export default function CursosStudent({ navigation, usuario }) {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargarCursos = useCallback(async () => {
    try {
      setError('');
      setLoading(true);

      const datos = await listarMisCursos();
      setCursos(datos);
    } catch (e) {
      setError(e.message || 'No se pudieron cargar tus cursos.');
      setCursos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarCursos();
  }, [cargarCursos, usuario?.id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.message}>Cargando tus cursos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={cargarCursos}
        >
          <Text style={styles.retryText}>Volver a intentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <CursosCompartidos
      navigation={navigation}
      cursos={cursos}
      rol="estudiante"
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: '#F5F7FB',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  message: {
    marginTop: 12,
    fontSize: 13,
    color: '#64748B',
  },
  error: {
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 9,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
