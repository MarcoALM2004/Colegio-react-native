import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';

import {
  registrarNotificaciones,
  obtenerNotificaciones,
  marcarNotificacionLeida,
  marcarTodasLeidas,
} from '../service/notificacionService';

const FILTROS = [
  { id: 'TODAS', label: 'Todas' },
  { id: 'MENSAJE', label: 'Mensajes' },
  { id: 'TAREA', label: 'Tareas' },
  { id: 'RECORDATORIO', label: 'Vencimientos' },
  { id: 'ANUNCIO', label: 'Anuncios' },
];

const ICONOS = {
  MENSAJE: {
    nombre: 'chatbubble-ellipses',
    color: '#2563EB',
    fondo: '#DBEAFE',
  },
  TAREA: {
    nombre: 'document-text',
    color: '#7C3AED',
    fondo: '#EDE9FE',
  },
  RECORDATORIO: {
    nombre: 'alarm',
    color: '#D97706',
    fondo: '#FEF3C7',
  },
  ANUNCIO: {
    nombre: 'megaphone',
    color: '#059669',
    fondo: '#D1FAE5',
  },
};

export default function Notificaciones({
  navigation,
  route,
  usuario: usuarioProp,
}) {
  const usuario = usuarioProp || route?.params?.usuario || {};
  const usuarioId = Number(usuario.id);

  const [notificaciones, setNotificaciones] = useState([]);
  const [filtro, setFiltro] = useState('TODAS');
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [marcando, setMarcando] = useState(false);

  const cargar = useCallback(async (silencioso = false) => {
    if (!usuarioId) {
      setCargando(false);
      return;
    }

    try {
      if (!silencioso) setCargando(true);

      const datos = await obtenerNotificaciones(usuarioId);

      setNotificaciones(
        Array.isArray(datos) ? datos : []
      );
    } catch (error) {
      Alert.alert(
        'Notificaciones',
        error.message || 'No se pudieron cargar las notificaciones.'
      );
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  }, [usuarioId]);

  useEffect(() => {
    if (usuarioId) {
      registrarNotificaciones(usuarioId).catch((error) => {
        console.warn(
          'No se pudo registrar el dispositivo:',
          error
        );
      });
    }

    const suscripcion =
      Notifications.addNotificationReceivedListener(() => {
        cargar(true);
      });

    return () => suscripcion.remove();
  }, [usuarioId, cargar]);

  useFocusEffect(
    useCallback(() => {
      cargar(true);
    }, [cargar])
  );

  const noLeidas = notificaciones.filter(
    (item) => !item.leida
  ).length;

  const visibles = notificaciones.filter((item) => {
    return filtro === 'TODAS' || item.tipo === filtro;
  });

  const refrescar = () => {
    setActualizando(true);
    cargar(true);
  };

  const abrirNotificacion = async (item) => {
    try {
      if (!item.leida) {
        await marcarNotificacionLeida(
          item.id,
          usuarioId
        );

        setNotificaciones((actuales) =>
          actuales.map((n) =>
            n.id === item.id
              ? { ...n, leida: true }
              : n
          )
        );
      }

      const rol = String(usuario.rol || '').toUpperCase();
      const destino = item.pantalla;

      if (destino === 'Mensajes') {
        const ruta =
          rol === 'ADMIN' || rol === 'ADMINISTRADOR'
            ? 'AdminMensajes'
            : rol === 'DOCENTE'
              ? 'MensajesTeacher'
              : 'MensajesStudent';

        navigation.navigate(ruta);
      } else if (destino === 'Tareas') {
        navigation.navigate(
          rol === 'DOCENTE'
            ? 'TareasTeacher'
            : 'TareasStudent'
        );
      } else if (destino === 'Inicio') {
        navigation.navigate(
          rol === 'ADMIN' || rol === 'ADMINISTRADOR'
            ? 'AdminInicio'
            : rol === 'DOCENTE'
              ? 'TeacherDashboard'
              : 'StudentDashboard'
        );
      }
    } catch (error) {
      Alert.alert(
        'Notificaciones',
        error.message || 'No se pudo abrir la notificación.'
      );
    }
  };

  const leerTodas = async () => {
    if (noLeidas === 0 || marcando) return;

    try {
      setMarcando(true);

      await marcarTodasLeidas(usuarioId);

      setNotificaciones((actuales) =>
        actuales.map((item) => ({
          ...item,
          leida: true,
        }))
      );
    } catch (error) {
      Alert.alert(
        'Notificaciones',
        error.message || 'No se pudieron marcar como leídas.'
      );
    } finally {
      setMarcando(false);
    }
  };

  const renderItem = ({ item }) => {
    const estilo = ICONOS[item.tipo] || ICONOS.ANUNCIO;

    return (
      <TouchableOpacity
        style={[
          styles.notification,
          !item.leida && styles.notificationUnread,
        ]}
        activeOpacity={0.75}
        onPress={() => abrirNotificacion(item)}
      >
        <View
          style={[
            styles.notificationIcon,
            { backgroundColor: estilo.fondo },
          ]}
        >
          <Ionicons
            name={estilo.nombre}
            size={22}
            color={estilo.color}
          />
        </View>

        <View style={styles.notificationBody}>
          <View style={styles.titleRow}>
            <Text style={styles.notificationTitle}>
              {item.titulo}
            </Text>

            {!item.leida && (
              <View style={styles.unreadDot} />
            )}
          </View>

          <Text style={styles.notificationText}>
            {item.contenido}
          </Text>

          <Text style={styles.notificationDate}>
            {item.creadoEn
              ? new Date(item.creadoEn).toLocaleString('es-PE')
              : ''}
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={18}
          color="#94A3B8"
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color="#1E293B"
          />
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>
            Notificaciones
          </Text>

          <Text style={styles.headerSubtitle}>
            {noLeidas} sin leer
          </Text>
        </View>

        <TouchableOpacity
          style={styles.readAllButton}
          onPress={leerTodas}
          disabled={noLeidas === 0 || marcando}
        >
          <Text
            style={[
              styles.readAllText,
              noLeidas === 0 && styles.disabledText,
            ]}
          >
            Leer todas
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        <FlatList
          horizontal
          data={FILTROS}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setFiltro(item.id)}
              style={[
                styles.filterButton,
                filtro === item.id && styles.filterActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  filtro === item.id && styles.filterTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

        {cargando ? (
            <View style={styles.center}>
                <ActivityIndicator
                size="large"
                color="#2563EB"
                />
                <Text style={styles.loadingText}>
                Cargando notificaciones...
                </Text>
            </View>
            ) : (
            <View style={styles.list}>
                {visibles.length > 0 ? (
                visibles.map((item) => (
                    <View key={String(item.id)}>
                    {renderItem({ item })}
                    </View>
                ))
                ) : (
                <View style={styles.center}>
                    <Ionicons
                    name="notifications-off-outline"
                    size={48}
                    color="#94A3B8"
                    />

                    <Text style={styles.emptyTitle}>
                    No hay notificaciones
                    </Text>

                    <Text style={styles.emptyText}>
                    Aquí aparecerán tus mensajes, tareas y anuncios.
                    </Text>
                </View>
                )}
            </View>
            )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },
  header: {
    minHeight: 76,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EDF4',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: 9,
  },
  headerTitle: {
    color: '#172554',
    fontSize: 20,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 3,
  },
  readAllButton: {
    padding: 8,
  },
  readAllText: {
    color: '#2563EB',
    fontWeight: '700',
    fontSize: 12,
  },
  disabledText: {
    color: '#94A3B8',
  },
  filters: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
  },
  filterList: {
    paddingHorizontal: 14,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  filterActive: {
    backgroundColor: '#2563EB',
  },
  filterText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  list: {
    padding: 14,
    gap: 10,
  },
  notification: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 13,
    gap: 11,
    borderWidth: 1,
    borderColor: '#E8EDF4',
  },
  notificationUnread: {
    borderColor: '#BFDBFE',
    backgroundColor: '#F8FBFF',
  },
  notificationIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBody: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  notificationTitle: {
    flex: 1,
    color: '#1E293B',
    fontSize: 13,
    fontWeight: '800',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
  },
  notificationText: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 18,
  },
  notificationDate: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 3,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  loadingText: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 12,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyTitle: {
    color: '#334155',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 13,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
  },
});