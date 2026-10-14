import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';

const ConfiguracionTeacher = () => {
  const { width } = useWindowDimensions();
  const isMobile = width < 700;

  // Datos temporales de demostración
  const userId = 'DOC-0001';

  const [emails, setEmails] = useState([
    'docente.personal@gmail.com',
  ]);
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailMessage, setEmailMessage] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  const addEmail = () => {
    const email = newEmail.trim().toLowerCase();

    setEmailMessage('');
    setEmailError('');

    if (!email) {
      setEmailError('Ingresa un correo electrónico.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setEmailError('Ingresa un correo válido.');
      return;
    }

    if (emails.includes(email)) {
      setEmailError('Este correo ya está agregado.');
      return;
    }

    setEmails((previous) => [...previous, email]);
    setNewEmail('');
    setEmailMessage('Correo agregado a la lista temporal.');
  };

  const removeEmail = (emailToRemove) => {
    setEmails((previous) =>
      previous.filter((email) => email !== emailToRemove)
    );
    setEmailMessage('Correo eliminado de la lista temporal.');
    setEmailError('');
  };

  const handlePasswordChange = () => {
    setPasswordMessage('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage('Completa todos los campos.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMessage(
        'La nueva contraseña debe tener al menos 8 caracteres.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage('Las contraseñas nuevas no coinciden.');
      return;
    }

    setPasswordMessage(
      'Validación visual completada. El cambio real requiere conectar el backend.'
    );

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Configuración</Text>
        <Text style={styles.subtitle}>
          Administra la información y la seguridad de tu cuenta.
        </Text>
      </View>

      <View style={styles.layout}>
        {/* ID DEL USUARIO */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconBox}>
              <Text style={styles.iconText}>ID</Text>
            </View>

            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>ID del usuario</Text>
              <Text style={styles.description}>
                Identificador único de tu cuenta docente.
              </Text>
            </View>
          </View>

          <Text style={styles.fieldLabel}>Identificador</Text>

          <View style={styles.idContainer}>
            <Text style={styles.idValue}>{userId}</Text>
            <View style={styles.readOnlyBadge}>
              <Text style={styles.readOnlyText}>Solo lectura</Text>
            </View>
          </View>

          <Text style={styles.helperText}>
            Este identificador no se puede modificar.
          </Text>
        </View>

        {/* CORREOS ADICIONALES */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconBox}>
              <Text style={styles.iconText}>@</Text>
            </View>

            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>
                Correos adicionales
              </Text>
              <Text style={styles.description}>
                Administra otros correos asociados a tu cuenta.
              </Text>
            </View>
          </View>

          <Text style={styles.fieldLabel}>Agregar correo</Text>

          <View style={isMobile ? styles.emailFormMobile : styles.emailForm}>
            <TextInput
              style={styles.input}
              value={newEmail}
              onChangeText={(value) => {
                setNewEmail(value);
                setEmailError('');
                setEmailMessage('');
              }}
              placeholder="ejemplo@correo.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={addEmail}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>+ Agregar</Text>
            </TouchableOpacity>
          </View>

          {emailError ? (
            <Text style={styles.errorText}>{emailError}</Text>
          ) : null}

          {emailMessage ? (
            <Text style={styles.successText}>{emailMessage}</Text>
          ) : null}

          <View style={styles.listHeader}>
            <Text style={styles.fieldLabel}>Correos registrados</Text>
            <Text style={styles.counter}>{emails.length}</Text>
          </View>

          {emails.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No tienes correos adicionales.
              </Text>
            </View>
          ) : (
            emails.map((email) => (
              <View key={email} style={styles.emailItem}>
                <View style={styles.emailInfo}>
                  <View style={styles.emailDot}>
                    <Text style={styles.emailDotText}>@</Text>
                  </View>
                  <Text style={styles.emailText}>{email}</Text>
                </View>

                <TouchableOpacity
                  onPress={() => removeEmail(email)}
                  style={styles.removeButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.removeButtonText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            ))
          )}

          <Text style={styles.helperText}>
            Los cambios son temporales y no se guardan en el servidor.
          </Text>
        </View>

        {/* CAMBIAR CONTRASEÑA */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconBox}>
              <Text style={styles.lockIcon}>●</Text>
            </View>

            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>Cambiar contraseña</Text>
              <Text style={styles.description}>
                Actualiza la contraseña de acceso a tu cuenta.
              </Text>
            </View>
          </View>

          <View style={styles.securityNotice}>
            <Text style={styles.noticeTitle}>Seguridad de la cuenta</Text>
            <Text style={styles.noticeText}>
              Utiliza una contraseña de al menos 8 caracteres.
            </Text>
          </View>

          <Text style={styles.fieldLabel}>Contraseña actual</Text>
          <TextInput
            style={styles.input}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Ingresa tu contraseña actual"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            autoCapitalize="none"
          />

          <Text style={styles.fieldLabel}>Nueva contraseña</Text>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Mínimo 8 caracteres"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            autoCapitalize="none"
          />

          <Text style={styles.fieldLabel}>
            Confirmar nueva contraseña
          </Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Repite la nueva contraseña"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            autoCapitalize="none"
          />

          {passwordMessage ? (
            <View style={styles.messageBox}>
              <Text style={styles.messageText}>{passwordMessage}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={styles.passwordButton}
            onPress={handlePasswordChange}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>
              Actualizar contraseña
            </Text>
          </TouchableOpacity>

          <Text style={styles.helperText}>
            La contraseña no se modifica realmente hasta conectar el backend.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 21,
  },
  layout: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    gap: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 22,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#EAF1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: '#2563EB',
    fontSize: 19,
    fontWeight: '700',
  },
  lockIcon: {
    color: '#2563EB',
    fontSize: 17,
  },
  sectionHeading: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 19,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 9,
  },
  idContainer: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    borderRadius: 9,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  idValue: {
    color: '#1F2937',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  readOnlyBadge: {
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  readOnlyText: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '600',
  },
  helperText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 10,
    lineHeight: 18,
  },
  emailForm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  emailFormMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 10,
  },
  input: {
    width: '100%',
    minHeight: 46,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 9,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 14,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
    marginBottom: 15,
  },
  primaryButton: {
    minHeight: 44,
    backgroundColor: '#2563EB',
    borderRadius: 9,
    paddingHorizontal: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    marginTop: 8,
  },
  successText: {
    color: '#15803D',
    fontSize: 12,
    marginTop: 8,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 8,
  },
  counter: {
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 3,
    fontSize: 12,
    fontWeight: '600',
  },
  emailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 9,
    padding: 12,
    marginTop: 8,
  },
  emailInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  emailDot: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailDotText: {
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '700',
  },
  emailText: {
    flex: 1,
    color: '#374151',
    fontSize: 13,
  },
  removeButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 7,
    backgroundColor: '#FEF2F2',
  },
  removeButtonText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    borderRadius: 9,
    padding: 18,
    alignItems: 'center',
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 13,
  },
  securityNotice: {
    backgroundColor: '#EFF6FF',
    borderRadius: 9,
    padding: 14,
    marginBottom: 22,
  },
  noticeTitle: {
    color: '#1D4ED8',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 5,
  },
  noticeText: {
    color: '#1E40AF',
    fontSize: 12,
    lineHeight: 18,
  },
  messageBox: {
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginBottom: 14,
  },
  messageText: {
    color: '#4B5563',
    fontSize: 12,
    lineHeight: 18,
  },
  passwordButton: {
    alignSelf: 'flex-start',
    minHeight: 44,
    backgroundColor: '#2563EB',
    borderRadius: 9,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ConfiguracionTeacher;
