import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';

import { Page, Card, Icon, colors } from '../components/StudentUI';

const teacherProfile = {
  nombres: 'Ana',
  apellidos: 'Torres',
  codigo: 'C232',
  especialidad: 'Matemática',
  correo: 'ana.torres@salcantay.edu.pe',
  telefono: '+51 987 654 321',
  fechaNacimiento: '12 de marzo de 1990',
};

export default function PerfilTeacher() {
    const navigation = useNavigation();
    const { width } = useWindowDimensions();
    const isMobile = width < 600;

    const fullName = `${teacherProfile.nombres} ${teacherProfile.apellidos}`;
    const initials = `${teacherProfile.nombres[0]}${teacherProfile.apellidos[0]}`;

const cerrarSesion = () => {
  Alert.alert(
    'Cerrar sesión',
    '¿Estás seguro de que deseas salir?',
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: () => {
          let rootNavigation = navigation;

          while (rootNavigation.getParent()) {
            rootNavigation = rootNavigation.getParent();
          }

          rootNavigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            })
          );
        },
      },
    ]
  );
};

  return (
    <Page title="Mi Perfil" subtitle="Información personal y profesional.">
      <View style={[styles.cols, isMobile && styles.colsMobile]}>
        <View style={styles.profileColumn}>
          <Card style={styles.profile}>
            <View style={styles.bigAvatar}>
              <Text style={styles.initial}>{initials}</Text>
            </View>

            <Text style={styles.name}>{fullName}</Text>
            <Text style={styles.role}>Docente</Text>
            <Text style={styles.code}>{teacherProfile.codigo}</Text>

            <View style={styles.level}>
              <Text style={styles.levelText}>
                {teacherProfile.especialidad}
              </Text>
            </View>
          </Card>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={cerrarSesion}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCol}>
          <Card>
            <Text style={styles.section}>Información personal</Text>
            <Info icon="person-outline" label="Nombre completo" value={fullName} />
            <Info icon="calendar-outline" label="Fecha de nacimiento" value={teacherProfile.fechaNacimiento} />
            <Info icon="school-outline" label="Especialidad" value={teacherProfile.especialidad} />
            <Info icon="call-outline" label="Teléfono" value={teacherProfile.telefono} />
            <Info icon="mail-outline" label="Correo electrónico" value={teacherProfile.correo} />
          </Card>

          <Card>
            <Text style={styles.section}>Sobre mí</Text>
            <Text style={styles.about}>
              Soy docente y me interesa acompañar el aprendizaje de mis
              estudiantes, fortalecer sus habilidades y promover una
              educación participativa mediante el uso de la tecnología.
            </Text>
          </Card>
        </View>
      </View>
    </Page>
  );
}

function Info({ icon, label, value }) {
  return (
    <View style={styles.info}>
      <Icon name={icon} />
      <View style={styles.infoContent}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cols: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  colsMobile: {
    flexDirection: 'column',
  },
  profileColumn: {
    width: '33%',
  },
  profile: {
    width: '100%',
    alignItems: 'center',
  },
  infoCol: {
    flex: 1,
    minWidth: 0,
    gap: 16,
  },
  bigAvatar: {
    width: 88,
    height: 88,
    borderRadius: 50,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 7,
  },
  initial: {
    fontSize: 31,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    marginTop: 12,
    textAlign: 'center',
  },
  role: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 3,
  },
  code: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 3,
  },
  level: {
    backgroundColor: '#EAF2FF',
    padding: 7,
    borderRadius: 8,
    marginTop: 14,
  },
  levelText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.blue,
  },
  section: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 13,
  },
  info: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  infoContent: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontSize: 10,
    color: colors.muted,
  },
  value: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
    marginTop: 2,
  },
  about: {
    fontSize: 13,
    color: '#617087',
    lineHeight: 20,
  },
  logoutButton: {
    width: '100%',
    backgroundColor: '#E52D45',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
