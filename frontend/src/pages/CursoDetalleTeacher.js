import React, { useCallback, useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as FileSystem from 'expo-file-system/legacy';
import { File } from 'expo-file-system';

import { listarMisCursos } from '../service/cursosService';

import {
  listarUnidades,
  crearUnidad,
  actualizarUnidad,
  eliminarUnidad,
  listarArchivosUnidad,
  subirArchivoUnidad,
  listarMateriales,
  crearMaterial,
  eliminarMaterial,
  listarTareas,
  crearTarea,
  actualizarTarea,
  eliminarTarea,
  listarArchivosTarea,
  subirArchivoTarea,
  listarEntregas,
  descargarArchivo,
  calificarEntrega,
  listarPublicaciones,
  listarRespuestas,
  crearPublicacion,
  eliminarPublicacion,
  crearRespuesta,
  eliminarRespuesta,
} from '../service/contenidoCursoService';

const tabs = [
  'Inicio',
  'Unidades',
  'Materiales',
  'Tareas',
  'Entregas',
  'Foro',
];

const formularioInicial = {
  titulo: '',
  descripcion: '',
  fechaEntrega: '',
  ordenUnidad: '',
  modoLibro: false,
};

export default function CursoDetalleTeacher({ route, navigation }) {
  const cursoId = route?.params?.id;

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [tab, setTab] = useState('Inicio');

  const [units, setUnits] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [forum, setForum] = useState([]);
  const [selectedForumPost, setSelectedForumPost] = useState(null);
  const [forumReplies, setForumReplies] = useState([]);
  const [loadingForumReplies, setLoadingForumReplies] = useState(false);

  const [selectedTask, setSelectedTask] = useState(null);
  const [taskPickerVisible, setTaskPickerVisible] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);

  const [modal, setModal] = useState(false);
  const [replyModal, setReplyModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState(formularioInicial);
  const [replyText, setReplyText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const [saving, setSaving] = useState(false);
  const [openingDelivery, setOpeningDelivery] = useState(null);

  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());

  // Actualiza un campo del formulario sin perder los demás valores.
  const actualizarFormulario = (campo, valor) => {
    setForm((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  };

  const cargarCurso = useCallback(async () => {
    if (!cursoId) {
      setError('No se recibió el identificador del curso.');
      setLoading(false);
      return;
    }

    try {
      setError('');

      const cursos = await listarMisCursos();

      const encontrado = cursos.find(
        (item) => String(item.id) === String(cursoId)
      );

      if (!encontrado) {
        throw new Error(
          'No se encontró este curso entre tus cursos asignados.'
        );
      }

      setCourse(encontrado);
    } catch (e) {
      setError(e.message || 'No se pudo cargar el curso.');
    }
  }, [cursoId]);

  const cargarContenido = useCallback(async () => {
    if (!cursoId) {
      return;
    }

    try {
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

      setUnits(Array.isArray(unidadesData) ? unidadesData : []);
      setMaterials(Array.isArray(materialesData) ? materialesData : []);
      setTasks(Array.isArray(tareasData) ? tareasData : []);
      setForum(Array.isArray(foroData) ? foroData : []);
    } catch (e) {
      Alert.alert(
        'Error',
        e.message || 'No se pudo cargar el contenido del curso.'
      );
    }
  }, [cursoId]);

  const cargarTodo = useCallback(async () => {
    setLoading(true);

    await cargarCurso();
    await cargarContenido();

    setLoading(false);
  }, [cargarCurso, cargarContenido]);

  useEffect(() => {
    cargarTodo();
  }, [cargarTodo]);

  const actualizarContenido = async () => {
    setRefreshing(true);

    await cargarContenido();

    setRefreshing(false);
  };

  const abrirCalendario = () => {
  const fechaActual = form.fechaEntrega
    ? new Date(form.fechaEntrega)
    : new Date();

    setFechaSeleccionada(
      Number.isNaN(fechaActual.getTime())
        ? new Date()
        : fechaActual
    );

    setMostrarCalendario(true);
  };

  const seleccionarFechaEntrega = (event, fecha) => {
    setMostrarCalendario(false);

    if (event.type === 'dismissed' || !fecha) {
      return;
    }

    // Se establece la hora límite a las 23:59.
    const fechaFinal = new Date(fecha);
    fechaFinal.setHours(23, 59, 0, 0);

    const dosDigitos = (numero) =>
      String(numero).padStart(2, '0');

    const fechaFormateada =
      `${fechaFinal.getFullYear()}-` +
      `${dosDigitos(fechaFinal.getMonth() + 1)}-` +
      `${dosDigitos(fechaFinal.getDate())}T23:59`;

    setFechaSeleccionada(fechaFinal);
    actualizarFormulario('fechaEntrega', fechaFormateada);
  };

  const abrirFormulario = (item = null) => {
    setEditing(item);

    setSelectedFile(null);

    setForm({
      titulo: item?.titulo || '',
      descripcion: item?.descripcion || '',
      fechaEntrega: item?.fechaEntrega || item?.fecha_entrega || '',
      ordenUnidad: String(item?.ordenUnidad || item?.orden_unidad || ''),
      modoLibro: Boolean(item?.modoLibro || item?.modo_libro),
    });

    setModal(true);
  };

  const cerrarFormulario = () => {
    setModal(false);
    setEditing(null);
    setSelectedFile(null);
    setForm(formularioInicial);
  };

  const seleccionarArchivo = async () => {
    try {
      // Selector nativo de Android (Storage Access Framework).
      // Devuelve un File con URI content:// y permiso de lectura persistente.
      // Evita las rutas de caché de Expo Go que DocumentPicker no deja leer.
      const resultado = await File.pickFileAsync({
        mimeTypes: '*/*',
        multipleFiles: false,
      });

      if (resultado.canceled || !resultado.result) {
        return;
      }

      const archivo = resultado.result;

      if (!archivo.name) {
        throw new Error('No se pudo obtener el nombre del archivo seleccionado.');
      }

      setSelectedFile(archivo);
    } catch (e) {
      Alert.alert(
        'Error al seleccionar archivo',
        e.message || 'No se pudo seleccionar el archivo.'
      );
    }
  };

  const guardarUnidad = async () => {
    if (!form.titulo.trim()) {
      Alert.alert('Campo obligatorio', 'Escribe el título de la unidad.');
      return;
    }

    const datos = {
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim(),
      ordenUnidad: form.ordenUnidad
        ? Number(form.ordenUnidad)
        : null,
    };

    if (
      datos.ordenUnidad !== null &&
      (!Number.isInteger(datos.ordenUnidad) || datos.ordenUnidad < 1)
    ) {
      Alert.alert('Orden inválido', 'Ingresa un número mayor que cero.');
      return;
    }

    if (editing) {
      await actualizarUnidad(cursoId, editing.id, datos);
    } else {
      await crearUnidad(cursoId, datos);
    }
  };

  const guardarMaterial = async () => {
    if (!form.titulo.trim()) {
      Alert.alert('Campo obligatorio', 'Escribe el título del material.');
      return;
    }

    if (!editing && !selectedFile) {
      Alert.alert('Archivo obligatorio', 'Selecciona un archivo.');
      return;
    }

    if (editing) {
      Alert.alert(
        'Información',
        'La edición de materiales no está disponible en el backend actual. Puedes eliminarlo y registrar uno nuevo.'
      );
      return;
    }

    await crearMaterial(
      cursoId,
      {
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        modoLibro: form.modoLibro,
      },
      selectedFile
    );
  };

  const guardarTarea = async () => {
    if (!form.titulo.trim()) {
      Alert.alert('Campo obligatorio', 'Escribe el título de la tarea.');
      return;
    }

    const datos = {
      unidadId: selectedUnit?.id || null,
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim(),
      fechaEntrega: form.fechaEntrega.trim() || null,
    };

    if (editing) {
      await actualizarTarea(cursoId, editing.id, datos);
    } else {
      const resultado = await crearTarea(cursoId, datos);

      const tareaId = resultado?.id;

      if (selectedFile && tareaId) {
        await subirArchivoTarea(cursoId, tareaId, selectedFile);
      }
    }
  };

  const guardarPublicacion = async () => {
    if (!form.descripcion.trim()) {
      Alert.alert('Campo obligatorio', 'Escribe el contenido de la publicación.');
      return;
    }

    await crearPublicacion(
      cursoId,
      form.descripcion.trim()
    );
  };

  const guardar = async () => {
    try {
      setSaving(true);

      if (tab === 'Unidades') {
        await guardarUnidad();
      } else if (tab === 'Materiales') {
        await guardarMaterial();
      } else if (tab === 'Tareas') {
        await guardarTarea();
      } else if (tab === 'Foro') {
        await guardarPublicacion();
      }

      cerrarFormulario();
      await cargarContenido();

      Alert.alert('Correcto', 'La operación se realizó correctamente.');
    } catch (e) {
      Alert.alert(
        'Error',
        e.message || 'No se pudo guardar la información.'
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmarEliminar = (mensaje, accion) => {
    Alert.alert('Confirmar eliminación', mensaje, [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await accion();
            await cargarContenido();

            Alert.alert('Correcto', 'Se eliminó correctamente.');
          } catch (e) {
            Alert.alert(
              'Error',
              e.message || 'No se pudo eliminar.'
            );
          }
        },
      },
    ]);
  };

  const eliminarElemento = (item) => {
    if (tab === 'Unidades') {
      confirmarEliminar(
        '¿Deseas eliminar esta unidad y su contenido?',
        () => eliminarUnidad(cursoId, item.id)
      );
    }

    if (tab === 'Materiales') {
      confirmarEliminar(
        '¿Deseas eliminar este material?',
        () => eliminarMaterial(cursoId, item.id)
      );
    }

    if (tab === 'Tareas') {
      confirmarEliminar(
        '¿Deseas eliminar esta tarea?',
        () => eliminarTarea(cursoId, item.id)
      );
    }

    if (tab === 'Foro') {
      confirmarEliminar(
        '¿Deseas eliminar esta publicación?',
        () => eliminarPublicacion(cursoId, item.id)
      );
    }
  };

  const cargarEntregas = async (tarea) => {
    try {
      setSelectedTask(tarea);

      const resultado = await listarEntregas(
        cursoId,
        tarea.id
      );

      setDeliveries(Array.isArray(resultado) ? resultado : []);
    } catch (e) {
      Alert.alert(
        'Error',
        e.message || 'No se pudieron cargar las entregas.'
      );
    }
  };

  const abrirArchivoEntrega = async (entrega) => {
    if (openingDelivery) return;

    const entregaId = entrega?.id;
    if (!entregaId) {
      Alert.alert('Archivo no disponible', 'No se encontró el identificador de la entrega.');
      return;
    }

    setOpeningDelivery(String(entregaId));

    try {
      const destino = await descargarArchivo(cursoId, 'entrega', entregaId);
      const nombreOriginal =
        entrega.nombreOriginal ||
        entrega.nombre_original ||
        `entrega-${entregaId}`;
      const nombreSeguro = String(nombreOriginal)
        .replace(/[\\/:*?"<>|]/g, '_')
        .replace(/\s+/g, '_');
      const mime =
        entrega.tipoMime ||
        entrega.tipo_mime ||
        'application/octet-stream';
      const extension = nombreSeguro.includes('.')
        ? ''
        : mime.includes('pdf') ? '.pdf' : '.bin';
      const uriTemporal =
        `${FileSystem.cacheDirectory}${Date.now()}_${nombreSeguro}${extension}`;

      const descarga = await FileSystem.downloadAsync(
        destino.url,
        uriTemporal,
        { headers: destino.headers }
      );

      if (descarga.status < 200 || descarga.status >= 300) {
        throw new Error(`No se pudo descargar el archivo (${descarga.status}).`);
      }

      const archivoLocal = new File(descarga.uri);
      if (!(await File.canPreview(archivoLocal))) {
        throw new Error('No hay una aplicación compatible para abrir este archivo. Puedes revisar el archivo desde un visor compatible del dispositivo.');
      }

      await File.preview(archivoLocal, {
        mimeType: mime,
        title: nombreOriginal,
      });
    } catch (e) {
      Alert.alert(
        'No se pudo abrir la entrega',
        e.message || 'Comprueba tu conexión e inténtalo nuevamente.'
      );
    } finally {
      setOpeningDelivery(null);
    }
  };

  const calificar = (entrega) => {
    Alert.alert(
      'Calificar entrega',
      `Estudiante: ${entrega.alumnoNombre || entrega.alumno_nombre || entrega.alumnoId || 'Estudiante'}`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Ingresar nota',
          onPress: () => {
            setEditing(entrega);
            setForm({
              ...formularioInicial,
              titulo: String(entrega.nota ?? ''),
              descripcion: entrega.observacionDocente || entrega.observacion_docente || '',
            });

            setModal(true);
            setTab('Calificar');
          },
        },
      ]
    );
  };

  const guardarCalificacion = async () => {
    const nota = Number(form.titulo);

    if (!Number.isFinite(nota) || nota < 0 || nota > 20) {
      Alert.alert('Nota inválida', 'Ingresa una nota entre 0 y 20.');
      return;
    }

    await calificarEntrega(
      cursoId,
      editing.id,
      {
        nota,
        observacionDocente: form.descripcion.trim(),
      }
    );

    setTab('Entregas');

    if (selectedTask) {
      await cargarEntregas(selectedTask);
    }

    cerrarFormulario();
  };

  const abrirConversacion = async (publicacion) => {
    setSelectedForumPost(publicacion);
    setForumReplies([]);
    setLoadingForumReplies(true);

    try {
      const respuestas = await listarRespuestas(cursoId, publicacion.id);
      setForumReplies(Array.isArray(respuestas) ? respuestas : []);
    } catch (e) {
      Alert.alert(
        'No se pudo cargar la conversación',
        e.message || 'Inténtalo nuevamente.'
      );
    } finally {
      setLoadingForumReplies(false);
    }
  };

  const abrirRespuestas = (publicacion) => {
    setEditing(publicacion);
    setReplyText('');
    setReplyModal(true);
  };

  const enviarRespuesta = async () => {
    if (!replyText.trim() || !editing) {
      return;
    }

    try {
      await crearRespuesta(
        cursoId,
        editing.id,
        replyText.trim()
      );

      setReplyModal(false);
      setReplyText('');

      await cargarContenido();
    } catch (e) {
      Alert.alert(
        'Error',
        e.message || 'No se pudo enviar la respuesta.'
      );
    }
  };

  const borrarRespuesta = (publicacion, respuesta) => {
    confirmarEliminar(
      '¿Deseas eliminar esta respuesta?',
      () => eliminarRespuesta(
        cursoId,
        publicacion.id,
        respuesta.id
      )
    );
  };

  const cargarArchivosUnidad = async (unidad) => {
    try {
      setSelectedUnit(unidad);

      const archivos = await listarArchivosUnidad(
        cursoId,
        unidad.id
      );

      Alert.alert(
        unidad.titulo,
        archivos?.length
          ? archivos.map((item) => item.nombre_original || item.nombreOriginal).join('\n')
          : 'Esta unidad no tiene archivos.'
      );
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const cargarArchivosTarea = async (tarea) => {
    try {
      const archivos = await listarArchivosTarea(
        cursoId,
        tarea.id
      );

      Alert.alert(
        tarea.titulo,
        archivos?.length
          ? archivos.map((item) => item.nombre_original || item.nombreOriginal).join('\n')
          : 'Esta tarea no tiene archivos adjuntos.'
      );
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const renderAcciones = (item, mostrarEditar = true) => (
    <View style={styles.itemActions}>
      {mostrarEditar && (
        <TouchableOpacity
          onPress={() => abrirFormulario(item)}
          style={styles.actionButton}
        >
          <Ionicons
            name="create-outline"
            size={18}
            color="#2563EB"
          />
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={() => eliminarElemento(item)}
        style={styles.actionButton}
      >
        <Ionicons
          name="trash-outline"
          size={18}
          color="#DC2626"
        />
      </TouchableOpacity>
    </View>
  );

  const renderUnidades = () => (
    <View style={styles.card}>
      <View style={styles.sectionHeading}>
        <Text style={styles.section}>
          Unidades de aprendizaje
        </Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => abrirFormulario()}
        >
          <Ionicons name="add" size={17} color="#FFFFFF" />
          <Text style={styles.addText}>Agregar</Text>
        </TouchableOpacity>
      </View>

      {units.length === 0 ? (
        <Text style={styles.body}>
          Todavía no hay unidades registradas.
        </Text>
      ) : (
        units.map((item) => (
          <View key={String(item.id)} style={styles.itemRow}>
            <View style={styles.itemIcon}>
              <Ionicons
                name="book-outline"
                size={20}
                color="#3478F6"
              />
            </View>

            <TouchableOpacity
              style={styles.itemInfo}
              onPress={() => cargarArchivosUnidad(item)}
            >
              <Text style={styles.itemTitle}>
                {item.titulo}
              </Text>

              <Text style={styles.body}>
                {item.descripcion || 'Sin descripción'}
              </Text>

              <Text style={styles.link}>
                Ver archivos de la unidad
              </Text>
            </TouchableOpacity>

            {renderAcciones(item)}
          </View>
        ))
      )}
    </View>
  );

  const renderMateriales = () => (
    <View style={styles.card}>
      <View style={styles.sectionHeading}>
        <Text style={styles.section}>
          Materiales del curso
        </Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => abrirFormulario()}
        >
          <Ionicons name="add" size={17} color="#FFFFFF" />
          <Text style={styles.addText}>Agregar</Text>
        </TouchableOpacity>
      </View>

      {materials.length === 0 ? (
        <Text style={styles.body}>
          Todavía no hay materiales registrados.
        </Text>
      ) : (
        materials.map((item) => (
          <View key={String(item.id)} style={styles.itemRow}>
            <View style={styles.itemIcon}>
              <Ionicons
                name="document-text-outline"
                size={20}
                color="#3478F6"
              />
            </View>

            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>
                {item.titulo}
              </Text>

              <Text style={styles.body}>
                {item.descripcion || 'Material del curso'}
              </Text>

              <Text style={styles.muted}>
                {item.nombre_original || item.nombreOriginal || 'Material'}
              </Text>
            </View>

            {renderAcciones(item, false)}
          </View>
        ))
      )}
    </View>
  );

  const renderTareas = () => (
    <View style={styles.card}>
      <View style={styles.sectionHeading}>
        <Text style={styles.section}>
          Tareas del curso
        </Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => abrirFormulario()}
        >
          <Ionicons name="add" size={17} color="#FFFFFF" />
          <Text style={styles.addText}>Agregar</Text>
        </TouchableOpacity>
      </View>

      {tasks.length === 0 ? (
        <Text style={styles.body}>
          Todavía no hay tareas registradas.
        </Text>
      ) : (
        tasks.map((item) => (
          <View key={String(item.id)} style={styles.taskCard}>
            <View style={styles.itemRow}>
              <View style={styles.itemIcon}>
                <Ionicons
                  name="clipboard-outline"
                  size={20}
                  color="#3478F6"
                />
              </View>

              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>
                  {item.titulo}
                </Text>

                <Text style={styles.body}>
                  {item.descripcion || 'Sin descripción'}
                </Text>

                <Text style={styles.muted}>
                  Entrega: {item.fecha_entrega || item.fechaEntrega || 'Sin fecha'}
                </Text>
              </View>

              {renderAcciones(item)}
            </View>

            <View style={styles.taskActions}>
              <TouchableOpacity
                style={styles.smallButton}
                onPress={() => cargarArchivosTarea(item)}
              >
                <Text style={styles.smallButtonText}>
                  Archivos
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.smallButton}
                onPress={() => {
                  setSelectedTask(item);
                  setTab('Entregas');
                  cargarEntregas(item);
                }}
              >
                <Text style={styles.smallButtonText}>
                  Ver entregas
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );

  const renderEntregas = () => (
    <View style={styles.card}>
      <View style={styles.sectionHeading}>
        <View style={{ flex: 1 }}>
          <Text style={styles.section}>Entregas de tareas</Text>
          <Text style={styles.muted}>
            Revisa los archivos enviados por tus estudiantes. La calificación se realizará después.
          </Text>
        </View>
        <View style={styles.deliveryCountBadge}>
          <Text style={styles.deliveryCountText}>{deliveries.length}</Text>
        </View>
      </View>

      {tasks.length === 0 ? (
        <Text style={styles.body}>Primero debes registrar una tarea.</Text>
      ) : (
        <>
          <Text style={styles.label}>Tarea seleccionada</Text>
          <TouchableOpacity
            style={styles.taskPickerButton}
            onPress={() => setTaskPickerVisible(true)}
            activeOpacity={0.85}
          >
            <View style={styles.taskPickerIcon}>
              <Ionicons name="clipboard-outline" size={21} color="#2563EB" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.taskPickerTitle}>
                {selectedTask?.titulo || 'Selecciona una tarea'}
              </Text>
              <Text style={styles.muted}>
                {selectedTask
                  ? `${tasks.length} tareas disponibles · ${selectedTask.fecha_entrega || selectedTask.fechaEntrega || 'Sin fecha límite'}`
                  : `${tasks.length} tareas disponibles`}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={20} color="#64748B" />
          </TouchableOpacity>
        </>
      )}

      {selectedTask && (
        <View style={styles.deliveryList}>
          <View style={styles.deliveryHeading}>
            <View style={{ flex: 1 }}>
              <Text style={styles.section}>{selectedTask.titulo}</Text>
              <Text style={styles.muted}>
                {deliveries.length} {deliveries.length === 1 ? 'entrega recibida' : 'entregas recibidas'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.refreshDeliveriesButton}
              onPress={() => cargarEntregas(selectedTask)}
            >
              <Ionicons name="refresh-outline" size={17} color="#2563EB" />
              <Text style={styles.refreshDeliveriesText}>Actualizar</Text>
            </TouchableOpacity>
          </View>

          {deliveries.length === 0 ? (
            <View style={styles.emptyDeliveries}>
              <Ionicons name="file-tray-outline" size={30} color="#94A3B8" />
              <Text style={styles.emptyDeliveriesTitle}>Aún no hay entregas</Text>
              <Text style={styles.muted}>Cuando un estudiante envíe su archivo, aparecerá aquí.</Text>
            </View>
          ) : (
            deliveries.map((item) => {
              const nombreEstudiante =
                item.nombreAlumno || item.alumnoNombre || item.alumno_nombre ||
                item.alumnoId || 'Estudiante';
              const nombreDocumento =
                item.nombreOriginal || item.nombre_original || 'Archivo entregado';
              const fecha = item.entregadoEn || item.entregado_en;
              const comentario = item.comentario;

              return (
                <View key={String(item.id)} style={styles.deliveryCard}>
                  <View style={styles.deliveryStudentRow}>
                    <View style={styles.deliveryAvatar}>
                      <Ionicons name="person" size={19} color="#2563EB" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.deliveryStudentName}>{nombreEstudiante}</Text>
                      {!!(item.codigoAlumno || item.codigo_alumno) && (
                        <Text style={styles.muted}>
                          Código: {item.codigoAlumno || item.codigo_alumno}
                        </Text>
                      )}
                    </View>
                    <View style={styles.pendingBadge}>
                      <Text style={styles.pendingBadgeText}>Pendiente</Text>
                    </View>
                  </View>

                  <View style={styles.deliveryFileRow}>
                    <View style={styles.deliveryFileIcon}>
                      <Ionicons name="document-text-outline" size={21} color="#475569" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.deliveryFileName} numberOfLines={2}>{nombreDocumento}</Text>
                      <Text style={styles.muted}>Archivo enviado por el estudiante</Text>
                    </View>
                  </View>

                  {!!fecha && (
                    <Text style={styles.deliveryMeta}>
                      Entregado: {String(fecha).replace('T', ' ').slice(0, 16)}
                    </Text>
                  )}

                  {!!comentario && (
                    <View style={styles.deliveryCommentBox}>
                      <Text style={styles.deliveryCommentLabel}>Comentario del estudiante</Text>
                      <Text style={styles.deliveryCommentText}>{comentario}</Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.openDeliveryButton}
                    onPress={() => abrirArchivoEntrega(item)}
                    disabled={Boolean(openingDelivery)}
                  >
                    {openingDelivery === String(item.id) ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Ionicons name="eye-outline" size={18} color="#FFFFFF" />
                    )}
                    <Text style={styles.openDeliveryButtonText}>
                      {openingDelivery === String(item.id) ? 'Abriendo archivo...' : 'Ver archivo entregado'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.gradeDeliveryButton}
                    onPress={() => calificar(item)}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="create-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.openDeliveryButtonText}>
                      {item.nota !== null && item.nota !== undefined
                        ? 'Editar calificación'
                        : 'Calificar entrega'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>
      )}
    </View>
  );

  const renderForo = () => (
    <>
      <View style={styles.forumSection}>
        <View style={styles.sectionHeading}>
          <Text style={styles.section}>Foro del curso</Text>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => abrirFormulario()}
          >
            <Ionicons name="add" size={17} color="#FFFFFF" />
            <Text style={styles.addText}>Publicar</Text>
          </TouchableOpacity>
        </View>

        {forum.length === 0 ? (
          <View style={styles.forumEmptyCard}>
            <Text style={styles.body}>Aún no hay conversaciones en el foro.</Text>
          </View>
        ) : (
          forum.map((item) => (
            <TouchableOpacity
              key={String(item.id)}
              activeOpacity={0.8}
              onPress={() => abrirConversacion(item)}
            >
              <View style={styles.forumStudentCard}>
                <View style={styles.forumPostHeader}>
                  <View style={styles.forumAvatar}>
                    <Ionicons name="person" size={18} color="#2563EB" />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.forumAuthor}>
                      {item.nombreUsuario ||
                        item.usuarioNombre ||
                        item.usuario_nombre ||
                        item.autor ||
                        'Participante'}
                    </Text>
                    <Text style={styles.forumDate}>
                      {item.creadoEn || item.creado_en
                        ? new Date(item.creadoEn || item.creado_en).toLocaleString('es-PE', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : ' '}
                    </Text>
                  </View>

                  <Ionicons name="chevron-forward" size={19} color="#94A3B8" />
                </View>

                <Text style={styles.forumPostTitle}>
                  {item.titulo || 'Publicación del foro'}
                </Text>

                <Text style={styles.forumPostBody} numberOfLines={3}>
                  {item.descripcion || item.contenido || ''}
                </Text>

                <View style={styles.forumOpenRow}>
                  <Ionicons name="chatbubble-ellipses-outline" size={16} color="#2563EB" />
                  <Text style={styles.forumOpenText}>Ver conversación</Text>
                </View>

                <View style={styles.forumTeacherActions}>
                  <TouchableOpacity
                    onPress={() => eliminarElemento(item)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteText}>Eliminar publicación</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      <Modal
        visible={!!selectedForumPost}
        animationType="slide"
        onRequestClose={() => setSelectedForumPost(null)}
      >
        <View style={styles.forumConversationModal}>
          <View style={styles.forumConversationHeader}>
            <TouchableOpacity
              onPress={() => setSelectedForumPost(null)}
              style={styles.forumBackButton}
            >
              <Ionicons name="arrow-back" size={22} color="#1E293B" />
            </TouchableOpacity>
            <Text style={styles.forumModalHeading}>Conversación</Text>
            <View style={{ width: 38 }} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.forumConversationContent}
          >
            {selectedForumPost && (
              <>
                <View style={styles.forumDetailCard}>
                  <Text style={styles.forumDetailTitle}>
                    {selectedForumPost.titulo || 'Publicación del foro'}
                  </Text>
                  <Text style={styles.forumDetailAuthor}>
                    {selectedForumPost.nombreUsuario ||
                      selectedForumPost.usuarioNombre ||
                      selectedForumPost.usuario_nombre ||
                      selectedForumPost.autor ||
                      'Participante'}
                    {' · '}
                    {selectedForumPost.creadoEn || selectedForumPost.creado_en
                      ? new Date(selectedForumPost.creadoEn || selectedForumPost.creado_en).toLocaleString('es-PE', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })
                      : ' '}
                  </Text>
                  <Text style={styles.forumDetailDescription}>
                    {selectedForumPost.descripcion || selectedForumPost.contenido || ''}
                  </Text>
                </View>

                <Text style={styles.forumCommentsHeading}>Comentarios</Text>

                {loadingForumReplies ? (
                  <ActivityIndicator size="small" color="#2563EB" style={{ marginTop: 18 }} />
                ) : forumReplies.length > 0 ? (
                  forumReplies.map((respuesta) => (
                    <View key={String(respuesta.id)} style={styles.forumCommentCard}>
                      <View style={styles.forumCommentHeader}>
                        <Text style={styles.forumCommentAuthor}>
                          {respuesta.nombreUsuario ||
                            respuesta.usuarioNombre ||
                            respuesta.usuario_nombre ||
                            respuesta.autor ||
                            'Participante'}
                        </Text>
                        <TouchableOpacity
                          onPress={() => borrarRespuesta(selectedForumPost, respuesta)}
                        >
                          <Ionicons name="trash-outline" size={16} color="#DC2626" />
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.forumCommentText}>
                        {respuesta.contenido || ''}
                      </Text>
                      <Text style={styles.fileMeta}>
                        {respuesta.creadoEn || respuesta.creado_en
                          ? new Date(respuesta.creadoEn || respuesta.creado_en).toLocaleString('es-PE')
                          : ''}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.body}>Todavía no hay comentarios en esta publicación.</Text>
                )}
              </>
            )}
          </ScrollView>

          {selectedForumPost && (
            <View style={styles.forumConversationFooter}>
              <TouchableOpacity
                style={styles.forumDeleteAction}
                onPress={() => {
                  const publicacion = selectedForumPost;
                  setSelectedForumPost(null);
                  eliminarElemento(publicacion);
                }}
              >
                <Ionicons name="trash-outline" size={17} color="#DC2626" />
                <Text style={styles.forumDeleteActionText}>Eliminar publicación</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />

        <Text style={styles.loadingText}>
          Cargando curso...
        </Text>
      </View>
    );
  }

  if (error || !course) {
    return (
      <View style={styles.center}>
        <Ionicons
          name="alert-circle-outline"
          size={42}
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

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>
            Regresar
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const colorCurso = course.color || '#2994F5';
  const cantidadEstudiantes = Number(course.alumnos || 0);

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={actualizarContenido}
            colors={['#2563EB']}
          />
        }
      >
        <View style={styles.pageHeading}>
          <View style={styles.headingInfo}>
            <Text style={styles.pageTitle}>
              {course.nombre}
            </Text>

            <Text style={styles.muted}>
              Administra el contenido de tu curso.
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            accessibilityLabel="Volver"
          >
            <Ionicons
              name="arrow-back"
              size={23}
              color="#263244"
            />
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.banner,
            {
              backgroundColor: colorCurso,
            },
          ]}
        >
          <Ionicons
            name={course.icono || 'book-outline'}
            size={34}
            color="#FFFFFF"
          />

          <View style={styles.bannerInfo}>
            <Text style={styles.bannerTitle}>
              {course.nombre}
            </Text>

            <Text style={styles.bannerSub}>
              {course.grado} · {course.nivel} · Sección {course.seccionCodigo || course.seccion}
            </Text>

            <Text style={styles.bannerSub}>
              {cantidadEstudiantes} estudiantes
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
              onPress={() => {
                setTab(item);

                if (item !== 'Entregas') {
                  setSelectedTask(null);
                }
              }}
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
            <View style={styles.card}>
              <Text style={styles.section}>
                Información del curso
              </Text>

              <Info
                icon="person-outline"
                label="Docente"
                value={course.docente || 'No registrado'}
              />

              <Info
                icon="school-outline"
                label="Grado"
                value={`${course.grado || '—'} ${course.nivel || ''}`}
              />

              <Info
                icon="people-outline"
                label="Sección"
                value={course.seccionCodigo || course.seccion || '—'}
              />

              <Info
                icon="people-outline"
                label="Estudiantes matriculados"
                value={String(cantidadEstudiantes)}
              />

              <Info
                icon="calendar-outline"
                label="Año escolar"
                value={String(course.anio || 'No registrado')}
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.section}>
                Descripción
              </Text>

              <Text style={styles.body}>
                {course.descripcion || 'Este curso todavía no tiene descripción.'}
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.section}>
                Resumen del curso
              </Text>

              <View style={styles.summaryRow}>
                <Summary
                  icon="book-outline"
                  label="Unidades"
                  value={units.length}
                />

                <Summary
                  icon="document-text-outline"
                  label="Materiales"
                  value={materials.length}
                />

                <Summary
                  icon="clipboard-outline"
                  label="Tareas"
                  value={tasks.length}
                />
              </View>
            </View>
          </>
        )}

        {tab === 'Unidades' && renderUnidades()}
        {tab === 'Materiales' && renderMateriales()}
        {tab === 'Tareas' && renderTareas()}
        {tab === 'Entregas' && renderEntregas()}
        {tab === 'Foro' && renderForo()}
      </ScrollView>

      <Modal
        visible={taskPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTaskPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.taskPickerModal}>
            <View style={styles.taskPickerModalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Seleccionar tarea</Text>
                <Text style={styles.muted}>Elige cuál deseas revisar</Text>
              </View>
              <TouchableOpacity
                onPress={() => setTaskPickerVisible(false)}
                style={styles.taskPickerClose}
              >
                <Ionicons name="close" size={22} color="#475569" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.taskPickerOptions} showsVerticalScrollIndicator>
              {tasks.map((item) => (
                <TouchableOpacity
                  key={String(item.id)}
                  style={[
                    styles.taskPickerOption,
                    String(selectedTask?.id) === String(item.id) && styles.taskPickerOptionActive,
                  ]}
                  onPress={async () => {
                    setTaskPickerVisible(false);
                    await cargarEntregas(item);
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.taskPickerTitle}>{item.titulo}</Text>
                    <Text style={styles.muted}>
                      {item.fecha_entrega || item.fechaEntrega || 'Sin fecha límite'}
                    </Text>
                  </View>
                  {String(selectedTask?.id) === String(item.id) ? (
                    <Ionicons name="checkmark-circle" size={21} color="#2563EB" />
                  ) : (
                    <Ionicons name="chevron-forward" size={19} color="#94A3B8" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={modal}
        transparent
        animationType="fade"
        onRequestClose={cerrarFormulario}
      >
        <View style={styles.modalOverlay}>
          <ScrollView
            contentContainerStyle={styles.modalScroll}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>
                {tab === 'Calificar'
                  ? 'Calificar entrega'
                  : `${editing ? 'Editar' : 'Agregar'} ${
                      tab === 'Unidades'
                        ? 'unidad'
                        : tab === 'Materiales'
                          ? 'material'
                          : tab === 'Tareas'
                            ? 'tarea'
                            : 'publicación'
                    }`}
              </Text>

              {tab === 'Calificar' ? (
                <>
                  <Text style={styles.label}>
                    Nota (0 a 20)
                  </Text>

                  <TextInput
                    style={styles.input}
                    value={form.titulo}
                    onChangeText={(value) =>
                      actualizarFormulario('titulo', value)
                    }
                    keyboardType="decimal-pad"
                    placeholder="Ej. 18"
                  />

                  <Text style={styles.label}>
                    Observación del docente
                  </Text>

                  <TextInput
                    style={[
                      styles.input,
                      styles.multiline,
                    ]}
                    value={form.descripcion}
                    onChangeText={(value) =>
                      actualizarFormulario('descripcion', value)
                    }
                    multiline
                    placeholder="Escribe una observación"
                  />
                </>
              ) : tab === 'Foro' ? (
                <>
                  <Text style={styles.label}>
                    Contenido
                  </Text>

                  <TextInput
                    style={[
                      styles.input,
                      styles.multiline,
                    ]}
                    value={form.descripcion}
                    onChangeText={(value) =>
                      actualizarFormulario('descripcion', value)
                    }
                    multiline
                    placeholder="Escribe tu publicación"
                  />
                </>
              ) : (
                <>
                  <Text style={styles.label}>
                    Título
                  </Text>

                  <TextInput
                    style={styles.input}
                    value={form.titulo}
                    onChangeText={(value) =>
                      actualizarFormulario('titulo', value)
                    }
                    placeholder="Escribe el título"
                  />

                  <Text style={styles.label}>
                    Descripción
                  </Text>

                  <TextInput
                    style={[
                      styles.input,
                      styles.multiline,
                    ]}
                    value={form.descripcion}
                    onChangeText={(value) =>
                      actualizarFormulario('descripcion', value)
                    }
                    multiline
                    textAlignVertical="top"
                    placeholder="Escribe una descripción"
                  />

                  {tab === 'Unidades' && (
                    <>
                      <Text style={styles.label}>
                        Orden de la unidad
                      </Text>

                      <TextInput
                        style={styles.input}
                        value={form.ordenUnidad}
                        onChangeText={(value) =>
                          actualizarFormulario('ordenUnidad', value)
                        }
                        keyboardType="numeric"
                        placeholder="Ej. 1"
                      />
                    </>
                  )}

                  {tab === 'Tareas' && (
                    <>
                      <Text style={styles.label}>
                        Fecha de entrega
                      </Text>

                      <TouchableOpacity
                        style={styles.input}
                        onPress={abrirCalendario}
                      >
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Text
                            style={{
                              color: form.fechaEntrega ? '#1F2937' : '#9CA3AF',
                              fontSize: 14,
                            }}
                          >
                            {form.fechaEntrega
                              ? form.fechaEntrega.replace('T', ' ')
                              : 'Seleccionar fecha de entrega'}
                          </Text>

                          <Ionicons
                            name="calendar-outline"
                            size={21}
                            color="#2563EB"
                          />
                        </View>
                      </TouchableOpacity>

                      <Text style={styles.helperText}>
                        La hora límite será a las 11:59 p. m.
                      </Text>

                      {mostrarCalendario && (
                        <DateTimePicker
                          value={fechaSeleccionada}
                          mode="date"
                          display="calendar"
                          minimumDate={new Date()}
                          onChange={seleccionarFechaEntrega}
                        />
                      )}
                    </>
                  )}

                  {tab === 'Materiales' && (
                    <TouchableOpacity
                      style={styles.checkRow}
                      onPress={() =>
                        actualizarFormulario(
                          'modoLibro',
                          !form.modoLibro
                        )
                      }
                    >
                      <Ionicons
                        name={
                          form.modoLibro
                            ? 'checkbox'
                            : 'square-outline'
                        }
                        size={21}
                        color="#2563EB"
                      />

                      <Text style={styles.body}>
                        Mostrar como libro
                      </Text>
                    </TouchableOpacity>
                  )}

                  {(tab === 'Materiales' || tab === 'Tareas') && (
                    <TouchableOpacity
                      style={styles.fileButton}
                      onPress={seleccionarArchivo}
                    >
                      <Ionicons
                        name="attach-outline"
                        size={20}
                        color="#2563EB"
                      />

                      <Text style={styles.fileButtonText}>
                        {selectedFile
                          ? selectedFile.name
                          : 'Seleccionar archivo'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={cerrarFormulario}
                  disabled={saving}
                >
                  <Text style={styles.cancelText}>
                    Cancelar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={
                    tab === 'Calificar'
                      ? guardarCalificacion
                      : guardar
                  }
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveText}>
                      Guardar
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={replyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setReplyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              Responder publicación
            </Text>

            <TextInput
              style={[
                styles.input,
                styles.multiline,
              ]}
              value={replyText}
              onChangeText={setReplyText}
              multiline
              placeholder="Escribe tu respuesta"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setReplyModal(false)}
              >
                <Text style={styles.cancelText}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={enviarRespuesta}
              >
                <Text style={styles.saveText}>
                  Enviar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

function Info({ icon, label, value }) {
  return (
    <View style={styles.info}>
      <Ionicons
        name={icon}
        size={20}
        color="#3478F6"
      />

      <View>
        <Text style={styles.muted}>
          {label}
        </Text>

        <Text style={styles.infoValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function Summary({ icon, label, value }) {
  return (
    <View style={styles.summaryItem}>
      <Ionicons
        name={icon}
        size={21}
        color="#2563EB"
      />

      <Text style={styles.summaryValue}>
        {value}
      </Text>

      <Text style={styles.summaryLabel}>
        {label}
      </Text>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#F5F7FB',
  },
  content: {
    padding: 20,
    paddingBottom: 35,
    gap: 15,
  },
  center: {
    flex: 1,
    backgroundColor: '#F5F7FB',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 13,
  },
  errorText: {
    marginTop: 12,
    marginBottom: 16,
    color: '#DC2626',
    textAlign: 'center',
    fontSize: 14,
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 9,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  backButton: {
    marginTop: 12,
    padding: 10,
  },
  backText: {
    color: '#2563EB',
    fontWeight: '700',
  },
  pageHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headingInfo: {
    flex: 1,
    minWidth: 0,
  },
  pageTitle: {
    fontSize: 25,
    fontWeight: '800',
    color: '#263244',
  },
  muted: {
    fontSize: 11,
    color: '#91A0B6',
    marginTop: 3,
  },
  banner: {
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  bannerInfo: {
    flex: 1,
    minWidth: 0,
  },
  bannerTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bannerSub: {
    fontSize: 11,
    color: '#FFFFFF',
    marginTop: 4,
    opacity: 0.92,
  },
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
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
    color: '#2563EB',
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E4EAF2',
    padding: 17,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },
  section: {
    fontSize: 16,
    fontWeight: '700',
    color: '#263244',
    marginBottom: 13,
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 13,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#263244',
    marginTop: 2,
  },
  body: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 19,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F5',
  },
  itemIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
    minWidth: 0,
  },
  itemTitle: {
    fontSize: 13,
    color: '#263244',
    fontWeight: '700',
    marginBottom: 4,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  link: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
  },
  taskCard: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F5',
    paddingBottom: 12,
    marginBottom: 10,
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 15,
    marginTop: 8,
  },
  smallButton: {
    backgroundColor: '#EAF2FF',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 8,
  },
  smallButtonText: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '700',
  },
  taskPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DCE6F5',
    backgroundColor: '#F8FAFF',
  },
  taskPickerIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF1FF',
  },
  taskPickerTitle: {
    color: '#172033',
    fontSize: 14,
    fontWeight: '800',
  },
  taskPickerModal: {
    width: '100%',
    maxHeight: '78%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
  },
  taskPickerModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskPickerClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskPickerOptions: {
    maxHeight: 440,
  },
  taskPickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F5',
    gap: 10,
  },
  taskPickerOptionActive: {
    backgroundColor: '#F1F6FF',
    borderRadius: 10,
  },
  gradeDeliveryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 11,
    backgroundColor: '#0F766E',
  },
  taskSelect: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F5',
  },
  taskSelectActive: {
    backgroundColor: '#F5F8FF',
  },
  deliveryList: {
    marginTop: 18,
  },
  deliveryCountBadge: {
    minWidth: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EAF1FF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 9,
  },
  deliveryCountText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '800',
  },
  deliveryHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 10,
  },
  refreshDeliveriesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 9,
    backgroundColor: '#EFF6FF',
  },
  refreshDeliveriesText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyDeliveries: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    gap: 7,
  },
  emptyDeliveriesTitle: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '700',
  },
  deliveryCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5EAF2',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    gap: 12,
  },
  deliveryStudentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  deliveryAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EAF1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliveryStudentName: {
    color: '#172033',
    fontSize: 14,
    fontWeight: '800',
  },
  pendingBadge: {
    backgroundColor: '#FFF7E6',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pendingBadgeText: {
    color: '#A16207',
    fontSize: 11,
    fontWeight: '800',
  },
  deliveryFileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    gap: 10,
  },
  deliveryFileIcon: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliveryFileName: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '700',
  },
  deliveryMeta: {
    color: '#64748B',
    fontSize: 11,
  },
  deliveryCommentBox: {
    backgroundColor: '#F8FAFC',
    borderLeftWidth: 3,
    borderLeftColor: '#93C5FD',
    borderRadius: 8,
    padding: 10,
    gap: 4,
  },
  deliveryCommentLabel: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '800',
  },
  deliveryCommentText: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 19,
  },
  openDeliveryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  openDeliveryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  forumSection: {
    gap: 12,
  },
  forumEmptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8EDF5',
  },
  forumStudentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8EDF5',
  },
  forumPostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  forumAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  forumAuthor: {
    color: '#1E293B',
    fontSize: 14,
    fontWeight: '800',
  },
  forumDate: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  forumPostTitle: {
    color: '#1E293B',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 13,
    marginBottom: 5,
  },
  forumPostBody: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 19,
  },
  forumOpenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 13,
  },
  forumOpenText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
  },
  forumTeacherActions: {
    borderTopWidth: 1,
    borderTopColor: '#EEF1F5',
    marginTop: 12,
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  forumConversationModal: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  forumConversationHeader: {
    minHeight: 58,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EDF5',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  forumBackButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  forumModalHeading: {
    color: '#1E293B',
    fontSize: 16,
    fontWeight: '800',
  },
  forumConversationContent: {
    padding: 16,
    paddingBottom: 24,
  },
  forumDetailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8EDF5',
    padding: 16,
  },
  forumDetailTitle: {
    color: '#1E293B',
    fontSize: 17,
    fontWeight: '800',
  },
  forumDetailAuthor: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 7,
  },
  forumDetailDescription: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 14,
  },
  forumCommentsHeading: {
    color: '#1E293B',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 22,
    marginBottom: 10,
  },
  forumCommentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8EDF5',
    padding: 13,
    marginBottom: 9,
  },
  forumCommentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forumCommentAuthor: {
    color: '#1E293B',
    fontSize: 13,
    fontWeight: '800',
  },
  forumCommentText: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  forumConversationFooter: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8EDF5',
    padding: 14,
    gap: 10,
  },
  forumReplyAction: {
    backgroundColor: '#2563EB',
    borderRadius: 11,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  forumReplyActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  forumDeleteAction: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  forumDeleteActionText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '700',
  },
  forumCard: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F5',
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
  },
  reply: {
    backgroundColor: '#F5F7FB',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    marginLeft: 12,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deleteButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  deleteText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.48)',
    justifyContent: 'center',
    padding: 18,
  },
  modalScroll: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    color: '#263244',
    fontWeight: '800',
    marginBottom: 18,
  },
  label: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '700',
    marginBottom: 7,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DCE3ED',
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#263244',
  },
  multiline: {
    minHeight: 85,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 11,
    color: '#91A0B6',
    marginTop: -7,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
  },
  cancelButton: {
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 8,
    backgroundColor: '#EEF2F7',
  },
  cancelText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 12,
  },
  saveButton: {
    minWidth: 95,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 8,
    backgroundColor: '#2563EB',
  },
  saveText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: 14,
  },
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 9,
    padding: 12,
    marginTop: 14,
    backgroundColor: '#EFF6FF',
  },
  fileButtonText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 10,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
    paddingVertical: 10,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#263244',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#64748B',
  },
});