import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import AdminDashboard from '../../components/AdminDashboard';
import { useAdminData } from '../../context/AdminDataContext';
import {
  BottomSheet,
  Button,
  Card,
  EmptyState,
  Field,
  PageScroll,
  PageTitle,
  confirmAction,
} from '../../components/admin/AdminUI';
import { colors, toneList, tones } from '../../theme/adminTheme';
import { DIAS_CORTOS, MESES, toISODate } from '../../utils/adminHelpers';

const VISTAS = ['Día', 'Semana', 'Mes'];

const sumarDias = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

// Lunes de la semana de `date`
const inicioSemana = (date) => {
  const d = new Date(date);
  const dia = (d.getDay() + 6) % 7; // 0 = lunes
  return sumarDias(d, -dia);
};

// Date -> "Mié 14 oct"
const fechaCorta = (d) => `${DIAS_CORTOS[d.getDay()]} ${d.getDate()} ${MESES[d.getMonth()].slice(0, 3)}`;

const capitalizar = (t) => t.charAt(0).toUpperCase() + t.slice(1);

export default function CalendarioAdmin() {
  const { events, addEvent, deleteEvent } = useAdminData();

  const [vista, setVista] = useState('Semana');
  const [fecha, setFecha] = useState(() => new Date());
  const [form, setForm] = useState(null);

  const hoyISO = toISODate(new Date());
  const fechaISO = toISODate(fecha);

  const eventosPorFecha = useMemo(() => {
    const mapa = {};
    events.forEach((e) => {
      (mapa[e.fecha] = mapa[e.fecha] || []).push(e);
    });
    Object.values(mapa).forEach((lista) => lista.sort((a, b) => a.hora.localeCompare(b.hora)));
    return mapa;
  }, [events]);

  const eventosDelDia = eventosPorFecha[fechaISO] || [];

  const mover = (dir) => {
    if (vista === 'Día') setFecha((f) => sumarDias(f, dir));
    else if (vista === 'Semana') setFecha((f) => sumarDias(f, dir * 7));
    else setFecha((f) => new Date(f.getFullYear(), f.getMonth() + dir, 1));
  };

  const tituloPeriodo =
    vista === 'Día'
      ? `${DIAS_CORTOS[fecha.getDay()]} ${fecha.getDate()} de ${MESES[fecha.getMonth()]}`
      : `${capitalizar(MESES[fecha.getMonth()])} ${fecha.getFullYear()}`;

  /* ---------- Semana ---------- */
  const semana = Array.from({ length: 7 }, (_, i) => sumarDias(inicioSemana(fecha), i));

  /* ---------- Mes ---------- */
  const primeroMes = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
  const celdas = Array.from({ length: 42 }, (_, i) => sumarDias(inicioSemana(primeroMes), i));
  // Quitar la última fila si es solo del mes siguiente
  const celdasMes = celdas[35].getMonth() !== fecha.getMonth() ? celdas.slice(0, 35) : celdas;

  const guardar = () => {
    if (!form.titulo.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(form.fecha) || !/^\d{2}:\d{2}$/.test(form.hora)) return;
    addEvent({ ...form, titulo: form.titulo.trim(), lugar: form.lugar.trim() });
    const [a, m, d] = form.fecha.split('-').map(Number);
    setFecha(new Date(a, m - 1, d));
    setForm(null);
  };

  const formValido =
    form && form.titulo.trim() && /^\d{4}-\d{2}-\d{2}$/.test(form.fecha) && /^\d{2}:\d{2}$/.test(form.hora);

  return (
    <AdminDashboard>
      <PageScroll>
        <PageTitle
          title="Calendario"
          actionLabel="Evento"
          onAction={() => setForm({ titulo: '', fecha: fechaISO, hora: '09:00', lugar: '', tono: 'blue' })}
        />

        {/* SELECTOR DE VISTA */}
        <View style={styles.segment}>
          {VISTAS.map((v) => (
            <TouchableOpacity
              key={v}
              style={[styles.segmentItem, vista === v && styles.segmentActive]}
              onPress={() => setVista(v)}
            >
              <Text style={[styles.segmentText, vista === v && styles.segmentTextActive]}>{v}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* NAVEGACIÓN DEL PERIODO */}
        <View style={styles.periodRow}>
          <TouchableOpacity style={styles.arrow} onPress={() => mover(-1)}>
            <Ionicons name="chevron-back" size={20} color={colors.textStrong} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setFecha(new Date())}>
            <Text style={styles.period}>{tituloPeriodo}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.arrow} onPress={() => mover(1)}>
            <Ionicons name="chevron-forward" size={20} color={colors.textStrong} />
          </TouchableOpacity>
        </View>

        {vista === 'Semana' && (
          <View style={styles.weekRow}>
            {semana.map((d) => {
              const iso = toISODate(d);
              const activo = iso === fechaISO;
              return (
                <TouchableOpacity
                  key={iso}
                  style={[styles.weekDay, activo && styles.weekDayActive]}
                  onPress={() => setFecha(d)}
                >
                  <Text style={[styles.weekName, activo && styles.white]}>{DIAS_CORTOS[d.getDay()]}</Text>
                  <Text style={[styles.weekNum, iso === hoyISO && styles.today, activo && styles.white]}>
                    {d.getDate()}
                  </Text>
                  {!!eventosPorFecha[iso] && <View style={[styles.dot, activo && styles.dotWhite]} />}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {vista === 'Mes' && (
          <Card style={styles.monthCard}>
            <View style={styles.monthGrid}>
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
                <Text key={d} style={styles.monthHead}>
                  {d}
                </Text>
              ))}
              {celdasMes.map((d) => {
                const iso = toISODate(d);
                const fuera = d.getMonth() !== fecha.getMonth();
                const activo = iso === fechaISO;
                return (
                  <TouchableOpacity key={iso} style={styles.monthCell} onPress={() => setFecha(d)}>
                    <View style={[styles.monthNumBox, activo && styles.monthNumActive]}>
                      <Text
                        style={[
                          styles.monthNum,
                          fuera && styles.muted,
                          iso === hoyISO && styles.today,
                          activo && styles.white,
                        ]}
                      >
                        {d.getDate()}
                      </Text>
                    </View>
                    {!!eventosPorFecha[iso] && <View style={styles.dot} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>
        )}

        {/* EVENTOS DEL DÍA SELECCIONADO */}
        <Text style={styles.dayTitle}>
          {fechaCorta(fecha)} · {eventosDelDia.length} evento{eventosDelDia.length === 1 ? '' : 's'}
        </Text>

        {eventosDelDia.length === 0 ? (
          <Card>
            <EmptyState icon="calendar-outline" text="Sin eventos para este día." />
          </Card>
        ) : (
          eventosDelDia.map((e) => (
            <View key={e.id} style={styles.eventRow}>
              <Text style={styles.eventHour}>{e.hora}</Text>
              <View
                style={[styles.event, { backgroundColor: tones[e.tono].soft, borderLeftColor: tones[e.tono].solid }]}
              >
                <View style={styles.flex}>
                  <Text style={styles.eventTitle}>{e.titulo}</Text>
                  {!!e.lugar && <Text style={styles.eventPlace}>{e.lugar}</Text>}
                </View>
                <TouchableOpacity
                  onPress={() =>
                    confirmAction('Eliminar evento', `¿Eliminar "${e.titulo}"?`, () => deleteEvent(e.id), 'Eliminar')
                  }
                >
                  <Ionicons name="close" size={18} color={colors.icon} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </PageScroll>

      <BottomSheet visible={!!form} title="Nuevo evento" onClose={() => setForm(null)}>
        {form && (
          <>
            <Field
              label="Título"
              value={form.titulo}
              onChangeText={(titulo) => setForm((f) => ({ ...f, titulo }))}
              placeholder="Ej. Reunión de docentes"
            />
            <View style={styles.formRow}>
              <Field
                style={styles.flex}
                label="Fecha (AAAA-MM-DD)"
                value={form.fecha}
                onChangeText={(v) => setForm((f) => ({ ...f, fecha: v }))}
                placeholder="2026-10-14"
              />
              <Field
                style={styles.flex}
                label="Hora (HH:MM)"
                value={form.hora}
                onChangeText={(hora) => setForm((f) => ({ ...f, hora }))}
                placeholder="09:00"
              />
            </View>
            <Field
              label="Lugar"
              value={form.lugar}
              onChangeText={(lugar) => setForm((f) => ({ ...f, lugar }))}
              placeholder="Ej. Dirección"
            />
            <Text style={styles.label}>Color</Text>
            <View style={styles.colors}>
              {toneList.map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setForm((f) => ({ ...f, tono: t }))}
                  style={[styles.color, { backgroundColor: tones[t].solid }, form.tono === t && styles.colorActive]}
                />
              ))}
            </View>
            <Button title="Guardar evento" icon="checkmark" onPress={guardar} disabled={!formValido} />
          </>
        )}
      </BottomSheet>
    </AdminDashboard>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  white: { color: '#FFFFFF' },
  muted: { color: '#C3CAD6' },
  today: { color: colors.primary, fontWeight: '800' },

  segment: { flexDirection: 'row', backgroundColor: '#E9EEF6', borderRadius: 12, padding: 4, marginBottom: 14 },
  segmentItem: { flex: 1, height: 34, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  segmentActive: { backgroundColor: colors.primary },
  segmentText: { fontSize: 13, color: colors.textStrong },
  segmentTextActive: { color: '#FFFFFF', fontWeight: '700' },

  periodRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  arrow: { padding: 8 },
  period: { fontSize: 15, fontWeight: '700', color: colors.textStrong },

  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, gap: 4 },
  weekDay: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 12 },
  weekDayActive: { backgroundColor: colors.primary },
  weekName: { fontSize: 11, color: colors.textMuted },
  weekNum: { fontSize: 15, fontWeight: '600', color: colors.textStrong, marginTop: 2 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.primary, marginTop: 3 },
  dotWhite: { backgroundColor: '#FFFFFF' },

  monthCard: { paddingVertical: 10 },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  monthHead: { width: '14.28%', textAlign: 'center', fontSize: 11, color: colors.textMuted, marginBottom: 6 },
  monthCell: { width: '14.28%', alignItems: 'center', height: 44 },
  monthNumBox: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  monthNumActive: { backgroundColor: colors.primary },
  monthNum: { fontSize: 13, color: colors.textStrong },

  dayTitle: { fontSize: 14, fontWeight: '700', color: colors.textStrong, marginBottom: 10, marginTop: 4 },

  eventRow: { flexDirection: 'row', alignItems: 'stretch', marginBottom: 10, gap: 10 },
  eventHour: { width: 46, fontSize: 12, color: colors.textMuted, paddingTop: 12 },
  event: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderRadius: 10,
    padding: 12,
  },
  eventTitle: { fontSize: 14, fontWeight: '600', color: colors.textStrong },
  eventPlace: { fontSize: 12, color: colors.textMuted, marginTop: 2 },

  formRow: { flexDirection: 'row', gap: 10 },
  label: { fontSize: 12, fontWeight: '600', color: colors.textStrong, marginBottom: 8 },
  colors: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  color: { width: 30, height: 30, borderRadius: 15 },
  colorActive: { borderWidth: 3, borderColor: colors.textStrong },
});
