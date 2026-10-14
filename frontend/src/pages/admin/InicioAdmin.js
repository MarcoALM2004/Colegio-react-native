import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import AdminDashboard from '../../components/AdminDashboard';
import { useAdminData } from '../../context/AdminDataContext';
import { Card, IconBox, ListRow, PageScroll, SectionHeader } from '../../components/admin/AdminUI';
import { breakpoints, colors, tones } from '../../theme/adminTheme';
import { ROLES } from '../../data/adminMockData';

const saludo = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
};

export default function InicioAdmin() {
  const navigation = useNavigation();
  const { profile, stats, activity } = useAdminData();
  const { width } = useWindowDimensions();
  const isMobile = width < breakpoints.mobile;

  const statCards = [
    {
      label: 'Estudiantes',
      value: stats.estudiantes,
      icon: 'people-outline',
      tone: 'blue',
      route: 'AdminUsuarios',
      params: { filtro: ROLES.ESTUDIANTE },
    },
    {
      label: 'Docentes',
      value: stats.docentes,
      icon: 'school-outline',
      tone: 'green',
      route: 'AdminUsuarios',
      params: { filtro: ROLES.DOCENTE },
    },
    { label: 'Cursos', value: stats.cursos, icon: 'book-outline', tone: 'purple', route: 'AdminCursos' },
    {
      label: 'Usuarios inactivos',
      value: stats.inactivos,
      icon: 'alert-circle-outline',
      tone: 'orange',
      route: 'AdminUsuarios',
      params: { filtro: 'Inactivos' },
    },
  ];

  const quickActions = [
    {
      label: 'Nuevo docente',
      icon: 'person-add-outline',
      tone: 'green',
      onPress: () => navigation.navigate('AdminUsuarioForm', { rol: ROLES.DOCENTE }),
    },
    {
      label: 'Nuevo estudiante',
      icon: 'people-outline',
      tone: 'blue',
      onPress: () => navigation.navigate('AdminUsuarioForm', { rol: ROLES.ESTUDIANTE }),
    },
    {
      label: 'Crear curso',
      icon: 'book-outline',
      tone: 'orange',
      onPress: () => navigation.navigate('AdminCursoForm'),
    },
    {
      label: 'Agregar libro',
      icon: 'library-outline',
      tone: 'purple',
      onPress: () => navigation.navigate('AdminBiblioteca', { agregar: true }),
    },
  ];

  const itemWidth = isMobile ? '48.5%' : '23.8%';

  return (
    <AdminDashboard>
      <PageScroll>
        <Text style={styles.greeting}>
          {saludo()},{'\n'}Admin. {profile.nombres} {profile.apellidos}
        </Text>
        <Text style={styles.subtitle}>Aquí tienes el resumen de hoy.</Text>

        {/* ESTADÍSTICAS */}
        <View style={styles.grid}>
          {statCards.map((s) => (
            <TouchableOpacity
              key={s.label}
              style={[styles.statCard, { width: itemWidth }]}
              onPress={() => navigation.navigate(s.route, s.params)}
            >
              <IconBox icon={s.icon} tone={s.tone} size={42} />
              <View style={styles.statText}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel} numberOfLines={1}>
                  {s.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ACCESOS RÁPIDOS */}
        <SectionHeader title="Accesos rápidos" />
        <View style={styles.grid}>
          {quickActions.map((a) => (
            <TouchableOpacity
              key={a.label}
              style={[styles.quick, { width: itemWidth, backgroundColor: tones[a.tone].soft }]}
              onPress={a.onPress}
            >
              <Ionicons name={a.icon} size={20} color={tones[a.tone].solid} />
              <Text style={[styles.quickText, { color: tones[a.tone].solid }]} numberOfLines={1}>
                {a.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ACTIVIDAD RECIENTE */}
        <SectionHeader title="Actividad reciente" />
        <Card>
          {activity.slice(0, 6).map((a) => (
            <ListRow
              key={a.id}
              left={<IconBox icon={a.icono} tone="blue" size={38} iconSize={18} />}
              title={a.titulo}
              subtitle={a.detalle}
              right={<Text style={styles.time}>{a.fecha}</Text>}
            />
          ))}
        </Card>
      </PageScroll>
    </AdminDashboard>
  );
}

const styles = StyleSheet.create({
  greeting: { fontSize: 22, fontWeight: '700', color: colors.text, lineHeight: 29 },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 4, marginBottom: 18 },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
    marginBottom: 18,
  },
  statCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statText: { flex: 1, minWidth: 0 },
  statValue: { fontSize: 20, fontWeight: '700', color: colors.text },
  statLabel: { fontSize: 11, color: colors.textMuted },

  quick: {
    height: 52,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  quickText: { fontSize: 12, fontWeight: '600', flex: 1 },

  time: { fontSize: 11, color: colors.textMuted },
});
