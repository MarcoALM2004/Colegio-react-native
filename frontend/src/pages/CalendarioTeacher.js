import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  BottomSheet,
  Button,
  Card,
  EmptyState,
  Field,
  PageScroll,
  PageTitle,
  confirmAction,
} from '../components/admin/AdminUI';

import { colors, toneList, tones } from '../theme/adminTheme';
import { DIAS_CORTOS, MESES, toISODate } from '../utils/adminHelpers';

const VISTAS = ['Día', 'Semana', 'Mes'];
const TIPOS = ['Entrega', 'Evaluación', 'Actividad'];

const EVENTOS_INICIALES = [
  {
    id: '1',
    title: 'Entrega del proyecto final',
    date: '2026-10-15',
    time: '10:00',
    course: 'Computación - 5° A',
    type: 'Entrega',
    tone: 'blue',
  },
  {
    id: '2',
    title: 'Evaluación práctica',
    date: '2026-10-18',
    time: '09:00',
    course: 'Computación - 4° A',
    type: 'Evaluación',
    tone: 'amber',
  },
  {
    id: '3',
    title: 'Revisión de trabajos',
    date: '2026-10-20',
    time: '11:30',
    course: 'Computación - 5° B',
    type: 'Actividad',
    tone: 'green',
  },
  {
    id: '4',
    title: 'Exposición grupal',
    date: '2026-10-23',
    time: '08:30',
    course: 'Computación - 4° B',
    type: 'Evaluación',
    tone: 'purple',
  },
];

const sumarDias = (fecha, cantidad) => {
  const nueva = new Date(fecha);
  nueva.setDate(nueva.getDate() + cantidad);
  return nueva;
};

const inicioSemana = (fecha) =>
  sumarDias(fecha, -((fecha.getDay() + 6) % 7));

const capitalizar = (texto) =>
  texto.charAt(0).toUpperCase() + texto.slice(1);

const obtenerTono = (evento) =>
  evento.tone ||
  ({
    Entrega: 'blue',
    Evaluación: 'amber',
    Actividad: 'green',
  }[evento.type] || 'blue');

const crearFormulario = (fecha, curso = '') => ({
  title: '',
  date: fecha,
  time: '09:00',
  course: curso,
  type: 'Actividad',
  tone: 'green',
});

export default function CalendarioTeacher() {
  const [events, setEvents] = useState(EVENTOS_INICIALES);
  const [vista, setVista] = useState('Semana');
  const [fecha, setFecha] = useState(() => new Date());
  const [form, setForm] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const fechaISO = toISODate(fecha);
  const hoyISO = toISODate(new Date());

  const eventosPorFecha = useMemo(() => {
    const mapa = {};

    events.forEach((evento) => {
      (mapa[evento.date] ||= []).push(evento);
    });

    Object.values(mapa).forEach((lista) =>
      lista.sort((a, b) => a.time.localeCompare(b.time))
    );

    return mapa;
  }, [events]);

  const eventosDelDia = eventosPorFecha[fechaISO] || [];

  const cursos = useMemo(
    () => [...new Set(events.map((e) => e.course).filter(Boolean))],
    [events]
  );

  const semana = Array.from({ length: 7 }, (_, i) =>
    sumarDias(inicioSemana(fecha), i)
  );

  const primeroMes = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
  const celdas = Array.from({ length: 42 }, (_, i) =>
    sumarDias(inicioSemana(primeroMes), i)
  );
  const celdasMes =
    celdas[35].getMonth() !== fecha.getMonth()
      ? celdas.slice(0, 35)
      : celdas;

  const tituloPeriodo =
    vista === 'Día'
      ? `${DIAS_CORTOS[fecha.getDay()]} ${fecha.getDate()} de ${MESES[fecha.getMonth()]}`
      : `${capitalizar(MESES[fecha.getMonth()])} ${fecha.getFullYear()}`;

  const mover = (direccion) => {
    if (vista === 'Día') {
      setFecha((actual) => sumarDias(actual, direccion));
    } else if (vista === 'Semana') {
      setFecha((actual) => sumarDias(actual, direccion * 7));
    } else {
      setFecha(
        (actual) =>
          new Date(
            actual.getFullYear(),
            actual.getMonth() + direccion,
            1
          )
      );
    }
  };

  const abrirNuevo = () => {
    setEditingId(null);
    setForm(crearFormulario(fechaISO, cursos[0] || ''));
  };

  const abrirEditar = (evento) => {
    setEditingId(evento.id);
    setForm({ ...evento, tone: obtenerTono(evento) });
  };

  const actualizarForm = (campo, valor) =>
    setForm((actual) => ({ ...actual, [campo]: valor }));

  const guardar = () => {
    if (
      !form?.title.trim() ||
      !/^\d{4}-\d{2}-\d{2}$/.test(form.date) ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(form.time)
    ) {
      return;
    }

    const [anio, mes, dia] = form.date.split('-').map(Number);
    const fechaValidada = new Date(anio, mes - 1, dia);

    if (toISODate(fechaValidada) !== form.date) return;

    const evento = {
      ...form,
      title: form.title.trim(),
      course: form.course.trim() || 'General',
    };

    setEvents((actuales) =>
      editingId
        ? actuales.map((e) =>
            e.id === editingId ? { ...e, ...evento } : e
          )
        : [...actuales, { ...evento, id: Date.now().toString() }]
    );

    setFecha(fechaValidada);
    setForm(null);
    setEditingId(null);
  };

  const eliminar = (evento) =>
    confirmAction(
      'Eliminar evento',
      `¿Eliminar "${evento.title}"?`,
      () =>
        setEvents((actuales) =>
          actuales.filter((e) => e.id !== evento.id)
        ),
      'Eliminar'
    );

  const renderDia = (dia) => {
    const iso = toISODate(dia);
    const activo = iso === fechaISO;

    return (
      <TouchableOpacity
        key={iso}
        style={[styles.day, activo && styles.dayActive]}
        onPress={() => setFecha(dia)}
      >
        <Text style={[styles.dayName, activo && styles.white]}>
          {DIAS_CORTOS[dia.getDay()]}
        </Text>
        <Text
          style={[
            styles.dayNumber,
            iso === hoyISO && styles.today,
            activo && styles.white,
          ]}
        >
          {dia.getDate()}
        </Text>
        {!!eventosPorFecha[iso] && (
          <View style={[styles.dot, activo && styles.dotWhite]} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <>
      <PageScroll>
        <PageTitle
          title="Calendario"
          actionLabel="Nuevo evento"
          onAction={abrirNuevo}
        />

        <View style={styles.segment}>
          {VISTAS.map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.segmentItem,
                vista === item && styles.segmentActive,
              ]}
              onPress={() => setVista(item)}
            >
              <Text
                style={[
                  styles.segmentText,
                  vista === item && styles.segmentTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Card>
          <View style={styles.periodRow}>
            <TouchableOpacity
              style={styles.arrow}
              onPress={() => mover(-1)}
            >
              <Ionicons
                name="chevron-back"
                size={20}
                color={colors.textStrong}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setFecha(new Date())}>
              <Text style={styles.period}>{tituloPeriodo}</Text>
              <Text style={styles.todayLink}>Volver a hoy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.arrow}
              onPress={() => mover(1)}
            >
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textStrong}
              />
            </TouchableOpacity>
          </View>

          {vista === 'Día' && (
            <View style={styles.dayPreview}>
              <Ionicons
                name="calendar-outline"
                size={25}
                color={colors.primary}
              />
              <Text style={styles.dayTitle}>
                {eventosDelDia.length} evento
                {eventosDelDia.length === 1 ? '' : 's'} programado
                {eventosDelDia.length === 1 ? '' : 's'}
              </Text>
            </View>
          )}

          {vista === 'Semana' && (
            <View style={styles.weekRow}>
              {semana.map(renderDia)}
            </View>
          )}

          {vista === 'Mes' && (
            <View style={styles.monthGrid}>
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(
                (dia) => (
                  <Text style={styles.monthHead} key={dia}>
                    {dia}
                  </Text>
                )
              )}

              {celdasMes.map((dia) => {
                const iso = toISODate(dia);
                const activo = iso === fechaISO;
                const fuera = dia.getMonth() !== fecha.getMonth();

                return (
                  <TouchableOpacity
                    key={iso}
                    style={styles.monthCell}
                    onPress={() => setFecha(dia)}
                  >
                    <View
                      style={[
                        styles.monthNumBox,
                        activo && styles.monthNumActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.monthNum,
                          fuera && styles.muted,
                          iso === hoyISO && styles.today,
                          activo && styles.white,
                        ]}
                      >
                        {dia.getDate()}
                      </Text>
                    </View>

                    {!!eventosPorFecha[iso] && (
                      <View
                        style={[
                          styles.dot,
                          activo && styles.dotWhite,
                        ]}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </Card>

        <Text style={styles.sectionTitle}>
          Eventos del día · {eventosDelDia.length}
        </Text>

        {eventosDelDia.length === 0 ? (
          <Card>
            <EmptyState
              icon="calendar-outline"
              text="Sin eventos para este día."
            />
          </Card>
        ) : (
          eventosDelDia.map((evento) => {
            const tono = tones[obtenerTono(evento)] || tones.blue;

            return (
              <View key={evento.id} style={styles.eventRow}>
                <Text style={styles.eventHour}>{evento.time}</Text>

                <View
                  style={[
                    styles.event,
                    {
                      backgroundColor: tono.soft,
                      borderLeftColor: tono.solid,
                    },
                  ]}
                >
                  <View style={styles.flex}>
                    <Text style={styles.eventTitle}>
                      {evento.title}
                    </Text>
                    <Text style={styles.eventCourse}>
                      {evento.course}
                    </Text>
                    <Text style={styles.eventType}>
                      {evento.type}
                    </Text>
                  </View>

                  <View style={styles.actions}>
                    <TouchableOpacity
                      onPress={() => abrirEditar(evento)}
                    >
                      <Ionicons
                        name="create-outline"
                        size={19}
                        color={colors.primary}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => eliminar(evento)}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color={colors.danger || '#DC2626'}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </PageScroll>

      <BottomSheet
        visible={!!form}
        title={editingId ? 'Editar evento' : 'Nuevo evento'}
        onClose={() => setForm(null)}
      >
        {form && (
          <>
            <Field
              label="Título"
              value={form.title}
              onChangeText={(v) => actualizarForm('title', v)}
              placeholder="Ej. Entrega del proyecto"
            />

            <View style={styles.formRow}>
              <Field
                style={styles.flex}
                label="Fecha (AAAA-MM-DD)"
                value={form.date}
                onChangeText={(v) => actualizarForm('date', v)}
                placeholder="2026-10-15"
              />

              <Field
                style={styles.flex}
                label="Hora (HH:MM)"
                value={form.time}
                onChangeText={(v) => actualizarForm('time', v)}
                placeholder="09:00"
              />
            </View>

            <Field
              label="Curso y sección"
              value={form.course}
              onChangeText={(v) => actualizarForm('course', v)}
              placeholder="Computación - 5° A"
            />

            <View style={styles.suggestions}>
              {cursos.map((curso) => (
                <TouchableOpacity
                  key={curso}
                  style={[
                    styles.courseChip,
                    form.course === curso && styles.courseChipActive,
                  ]}
                  onPress={() => actualizarForm('course', curso)}
                >
                  <Text
                    style={[
                      styles.courseText,
                      form.course === curso && styles.courseTextActive,
                    ]}
                  >
                    {curso}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Tipo de evento</Text>
            <View style={styles.options}>
              {TIPOS.map((tipo) => (
                <TouchableOpacity
                  key={tipo}
                  style={[
                    styles.typeOption,
                    form.type === tipo && styles.typeOptionActive,
                  ]}
                  onPress={() => actualizarForm('type', tipo)}
                >
                  <Text
                    style={[
                      styles.typeText,
                      form.type === tipo && styles.typeTextActive,
                    ]}
                  >
                    {tipo}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Color</Text>
            <View style={styles.colors}>
              {toneList.map((tono) => (
                <TouchableOpacity
                  key={tono}
                  onPress={() => actualizarForm('tone', tono)}
                  style={[
                    styles.color,
                    { backgroundColor: tones[tono].solid },
                    form.tone === tono && styles.colorActive,
                  ]}
                />
              ))}
            </View>

            <Button
              title={editingId ? 'Guardar cambios' : 'Guardar evento'}
              icon="checkmark"
              onPress={guardar}
              disabled={
                !form.title.trim() ||
                !/^\d{4}-\d{2}-\d{2}$/.test(form.date) ||
                !/^([01]\d|2[0-3]):[0-5]\d$/.test(form.time)
              }
            />
          </>
        )}
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  white: { color: '#FFFFFF' },
  muted: { color: '#C3CAD6' },
  today: { color: colors.primary, fontWeight: '800' },

  segment: {
    flexDirection: 'row',
    backgroundColor: '#E9EEF6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
  },
  segmentItem: {
    flex: 1,
    height: 36,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentActive: { backgroundColor: colors.primary },
  segmentText: { fontSize: 13, color: colors.textStrong },
  segmentTextActive: { color: '#FFFFFF', fontWeight: '700' },

  periodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  arrow: { padding: 8 },
  period: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textStrong,
    textAlign: 'center',
  },
  todayLink: {
    fontSize: 11,
    color: colors.primary,
    textAlign: 'center',
    marginTop: 4,
  },

  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  day: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
  },
  dayActive: { backgroundColor: colors.primary },
  dayName: { fontSize: 10, color: colors.textMuted },
  dayNumber: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textStrong,
    marginTop: 3,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 4,
  },
  dotWhite: { backgroundColor: '#FFFFFF' },

  monthGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  monthHead: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 8,
  },
  monthCell: {
    width: '14.28%',
    alignItems: 'center',
    height: 44,
  },
  monthNumBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthNumActive: { backgroundColor: colors.primary },
  monthNum: { fontSize: 13, color: colors.textStrong },

  dayPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  dayTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textStrong,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textStrong,
    marginTop: 6,
    marginBottom: 12,
  },

  eventRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 10,
    gap: 10,
  },
  eventHour: {
    width: 46,
    fontSize: 12,
    color: colors.textMuted,
    paddingTop: 12,
  },
  event: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderRadius: 10,
    padding: 12,
    gap: 10,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textStrong,
  },
  eventCourse: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  eventType: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  formRow: { flexDirection: 'row', gap: 10 },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  courseChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  courseChipActive: {
    borderColor: colors.primary,
    backgroundColor: '#EEF2FF',
  },
  courseText: { fontSize: 11, color: colors.textMuted },
  courseTextActive: { color: colors.primary, fontWeight: '700' },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textStrong,
    marginBottom: 8,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  typeOption: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  typeOptionActive: {
    borderColor: colors.primary,
    backgroundColor: '#EEF2FF',
  },
  typeText: { fontSize: 12, color: colors.textMuted },
  typeTextActive: { color: colors.primary, fontWeight: '700' },
  colors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 18,
  },
  color: { width: 30, height: 30, borderRadius: 15 },
  colorActive: { borderWidth: 3, borderColor: colors.textStrong },
});