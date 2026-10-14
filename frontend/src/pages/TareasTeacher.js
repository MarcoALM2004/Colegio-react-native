
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  useWindowDimensions,
} from "react-native";

const initialTasks = [
  {
    id: "1",
    title: "Proyecto final",
    course: "Computación - 5° A",
    dueDate: "2026-09-20",
    status: "Pendiente",
    delivered: 24,
    total: 32,
  },
  {
    id: "2",
    title: "Práctica N° 3",
    course: "Computación - 4° A",
    dueDate: "2026-09-22",
    status: "Pendiente",
    delivered: 10,
    total: 30,
  },
  {
    id: "3",
    title: "Informe de investigación",
    course: "Computación - 5° A",
    dueDate: "2026-09-25",
    status: "Pendiente",
    delivered: 8,
    total: 32,
  },
  {
    id: "4",
    title: "Mapa conceptual",
    course: "Computación - 4° B",
    dueDate: "2026-09-28",
    status: "Pendiente",
    delivered: 5,
    total: 26,
  },
  {
    id: "5",
    title: "Ejercicios de programación",
    course: "Computación - 5° B",
    dueDate: "2026-09-30",
    status: "Calificada",
    delivered: 32,
    total: 32,
  },
];

const statusColors = {
  Pendiente: { bg: "#FEE2E2", text: "#B91C1C" },
  Calificada: { bg: "#D1FAE5", text: "#047857" },
};

export default function TareasTeacher() {
  const { width } = useWindowDimensions();
  const isMobile = width < 700;

  const [tasks, setTasks] = useState(initialTasks);
  const [statusFilter, setStatusFilter] = useState("Todas");
  const [courseFilter, setCourseFilter] = useState("Todos los cursos");
  const [menuId, setMenuId] = useState(null);

  const courses = useMemo(
    () => [...new Set(tasks.map((task) => task.course))],
    [tasks]
  );

  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) => {
        const matchesStatus =
          statusFilter === "Todas" ||
          (statusFilter === "Pendientes" &&
            task.status === "Pendiente") ||
          (statusFilter === "Calificadas" &&
            task.status === "Calificada");

        const matchesCourse =
          courseFilter === "Todos los cursos" ||
          task.course === courseFilter;

        return matchesStatus && matchesCourse;
      }),
    [tasks, statusFilter, courseFilter]
  );

  const formatDate = (date) => {
    if (!date) return "—";

    const [year, month, day] = date.split("-");
    const months = [
      "ene", "feb", "mar", "abr", "may", "jun",
      "jul", "ago", "sep", "oct", "nov", "dic",
    ];

    return `${Number(day)} ${months[Number(month) - 1]} ${year}`;
  };

  const markGraded = (id) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? { ...task, status: "Calificada" }
          : task
      )
    );
    setMenuId(null);
  };

  const deleteTask = (id) => {
    const remove = () => {
      setTasks((current) =>
        current.filter((task) => task.id !== id)
      );
      setMenuId(null);
    };

    if (Platform.OS === "web") {
      if (globalThis.confirm("¿Eliminar esta tarea?")) remove();
    } else {
      Alert.alert("Eliminar tarea", "¿Deseas eliminar esta tarea?", [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: remove,
        },
      ]);
    }
  };

  const renderActions = (task) => (
    <View style={styles.actionWrapper}>
      <TouchableOpacity
        onPress={() =>
          setMenuId(menuId === task.id ? null : task.id)
        }
        style={styles.moreButton}
      >
        <Text style={styles.moreButtonText}>⋮</Text>
      </TouchableOpacity>

      {menuId === task.id && (
        <View style={styles.actionMenu}>
          {task.status !== "Calificada" && (
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => markGraded(task.id)}
            >
              <Text style={styles.actionText}>Calificar</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => deleteTask(task.id)}
          >
            <Text style={[styles.actionText, { color: "#DC2626" }]}>
              Eliminar
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderStatus = (status) => {
    const colors = statusColors[status] || statusColors.Pendiente;

    return (
      <Text
        style={[
          styles.statusBadge,
          { backgroundColor: colors.bg, color: colors.text },
        ]}
      >
        {status}
      </Text>
    );
  };

  return (
    <View style={[styles.container, isMobile && styles.mobileContainer]}>
      <View style={styles.header}>
        <Text style={styles.heading}>Tareas</Text>
        <Text style={styles.subtitle}>
          Revisa las tareas de tus cursos.
        </Text>
      </View>

      <View style={[styles.filters, isMobile && styles.mobileFilters]}>
        <View style={[styles.filterGroup, isMobile && styles.mobileFilter]}>
          <Text style={styles.filterLabel}>Estado</Text>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            style={styles.select}
          >
            <option value="Todas">Todas</option>
            <option value="Pendientes">Pendientes</option>
            <option value="Calificadas">Calificadas</option>
          </select>
        </View>

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
      </View>

      {isMobile ? (
        <View style={styles.mobileTaskList}>
          {filteredTasks.map((task) => (
            <View key={task.id} style={styles.taskCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{task.title}</Text>
                {renderActions(task)}
              </View>

              <Text style={styles.cardCourse}>{task.course}</Text>

              <View style={styles.cardDetails}>
                <View style={styles.cardDetail}>
                  <Text style={styles.detailLabel}>Entrega</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(task.dueDate)}
                  </Text>
                </View>

                <View style={styles.cardDetail}>
                  <Text style={styles.detailLabel}>Estado</Text>
                  {renderStatus(task.status)}
                </View>

                <View style={styles.cardDetail}>
                  <Text style={styles.detailLabel}>Entregas</Text>
                  <Text style={styles.detailValue}>
                    {task.delivered}/{task.total}
                  </Text>
                </View>
              </View>
            </View>
          ))}

          {filteredTasks.length === 0 && (
            <Text style={styles.emptyText}>
              No hay tareas para este filtro.
            </Text>
          )}
        </View>
      ) : (
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.titleColumn]}>
              Título
            </Text>
            <Text style={[styles.headerCell, styles.courseColumn]}>
              Curso
            </Text>
            <Text style={[styles.headerCell, styles.dateColumn]}>
              Fecha de entrega
            </Text>
            <Text style={[styles.headerCell, styles.statusColumn]}>
              Estado
            </Text>
            <Text style={[styles.headerCell, styles.deliveryColumn]}>
              Entregas
            </Text>
            <Text style={[styles.headerCell, styles.actionsColumn]}>
              Acciones
            </Text>
          </View>

          {filteredTasks.map((task) => (
            <View key={task.id} style={styles.tableRow}>
              <Text style={[styles.cell, styles.titleColumn]}>
                {task.title}
              </Text>
              <Text style={[styles.cell, styles.courseColumn]}>
                {task.course}
              </Text>
              <Text style={[styles.cell, styles.dateColumn]}>
                {formatDate(task.dueDate)}
              </Text>
              <View style={[styles.statusColumn, styles.statusCell]}>
                {renderStatus(task.status)}
              </View>
              <Text style={[styles.cell, styles.deliveryColumn]}>
                {task.delivered}/{task.total}
              </Text>
              <View style={[styles.actionsColumn, styles.actionsCell]}>
                {renderActions(task)}
              </View>
            </View>
          ))}

          {filteredTasks.length === 0 && (
            <Text style={styles.emptyText}>
              No hay tareas para este filtro.
            </Text>
          )}
        </View>
      )}

      <Text style={styles.resultCount}>
        {filteredTasks.length} tarea(s)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 0,
    width: "100%",
    padding: 20,
    backgroundColor: "#F8FAFC",
    alignSelf: "stretch",
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
    width: 190,
    maxWidth: "100%",
  },

  mobileFilter: {
    flex: 1,
    minWidth: 0,
    width: "auto",
  },

  filterLabel: {
    color: "#64748B",
    fontSize: 11,
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
    minHeight: 49,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF2F7",
  },

  headerCell: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    paddingHorizontal: 10,
  },

  cell: {
    fontSize: 12,
    color: "#334155",
    paddingHorizontal: 10,
  },

  titleColumn: {
    flex: 2,
    minWidth: 0,
  },

  courseColumn: {
    flex: 1.6,
    minWidth: 0,
  },

  dateColumn: {
    flex: 1.3,
    minWidth: 0,
  },

  statusColumn: {
    flex: 1,
    minWidth: 0,
  },

  deliveryColumn: {
    flex: 0.7,
    minWidth: 0,
  },

  actionsColumn: {
    width: 64,
    flexShrink: 0,
  },

  statusCell: {
    alignItems: "flex-start",
    justifyContent: "center",
    paddingHorizontal: 10,
  },

  statusBadge: {
    overflow: "hidden",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontSize: 10,
    fontWeight: "600",
    alignSelf: "flex-start",
  },

  actionsCell: {
    alignItems: "center",
    justifyContent: "center",
  },

  actionWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },

  moreButton: {
    paddingHorizontal: 10,
    paddingVertical: 2,
  },

  moreButtonText: {
    fontSize: 23,
    color: "#64748B",
  },

  actionMenu: {
    position: "absolute",
    top: 30,
    right: 0,
    zIndex: 100,
    elevation: 8,
    minWidth: 110,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 7,
    paddingVertical: 4,
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },

  actionItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  actionText: {
    color: "#334155",
    fontSize: 12,
  },

  mobileTaskList: {
    gap: 10,
    width: "100%",
  },

  taskCard: {
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
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },

  cardTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
  },

  cardCourse: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 5,
    marginBottom: 14,
  },

  cardDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#EDF2F7",
    paddingTop: 12,
  },

  cardDetail: {
    flexGrow: 1,
    flexBasis: "27%",
    minWidth: 75,
    gap: 6,
  },

  detailLabel: {
    fontSize: 10,
    color: "#64748B",
  },

  detailValue: {
    fontSize: 12,
    color: "#334155",
  },

  emptyText: {
    padding: 20,
    textAlign: "center",
    fontSize: 13,
    color: "#64748B",
  },

  resultCount: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 12,
  },
});
