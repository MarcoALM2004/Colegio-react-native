import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { courses } from '../data/studentMockData';
import { Page, Card, Icon, colors } from '../components/StudentUI';

const months = ['Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep'];
const grades = [14, 15, 15, 16, 16, 17, 17, 18];

export default function CalificacionesStudent() {
  const avg = courses.length
    ? (courses.reduce((total, course) => total + course.nota, 0) / courses.length).toFixed(1)
    : '0.0';

  return (
    <Page
      title="Mis Calificaciones"
      subtitle="Revisa tu rendimiento académico."
    >
      <View style={styles.period}>
        <Text style={styles.periodText}>Periodo: Bimestre III</Text>
      </View>

      <View style={styles.grid}>
        {courses.map((course) => (
          <Card key={course.id} style={styles.course}>
            <Icon name={course.icono} color={course.color} />

            <View style={styles.courseInfo}>
              <Text numberOfLines={1} style={styles.name}>
                {course.nombre}
              </Text>

              <Text style={styles.note}>{course.nota}</Text>
            </View>
          </Card>
        ))}
      </View>

      <Card>
        <Text style={styles.section}>Promedio general</Text>

        <View style={styles.avgRow}>
          <Text style={styles.avg}>{avg}</Text>

          <View>
            <Text style={styles.good}>Buen desempeño</Text>
            <Text style={styles.hint}>Sigue así, Marco.</Text>
          </View>
        </View>
      </Card>

      <Card>
        <Text style={styles.section}>Evolución de notas</Text>

        <View style={styles.chart}>
          {grades.map((grade, index) => (
            <View key={months[index]} style={styles.chartItem}>
              <View style={[styles.bar, { height: grade * 5 }]} />

              <Text style={styles.chartText}>{months[index]}</Text>
            </View>
          ))}
        </View>
      </Card>
    </Page>
  );
}

const styles = StyleSheet.create({
  period: {
    alignSelf: 'flex-end',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: -57,
    marginBottom: 25,
  },
  periodText: {
    fontSize: 11,
    color: '#718096',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  course: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 0,
    padding: 13,
  },
  courseInfo: {
    flex: 1,
  },
  name: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
  },
  note: {
    fontSize: 22,
    fontWeight: '800',
    color: '#20A875',
    marginTop: 4,
  },
  section: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 13,
  },
  avgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avg: {
    fontSize: 42,
    fontWeight: '800',
    color: colors.blue,
  },
  good: {
    fontSize: 14,
    fontWeight: '700',
    color: '#16803D',
  },
  hint: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 3,
  },
  chart: {
    height: 130,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingTop: 10,
  },
  chartItem: {
    alignItems: 'center',
    gap: 5,
  },
  bar: {
    width: 14,
    borderRadius: 5,
    backgroundColor: '#4A8AF4',
  },
  chartText: {
    fontSize: 9,
    color: colors.muted,
  },
});