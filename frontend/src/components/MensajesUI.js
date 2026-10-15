
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';

export default function MensajesUI({
  title = 'Mensajes',
  subtitle = 'Mantente en contacto.',
  contacts = [],
  isTeacher = false,
}) {
  const { width } = useWindowDimensions();
  const isMobile = width < 700;

  const [conversations, setConversations] = useState(contacts);
  const [selectedId, setSelectedId] = useState(contacts[0]?.id ?? null);
  const [search, setSearch] = useState('');
  const [messageText, setMessageText] = useState('');

  const selected = conversations.find((c) => c.id === selectedId);

  const filtered = useMemo(
    () =>
      conversations.filter((c) =>
        (c.name || c.nombre || '')
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [conversations, search]
  );

  const sendMessage = () => {
    const value = messageText.trim();
    if (!value || !selected) return;

    const time = new Date().toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
    });

    setConversations((previous) =>
      previous.map((c) =>
        c.id === selectedId
          ? {
              ...c,
              ultimo: value,
              hora: time,
              messages: [
                ...(c.messages || c.mensajes || []),
                isTeacher
                  ? { id: Date.now().toString(), text: value, time, mine: true }
                  : { deMi: true, texto: value, hora: time },
              ],
            }
          : c
      )
    );

    setMessageText('');
  };

  const getName = (c) => c.name || c.nombre;
  const getAvatar = (c) => c.avatar || c.iniciales;
  const getMessages = (c) => c.messages || c.mensajes || [];
  const getText = (m) => m.text ?? m.texto ?? '';
  const getTime = (m) => m.time ?? m.hora ?? '';
  const isMine = (m) => m.mine ?? m.deMi ?? false;

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <View style={[styles.panel, isMobile && styles.mobilePanel]}>
        {(!isMobile || !selectedId) && (
          <View style={[styles.sidebar, isMobile && styles.mobileSidebar]}>
            <Text style={styles.sectionTitle}>Conversaciones</Text>

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={`Buscar ${isTeacher ? 'estudiante' : 'profesor'}...`}
              placeholderTextColor="#94A3B8"
              style={styles.search}
            />

            <ScrollView style={styles.list}>
              {filtered.map((c) => {
                const messages = getMessages(c);
                const last = messages[messages.length - 1];

                return (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => setSelectedId(c.id)}
                    style={[
                      styles.contact,
                      selectedId === c.id && styles.activeContact,
                    ]}
                  >
                    <View
                      style={[
                        styles.avatar,
                        { backgroundColor: c.color || '#DBEAFE' },
                      ]}
                    >
                      <Text style={styles.avatarText}>{getAvatar(c)}</Text>
                    </View>

                    <View style={styles.contactInfo}>
                      <Text style={styles.name} numberOfLines={1}>
                        {getName(c)}
                      </Text>
                      <Text style={styles.preview} numberOfLines={1}>
                        {getText(last) || c.ultimo || 'Sin mensajes'}
                      </Text>
                    </View>

                    <Text style={styles.time}>{c.hora}</Text>
                  </TouchableOpacity>
                );
              })}

              {!filtered.length && (
                <Text style={styles.empty}>Sin conversaciones.</Text>
              )}
            </ScrollView>
          </View>
        )}

        {(!isMobile || selectedId) && selected && (
          <View style={styles.chat}>
            <View style={styles.chatHeader}>
              {isMobile && (
                <TouchableOpacity onPress={() => setSelectedId(null)}>
                  <Text style={styles.back}>‹ Volver</Text>
                </TouchableOpacity>
              )}

              <View
                style={[
                  styles.avatar,
                  { backgroundColor: selected.color || '#DBEAFE' },
                ]}
              >
                <Text style={styles.avatarText}>{getAvatar(selected)}</Text>
              </View>

              <View style={styles.contactInfo}>
                <Text style={styles.name}>{getName(selected)}</Text>
                <Text style={styles.role}>
                  {isTeacher ? selected.role || 'Estudiante' : 'Profesor'}
                </Text>
              </View>
            </View>

            <ScrollView
              style={styles.messagesArea}
              contentContainerStyle={styles.messages}
            >
              {getMessages(selected).map((m, index) => (
                <View
                  key={m.id || `${selected.id}-${index}`}
                  style={[
                    styles.messageRow,
                    isMine(m) && styles.myRow,
                  ]}
                >
                  <View
                    style={[
                      styles.bubble,
                      isMine(m) && styles.myBubble,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        isMine(m) && styles.myText,
                      ]}
                    >
                      {getText(m)}
                    </Text>
                    <Text
                      style={[
                        styles.messageTime,
                        isMine(m) && styles.myTime,
                      ]}
                    >
                      {getTime(m)}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.composer}>
              <TextInput
                value={messageText}
                onChangeText={setMessageText}
                onSubmitEditing={sendMessage}
                placeholder="Escribe un mensaje..."
                placeholderTextColor="#94A3B8"
                style={styles.input}
                returnKeyType="send"
              />
              <TouchableOpacity
                onPress={sendMessage}
                disabled={!messageText.trim()}
                style={[
                  styles.sendButton,
                  !messageText.trim() && styles.disabledButton,
                ]}
              >
                <Text style={styles.sendText}>Enviar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {!selected && (
          <Text style={styles.empty}>Selecciona una conversación.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    minWidth: 0,
    padding: 20,
    backgroundColor: '#F8FAFC',
  },
  heading: { marginBottom: 20 },
  title: { fontSize: 25, fontWeight: '700', color: '#172554' },
  subtitle: { marginTop: 4, fontSize: 13, color: '#64748B' },
  panel: {
    flex: 1,
    minHeight: 430,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  mobilePanel: { minHeight: 520 },
  sidebar: {
    width: 300,
    minWidth: 0,
    padding: 14,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  mobileSidebar: { width: '100%', borderRightWidth: 0 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#172554',
    marginBottom: 12,
  },
  search: {
    borderWidth: 1,
    borderColor: '#DCE3EC',
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontSize: 12,
    marginBottom: 10,
    color: '#334155',
  },
  list: { flex: 1, minHeight: 0 },
  contact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 8,
    marginBottom: 4,
  },
  activeContact: { backgroundColor: '#EFF6FF' },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: { fontSize: 12, fontWeight: '700', color: '#1D4ED8' },
  contactInfo: { flex: 1, minWidth: 0 },
  name: { fontSize: 12, fontWeight: '700', color: '#1E293B' },
  preview: { fontSize: 11, color: '#64748B', marginTop: 5 },
  time: { fontSize: 9, color: '#94A3B8' },
  chat: { flex: 1, minWidth: 0 },
  chatHeader: {
    minHeight: 62,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  role: { fontSize: 10, color: '#64748B', marginTop: 2 },
  back: { color: '#2563EB', fontSize: 12 },
  messagesArea: { flex: 1, minHeight: 250, backgroundColor: '#F8FAFC' },
  messages: { padding: 16, gap: 12, flexGrow: 1 },
  messageRow: { flexDirection: 'row', justifyContent: 'flex-start' },
  myRow: { justifyContent: 'flex-end' },
  bubble: {
    maxWidth: '85%',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  myBubble: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  messageText: { fontSize: 12, color: '#334155', lineHeight: 18 },
  myText: { color: '#FFFFFF' },
  messageTime: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 6,
    textAlign: 'right',
  },
  myTime: { color: '#DBEAFE' },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderColor: '#DCE3EC',
    borderRadius: 8,
    paddingHorizontal: 11,
    paddingVertical: 10,
    fontSize: 12,
    color: '#334155',
  },
  sendButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 7,
  },
  disabledButton: { backgroundColor: '#94A3B8' },
  sendText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  empty: { padding: 20, color: '#64748B', fontSize: 12 },
});
