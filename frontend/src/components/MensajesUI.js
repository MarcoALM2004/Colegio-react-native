import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import CamaraEdu from './CamaraEdu';
import { Ionicons } from '@expo/vector-icons';

import {
  listarContactos,
  obtenerConversacion,
  enviarMensaje,
  enviarImagen,
} from '../service/mensajeService';

import { API_URL } from '../config/api';

export default function MensajesUI({
  title = 'Mensajes',
  subtitle = 'Mantente en contacto.',
  usuario,
  isTeacher = false,
}) {
  const { width } = useWindowDimensions();
  const isMobile = width < 700;

  const usuarioId = Number(usuario?.id);

  const [contacts, setContacts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);

  const [search, setSearch] = useState('');
  const [messageText, setMessageText] = useState('');

  const [loading, setLoading] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState('');

  // Cámara CamaraEdu.
  const [cameraVisible, setCameraVisible] = useState(false);
  const [sendingImage, setSendingImage] = useState(false);

  const selected = contacts.find(
    (contact) => Number(contact.id) === Number(selectedId)
  );

  const obtenerNombre = (contact) =>
    `${contact.nombres || ''} ${contact.apellidos || ''}`.trim();

  const obtenerIniciales = (contact) => {
    return `${(contact.nombres || '').charAt(0)}${(
      contact.apellidos || ''
    ).charAt(0)}`.toUpperCase();
  };

  const obtenerUrlImagen = (url) => {
    if (!url) return null;

    if (
      url.startsWith('http://') ||
      url.startsWith('https://')
    ) {
      return url;
    }

    return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const formatearHora = (fecha) => {
    if (!fecha) return '';

    const date = new Date(fecha);

    if (Number.isNaN(date.getTime())) return '';

    return date.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatearFechaContacto = (fecha) => {
    if (!fecha) return '';

    const date = new Date(fecha);

    if (Number.isNaN(date.getTime())) return '';

    const ahora = new Date();

    if (date.toDateString() === ahora.toDateString()) {
      return formatearHora(fecha);
    }

    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
    });
  };

  const filteredContacts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return contacts;

    return contacts.filter((contact) => {
      const nombre = obtenerNombre(contact);

      return nombre.toLowerCase().includes(query);
    });
  }, [contacts, search]);

  // ==========================================
  // CARGAR CONTACTOS
  // ==========================================

  const cargarContactos = useCallback(
    async (silencioso = false) => {
      if (!usuarioId || usuarioId <= 0) {
        setError('No se pudo identificar al usuario.');
        setLoading(false);
        return;
      }

      try {
        if (!silencioso) setLoading(true);

        const data = await listarContactos(usuarioId);
        const lista = Array.isArray(data) ? data : [];

        setContacts(lista);

        setSelectedId((actual) => {
          if (
            actual &&
            lista.some(
              (contact) => Number(contact.id) === Number(actual)
            )
          ) {
            return actual;
          }

          if (!isMobile && lista.length > 0) {
            return lista[0].id;
          }

          return null;
        });

        setError('');
      } catch (err) {
        if (!silencioso) {
          setError(
            err.message || 'No se pudieron cargar los contactos.'
          );
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [usuarioId, isMobile]
  );

  // ==========================================
  // CARGAR CONVERSACIÓN
  // ==========================================

  const cargarConversacion = useCallback(
    async (contactoId, silencioso = false) => {
      if (!usuarioId || !contactoId) return;

      try {
        if (!silencioso) setLoadingChat(true);

        const data = await obtenerConversacion(
          usuarioId,
          contactoId
        );

        setMessages(Array.isArray(data) ? data : []);

        setContacts((previous) =>
          previous.map((contact) =>
            Number(contact.id) === Number(contactoId)
              ? { ...contact, noLeidos: 0 }
              : contact
          )
        );
      } catch (err) {
        if (!silencioso) {
          Alert.alert(
            'Mensajes',
            err.message || 'No se pudo cargar la conversación.'
          );
        }
      } finally {
        setLoadingChat(false);
      }
    },
    [usuarioId]
  );

  useEffect(() => {
    cargarContactos();
  }, [cargarContactos]);

  useEffect(() => {
    if (selectedId) {
      cargarConversacion(selectedId);
    } else {
      setMessages([]);
    }
  }, [selectedId, cargarConversacion]);

  // Actualización periódica.
  useEffect(() => {
    if (!usuarioId) return undefined;

    const intervalo = setInterval(() => {
      cargarContactos(true);

      if (selectedId) {
        cargarConversacion(selectedId, true);
      }
    }, 5000);

    return () => clearInterval(intervalo);
  }, [
    usuarioId,
    selectedId,
    cargarContactos,
    cargarConversacion,
  ]);

  // ==========================================
  // SELECCIONAR CONTACTO
  // ==========================================

  const seleccionarContacto = (contactoId) => {
    setSelectedId(contactoId);
    setMessageText('');
  };

  // ==========================================
  // ENVIAR TEXTO
  // ==========================================

  const handleSendMessage = async () => {
    const contenido = messageText.trim();

    if (!contenido || !selected || sending) return;

    try {
      setSending(true);

      await enviarMensaje({
        remitenteId: usuarioId,
        destinatarioId: Number(selected.id),
        contenido,
      });

      setMessageText('');

      await cargarConversacion(selected.id, true);
      await cargarContactos(true);
    } catch (err) {
      Alert.alert(
        'No se pudo enviar',
        err.message || 'Ocurrió un error al enviar el mensaje.'
      );
    } finally {
      setSending(false);
    }
  };

  // ==========================================
  // ABRIR CÁMARA
  // ==========================================

  const abrirCamara = () => {
    if (!selected || sendingImage || sending) return;

    setCameraVisible(true);
  };


  // ==========================================
  // ENVIAR FOTOGRAFÍA
  // ==========================================

  const confirmarEnvioImagen = async (imagen) => {
    if (!imagen?.uri || !selected || sendingImage) {
      return false;
    }

    try {
      setSendingImage(true);

      await enviarImagen({
        remitenteId: usuarioId,
        destinatarioId: Number(selected.id),
        imagen,
      });

      setCameraVisible(false);

      await cargarConversacion(selected.id, true);
      await cargarContactos(true);

      Alert.alert(
        'Fotografía enviada',
        'La fotografía se envió correctamente.'
      );

      return true;

    } catch (err) {
      Alert.alert(
        'No se pudo enviar',
        err.message || 'Ocurrió un error al enviar la fotografía.'
      );

      return false;

    } finally {
      setSendingImage(false);
    }
  };
  
  // ==========================================
  // ACTUALIZAR
  // ==========================================

  const actualizar = () => {
    setRefreshing(true);
    cargarContactos();
    if (selectedId) cargarConversacion(selectedId, true);
  };

  // ==========================================
  // CONTACTOS
  // ==========================================

  const renderContact = (contact) => {
    const activo =
      Number(selectedId) === Number(contact.id);

    const nombre = obtenerNombre(contact);

    return (
      <TouchableOpacity
        key={contact.id}
        activeOpacity={0.75}
        onPress={() => seleccionarContacto(contact.id)}
        style={[
          styles.contact,
          activo && styles.activeContact,
        ]}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {obtenerIniciales(contact)}
          </Text>
        </View>

        <View style={styles.contactInfo}>
          <Text style={styles.name} numberOfLines={1}>
            {nombre}
          </Text>

          <Text style={styles.preview} numberOfLines={1}>
            {contact.ultimoMensaje || 'Inicia una conversación'}
          </Text>
        </View>

        <View style={styles.contactRight}>
          <Text style={styles.time}>
            {formatearFechaContacto(
              contact.fechaUltimoMensaje
            )}
          </Text>

          {Number(contact.noLeidos) > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {contact.noLeidos}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // ==========================================
  // MENSAJES
  // ==========================================

  const renderMessage = (message) => {
    const mine =
      Number(message.remitenteId) === usuarioId;

    const imageUrl = obtenerUrlImagen(
      message.archivoUrl || message.archivo_url
    );

    return (
      <View
        key={message.id}
        style={[
          styles.messageRow,
          mine && styles.myRow,
        ]}
      >
        <View
          style={[
            styles.bubble,
            mine && styles.myBubble,
          ]}
        >
          {!!message.asunto && (
            <Text
              style={[
                styles.messageSubject,
                mine && styles.myText,
              ]}
            >
              {message.asunto}
            </Text>
          )}

          {imageUrl && (
            <Image
              source={{ uri: imageUrl }}
              style={styles.messageImage}
              resizeMode="cover"
            />
          )}

          {!!message.contenido && (
            <Text
              style={[
                styles.messageText,
                mine && styles.myText,
              ]}
            >
              {message.contenido}
            </Text>
          )}

          <Text
            style={[
              styles.messageTime,
              mine && styles.myTime,
            ]}
          >
            {formatearHora(message.enviadoEn)}
            {mine
              ? message.leido
                ? '  ✓✓'
                : '  ✓'
              : ''}
          </Text>
        </View>
      </View>
    );
  };

  // ==========================================
  // VISTA PRINCIPAL
  // ==========================================

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <View
        style={[
          styles.panel,
          isMobile && styles.mobilePanel,
        ]}
      >
        {/* CONTACTOS */}

        {(!isMobile || !selectedId) && (
          <View
            style={[
              styles.sidebar,
              isMobile && styles.mobileSidebar,
            ]}
          >
            <View style={styles.sidebarHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  Conversaciones
                </Text>

                <Text style={styles.sectionSubtitle}>
                  {contacts.length} contacto(s)
                </Text>
              </View>

              <TouchableOpacity
                onPress={actualizar}
                style={styles.refreshButton}
              >
                <Ionicons
                  name="refresh"
                  size={19}
                  color="#2563EB"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons
                name="search"
                size={18}
                color="#94A3B8"
              />

              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder={
                  isTeacher
                    ? 'Buscar estudiante...'
                    : 'Buscar docente...'
                }
                placeholderTextColor="#94A3B8"
                style={styles.search}
              />
            </View>

            {loading ? (
              <ActivityIndicator
                size="large"
                color="#2563EB"
                style={styles.loader}
              />
            ) : error ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.errorText}>{error}</Text>

                <TouchableOpacity
                  onPress={() => cargarContactos()}
                  style={styles.retryButton}
                >
                  <Text style={styles.retryText}>
                    Reintentar
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView
                style={styles.list}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={actualizar}
                  />
                }
              >
                {filteredContacts.map(renderContact)}

                {filteredContacts.length === 0 && (
                  <Text style={styles.empty}>
                    No se encontraron contactos.
                  </Text>
                )}
              </ScrollView>
            )}
          </View>
        )}

        {/* CONVERSACIÓN */}

        {(!isMobile || selectedId) && selected && (
          <KeyboardAvoidingView
            style={styles.chat}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.chatHeader}>
              {isMobile && (
                <TouchableOpacity
                  onPress={() => setSelectedId(null)}
                  style={styles.backButton}
                >
                  <Ionicons
                    name="arrow-back"
                    size={23}
                    color="#2563EB"
                  />
                </TouchableOpacity>
              )}

              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {obtenerIniciales(selected)}
                </Text>
              </View>

              <View style={styles.contactInfo}>
                <Text style={styles.name}>
                  {obtenerNombre(selected)}
                </Text>

                <Text style={styles.role}>
                  {selected.rol === 'DOCENTE'
                    ? 'Docente'
                    : selected.rol === 'ADMIN'
                      ? 'Administrador'
                      : 'Estudiante'}
                </Text>
              </View>
            </View>

            {loadingChat ? (
              <View style={styles.chatLoader}>
                <ActivityIndicator
                  size="large"
                  color="#2563EB"
                />
              </View>
            ) : (
              <ScrollView
                style={styles.messagesArea}
                contentContainerStyle={styles.messages}
              >
                {messages.map(renderMessage)}

                {messages.length === 0 && (
                  <View style={styles.emptyChat}>
                    <Ionicons
                      name="chatbubble-ellipses-outline"
                      size={40}
                      color="#94A3B8"
                    />

                    <Text style={styles.emptyTitle}>
                      Inicia la conversación
                    </Text>

                    <Text style={styles.emptyText}>
                      Envía el primer mensaje a{' '}
                      {selected.nombres}.
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}

            {/* COMPOSITOR */}

            <View style={styles.composer}>
              <TouchableOpacity
                onPress={abrirCamara}
                disabled={sendingImage || sending}
                style={styles.cameraButton}
              >
                <Ionicons
                  name="camera"
                  size={24}
                  color="#2563EB"
                />
              </TouchableOpacity>

              <TextInput
                value={messageText}
                onChangeText={setMessageText}
                onSubmitEditing={handleSendMessage}
                placeholder="Escribe un mensaje..."
                placeholderTextColor="#94A3B8"
                style={styles.input}
                multiline
                maxLength={5000}
              />

              <TouchableOpacity
                onPress={handleSendMessage}
                disabled={!messageText.trim() || sending}
                style={[
                  styles.sendButton,
                  (!messageText.trim() || sending) &&
                    styles.disabledButton,
                ]}
              >
                {sending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Ionicons
                    name="send"
                    size={19}
                    color="#FFFFFF"
                  />
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}

        {!loading && !error && !selected && (
          <View style={styles.noChat}>
            <View style={styles.emptyContainer}>
              <Ionicons
                name="chatbubbles-outline"
                size={44}
                color="#94A3B8"
              />

              <Text style={styles.emptyTitle}>
                {contacts.length === 0
                  ? 'Todavía no tienes contactos'
                  : 'Selecciona una conversación'}
              </Text>

              <Text style={styles.emptyText}>
                {contacts.length === 0
                  ? 'Los contactos aparecerán cuando exista una relación académica activa.'
                  : 'Elige un contacto para consultar sus mensajes.'}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* CÁMARA CAMARAEDU */}

      <CamaraEdu
        visible={cameraVisible}
        onClose={() => setCameraVisible(false)}
        onSend={confirmarEnvioImagen}
        sending={sendingImage}
      />
    </View>
  );
}

// ==========================================
// ESTILOS
// ==========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    padding: 14,
    backgroundColor: '#F8FAFC',
  },

  heading: {
    marginBottom: 14,
  },

  title: {
    fontSize: 23,
    fontWeight: '700',
    color: '#172554',
  },

  subtitle: {
    marginTop: 4,
    fontSize: 12,
    color: '#64748B',
  },

  panel: {
    flex: 1,
    minHeight: 450,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    overflow: 'hidden',
  },

  mobilePanel: {
    minHeight: 480,
  },

  sidebar: {
    width: 310,
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },

  mobileSidebar: {
    width: '100%',
    borderRightWidth: 0,
  },

  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#172554',
  },

  sectionSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 3,
  },

  refreshButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#DCE3EC',
    borderRadius: 10,
    paddingHorizontal: 11,
    marginBottom: 10,
  },

  search: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 13,
    color: '#334155',
  },

  list: {
    flex: 1,
  },

  contact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 10,
    marginBottom: 5,
  },

  activeContact: {
    backgroundColor: '#EFF6FF',
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
  },

  contactInfo: {
    flex: 1,
    minWidth: 0,
  },

  name: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },

  preview: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 5,
  },

  contactRight: {
    alignItems: 'flex-end',
    gap: 6,
  },

  time: {
    fontSize: 9,
    color: '#94A3B8',
  },

  unreadBadge: {
    minWidth: 19,
    height: 19,
    borderRadius: 10,
    paddingHorizontal: 5,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  unreadText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  chat: {
    flex: 1,
    minWidth: 0,
  },

  chatHeader: {
    minHeight: 66,
    padding: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },

  role: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 3,
  },

  backButton: {
    paddingRight: 4,
  },

  messagesArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  messages: {
    padding: 13,
    gap: 11,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },

  messageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },

  myRow: {
    justifyContent: 'flex-end',
  },

  bubble: {
    maxWidth: '88%',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  myBubble: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },

  messageSubject: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 5,
  },

  messageText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 19,
  },

  myText: {
    color: '#FFFFFF',
  },

  messageImage: {
    width: 220,
    height: 190,
    borderRadius: 10,
    marginBottom: 5,
    backgroundColor: '#E2E8F0',
  },

  messageTime: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 6,
    textAlign: 'right',
  },

  myTime: {
    color: '#DBEAFE',
  },

  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 7,
    padding: 9,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },

  cameraButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
  },

  input: {
    flex: 1,
    maxHeight: 105,
    minHeight: 42,
    borderWidth: 1,
    borderColor: '#DCE3EC',
    borderRadius: 12,
    paddingHorizontal: 11,
    paddingVertical: 10,
    fontSize: 13,
    color: '#334155',
  },

  sendButton: {
    width: 42,
    height: 42,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  disabledButton: {
    backgroundColor: '#94A3B8',
  },

  loader: {
    marginTop: 35,
  },

  chatLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  noChat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyChat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
    marginTop: 8,
  },

  emptyText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 7,
    lineHeight: 18,
  },

  errorText: {
    fontSize: 12,
    color: '#DC2626',
    textAlign: 'center',
  },

  retryButton: {
    marginTop: 12,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },

  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },

  empty: {
    padding: 20,
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
  },

  // Vista previa.

  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },

  previewContainer: {
    width: '100%',
    maxWidth: 430,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
  },

  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  previewTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#172554',
  },

  previewImage: {
    width: '100%',
    height: 350,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },

  previewActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },

  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },

  cancelText: {
    color: '#475569',
    fontWeight: '600',
  },

  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    minWidth: 105,
  },

  confirmText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
