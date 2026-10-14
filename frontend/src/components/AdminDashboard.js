import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import logoAlcantay from '../image/logosalcantay.png';
import { useAdminData } from '../context/AdminDataContext';
import { breakpoints, colors } from '../theme/adminTheme';
import { Avatar } from './admin/AdminUI';

// Opciones del menú lateral (pantallas anchas).
const SIDEBAR_ITEMS = [
  { route: 'AdminInicio', label: 'Inicio', icon: 'grid' },
  { route: 'AdminUsuarios', label: 'Usuarios', icon: 'people-outline' },
  { route: 'AdminCursos', label: 'Cursos', icon: 'book-outline' },
  { route: 'AdminBiblioteca', label: 'Biblioteca', icon: 'library-outline' },
  { route: 'AdminCalendario', label: 'Calendario', icon: 'calendar-outline' },
  { route: 'AdminReportes', label: 'Reportes', icon: 'bar-chart-outline' },
  { route: 'AdminMensajes', label: 'Mensajes', icon: 'chatbubble-outline' },
];

// Barra inferior (móvil). Lo que no entra aquí está en "Más".
const TAB_ITEMS = [
  { route: 'AdminInicio', label: 'Inicio', icon: 'home' },
  { route: 'AdminUsuarios', label: 'Usuarios', icon: 'people' },
  { route: 'AdminCursos', label: 'Cursos', icon: 'book' },
  { route: 'AdminReportes', label: 'Reportes', icon: 'bar-chart' },
  { route: 'AdminMas', label: 'Más', icon: 'menu' },
];

// Pantallas secundarias que deben resaltar una opción del menú.
const PARENT_ROUTE = {
  AdminUsuarioDetalle: 'AdminUsuarios',
  AdminUsuarioForm: 'AdminUsuarios',
  AdminCursoDetalle: 'AdminCursos',
  AdminCursoForm: 'AdminCursos',
  AdminReporteDetalle: 'AdminReportes',
  AdminChat: 'AdminMensajes',
  AdminBiblioteca: 'AdminMas',
  AdminCalendario: 'AdminMas',
  AdminMensajes: 'AdminMas',
  AdminConfiguracion: 'AdminMas',
  AdminPerfil: 'AdminMas',
  AdminPerfilForm: 'AdminMas',
};

/**
 * Layout del panel de administrador.
 * - variant="main":   cabecera con logo (pantallas principales).
 * - variant="detail": cabecera con botón atrás y título (detalles y formularios).
 */
export default function AdminDashboard({ children, variant = 'main', title, headerRight }) {
  const navigation = useNavigation();
  const route = useRoute();
  const { profile, stats } = useAdminData();

  const { width } = useWindowDimensions();
  const isMobile = width < breakpoints.mobile;
  const compactSidebar = width < breakpoints.desktop;

  const current = route.name;
  const tabActive = TAB_ITEMS.some((t) => t.route === current) ? current : PARENT_ROUTE[current];

  // Las secciones principales se comportan como pestañas: se reinicia la pila
  // (Inicio queda debajo para que "atrás" vuelva al inicio).
  const irASeccion = (name) => {
    if (name === current) return;
    navigation.reset({
      index: name === 'AdminInicio' ? 0 : 1,
      routes: name === 'AdminInicio' ? [{ name }] : [{ name: 'AdminInicio' }, { name }],
    });
  };

  const goBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('AdminInicio');
  };

  /* ---------- Cabecera ---------- */

  const header =
    variant === 'detail' ? (
      <View style={[styles.header, styles.headerDetail]}>
        <TouchableOpacity style={styles.iconButton} onPress={goBack}>
          <Ionicons name="chevron-back" size={24} color={colors.textStrong} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.headerRight}>{headerRight}</View>
      </View>
    ) : (
      <View style={[styles.header, { paddingHorizontal: isMobile ? 12 : 28 }]}>
        <Image
          source={logoAlcantay}
          style={{ width: isMobile ? 100 : 120, height: isMobile ? 42 : 50 }}
          resizeMode="contain"
        />
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton} onPress={() => irASeccion('AdminMensajes')}>
            <Ionicons name="notifications-outline" size={22} color="#718096" />
            {stats.mensajesNoLeidos > 0 && <View style={styles.dot} />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.userArea} onPress={() => navigation.navigate('AdminPerfil')}>
            <Avatar nombres={profile.nombres} apellidos={profile.apellidos} tone="blue" size={38} />
            {!compactSidebar && (
              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {profile.nombres} {profile.apellidos}
                </Text>
                <Text style={styles.userRole}>{profile.rol}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );

  /* ---------- Menú lateral (tablet / escritorio) ---------- */

  const sidebar = !isMobile && (
    <View style={[styles.sidebar, { width: compactSidebar ? 70 : 235, paddingHorizontal: compactSidebar ? 8 : 16 }]}>
      {!compactSidebar && <Text style={styles.logo}>Salcantay Admin</Text>}

      <View style={styles.menu}>
        {SIDEBAR_ITEMS.map((item) => {
          const active = current === item.route || PARENT_ROUTE[current] === item.route;
          return (
            <SidebarButton
              key={item.route}
              item={item}
              active={active}
              compact={compactSidebar}
              onPress={() => irASeccion(item.route)}
            />
          );
        })}
      </View>

      <View style={styles.sidebarBottom}>
        <SidebarButton
          item={{ label: 'Configuración', icon: 'settings-outline' }}
          active={current === 'AdminConfiguracion'}
          compact={compactSidebar}
          onPress={() => irASeccion('AdminConfiguracion')}
        />
      </View>
    </View>
  );

  /* ---------- Barra inferior (móvil) ---------- */

  const tabBar = isMobile && variant === 'main' && (
    <View style={styles.tabBar}>
      {TAB_ITEMS.map((item) => {
        const active = tabActive === item.route;
        return (
          <TouchableOpacity key={item.route} style={styles.tab} onPress={() => irASeccion(item.route)}>
            <Ionicons
              name={active ? item.icon : `${item.icon}-outline`}
              size={22}
              color={active ? colors.primary : colors.icon}
            />
            <Text style={[styles.tabText, active && styles.tabTextActive]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        {sidebar}
        <View style={styles.rightSide}>
          {header}
          <View style={styles.content}>{children}</View>
          {tabBar}
        </View>
      </View>
    </SafeAreaView>
  );
}

function SidebarButton({ item, active, compact, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.menuItem, compact && styles.menuItemCompact, active && styles.menuActive]}
      onPress={onPress}
    >
      <Ionicons name={item.icon} size={19} color={active ? '#FFFFFF' : colors.icon} />
      {!compact && <Text style={active ? styles.menuTextActive : styles.menuText}>{item.label}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.header },
  container: { flex: 1, flexDirection: 'row', backgroundColor: colors.background },
  rightSide: { flex: 1 },
  content: { flex: 1 },

  /* Sidebar */
  sidebar: {
    backgroundColor: '#FFFFFF',
    paddingTop: 28,
    borderRightWidth: 1,
    borderRightColor: '#EDF0F5',
  },
  logo: { fontSize: 19, fontWeight: '800', color: '#273244', marginLeft: 12, marginBottom: 34 },
  menu: { gap: 7 },
  menuItem: {
    height: 44,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 13,
  },
  menuItemCompact: { justifyContent: 'center', paddingHorizontal: 0 },
  menuActive: { backgroundColor: colors.primary },
  menuText: { fontSize: 13, color: colors.icon },
  menuTextActive: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  sidebarBottom: { marginTop: 'auto', marginBottom: 18 },

  /* Header */
  header: {
    height: 64,
    backgroundColor: colors.header,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerDetail: { paddingHorizontal: 6 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: colors.textStrong, marginLeft: 2 },
  headerRight: { minWidth: 40, alignItems: 'flex-end', paddingRight: 6 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconButton: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  dot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.danger,
    borderWidth: 1.5,
    borderColor: colors.header,
  },
  userArea: { flexDirection: 'row', alignItems: 'center' },
  userInfo: { marginLeft: 10 },
  userName: { fontSize: 13, fontWeight: '700', color: '#293548' },
  userRole: { fontSize: 10, color: '#98A3B7', marginTop: 2 },

  /* Tab bar */
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 6,
    paddingBottom: 6,
  },
  tab: { flex: 1, alignItems: 'center', gap: 2 },
  tabText: { fontSize: 10, color: colors.icon },
  tabTextActive: { color: colors.primary, fontWeight: '700' },
});
