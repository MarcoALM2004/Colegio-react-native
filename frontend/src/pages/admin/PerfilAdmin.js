import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import AdminDashboard from '../../components/AdminDashboard';
import { useAdminData } from '../../context/AdminDataContext';
import { Avatar, Button, Card, InfoRow, PageScroll, StatusBadge, useLogout } from '../../components/admin/AdminUI';
import { colors } from '../../theme/adminTheme';
import { formatearFecha } from '../../utils/adminHelpers';

export default function PerfilAdmin() {
  const navigation = useNavigation();
  const { profile } = useAdminData();
  const logout = useLogout();

  return (
    <AdminDashboard variant="detail" title="Mi perfil">
      <PageScroll>
        <View style={styles.hero}>
          <Avatar nombres={profile.nombres} apellidos={profile.apellidos} tone="blue" size={96} />
          <Text style={styles.name}>
            {profile.nombres} {profile.apellidos}
          </Text>
          <Text style={styles.role}>{profile.rol}</Text>
          <StatusBadge active={profile.activo} />
        </View>

        <Card>
          <InfoRow icon="person-outline" label="Nombre completo" value={`${profile.nombres} ${profile.apellidos}`} />
          <InfoRow icon="mail-outline" label="Correo institucional" value={profile.correo} />
          <InfoRow icon="call-outline" label="Teléfono" value={profile.telefono} />
          <InfoRow icon="shield-outline" label="Rol" value={profile.rol} />
          <InfoRow icon="calendar-outline" label="Fecha de registro" value={formatearFecha(profile.fechaRegistro)} />
        </Card>

        <Button title="Editar perfil" icon="create-outline" onPress={() => navigation.navigate('AdminPerfilForm')} />
        <Button title="Cerrar sesión" icon="log-out-outline" variant="danger" onPress={logout} />
      </PageScroll>
    </AdminDashboard>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: 4, marginBottom: 18 },
  name: { fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 10 },
  role: { fontSize: 13, color: colors.textMuted, marginBottom: 4 },
});
