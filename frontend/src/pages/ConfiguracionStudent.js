import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  TextInput,
} from 'react-native';

import { studentProfile } from '../data/studentMockData';
import { Page, Card, Button, colors } from '../components/StudentUI';

const sections = ['Cuenta', 'Notificaciones', 'Privacidad', 'Idioma'];

export default function ConfiguracionStudent() {
  const [section, setSection] = useState('Cuenta');
  const [alerts, setAlerts] = useState(true);
  const [correo, setCorreo] = useState(studentProfile.correo);
  const [saved, setSaved] = useState(false);

  return (
    <Page
      title="Configuración"
      subtitle="Personaliza tu cuenta y preferencias."
    >
      <View style={styles.layout}>
        <Card style={styles.menu}>
          {sections.map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setSection(item)}
              style={[
                styles.menuItem,
                section === item && styles.active,
              ]}
            >
              <Text
                style={[
                  styles.menuText,
                  section === item && styles.activeText,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </Card>

        <Card style={styles.panel}>
          {section === 'Cuenta' && (
            <>
              <Text style={styles.section}>Información de la cuenta</Text>

              <Text style={styles.label}>Nombre</Text>
              <TextInput
                editable={false}
                value={`${studentProfile.nombres} ${studentProfile.apellidos}`}
                style={styles.input}
              />

              <Text style={styles.label}>Correo electrónico</Text>
              <TextInput
                value={correo}
                onChangeText={(value) => {
                  setCorreo(value);
                  setSaved(false);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />

              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.password}>
                <Text>••••••••</Text>

                <TouchableOpacity>
                  <Text style={styles.change}>Cambiar</Text>
                </TouchableOpacity>
              </View>

              <Button
                title={saved ? 'Cambios guardados' : 'Guardar cambios'}
                icon="checkmark"
                onPress={() => setSaved(true)}
              />
            </>
          )}

          {section === 'Notificaciones' && (
            <>
              <Text style={styles.section}>Notificaciones</Text>
              <Text style={styles.desc}>
                Elige qué novedades deseas recibir.
              </Text>

              <Row
                title="Tareas y actividades"
                value={alerts}
                change={setAlerts}
              />
              <Row
                title="Mensajes de docentes"
                value={alerts}
                change={setAlerts}
              />
              <Row
                title="Calificaciones publicadas"
                value={alerts}
                change={setAlerts}
              />
            </>
          )}

          {section === 'Privacidad' && (
            <>
              <Text style={styles.section}>Privacidad</Text>
              <Text style={styles.desc}>
                Tu perfil solo es visible para docentes y personal autorizado
                del colegio.
              </Text>

              <Row
                title="Mostrar correo a docentes"
                value={false}
                change={() => {}}
              />
            </>
          )}

          {section === 'Idioma' && (
            <>
              <Text style={styles.section}>Idioma y zona horaria</Text>

              <Text style={styles.label}>Idioma</Text>
              <View style={styles.select}>
                <Text>Español (Perú)</Text>
              </View>

              <Text style={styles.label}>Zona horaria</Text>
              <View style={styles.select}>
                <Text>UTC-05:00 · Lima</Text>
              </View>
            </>
          )}
        </Card>
      </View>
    </Page>
  );
}

function Row({ title, value, change }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowText}>{title}</Text>

      <Switch
        value={value}
        onValueChange={change}
        trackColor={{ true: '#93B8FA' }}
        thumbColor={value ? colors.blue : '#f4f3f4'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  layout: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  menu: {
    width: '27%',
    padding: 6,
  },
  panel: {
    flex: 1,
  },
  menuItem: {
    padding: 12,
    borderRadius: 9,
  },
  active: {
    backgroundColor: colors.blue,
  },
  menuText: {
    fontSize: 12,
    color: '#617087',
  },
  activeText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  section: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 17,
  },
  label: {
    fontSize: 11,
    color: colors.muted,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E6EE',
    borderRadius: 9,
    padding: 10,
    fontSize: 12,
    color: colors.text,
  },
  password: {
    borderWidth: 1,
    borderColor: '#E0E6EE',
    borderRadius: 9,
    padding: 11,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  change: {
    fontSize: 11,
    color: colors.blue,
    fontWeight: '700',
  },
  desc: {
    fontSize: 13,
    color: '#617087',
    marginTop: -8,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F5',
  },
  rowText: {
    fontSize: 13,
    color: colors.text,
  },
  select: {
    borderWidth: 1,
    borderColor: '#E0E6EE',
    padding: 11,
    borderRadius: 9,
    marginBottom: 4,
  },
});