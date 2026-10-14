
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from "react-native";

const initialGrades = [
  {
    id: "1",
    student: "Ana Torres",
    code: "EST001",
    course: "Computación - 5° A",
    task: "Proyecto final",
    grade: 18,
    status: "Calificada",
  },
  {
    id: "2",
    student: "Luis Mendoza",
    code: "EST002",
    course: "Computación - 5° A",
    task: "Proyecto final",
    grade: 15,
    status: "Calificada",
  },
  {
    id: "3",
    student: "María Flores",
    code: "EST003",
    course: "Computación - 4° A",
    task: "Práctica N° 3",
    grade: 0,
    status: "Pendiente",
  },
  {
    id: "4",
    student: "Carlos Rojas",
    code: "EST004",
    course: "Computación - 4° B",
    task: "Mapa conceptual",
    grade: 17,
    status: "Calificada",
  },
  {
    id: "5",
    student: "Sofía Pérez",
    code: "EST005",
    course: "Computación - 5° B",
    task: "Ejercicios de programación",
    grade: 19,
    status: "Calificada",
  },
];

const statusColors = {
  Calificada: { bg: "#D1FAE5", text: "#047857" },
  Pendiente: { bg: "#FEF3C7", text: "#92400E" },
};

export default function CalificacionesTeacher() {
  const { width } = useWindowDimensions();
  const isMobile = width < 700;

  const [grades, setGrades] = useState(initialGrades);
  const [courseFilter, setCourseFilter] = useState("Todos los cursos");
  const [statusFilter, setStatusFilter] = useState("Todas");
  const [editingId, setEditingId] = useState(null);
  const [gradeInput, setGradeInput] = useState("");
  const [menuId, setMenuId] = useState(null);

  const courses = useMemo(
    () => [...new Set(grades.map((item) => item.course))],
    [grades]
  );

  const filteredGrades = useMemo(
    () =>
      grades.filter((item) => {
        const matchesCourse =
          courseFilter === "Todos los cursos" ||
          item.course === courseFilter;

        const matchesStatus =
          statusFilter === "Todas" ||
          item.status === statusFilter;

        return matchesCourse && matchesStatus;
      }),
    [grades, courseFilter, statusFilter]
  );

  const startEditing = (item) => {
    setEditingId(item.id);
    setGradeInput(item.status === "Calificada" ? String(item.grade) : "");
    setMenuId(null);
  };

  const saveGrade = (id) => {
    const value = Number(gradeInput);

    if (
      gradeInput.trim() === "" ||
      !Number.isFinite(value) ||
      value < 0 ||
      value > 20
    ) {
      if (typeof globalThis.alert === "function") {
        globalThis.alert("Ingresa una nota válida entre 0 y 20.");
      }
      return;
    }

    setGrades((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, grade: value, status: "Calificada" }
          : item
      )
    );

    setEditingId(null);
    setGradeInput("");
  };

  const renderStatus = (status) => {
    const colors = statusColors[status];

    return (
      <Text
        style={[
          styles.badge,
          { backgroundColor: colors.bg, color: colors.text },
        ]}
      >
        {status}
      </Text>
    );
  };

  const renderGrade = (item) => {
    if (editingId !== item.id) {
      return (
        <Text style={styles.gradeValue}>
          {item.status === "Calificada" ? `${item.grade}/20` : "—"}
        </Text>
      );
    }

    return (
      <View style={styles.gradeEditor}>
        <input
          type="number"
          min="0"
          max="20"
          step="1"
          value={gradeInput}
          onChange={(event) => setGradeInput(event.target.value)}
          style={styles.gradeInput}
          aria-label={`Nota de ${item.student}`}
        />
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => saveGrade(item.id)}
        >
          <Text style={styles.saveButtonText}>Guardar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setEditingId(null)}
        >
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, isMobile && styles.mobileContainer]}>
      <View style={styles.header}>
        <Text style={styles.heading}>Calificaciones</Text>
        <Text style={styles.subtitle}>
          Consulta y registra las notas de tus estudiantes.
        </Text>
      </View>

      <View style={[styles.filters, isMobile && styles.mobileFilters]}>
        <View style={[styles.filterGroup, isMobile && styles.mobileFilter]}>
          <Text style={styles.filterLabel}>Curso</Text>
          <select
            value={courseFilter}
            onChange={(event) => setCourseFilter(event.target.value)}
            style={styles.select}
          >
            <option value="Todos los cursos">Todos los cursos</option>
            {courses.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
        </View>

        <View style={[styles.filterGroup, isMobile && styles.mobileFilter]}>
          <Text style={styles.filterLabel}>Estado</Text>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            style={styles.select}
          >
            <option value="Todas">Todas</option>
            <option value="Pendiente">Pendientes</option>
            <option value="Calificada">Calificadas</option>
          </select>
        </View>
      </View>

      {isMobile ? (
        <View style={styles.mobileList}>
          {filteredGrades.map((item) => (
            <View key={item.id} style={styles.studentCard}>
              <View style={styles.cardHeader}>
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>{item.student}</Text>
                  <Text style={styles.muted}>{item.code}</Text>
                </View>
                {renderStatus(item.status)}
              </View>

              <View style={styles.cardDivider} />

              <Text style={styles.detailLabel}>Curso</Text>
              <Text style={styles.detailValue}>{item.course}</Text>

              <Text style={styles.detailLabel}>Actividad</Text>
              <Text style={styles.detailValue}>{item.task}</Text>

              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.detailLabel}>Nota</Text>
                  {renderGrade(item)}
                </View>

                {editingId !== item.id && (
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => startEditing(item)}
                  >
                    <Text style={styles.editButtonText}>
                      {item.status === "Calificada" ? "Editar nota" : "Calificar"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}

          {filteredGrades.length === 0 && (
            <Text style={styles.emptyText}>
              No hay calificaciones para este filtro.
            </Text>
          )}
        </View>
      ) : (
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.studentColumn]}>
              Estudiante
            </Text>
            <Text style={[styles.headerCell, styles.courseColumn]}>
              Curso
            </Text>
            <Text style={[styles.headerCell, styles.taskColumn]}>
              Actividad
            </Text>
            <Text style={[styles.headerCell, styles.gradeColumn]}>
              Nota
            </Text>
            <Text style={[styles.headerCell, styles.statusColumn]}>
              Estado
            </Text>
            <Text style={[styles.headerCell, styles.actionColumn]}>
              Acción
            </Text>
          </View>

          {filteredGrades.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <View style={[styles.studentColumn, styles.studentCell]}>
                <Text style={styles.studentName}>{item.student}</Text>
                <Text style={styles.muted}>{item.code}</Text>
              </View>

              <Text style={[styles.cell, styles.courseColumn]}>
                {item.course}
              </Text>

              <Text style={[styles.cell, styles.taskColumn]}>
                {item.task}
              </Text>

              <View style={[styles.gradeColumn, styles.gradeCell]}>
                {renderGrade(item)}
              </View>

              <View style={[styles.statusColumn, styles.statusCell]}>
                {renderStatus(item.status)}
              </View>

              <View style={[styles.actionColumn, styles.actionCell]}>
                {editingId !== item.id && (
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => startEditing(item)}
                  >
                    <Text style={styles.editButtonText}>
                      {item.status === "Calificada" ? "Editar" : "Calificar"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}

          {filteredGrades.length === 0 && (
            <Text style={styles.emptyText}>
              No hay calificaciones para este filtro.
            </Text>
          )}
        </View>
      )}

      <Text style={styles.resultCount}>
        {filteredGrades.length} registro(s)
      </Text>
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
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
  },
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-end",
    gap: 12,
    marginBottom: 16,
  },
  mobileFilters: {
    gap: 10,
  },
  filterGroup: {
    width: 210,
    maxWidth: "100%",
  },
  mobileFilter: {
    flex: 1,
    minWidth: 0,
    width: "auto",
  },
  filterLabel: {
    fontSize: 11,
    color: "#64748B",
    marginBottom: 5,
  },
  select: {
    width: "100%",
    minWidth: 0,
    padding: 9,
    border: "1px solid #DCE3EC",
    borderRadius: 7,
    backgroundColor: "#FFFFFF",
    color: "#475569",
    fontSize: 12,
    boxSizing: "border-box",
  },
  tableContainer: {
    width: "100%",
    minWidth: 0,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 9,
    overflow: "visible",
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 42,
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 58,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF2F7",
  },
  headerCell: {
    paddingHorizontal: 10,
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
  },
  cell: {
    paddingHorizontal: 10,
    fontSize: 12,
    color: "#334155",
  },
  studentColumn: { flex: 1.4, minWidth: 0 },
  courseColumn: { flex: 1.5, minWidth: 0 },
  taskColumn: { flex: 1.4, minWidth: 0 },
  gradeColumn: { flex: 0.8, minWidth: 0 },
  statusColumn: { flex: 1, minWidth: 0 },
  actionColumn: { flex: 1.1, minWidth: 0 },
  studentCell: {
    paddingHorizontal: 10,
    justifyContent: "center",
  },
  studentInfo: {
    flex: 1,
    minWidth: 0,
  },
  studentName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
  },
  muted: {
    fontSize: 10,
    color: "#94A3B8",
    marginTop: 3,
  },
  gradeCell: {
    paddingHorizontal: 10,
    justifyContent: "center",
  },
  gradeValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },
  statusCell: {
    paddingHorizontal: 10,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  badge: {
    alignSelf: "flex-start",
    overflow: "hidden",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontSize: 10,
    fontWeight: "600",
  },
  actionCell: {
    paddingHorizontal: 8,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  editButton: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 6,
    backgroundColor: "#E8F0FF",
    alignItems: "center",
    justifyContent: "center",
  },
  editButtonText: {
    color: "#1D4ED8",
    fontSize: 11,
    fontWeight: "600",
  },
  gradeEditor: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },
  gradeInput: {
    width: 58,
    padding: 7,
    border: "1px solid #CBD5E1",
    borderRadius: 6,
    fontSize: 12,
    boxSizing: "border-box",
  },
  saveButton: {
    backgroundColor: "#2563EB",
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  cancelText: {
    color: "#64748B",
    fontSize: 10,
  },
  mobileList: {
    width: "100%",
    gap: 10,
  },
  studentCard: {
    width: "100%",
    minWidth: 0,
    padding: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 9,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#EDF2F7",
    marginVertical: 12,
  },
  detailLabel: {
    fontSize: 10,
    color: "#64748B",
    marginBottom: 4,
    marginTop: 7,
  },
  detailValue: {
    fontSize: 12,
    color: "#334155",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#EDF2F7",
    marginTop: 12,
    paddingTop: 10,
  },
  emptyText: {
    padding: 24,
    textAlign: "center",
    color: "#64748B",
    fontSize: 13,
  },
  resultCount: {
    marginTop: 12,
    fontSize: 11,
    color: "#64748B",
  },
});
