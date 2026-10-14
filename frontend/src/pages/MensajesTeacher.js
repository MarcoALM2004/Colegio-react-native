import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, useWindowDimensions} from "react-native";

const initialMessages = [
  {
    id: "1",
    name: "Ana Torres",
    role: "Estudiante · 5° A",
    avatar: "AT",
    messages: [
      {
        id: "m1",
        text: "Profesor, ¿podría explicarme nuevamente el proyecto final?",
        time: "09:15",
        mine: false,
      },
      {
        id: "m2",
        text: "Claro, revisaremos las indicaciones en clase.",
        time: "09:20",
        mine: true,
      },
    ],
  },
  {
    id: "2",
    name: "Luis Mendoza",
    role: "Estudiante · 4° A",
    avatar: "LM",
    messages: [
      {
        id: "m3",
        text: "¿La práctica se entrega mañana?",
        time: "10:30",
        mine: false,
      },
    ],
  },
  {
    id: "3",
    name: "María Flores",
    role: "Estudiante · 5° B",
    avatar: "MF",
    messages: [
      {
        id: "m4",
        text: "Ya envié mi actividad.",
        time: "Ayer",
        mine: false,
      },
    ],
  },
  {
    id: "4",
    name: "Carlos Rojas",
    role: "Estudiante · 4° B",
    avatar: "CR",
    messages: [
      {
        id: "m5",
        text: "Gracias por la explicación, profesor.",
        time: "Ayer",
        mine: false,
      },
    ],
  },
];

export default function MensajesTeacher() {
  const { width } = useWindowDimensions();
  const isMobile = width < 700;

  const [conversations, setConversations] = useState(initialMessages);
  const [selectedId, setSelectedId] = useState("1");
  const [search, setSearch] = useState("");
  const [messageText, setMessageText] = useState("");

  const selectedConversation = conversations.find(
    (conversation) => conversation.id === selectedId
  );

  const filteredConversations = useMemo(
    () =>
      conversations.filter((conversation) =>
        conversation.name.toLowerCase().includes(search.toLowerCase())
      ),
    [conversations, search]
  );

  const sendMessage = () => {
    const text = messageText.trim();
    if (!text || !selectedId) return;

    const newMessage = {
      id: Date.now().toString(),
      text,
      time: new Date().toLocaleTimeString("es-PE", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      mine: true,
    };

    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === selectedId
          ? {
              ...conversation,
              messages: [...conversation.messages, newMessage],
            }
          : conversation
      )
    );

    setMessageText("");
  };

  const showConversation = !isMobile || selectedId !== null;

  return (
    <View style={[styles.container, isMobile && styles.mobileContainer]}>
      <View style={styles.header}>
        <Text style={styles.heading}>Mensajes</Text>
        <Text style={styles.subtitle}>
          Comunícate con tus estudiantes.
        </Text>
      </View>

      <View style={[styles.messagingPanel, isMobile && styles.mobilePanel]}>
        {(!isMobile || !selectedId) && (
          <View style={[styles.sidebar, isMobile && styles.mobileSidebar]}>
            <Text style={styles.sectionTitle}>Conversaciones</Text>

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar estudiante..."
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
            />

            <ScrollView style={styles.conversationList}>
              {filteredConversations.map((conversation) => {
                const lastMessage =
                  conversation.messages[conversation.messages.length - 1];
                const active = conversation.id === selectedId;

                return (
                  <TouchableOpacity
                    key={conversation.id}
                    onPress={() => setSelectedId(conversation.id)}
                    style={[
                      styles.conversation,
                      active && styles.activeConversation,
                    ]}
                  >
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {conversation.avatar}
                      </Text>
                    </View>

                    <View style={styles.conversationInfo}>
                      <Text style={styles.personName} numberOfLines={1}>
                        {conversation.name}
                      </Text>
                      <Text style={styles.personRole} numberOfLines={1}>
                        {conversation.role}
                      </Text>
                      <Text style={styles.lastMessage} numberOfLines={1}>
                        {lastMessage?.text || "Sin mensajes"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {filteredConversations.length === 0 && (
                <Text style={styles.emptyText}>
                  No se encontraron conversaciones.
                </Text>
              )}
            </ScrollView>
          </View>
        )}

        {showConversation && selectedConversation && (
          <View style={styles.chatPanel}>
            <View style={styles.chatHeader}>
              {isMobile && (
                <TouchableOpacity
                  onPress={() => setSelectedId(null)}
                  style={styles.backButton}
                >
                  <Text style={styles.backButtonText}>‹ Volver</Text>
                </TouchableOpacity>
              )}

              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {selectedConversation.avatar}
                </Text>
              </View>

              <View style={styles.chatPerson}>
                <Text style={styles.personName}>
                  {selectedConversation.name}
                </Text>
                <Text style={styles.personRole}>
                  {selectedConversation.role}
                </Text>
              </View>
            </View>

            <ScrollView
              style={styles.messagesArea}
              contentContainerStyle={styles.messagesContent}
            >
              {selectedConversation.messages.map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.messageRow,
                    message.mine && styles.myMessageRow,
                  ]}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      message.mine && styles.myMessageBubble,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        message.mine && styles.myMessageText,
                      ]}
                    >
                      {message.text}
                    </Text>
                    <Text
                      style={[
                        styles.messageTime,
                        message.mine && styles.myMessageTime,
                      ]}
                    >
                      {message.time}
                    </Text>
                  </View>
                </View>
              ))}

              {selectedConversation.messages.length === 0 && (
                <Text style={styles.emptyText}>
                  Inicia la conversación enviando un mensaje.
                </Text>
              )}
            </ScrollView>

            <View style={styles.composer}>
              <TextInput
                value={messageText}
                onChangeText={setMessageText}
                placeholder="Escribe un mensaje..."
                placeholderTextColor="#94A3B8"
                style={styles.messageInput}
                multiline
              />

              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !messageText.trim() && styles.disabledSendButton,
                ]}
                onPress={sendMessage}
                disabled={!messageText.trim()}
              >
                <Text style={styles.sendButtonText}>Enviar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {isMobile && !selectedId && filteredConversations.length === 0 && (
          <Text style={styles.emptyText}>
            No se encontraron conversaciones.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    minWidth: 0,
    alignSelf: "stretch",
    padding: 20,
    backgroundColor: "#F8FAFC",
  },
  mobileContainer: {
    padding: 12,
  },
  header: {
    marginBottom: 20,
  },
  heading: {
    fontSize: 25,
    fontWeight: "700",
    color: "#172554",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748B",
  },
  messagingPanel: {
    flex: 1,
    minHeight: 500,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    overflow: "hidden",
  },
  mobilePanel: {
    minHeight: 520,
  },
  sidebar: {
    width: 300,
    borderRightWidth: 1,
    borderRightColor: "#E2E8F0",
    padding: 14,
  },
  mobileSidebar: {
    width: "100%",
    borderRightWidth: 0,
    padding: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#172554",
    marginBottom: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#DCE3EC",
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontSize: 12,
    color: "#334155",
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
  },
  conversationList: {
    flex: 1,
    minHeight: 0,
  },
  conversation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: 8,
    marginBottom: 4,
  },
  activeConversation: {
    backgroundColor: "#EFF6FF",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1D4ED8",
  },
  conversationInfo: {
    flex: 1,
    minWidth: 0,
  },
  personName: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1E293B",
  },
  personRole: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 2,
  },
  lastMessage: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 5,
  },
  chatPanel: {
    flex: 1,
    minWidth: 0,
  },
  chatHeader: {
    minHeight: 70,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  chatPerson: {
    flex: 1,
    minWidth: 0,
  },
  backButton: {
    paddingRight: 4,
  },
  backButtonText: {
    color: "#2563EB",
    fontSize: 12,
  },
  messagesArea: {
    flex: 1,
    minHeight: 0,
    backgroundColor: "#F8FAFC",
  },
  messagesContent: {
    padding: 16,
    gap: 12,
    flexGrow: 1,
  },
  messageRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  myMessageRow: {
    justifyContent: "flex-end",
  },
  messageBubble: {
    maxWidth: "85%",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  myMessageBubble: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  messageText: {
    fontSize: 12,
    color: "#334155",
    lineHeight: 18,
  },
  myMessageText: {
    color: "#FFFFFF",
  },
  messageTime: {
    fontSize: 9,
    color: "#94A3B8",
    marginTop: 6,
    textAlign: "right",
  },
  myMessageTime: {
    color: "#DBEAFE",
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  messageInput: {
    flex: 1,
    minWidth: 0,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: "#DCE3EC",
    borderRadius: 8,
    paddingHorizontal: 11,
    paddingVertical: 10,
    fontSize: 12,
    color: "#334155",
    backgroundColor: "#FFFFFF",
  },
  sendButton: {
    backgroundColor: "#0866F5",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledSendButton: {
    backgroundColor: "#94A3B8",
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyText: {
    padding: 20,
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
  },
});
