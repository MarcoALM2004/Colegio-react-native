
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import CamaraEdu from './CamaraEdu';

import {
  listarContactos,
  obtenerConversacion,
  enviarMensaje,
  enviarImagen,
  descargarImagen,
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

  const messagesScrollRef = useRef(null);
  const shouldScrollToEnd = useRef(false);

  const [contacts, setContacts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [imageUris, setImageUris] = useState({});

  const [search, setSearch] = useState('');
  const [messageText, setMessageText] = useState('');

  const [loading, setLoading] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState('');

  const [cameraVisible, setCameraVisible] = useState(false);
  const [sendingImage, setSendingImage] = useState(false);

  const selected = contacts.find(
    (contact) => Number(contact.id) === Number(selectedId)
  );

  const obtenerNombre = (contact) =>
    `${contact.nombres || ''} ${contact.apellidos || ''}`.trim();

  const obtenerIniciales = (contact) =>
    `${(contact.nombres || '').charAt(0)}${(
      contact.apellidos || ''
    ).charAt(0)}`.toUpperCase();

  const obtenerUrlImagen = (url) => {
    if (!url || typeof url !== 'string') return null;

    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    return `${API_URL.replace(/\/+$/, '')}/${url.replace(/^\/+/, '')}`;
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

  // Descargar imágenes protegidas con JWT.
  useEffect(() => {
    let activo = true;

    const cargarImagenes = async () => {
      for (const message of messages) {
        const url = obtenerUrlImagen(
          message.archivoUrl ||
          message.archivo_url ||
          message.urlArchivo ||
          message.url_archivo
        );

        if (!url || !message.id || imageUris[message.id]) {
          continue;
        }

        try {
          const uriLocal = await descargarImagen(url, message.id);

          if (!activo) return;

          setImageUris((actuales) => ({
            ...actuales,
            [message.id]: uriLocal,
          }));
        } catch (err) {
          console.warn(
            `No se pudo cargar la fotografía del mensaje ${message.id}:`,
            err.message
          );
        }
      }
    };

    cargarImagenes();

    return () => {
      activo = false;
    };
  }, [messages, imageUris]);

  // CARGAR CONTACTOS.
  const cargarContactos = useCallback(
    async (silencioso = false) => {
      if (!usuarioId) {
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

  // CARGAR CONVERSACIÓN.
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

        shouldScrollToEnd.current = true;
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

  // Seleccionar contacto.
  const seleccionarContacto = (contactoId) => {
    shouldScrollToEnd.current = true;
    setSelectedId(contactoId);
    setMessageText('');
  };

  // Desplazar mensajes al final.
  const desplazarAlFinal = () => {
    if (!shouldScrollToEnd.current) return;

    requestAnimationFrame(() => {
      messagesScrollRef.current?.scrollToEnd({
        animated: true,
      });
      shouldScrollToEnd.current = false;
    });
  };

  // Enviar mensaje de texto.
  const enviarTexto = async () => {
    if (!messageText.trim() || !selected || sending) return;

    try {
      setSending(true);
      shouldScrollToEnd.current = true;

      await enviarMensaje({
        remitenteId: usuarioId,
        destinatarioId: Number(selected.id),
        contenido: messageText.trim(),
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

  // Enviar fotografía.
  const confirmarEnvioImagen = async (imagen) => {
    if (!imagen?.uri) {
      Alert.alert('Fotografía', 'No se recibió una imagen válida.');
      return;
    }

    if (!selected) {
      Alert.alert('Fotografía', 'Selecciona un contacto primero.');
      return;
    }

    try {
      setSendingImage(true);
      shouldScrollToEnd.current = true;

      await enviarImagen({
        remitenteId: usuarioId,
        destinatarioId: Number(selected.id),
        imagen,
      });

      setCameraVisible(false);

      await cargarConversacion(selected.id, true);
      await cargarContactos(true);

      Alert.alert(
        'Fotografía',
        'La fotografía se envió correctamente.'
      );
    } catch (err) {
      Alert.alert(
        'Error al enviar fotografía',
        err.message || 'No se pudo enviar la fotografía.'
      );
    } finally {
      setSendingImage(false);
    }
  };

  // Filtrar contactos.
  const contactosFiltrados = useMemo(() => {
    const texto = search.trim().toLowerCase();

    if (!texto) return contacts;

    return contacts.filter((contact) =>
      obtenerNombre(contact).toLowerCase().includes(texto)
    );
  }, [contacts, search]);

  // Renderizar contacto.
  const renderContact = (contact) => {
    const active =
      Number(contact.id) === Number(selectedId);

    return (
      <TouchableOpacity
        key={contact.id}
        style={[
          styles.contactItem,
          active && styles.contactActive,
        ]}
        onPress={() => seleccionarContacto(contact.id)}
        activeOpacity={0.75}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {obtenerIniciales(contact)}
          </Text>
        </View>

        <View style={styles.contactInfo}>
          <Text style={styles.name} numberOfLines={1}>
            {obtenerNombre(contact)}
          </Text>

          <Text style={styles.preview} numberOfLines={1}>
            {contact.ultimoMensaje || 'Inicia una conversación'}
          </Text>
        </View>

        <View style={styles.contactRight}>
          <Text style={styles.time}>
            {formatearHora(contact.ultimoEnvio)}
          </Text>

          {!!contact.noLeidos && (
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

  // Renderizar mensaje.
  const renderMessage = (message) => {
    const mine = Number(message.remitenteId) === usuarioId;

    const imageUrl = obtenerUrlImagen(
      message.archivoUrl ||
      message.archivo_url ||
      message.urlArchivo ||
      message.url_archivo
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
            imageUris[message.id] ? (
              <Image
                source={{ uri: imageUris[message.id] }}
                style={styles.messageImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[
                styles.messageImage,
                styles.imageLoading,
              ]}>
                <ActivityIndicator
                  size="small"
                  color="#2563EB"
                />
              </View>
            )
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
              mine && styles.myText,
            ]}
          >
            {formatearHora(
              message.enviadoEn || message.enviado_en
            )}
          </Text>
        </View>
      </View>
    );
  };

  // Actualizar contactos.
  const actualizar = () => {
    setRefreshing(true);
    cargarContactos();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View
          style={[
            styles.contactsPanel,
            isMobile && styles.mobilePanel,
            isMobile && selectedId && styles.hiddenPanel,
          ]}
        >
          <View style={styles.searchContainer}>
            <Ionicons
              name="search-outline"
              size={18}
              color="#64748B"
            />

            <TextInput
              style={styles.searchInput}
              placeholder="Buscar contacto..."
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator
                size="large"
                color="#2563EB"
              />
              <Text style={styles.loadingText}>
                Cargando contactos...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.center}>
              <Text style={styles.errorText}>{error}</Text>

              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => cargarContactos()}
              >
                <Text style={styles.retryText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView
              style={styles.contactsScroll}
              contentContainerStyle={styles.contactsScrollContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={actualizar}
                />
              }
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
            >
              {contactosFiltrados.length === 0 ? (
                <Text style={styles.emptyText}>
                  No se encontraron contactos.
                </Text>
              ) : (
                contactosFiltrados.map(renderContact)
              )}
            </ScrollView>
          )}
        </View>

        <View
          style={[
            styles.chat,
            isMobile && !selectedId && styles.hiddenPanel,
            isMobile && styles.mobileChat,
          ]}
        >
          {selected ? (
            <>
              <View style={styles.chatHeader}>
                {isMobile && (
                  <TouchableOpacity
                    onPress={() => setSelectedId(null)}
                    style={styles.backButton}
                  >
                    <Ionicons
                      name="arrow-back"
                      size={22}
                      color="#1E293B"
                    />
                  </TouchableOpacity>
                )}

                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {obtenerIniciales(selected)}
                  </Text>
                </View>

                <View style={styles.chatHeaderInfo}>
                  <Text style={styles.name} numberOfLines={1}>
                    {obtenerNombre(selected)}
                  </Text>

                  <Text style={styles.role}>
                    {selected.rol || 'Contacto'}
                  </Text>
                </View>
              </View>

              <KeyboardAvoidingView
                style={styles.chatBody}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={0}
              >
                <ScrollView
                  ref={messagesScrollRef}
                  style={styles.messagesArea}
                  contentContainerStyle={styles.messages}
                  keyboardShouldPersistTaps="handled"
                  nestedScrollEnabled
                  onContentSizeChange={desplazarAlFinal}
                >
                  {loadingChat ? (
                    <ActivityIndicator
                      size="large"
                      color="#2563EB"
                    />
                  ) : messages.length === 0 ? (
                    <Text style={styles.emptyText}>
                      Todavía no hay mensajes. ¡Empieza la conversación!
                    </Text>
                  ) : (
                    messages.map(renderMessage)
                  )}
                </ScrollView>

                <View style={styles.inputArea}>
                  <TouchableOpacity
                    style={styles.attachButton}
                    onPress={() => setCameraVisible(true)}
                    disabled={sendingImage}
                  >
                    {sendingImage ? (
                      <ActivityIndicator color="#2563EB" />
                    ) : (
                      <Ionicons
                        name="camera-outline"
                        size={24}
                        color="#2563EB"
                      />
                    )}
                  </TouchableOpacity>

                  <TextInput
                    style={styles.messageInput}
                    placeholder="Escribe un mensaje..."
                    placeholderTextColor="#94A3B8"
                    value={messageText}
                    onChangeText={setMessageText}
                    multiline
                    maxLength={2000}
                  />

                  <TouchableOpacity
                    style={[
                      styles.sendButton,
                      (!messageText.trim() || sending) &&
                        styles.sendButtonDisabled,
                    ]}
                    onPress={enviarTexto}
                    disabled={sending || !messageText.trim()}
                  >
                    {sending ? (
                      <ActivityIndicator
                        color="#FFFFFF"
                        size="small"
                      />
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
            </>
          ) : (
            <View style={styles.center}>
              <Ionicons
                name="chatbubbles-outline"
                size={48}
                color="#94A3B8"
              />
              <Text style={styles.emptyText}>
                Selecciona un contacto para comenzar.
              </Text>
            </View>
          )}
        </View>
      </View>

      <CamaraEdu
        visible={cameraVisible}
        onClose={() => setCameraVisible(false)}
        onSend={confirmarEnvioImagen}
        sending={sendingImage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 0,
    backgroundColor: '#FFFFFF',
  },

  header: {
    flexShrink: 0,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },

  title: {
    fontSize: 21,
    fontWeight: '800',
    color: '#0F172A',
  },

  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
  },

  content: {
    flex: 1,
    minHeight: 0,
    flexDirection: 'row',
    overflow: 'hidden',
  },

  contactsPanel: {
    width: 300,
    minHeight: 0,
    flexShrink: 0,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },

  mobilePanel: {
    width: '100%',
    flex: 1,
    borderRightWidth: 0,
  },

  hiddenPanel: {
    display: 'none',
  },

  contactsScroll: {
    flex: 1,
    minHeight: 0,
  },

  contactsScrollContent: {
    flexGrow: 1,
  },

  searchContainer: {
    flexShrink: 0,
    margin: 12,
    paddingHorizontal: 11,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    color: '#1E293B',
    paddingVertical: 0,
  },

  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  contactActive: {
    backgroundColor: '#EFF6FF',
  },

  avatar: {
    width: 39,
    height: 39,
    flexShrink: 0,
    borderRadius: 20,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontSize: 13,
    fontWeight: '800',
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
    flexShrink: 0,
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
    minHeight: 0,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },

  mobileChat: {
    width: '100%',
  },

  chatHeader: {
    flexShrink: 0,
    minHeight: 66,
    padding: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },

  chatHeaderInfo: {
    flex: 1,
    minWidth: 0,
  },

  role: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 3,
  },

  backButton: {
    paddingRight: 4,
  },

  chatBody: {
    flex: 1,
    minHeight: 0,
    backgroundColor: '#FFFFFF',
  },

  messagesArea: {
    flex: 1,
    minHeight: 0,
    backgroundColor: '#F8FAFC',
  },

  messages: {
    flexGrow: 1,
    padding: 13,
    gap: 11,
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
    minWidth: 55,
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
    color: '#1E293B',
    marginBottom: 5,
  },

  messageText: {
    fontSize: 13,
    color: '#1E293B',
    lineHeight: 19,
  },

  myText: {
    color: '#FFFFFF',
  },

  messageTime: {
    fontSize: 9,
    color: '#94A3B8',
    textAlign: 'right',
    marginTop: 5,
  },

  messageImage: {
    width: 220,
    height: 180,
    maxWidth: '100%',
    borderRadius: 10,
    marginBottom: 7,
    backgroundColor: '#E2E8F0',
  },

  imageLoading: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  inputArea: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },

  attachButton: {
    width: 42,
    height: 42,
    flexShrink: 0,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
  },

  messageInput: {
    flex: 1,
    minWidth: 0,
    minHeight: 42,
    maxHeight: 110,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1E293B',
  },

  sendButton: {
    width: 42,
    height: 42,
    flexShrink: 0,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
  },

  sendButtonDisabled: {
    opacity: 0.55,
  },

  center: {
    flex: 1,
    minHeight: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  loadingText: {
    marginTop: 10,
    color: '#64748B',
    fontSize: 12,
  },

  errorText: {
    color: '#DC2626',
    fontSize: 13,
    textAlign: 'center',
  },

  retryButton: {
    marginTop: 12,
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#2563EB',
  },

  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  emptyText: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    padding: 20,
  },
});
