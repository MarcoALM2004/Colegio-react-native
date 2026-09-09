import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import Inicio from '../pages/InicioStudent';

export default function StudentDashboard() {
  return (
    <View style={styles.container}>

      {/* PANEL IZQUIERDO */}
      <View style={styles.sidebar}>

        <Text style={styles.logo}>
          GOLEDIO
        </Text>

        <View style={styles.menu}>

          <TouchableOpacity style={[styles.menuItem, styles.active]}>
            <Text style={styles.icon}>▦</Text>
            <Text style={styles.activeText}>Inicio</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.icon}>▤</Text>
            <Text style={styles.menuText}>Cursos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.icon}>▧</Text>
            <Text style={styles.menuText}>Tareas</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.icon}>▦</Text>
            <Text style={styles.menuText}>Calendario</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.icon}>▥</Text>
            <Text style={styles.menuText}>Calificaciones</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.icon}>◯</Text>
            <Text style={styles.menuText}>Mensajes</Text>
          </TouchableOpacity>

        </View>

        {/* CONFIGURACIÓN ABAJO */}
        <TouchableOpacity style={styles.settings}>
          <Text style={styles.icon}>⚙</Text>
          <Text style={styles.menuText}>Configuración</Text>
        </TouchableOpacity>

      </View>


      {/* ÁREA DERECHA */}
      <View style={styles.rightSide}>

        {/* HEADER */}
        <View style={styles.header}>

          <View />

          <TouchableOpacity style={styles.userArea}>

            <View style={styles.avatar}>
              <Text style={styles.avatarText}>M</Text>
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                Marco
              </Text>

              <Text style={styles.userRole}>
                Estudiante
              </Text>
            </View>

            <Text style={styles.arrow}>
             ⌄
            </Text>

          </TouchableOpacity>

        </View>


        {/* CONTENIDO */}
        <View style={styles.content}>
          <Inicio />
        </View>

      </View>

    </View>
  );
}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F5F7FB',
  },

  /* recuadro */

  sidebar: {
    width: 210,
    backgroundColor: '#FFFFFF',
    paddingTop: 30,
    paddingHorizontal: 18,
    borderRightWidth: 1,
    borderRightColor: '#E8ECF3',
  },

  logo: {
    fontSize: 21,
    fontWeight: '800',
    color: '#273244',
    marginLeft: 12,
    marginBottom: 50,
  },

  menu: {
    gap: 8,
  },

  menuItem: {
    height: 45,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  active: {
    backgroundColor: '#2864E8',
  },

  icon: {
    width: 30,
    fontSize: 17,
    color: '#7C899F',
  },

  menuText: {
    fontSize: 13,
    color: '#718096',
  },

  activeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  settings: {
    marginTop: 'auto',
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 20,
  },


  /*ÁREA DERECHA */

  rightSide: {
    flex: 1,
  },


  /* HEADER*/

  header: {
    height: 85,
    backgroundColor: '#dbf9ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 35,
  },

  userArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 25,
    backgroundColor: '#2864E8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
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
    marginLeft: 12,
    fontSize: 16,
    color: '#718096',
  },


  /* CONTENIDO */

  content: {
    flex: 1,
    paddingHorizontal: 38,
    paddingTop: 25,
  },

});