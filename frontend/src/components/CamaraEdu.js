import React, { useEffect, useRef, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  CameraView,
  useCameraPermissions,
} from 'expo-camera';

import { Ionicons } from '@expo/vector-icons';

import AsyncStorage from '@react-native-async-storage/async-storage';

import * as FileSystem from 'expo-file-system/legacy';

const STORAGE_KEY = '@EduConnect:CamaraEdu:ultimasFotos';
const MAX_FOTOS = 3;

const DIRECTORIO_FOTOS =
  `${FileSystem.documentDirectory}camaraedu/`;

// Reto 5: formato dd/mm/aaaa hh:mm:ss.
function formatearFecha(fecha) {
  const date = fecha instanceof Date ? fecha : new Date(fecha);

  const dd = (n) => String(n).padStart(2, '0');

  return `${dd(date.getDate())}/${dd(date.getMonth() + 1)}/${date.getFullYear()} ${dd(date.getHours())}:${dd(date.getMinutes())}:${dd(date.getSeconds())}`;
}

export default function CamaraEdu({
  visible,
  onClose,
  onSend,
  sending = false,
}) {
  const cameraRef = useRef(null);

  const [permission, requestPermission] =
    useCameraPermissions();

  const [cameraReady, setCameraReady] = useState(false);
  const [takingPhoto, setTakingPhoto] = useState(false);

  // Reto 1: cámara trasera o frontal.
  const [facing, setFacing] = useState('back');

  // Reto 4: flash.
  const [flash, setFlash] = useState('off');

  // Retos 2 y 3: últimas tres fotografías.
  const [gallery, setGallery] = useState([]);

  // Fotografía abierta en pantalla completa.
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const [loadingGallery, setLoadingGallery] = useState(false);

  // ==========================================
  // CARGAR GALERÍA
  // ==========================================

  useEffect(() => {
    if (!visible) return;

    let mounted = true;

    const cargarGaleria = async () => {
      setLoadingGallery(true);

      try {
        const info = await FileSystem.getInfoAsync(
          DIRECTORIO_FOTOS
        );

        if (!info.exists) {
          await FileSystem.makeDirectoryAsync(
            DIRECTORIO_FOTOS,
            { intermediates: true }
          );
        }

        const json = await AsyncStorage.getItem(STORAGE_KEY);

        const guardadas = json ? JSON.parse(json) : [];

        const validas = [];

        for (const foto of Array.isArray(guardadas) ? guardadas : []) {
          const archivo = await FileSystem.getInfoAsync(foto.uri);

          if (archivo.exists) {
            validas.push(foto);
          }
        }

        const ultimas = validas.slice(0, MAX_FOTOS);

        if (mounted) {
          setGallery(ultimas);
        }

        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(ultimas)
        );
      } catch (error) {
        console.warn(
          'CamaraEdu: no se pudo cargar la galería:',
          error
        );

        if (mounted) setGallery([]);
      } finally {
        if (mounted) setLoadingGallery(false);
      }
    };

    setSelectedPhoto(null);
    setFacing('back');
    setFlash('off');

    cargarGaleria();

    if (!permission?.granted) {
      requestPermission().catch(() => {});
    }

    return () => {
      mounted = false;
    };
  }, [visible]);

  // ==========================================
  // GUARDAR GALERÍA EN ASYNCSTORAGE
  // ==========================================

  const guardarGaleria = async (nuevaGaleria) => {
    const limitadas = nuevaGaleria.slice(0, MAX_FOTOS);

    setGallery(limitadas);

    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(limitadas)
    );
  };

  // ==========================================
  // TOMAR FOTOGRAFÍA
  // ==========================================

  const tomarFoto = async () => {
    if (
      !cameraRef.current ||
      !cameraReady ||
      takingPhoto ||
      sending
    ) {
      return;
    }

    try {
      setTakingPhoto(true);

      const captura =
        await cameraRef.current.takePictureAsync({
          quality: 0.82,
        });

      if (!captura?.uri) {
        throw new Error(
          'No se pudo obtener la fotografía.'
        );
      }

      const info = await FileSystem.getInfoAsync(
        DIRECTORIO_FOTOS
      );

      if (!info.exists) {
        await FileSystem.makeDirectoryAsync(
          DIRECTORIO_FOTOS,
          { intermediates: true }
        );
      }

      const nombre = `camaraedu-${Date.now()}.jpg`;

      const destino = `${DIRECTORIO_FOTOS}${nombre}`;

      // Copiar al almacenamiento privado para conservar la foto.
      await FileSystem.copyAsync({
        from: captura.uri,
        to: destino,
      });

      const nuevaFoto = {
        uri: destino,
        fileName: nombre,
        mimeType: 'image/jpeg',
        fecha: formatearFecha(new Date()),
        createdAt: Date.now(),
      };

      const todasLasFotos = [
        nuevaFoto,
        ...gallery,
      ];

      const nuevaGaleria = todasLasFotos.slice(
        0,
        MAX_FOTOS
      );

      const eliminadas = todasLasFotos.slice(
        MAX_FOTOS
      );

      await guardarGaleria(nuevaGaleria);

      // Eliminar del almacenamiento las fotos que superen el límite.
      for (const foto of eliminadas) {
        FileSystem.deleteAsync(
          foto.uri,
          { idempotent: true }
        ).catch(() => {});
      }

      // Abrir automáticamente la fotografía recién capturada.
      setSelectedPhoto(nuevaFoto);

    } catch (error) {
      Alert.alert(
        'CamaraEdu',
        error.message ||
          'No se pudo tomar la fotografía.'
      );
    } finally {
      setTakingPhoto(false);
    }
  };

  // ==========================================
  // SELECCIONAR FOTO DE LA GALERÍA
  // ==========================================

  const seleccionarFoto = (foto) => {
    setSelectedPhoto(foto);
  };

  // ==========================================
  // ELIMINAR FOTO SELECCIONADA
  // ==========================================

  const eliminarFotoSeleccionada = async () => {
    if (!selectedPhoto || sending) return;

    try {
      await FileSystem.deleteAsync(
        selectedPhoto.uri,
        { idempotent: true }
      );

      const restantes = gallery.filter(
        (foto) => foto.uri !== selectedPhoto.uri
      );

      await guardarGaleria(restantes);

      setSelectedPhoto(null);

    } catch (error) {
      Alert.alert(
        'CamaraEdu',
        'No se pudo eliminar la fotografía.'
      );
    }
  };

  // ==========================================
  // LIMPIAR GALERÍA
  // ==========================================

  const limpiarGaleria = () => {
    if (sending || gallery.length === 0) return;

    Alert.alert(
      'Borrar últimas fotos',
      '¿Quieres eliminar las tres fotografías guardadas?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await Promise.all(
                gallery.map((foto) =>
                  FileSystem.deleteAsync(
                    foto.uri,
                    { idempotent: true }
                  )
                )
              );

              await guardarGaleria([]);

              setSelectedPhoto(null);

            } catch {
              Alert.alert(
                'CamaraEdu',
                'No se pudo limpiar la galería.'
              );
            }
          },
        },
      ]
    );
  };

  // ==========================================
  // CAMBIAR CÁMARA
  // ==========================================

    const cambiarCamara = () => {
        if (sending || takingPhoto) return;

        setFlash('off');
        setFacing((actual) =>
            actual === 'back' ? 'front' : 'back'
        );
    };

  // ==========================================
  // ACTIVAR / DESACTIVAR FLASH
  // ==========================================

    const cambiarFlash = () => {
    if (sending || takingPhoto) return;

    if (facing === 'front') {
        Alert.alert(
        'Flash no disponible, me pregunto que hicistes?',
        'La cámara frontal de este dispositivo no tiene flash físico, jajaja pobre celular xd .'
        );
        return;
    }

    setFlash((actual) =>
        actual === 'off' ? 'on' : 'off'
    );
    };

  // ==========================================
  // CERRAR CAMARAEDU
  // ==========================================

  const cerrar = () => {
    if (sending) return;

    setSelectedPhoto(null);

    onClose?.();
  };

  // ==========================================
  // VOLVER A LA CÁMARA
  // ==========================================

  const volverCamara = () => {
    if (!sending) {
      setSelectedPhoto(null);
    }
  };

  // ==========================================
  // ENVIAR FOTO SELECCIONADA
  // ==========================================

  const enviarSeleccionada = async () => {
    if (!selectedPhoto || sending) return;

    await onSend?.(selectedPhoto);
  };

  // ==========================================
  // PERMISOS
  // ==========================================

  const permisoDenegado =
    permission && !permission.granted;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent
      onRequestClose={cerrar}
    >
      <View style={styles.container}>

        {/* ENCABEZADO */}

        <View style={styles.header}>

          {selectedPhoto ? (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={volverCamara}
              disabled={sending}
            >
              <Ionicons
                name="arrow-back"
                size={25}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          ) : (
            <View style={styles.headerButtonPlaceholder} />
          )}

          <View style={styles.headerCenter}>
            <Text style={styles.title}>
              CamaraEdu
            </Text>

            <Text style={styles.subtitle}>
              {selectedPhoto
                ? 'Revisa tu fotografía'
                : 'Captura y selecciona tus fotografías'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={cerrar}
            disabled={sending}
          >
            <Ionicons
              name="close"
              size={27}
              color="#FFFFFF"
            />
          </TouchableOpacity>

        </View>

        {/* VISTA DE CÁMARA O FOTO SELECCIONADA */}

        <View style={styles.previewFrame}>

          {selectedPhoto ? (
            <>
              <Image
                source={{ uri: selectedPhoto.uri }}
                style={styles.selectedImage}
                resizeMode="contain"
              />

              <View style={styles.photoDateBadge}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color="#FFFFFF"
                />

                <Text style={styles.photoDateText}>
                  {selectedPhoto.fecha}
                </Text>
              </View>
            </>
          ) : permission?.granted ? (
            <>
              <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing={facing}
                flash={flash}
                enableTorch={flash === 'on' && facing === 'back'}
                onCameraReady={() => setCameraReady(true)}
              />

              {/* CONTROLES DE CÁMARA */}

              <View style={styles.cameraControls}>

                <TouchableOpacity
                  style={styles.chip}
                  onPress={cambiarFlash}
                  disabled={takingPhoto || sending}
                >
                  <Ionicons
                    name={
                      flash === 'on'
                        ? 'flash'
                        : 'flash-off'
                    }
                    size={15}
                    color="#FFFFFF"
                  />

                  <Text style={styles.chipText}>
                    Flash: {flash === 'on' ? 'ON' : 'OFF'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.chip}
                  onPress={cambiarCamara}
                  disabled={takingPhoto || sending}
                >
                  <Ionicons
                    name="camera-reverse"
                    size={16}
                    color="#FFFFFF"
                  />

                  <Text style={styles.chipText}>
                    Voltear
                  </Text>
                </TouchableOpacity>

              </View>

              {!cameraReady && (
                <View style={styles.cameraLoading}>
                  <ActivityIndicator
                    color="#FFFFFF"
                    size="large"
                  />

                  <Text style={styles.cameraLoadingText}>
                    Preparando cámara...
                  </Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.permissionBox}>
              <Ionicons
                name="camera-outline"
                size={48}
                color="#FFFFFF"
              />

              <Text style={styles.permissionTitle}>
                Permiso de cámara
              </Text>

              <Text style={styles.permissionText}>
                EduConnect necesita acceso a la cámara
                para tomar fotografías.
              </Text>

              <TouchableOpacity
                style={styles.permissionButton}
                onPress={() =>
                  permission?.canAskAgain
                    ? requestPermission()
                    : Linking.openSettings()
                }
              >
                <Text style={styles.permissionButtonText}>
                  {permission?.canAskAgain
                    ? 'Conceder permiso'
                    : 'Abrir Ajustes'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

        </View>

        {/* GALERÍA: ÚLTIMAS TRES FOTOS */}

        {!selectedPhoto && (
          <View style={styles.gallerySection}>

            <View style={styles.galleryHeader}>
              <View>
                <Text style={styles.galleryTitle}>
                  Últimas fotos
                </Text>

                <Text style={styles.gallerySubtitle}>
                  Se conservan las 3 más recientes
                </Text>
              </View>

              {gallery.length > 0 && (
                <TouchableOpacity
                  onPress={limpiarGaleria}
                  disabled={sending}
                  style={styles.clearButton}
                >
                  <Ionicons
                    name="trash-outline"
                    size={17}
                    color="#FCA5A5"
                  />

                  <Text style={styles.clearText}>
                    Limpiar
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {loadingGallery ? (
              <ActivityIndicator
                color="#FFFFFF"
                style={styles.galleryLoader}
              />
            ) : gallery.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.galleryList}
              >
                {gallery.map((foto, index) => (
                  <TouchableOpacity
                    key={foto.uri}
                    style={styles.thumbnailWrap}
                    onPress={() => seleccionarFoto(foto)}
                  >
                    <Image
                      source={{ uri: foto.uri }}
                      style={styles.thumbnail}
                    />

                    <View style={styles.thumbnailNumber}>
                      <Text style={styles.thumbnailNumberText}>
                        {index + 1}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyGallery}>
                <Ionicons
                  name="images-outline"
                  size={23}
                  color="#64748B"
                />

                <Text style={styles.emptyGalleryText}>
                  Todavía no hay fotografías
                </Text>
              </View>
            )}

          </View>
        )}

        {/* BOTONES DE ACCIÓN */}

        {selectedPhoto ? (
          <View style={styles.actionRow}>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={eliminarFotoSeleccionada}
              disabled={sending}
            >
              <Ionicons
                name="trash-outline"
                size={22}
                color="#FCA5A5"
              />

              <Text style={styles.deleteText}>
                Eliminar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.sendButton,
                sending && styles.disabledButton,
              ]}
              onPress={enviarSeleccionada}
              disabled={sending}
            >
              {sending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color="#FFFFFF"
                />
              )}

              <Text style={styles.sendText}>
                {sending ? 'Enviando...' : 'Enviar foto'}
              </Text>
            </TouchableOpacity>

          </View>
        ) : (
          <View style={styles.captureRow}>

            <View style={styles.captureSide} />

            <TouchableOpacity
              style={[
                styles.captureButton,
                (!cameraReady || takingPhoto || sending) &&
                  styles.disabledButton,
              ]}
              onPress={tomarFoto}
              disabled={!cameraReady || takingPhoto || sending}
            >
              {takingPhoto ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Ionicons
                  name="camera"
                  size={29}
                  color="#FFFFFF"
                />
              )}
            </TouchableOpacity>

            <View style={styles.captureSide}>
              <Text style={styles.photoCount}>
                {gallery.length}/{MAX_FOTOS}
              </Text>
            </View>

          </View>
        )}

        <Text style={styles.footerText}>
          {selectedPhoto
            ? 'Usa la flecha para volver o confirma con el check para enviar.'
            : 'Toca una foto reciente para revisarla antes de enviarla.'}
        </Text>

      </View>
    </Modal>
  );
}

// ==========================================
// ESTILOS
// ==========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080B12',
    paddingTop: 38,
    paddingBottom: 18,
    paddingHorizontal: 16,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#202938',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerButtonPlaceholder: {
    width: 42,
    height: 42,
  },

  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },

  title: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
  },

  subtitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 3,
    textAlign: 'center',
  },

  previewFrame: {
    flex: 1,
    minHeight: 220,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#17202D',
    position: 'relative',
  },

  camera: {
    flex: 1,
  },

  selectedImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#111827',
  },

  cameraControls: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 22,
    backgroundColor: 'rgba(15,23,42,0.78)',
  },

  chipText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  cameraLoading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },

  cameraLoadingText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 9,
  },

  permissionBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  permissionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },

  permissionText: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 8,
  },

  permissionButton: {
    marginTop: 17,
    backgroundColor: '#2563EB',
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 11,
  },

  permissionButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },

  photoDateBadge: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 18,
  },

  photoDateText: {
    color: '#FFFFFF',
    fontSize: 11,
  },

  gallerySection: {
    paddingTop: 14,
    paddingBottom: 8,
  },

  galleryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  galleryTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  gallerySubtitle: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 3,
  },

  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    padding: 7,
  },

  clearText: {
    color: '#FCA5A5',
    fontSize: 11,
    fontWeight: '600',
  },

  galleryList: {
    gap: 9,
    alignItems: 'center',
    minHeight: 74,
  },

  galleryLoader: {
    height: 68,
  },

  emptyGallery: {
    minHeight: 68,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#151D2A',
    borderRadius: 11,
  },

  emptyGalleryText: {
    color: '#94A3B8',
    fontSize: 11,
  },

  thumbnailWrap: {
    width: 66,
    height: 72,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#475569',
    padding: 2,
    position: 'relative',
  },

  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },

  thumbnailNumber: {
    position: 'absolute',
    left: 5,
    bottom: 5,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },

  thumbnailNumberText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },

  captureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 7,
  },

  captureSide: {
    width: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },

  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E30613',
    borderWidth: 5,
    borderColor: '#FCA5A5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  photoCount: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 14,
  },

  deleteButton: {
    minWidth: 105,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: '#202938',
    borderRadius: 13,
  },

  deleteText: {
    color: '#FCA5A5',
    fontSize: 12,
    fontWeight: '700',
  },

  sendButton: {
    flex: 1,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    borderRadius: 13,
  },

  sendText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  disabledButton: {
    opacity: 0.45,
  },

  footerText: {
    color: '#64748B',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 11,
  },
});
