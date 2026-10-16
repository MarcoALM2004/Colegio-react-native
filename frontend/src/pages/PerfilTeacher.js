
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { Page, Card, Icon, colors } from '../components/StudentUI';

export default function PerfilTeacher({ usuarioInicial }) {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  const [perfil, setPerfil] = useState({
    nombres: usuarioInicial?.nombres || 'Ana',
    apellidos: usuarioInicial?.apellidos || 'Torres',
    codigo: usuarioInicial?.codigo || 'C232',
    rol: 'DOCENTE',
    especialidad: usuarioInicial?.especialidad || 'Matemática',
    correo: usuarioInicial?.correo || '',
    telefono: usuarioInicial?.telefono || '',
  });

  const [formulario, setFormulario] = useState({
    correo: perfil.correo,
    telefono: perfil.telefono,
  });

  const [editando, setEditando] = useState(false);

  const nombreCompleto =
    `${perfil.nombres} ${perfil.apellidos}`.trim();

  const iniciales =
    `${perfil.nombres?.[0] || ''}${perfil.apellidos?.[0] || ''}`;

  const cambiarCampo = (campo, valor) => {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  };

  const guardarPerfil = () => {
    const correo = formulario.correo.trim();
    const telefono = formulario.telefono.trim();

    if (
      correo &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)
    ) {
      mostrarMensaje('Correo inválido', 'Ingresa un correo válido.');
      return;
    }

    setPerfil((anterior) => ({
      ...anterior,
      correo,
      telefono,
    }));

    setFormulario({ correo, telefono });
    setEditando(false);

    mostrarMensaje(
      'Perfil actualizado',
      'Los datos se actualizaron en la interfaz.'
    );
  };

  const cancelarEdicion = () => {
    setFormulario({
      correo: perfil.correo,
      telefono: perfil.telefono,
    });
    setEditando(false);
  };

  const mostrarMensaje = (titulo, mensaje) => {
    if (Platform.OS === 'web') {
      window.alert(`${titulo}\n\n${mensaje}`);
    } else {
      Alert.alert(titulo, mensaje);
    }
  };

  const cerrarSesion = () => {
    const ejecutarCierreSesion = () => {
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
    };

    if (Platform.OS === 'web') {
      if (window.confirm('¿Deseas cerrar sesión?')) {
        ejecutarCierreSesion();
      }
      return;
    }

    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: ejecutarCierreSesion,
        },
      ]
    );
  };

  return (
    <Page
      title="Mi Perfil"
      subtitle="Consulta y actualiza tu información personal."
    >
      <View
        style={[
          styles.columns,
          isMobile && styles.columnsMobile,
        ]}
      >
        {/* TARJETA DE PERFIL */}
        <View
          style={[
            styles.profileColumn,
            isMobile && styles.profileColumnMobile,
          ]}
        >
          <Card style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {iniciales.toUpperCase()}
              </Text>
            </View>

            <Text style={styles.name}>
              {nombreCompleto || 'Docente'}
            </Text>

            <Text style={styles.role}>Docente</Text>

            <Text style={styles.code}>
              Código: {perfil.codigo}
            </Text>

            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>
                DOCENTE
              </Text>
            </View>

            {!editando && (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => setEditando(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>
                  Editar perfil
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={cerrarSesion}
              activeOpacity={0.8}
            >
              <Text style={styles.logoutText}>
                Cerrar sesión
              </Text>
            </TouchableOpacity>
          </Card>
        </View>

        {/* INFORMACIÓN DEL DOCENTE */}
        <View
          style={[
            styles.infoColumn,
            isMobile && styles.infoColumnMobile,
          ]}
        >
          <Card style={styles.infoCard}>
            <Text style={styles.sectionTitle}>
              Información personal
            </Text>

            <CampoLectura
              icon="person-outline"
              label="Nombres"
              value={perfil.nombres}
            />

            <CampoLectura
              icon="person-outline"
              label="Apellidos"
              value={perfil.apellidos}
            />

            <CampoEditable
              icon="mail-outline"
              label="Correo electrónico"
              value={formulario.correo}
              editable={editando}
              onChangeText={(valor) =>
                cambiarCampo('correo', valor)
              }
              keyboardType="email-address"
            />

            <CampoEditable
              icon="call-outline"
              label="Número de celular"
              value={formulario.telefono}
              editable={editando}
              onChangeText={(valor) =>
                cambiarCampo('telefono', valor)
              }
              keyboardType="phone-pad"
            />

            <CampoLectura
              icon="school-outline"
              label="Especialidad"
              value={perfil.especialidad}
            />

            {editando && (
              <View
                style={[
                  styles.actions,
                  isMobile && styles.actionsMobile,
                ]}
              >
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={cancelarEdicion}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelButtonText}>
                    Cancelar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    styles.saveButton,
                    isMobile && styles.saveButtonMobile,
                  ]}
                  onPress={guardarPerfil}
                  activeOpacity={0.8}
                >
                  <Text style={styles.primaryButtonText}>
                    Guardar cambios
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Card>

          {/* INFORMACIÓN DE LA CUENTA */}
          <Card style={styles.infoCard}>
            <Text style={styles.sectionTitle}>
              Información de la cuenta
            </Text>

            <View style={styles.accountRow}>
              <Icon name="shield-checkmark-outline" />
              <View style={styles.accountText}>
                <Text style={styles.accountLabel}>Rol</Text>
                <Text style={styles.accountValue}>
                  {perfil.rol}
                </Text>
              </View>
            </View>

            <View style={styles.accountRow}>
              <Icon name="key-outline" />
              <View style={styles.accountText}>
                <Text style={styles.accountLabel}>
                  Código de usuario
                </Text>
                <Text style={styles.accountValue}>
                  {perfil.codigo}
                </Text>
              </View>
            </View>
          </Card>
        </View>
      </View>
    </Page>
  );
}

function CampoLectura({ icon, label, value }) {
  return (
    <View style={styles.field}>
      <View style={styles.fieldIcon}>
        <Icon name={icon} />
      </View>

      <View style={styles.fieldContent}>
        <Text style={styles.fieldLabel}>{label}</Text>

        <View style={styles.readOnlyValue}>
          <Text style={styles.readOnlyText}>
            {value || 'No registrado'}
          </Text>

          <View style={styles.lockIcon}>
            <Icon name="lock-closed-outline" />
          </View>
        </View>
      </View>
    </View>
  );
}

function CampoEditable({
  icon,
  label,
  value,
  editable,
  onChangeText,
  keyboardType = 'default',
}) {
  return (
    <View style={styles.field}>
      <View style={styles.fieldIcon}>
        <Icon name={icon} />
      </View>

      <View style={styles.fieldContent}>
        <Text style={styles.fieldLabel}>{label}</Text>

        <TextInput
          style={[
            styles.input,
            editable && styles.inputEditable,
          ]}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder={`Ingresa ${label.toLowerCase()}`}
          placeholderTextColor="#98A3B7"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  columns: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    width: '100%',
    minWidth: 0,
  },
  columnsMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  profileColumn: {
    width: '33%',
    minWidth: 0,
  },
  profileColumnMobile: {
    width: '100%',
  },
  profileCard: {
    width: '100%',
    alignItems: 'center',
    padding: 16,
  },
  infoColumn: {
    flex: 1,
    minWidth: 0,
    gap: 16,
  },
  infoColumnMobile: {
    flex: 0,
    width: '100%',
  },
  infoCard: {
    width: '100%',
    minWidth: 0,
  },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 27,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginTop: 10,
    textAlign: 'center',
  },
  role: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
  },
  code: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 5,
  },
  roleBadge: {
    backgroundColor: '#EAF2FF',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 12,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.blue,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 15,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 13,
    width: '100%',
    minWidth: 0,
  },
  fieldIcon: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor: '#E1EAFE',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  fieldContent: {
    flex: 1,
    minWidth: 0,
  },
  fieldLabel: {
    fontSize: 11,
    color: colors.muted,
    marginBottom: 3,
  },
  readOnlyValue: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#E5EAF2',
  },
  readOnlyText: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    color: colors.text,
  },
  lockIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#E1EAFE',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  input: {
    width: '100%',
    minWidth: 0,
    minHeight: 38,
    paddingHorizontal: 0,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
    fontSize: 13,
    color: colors.text,
  },
  inputEditable: {
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#D9E3F2',
    borderRadius: 8,
    backgroundColor: '#FBFCFE',
  },
  primaryButton: {
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginTop: 14,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  logoutButton: {
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  logoutText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    width: '100%',
  },
  actionsMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  saveButton: {
    flex: 1,
    marginTop: 0,
  },
  saveButtonMobile: {
    width: '100%',
    flex: 0,
    alignSelf: 'stretch',
  },
  cancelButton: {
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#D9E3F2',
    backgroundColor: '#FFFFFF',
  },
  cancelButtonText: {
    color: '#526078',
    fontSize: 12,
    fontWeight: '600',
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    width: '100%',
  },
  accountText: {
    flex: 1,
    minWidth: 0,
  },
  accountLabel: {
    color: colors.muted,
    fontSize: 11,
  },
  accountValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 3,
  },
});
