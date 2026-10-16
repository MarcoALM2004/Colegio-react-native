import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet,TouchableOpacity, TextInput, Alert, Platform, ActivityIndicator, useWindowDimensions } from 'react-native';
import {
  useNavigation,
  CommonActions,
} from '@react-navigation/native';

import { Page, Card, Icon, colors } from '../components/StudentUI';
import {
  obtenerPerfil,
  actualizarPerfil,
} from '../service/perfilService';

export default function PerfilStudent({ usuarioInicial }) {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  const [perfil, setPerfil] = useState(usuarioInicial || null);
  const [formulario, setFormulario] = useState({
    correo: '',
    telefono: '',
  });

  const [editando, setEditando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const codigo = usuarioInicial?.codigo || perfil?.codigo;

  // Cargar los datos del estudiante
  const cargarPerfil = useCallback(async () => {
    if (!codigo) {
      setError(
        'No se recibió el código del usuario. Cierra sesión e inicia nuevamente.'
      );
      setCargando(false);
      return;
    }

    try {
      setError('');
      setCargando(true);

      const datos = await obtenerPerfil(codigo);

      setPerfil(datos);
      setFormulario({
        correo: datos.correo || '',
        telefono: datos.telefono || '',
      });
    } catch (e) {
      setError(e.message || 'No se pudo cargar el perfil.');
    } finally {
      setCargando(false);
    }
  }, [codigo]);

  useEffect(() => {
    cargarPerfil();
  }, [cargarPerfil]);

  const cambiarCampo = (campo, valor) => {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  };

  const mostrarMensaje = (titulo, mensaje) => {
    if (Platform.OS === 'web') {
      window.alert(`${titulo}\n\n${mensaje}`);
    } else {
      Alert.alert(titulo, mensaje);
    }
  };

  // Guardar correo y teléfono
  const guardarPerfil = async () => {
    if (!codigo) {
      mostrarMensaje('Error', 'No se encontró el código del usuario.');
      return;
    }

    const correo = formulario.correo.trim();
    const telefono = formulario.telefono.trim();

    if (!perfil?.nombres?.trim() || !perfil?.apellidos?.trim()) {
      mostrarMensaje(
        'Error',
        'No se encontraron los nombres y apellidos actuales del usuario.'
      );
      return;
    }

    if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      mostrarMensaje('Correo inválido', 'Ingresa un correo válido.');
      return;
    }

    try {
      setGuardando(true);
      setError('');

      const datosActualizados = await actualizarPerfil(codigo, {
        nombres: perfil.nombres,
        apellidos: perfil.apellidos,
        correo,
        telefono,
      });

      setPerfil((anterior) => ({
        ...anterior,
        ...datosActualizados,
        nombres: anterior.nombres,
        apellidos: anterior.apellidos,
        correo,
        telefono,
      }));

      setFormulario({ correo, telefono });
      setEditando(false);

      mostrarMensaje(
        'Perfil actualizado',
        'Tu correo y teléfono se guardaron correctamente.'
      );
    } catch (e) {
      mostrarMensaje(
        'No se pudo guardar',
        e.message || 'Ocurrió un error al actualizar el perfil.'
      );
    } finally {
      setGuardando(false);
    }
  };

  // Cancelar y recuperar los datos originales
  const cancelarEdicion = () => {
    setFormulario({
      correo: perfil?.correo || '',
      telefono: perfil?.telefono || '',
    });

    setEditando(false);
    setError('');
  };

  // Cerrar sesión
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

  const cerrarSesion = () => {
    if (Platform.OS === 'web') {
      const confirmar = window.confirm(
        '¿Estás seguro de que deseas cerrar sesión?'
      );

      if (confirmar) {
        ejecutarCierreSesion();
      }

      return;
    }

    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas salir?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: ejecutarCierreSesion,
        },
      ]
    );
  };

  const nombreCompleto = perfil
    ? `${perfil.nombres || ''} ${perfil.apellidos || ''}`.trim()
    : '';

  const iniciales = perfil
    ? `${perfil.nombres?.[0] || ''}${perfil.apellidos?.[0] || ''}`
    : '';

  return (
    <Page
      title="Mi Perfil"
      subtitle="Consulta y actualiza tu información personal."
    >
      {cargando ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.blue} />
          <Text style={styles.loadingText}>
            Cargando perfil...
          </Text>
        </View>
      ) : error && !perfil ? (
        <View style={styles.fullWidth}>
          <Card style={styles.infoCard}>
            <Text style={styles.errorText}>{error}</Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={cargarPerfil}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>
                Reintentar
              </Text>
            </TouchableOpacity>

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
      ) : (
        <View
          style={[
            styles.columns,
            isMobile && styles.columnsMobile,
          ]}
        >
          {/* TARJETA 1: PERFIL DEL ESTUDIANTE */}
          <View
            style={[
              styles.profileColumn,
              isMobile && styles.profileColumnMobile,
            ]}
          >
            <Card
              style={[
                styles.profileCard,
                isMobile && styles.profileCardMobile,
              ]}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {iniciales.toUpperCase()}
                </Text>
              </View>

              <Text style={styles.name}>
                {nombreCompleto || 'Usuario'}
              </Text>

              <Text style={styles.role}>
                Estudiante
              </Text>

              <Text style={styles.code}>
                Código: {perfil?.codigo}
              </Text>

              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>
                  {perfil?.rol || 'ALUMNO'}
                </Text>
              </View>

              {!editando && (
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    styles.profileButton,
                  ]}
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

          {/* COLUMNA DE INFORMACIÓN */}
          <View
            style={[
              styles.infoColumn,
              isMobile && styles.infoColumnMobile,
            ]}
          >
            {/* TARJETA 2: INFORMACIÓN PERSONAL */}
            <View style={styles.fullWidth}>
              <Card style={styles.infoCard}>
                <Text style={styles.sectionTitle}>
                  Información personal
                </Text>

                <CampoLectura
                  icon="person-outline"
                  label="Nombres"
                  value={perfil?.nombres}
                />

                <CampoLectura
                  icon="person-outline"
                  label="Apellidos"
                  value={perfil?.apellidos}
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
                  label="Teléfono"
                  value={formulario.telefono}
                  editable={editando}
                  onChangeText={(valor) =>
                    cambiarCampo('telefono', valor)
                  }
                  keyboardType="phone-pad"
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
                      disabled={guardando}
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
                        guardando && styles.disabledButton,
                      ]}
                      onPress={guardarPerfil}
                      disabled={guardando}
                      activeOpacity={0.8}
                    >
                      {guardando ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={styles.primaryButtonText}>
                          Guardar cambios
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}

                {!!error && (
                  <Text style={styles.errorText}>
                    {error}
                  </Text>
                )}
              </Card>
            </View>

            {/* TARJETA 3: INFORMACIÓN DE LA CUENTA */}
            <View style={styles.fullWidth}>
              <Card style={styles.infoCard}>
                <Text style={styles.sectionTitle}>
                  Información de la cuenta
                </Text>

                <View style={styles.accountRow}>
                  <Icon name="shield-checkmark-outline" />

                  <View style={styles.accountText}>
                    <Text style={styles.accountLabel}>
                      Rol
                    </Text>
                    <Text style={styles.accountValue}>
                      {perfil?.rol || 'ALUMNO'}
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
                      {perfil?.codigo}
                    </Text>
                  </View>
                </View>
              </Card>
            </View>
          </View>
        </View>
      )}
    </Page>
  );
}

// Nombres y apellidos: solo lectura
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

// Correo y teléfono: editables
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
  loading: {
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
  },

  loadingText: {
    color: '#7D8798',
    fontSize: 13,
  },

  // Distribución general
  columns: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    width: '100%',
    minWidth: 0,
  },

  // En celular: una columna, usando todo el ancho
  columnsMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 16,
    width: '100%',
  },

  profileColumn: {
    width: '33%',
    minWidth: 0,
  },

  profileColumnMobile: {
    width: '100%',
    alignSelf: 'stretch',
  },

  profileCard: {
    width: '100%',
    alignItems: 'center',
    padding: 16,
  },

  profileCardMobile: {
    width: '100%',
    alignItems: 'center',
  },

  infoColumn: {
    flex: 1,
    minWidth: 0,
    gap: 16,
  },

  infoColumnMobile: {
    flex: 0,
    width: '100%',
    alignSelf: 'stretch',
  },

  fullWidth: {
    width: '100%',
    minWidth: 0,
    alignSelf: 'stretch',
  },

  infoCard: {
    width: '100%',
    minWidth: 0,
  },

  // Avatar y perfil
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

  // Campos
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
    minWidth: 0,
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

  // Editar perfil
  profileButton: {
    alignSelf: 'center',
    width: 132,
    minHeight: 40,
    marginTop: 14,
  },

  // Botón rojo sin icono
  logoutButton: {
    alignSelf: 'center',
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

  // Botones de edición
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    width: '100%',
    minWidth: 0,
  },

  actionsMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },

  primaryButton: {
    minHeight: 40,
    flexDirection: 'row',
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

  saveButton: {
    flex: 1,
    minWidth: 0,
    minHeight: 40,
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

  disabledButton: {
    opacity: 0.65,
  },

  errorText: {
    color: '#B91C1C',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
  },

  // Información de la cuenta
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
