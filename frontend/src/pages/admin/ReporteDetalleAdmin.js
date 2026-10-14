import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';

import AdminDashboard from '../../components/AdminDashboard';
import { useAdminData } from '../../context/AdminDataContext';
import { Card, EmptyState, PageScroll, SectionHeader } from '../../components/admin/AdminUI';
import { colors, tones } from '../../theme/adminTheme';
import { ROLES } from '../../data/adminMockData';
import { REPORTES } from './ReportesAdmin';

// Valor estable (pseudoaleatorio) a partir de un texto, para los reportes
// que todavía no tienen datos reales (asistencia, notas).
const valorEstable = (texto, min, max) => {
  let h = 0;
  for (let i = 0; i < texto.length; i++) h = (h * 31 + texto.charCodeAt(i)) % 997;
  return min + (h % (max - min + 1));
};

// Cada reporte devuelve: { resumen: [{label, value}], barras: [{label, value, max?, texto?}], unidad?, nota? }
function construirReporte(key, data) {
  const { courses, users, library, conversations, courseName, courseShortName, courseStudentCount, stats } = data;
  const porRol = (rol) => users.filter((u) => u.rol === rol);

  switch (key) {
    case 'estudiantes':
      return {
        resumen: [
          { label: 'Total estudiantes', value: stats.estudiantes },
          { label: 'Promedio por aula', value: Math.round(stats.estudiantes / Math.max(courses.length, 1)) },
        ],
        barras: courses.map((c) => ({ label: courseShortName(c), value: courseStudentCount(c), max: c.capacidad })),
      };

    case 'docentes': {
      const docentes = porRol(ROLES.DOCENTE);
      return {
        resumen: [
          { label: 'Docentes', value: docentes.length },
          { label: 'Tutores', value: new Set(courses.map((c) => c.docenteId)).size },
        ],
        barras: docentes.map((d) => ({
          label: `${d.nombres} ${d.apellidos} · ${d.detalle || 'Sin especialidad'}`,
          value: courses.filter((c) => c.docenteId === d.id).length,
        })),
        unidad: 'cursos a cargo',
      };
    }

    case 'cursos': {
      const capacidad = courses.reduce((a, c) => a + c.capacidad, 0);
      return {
        resumen: [
          { label: 'Secciones', value: courses.length },
          { label: 'Ocupación', value: `${Math.round((stats.estudiantes / Math.max(capacidad, 1)) * 100)}%` },
        ],
        barras: courses
          .map((c) => ({
            label: courseName(c),
            value: Math.round((courseStudentCount(c) / c.capacidad) * 100),
            max: 100,
          }))
          .map((b) => ({ ...b, texto: `${b.value}%` })),
      };
    }

    case 'asistencia': {
      const barras = courses.map((c) => {
        const value = valorEstable(c.codigo, 85, 99);
        return { label: courseShortName(c), value, max: 100, texto: `${value}%` };
      });
      const promedio = Math.round(barras.reduce((a, b) => a + b.value, 0) / Math.max(barras.length, 1));
      return {
        resumen: [
          { label: 'Asistencia promedio', value: `${promedio}%` },
          { label: 'Aulas sobre 90%', value: barras.filter((b) => b.value >= 90).length },
        ],
        barras,
        nota: 'Datos de ejemplo: se reemplazarán cuando exista el registro de asistencia.',
      };
    }

    case 'rendimiento': {
      const barras = courses.map((c) => ({
        label: courseShortName(c),
        value: valorEstable(c.codigo + 'n', 12, 18),
        max: 20,
      }));
      const promedio = (barras.reduce((a, b) => a + b.value, 0) / Math.max(barras.length, 1)).toFixed(1);
      return {
        resumen: [
          { label: 'Promedio general', value: promedio },
          { label: 'Aulas aprobadas', value: `${barras.filter((b) => b.value >= 11).length}/${barras.length}` },
        ],
        barras,
        nota: 'Datos de ejemplo: se reemplazarán cuando los docentes registren notas.',
      };
    }

    case 'uso': {
      const mensajes = conversations.reduce((a, c) => a + c.mensajes.length, 0);
      return {
        resumen: [
          { label: 'Usuarios activos', value: users.filter((u) => u.activo).length },
          { label: 'Mensajes', value: mensajes },
        ],
        barras: Object.values(ROLES).map((rol) => ({ label: rol, value: porRol(rol).filter((u) => u.activo).length })),
        unidad: 'usuarios activos',
      };
    }

    case 'biblioteca':
      return {
        resumen: [
          { label: 'Recursos', value: library.length },
          { label: 'Descargas', value: library.reduce((a, b) => a + b.descargas, 0) },
        ],
        barras: [...library]
          .sort((a, b) => b.descargas - a.descargas)
          .map((b) => ({ label: b.titulo, value: b.descargas })),
        unidad: 'descargas',
      };

    case 'cuentas':
      return {
        resumen: [
          { label: 'Cuentas', value: users.length },
          { label: 'Inactivas', value: stats.inactivos },
        ],
        barras: Object.values(ROLES).flatMap((rol) => [
          { label: `${rol} · activos`, value: porRol(rol).filter((u) => u.activo).length },
          { label: `${rol} · inactivos`, value: porRol(rol).filter((u) => !u.activo).length },
        ]),
        unidad: 'cuentas',
      };

    default:
      return null;
  }
}

export default function ReporteDetalleAdmin() {
  const { key } = useRoute().params || {};
  const data = useAdminData();

  const meta = REPORTES.find((r) => r.key === key);
  const reporte = meta ? construirReporte(key, data) : null;

  if (!reporte) {
    return (
      <AdminDashboard variant="detail" title="Reporte">
        <EmptyState icon="bar-chart-outline" text="Reporte no encontrado." />
      </AdminDashboard>
    );
  }

  const color = tones[meta.tono].solid;
  const maxGlobal = Math.max(1, ...reporte.barras.map((b) => b.max || b.value));

  return (
    <AdminDashboard variant="detail" title={meta.titulo}>
      <PageScroll>
        <View style={styles.summary}>
          {reporte.resumen.map((r) => (
            <View key={r.label} style={styles.kpi}>
              <Text style={[styles.kpiValue, { color }]}>{r.value}</Text>
              <Text style={styles.kpiLabel}>{r.label}</Text>
            </View>
          ))}
        </View>

        <SectionHeader title="Detalle" />
        <Card style={styles.card}>
          {reporte.barras.length === 0 && <EmptyState text="Sin datos para mostrar." />}
          {reporte.barras.map((b) => {
            const max = b.max || maxGlobal;
            const pct = Math.min(100, (b.value / max) * 100);
            return (
              <View key={b.label} style={styles.barRow}>
                <View style={styles.barHead}>
                  <Text style={styles.barLabel} numberOfLines={1}>
                    {b.label}
                  </Text>
                  <Text style={styles.barValue}>{b.texto ?? (b.max ? `${b.value} / ${b.max}` : b.value)}</Text>
                </View>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
                </View>
              </View>
            );
          })}
          {!!reporte.unidad && <Text style={styles.unit}>Valores en {reporte.unidad}.</Text>}
        </Card>

        {!!reporte.nota && <Text style={styles.note}>{reporte.nota}</Text>}
      </PageScroll>
    </AdminDashboard>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  kpi: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  kpiValue: { fontSize: 24, fontWeight: '800' },
  kpiLabel: { fontSize: 12, color: colors.textMuted, marginTop: 2 },

  card: { paddingVertical: 8 },
  barRow: { paddingVertical: 9 },
  barHead: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 6 },
  barLabel: { flex: 1, fontSize: 13, color: colors.textStrong },
  barValue: { fontSize: 13, fontWeight: '700', color: colors.textStrong },
  track: { height: 8, borderRadius: 4, backgroundColor: '#EEF1F5', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  unit: { fontSize: 11, color: colors.textMuted, marginVertical: 8 },
  note: { fontSize: 12, color: colors.textMuted, fontStyle: 'italic', marginTop: 4 },
});
