import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { listarMisCursos } from '../service/cursosService';
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
  const cursoId = route?.params?.id;

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('Inicio');

  const cargarCurso = useCallback(async () => {
    if (cursoId == null) {
      setError('No se recibió el identificador del curso.');
      setCourse(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const cursos = await listarMisCursos();

      const encontrado = cursos.find(
        (item) => String(item.id) === String(cursoId)
      );

      if (!encontrado) {
        setCourse(null);
        setError('No se encontró este curso entre tus matrículas activas.');
        return;
      }

      setCourse(encontrado);
    } catch (e) {
      setCourse(null);
      setError(e.message || 'No se pudo cargar el curso.');
    } finally {
      setLoading(false);
    }
  }, [cursoId]);

  useEffect(() => {
    cargarCurso();
  }, [cargarCurso]);

  if (loading) {
    return (
      <Page
        title="Cargando curso..."
        subtitle="Estamos obteniendo la información del curso."
        action={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons
              name="arrow-back"
              size={23}
              color={colors.text}
            />
          </TouchableOpacity>
        }
      >
        <Card style={styles.center}>
          <ActivityIndicator size="large" color={colors.blue} />
          <Text style={styles.body}>Cargando información...</Text>
        </Card>
      </Page>
    );
  }

  if (error || !course) {
    return (
      <Page
        title="Curso"
        subtitle="No se pudo mostrar la información."
        action={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons
              name="arrow-back"
              size={23}
              color={colors.text}
            />
          </TouchableOpacity>
        }
      >
        <Card style={styles.center}>
          <Ionicons
            name="alert-circle-outline"
            size={40}
            color="#DC2626"
          />

          <Text style={styles.errorText}>
            {error || 'No se encontró el curso.'}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={cargarCurso}
          >
            <Text style={styles.retryText}>
              Volver a intentar
            </Text>
          </TouchableOpacity>
        </Card>
      </Page>
    );
  }

  const colorCurso = course.color || colors.blue;

  return (
    <Page
      title={course.nombre}
      subtitle="Tu espacio para aprender y organizarte."
      action={
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name="arrow-back"
            size={23}
            color={colors.text}
          />
        </TouchableOpacity>
      }
    >
      <View
        style={[
          styles.banner,
          { backgroundColor: colorCurso },
        ]}
      >
        <Ionicons
          name={course.icono || 'book-outline'}
          size={36}
          color="#FFFFFF"
        />

        <View style={styles.bannerInfo}>
          <Text style={styles.bannerTitle}>
            {course.nombre}
          </Text>

          <Text style={styles.bannerSub}>
            {course.grado || ''} · {course.nivel || ''}
            {course.seccionCodigo || course.seccion
              ? ` · Sección ${course.seccionCodigo || course.seccion}`
              : ''}
          </Text>

          <Text style={styles.bannerSub}>
            {course.descripcion || 'Sin descripción registrada.'}
          </Text>
        </View>
      </View>

      <View style={styles.tabs}>
        {tabs.map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setTab(item)}
            style={[
              styles.tab,
              tab === item && styles.tabActive,
            ]}
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
            <Text style={styles.section}>
              Información del curso
            </Text>

            <View style={styles.info}>
              <Icon name="person-outline" color={colorCurso} />
              <View>
                <Text style={styles.label}>Profesor</Text>
                <Text style={styles.value}>
                  {course.docente || 'No registrado'}
                </Text>
              </View>
            </View>

            <View style={styles.info}>
              <Icon name="school-outline" color={colorCurso} />
              <View>
                <Text style={styles.label}>Grado y nivel</Text>
                <Text style={styles.value}>
                  {course.grado || '—'} {course.nivel || ''}
                </Text>
              </View>
            </View>

            <View style={styles.info}>
              <Icon name="people-outline" color={colorCurso} />
              <View>
                <Text style={styles.label}>Sección</Text>
                <Text style={styles.value}>
                  {course.seccionCodigo || course.seccion || 'No registrada'}
                </Text>
              </View>
            </View>

            <View style={styles.info}>
              <Icon name="calendar-outline" color={colorCurso} />
              <View>
                <Text style={styles.label}>Año escolar</Text>
                <Text style={styles.value}>
                  {course.anio || 'No registrado'}
                </Text>
              </View>
            </View>
          </Card>

          <Card>
            <Text style={styles.section}>Descripción</Text>
            <Text style={styles.body}>
              {course.descripcion ||
                'Este curso todavía no tiene descripción.'}
            </Text>
          </Card>

          <Card>
            <Text style={styles.section}>
              Próximas actividades
            </Text>

            <Text style={styles.body}>
              Todavía no hay actividades disponibles para mostrar.
            </Text>
          </Card>
        </>
      )}

      {tab === 'Unidades' && (
        <Card>
          <Text style={styles.section}>
            Unidades de aprendizaje
          </Text>
          <Text style={styles.body}>
            Todavía no hay unidades publicadas en este curso.
          </Text>
        </Card>
      )}

      {tab === 'Materiales' && (
        <Card>
          <Text style={styles.section}>
            Materiales del curso
          </Text>
          <Text style={styles.body}>
            Todavía no hay materiales disponibles.
          </Text>
        </Card>
      )}

      {tab === 'Tareas' && (
        <Card>
          <Text style={styles.section}>Actividades</Text>
          <Text style={styles.body}>
            No hay tareas disponibles para este curso.
          </Text>
        </Card>
      )}

      {tab === 'Calificaciones' && (
        <Card>
          <Text style={styles.section}>Calificaciones</Text>
          <Text style={styles.body}>
            Las calificaciones aparecerán cuando estén conectadas al backend.
          </Text>
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
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 35,
  },
  errorText: {
    fontSize: 13,
    color: '#DC2626',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 9,
    marginTop: 5,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
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
    minWidth: 0,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bannerSub: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
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
});
