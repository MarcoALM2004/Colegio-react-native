import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import {
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import AdminDashboard from '../../components/AdminDashboard';

import { useAdminData } from '../../context/AdminDataContext';

import {
  ActionSheet,
  Avatar,
  BottomSheet,
  Button,
  Card,
  EmptyState,
  Field,
  IconBox,
  InfoRow,
  ListRow,
  PageScroll,
  UnderlineTabs,
  confirmAction,
  notify,
} from '../../components/admin/AdminUI';

import { colors } from '../../theme/adminTheme';

import { ROLE_TONE } from '../../utils/adminHelpers';

import { ROLES } from '../../data/adminMockData';

const TABS = [
  'Información',
  'Estudiantes',
  'Docente',
];

export default function CursoDetalleAdmin() {
  const navigation = useNavigation();
  const { id } = useRoute().params || {};

  const {
    users,
    getCourse,
    getUser,
    courseName,
    courseStudentCount,
    studentsInCourse,
    updateCourse,
    deleteCourse,
    loadCourseStudents,
    loadAvailableStudents,
    enrollStudents,
    removeStudentFromCourse,
  } = useAdminData();

  // --------------------------------------------------
  // ESTADOS
  // --------------------------------------------------

  const [tab, setTab] = useState('Información');

  const [menu, setMenu] = useState(false);

  const [modalEstudiantes, setModalEstudiantes] =
    useState(false);

  const [modalDocente, setModalDocente] =
    useState(false);

  const [busquedaEstudiante, setBusquedaEstudiante] =
    useState('');

  const [busquedaDocente, setBusquedaDocente] =
    useState('');

  const [estudiantesDisponibles, setEstudiantesDisponibles] =
    useState([]);

  const [estudiantesSeleccionados, setEstudiantesSeleccionados] =
    useState([]);

  const [docenteSeleccionado, setDocenteSeleccionado] =
    useState(null);

  const [cargando, setCargando] = useState(false);

  const [error, setError] = useState('');

  // --------------------------------------------------
  // DATOS DEL CURSO
  // --------------------------------------------------

  const curso = getCourse(id);

  const estudiantes = studentsInCourse(id);

  const docente = curso
    ? getUser(curso.docenteId)
    : null;

  const total = curso
    ? courseStudentCount(curso)
    : 0;

  const nombreCurso = curso
    ? `${curso.nombre || courseName(curso)}`
    : 'Curso';

  // --------------------------------------------------
  // CARGAR ESTUDIANTES MATRICULADOS
  // --------------------------------------------------

  useEffect(() => {
    if (!curso || tab !== 'Estudiantes') {
      return;
    }

    loadCourseStudents(curso.id).catch((e) => {
      setError(
        e.message ||
          'No se pudieron cargar los estudiantes.'
      );
    });
  }, [curso?.id, tab]);

  // --------------------------------------------------
  // BUSCAR ESTUDIANTES DISPONIBLES
  // --------------------------------------------------

  const buscarEstudiantes = async (texto = '') => {
    if (!curso) return;

    setCargando(true);
    setError('');

    try {
      const resultado = await loadAvailableStudents(
        curso.id,
        texto
      );

      setEstudiantesDisponibles(resultado);
    } catch (e) {
      setError(
        e.message ||
          'No se pudieron buscar los estudiantes.'
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!modalEstudiantes || !curso) return;

    const temporizador = setTimeout(() => {
      buscarEstudiantes(busquedaEstudiante);
    }, 300);

    return () => clearTimeout(temporizador);
  }, [
    modalEstudiantes,
    busquedaEstudiante,
    curso?.id,
  ]);

  // --------------------------------------------------
  // ABRIR MODAL DE ESTUDIANTES
  // --------------------------------------------------

  const abrirModalEstudiantes = () => {
    setBusquedaEstudiante('');
    setEstudiantesSeleccionados([]);
    setError('');
    setModalEstudiantes(true);
  };

  // --------------------------------------------------
  // SELECCIONAR ESTUDIANTES
  // --------------------------------------------------

  const alternarEstudiante = (estudianteId) => {
    setEstudiantesSeleccionados((prev) => {
      const existe = prev.some(
        (idActual) =>
          String(idActual) === String(estudianteId)
      );

      if (existe) {
        return prev.filter(
          (idActual) =>
            String(idActual) !== String(estudianteId)
        );
      }

      return [...prev, estudianteId];
    });
  };

  // --------------------------------------------------
  // MATRICULAR ESTUDIANTES
  // --------------------------------------------------

  const matricularEstudiantes = async () => {
    if (!estudiantesSeleccionados.length) {
      return;
    }

    setCargando(true);
    setError('');

    try {
      await enrollStudents(
        curso.id,
        estudiantesSeleccionados
      );

      setModalEstudiantes(false);
      setEstudiantesSeleccionados([]);

      notify(
        'Estudiantes matriculados correctamente.'
      );
    } catch (e) {
      setError(
        e.message ||
          'No se pudieron matricular los estudiantes.'
      );
    } finally {
      setCargando(false);
    }
  };

  // --------------------------------------------------
  // RETIRAR ESTUDIANTE
  // --------------------------------------------------

  const retirarEstudiante = (estudiante) => {
    confirmAction(
      'Retirar estudiante',
      `¿Deseas retirar a ${estudiante.nombres} ${estudiante.apellidos} de este curso? Su cuenta seguirá activa.`,
      async () => {
        try {
          await removeStudentFromCourse(
            curso.id,
            estudiante.id
          );

          notify(
            'Estudiante retirado correctamente.'
          );
        } catch (e) {
          notify(
            e.message ||
              'No se pudo retirar al estudiante.'
          );
        }
      },
      'Retirar'
    );
  };

  // --------------------------------------------------
  // DOCENTES DISPONIBLES
  // --------------------------------------------------

  const docentesDisponibles = useMemo(() => {
    const texto = busquedaDocente
      .trim()
      .toLowerCase();

    return users
      .filter(
        (u) =>
          u.rol === ROLES.DOCENTE &&
          u.activo &&
          String(u.id) !== String(curso?.docenteId)
      )
      .filter((u) => {
        const nombreCompleto =
          `${u.nombres} ${u.apellidos} ${u.codigo}`.toLowerCase();

        return !texto || nombreCompleto.includes(texto);
      });
  }, [
    users,
    busquedaDocente,
    curso?.docenteId,
  ]);

  // --------------------------------------------------
  // ABRIR MODAL DOCENTE
  // --------------------------------------------------

  const abrirModalDocente = () => {
    setBusquedaDocente('');
    setDocenteSeleccionado(null);
    setError('');
    setModalDocente(true);
  };

  // --------------------------------------------------
  // ASIGNAR O CAMBIAR DOCENTE
  // --------------------------------------------------

  const asignarDocente = async () => {
    if (!docenteSeleccionado) {
      setError('Selecciona un docente.');
      return;
    }

    setCargando(true);
    setError('');

    try {
      await updateCourse(curso.id, {
        nombre: curso.nombre,
        nivel: curso.nivel,
        grado: curso.grado,
        seccion: curso.seccion,
        docenteId: docenteSeleccionado,
        descripcion: curso.descripcion || '',
        tono: curso.tono || curso.color || 'blue',
      });

      setModalDocente(false);
      setDocenteSeleccionado(null);

      notify('Docente asignado correctamente.');
    } catch (e) {
      setError(
        e.message ||
          'No se pudo asignar al docente.'
      );
    } finally {
      setCargando(false);
    }
  };

  // --------------------------------------------------
  // QUITAR DOCENTE
  // --------------------------------------------------

  const quitarDocente = () => {
    if (!docente) return;

    confirmAction(
      'Quitar docente',
      `¿Deseas quitar a ${docente.nombres} ${docente.apellidos} de este curso? Su cuenta seguirá activa.`,
      async () => {
        try {
          await updateCourse(curso.id, {
            nombre: curso.nombre,
            nivel: curso.nivel,
            grado: curso.grado,
            seccion: curso.seccion,
            docenteId: null,
            descripcion: curso.descripcion || '',
            tono: curso.tono || curso.color || 'blue',
          });

          notify('Docente retirado del curso.');
        } catch (e) {
          notify(
            e.message ||
              'No se pudo quitar al docente.'
          );
        }
      },
      'Quitar'
    );
  };

  // --------------------------------------------------
  // ELIMINAR CURSO
  // --------------------------------------------------

  const eliminarCurso = () => {
    confirmAction(
      'Eliminar curso',
      `¿Estás seguro de que deseas eliminar "${nombreCurso}"? El curso dejará de aparecer en la lista, pero las cuentas de estudiantes y docentes no se eliminarán.`,
      async () => {
        try {
          await deleteCourse(curso.id);

          notify('Curso eliminado correctamente.');

          navigation.goBack();
        } catch (e) {
          notify(
            e.message ||
              'No se pudo eliminar el curso.'
          );
        }
      },
      'Eliminar'
    );
  };

  // --------------------------------------------------
  // CURSO NO ENCONTRADO
  // --------------------------------------------------

  if (!curso) {
    return (
      <AdminDashboard
        variant="detail"
        title="Detalle de curso"
      >
        <EmptyState
          icon="book-outline"
          text="El curso no existe o fue eliminado."
        />
      </AdminDashboard>
    );
  }

  // --------------------------------------------------
  // INTERFAZ
  // --------------------------------------------------

  return (
    <AdminDashboard
      variant="detail"
      title="Detalle de curso"
      headerRight={
        <TouchableOpacity
          onPress={() => setMenu(true)}
          style={styles.headerBtn}
        >
          <Ionicons
            name="ellipsis-vertical"
            size={20}
            color={colors.textStrong}
          />
        </TouchableOpacity>
      }
    >
      <PageScroll>
        {/* =========================================
            CABECERA DEL CURSO
        ========================================= */}

        <Card style={styles.hero}>
          <IconBox
            icon="book-outline"
            tone={curso.tono || 'blue'}
            size={64}
            iconSize={30}
            solid
          />

          <View style={styles.heroText}>
            <Text style={styles.title}>
              {nombreCurso}
            </Text>

            <Text style={styles.sub}>
              {curso.grado} de {curso.nivel} · Sección {curso.seccion}
            </Text>

            <Text style={styles.sub}>
              {total} estudiantes matriculados
            </Text>
          </View>
        </Card>

        {/* =========================================
            PESTAÑAS
        ========================================= */}

        <UnderlineTabs
          tabs={TABS}
          value={tab}
          onChange={setTab}
        />

        {/* =========================================
            INFORMACIÓN
        ========================================= */}

        {tab === 'Información' && (
          <Card>
            <InfoRow
              icon="book-outline"
              label="Nombre del curso"
              value={curso.nombre}
            />

            <InfoRow
              icon="barcode-outline"
              label="Código"
              value={curso.codigo || '—'}
            />

            <InfoRow
              icon="layers-outline"
              label="Nivel"
              value={curso.nivel}
            />

            <InfoRow
              icon="people-outline"
              label="Grado y sección"
              value={`${curso.grado} ${curso.seccion}`}
            />

            <InfoRow
              icon="person-outline"
              label="Docente responsable"
              value={
                docente
                  ? `${docente.nombres} ${docente.apellidos}`
                  : 'Sin docente asignado'
              }
            />

            <InfoRow
              icon="calendar-outline"
              label="Año académico"
              value={String(
                curso.anio || new Date().getFullYear()
              )}
            />

            <InfoRow
              icon="information-circle-outline"
              label="Descripción"
              value={
                curso.descripcion || 'Sin descripción'
              }
            />
          </Card>
        )}

        {/* =========================================
            ESTUDIANTES
        ========================================= */}

        {tab === 'Estudiantes' && (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionText}>
                <Text style={styles.sectionTitle}>
                  Estudiantes
                </Text>

                <Text style={styles.note}>
                  {total} matriculados
                </Text>
              </View>

              <Button
                title="Agregar"
                icon="add"
                onPress={abrirModalEstudiantes}
              />
            </View>

            <Card>
              {estudiantes.length === 0 ? (
                <EmptyState
                  icon="people-outline"
                  text="Todavía no hay estudiantes matriculados en este curso."
                />
              ) : (
                estudiantes.map((estudiante) => (
                  <ListRow
                    key={String(estudiante.id)}
                    left={
                      <Avatar
                        nombres={estudiante.nombres}
                        apellidos={estudiante.apellidos}
                        tone={
                          ROLE_TONE[estudiante.rol] || 'pink'
                        }
                        size={40}
                      />
                    }
                    title={`${estudiante.nombres} ${estudiante.apellidos}`}
                    subtitle={`${estudiante.codigo || ''} · ${estudiante.grado || curso.grado} ${estudiante.seccion || curso.seccion}`}
                    onPress={() =>
                      navigation.navigate(
                        'AdminUsuarioDetalle',
                        { id: estudiante.id }
                      )
                    }
                    right={
                      <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() =>
                          retirarEstudiante(estudiante)
                        }
                      >
                        <Ionicons
                          name="person-remove-outline"
                          size={20}
                          color={colors.danger}
                        />
                      </TouchableOpacity>
                    }
                  />
                ))
              )}
            </Card>
          </>
        )}

        {/* =========================================
            DOCENTE
        ========================================= */}

        {tab === 'Docente' && (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionText}>
                <Text style={styles.sectionTitle}>
                  Docente responsable
                </Text>

                <Text style={styles.note}>
                  {docente
                    ? 'Un docente asignado'
                    : 'Sin docente asignado'}
                </Text>
              </View>

              <Button
                title={docente ? 'Cambiar' : 'Agregar'}
                icon="add"
                onPress={abrirModalDocente}
              />
            </View>

            <Card>
              {docente ? (
                <ListRow
                  left={
                    <Avatar
                      nombres={docente.nombres}
                      apellidos={docente.apellidos}
                      tone="purple"
                      size={42}
                    />
                  }
                  title={`${docente.nombres} ${docente.apellidos}`}
                  subtitle={`Docente · ${docente.codigo || ''}`}
                  onPress={() =>
                    navigation.navigate(
                      'AdminUsuarioDetalle',
                      { id: docente.id }
                    )
                  }
                  right={
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={quitarDocente}
                    >
                      <Ionicons
                        name="person-remove-outline"
                        size={20}
                        color={colors.danger}
                      />
                    </TouchableOpacity>
                  }
                />
              ) : (
                <EmptyState
                  icon="person-outline"
                  text="No hay un docente asignado a este curso."
                />
              )}
            </Card>
          </>
        )}

        {/* =========================================
            BOTONES INFERIORES
        ========================================= */}

        <View style={styles.bottomActions}>
          <Button
            title="Editar curso"
            icon="create-outline"
            onPress={() =>
              navigation.navigate(
                'AdminCursoForm',
                { id: curso.id }
              )
            }
          />

          <Button
            title="Eliminar curso"
            icon="trash-outline"
            variant="danger"
            onPress={eliminarCurso}
          />
        </View>
      </PageScroll>

      {/* =========================================
          MENÚ SUPERIOR
      ========================================= */}

      <ActionSheet
        visible={menu}
        title={nombreCurso}
        onClose={() => setMenu(false)}
        actions={[
          {
            label: 'Editar curso',
            icon: 'create-outline',
            onPress: () =>
              navigation.navigate(
                'AdminCursoForm',
                { id: curso.id }
              ),
          },
          {
            label: 'Eliminar curso',
            icon: 'trash-outline',
            danger: true,
            onPress: eliminarCurso,
          },
        ]}
      />

      {/* =========================================
          MODAL AGREGAR ESTUDIANTES
      ========================================= */}

      <BottomSheet
        visible={modalEstudiantes}
        title="Agregar estudiantes"
        onClose={() => setModalEstudiantes(false)}
      >
        <Text style={styles.modalHint}>
          Solo aparecerán alumnos del mismo nivel, grado y sección que este curso.
        </Text>

        <Field
          value={busquedaEstudiante}
          onChangeText={setBusquedaEstudiante}
          placeholder="Buscar por nombre o código"
        />

        {!!error && modalEstudiantes && (
          <Text style={styles.error}>
            {error}
          </Text>
        )}

        {cargando && (
          <Text style={styles.note}>
            Buscando estudiantes...
          </Text>
        )}

        {!cargando &&
          estudiantesDisponibles.length === 0 && (
            <EmptyState
              icon="search-outline"
              text="No hay estudiantes disponibles para este curso."
            />
          )}

        {estudiantesDisponibles.map((estudiante) => {
          const seleccionado =
            estudiantesSeleccionados.some(
              (x) =>
                String(x) === String(estudiante.id)
            );

          return (
            <TouchableOpacity
              key={String(estudiante.id)}
              style={styles.optionRow}
              onPress={() =>
                alternarEstudiante(estudiante.id)
              }
            >
              <Avatar
                nombres={estudiante.nombres}
                apellidos={estudiante.apellidos}
                tone="pink"
                size={38}
              />

              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>
                  {estudiante.nombres} {estudiante.apellidos}
                </Text>

                <Text style={styles.sub}>
                  {estudiante.codigo} · {estudiante.grado} {estudiante.seccion}
                </Text>
              </View>

              <Ionicons
                name={
                  seleccionado
                    ? 'checkbox'
                    : 'square-outline'
                }
                size={23}
                color={
                  seleccionado
                    ? colors.primary
                    : colors.icon
                }
              />
            </TouchableOpacity>
          );
        })}

        <Text style={styles.note}>
          {estudiantesSeleccionados.length} seleccionados
        </Text>

        <Button
          title={
            cargando
              ? 'Procesando...'
              : 'Agregar estudiantes'
          }
          icon="checkmark"
          onPress={matricularEstudiantes}
          disabled={
            cargando ||
            estudiantesSeleccionados.length === 0
          }
        />
      </BottomSheet>

      {/* =========================================
          MODAL AGREGAR O CAMBIAR DOCENTE
      ========================================= */}

      <BottomSheet
        visible={modalDocente}
        title="Seleccionar docente"
        onClose={() => setModalDocente(false)}
      >
        <Text style={styles.modalHint}>
          Busca al docente que deseas asignar a este curso.
        </Text>

        <Field
          value={busquedaDocente}
          onChangeText={setBusquedaDocente}
          placeholder="Buscar por nombre o código"
        />

        {!!error && modalDocente && (
          <Text style={styles.error}>
            {error}
          </Text>
        )}

        {docentesDisponibles.length === 0 ? (
          <EmptyState
            icon="people-outline"
            text="No se encontraron docentes disponibles."
          />
        ) : (
          docentesDisponibles.map((profesor) => {
            const seleccionado =
              String(docenteSeleccionado) ===
              String(profesor.id);

            return (
              <TouchableOpacity
                key={String(profesor.id)}
                style={styles.optionRow}
                onPress={() =>
                  setDocenteSeleccionado(profesor.id)
                }
              >
                <Avatar
                  nombres={profesor.nombres}
                  apellidos={profesor.apellidos}
                  tone="purple"
                  size={38}
                />

                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>
                    {profesor.nombres} {profesor.apellidos}
                  </Text>

                  <Text style={styles.sub}>
                    {profesor.codigo}
                  </Text>
                </View>

                <Ionicons
                  name={
                    seleccionado
                      ? 'radio-button-on'
                      : 'radio-button-off'
                  }
                  size={22}
                  color={
                    seleccionado
                      ? colors.primary
                      : colors.icon
                  }
                />
              </TouchableOpacity>
            );
          })
        )}

        <Button
          title={
            cargando
              ? 'Guardando...'
              : 'Asignar docente'
          }
          icon="checkmark"
          onPress={asignarDocente}
          disabled={
            cargando || !docenteSeleccionado
          }
        />
      </BottomSheet>
    </AdminDashboard>
  );
}

// ==================================================
// ESTILOS
// ==================================================

const styles = StyleSheet.create({
  headerBtn: {
    padding: 6,
  },

  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
  },

  heroText: {
    flex: 1,
  },

  title: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.text,
  },

  sub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 3,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 8,
  },

  sectionText: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textStrong,
  },

  note: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: 8,
  },

  iconButton: {
    padding: 8,
    marginLeft: 4,
  },

  bottomActions: {
    gap: 10,
    marginTop: 18,
    marginBottom: 20,
  },

  modalHint: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 12,
    lineHeight: 18,
  },

  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    gap: 10,
  },

  optionText: {
    flex: 1,
  },

  optionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textStrong,
  },

  error: {
    fontSize: 12,
    color: colors.danger,
    marginVertical: 8,
  },
});