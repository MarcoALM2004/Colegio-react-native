import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import AdminDashboard from '../../components/AdminDashboard';
import { useAdminData } from '../../context/AdminDataContext';
import { EmptyState } from '../../components/admin/AdminUI';
import { colors } from '../../theme/adminTheme';

export default function ChatAdmin() {
  const navigation = useNavigation();
  const { id } = useRoute().params || {};
  const { getConversation, getUser, markAsRead, sendMessage } = useAdminData();

  const [texto, setTexto] = useState('');
  const scrollRef = useRef(null);

  const conversacion = getConversation(id);
  const usuario = conversacion ? getUser(conversacion.usuarioId) : null;

  // Marcar como leída al abrir
  useEffect(() => {
    if (conversacion?.noLeidos) markAsRead(id);
  }, [id, conversacion?.noLeidos, markAsRead]);

  if (!conversacion || !usuario) {
    return (
      <AdminDashboard variant="detail" title="Mensajes">
        <EmptyState icon="chatbubbles-outline" text="La conversación no existe." />
      </AdminDashboard>
    );
  }

  const enviar = () => {
    if (!texto.trim()) return;
    sendMessage(id, texto.trim());
    setTexto('');
  };

  return (
    <AdminDashboard
      variant="detail"
      title={`${usuario.nombres} ${usuario.apellidos}`}
      headerRight={
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.navigate('AdminUsuarioDetalle', { id: usuario.id })}
        >
          <Ionicons name="person-circle-outline" size={24} color={colors.textStrong} />
        </TouchableOpacity>
      }
    >
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.messages}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          <Text style={styles.role}>{usuario.rol}</Text>
          {conversacion.mensajes.length === 0 && (
            <EmptyState icon="chatbubble-outline" text="Escribe el primer mensaje." />
          )}
          {conversacion.mensajes.map((m) => (
            <View key={m.id} style={[styles.bubble, m.deMi ? styles.mine : styles.theirs]}>
              <Text style={[styles.bubbleText, m.deMi && styles.white]}>{m.texto}</Text>
              <Text style={[styles.hour, m.deMi && styles.hourMine]}>{m.hora}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={texto}
            onChangeText={setTexto}
            placeholder="Escribe un mensaje..."
            placeholderTextColor={colors.textMuted}
            onSubmitEditing={enviar}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.send, !texto.trim() && styles.sendDisabled]}
            onPress={enviar}
            disabled={!texto.trim()}
          >
            <Ionicons name="send" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </AdminDashboard>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  white: { color: '#FFFFFF' },
  headerBtn: { padding: 6 },

  messages: { padding: 16, gap: 8, width: '100%', maxWidth: 760, alignSelf: 'center' },
  role: { textAlign: 'center', fontSize: 11, color: colors.textMuted, marginBottom: 6 },

  bubble: { maxWidth: '80%', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14 },
  mine: { alignSelf: 'flex-end', backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  theirs: {
    alignSelf: 'flex-start',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },
  bubbleText: { fontSize: 14, color: colors.textStrong },
  hour: { fontSize: 10, color: colors.textMuted, marginTop: 3, alignSelf: 'flex-end' },
  hourMine: { color: '#DCE7FF' },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
    fontSize: 14,
    color: colors.text,
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendDisabled: { opacity: 0.5 },
});
