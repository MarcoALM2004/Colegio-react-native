import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import AdminDashboard from '../../components/AdminDashboard';
import { useAdminData } from '../../context/AdminDataContext';
import {
  Avatar,
  BottomSheet,
  Card,
  Chips,
  CountBadge,
  EmptyState,
  ListRow,
  PageScroll,
  PageTitle,
  SearchBar,
} from '../../components/admin/AdminUI';
import { colors } from '../../theme/adminTheme';
import { ROLES } from '../../data/adminMockData';
import { ROLE_TONE, normalizar } from '../../utils/adminHelpers';

const FILTROS = [
  { value: 'Todos', label: 'Todos' },
  { value: ROLES.DOCENTE, label: 'Docentes' },
  { value: ROLES.ESTUDIANTE, label: 'Estudiantes' },
  { value: ROLES.ADMIN, label: 'Admin' },
];

export default function MensajesAdmin() {
  const navigation = useNavigation();
  const { conversations, users, getUser, openConversationWith } = useAdminData();

  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('Todos');
  const [nuevo, setNuevo] = useState(false);
  const [busquedaContacto, setBusquedaContacto] = useState('');

  const lista = useMemo(() => {
    const q = normalizar(busqueda.trim());
    return conversations
      .map((c) => ({ ...c, usuario: getUser(c.usuarioId) }))
      .filter((c) => c.usuario)
      .filter((c) => filtro === 'Todos' || c.usuario.rol === filtro)
      .filter((c) => {
        if (!q) return true;
        const ultimo = c.mensajes[c.mensajes.length - 1]?.texto || '';
        return normalizar(`${c.usuario.nombres} ${c.usuario.apellidos} ${ultimo}`).includes(q);
      });
  }, [conversations, busqueda, filtro, getUser]);

  const contactos = useMemo(() => {
    const q = normalizar(busquedaContacto.trim());
    return users.filter((u) => u.activo && (!q || normalizar(`${u.nombres} ${u.apellidos} ${u.rol}`).includes(q)));
  }, [users, busquedaContacto]);

  const abrir = (usuarioId) => {
    setNuevo(false);
    setBusquedaContacto('');
    navigation.navigate('AdminChat', { id: openConversationWith(usuarioId) });
  };

  return (
    <AdminDashboard>
      <PageScroll>
        <PageTitle
          title="Mensajes"
          right={
            <TouchableOpacity style={styles.compose} onPress={() => setNuevo(true)}>
              <Ionicons name="create-outline" size={22} color={colors.primary} />
            </TouchableOpacity>
          }
        />

        <SearchBar value={busqueda} onChangeText={setBusqueda} placeholder="Buscar conversaciones..." />
        <Chips options={FILTROS} value={filtro} onChange={setFiltro} />

        <Card>
          {lista.length === 0 ? (
            <EmptyState icon="chatbubbles-outline" text="No hay conversaciones." />
          ) : (
            lista.map((c) => {
              const ultimo = c.mensajes[c.mensajes.length - 1];
              return (
                <ListRow
                  key={c.id}
                  chevron={false}
                  onPress={() => navigation.navigate('AdminChat', { id: c.id })}
                  left={
                    <Avatar
                      nombres={c.usuario.nombres}
                      apellidos={c.usuario.apellidos}
                      tone={ROLE_TONE[c.usuario.rol]}
                    />
                  }
                  title={`${c.usuario.nombres} ${c.usuario.apellidos}`}
                  subtitle={ultimo ? `${ultimo.deMi ? 'Tú: ' : ''}${ultimo.texto}` : 'Sin mensajes aún'}
                  right={
                    <View style={styles.right}>
                      <Text style={[styles.time, c.noLeidos > 0 && styles.timeUnread]}>{ultimo?.hora || ''}</Text>
                      <CountBadge count={c.noLeidos} />
                    </View>
                  }
                />
              );
            })
          )}
        </Card>
      </PageScroll>

      <BottomSheet visible={nuevo} title="Nuevo mensaje" onClose={() => setNuevo(false)}>
        <SearchBar value={busquedaContacto} onChangeText={setBusquedaContacto} placeholder="Buscar persona..." />
        {contactos.map((u) => (
          <ListRow
            key={u.id}
            left={<Avatar nombres={u.nombres} apellidos={u.apellidos} tone={ROLE_TONE[u.rol]} size={38} />}
            title={`${u.nombres} ${u.apellidos}`}
            subtitle={u.rol}
            onPress={() => abrir(u.id)}
          />
        ))}
      </BottomSheet>
    </AdminDashboard>
  );
}

const styles = StyleSheet.create({
  compose: { padding: 6 },
  right: { alignItems: 'flex-end', gap: 4 },
  time: { fontSize: 11, color: colors.textMuted },
  timeUnread: { color: colors.primary, fontWeight: '700' },
});
