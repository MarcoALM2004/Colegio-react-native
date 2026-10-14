
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

const initialEvents = [
  {
    id: "1",
    title: "Entrega del proyecto final",
    date: "2026-10-15",
    time: "10:00",
    course: "Computación - 5° A",
    type: "Entrega",
  },
  {
    id: "2",
    title: "Evaluación práctica",
    date: "2026-10-18",
    time: "09:00",
    course: "Computación - 4° A",
    type: "Evaluación",
  },
  {
    id: "3",
    title: "Revisión de trabajos",
    date: "2026-10-20",
    time: "11:30",
    course: "Computación - 5° B",
    type: "Actividad",
  },
  {
    id: "4",
    title: "Exposición grupal",
    date: "2026-10-23",
    time: "08:30",
    course: "Computación - 4° B",
    type: "Evaluación",
  },
];

const typeColors = {
  Entrega: { bg: "#DBEAFE", text: "#1D4ED8" },
  Evaluación: { bg: "#FEF3C7", text: "#92400E" },
  Actividad: { bg: "#D1FAE5", text: "#047857" },
};

const pad = (number) => String(number).padStart(2, "0");

const formatDate = (date) => {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
};

export default function CalendarioTeacher() {
  const { width } = useWindowDimensions();
  const isMobile = width < 700;

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState(initialEvents);
  const [selectedDate, setSelectedDate] = useState(
    `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
  );
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [menuId, setMenuId] = useState(null);

  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [course, setCourse] = useState("");
  const [type, setType] = useState("Actividad");

  const courses = useMemo(
    () => [...new Set(events.map((event) => event.course).filter(Boolean))],
    [events]
  );

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;

  const monthName = new Date(year, month, 1).toLocaleDateString("es-PE", {
    month: "long",
    year: "numeric",
  });

  const selectedEvents = events
    .filter((event) => event.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  const changeMonth = (direction) => {
    const next = new Date(year, month + direction, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  };

  const openNewEvent = () => {
    setEditingId(null);
    setTitle("");
    setEventDate(selectedDate);
    setTime("09:00");
    setCourse(courses[0] || "");
    setType("Actividad");
    setShowForm(true);
  };

  const openEditEvent = (event) => {
    setEditingId(event.id);
    setTitle(event.title);
    setEventDate(event.date);
    setTime(event.time);
    setCourse(event.course);
    setType(event.type);
    setMenuId(null);
    setShowForm(true);
  };

  const saveEvent = () => {
    if (!title.trim() || !eventDate.trim()) {
      Alert.alert("Datos incompletos", "Ingresa el título y la fecha.");
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
      Alert.alert("Fecha inválida", "Usa el formato AAAA-MM-DD.");
      return;
    }

    const eventData = {
      title: title.trim(),
      date: eventDate,
      time: time || "09:00",
      course: course.trim() || "General",
      type,
    };

    if (editingId) {
      setEvents((current) =>
        current.map((event) =>
          event.id === editingId ? { ...event, ...eventData } : event
        )
      );
    } else {
      setEvents((current) => [
        ...current,
        { id: Date.now().toString(), ...eventData },
      ]);
    }

    setSelectedDate(eventDate);
    const [newYear, newMonth] = eventDate.split("-").map(Number);
    setYear(newYear);
    setMonth(newMonth - 1);
    setShowForm(false);
  };

  const deleteEvent = (id) => {
    const remove = () => {
      setEvents((current) =>
        current.filter((event) => event.id !== id)
      );
      setMenuId(null);
    };

    if (Platform.OS === "web") {
      if (globalThis.confirm("¿Eliminar este evento?")) remove();
    } else {
      Alert.alert("Eliminar evento", "¿Deseas eliminar este evento?", [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: remove },
      ]);
    }
  };

  return (
    <ScrollView style={styles.screen}>
      <View style={[styles.container, isMobile && styles.mobileContainer]}>
        <View style={styles.header}>
          <View>
            <Text style={styles.heading}>Calendario</Text>
            <Text style={styles.subtitle}>
              Organiza tus clases, evaluaciones y entregas.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={openNewEvent}
          >
            <Text style={styles.primaryButtonText}>＋ Nuevo evento</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.calendarCard}>
          <View style={styles.monthHeader}>
            <TouchableOpacity
              style={styles.monthButton}
              onPress={() => changeMonth(-1)}
            >
              <Text style={styles.monthButtonText}>‹</Text>
            </TouchableOpacity>

            <Text style={styles.monthTitle}>
              {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
            </Text>

            <TouchableOpacity
              style={styles.monthButton}
              onPress={() => changeMonth(1)}
            >
              <Text style={styles.monthButtonText}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.weekRow}>
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(
              (day) => (
                <Text key={day} style={styles.weekDay}>
                  {day}
                </Text>
              )
            )}
          </View>

          <View style={styles.daysGrid}>
            {Array.from({ length: firstDay }, (_, index) => (
              <View key={`empty-${index}`} style={styles.dayCell} />
            ))}

            {Array.from({ length: daysInMonth }, (_, index) => {
              const day = index + 1;
              const dateKey = `${year}-${pad(month + 1)}-${pad(day)}`;
              const hasEvent = events.some(
                (event) => event.date === dateKey
              );
              const selected = selectedDate === dateKey;
              const isToday =
                today.getFullYear() === year &&
                today.getMonth() === month &&
                today.getDate() === day;

              return (
                <TouchableOpacity
                  key={dateKey}
                  style={[
                    styles.dayCell,
                    selected && styles.selectedDay,
                    isToday && !selected && styles.todayCell,
                  ]}
                  onPress={() => setSelectedDate(dateKey)}
                >
                  <Text
                    style={[
                      styles.dayNumber,
                      selected && styles.selectedDayText,
                    ]}
                  >
                    {day}
                  </Text>

                  {hasEvent && (
                    <View
                      style={[
                        styles.eventDot,
                        selected && styles.selectedEventDot,
                      ]}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.eventsSection}>
          <View style={styles.eventsHeader}>
            <View>
              <Text style={styles.sectionTitle}>Eventos del día</Text>
              <Text style={styles.sectionSubtitle}>
                {formatDate(selectedDate)}
              </Text>
            </View>
          </View>

          {selectedEvents.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Sin eventos</Text>
              <Text style={styles.emptyText}>
                No hay actividades programadas para este día.
              </Text>
            </View>
          ) : (
            <View style={styles.eventList}>
              {selectedEvents.map((event) => {
                const colors = typeColors[event.type] || typeColors.Actividad;

                return (
                  <View key={event.id} style={styles.eventCard}>
                    <View style={styles.eventTime}>
                      <Text style={styles.eventTimeText}>
                        {event.time}
                      </Text>
                    </View>

                    <View style={styles.eventContent}>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      <Text style={styles.eventCourse}>
                        {event.course || "General"}
                      </Text>
                      <View style={styles.eventFooter}>
                        <Text
                          style={[
                            styles.eventBadge,
                            {
                              backgroundColor: colors.bg,
                              color: colors.text,
                            },
                          ]}
                        >
                          {event.type}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.eventActions}>
                      <TouchableOpacity
                        onPress={() => openEditEvent(event)}
                        style={styles.iconButton}
                      >
                        <Text style={styles.actionIcon}>✎</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() =>
                          setMenuId(menuId === event.id ? null : event.id)
                        }
                        style={styles.iconButton}
                      >
                        <Text style={styles.actionIcon}>⋮</Text>
                      </TouchableOpacity>

                      {menuId === event.id && (
                        <View style={styles.actionMenu}>
                          <TouchableOpacity
                            style={styles.actionItem}
                            onPress={() => openEditEvent(event)}
                          >
                            <Text style={styles.actionText}>Editar</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.actionItem}
                            onPress={() => deleteEvent(event.id)}
                          >
                            <Text style={styles.deleteText}>Eliminar</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {showForm && (
          <View style={styles.modalOverlay}>
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>
                {editingId ? "Editar evento" : "Nuevo evento"}
              </Text>

              <Text style={styles.inputLabel}>Título</Text>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Nombre del evento"
                style={styles.input}
              />

              <Text style={styles.inputLabel}>Fecha (AAAA-MM-DD)</Text>
              <input
                value={eventDate}
                onChange={(event) => setEventDate(event.target.value)}
                placeholder="2026-10-20"
                style={styles.input}
              />

              <Text style={styles.inputLabel}>Hora</Text>
              <input
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                style={styles.input}
              />

              <Text style={styles.inputLabel}>Curso</Text>
              <select
                value={course}
                onChange={(event) => setCourse(event.target.value)}
                style={styles.input}
              >
                <option value="">General</option>
                {courses.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <Text style={styles.inputLabel}>Tipo de evento</Text>
              <select
                value={type}
                onChange={(event) => setType(event.target.value)}
                style={styles.input}
              >
                <option value="Actividad">Actividad</option>
                <option value="Entrega">Entrega</option>
                <option value="Evaluación">Evaluación</option>
              </select>

              <View style={styles.formActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowForm(false)}
                >
                  <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={saveEvent}
                >
                  <Text style={styles.primaryButtonText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  container: {
    flex: 1,
    width: "100%",
    minWidth: 0,
    alignSelf: "stretch",
    padding: 20,
  },
  mobileContainer: {
    padding: 12,
  },
  header: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
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
  primaryButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#0866F5",
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  calendarCard: {
    width: "100%",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
  },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  monthTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1E293B",
    textTransform: "capitalize",
  },
  monthButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 7,
    backgroundColor: "#F1F5F9",
  },
  monthButtonText: {
    fontSize: 24,
    color: "#475569",
    lineHeight: 28,
  },
  weekRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  weekDay: {
    width: `${100 / 7}%`,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
    paddingVertical: 8,
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marginBottom: 3,
  },
  dayNumber: {
    fontSize: 13,
    color: "#334155",
  },
  selectedDay: {
    backgroundColor: "#0866F5",
  },
  selectedDayText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  todayCell: {
    borderWidth: 1,
    borderColor: "#0866F5",
  },
  eventDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#0866F5",
    marginTop: 3,
  },
  selectedEventDot: {
    backgroundColor: "#FFFFFF",
  },
  eventsSection: {
    marginTop: 24,
  },
  eventsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#172554",
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  emptyState: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 9,
    padding: 28,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  emptyText: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    marginTop: 5,
  },
  eventList: {
    gap: 10,
  },
  eventCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 9,
  },
  eventTime: {
    minWidth: 48,
    paddingTop: 2,
  },
  eventTimeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2563EB",
  },
  eventContent: {
    flex: 1,
    minWidth: 0,
  },
  eventTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E293B",
  },
  eventCourse: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 5,
  },
  eventFooter: {
    flexDirection: "row",
    marginTop: 9,
  },
  eventBadge: {
    alignSelf: "flex-start",
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 10,
    fontWeight: "600",
  },
  eventActions: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 5,
  },
  actionIcon: {
    fontSize: 19,
    color: "#64748B",
  },
  actionMenu: {
    position: "absolute",
    top: 32,
    right: 0,
    zIndex: 100,
    elevation: 8,
    minWidth: 105,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 7,
    paddingVertical: 4,
  },
  actionItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  actionText: {
    fontSize: 12,
    color: "#334155",
  },
  deleteText: {
    fontSize: 12,
    color: "#DC2626",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 200,
    backgroundColor: "rgba(15,23,42,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  formCard: {
    width: "100%",
    maxWidth: 450,
    maxHeight: "95%",
    overflow: "auto",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
  },
  formTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#172554",
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 5,
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #DCE3EC",
    borderRadius: 7,
    padding: 10,
    marginBottom: 13,
    backgroundColor: "#FFFFFF",
    color: "#334155",
    fontSize: 12,
  },
  formActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 5,
  },
  cancelButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#DCE3EC",
    borderRadius: 7,
  },
  cancelText: {
    color: "#475569",
    fontSize: 12,
  },
});
