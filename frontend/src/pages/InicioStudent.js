import React from 'react';
import {View,Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

export default function InicioStudent() {

  const { width } = useWindowDimensions();

  const isMobile = width < 600;
  const isTablet = width >= 600 && width < 1000;

  let titleSize;

  if (isMobile) {
    titleSize = 24;
  } else {
    titleSize = 28;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          padding: isMobile
            ? 14
            : isTablet
            ? 20
            : 28,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* ENCABEZADO */}

      <Text style={styles.date}>
        08 de septiembre, 2026
      </Text>

      <Text
        style={[
          styles.title,
          {
            fontSize: titleSize,
          },
        ]}
      >
        Buenos días, Marco
      </Text>

      <Text style={styles.subtitle}>
        Continúa tu aprendizaje donde lo dejaste.
      </Text>

      {/* TARJETAS SUPERIORES */}

      <View
        style={[
          styles.statsContainer,
          {
            flexDirection: isMobile
              ? 'column'
              : 'row',

            gap: isMobile
              ? 10
              : 16,
          },
        ]}
      >

        {/* CURSOS DE HOY */}

        <View
          style={[
            styles.statCard,
            {
              width: isMobile
                ? '100%'
                : undefined,

              flex: isMobile
                ? undefined
                : 1,
            },
          ]}
        >

          <View
            style={[
              styles.iconBox,
              styles.blueIcon,
            ]}
          >
            <Ionicons
              name="book-outline"
              size={22}
              color="#4A8AF4"
            />
          </View>

          <View style={styles.statInfo}>

            <Text style={styles.statLabel}>
              Cursos de hoy
            </Text>

            <Text style={styles.statValue}>
              3
            </Text>

          </View>

        </View>


        {/* HORAS POR DÍA */}

        <View
          style={[
            styles.statCard,
            {
              width: isMobile
                ? '100%'
                : undefined,

              flex: isMobile
                ? undefined
                : 1,
            },
          ]}
        >

          <View
            style={[
              styles.iconBox,
              styles.orangeIcon,
            ]}
          >
            <Ionicons
              name="time-outline"
              size={22}
              color="#F2A93B"
            />
          </View>

          <View style={styles.statInfo}>

            <Text style={styles.statLabel}>
              Horas por día
            </Text>

            <Text style={styles.statValue}>
              6 h
            </Text>

          </View>

        </View>


        {/* PROFESORES */}

        <View
          style={[
            styles.statCard,
            {
              width: isMobile
                ? '100%'
                : undefined,

              flex: isMobile
                ? undefined
                : 1,
            },
          ]}
        >

          <View
            style={[
              styles.iconBox,
              styles.purpleIcon,
            ]}
          >
            <Ionicons
              name="school-outline"
              size={22}
              color="#8067E8"
            />
          </View>

          <View style={styles.statInfo}>

            <Text style={styles.statLabel}>
              Profesores
            </Text>

            <Text style={styles.statValue}>
              8
            </Text>

          </View>

        </View>

      </View>

      {/* CURSOS DE HOY */}

      <View style={styles.mainCard}>

        <View
          style={[
            styles.cardHeader,
            {
              flexDirection: isMobile
                ? 'column'
                : 'row',
            },
          ]}
        >

          <View
            style={[
              styles.cardHeaderInfo,
              {
                flex: isMobile
                  ? undefined
                  : 1,
              },
            ]}
          >

            <Text style={styles.sectionTitle}>
              Cursos de hoy
            </Text>

            <Text style={styles.sectionSubtitle}>
              Revisa tus clases programadas para hoy.
            </Text>

          </View>


          <TouchableOpacity
            style={[
              styles.viewAllButton,
              {
                alignSelf: isMobile
                  ? 'flex-end'
                  : 'auto',

                marginTop: isMobile
                  ? 8
                  : 0,
              },
            ]}
          >
            <Text style={styles.viewAll}>
              Ver todos
            </Text>
          </TouchableOpacity>

        </View>


        {/* COMUNICACIÓN */}

        <View style={styles.courseItem}>

          <View
            style={[
              styles.courseIcon,
              styles.blueCourse,
            ]}
          >
            <Ionicons
              name="globe-outline"
              size={19}
              color="#20A875"
            />
          </View>

          <View style={styles.courseInfo}>

            <Text
              style={styles.courseName}
              numberOfLines={1}
            >
              Comunicación
            </Text>

            <Text
              style={styles.courseDetails}
              numberOfLines={1}
            >
              08:00 - 10:00 · Aula 204
            </Text>

          </View>

          <Text style={styles.courseTime}>
            Ahora
          </Text>

        </View>


        {/* COMPUTACIÓN */}

        <View style={styles.courseItem}>

          <View
            style={[
              styles.courseIcon,
              styles.purpleCourse,
            ]}
          >
            <Ionicons
              name="laptop-outline"
              size={19}
              color="#6366D9"
            />
          </View>

          <View style={styles.courseInfo}>

            <Text
              style={styles.courseName}
              numberOfLines={1}
            >
              Computación
            </Text>

            <Text
              style={styles.courseDetails}
              numberOfLines={1}
            >
              10:30 - 12:30 · Aula 305
            </Text>

          </View>

          <Text style={styles.courseTime}>
            Próximo
          </Text>

        </View>


        {/* EDUCACIÓN FÍSICA */}

        <View style={styles.courseItem}>

          <View
            style={[
              styles.courseIcon,
              styles.greenCourse,
            ]}
          >
            <Ionicons
              name="barbell-outline"
              size={19}
              color="#EF4444"
            />
          </View>

          <View style={styles.courseInfo}>

            <Text
              style={styles.courseName}
              numberOfLines={1}
            >
              Educación Física
            </Text>

            <Text
              style={styles.courseDetails}
              numberOfLines={1}
            >
              14:00 - 16:00 · Aula 201
            </Text>

          </View>

          <Text style={styles.courseTime}>
            Próximo
          </Text>

        </View>

      </View>

      {/* ACTIVIDADES Y ANUNCIOS */}

      <View style={styles.mainCard}>

        <View
          style={[
            styles.cardHeader,
            {
              flexDirection: isMobile
                ? 'column'
                : 'row',
            },
          ]}
        >

          <View
            style={[
              styles.cardHeaderInfo,
              {
                flex: isMobile
                  ? undefined
                  : 1,
              },
            ]}
          >

            <Text style={styles.sectionTitle}>
              Actividades y anuncios
            </Text>

            <Text style={styles.sectionSubtitle}>
              Revisa las novedades de tus cursos.
            </Text>

          </View>


          <TouchableOpacity
            style={[
              styles.viewAllButton,
              {
                alignSelf: isMobile
                  ? 'flex-end'
                  : 'auto',

                marginTop: isMobile
                  ? 8
                  : 0,
              },
            ]}
          >
            <Text style={styles.viewAll}>
              Ver todo
            </Text>
          </TouchableOpacity>

        </View>


        {/* TAREA */}

        <View style={styles.activityItem}>

          <View
            style={[
              styles.activityIcon,
              styles.redActivity,
            ]}
          >
            <Ionicons
              name="document-text-outline"
              size={19}
              color="#F16A76"
            />
          </View>

          <View style={styles.activityInfo}>

            <Text
              style={styles.activityTitle}
              numberOfLines={1}
            >
              Tarea de comunicación
            </Text>

            <Text
              style={styles.activityDescription}
              numberOfLines={1}
            >
              Entrega mañana · comunicación
            </Text>

          </View>

          <Text style={styles.deadline}>
            Mañana
          </Text>

        </View>


        {/* ANUNCIO */}

        <View style={styles.activityItem}>

          <View
            style={[
              styles.activityIcon,
              styles.blueActivity,
            ]}
          >
            <Ionicons
              name="megaphone-outline"
              size={19}
              color="#4A8AF4"
            />
          </View>

          <View style={styles.activityInfo}>

            <Text
              style={styles.activityTitle}
              numberOfLines={1}
            >
              Anuncio del profesor
            </Text>

            <Text
              style={styles.activityDescription}
              numberOfLines={1}
            >
              Nueva información sobre la próxima clase
            </Text>

          </View>

          <Text style={styles.deadline}>
            Hoy
          </Text>

        </View>


        {/* EXAMEN */}

        <View style={styles.activityItem}>

          <View
            style={[
              styles.activityIcon,
              styles.orangeActivity,
            ]}
          >
            <Ionicons
              name="clipboard-outline"
              size={19}
              color="#F2A93B"
            />
          </View>

          <View style={styles.activityInfo}>

            <Text
              style={styles.activityTitle}
              numberOfLines={1}
            >
              Examen de Matematicas
            </Text>

            <Text
              style={styles.activityDescription}
              numberOfLines={1}
            >
              Desarrollo de Software · Viernes
            </Text>

          </View>

          <Text style={styles.deadline}>
            Viernes
          </Text>

        </View>

      </View>

    </ScrollView>
  );
}


const styles = StyleSheet.create({

  /* CONTENEDOR */

  container: {
    flex: 1,
    backgroundColor: '#F5F7F8',
  },


  content: {
    paddingBottom: 40,
  },

  /* ENCABEZADO */

  date: {
    fontSize: 12,
    color: '#91A0B6',
    marginBottom: 5,
  },


  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#263244',
  },


  subtitle: {
    marginTop: 8,
    fontSize: 13,
    color: '#91A0B6',
  },

  /* ESTADÍSTICAS */

  statsContainer: {
    marginTop: 28,
    marginBottom: 20,
  },


  statCard: {
    minHeight: 82,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: '#E8ECF3',
  },


  statInfo: {
    flex: 1,
  },


  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },


  blueIcon: {
    backgroundColor: '#EAF2FF',
  },


  orangeIcon: {
    backgroundColor: '#FFF4DD',
  },


  purpleIcon: {
    backgroundColor: '#F0EBFF',
  },


  statLabel: {
    fontSize: 12,
    color: '#91A0B6',
  },


  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#263244',
    marginTop: 2,
  },

  /* TARJETAS PRINCIPALES */

  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8ECF3',
    padding: 22,
    marginBottom: 20,
  },


  cardHeader: {
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },


  cardHeaderInfo: {
    minWidth: 0,
  },


  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#293548',
  },


  sectionSubtitle: {
    fontSize: 12,
    color: '#91A0B6',
    marginTop: 5,
  },


  viewAllButton: {
    paddingVertical: 2,
  },


  viewAll: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '600',
  },

  /* CURSOS */

  courseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#EEF1F5',
  },


  courseIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },


  blueCourse: {
    backgroundColor: '#20a87630',
  },


  purpleCourse: {
    backgroundColor: '#F0EBFF',
  },


  greenCourse: {
    backgroundColor: '#FFE1E1',
  },


  courseInfo: {
    flex: 1,
    minWidth: 0,
  },


  courseName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#293548',
  },


  courseDetails: {
    fontSize: 11,
    color: '#91A0B6',
    marginTop: 4,
  },


  courseTime: {
    fontSize: 11,
    color: '#718096',
    marginLeft: 8,
  },

  /* ACTIVIDADES */

  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#EEF1F5',
  },


  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },


  redActivity: {
    backgroundColor: '#FFE9EC',
  },


  blueActivity: {
    backgroundColor: '#EAF2FF',
  },


  orangeActivity: {
    backgroundColor: '#FFF4DD',
  },


  activityInfo: {
    flex: 1,
    minWidth: 0,
  },


  activityTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#293548',
  },


  activityDescription: {
    fontSize: 11,
    color: '#91A0B6',
    marginTop: 4,
  },


  deadline: {
    fontSize: 11,
    color: '#718096',
    marginLeft: 8,
  },

});