import React, { useState } from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import AdminDashboard from '../../components/AdminDashboard';
import { useAdminData } from '../../context/AdminDataContext';
import {
  BottomSheet,
  Button,
  Card,
  Field,
  IconBox,
  ListRow,
  PageScroll,
  PageTitle,
  notify,
  useLogout,
} from '../../components/admin/AdminUI';
import { colors } from '../../theme/adminTheme';

const NOTIFICACIONES = [
  { key: 'mensajes', label: 'Mensajes nuevos' },
  { key: 'matriculas', label: 'Nuevas matrículas' },
  { key: 'reportes', label: 'Resumen semanal de reportes' },
];

const PRIVACIDAD = [
  { key: 'perfilVisible', label: 'Perfil visible para docentes' },
  { key: 'mostrarCorreo', label: 'Mostrar correo a estudiantes' },
];

const PASSWORD_VACIO = { actual: '', nueva: '', confirmar: '' };

export default function ConfiguracionAdmin() {
  const navigation = useNavigation();
  const { settings, updateSettings } = useAdminData();
  const logout = useLogout();

  const [panel, setPanel] = useState(null); // 'notificaciones' | 'privacidad' | 'apariencia' | 'seguridad' | 'idioma'
  const [password, setPassword] = useState(PASSWORD_VACIO);
  const [errorPassword, setErrorPassword] = useState('');

  const cerrarPanel = () => {
    setPanel(null);
    setPassword(PASSWORD_VACIO);
    setErrorPassword('');
  };

  const cambiarPassword = () => {
    if (!password.actual) return setErrorPassword('Ingresa tu contraseña actual.');
    if (password.nueva.length < 6) return setErrorPassword('La nueva contraseña debe tener al menos 6 caracteres.');
    if (password.nueva !== password.confirmar) return setErrorPassword('Las contraseñas no coinciden.');
    cerrarPanel();
    notify('Contraseña actualizada');
  };

  const opciones = [
    {
      key: 'cuenta',
      titulo: 'Cuenta',
      sub: 'Editar información personal',
      icono: 'person-outline',
      tono: 'blue',
      onPress: () => navigation.navigate('AdminPerfilForm'),
    },
    {
      key: 'notificaciones',
      titulo: 'Notificaciones',
      sub: 'Gestiona tus notificaciones',
      icono: 'notifications-outline',
      tono: 'orange',
    },
    {
      key: 'privacidad',
      titulo: 'Privacidad',
      sub: 'Controla tu información',
      icono: 'shield-checkmark-outline',
      tono: 'red',
    },
    {
      key: 'apariencia',
      titulo: 'Apariencia',
      sub: `Tema ${settings.tema.toLowerCase()}`,
      icono: 'color-palette-outline',
      tono: 'orange',
    },
    { key: 'seguridad', titulo: 'Seguridad', sub: 'Cambiar contraseña', icono: 'lock-closed-outline', tono: 'cyan' },
    { key: 'idioma', titulo: 'Idioma', sub: settings.idioma, icono: 'language-outline', tono: 'indigo' },
  ];

  const opcionUnica = (valores, actual, onChange) =>
    valores.map((v) => (
      <TouchableOpacity key={v} style={styles.option} onPress={() => onChange(v)}>
        <Text style={styles.optionText}>{v}</Text>
        <Ionicons
          name={actual === v ? 'radio-button-on' : 'radio-button-off'}
          size={22}
          color={actual === v ? colors.primary : colors.icon}
        />
      </TouchableOpacity>
    ));

  const switches = (lista, seccion) =>
    lista.map((item) => (
      <View key={item.key} style={styles.option}>
        <Text style={styles.optionText}>{item.label}</Text>
        <Switch
          value={settings[seccion][item.key]}
          onValueChange={(v) => updateSettings(seccion, { [item.key]: v })}
          trackColor={{ true: colors.primary }}
        />
      </View>
    ));

  const titulos = {
    notificaciones: 'Notificaciones',
    privacidad: 'Privacidad',
    apariencia: 'Apariencia',
    seguridad: 'Cambiar contraseña',
    idioma: 'Idioma',
  };

  return (
    <AdminDashboard>
      <PageScroll>
        <PageTitle title="Configuración" />

        <Card>
          {opciones.map((o) => (
            <ListRow
              key={o.key}
              left={<IconBox icon={o.icono} tone={o.tono} size={40} iconSize={20} />}
              title={o.titulo}
              subtitle={o.sub}
              onPress={o.onPress || (() => setPanel(o.key))}
            />
          ))}
          <ListRow
            left={<IconBox icon="log-out-outline" tone="red" size={40} iconSize={20} />}
            title="Cerrar sesión"
            onPress={logout}
          />
        </Card>
      </PageScroll>

      <BottomSheet visible={!!panel} title={titulos[panel] || ''} onClose={cerrarPanel}>
        {panel === 'notificaciones' && switches(NOTIFICACIONES, 'notificaciones')}
        {panel === 'privacidad' && switches(PRIVACIDAD, 'privacidad')}
        {panel === 'apariencia' &&
          opcionUnica(['Claro', 'Oscuro', 'Sistema'], settings.tema, (v) => updateSettings('tema', v))}
        {panel === 'idioma' &&
          opcionUnica(['Español', 'English', 'Quechua'], settings.idioma, (v) => updateSettings('idioma', v))}
        {panel === 'seguridad' && (
          <>
            <Field
              label="Contraseña actual"
              secureTextEntry
              value={password.actual}
              onChangeText={(actual) => setPassword((p) => ({ ...p, actual }))}
            />
            <Field
              label="Nueva contraseña"
              secureTextEntry
              value={password.nueva}
              onChangeText={(nueva) => setPassword((p) => ({ ...p, nueva }))}
            />
            <Field
              label="Confirmar contraseña"
              secureTextEntry
              value={password.confirmar}
              onChangeText={(confirmar) => setPassword((p) => ({ ...p, confirmar }))}
              error={errorPassword}
            />
            <Button title="Actualizar contraseña" onPress={cambiarPassword} />
          </>
        )}
      </BottomSheet>
    </AdminDashboard>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  optionText: { fontSize: 15, color: colors.textStrong, flex: 1, marginRight: 10 },
});
