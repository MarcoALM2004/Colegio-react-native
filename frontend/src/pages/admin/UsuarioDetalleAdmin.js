import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import AdminDashboard from '../../components/AdminDashboard';
import { useAdminData } from '../../context/AdminDataContext';
import {
  ActionSheet,
  Avatar,
  Button,
  Card,
  EmptyState,
  IconBox,
  InfoRow,
  ListRow,
  PageScroll,
  StatusBadge,
  UnderlineTabs,
  confirmAction,
  notify,
} from '../../components/admin/AdminUI';
import { colors } from '../../theme/adminTheme';
import { ROLES } from '../../data/adminMockData';
import { ROLE_TONE, formatearFecha } from '../../utils/adminHelpers';

const TABS = ['Información', 'Académico', 'Historial'];

export default function UsuarioDetalleAdmin() {
  const navigation = useNavigation();
  const { id } = useRoute().params || {};
  const data = useAdminData();
  const { getUser, getCourse, courseName, courses, activity } = data;

  const [tab, setTab] = useState(TABS[0]);
  const [menu, setMenu] = useState(false);

  const user = getUser(id);

  if (!user) {
    return (
      <AdminDashboard variant="detail" title="Usuario">
        <EmptyState icon="person-outline" text="El usuario no existe o fue eliminado." />
      </AdminDashboard>
    );
  }

  const nombreCompleto = `${user.nombres} ${user.apellidos}`;
  const curso = getCourse(user.cursoId);
  const tutor = curso ? getUser(curso.docenteId) : null;
  const cursosDocente = courses.filter((c) => c.docenteId === user.id);
  const historial = activity.filter((a) => a.detalle.includes(nombreCompleto));

  const restablecer = () =>
    confirmAction(
      'Restablecer contraseña',
      `Se enviará un enlace de restablecimiento a ${user.correo}.`,
      () => {
        data.resetPassword(user.id);
        notify('Listo', 'Se envió el enlace de restablecimiento.');
      },
      'Enviar'
    );

  const acciones = [
    {
      label: 'Enviar mensaje',
      icon: 'chatbubble-outline',
      onPress: () => navigation.navigate('AdminChat', { id: data.openConversationWith(user.id) }),
    },
    {
      label: user.activo ? 'Desactivar cuenta' : 'Activar cuenta',
      icon: user.activo ? 'pause-circle-outline' : 'play-circle-outline',
      onPress: () => data.toggleUserActive(user.id),
    },
    {
      label: 'Eliminar usuario',
      icon: 'trash-outline',
      danger: true,
      onPress: () =>
        confirmAction(
          'Eliminar usuario',
          `¿Seguro que deseas eliminar a ${nombreCompleto}?`,
          () => {
            data.deleteUser(user.id);
            navigation.goBack();
          },
          'Eliminar'
        ),
    },
  ];

  return (
    <AdminDashboard
      variant="detail"
      title="Detalle de usuario"
      headerRight={
        <TouchableOpacity onPress={() => setMenu(true)} style={styles.headerBtn}>
          <Ionicons name="ellipsis-vertical" size={20} color={colors.textStrong} />
        </TouchableOpacity>
      }
    >
      <PageScroll>
        {/* CABECERA */}
        <View style={styles.profile}>
          <Avatar nombres={user.nombres} apellidos={user.apellidos} tone={ROLE_TONE[user.rol]} size={72} />
          <View style={styles.profileText}>
            <Text style={styles.name}>{nombreCompleto}</Text>
            <Text style={styles.role}>{user.rol}</Text>
            <StatusBadge active={user.activo} />
          </View>
        </View>

        {/* PESTAÑAS */}
        <UnderlineTabs tabs={TABS} value={tab} onChange={setTab} />

        {tab === 'Información' && (
          <Card>
            <InfoRow icon="person-outline" label="Código de usuario" value={user.codigo} />
            <InfoRow icon="mail-outline" label="Correo institucional" value={user.correo} />
            <InfoRow icon="document-text-outline" label="Documento" value={user.documento} />
            {user.rol === ROLES.ESTUDIANTE ? (
              <InfoRow icon="people-outline" label="Grado y sección" value={courseName(curso)} />
            ) : (
              <InfoRow
                icon="briefcase-outline"
                label={user.rol === ROLES.DOCENTE ? 'Especialidad' : 'Área'}
                value={user.detalle}
              />
            )}
            <InfoRow icon="calendar-outline" label="Fecha de registro" value={formatearFecha(user.fechaRegistro)} />
          </Card>
        )}

        {tab === 'Académico' && user.rol === ROLES.ESTUDIANTE && (
          <Card>
            <InfoRow icon="school-outline" label="Curso" value={courseName(curso)} />
            <InfoRow
              icon="person-outline"
              label="Tutor"
              value={tutor ? `Prof. ${tutor.nombres} ${tutor.apellidos}` : 'Sin asignar'}
            />
            {curso?.horario.map((h) => (
              <InfoRow
                key={`${h.dia}-${h.hora}`}
                icon="time-outline"
                label={`${h.dia} · ${h.hora}`}
                value={h.materia}
              />
            ))}
          </Card>
        )}

        {tab === 'Académico' && user.rol !== ROLES.ESTUDIANTE && (
          <Card>
            {cursosDocente.length === 0 ? (
              <EmptyState icon="book-outline" text="No tiene cursos a cargo." />
            ) : (
              cursosDocente.map((c) => (
                <ListRow
                  key={c.id}
                  left={<IconBox icon="book-outline" tone={c.tono} size={38} iconSize={18} />}
                  title={courseName(c)}
                  subtitle={`${data.courseStudentCount(c)} estudiantes`}
                  onPress={() => navigation.navigate('AdminCursoDetalle', { id: c.id })}
                />
              ))
            )}
          </Card>
        )}

        {tab === 'Historial' && (
          <Card>
            {historial.map((h) => (
              <ListRow
                key={h.id}
                left={<IconBox icon={h.icono} size={38} iconSize={18} />}
                title={h.titulo}
                subtitle={h.fecha}
              />
            ))}
            <ListRow
              left={<IconBox icon="flag-outline" tone="green" size={38} iconSize={18} />}
              title="Cuenta creada"
              subtitle={formatearFecha(user.fechaRegistro)}
            />
          </Card>
        )}

        <Button title="Editar usuario" onPress={() => navigation.navigate('AdminUsuarioForm', { id: user.id })} />
        <Button title="Restablecer contraseña" variant="danger" onPress={restablecer} />
      </PageScroll>

      <ActionSheet visible={menu} title={nombreCompleto} actions={acciones} onClose={() => setMenu(false)} />
    </AdminDashboard>
  );
}

const styles = StyleSheet.create({
  headerBtn: { padding: 6 },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 18 },
  profileText: { flex: 1, gap: 4 },
  name: { fontSize: 20, fontWeight: '700', color: colors.text },
  role: { fontSize: 13, color: colors.textMuted },
});
