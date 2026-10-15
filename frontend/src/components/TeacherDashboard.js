
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import InicioTeacher from '../pages/InicioTeacher';
import logoAlcantay from '../image/logosalcantay.png';

export default function TeacherDashboard({ children }) {
  const navigation = useNavigation();
  const route = useRoute();
  const { width } = useWindowDimensions();
  const [mostrarMas, setMostrarMas] = useState(false);

  const isMobile = width < 600;
  const isTablet = width >= 600 && width < 1000;
  const compactSidebar = width < 1000;

  const sidebarWidth = compactSidebar ? 70 : 235;

  const isInicio = route.name === 'TeacherDashboard';
  const isCursos = route.name === 'CursosTeacher';
  const isTareas = route.name === 'TareasTeacher';
  const isCalificaciones = route.name === 'CalificacionesTeacher';
  const isCalendario = route.name === 'CalendarioTeacher';
  const isMensajes = route.name === 'MensajesTeacher';
  const isConfiguracion = route.name === 'ConfiguracionTeacher';

  const menuItems = [
    {
      label: 'Inicio',
      icon: 'grid-outline',
      active: isInicio,
      onPress: () => navigation.navigate('TeacherDashboard'),
    },
    {
      label: 'Cursos',
      icon: 'book-outline',
      active: isCursos,
      onPress: () => navigation.navigate('CursosTeacher'),
    },
    {
      label: 'Tareas',
      icon: 'document-text-outline',
      active: isTareas,
      onPress: () => navigation.navigate('TareasTeacher'),
    },
    {
      label: 'Calificaciones',
      icon: 'school-outline',
      active: isCalificaciones,
      onPress: () => navigation.navigate('CalificacionesTeacher'),
    },
    {
      label: 'Calendario',
      icon: 'calendar-outline',
      active: isCalendario,
      onPress: () => navigation.navigate('CalendarioTeacher'),
    },
    {
      label: 'Mensajes',
      icon: 'chatbubble-outline',
      active: isMensajes,
      onPress: () => navigation.navigate('MensajesTeacher'),
    },
  ];

  const mobileItems = [
    {
      label: 'Inicio',
      icon: 'home',
      active: isInicio,
      onPress: () => navigation.navigate('TeacherDashboard'),
    },
    {
      label: 'Cursos',
      icon: 'book-outline',
      active: isCursos,
      onPress: () => navigation.navigate('CursosTeacher'),
    },
    {
      label: 'Tareas',
      icon: 'document-text-outline',
      active: isTareas,
      onPress: () => navigation.navigate('TareasTeacher'),
    },
    {
      label: 'Mensajes',
      icon: 'chatbubble-outline',
      active: isMensajes,
      onPress: () => navigation.navigate('MensajesTeacher'),
    },
  ];

  const extraItems = [
    {
      label: 'Calificaciones',
      icon: 'school-outline',
      active: isCalificaciones,
      onPress: () => {
        setMostrarMas(false);
        navigation.navigate('CalificacionesTeacher');
      },
    },
    {
      label: 'Calendario',
      icon: 'calendar-outline',
      active: isCalendario,
      onPress: () => {
        setMostrarMas(false);
        navigation.navigate('CalendarioTeacher');
      },
    },
    {
      label: 'Configuración',
      icon: 'settings-outline',
      active: isConfiguracion,
      onPress: () => {
        setMostrarMas(false);
        navigation.navigate('ConfiguracionTeacher');
      },
    },
  ];


  return (
    <View style={styles.container}>
      {/* MENÚ LATERAL: ESCRITORIO Y TABLET */}
      {!isMobile && (
        <View
          style={[
            styles.sidebar,
            {
              width: sidebarWidth,
              paddingHorizontal: compactSidebar ? 8 : 16,
            },
          ]}
        >
          {!compactSidebar && (
            <Text style={styles.logo}>EduConnect</Text>
          )}

          <View style={styles.menu}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={[
                  styles.menuItem,
                  compactSidebar && styles.menuItemCompact,
                  item.active && styles.active,
                ]}
                onPress={item.onPress}
                activeOpacity={0.75}
                accessibilityLabel={item.label}
              >
                <Ionicons
                  name={item.icon}
                  size={19}
                  color={item.active ? '#FFFFFF' : '#7D8798'}
                />

                {!compactSidebar && (
                  <Text
                    style={[
                      styles.menuText,
                      item.active && styles.activeText,
                    ]}
                  >
                    {item.label}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* CONFIGURACIÓN */}
          <TouchableOpacity
            style={[
              styles.settings,
              compactSidebar && styles.menuItemCompact,
              isConfiguracion && styles.active,
            ]}
            onPress={() => navigation.navigate('ConfiguracionTeacher')}
            activeOpacity={0.75}
            accessibilityLabel="Configuración"
          >
            <Ionicons
              name="settings-outline"
              size={19}
              color={isConfiguracion ? '#FFFFFF' : '#7D8798'}
            />

            {!compactSidebar && (
              <Text
                style={[
                  styles.menuText,
                  isConfiguracion && styles.activeText,
                ]}
              >
                Configuración
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* ÁREA PRINCIPAL */}
      <View style={styles.rightSide}>
        {/* ENCABEZADO */}
        <View
          style={[
            styles.header,
            isMobile && styles.headerMobile,
            {
              paddingHorizontal: isMobile
                ? 16
                : compactSidebar
                  ? 12
                  : 28,
            },
          ]}
        >
          <View style={styles.image}>
            <Image
              source={logoAlcantay}
              style={[
                styles.logoImage,
                {
                  width: isMobile ? 112 : isTablet ? 105 : 120,
                  height: isMobile ? 44 : 50,
                },
              ]}
              resizeMode="contain"
            />
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconButton}
              activeOpacity={0.7}
              accessibilityLabel="Notificaciones"
            >
              <Ionicons
                name="notifications-outline"
                size={22}
                color="#526078"
              />
            </TouchableOpacity>

            {/* PERFIL DEL DOCENTE */}
            <TouchableOpacity
              style={styles.userArea}
              activeOpacity={0.7}
              accessibilityLabel="Abrir perfil del docente"
              onPress={() => {
                setMostrarMas(false);
                navigation.navigate('PerfilTeacher');
              }}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>A</Text>
              </View>

              {!isMobile && (
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>Ana Torres</Text>
                  <Text style={styles.userRole}>Docente</Text>
                </View>
              )}

              {!isMobile && (
                <Ionicons
                  name="chevron-down-outline"
                  size={16}
                  color="#718096"
                  style={styles.arrow}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* CONTENIDO DE LA PÁGINA */}
        <ScrollView
          style={styles.pageScroll}
          contentContainerStyle={[
            styles.content,
            {
              paddingHorizontal: isMobile
                ? 16
                : compactSidebar
                  ? 12
                  : 38,
              paddingTop: isMobile ? 16 : 25,
              paddingBottom: isMobile ? 90 : 30,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {children || <InicioTeacher />}
        </ScrollView>
      </View>

      {/* NAVEGACIÓN INFERIOR: SOLO CELULAR */}
      {isMobile && (
        <>
          {mostrarMas && (
            <TouchableOpacity
              style={styles.overlay}
              activeOpacity={1}
              onPress={() => setMostrarMas(false)}
            />
          )}

          {mostrarMas && (
            <View style={styles.moreMenu}>
              {extraItems.map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={styles.moreItem}
                  onPress={() => {
                    setMostrarMas(false);
                    item.onPress();
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={item.icon}
                    size={19}
                    color={item.active ? '#2563EB' : '#526078'}
                  />

                  <Text
                    style={[
                      styles.moreText,
                      item.active && styles.bottomLabelActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.bottomNav}>
            {mobileItems.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.bottomItem}
                onPress={() => {
                  setMostrarMas(false);
                  item.onPress();
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={item.icon}
                  size={22}
                  color={item.active ? '#2563EB' : '#7D8798'}
                />

                <Text
                  style={[
                    styles.bottomLabel,
                    item.active && styles.bottomLabelActive,
                  ]}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.bottomItem}
              onPress={() => setMostrarMas(!mostrarMas)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={mostrarMas ? 'close-outline' : 'menu-outline'}
                size={23}
                color={mostrarMas ? '#2563EB' : '#7D8798'}
              />

              <Text
                style={[
                  styles.bottomLabel,
                  mostrarMas && styles.bottomLabelActive,
                ]}
              >
                Más
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F3F6FA',
    minHeight: '100%',
  },

  sidebar: {
    width: 235,
    backgroundColor: '#FFFFFF',
    paddingTop: 28,
    paddingHorizontal: 16,
    borderRightWidth: 1,
    borderRightColor: '#EDF0F5',
    flexShrink: 0,
  },

  logo: {
    fontSize: 21,
    fontWeight: '800',
    color: '#273244',
    marginLeft: 12,
    marginBottom: 38,
  },

  menu: {
    gap: 7,
  },

  menuItem: {
    height: 44,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 13,
  },

  menuItemCompact: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },

  active: {
    backgroundColor: '#2563EB',
  },

  activeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  menuText: {
    fontSize: 13,
    color: '#7D8798',
  },

  settings: {
    marginTop: 'auto',
    height: 44,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 13,
    marginBottom: 18,
  },

  rightSide: {
    flex: 1,
    minWidth: 0,
  },

  header: {
    height: 73,
    backgroundColor: '#DBF9FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    borderBottomWidth: 1,
    borderBottomColor: '#C8EDF3',
  },

  headerMobile: {
    height: 66,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  image: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoImage: {
    width: 120,
    height: 50,
  },

  iconButton: {
    width: 38,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  userArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 20,
    backgroundColor: '#2863EB',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },

  userInfo: {
    marginLeft: 10,
  },

  userName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#293548',
  },

  userRole: {
    fontSize: 10,
    color: '#98A3B7',
    marginTop: 2,
  },

  arrow: {
    marginLeft: 10,
  },

  pageScroll: {
    flex: 1,
    minWidth: 0,
  },

  content: {
    flexGrow: 1,
    minWidth: 0,
  },

  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 66,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5EAF1',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingBottom: 4,
    elevation: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    zIndex: 10,
  },

  bottomItem: {
    flex: 1,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },

  bottomLabel: {
    fontSize: 10,
    color: '#7D8798',
  },

  bottomLabelActive: {
    color: '#2563EB',
    fontWeight: '700',
  },

  moreMenu: {
    position: 'absolute',
    right: 12,
    bottom: 74,
    minWidth: 190,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5EAF1',
    elevation: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    zIndex: 20,
  },

  moreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },

  moreText: {
    fontSize: 13,
    color: '#526078',
  },
});
