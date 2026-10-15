import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { courses, initialTasks } from '../data/studentMockData';
import { Page, Card, Icon, colors } from '../components/StudentUI';

const tabs = [
  'Inicio',
  'Unidades',
  'Materiales',
  'Tareas',
  'Calificaciones',
  'Foro',
];

export default function CursoDetalleStudent({ route, navigation }) {
  const course =
    courses.find((item) => item.id === route.params?.id) || courses[2];

  const [tab, setTab] = useState('Inicio');

  const courseTasks = initialTasks
    .filter((task) => task.curso === course.nombre)
    .slice(0, 2);

  return (
    <Page
      title={course.nombre}
      subtitle="Tu espacio para aprender y organizarte."
      action={
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={23} color={colors.text} />
        </TouchableOpacity>
      }
    >
      <View style={[styles.banner, { backgroundColor: course.color }]}>
        <Ionicons name={course.icono} size={36} color="#FFFFFF" />

        <View style={styles.bannerInfo}>
          <Text style={styles.bannerTitle}>{course.nombre}</Text>
          <Text style={styles.bannerSub}>{course.descripcion}</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        {tabs.map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setTab(item)}
            style={[styles.tab, tab === item && styles.tabActive]}
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
          <Card>
            <Text style={styles.section}>Información del curso</Text>

            <View style={styles.info}>
              <Icon name="person-outline" color={course.color} />
              <View>
                <Text style={styles.label}>Profesor</Text>
                <Text style={styles.value}>{course.docente}</Text>
              </View>
            </View>

            <View style={styles.info}>
              <Icon name="calendar-outline" color={course.color} />
              <View>
                <Text style={styles.label}>Horario</Text>
                <Text style={styles.value}>{course.horario}</Text>
              </View>
            </View>

            <View style={styles.info}>
              <Icon name="location-outline" color={course.color} />
              <View>
                <Text style={styles.label}>Aula</Text>
                <Text style={styles.value}>{course.aula}</Text>
              </View>
            </View>
          </Card>

          <Card>
            <Text style={styles.section}>Descripción</Text>
            <Text style={styles.body}>
              {course.descripcion} Revisa las unidades, materiales y
              actividades publicadas por tu docente.
            </Text>
          </Card>

          <Card>
            <Text style={styles.section}>Próximas actividades</Text>

            {courseTasks.length > 0 ? (
              courseTasks.map((task) => (
                <View style={styles.activity} key={task.id}>
                  <Icon name={task.icono} color={task.color} />

                  <View style={styles.activityInfo}>
                    <Text style={styles.value}>{task.titulo}</Text>
                    <Text style={styles.label}>Entrega: {task.fecha}</Text>
                  </View>

                  <Text style={styles.pending}>{task.estado}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.body}>
                No hay actividades próximas.
              </Text>
            )}
          </Card>
        </>
      )}

      {tab === 'Unidades' && (
        <Card>
          <Text style={styles.section}>
            Unidad 2: Construimos conocimiento
          </Text>
          <Text style={styles.body}>
            Objetivos, contenidos y sesiones disponibles para esta unidad.
          </Text>
        </Card>
      )}

      {tab === 'Materiales' && (
        <Card>
          <Text style={styles.section}>Materiales del curso</Text>
          <Text style={styles.body}>
            {'Guía de trabajo de la unidad 2\n'}
            {'Lectura complementaria\n'}
            {'Presentación de la semana'}
          </Text>
        </Card>
      )}

      {tab === 'Tareas' && (
        <Card>
          <Text style={styles.section}>Actividades</Text>
          <Text style={styles.body}>
            {courseTasks
              .map((task) => `${task.titulo} · ${task.estado}`)
              .join('\n') || 'No hay tareas en este curso.'}
          </Text>
        </Card>
      )}

      {tab === 'Calificaciones' && (
        <Card>
          <Text style={styles.section}>Calificación actual</Text>
          <Text style={styles.grade}>{course.nota}</Text>
          <Text style={styles.label}>Promedio del periodo</Text>
        </Card>
      )}

      {tab === 'Foro' && (
        <Card>
          <Text style={styles.section}>Foro del curso</Text>
          <Text style={styles.body}>
            Aún no hay conversaciones en el foro.
          </Text>
        </Card>
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: 16,
    padding: 23,
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center',
    marginBottom: 17,
  },
  bannerInfo: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bannerSub: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.86,
    marginTop: 4,
    flexShrink: 1,
  },
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginBottom: 16,
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
    color: colors.blue,
    fontWeight: '700',
  },
  section: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 14,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  body: {
    fontSize: 13,
    lineHeight: 21,
    color: '#617087',
  },
  activity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEF1F5',
    paddingVertical: 11,
  },
  activityInfo: {
    flex: 1,
  },
  pending: {
    fontSize: 10,
    color: '#D97706',
    backgroundColor: '#FFF4DD',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 7,
  },
  grade: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.blue,
    textAlign: 'center',
  },
});