import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import { File } from 'expo-file-system';

import { listarMisCursos } from '../service/cursosService';
import {
  listarUnidades,
  listarArchivosUnidad,
  listarMateriales,
  listarTareas,
  listarArchivosTarea,
  listarPublicaciones,
  listarRespuestas,
  crearRespuesta,
  descargarArchivo,
  entregarTarea,
} from '../service/contenidoCursoService';
import { Page, Card, Icon, colors } from '../components/StudentUI';

const tabs = [
  'Inicio',
  'Unidades',
  'Materiales',
  'Tareas',
  'Calificaciones',
  'Foro',
];

const lista = (value) => Array.isArray(value) ? value : [];

const nombreArchivo = (archivo) =>
  archivo?.nombreOriginal ||
  archivo?.nombre_original ||
  archivo?.nombre ||
  archivo?.titulo ||
  'Archivo adjunto';

const tamanoArchivo = (bytes) => {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n <= 0) return '';
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
};

const obtenerMime = (material) => {
  const valor = String(
    material?.tipoMime ||
    material?.tipo_mime ||
    material?.mimeType ||
    material?.tipo ||
    ''
  ).toLowerCase();

  if (valor.includes('pdf')) return 'application/pdf';
  if (valor.includes('image/png')) return 'image/png';
  if (valor.includes('image/jpeg') || valor.includes('jpg')) {
    return 'image/jpeg';
  }
  if (valor.includes('word') || valor.includes('doc')) {
    return 'application/msword';
  }
  if (valor.includes('excel') || valor.includes('xls')) {
    return 'application/vnd.ms-excel';
  }

  return valor.includes('/') ? valor : 'application/octet-stream';
};

const nombreSeguroArchivo = (nombre, id, mime) => {
  let seguro = String(nombre || `material-${id}`)
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, '_');

  if (!seguro.includes('.')) {
    const extension = mime === 'application/pdf' ? '.pdf' : '.bin';
    seguro += extension;
  }

  return seguro;
};

const fechaLegible = (valor) => {
  if (!valor) return 'Sin fecha registrada';

  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) {
    return String(valor).replace('T', ' ');
  }

  return fecha.toLocaleString('es-PE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

export default function CursoDetalleStudent({ route, navigation }) {
  const cursoId = route?.params?.id;

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('Inicio');

  const [units, setUnits] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [forum, setForum] = useState([]);
  const [downloading, setDownloading] = useState('');
  const [publicacionSeleccionada, setPublicacionSeleccionada] = useState(null);
  const [respuestasForo, setRespuestasForo] = useState([]);
  const [cargandoRespuestas, setCargandoRespuestas] = useState(false);
  const [comentarioForo, setComentarioForo] = useState('');
  const [enviandoComentarioForo, setEnviandoComentarioForo] = useState(false);

  const [archivoEntrega, setArchivoEntrega] = useState({});
  const [comentariosEntrega, setComentariosEntrega] = useState({});
  const [enviandoEntrega, setEnviandoEntrega] = useState('');

  const cargarCurso = useCallback(async () => {
    if (cursoId == null) {
      throw new Error('No se recibió el identificador del curso.');
    }

    const cursos = await listarMisCursos();

    const encontrado = lista(cursos).find(
      (item) => String(item.id) === String(cursoId)
    );

    if (!encontrado) {
      throw new Error(
        'No se encontró este curso entre tus matrículas activas.'
      );
    }

    setCourse(encontrado);
  }, [cursoId]);

  const cargarContenido = useCallback(async () => {
    if (cursoId == null) return;

    const [
      unidadesData,
      materialesData,
      tareasData,
      foroData,
    ] = await Promise.all([
      listarUnidades(cursoId),
      listarMateriales(cursoId),
      listarTareas(cursoId),
      listarPublicaciones(cursoId),
    ]);

    const unidadesConArchivos = await Promise.all(
      lista(unidadesData).map(async (unidad) => {
        try {
          const archivos = await listarArchivosUnidad(
            cursoId,
            unidad.id
          );

          return {
            ...unidad,
            archivos: lista(archivos),
          };
        } catch {
          return {
            ...unidad,
            archivos: [],
          };
        }
      })
    );

    const tareasConArchivos = await Promise.all(
      lista(tareasData).map(async (tarea) => {
        try {
          const archivos = await listarArchivosTarea(
            cursoId,
            tarea.id
          );

          return {
            ...tarea,
            archivos: lista(archivos),
          };
        } catch {
          return {
            ...tarea,
            archivos: [],
          };
        }
      })
    );

    setUnits(unidadesConArchivos);
    setMaterials(lista(materialesData));
    setTasks(tareasConArchivos);
    setForum(lista(foroData));
  }, [cursoId]);

  const abrirConversacion = async (publicacion) => {
    setPublicacionSeleccionada(publicacion);
    setRespuestasForo([]);
    setComentarioForo('');
    setCargandoRespuestas(true);
    try {
      const datos = await listarRespuestas(cursoId, publicacion.id);
      setRespuestasForo(lista(datos));
    } catch (e) {
      Alert.alert('No se pudieron cargar los comentarios', e.message || 'Inténtalo nuevamente.');
    } finally {
      setCargandoRespuestas(false);
    }
  };

  const enviarComentarioForo = async () => {
    const contenido = comentarioForo.trim();
    if (!contenido || !publicacionSeleccionada || enviandoComentarioForo) return;
    setEnviandoComentarioForo(true);
    try {
      await crearRespuesta(cursoId, publicacionSeleccionada.id, contenido);
      setComentarioForo('');
      const datos = await listarRespuestas(cursoId, publicacionSeleccionada.id);
      setRespuestasForo(lista(datos));
      await cargarContenido();
    } catch (e) {
      Alert.alert('No se pudo enviar el comentario', e.message || 'Inténtalo nuevamente.');
    } finally {
      setEnviandoComentarioForo(false);
    }
  };

  const cargarTodo = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      await cargarCurso();
      await cargarContenido();
    } catch (e) {
      setError(
        e.message || 'No se pudo cargar el contenido del curso.'
      );
    } finally {
      setLoading(false);
    }
  }, [cargarCurso, cargarContenido]);

  const actualizar = useCallback(async () => {
    setRefreshing(true);

    try {
      await cargarCurso();
      await cargarContenido();
      setError('');
    } catch (e) {
      setError(
        e.message || 'No se pudo actualizar el contenido del curso.'
      );
    } finally {
      setRefreshing(false);
    }
  }, [cargarCurso, cargarContenido]);

  useEffect(() => {
    cargarTodo();
  }, [cargarTodo]);

  const seleccionarArchivoEntrega = async (tareaId) => {
    try {
      const resultado = await File.pickFileAsync({
        mimeTypes: '*/*',
        multipleFiles: false,
      });

      if (resultado.canceled || !resultado.result) {
        return;
      }

      const archivo = resultado.result;

      if (!archivo.uri || typeof archivo.upload !== 'function') {
        throw new Error('No se pudo acceder al archivo seleccionado.');
      }

      setArchivoEntrega((actual) => ({
        ...actual,
        [tareaId]: archivo,
      }));
    } catch (error) {
      Alert.alert(
        'Error',
        error.message || 'No se pudo seleccionar el archivo.'
      );
    }
  };

  const enviarEntrega = async (tarea) => {
    const tareaId = tarea.id;
    const archivo = archivoEntrega[tareaId];

    if (!archivo) {
      Alert.alert(
        'Archivo obligatorio',
        'Selecciona el archivo que deseas entregar.'
      );
      return;
    }

    if (enviandoEntrega) return;

    try {
      setEnviandoEntrega(String(tareaId));

      await entregarTarea(
        cursoId,
        tareaId,
        archivo,
        comentariosEntrega[tareaId] || ''
      );

      setArchivoEntrega((actual) => {
        const nuevo = { ...actual };
        delete nuevo[tareaId];
        return nuevo;
      });
      setComentariosEntrega((actual) => ({
        ...actual,
        [tareaId]: '',
      }));

      // La entrega ya fue guardada. Si falla la recarga, no se informa
      // erróneamente que también falló el envío.
      try {
        await cargarContenido();
      } catch (errorActualizacion) {
        console.warn('La entrega se guardó, pero no se pudo actualizar la lista:', errorActualizacion);
      }

      Alert.alert(
        'Entrega realizada',
        'Tu archivo se envió correctamente al profesor.'
      );
    } catch (error) {
      Alert.alert(
        'No se pudo entregar',
        error.message || 'Inténtalo nuevamente.'
      );
    } finally {
      setEnviandoEntrega('');
    }
  };

  // Abre archivos de unidades y tareas usando el visor del dispositivo.
  const abrirArchivo = async (
    tipo,
    id,
    nombre,
    mime = 'application/pdf'
  ) => {
    const llave = `${tipo}-${id}`;

    if (downloading) return;

    setDownloading(llave);

    try {
      const destino = await descargarArchivo(cursoId, tipo, id);

      const extension = (nombre || '').includes('.')
        ? nombre.split('.').pop().toLowerCase()
        : (mime.includes('pdf') ? 'pdf' : 'bin');

      const nombreSeguro = (nombre || `archivo-${id}`)
        .replace(/[\\/:*?"<>|]/g, '_')
        .replace(/\s+/g, '_');

      const uriDestino =
        `${FileSystem.cacheDirectory}${Date.now()}_` +
        `${nombreSeguro}${nombreSeguro.includes('.') ? '' : `.${extension}`}`;

      const descarga = await FileSystem.downloadAsync(
        destino.url,
        uriDestino,
        {
          headers: destino.headers,
        }
      );

      if (descarga.status < 200 || descarga.status >= 300) {
        throw new Error(
          `No se pudo descargar el archivo (${descarga.status}).`
        );
      }

      const archivoLocal = new File(descarga.uri);
      const puedeAbrir = await File.canPreview(archivoLocal);

      if (!puedeAbrir) {
        throw new Error(
          'No hay una aplicación compatible para abrir este tipo de archivo.'
        );
      }

      await File.preview(archivoLocal, {
        mimeType: mime || 'application/octet-stream',
        title: nombreSeguro,
      });
    } catch (e) {
      Alert.alert(
        'No se pudo abrir el archivo',
        e.message || 'Comprueba tu conexión e inténtalo nuevamente.'
      );
    } finally {
      setDownloading('');
    }
  };

  // Muestra el material usando una copia temporal en la caché.
  // No guarda el archivo en la carpeta Descargas.
  const mostrarMaterial = async (material) => {
    const id = material.id;
    const nombre = nombreArchivo(material);
    const mime = obtenerMime(material);
    const llave = `ver-material-${id}`;

    if (downloading) return;

    setDownloading(llave);

    try {
      const destino = await descargarArchivo(
        cursoId,
        'material',
        id
      );

      const nombreFinal = nombreSeguroArchivo(
        nombre,
        id,
        mime
      );

      const temporal =
        `${FileSystem.cacheDirectory}${Date.now()}_${nombreFinal}`;

      const resultado = await FileSystem.downloadAsync(
        destino.url,
        temporal,
        {
          headers: destino.headers,
        }
      );

      if (resultado.status < 200 || resultado.status >= 300) {
        throw new Error(
          `El servidor respondió con estado ${resultado.status}.`
        );
      }

      const archivo = new File(resultado.uri);
      const puedeAbrir = await File.canPreview(archivo);

      if (!puedeAbrir) {
        throw new Error(
          'No hay una aplicación compatible para visualizar este archivo. Puedes descargarlo y abrirlo desde tu dispositivo.'
        );
      }

      await File.preview(archivo, {
        mimeType: mime,
        title: nombreFinal,
      });
    } catch (e) {
      Alert.alert(
        'No se pudo mostrar el material',
        e.message || 'Inténtalo nuevamente.'
      );
    } finally {
      setDownloading('');
    }
  };

  // Descarga el archivo y permite guardarlo en Download/Descargas.
  const descargarMaterial = async (material) => {
    const id = material.id;
    const nombre = nombreArchivo(material);
    const mime = obtenerMime(material);
    const llave = `descargar-material-${id}`;

    if (downloading) return;

    setDownloading(llave);

    let temporalUri = null;

    try {
      if (Platform.OS !== 'android') {
        throw new Error(
          'La selección directa de la carpeta Descargas está habilitada para Android.'
        );
      }

      const destino = await descargarArchivo(
        cursoId,
        'material',
        id
      );

      const nombreFinal = nombreSeguroArchivo(
        nombre,
        id,
        mime
      );

      temporalUri =
        `${FileSystem.cacheDirectory}${Date.now()}_${nombreFinal}`;

      const resultado = await FileSystem.downloadAsync(
        destino.url,
        temporalUri,
        {
          headers: destino.headers,
        }
      );

      if (resultado.status < 200 || resultado.status >= 300) {
        throw new Error(
          `El servidor respondió con estado ${resultado.status}.`
        );
      }

      const SAF = FileSystem.StorageAccessFramework;

      const carpetaInicial =
        SAF.getUriForDirectoryInRoot('Download');

      const permiso =
        await SAF.requestDirectoryPermissionsAsync(carpetaInicial);

      if (!permiso.granted) {
        return;
      }

      const extension = nombreFinal.includes('.')
        ? nombreFinal.split('.').pop()
        : '';

      const nombreSinExtension = extension
        ? nombreFinal.slice(0, -(extension.length + 1))
        : nombreFinal;

      const archivoDestino = await SAF.createFileAsync(
        permiso.directoryUri,
        nombreSinExtension,
        mime
      );

      const contenidoBase64 =
        await FileSystem.readAsStringAsync(resultado.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

      await FileSystem.writeAsStringAsync(
        archivoDestino,
        contenidoBase64,
        {
          encoding: FileSystem.EncodingType.Base64,
        }
      );

      Alert.alert(
        'Descarga completada',
        `El archivo se guardó en Descargas como ${nombreFinal}.`
      );
    } catch (e) {
      Alert.alert(
        'No se pudo descargar',
        e.message || 'Inténtalo nuevamente.'
      );
    } finally {
      if (temporalUri) {
        try {
          await FileSystem.deleteAsync(temporalUri, {
            idempotent: true,
          });
        } catch {}
      }

      setDownloading('');
    }
  };

  const renderCargando = () => (
    <Page
      title="Cargando curso..."
      subtitle="Estamos obteniendo la información del curso."
      action={
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name="arrow-back"
            size={23}
            color={colors.text}
          />
        </TouchableOpacity>
      }
    >
      <Card style={styles.center}>
        <ActivityIndicator size="large" color={colors.blue} />
        <Text style={styles.body}>Cargando información...</Text>
      </Card>
    </Page>
  );

  if (loading) return renderCargando();

  if (error || !course) {
    return (
      <Page
        title="Curso"
        subtitle="No se pudo mostrar la información."
        action={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons
              name="arrow-back"
              size={23}
              color={colors.text}
            />
          </TouchableOpacity>
        }
      >
        <Card style={styles.center}>
          <Ionicons
            name="alert-circle-outline"
            size={40}
            color="#DC2626"
          />

          <Text style={styles.errorText}>
            {error || 'No se encontró el curso.'}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={cargarTodo}
          >
            <Text style={styles.retryText}>
              Volver a intentar
            </Text>
          </TouchableOpacity>
        </Card>
      </Page>
    );
  }

  const colorCurso = course.color || colors.blue;

  const botonArchivo = (tipo, archivo, mime) => {
    const id = archivo?.id;

    if (!id) return null;

    const llave = `${tipo}-${id}`;
    const nombre = nombreArchivo(archivo);

    return (
      <TouchableOpacity
        key={`${tipo}-${id}`}
        style={styles.fileButton}
        onPress={() =>
          abrirArchivo(
            tipo,
            id,
            nombre,
            mime ||
              archivo.tipoMime ||
              archivo.tipo_mime ||
              'application/octet-stream'
          )
        }
        disabled={Boolean(downloading)}
      >
        {downloading === llave ? (
          <ActivityIndicator
            size="small"
            color={colors.blue}
          />
        ) : (
          <Ionicons
            name="document-text-outline"
            size={21}
            color={colors.blue}
          />
        )}

        <View style={styles.fileInfo}>
          <Text style={styles.fileName} numberOfLines={2}>
            {nombre}
          </Text>

          {!!archivo.tamano && (
            <Text style={styles.fileMeta}>
              {tamanoArchivo(archivo.tamano)}
            </Text>
          )}
        </View>

        <Ionicons
          name="download-outline"
          size={20}
          color={colors.blue}
        />
      </TouchableOpacity>
    );
  };

  return (
    <Page
      title={course.nombre}
      subtitle="Tu espacio para aprender y organizarte."
      action={
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name="arrow-back"
            size={23}
            color={colors.text}
          />
        </TouchableOpacity>
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={actualizar}
          />
        }
      >
        <View
          style={[
            styles.banner,
            { backgroundColor: colorCurso },
          ]}
        >
          <Ionicons
            name={course.icono || 'book-outline'}
            size={36}
            color="#FFFFFF"
          />

          <View style={styles.bannerInfo}>
            <Text style={styles.bannerTitle}>
              {course.nombre}
            </Text>

            <Text style={styles.bannerSub}>
              {course.grado || ''} · {course.nivel || ''}
              {course.seccionCodigo || course.seccion
                ? ` · Sección ${course.seccionCodigo || course.seccion}`
                : ''}
            </Text>

            <Text style={styles.bannerSub}>
              {course.descripcion || 'Sin descripción registrada.'}
            </Text>
          </View>
        </View>

        <View style={styles.tabs}>
          {tabs.map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setTab(item)}
              style={[
                styles.tab,
                tab === item && styles.tabActive,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  tab === item && styles.tabTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === 'Inicio' && (
          <>
            <Card>
              <Text style={styles.section}>
                Información del curso
              </Text>

              <View style={styles.info}>
                <Icon name="person-outline" color={colorCurso} />
                <View>
                  <Text style={styles.label}>Profesor</Text>
                  <Text style={styles.value}>
                    {course.docente || 'No registrado'}
                  </Text>
                </View>
              </View>

              <View style={styles.info}>
                <Icon name="school-outline" color={colorCurso} />
                <View>
                  <Text style={styles.label}>Grado y nivel</Text>
                  <Text style={styles.value}>
                    {course.grado || '—'} {course.nivel || ''}
                  </Text>
                </View>
              </View>

              <View style={styles.info}>
                <Icon name="people-outline" color={colorCurso} />
                <View>
                  <Text style={styles.label}>Sección</Text>
                  <Text style={styles.value}>
                    {course.seccionCodigo ||
                      course.seccion ||
                      'No registrada'}
                  </Text>
                </View>
              </View>

              <View style={styles.info}>
                <Icon name="calendar-outline" color={colorCurso} />
                <View>
                  <Text style={styles.label}>Año escolar</Text>
                  <Text style={styles.value}>
                    {course.anio || 'No registrado'}
                  </Text>
                </View>
              </View>
            </Card>

            <Card>
              <Text style={styles.section}>Descripción</Text>
              <Text style={styles.body}>
                {course.descripcion ||
                  'Este curso todavía no tiene descripción.'}
              </Text>
            </Card>

            <Card>
              <Text style={styles.section}>
                Contenido publicado
              </Text>

              <Text style={styles.body}>
                {units.length} unidades · {materials.length} materiales · {tasks.length} tareas
              </Text>

              <Text style={[styles.body, { marginTop: 6 }]}>
                Selecciona una pestaña para revisar el contenido que publicó tu docente.
              </Text>
            </Card>
          </>
        )}

        {tab === 'Unidades' && (
          <>
            {units.length === 0 ? (
              <Card>
                <Text style={styles.section}>
                  Unidades de aprendizaje
                </Text>
                <Text style={styles.body}>
                  Todavía no hay unidades publicadas en este curso.
                </Text>
              </Card>
            ) : (
              units.map((unidad) => (
                <Card key={unidad.id}>
                  <View style={styles.cardHeading}>
                    <View style={styles.unitNumber}>
                      <Text style={styles.unitNumberText}>
                        {unidad.ordenUnidad || '•'}
                      </Text>
                    </View>

                    <View style={styles.flex}>
                      <Text style={styles.cardTitle}>
                        {unidad.titulo}
                      </Text>

                      {!!unidad.descripcion && (
                        <Text style={styles.body}>
                          {unidad.descripcion}
                        </Text>
                      )}
                    </View>
                  </View>

                  {lista(unidad.archivos).length > 0 && (
                    <View style={styles.filesBlock}>
                      <Text style={styles.label}>
                        Archivos de la unidad
                      </Text>

                      {unidad.archivos.map((archivo) =>
                        botonArchivo(
                          'unidad',
                          archivo,
                          archivo.tipoMime
                        )
                      )}
                    </View>
                  )}
                </Card>
              ))
            )}
          </>
        )}

        {tab === 'Materiales' && (
          <>
            {materials.length === 0 ? (
              <Card>
                <Text style={styles.section}>
                  Materiales del curso
                </Text>
                <Text style={styles.body}>
                  Todavía no hay materiales publicados por tu docente.
                </Text>
              </Card>
            ) : (
              materials.map((material) => (
                <Card key={material.id}>
                  <View style={styles.cardHeading}>
                    <View style={styles.materialIcon}>
                      <Ionicons
                        name={
                          String(
                            material.tipo ||
                            material.tipoMime ||
                            ''
                          ).toUpperCase().includes('PDF')
                            ? 'document-text'
                            : 'document-attach'
                        }
                        size={25}
                        color={colors.blue}
                      />
                    </View>

                    <View style={styles.flex}>
                      <Text style={styles.cardTitle}>
                        {material.titulo || 'Material del curso'}
                      </Text>

                      {!!material.descripcion && (
                        <Text style={styles.body}>
                          {material.descripcion}
                        </Text>
                      )}

                      <Text style={styles.fileMeta}>
                        {material.tipo ||
                          material.tipoMime ||
                          'Documento'}
                        {material.creadoEn
                          ? ` · ${fechaLegible(material.creadoEn)}`
                          : ''}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.materialActions}>
                    <TouchableOpacity
                      style={[
                        styles.openButton,
                        styles.materialAction,
                      ]}
                      onPress={() => mostrarMaterial(material)}
                      disabled={Boolean(downloading)}
                    >
                      {downloading ===
                      `ver-material-${material.id}` ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <>
                          <Ionicons
                            name="eye-outline"
                            size={18}
                            color="#FFFFFF"
                          />
                          <Text style={styles.openButtonText}>
                            Mostrar material
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.downloadButton,
                        styles.materialAction,
                      ]}
                      onPress={() => descargarMaterial(material)}
                      disabled={Boolean(downloading)}
                    >
                      {downloading ===
                      `descargar-material-${material.id}` ? (
                        <ActivityIndicator color={colors.blue} />
                      ) : (
                        <>
                          <Ionicons
                            name="download-outline"
                            size={18}
                            color={colors.blue}
                          />
                          <Text style={styles.downloadButtonText}>
                            Descargar
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </Card>
              ))
            )}
          </>
        )}

        {tab === 'Tareas' && (
          <>
            {tasks.length === 0 ? (
              <Card>
                <Text style={styles.section}>Actividades</Text>
                <Text style={styles.body}>
                  No hay tareas publicadas para este curso.
                </Text>
              </Card>
            ) : (
              tasks.map((tarea) => (
                <Card key={tarea.id}>
                  <View style={styles.cardHeading}>
                    <View style={styles.taskIcon}>
                      <Ionicons
                        name="clipboard-outline"
                        size={24}
                        color={colors.blue}
                      />
                    </View>

                    <View style={styles.flex}>
                      <Text style={styles.cardTitle}>
                        {tarea.titulo}
                      </Text>

                      {!!tarea.unidadTitulo && (
                        <Text style={styles.fileMeta}>
                          {tarea.unidadTitulo}
                        </Text>
                      )}
                    </View>

                    <View
                      style={[
                        styles.statusPill,
                        tarea.entregada
                          ? styles.statusDone
                          : styles.statusPending,
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {tarea.entregada
                          ? 'Entregada'
                          : 'Pendiente'}
                      </Text>
                    </View>
                  </View>

                  {!!tarea.descripcion && (
                    <Text style={styles.body}>
                      {tarea.descripcion}
                    </Text>
                  )}

                  <Text style={styles.deadline}>
                    <Ionicons
                      name="calendar-outline"
                      size={14}
                    />{' '}
                    Fecha de entrega:{' '}
                    {fechaLegible(
                      tarea.fechaEntrega || tarea.fecha_entrega
                    )}
                  </Text>

                  {lista(tarea.archivos).length > 0 && (
                    <View style={styles.filesBlock}>
                      <Text style={styles.label}>
                        Archivos adjuntos
                      </Text>

                      {tarea.archivos.map((archivo) =>
                        botonArchivo(
                          'tarea',
                          archivo,
                          archivo.tipoMime
                        )
                      )}
                    </View>
                  )}

                  {!tarea.entregada && (
                    <View style={{ marginTop: 14 }}>
                      <TouchableOpacity
                        style={styles.fileButton}
                        onPress={() => seleccionarArchivoEntrega(tarea.id)}
                        disabled={enviandoEntrega !== ''}
                      >
                        <Ionicons
                          name="attach-outline"
                          size={20}
                          color={colors.blue}
                        />
                        <Text style={styles.fileName}>
                          Seleccionar archivo de entrega
                        </Text>
                      </TouchableOpacity>

                      {!!archivoEntrega[tarea.id] && (
                        <View style={styles.selectedFileRow}>
                          <Ionicons name="document-attach-outline" size={16} color={colors.blue} />
                          <Text style={styles.selectedFileText} numberOfLines={2}>
                            {archivoEntrega[tarea.id].name || 'Archivo adjunto'}
                          </Text>
                          <TouchableOpacity
                            onPress={() => setArchivoEntrega((actual) => {
                              const nuevo = { ...actual };
                              delete nuevo[tarea.id];
                              return nuevo;
                            })}
                            disabled={enviandoEntrega !== ''}
                          >
                            <Ionicons name="close-circle" size={20} color="#DC2626" />
                          </TouchableOpacity>
                        </View>
                      )}

                      <Text style={styles.label}>Comentario para el profesor (opcional)</Text>
                      <TextInput
                        style={styles.deliveryComment}
                        value={comentariosEntrega[tarea.id] || ''}
                        onChangeText={(valor) => setComentariosEntrega((actual) => ({
                          ...actual,
                          [tarea.id]: valor,
                        }))}
                        placeholder="Escribe un comentario sobre tu entrega"
                        placeholderTextColor="#94A3B8"
                        multiline
                        textAlignVertical="top"
                        editable={enviandoEntrega === ''}
                        maxLength={1000}
                      />

                      <TouchableOpacity
                        style={[
                          styles.openButton,
                          {
                            marginTop: 10,
                            opacity: enviandoEntrega !== '' ? 0.6 : 1,
                          },
                        ]}
                        onPress={() => enviarEntrega(tarea)}
                        disabled={enviandoEntrega !== ''}
                      >
                        {enviandoEntrega === String(tarea.id) ? (
                          <ActivityIndicator color="#FFFFFF" />
                        ) : (
                          <Text style={styles.openButtonText}>
                            Entregar tarea
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </Card>
              ))
            )}
          </>
        )}

        {tab === 'Calificaciones' && (
          <Card>
            <Text style={styles.section}>Calificaciones</Text>
            <Text style={styles.body}>
              La consulta de calificaciones del alumno todavía no está disponible en los endpoints de contenido que tiene conectado este proyecto.
            </Text>
          </Card>
        )}

        {tab === 'Foro' && (
          <>
            <Text style={styles.section}>Foro del curso</Text>
            {forum.length === 0 ? (
              <Card>
                <Text style={styles.body}>Aún no hay conversaciones en el foro.</Text>
              </Card>
            ) : lista(forum).map((publicacion) => (
              <TouchableOpacity
                key={String(publicacion.id)}
                activeOpacity={0.8}
                onPress={() => abrirConversacion(publicacion)}
              >
                <Card>
                  <View style={styles.forumPostHeader}>
                    <View style={styles.forumAvatar}>
                      <Ionicons name="person" size={18} color={colors.blue} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>
                        {publicacion.nombreUsuario || publicacion.autor || 'Participante'}
                      </Text>
                      <Text style={styles.fileMeta}>
                        {fechaLegible(publicacion.creadoEn || publicacion.creado_en)}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={19} color="#94A3B8" />
                  </View>
                  <Text style={styles.forumPostTitle}>
                    {publicacion.titulo || 'Publicación del foro'}
                  </Text>
                  <Text style={styles.body} numberOfLines={3}>
                    {publicacion.descripcion || publicacion.contenido}
                  </Text>
                  <View style={styles.forumOpenRow}>
                    <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.blue} />
                    <Text style={styles.forumOpenText}>Ver conversación</Text>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </>
        )}

        <Modal
          visible={!!publicacionSeleccionada}
          animationType="slide"
          onRequestClose={() => setPublicacionSeleccionada(null)}
        >
          <KeyboardAvoidingView
            style={styles.forumModal}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.forumModalHeader}>
              <TouchableOpacity onPress={() => setPublicacionSeleccionada(null)} style={styles.forumBackButton}>
                <Ionicons name="arrow-back" size={22} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.forumModalHeading}>Conversación</Text>
              <View style={{ width: 38 }} />
            </View>
            <ScrollView
              style={styles.forumConversationScroll}
              contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
              keyboardShouldPersistTaps="handled"
            >
              {publicacionSeleccionada && (
                <View style={styles.forumDetailCard}>
                  <Text style={styles.forumDetailTitle}>
                    {publicacionSeleccionada.titulo || 'Publicación del foro'}
                  </Text>
                  <Text style={styles.forumDetailAuthor}>
                    {publicacionSeleccionada.nombreUsuario || publicacionSeleccionada.autor || 'Participante'}
                    {' · '}
                    {fechaLegible(publicacionSeleccionada.creadoEn || publicacionSeleccionada.creado_en)}
                  </Text>
                  <Text style={styles.forumDetailDescription}>
                    {publicacionSeleccionada.descripcion || publicacionSeleccionada.contenido}
                  </Text>
                </View>
              )}
              <Text style={styles.forumCommentsHeading}>Comentarios</Text>
              {cargandoRespuestas ? (
                <ActivityIndicator color={colors.blue} style={{ marginTop: 20 }} />
              ) : respuestasForo.length === 0 ? (
                <Text style={styles.body}>Todavía no hay comentarios. ¡Sé el primero en responder!</Text>
              ) : respuestasForo.map((respuesta) => (
                <View key={String(respuesta.id)} style={styles.forumCommentCard}>
                  <Text style={styles.forumCommentAuthor}>
                    {respuesta.nombreUsuario || respuesta.usuarioNombre || respuesta.autor || 'Participante'}
                  </Text>
                  <Text style={styles.forumCommentText}>{respuesta.contenido}</Text>
                  <Text style={styles.fileMeta}>{fechaLegible(respuesta.creadoEn || respuesta.creado_en)}</Text>
                </View>
              ))}
            </ScrollView>
            <View style={styles.forumComposer}>
              <TextInput
                value={comentarioForo}
                onChangeText={setComentarioForo}
                placeholder="Escribe un comentario..."
                placeholderTextColor="#94A3B8"
                multiline
                maxLength={3000}
                style={styles.forumComposerInput}
              />
              <TouchableOpacity
                onPress={enviarComentarioForo}
                disabled={!comentarioForo.trim() || enviandoComentarioForo}
                style={[styles.forumSendButton, (!comentarioForo.trim() || enviandoComentarioForo) && { opacity: 0.5 }]}
              >
                {enviandoComentarioForo ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Ionicons name="send" size={18} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </ScrollView>
    </Page>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 35,
  },

  flex: {
    flex: 1,
    minWidth: 0,
  },

  errorText: {
    fontSize: 13,
    color: '#DC2626',
    textAlign: 'center',
    lineHeight: 20,
  },

  retryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 9,
    marginTop: 5,
  },

  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },

  banner: {
    borderRadius: 16,
    padding: 23,
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center',
    marginBottom: 17,
  },

  bannerInfo: {
    flex: 1,
    minWidth: 0,
  },

  bannerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  bannerSub: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
    flexShrink: 1,
  },

  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginBottom: 16,
  },

  tab: {
    paddingVertical: 9,
    paddingHorizontal: 11,
    borderRadius: 9,
  },

  tabActive: {
    backgroundColor: '#EAF2FF',
  },

  tabText: {
    fontSize: 12,
    color: '#718096',
  },

  tabTextActive: {
    color: colors.blue,
    fontWeight: '700',
  },

  section: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 14,
  },

  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    marginBottom: 12,
  },

  label: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
    marginBottom: 5,
  },

  value: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },

  body: {
    fontSize: 13,
    lineHeight: 21,
    color: '#617087',
  },

  cardHeading: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
    marginBottom: 10,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 5,
  },

  unitNumber: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  unitNumberText: {
    color: colors.blue,
    fontWeight: '800',
  },

  materialIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  taskIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  filesBlock: {
    marginTop: 13,
  },

  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#DCE6F3',
    borderRadius: 11,
    padding: 11,
    marginTop: 7,
    backgroundColor: '#F8FAFC',
  },

  fileInfo: {
    flex: 1,
  },

  fileName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },

  fileMeta: {
    fontSize: 10,
    color: '#8793A5',
    marginTop: 4,
  },

  selectedFileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
  },
  selectedFileText: {
    flex: 1,
    color: colors.blue,
    fontSize: 12,
    fontWeight: '600',
  },
  deliveryComment: {
    minHeight: 76,
    borderWidth: 1,
    borderColor: '#DCE3ED',
    borderRadius: 10,
    padding: 11,
    color: colors.text,
    fontSize: 12,
    marginTop: 3,
    backgroundColor: '#FFFFFF',
  },

  materialActions: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 12,
  },

  materialAction: {
    marginTop: 0,
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
  },

  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.blue,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },

  downloadButtonText: {
    color: colors.blue,
    fontSize: 12,
    fontWeight: '700',
  },

  openButton: {
    borderRadius: 10,
    paddingVertical: 12,
    backgroundColor: colors.blue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  openButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },

  deadline: {
    color: '#667085',
    fontSize: 11,
    marginTop: 12,
  },

  statusPill: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },

  statusDone: {
    backgroundColor: '#DCFCE7',
  },

  statusPending: {
    backgroundColor: '#FEF3C7',
  },

  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },

  reply: {
    borderLeftWidth: 2,
    borderLeftColor: '#CBD5E1',
    paddingLeft: 10,
    marginTop: 12,
  },

  replyAuthor: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 3,
  },
    forumPostHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  forumAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EAF2FF', alignItems: 'center', justifyContent: 'center' },
  forumPostTitle: { color: colors.text, fontSize: 15, fontWeight: '800', marginTop: 13, marginBottom: 5 },
  forumOpenRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 13 },
  forumOpenText: { color: colors.blue, fontSize: 12, fontWeight: '700' },
  forumModal: { flex: 1, backgroundColor: '#F8FAFC' },
  forumModalHeader: { minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  forumBackButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  forumModalHeading: { color: colors.text, fontSize: 16, fontWeight: '800' },
  forumConversationScroll: { flex: 1 },
  forumDetailCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  forumDetailTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  forumDetailAuthor: { color: '#64748B', fontSize: 11, marginTop: 8 },
  forumDetailDescription: { color: '#334155', fontSize: 14, lineHeight: 21, marginTop: 14 },
  forumCommentsHeading: { color: colors.text, fontSize: 15, fontWeight: '800', marginTop: 22, marginBottom: 10 },
  forumCommentCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 12, marginBottom: 9 },
  forumCommentAuthor: { color: colors.text, fontSize: 12, fontWeight: '800', marginBottom: 5 },
  forumCommentText: { color: '#334155', fontSize: 13, lineHeight: 19 },
  forumComposer: { flexDirection: 'row', alignItems: 'flex-end', gap: 9, padding: 12, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  forumComposerInput: { flex: 1, minHeight: 44, maxHeight: 110, backgroundColor: '#F1F5F9', borderRadius: 12, paddingHorizontal: 13, paddingVertical: 10, color: colors.text, fontSize: 13 },
  forumSendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center' },
});
