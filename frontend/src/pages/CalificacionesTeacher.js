import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";

import { Picker } from "@react-native-picker/picker";
import { apiRequest } from "../config/api";

export default function CalificacionesTeacher({ usuario }) {
  const docenteId = Number(usuario?.id);

  const [cursos, setCursos] = useState([]);
  const [cursoId, setCursoId] = useState("");

  const [estudiantes, setEstudiantes] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [nota, setNota] = useState("");
  const [observacion, setObservacion] = useState("");

  // Obtener los cursos reales del docente
  const cargarCursos = useCallback(async () => {
    if (!docenteId || Number.isNaN(docenteId)) {
      throw new Error("No se pudo identificar al docente. Revisa los datos del usuario del login.");
    }

    const respuesta = await apiRequest(
      `/api/calificaciones/docente/${docenteId}/cursos`
    );

    const lista = Array.isArray(respuesta) ? respuesta : [];

    setCursos(lista);

    if (lista.length > 0) {
      setCursoId((actual) => {
        const existe = lista.some(
          (curso) => String(curso.id) === String(actual)
        );

        return existe ? actual : String(lista[0].id);
      });
    } else {
      setCursoId("");
      setEstudiantes([]);
      setCalificaciones([]);
    }

    return lista;
  }, [docenteId]);

  // Obtener estudiantes y notas del curso seleccionado
  const cargarDatosCurso = useCallback(async (idCurso) => {
    if (!idCurso) return;

    const [listaEstudiantes, listaCalificaciones] = await Promise.all([
      apiRequest(
        `/api/calificaciones/curso/${idCurso}/estudiantes?docenteId=${docenteId}`
      ),
      apiRequest(
        `/api/calificaciones/curso/${idCurso}?docenteId=${docenteId}`
      ),
    ]);

    setEstudiantes(
      Array.isArray(listaEstudiantes) ? listaEstudiantes : []
    );

    setCalificaciones(
      Array.isArray(listaCalificaciones) ? listaCalificaciones : []
    );
  }, [docenteId]);

  // Carga inicial
  const iniciar = useCallback(async () => {
    try {
      setError("");
      setLoading(true);

      const lista = await cargarCursos();

      if (lista.length > 0) {
        await cargarDatosCurso(lista[0].id);
      }
    } catch (e) {
      setError(e.message || "No se pudieron cargar las calificaciones.");
    } finally {
      setLoading(false);
    }
  }, [cargarCursos, cargarDatosCurso]);

  useEffect(() => {
    iniciar();
  }, [iniciar]);

  // Cambiar de curso
  const cambiarCurso = async (nuevoCursoId) => {
    setCursoId(String(nuevoCursoId));
    setEditingId(null);
    setAlumnoSeleccionado(null);
    setError("");
    setLoading(true);

    try {
      await cargarDatosCurso(nuevoCursoId);
    } catch (e) {
      setError(e.message || "No se pudieron cargar los datos del curso.");
      setEstudiantes([]);
      setCalificaciones([]);
    } finally {
      setLoading(false);
    }
  };

  // Actualizar datos
  const actualizar = async () => {
    setRefreshing(true);

    try {
      await iniciar();
    } finally {
      setRefreshing(false);
    }
  };

  // Buscar calificación general del estudiante
  const obtenerCalificacion = (alumnoId) => {
    return calificaciones.find(
      (item) =>
        Number(item.alumno_id) === Number(alumnoId) &&
        item.tarea_id == null
    );
  };

  // Abrir editor
  const editarNota = (estudiante) => {
    const existente = obtenerCalificacion(estudiante.alumno_id);

    setAlumnoSeleccionado(estudiante);
    setEditingId(existente?.id ?? null);
    setNota(
      existente ? String(existente.nota) : ""
    );
    setObservacion(existente?.observacion || "");
  };

  // Cancelar edición
  const cancelarEdicion = () => {
    setAlumnoSeleccionado(null);
    setEditingId(null);
    setNota("");
    setObservacion("");
  };

  // Guardar nota en MySQL
  const guardarNota = async () => {
    if (!alumnoSeleccionado || !cursoId) {
      Alert.alert("Atención", "Selecciona un estudiante y un curso.");
      return;
    }

    const valor = Number(nota.replace(",", "."));

    if (
      nota.trim() === "" ||
      !Number.isFinite(valor) ||
      valor < 0 ||
      valor > 20
    ) {
      Alert.alert(
        "Nota inválida",
        "La nota debe estar entre 0 y 20."
      );
      return;
    }

    if (observacion.length > 500) {
      Alert.alert(
        "Observación demasiado larga",
        "No puede superar los 500 caracteres."
      );
      return;
    }

    try {
      setSaving(true);

      const datos = {
        alumnoId: Number(alumnoSeleccionado.alumno_id),
        cursoId: Number(cursoId),
        tareaId: null,
        docenteId,
        nota: valor,
        observacion: observacion.trim() || null,
      };

      if (editingId) {
        await apiRequest(`/api/calificaciones/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(datos),
        });
      } else {
        await apiRequest("/api/calificaciones", {
          method: "POST",
          body: JSON.stringify(datos),
        });
      }

      cancelarEdicion();
      await cargarDatosCurso(cursoId);

      Alert.alert(
        "Correcto",
        "La calificación se guardó en la base de datos."
      );
    } catch (e) {
      Alert.alert(
        "Error al guardar",
        e.message || "No se pudo guardar la calificación."
      );
    } finally {
      setSaving(false);
    }
  };

  // Pantalla de carga
  if (loading && cursos.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>
          Cargando cursos...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={actualizar}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Calificaciones</Text>
        <Text style={styles.subtitle}>
          Consulta y registra las notas de tus estudiantes.
        </Text>
      </View>

      {error !== "" && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={iniciar}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.filterContainer}>
        <Text style={styles.label}>Seleccionar curso</Text>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={cursoId}
            onValueChange={cambiarCurso}
            style={styles.picker}
          >
            {cursos.map((curso) => (
              <Picker.Item
                key={curso.id}
                label={`${curso.nombre} - ${curso.grado || ""} ${curso.seccion || ""}`}
                value={String(curso.id)}
              />
            ))}
          </Picker>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#2563EB"
          style={styles.loader}
        />
      ) : cursos.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>
            No tienes cursos asignados
          </Text>
          <Text style={styles.emptyText}>
            Cuando tengas cursos activos asignados, aparecerán aquí.
          </Text>
        </View>
      ) : estudiantes.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>
            No hay estudiantes matriculados
          </Text>
          <Text style={styles.emptyText}>
            Este curso todavía no tiene estudiantes con matrícula activa.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          <Text style={styles.sectionTitle}>
            Estudiantes ({estudiantes.length})
          </Text>

          {estudiantes.map((estudiante) => {
            const calificacion = obtenerCalificacion(
              estudiante.alumno_id
            );

            const estaEditando =
              alumnoSeleccionado?.alumno_id === estudiante.alumno_id;

            return (
              <View
                key={estudiante.alumno_id}
                style={styles.card}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.studentInfo}>
                    <Text style={styles.studentName}>
                      {estudiante.nombres} {estudiante.apellidos}
                    </Text>

                    <Text style={styles.code}>
                      Código: {estudiante.codigo}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.badge,
                      calificacion
                        ? styles.badgeSuccess
                        : styles.badgePending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        calificacion
                          ? styles.successText
                          : styles.pendingText,
                      ]}
                    >
                      {calificacion ? "Calificado" : "Pendiente"}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.gradeRow}>
                  <View>
                    <Text style={styles.label}>Nota</Text>
                    <Text style={styles.grade}>
                      {calificacion
                        ? `${calificacion.nota}/20`
                        : "Sin calificación"}
                    </Text>
                  </View>

                  {!estaEditando && (
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => editarNota(estudiante)}
                    >
                      <Text style={styles.editButtonText}>
                        {calificacion ? "Editar nota" : "Calificar"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {calificacion?.observacion && !estaEditando && (
                  <Text style={styles.observation}>
                    Observación: {calificacion.observacion}
                  </Text>
                )}

                {estaEditando && (
                  <View style={styles.editor}>
                    <Text style={styles.label}>
                      Nota (0 - 20)
                    </Text>

                    <TextInput
                      value={nota}
                      onChangeText={setNota}
                      keyboardType="decimal-pad"
                      placeholder="Ejemplo: 18"
                      style={styles.input}
                      maxLength={5}
                    />

                    <Text style={styles.label}>
                      Observación
                    </Text>

                    <TextInput
                      value={observacion}
                      onChangeText={setObservacion}
                      placeholder="Comentario opcional"
                      style={[styles.input, styles.observationInput]}
                      multiline
                      maxLength={500}
                    />

                    <View style={styles.actions}>
                      <TouchableOpacity
                        style={styles.saveButton}
                        onPress={guardarNota}
                        disabled={saving}
                      >
                        {saving ? (
                          <ActivityIndicator color="#FFFFFF" />
                        ) : (
                          <Text style={styles.saveText}>
                            Guardar en MySQL
                          </Text>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={cancelarEdicion}
                        disabled={saving}
                      >
                        <Text style={styles.cancelText}>
                          Cancelar
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  container: {
    padding: 14,
    paddingBottom: 35,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    marginTop: 10,
    color: "#64748B",
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 25,
    fontWeight: "700",
    color: "#172554",
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 5,
  },
  filterContainer: {
    marginBottom: 18,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 6,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#DCE3EC",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
    color: "#334155",
  },
  loader: {
    marginTop: 25,
  },
  list: {
    gap: 11,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#172554",
    marginBottom: 3,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: 14,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
  },
  code: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
  },
  badgeSuccess: {
    backgroundColor: "#D1FAE5",
  },
  badgePending: {
    backgroundColor: "#FEF3C7",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  successText: {
    color: "#047857",
  },
  pendingText: {
    color: "#92400E",
  },
  divider: {
    height: 1,
    backgroundColor: "#EDF2F7",
    marginVertical: 12,
  },
  gradeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  grade: {
    fontSize: 17,
    fontWeight: "700",
    color: "#172554",
  },
  editButton: {
    backgroundColor: "#E8F0FF",
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 7,
  },
  editButtonText: {
    color: "#1D4ED8",
    fontSize: 12,
    fontWeight: "700",
  },
  editor: {
    marginTop: 15,
    gap: 9,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    borderRadius: 7,
    padding: 11,
    fontSize: 14,
    color: "#334155",
  },
  observationInput: {
    minHeight: 75,
    textAlignVertical: "top",
  },
  actions: {
    flexDirection: "row",
    gap: 9,
    marginTop: 5,
  },
  saveButton: {
    flex: 1,
    minHeight: 42,
    backgroundColor: "#2563EB",
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  saveText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  cancelButton: {
    paddingHorizontal: 15,
    minHeight: 42,
    justifyContent: "center",
  },
  cancelText: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "600",
  },
  observation: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 10,
  },
  emptyBox: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: 22,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#334155",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    marginTop: 7,
  },
  errorBox: {
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  errorText: {
    color: "#991B1B",
    fontSize: 12,
  },
  retryText: {
    color: "#1D4ED8",
    fontWeight: "700",
    marginTop: 8,
  },
});
