import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet, Image, useWindowDimensions} from 'react-native';

import InicioStudent from '../pages/InicioStudent';
import { useNavigation, useRoute } from '@react-navigation/native';
import logoAlcantay from '../image/logosalcantay.png';

export default function StudentDashboard({ children }) {

  const navigation = useNavigation();
  const route = useRoute();

  const isInicio = route.name === 'StudentDashboard';
  const isCursos = route.name === 'CursosStudent';

  const { width } = useWindowDimensions();

  const isMobile = width < 600;
  const isTablet = width >= 600 && width < 1000;

  // Menos de 1000px = sidebar compacto
  const compactSidebar = width < 1000;

  const sidebarWidth = compactSidebar
    ? 70
    : 235;

  // Logo del sidebar
  let logo = null;

  if (!compactSidebar) {
    logo = (
      <Text style={styles.logo}>
        EduConnect
      </Text>
    );
  }

  return (
    <View style={styles.container}>

      {/* PANEL IZQUIERDO */}

      <View
        style={[
          styles.sidebar,
          {
            width: sidebarWidth,
            paddingHorizontal: compactSidebar
              ? 8
              : 16,
          },
        ]}
      >

        {logo}

        <View style={styles.menu}>

          {/* INICIO */}

          <TouchableOpacity
            style={[
              styles.menuItem,
              compactSidebar && styles.menuItemMobile,
              isInicio && styles.active,
            ]}
            onPress={() =>
              navigation.navigate('StudentDashboard')
            }
          >

            <Ionicons
              name="grid"
              size={19}
              color={
                isInicio
                  ? '#FFFFFF'
                  : '#7D8798'
              }
            />

            {!compactSidebar && (
              <Text
                style={
                  isInicio
                    ? styles.activeText
                    : styles.menuText
                }
              >
                Inicio
              </Text>
            )}

          </TouchableOpacity>


          {/* CURSOS */}

          <TouchableOpacity
            style={[
              styles.menuItem,
              compactSidebar && styles.menuItemMobile,
              isCursos && styles.active,
            ]}
            onPress={() =>
              navigation.navigate('CursosStudent')
            }
          >

            <Ionicons
              name="book-outline"
              size={19}
              color={
                isCursos
                  ? '#FFFFFF'
                  : '#7D8798'
              }
            />

            {!compactSidebar && (
              <Text
                style={
                  isCursos
                    ? styles.activeText
                    : styles.menuText
                }
              >
                Cursos
              </Text>
            )}

          </TouchableOpacity>
      
          {/* TAREAS */}

          <TouchableOpacity
            style={[
              styles.menuItem,
              compactSidebar && styles.menuItemMobile,
            ]}
          >

            <Ionicons
              name="document-text-outline"
              size={19}
              color="#7D8798"
            />

            {!compactSidebar && (
              <Text style={styles.menuText}>
                Tareas
              </Text>
            )}

          </TouchableOpacity>


          {/* CALENDARIO */}

          <TouchableOpacity
            style={[
              styles.menuItem,
              compactSidebar && styles.menuItemMobile,
            ]}
          >

            <Ionicons
              name="calendar-outline"
              size={19}
              color="#7D8798"
            />

            {!compactSidebar && (
              <Text style={styles.menuText}>
                Calendario
              </Text>
            )}

          </TouchableOpacity>


          {/* CALIFICACIONES */}

          <TouchableOpacity
            style={[
              styles.menuItem,
              compactSidebar && styles.menuItemMobile,
            ]}
          >

            <Ionicons
              name="bar-chart-outline"
              size={19}
              color="#7D8798"
            />

            {!compactSidebar && (
              <Text style={styles.menuText}>
                Calificaciones
              </Text>
            )}

          </TouchableOpacity>

          {/* MENSAJES */}

          <TouchableOpacity
            style={[
              styles.menuItem,
              compactSidebar && styles.menuItemMobile,
            ]}
          >

            <Ionicons
              name="chatbubble-outline"
              size={19}
              color="#7D8798"
            />

            {!compactSidebar && (
              <Text style={styles.menuText}>
                Mensajes
              </Text>
            )}

          </TouchableOpacity>

        </View>

        {/* CONFIGURACIÓN */}

        <TouchableOpacity
          style={[
            styles.settings,
            compactSidebar && styles.menuItemMobile,
          ]}
        >

          <Ionicons
            name="settings-outline"
            size={19}
            color="#7D8798"
          />

          {!compactSidebar && (
            <Text style={styles.menuText}>
              Configuración
            </Text>
          )}

        </TouchableOpacity>

      </View>


      {/* ÁREA DERECHA */}

      <View style={styles.rightSide}>

        {/* HEADER */}

        <View
          style={[
            styles.header,
            {
              paddingHorizontal: compactSidebar
                ? 10
                : 28,
            },
          ]}
        >

          {/* LOGO ALCANTAY */}

          <View style={styles.image}>

            <Image
              source={logoAlcantay}
              style={[
                styles.logoImage,
                {
                  width: isMobile
                    ? 90
                    : isTablet
                    ? 105
                    : 120,

                  height: isMobile
                    ? 42
                    : 50,
                },
              ]}
              resizeMode="contain"
            />

          </View>


          {/* ACCIONES DEL HEADER */}

          <View style={styles.headerActions}>

            {/* NOTIFICACIONES */}

            <TouchableOpacity
              style={styles.iconButton}
            >

              <Ionicons
                name="notifications-outline"
                size={21}
                color="#718096"
              />

            </TouchableOpacity>


            {/* USUARIO */}

            <TouchableOpacity
              style={styles.userArea}
            >

              {/* AVATAR */}

              <View style={styles.avatar}>

                <Text style={styles.avatarText}>
                  M
                </Text>

              </View>


              {/* INFORMACIÓN */}

              {!compactSidebar && (
                <View style={styles.userInfo}>

                  <Text style={styles.userName}>
                    Marco
                  </Text>

                  <Text style={styles.userRole}>
                    Estudiante
                  </Text>

                </View>
              )}


              {/* FLECHA */}

              {!compactSidebar && (
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

        {/* CONTENIDO */}

        <View
          style={[
            styles.content,
            {
              paddingHorizontal: compactSidebar
                ? 12
                : 38,

              paddingTop: isMobile
                ? 15
                : 25,
            },
          ]}
        >

          {children || <InicioStudent />}

        </View>

      </View>

    </View>
  );
}


const styles = StyleSheet.create({

  /* CONTENEDOR  */

  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F5F7FB',
  },


  /*  SIDEBAR  */

  sidebar: {
    width: 235,
    backgroundColor: '#FFFFFF',
    paddingTop: 28,
    paddingHorizontal: 16,
    borderRightWidth: 1,
    borderRightColor: '#EDF0F5',
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


  menuItemMobile: {
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


  /* ÁREA DERECHA  */

  rightSide: {
    flex: 1,
  },


  /* HEADER */

  header: {
    height: 73,
    backgroundColor: '#DBF9FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
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
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },


  /* USUARIO */

  userArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },


  avatar: {
    width: 38,
    height: 38,
    borderRadius: 20,
    backgroundColor: '#2864E8',
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


  /*  CONTENIDO  */

  content: {
    flex: 1,
  },

});