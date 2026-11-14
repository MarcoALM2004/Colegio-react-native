import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import AdminDashboard from '../../components/AdminDashboard';
import { useAdminData } from '../../context/AdminDataContext';
import MensajesUI from '../../components/MensajesUI';
import { colors } from '../../theme/adminTheme';

export default function MensajesAdmin() {
  const { profile } = useAdminData();

  const usuarioId = Number(profile?.id);

  // El perfil real se carga desde el backend.
  // No usar el ID simulado "A0001" del mock.
  if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
    return (
      <AdminDashboard>
        <View style={styles.loading}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />
          <Text style={styles.loadingText}>
            Cargando mensajes del administrador...
          </Text>
        </View>
      </AdminDashboard>
    );
  }

  const usuario = {
    ...profile,
    id: usuarioId,
    rol: 'ADMIN',
  };

  return (
    <AdminDashboard>
      <View style={styles.container}>
        <MensajesUI
          title="Mensajes"
          subtitle="Comunícate directamente con todos los docentes."
          usuario={usuario}
          isTeacher={false}
        />
      </View>
    </AdminDashboard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 0,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 14,
  },
});
