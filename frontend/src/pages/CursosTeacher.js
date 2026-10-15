import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export const cursos = [
  {
    id: 1,
    nombre: 'Matemáticas',
    descripcion: 'Gestiona contenidos, actividades y evaluaciones.',
    seccion: '4° Sec A',
    alumnos: 28,
    nivel: 'Secundaria',
    icono: 'calculator-outline',
    color: '#2994F5',
  },
  {
    id: 2,
    nombre: 'Matemáticas',
    descripcion: 'Gestiona contenidos, actividades y evaluaciones.',
    seccion: '4° Sec B',
    alumnos: 26,
    nivel: 'Secundaria',
    icono: 'calculator-outline',
    color: '#2994F5',
  },
  {
    id: 3,
    nombre: 'Tutoría',
    descripcion: 'Organiza actividades y acompaña a tus estudiantes.',
    seccion: '5° Sec A',
    alumnos: 24,
    nivel: 'Secundaria',
    icono: 'people-outline',
    color: '#40BF7A',
  },
  {
    id: 4,
    nombre: 'Geometría',
    descripcion: 'Gestiona contenidos y actividades de geometría.',
    seccion: '3° Sec A',
    alumnos: 27,
    nivel: 'Secundaria',
    icono: 'home-outline',
    color: '#FF941F',
  },
  {
    id: 5,
    nombre: 'Álgebra',
    descripcion: 'Organiza ejercicios y actividades de álgebra.',
    seccion: '5° Sec B',
    alumnos: 25,
    nivel: 'Secundaria',
    icono: 'shapes-outline',
    color: '#A56BF5',
  },
  {
    id: 6,
    nombre: 'Matemática',
    descripcion: 'Gestiona actividades y materiales de matemática.',
    seccion: '5° Prim A',
    alumnos: 25,
    nivel: 'Primaria',
    icono: 'calculator-outline',
    color: '#2994F5',
  },
  {
    id: 7,
    nombre: 'Comunicación',
    descripcion: 'Organiza lecturas, tareas y actividades.',
    seccion: '4° Prim B',
    alumnos: 23,
    nivel: 'Primaria',
    icono: 'book-outline',
    color: '#40BF7A',
  },
  {
    id: 8,
    nombre: 'Ciencia y Tecnología',
    descripcion: 'Gestiona recursos y actividades de ciencias.',
    seccion: '6° Prim A',
    alumnos: 26,
    nivel: 'Primaria',
    icono: 'flask-outline',
    color: '#A56BF5',
  },
];

const filtros = ['Todos', 'Secundaria', 'Primaria'];

export default function CursosTeacher() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();

  const isMobile = width < 600;
  const isTablet = width >= 600 && width < 1000;

  const cardWidth = isMobile
    ? '100%'
    : isTablet
      ? '48%'
      : '23.5%';

  const [filtroActivo, setFiltroActivo] = useState('Todos');

  const cursosFiltrados = cursos.filter(
    (curso) =>
      filtroActivo === 'Todos' || curso.nivel === filtroActivo
  );

  const gestionarCurso = (curso) => {
    navigation.navigate('CursoDetalleTeacher', { id: curso.id });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        isMobile && styles.contentMobile,
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* ENCABEZADO */}

      <Text style={styles.title}>Mis cursos</Text>

      <Text style={styles.subtitle}>
        Consulta y gestiona tus cursos y secciones asignadas.
      </Text>

      {/* FILTROS */}

      <View style={styles.filters}>
        {filtros.map((filtro) => {
          const activo = filtroActivo === filtro;

          return (
            <TouchableOpacity
              key={filtro}
              activeOpacity={0.8}
              onPress={() => setFiltroActivo(filtro)}
              style={[
                styles.filterButton,
                activo && styles.filterButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  activo && styles.filterTextActive,
                ]}
              >
                {filtro}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* CURSOS: DISEÑO PARA CELULAR */}

      {isMobile ? (
        <View style={styles.mobileList}>
          {cursosFiltrados.map((curso) => (
            <TouchableOpacity
              key={curso.id}
              style={styles.mobileCard}
              activeOpacity={0.8}
              onPress={() => gestionarCurso(curso)}
            >
              <View
                style={[
                  styles.mobileIcon,
                  { backgroundColor: curso.color },
                ]}
              >
                <Ionicons
                  name={curso.icono}
                  size={23}
                  color="#FFFFFF"
                />
              </View>

              <View style={styles.mobileInfo}>
                <Text style={styles.mobileName}>
                  {curso.nombre}
                </Text>

                <Text style={styles.mobileSection}>
                  {curso.seccion}
                </Text>

                <Text style={styles.mobileStudents}>
                  {curso.alumnos} estudiantes
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color="#94A3B8"
              />
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        /* CURSOS: DISEÑO PARA TABLET Y PC */

        <View style={styles.coursesGrid}>
          {cursosFiltrados.map((curso) => (
            <View
              key={curso.id}
              style={[
                styles.courseCard,
                { width: cardWidth },
              ]}
            >
              <View
                style={[
                  styles.courseCover,
                  { backgroundColor: curso.color },
                ]}
              >
                <Ionicons
                  name={curso.icono}
                  size={38}
                  color="#FFFFFF"
                />
              </View>

              <View style={styles.courseBody}>
                <Text style={styles.courseName}>
                  {curso.nombre}
                </Text>

                <Text style={styles.courseSectionDesktop}>
                  {curso.seccion}
                </Text>

                <Text style={styles.courseDescription}>
                  {curso.descripcion}
                </Text>

                <View style={styles.levelBadge}>
                  <Text style={styles.levelText}>
                    {curso.nivel}
                  </Text>
                </View>

                <Text style={styles.desktopStudents}>
                  {curso.alumnos} estudiantes
                </Text>

                <TouchableOpacity
                  style={styles.courseButton}
                  activeOpacity={0.8}
                  onPress={() => gestionarCurso(curso)}
                >
                  <Text style={styles.courseButtonText}>
                    Gestionar curso
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  /* CONTENEDOR */

  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },

  content: {
    padding: 28,
    paddingBottom: 40,
  },

  contentMobile: {
    padding: 16,
    paddingTop: 20,
    paddingBottom: 30,
  },

  /* ENCABEZADO */

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#263244',
  },

  subtitle: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    color: '#91A0B6',
    marginBottom: 20,
  },

  /* FILTROS */

  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },

  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8ECF3',
  },

  filterButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },

  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },

  filterTextActive: {
    color: '#FFFFFF',
  },

  /* LISTA PARA CELULAR */

  mobileList: {
    gap: 9,
  },

  mobileCard: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    paddingHorizontal: 11,
    paddingVertical: 10,
    gap: 11,
    borderWidth: 1,
    borderColor: '#EDF0F5',
  },

  mobileIcon: {
    width: 43,
    height: 43,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },

  mobileInfo: {
    flex: 1,
    gap: 2,
  },

  mobileName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#293548',
  },

  mobileSection: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },

  mobileStudents: {
    fontSize: 10,
    color: '#91A0B6',
  },

  /* GRID PARA TABLET Y PC */

  coursesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 20,
  },

  courseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8ECF3',
  },

  courseCover: {
    height: 98,
    justifyContent: 'center',
    alignItems: 'center',
  },

  courseBody: {
    padding: 16,
  },

  courseName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#293548',
  },

  courseSectionDesktop: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },

  courseDescription: {
    fontSize: 11,
    lineHeight: 16,
    color: '#8A97AA',
    marginTop: 7,
    minHeight: 48,
  },

  levelBadge: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
    backgroundColor: '#EEF4FF',
  },

  levelText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#2563EB',
  },

  desktopStudents: {
    marginTop: 8,
    fontSize: 11,
    color: '#91A0B6',
  },

  courseButton: {
    minHeight: 38,
    marginTop: 16,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
  },

  courseButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});