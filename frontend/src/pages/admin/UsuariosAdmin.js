import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import AdminDashboard from '../../components/AdminDashboard';
import { useAdminData } from '../../context/AdminDataContext';
import {
  ActionSheet,
  Avatar,
  Card,
  Chips,
  EmptyState,
  ListRow,
  PageScroll,
  PageTitle,
  SearchBar,
  StatusBadge,
  confirmAction,
} from '../../components/admin/AdminUI';
import { colors } from '../../theme/adminTheme';
import { ROLES } from '../../data/adminMockData';
import { ROLE_TONE, normalizar } from '../../utils/adminHelpers';

const FILTROS = [
  { value: 'Todos', label: 'Todos' },
  { value: ROLES.ESTUDIANTE, label: 'Estudiantes' },
  { value: ROLES.DOCENTE, label: 'Docentes' },
  { value: ROLES.ADMIN, label: 'Admin' },
  { value: 'Inactivos', label: 'Inactivos' },
];

export default function UsuariosAdmin() {
  const navigation = useNavigation();
  const route = useRoute();
  const { users, getCourse, courseShortName, toggleUserActive, deleteUser, openConversationWith } = useAdminData();

  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState(route.params?.filtro || 'Todos');
  const [seleccionado, setSeleccionado] = useState(null);

  // Si llegan desde el inicio con un filtro, aplicarlo
  useEffect(() => {
    if (route.params?.filtro) setFiltro(route.params.filtro);
  }, [route.params?.filtro]);

  const lista = useMemo(() => {
    const q = normalizar(busqueda.trim());
    return users.filter((u) => {
      if (filtro === 'Inactivos' && u.activo) return false;
      if (filtro !== 'Todos' && filtro !== 'Inactivos' && u.rol !== filtro) return false;
      if (!q) return true;
      return normalizar(`${u.nombres} ${u.apellidos} ${u.codigo} ${u.correo}`).includes(q);
    });
  }, [users, busqueda, filtro]);

  const detalleDe = (u) => {
    if (u.rol === ROLES.ESTUDIANTE) return courseShortName(getCourse(u.cursoId)) || 'Sin curso';
    return u.detalle;
  };

  const acciones = seleccionado
    ? [
        {
          label: 'Ver detalle',
          icon: 'eye-outline',
          onPress: () => navigation.navigate('AdminUsuarioDetalle', { id: seleccionado.id }),
        },
        {
          label: 'Editar',
          icon: 'create-outline',
          onPress: () => navigation.navigate('AdminUsuarioForm', { id: seleccionado.id }),
        },
        {
          label: 'Enviar mensaje',
          icon: 'chatbubble-outline',
          onPress: () => navigation.navigate('AdminChat', { id: openConversationWith(seleccionado.id) }),
        },
        {
          label: seleccionado.activo ? 'Desactivar' : 'Activar',
          icon: seleccionado.activo ? 'pause-circle-outline' : 'play-circle-outline',
          onPress: () => toggleUserActive(seleccionado.id),
        },
        {
          label: 'Eliminar',
          icon: 'trash-outline',
          danger: true,
          onPress: () =>
            confirmAction(
              'Eliminar usuario',
              `¿Seguro que deseas eliminar a ${seleccionado.nombres} ${seleccionado.apellidos}?`,
              () => deleteUser(seleccionado.id),
              'Eliminar'
            ),
        },
      ]
    : [];

  return (
    <AdminDashboard>
      <PageScroll>
        <PageTitle
          title="Usuarios"
          actionLabel="Nuevo usuario"
          onAction={() => navigation.navigate('AdminUsuarioForm')}
        />

        <SearchBar value={busqueda} onChangeText={setBusqueda} placeholder="Buscar por nombre, código o correo..." />
        <Chips options={FILTROS} value={filtro} onChange={setFiltro} />

        <Card>
          {lista.length === 0 ? (
            <EmptyState text="No se encontraron usuarios." />
          ) : (
            lista.map((u) => (
              <ListRow
                key={u.id}
                onPress={() => navigation.navigate('AdminUsuarioDetalle', { id: u.id })}
                chevron={false}
                left={<Avatar nombres={u.nombres} apellidos={u.apellidos} tone={ROLE_TONE[u.rol]} />}
                title={`${u.nombres} ${u.apellidos}`}
                subtitle={`${u.rol} · ${u.codigo}`}
                meta={detalleDe(u)}
                right={
                  <View style={styles.right}>
                    <StatusBadge active={u.activo} />
                    <TouchableOpacity style={styles.more} onPress={() => setSeleccionado(u)}>
                      <Ionicons name="ellipsis-vertical" size={18} color={colors.icon} />
                    </TouchableOpacity>
                  </View>
                }
              />
            ))
          )}
        </Card>

        <ActionSheet
          visible={!!seleccionado}
          title={seleccionado ? `${seleccionado.nombres} ${seleccionado.apellidos}` : ''}
          actions={acciones}
          onClose={() => setSeleccionado(null)}
        />
      </PageScroll>
    </AdminDashboard>
  );
}

const styles = StyleSheet.create({
  right: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  more: { padding: 6 },
});
