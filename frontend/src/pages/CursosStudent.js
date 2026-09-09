import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

export default function CursoStudent() {

    const { width } = useWindowDimensions();

  const isMobile = width < 600;
  const isTablet = width >= 600 && width < 1000;
  
  const cardWidth = isMobile
  ? '100%'
  : isTablet
  ? '48%'
  : '23.5%';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >

      {/* ENCABEZADO */}

      <Text style={styles.title}>
        Mis Cursos
      </Text>

      <Text style={styles.subtitle}>
        Aquí encontrarás todos tus cursos del año escolar actual.
      </Text>


      {/* CURSOS */}

      <View style={styles.coursesGrid}>

        {/* MATEMÁTICA */}

        <View
          style={[
            styles.courseCard,
            {
              width: cardWidth,
            },
          ]}
        >

          <View style={[styles.courseCover, styles.coverBlue]}>
            <Ionicons
              name="book-outline"
              size={38}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.courseBody}>

            <Text style={styles.courseName}>
              Matemática
            </Text>

            <Text style={styles.courseDescription}>
              Desarrolla tu pensamiento lógico y resuelve problemas.
            </Text>

            <TouchableOpacity style={styles.courseButton}>
              <Text style={styles.courseButtonText}>
                Ver curso
              </Text>

              <Ionicons
                name="arrow-forward"
                size={16}
                color="#FFFFFF"
              />
            </TouchableOpacity>

          </View>

        </View>


        {/* CIENCIA Y TECNOLOGÍA */}

        <View
          style={[
            styles.courseCard,
            {
              width: cardWidth,
            },
          ]}
        >

          <View style={[styles.courseCover, styles.coverPurple]}>
            <Ionicons
              name="flask-outline"
              size={38}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.courseBody}>

            <Text style={styles.courseName}>
              Ciencia y Tecnología
            </Text>

            <Text style={styles.courseDescription}>
              Explora el mundo a través de la ciencia.
            </Text>

            <TouchableOpacity style={styles.courseButton}>
              <Text style={styles.courseButtonText}>
                Ver curso
              </Text>

              <Ionicons
                name="arrow-forward"
                size={16}
                color="#FFFFFF"
              />
            </TouchableOpacity>

          </View>

        </View>


        {/* COMUNICACIÓN */}

        <View
          style={[
            styles.courseCard,
            {
              width: cardWidth,
            },
          ]}
        >

          <View style={[styles.courseCover, styles.coverGreen]}>
            <Ionicons
              name="globe-outline"
              size={38}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.courseBody}>

            <Text style={styles.courseName}>
              Comunicación
            </Text>

            <Text style={styles.courseDescription}>
              Mejora tus habilidades de lectura, escritura y expresión.
            </Text>

            <TouchableOpacity style={styles.courseButton}>
              <Text style={styles.courseButtonText}>
                Ver curso
              </Text>

              <Ionicons
                name="arrow-forward"
                size={16}
                color="#FFFFFF"
              />
            </TouchableOpacity>

          </View>

        </View>


        {/* ARTE Y CULTURA */}

        <View
          style={[
            styles.courseCard,
            {
              width: cardWidth,
            },
          ]}
        >

          <View style={[styles.courseCover, styles.coverOrange]}>
            <Ionicons
              name="color-palette-outline"
              size={38}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.courseBody}>

            <Text style={styles.courseName}>
              Arte y Cultura
            </Text>

            <Text style={styles.courseDescription}>
              Desarrolla tu creatividad y aprecia el arte.
            </Text>

            <TouchableOpacity style={styles.courseButton}>
              <Text style={styles.courseButtonText}>
                Ver curso
              </Text>

              <Ionicons
                name="arrow-forward"
                size={16}
                color="#FFFFFF"
              />
            </TouchableOpacity>

          </View>

        </View>


        {/* EDUCACIÓN FÍSICA */}

        <View
          style={[
            styles.courseCard,
            {
              width: cardWidth,
            },
          ]}
        >

          <View style={[styles.courseCover, styles.coverRed]}>
            <Ionicons
              name="barbell-outline"
              size={38}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.courseBody}>

            <Text style={styles.courseName}>
              Educación Física
            </Text>

            <Text style={styles.courseDescription}>
              Cuida tu salud y desarrolla un estilo de vida activo.
            </Text>

            <TouchableOpacity style={styles.courseButton}>
              <Text style={styles.courseButtonText}>
                Ver curso
              </Text>

              <Ionicons
                name="arrow-forward"
                size={16}
                color="#FFFFFF"
              />
            </TouchableOpacity>

          </View>

        </View>


        {/* PERSONAL SOCIAL */}

        <View
          style={[
            styles.courseCard,
            {
              width: cardWidth,
            },
          ]}
        >
          <View style={[styles.courseCover, styles.coverCyan]}>
            <Ionicons
              name="people-outline"
              size={38}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.courseBody}>

            <Text style={styles.courseName}>
              Personal Social
            </Text>

            <Text style={styles.courseDescription}>
              Conoce tu entorno y participa en la sociedad.
            </Text>

            <TouchableOpacity style={styles.courseButton}>
              <Text style={styles.courseButtonText}>
                Ver curso
              </Text>

              <Ionicons
                name="arrow-forward"
                size={16}
                color="#FFFFFF"
              />
            </TouchableOpacity>

          </View>

        </View>


        {/* INGLÉS */}

        <View
          style={[
            styles.courseCard,
            {
              width: cardWidth,
            },
          ]}
        >

          <View style={[styles.courseCover, styles.coverPink]}>
            <Ionicons
              name="language-outline"
              size={38}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.courseBody}>

            <Text style={styles.courseName}>
              Inglés
            </Text>

            <Text style={styles.courseDescription}>
              Mejora tu comunicación en un mundo global.
            </Text>

            <TouchableOpacity style={styles.courseButton}>
              <Text style={styles.courseButtonText}>
                Ver curso
              </Text>

              <Ionicons
                name="arrow-forward"
                size={16}
                color="#FFFFFF"
              />
            </TouchableOpacity>

          </View>

        </View>


        {/* COMPUTACIÓN */}

        <View
          style={[
            styles.courseCard,
            {
              width: cardWidth,
            },
          ]}
        >

          <View style={[styles.courseCover, styles.coverIndigo]}>
            <Ionicons
              name="laptop-outline"
              size={38}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.courseBody}>

            <Text style={styles.courseName}>
              Computación
            </Text>

            <Text style={styles.courseDescription}>
              Aprende y crea con la tecnología del futuro.
            </Text>

            <TouchableOpacity style={styles.courseButton}>
              <Text style={styles.courseButtonText}>
                Ver curso
              </Text>

              <Ionicons
                name="arrow-forward"
                size={16}
                color="#FFFFFF"
              />
            </TouchableOpacity>

          </View>

        </View>

      </View>

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


  /* ENCABEZADO */

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#263244',
  },

  subtitle: {
    marginTop: 8,
    fontSize: 13,
    color: '#91A0B6',
    marginBottom: 28,
  },


  /* GRID */

  coursesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 20,
  },


  /* TARJETA */

  courseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8ECF3',
    marginBottom: 0,
  },


  /* PORTADA */

  courseCover: {
    height: 98,
    justifyContent: 'center',
    alignItems: 'center',
  },

  coverBlue: {
    backgroundColor: '#4A8AF4',
  },

  coverPurple: {
    backgroundColor: '#8067E8',
  },

  coverGreen: {
    backgroundColor: '#20A875',
  },

  coverOrange: {
    backgroundColor: '#F2A93B',
  },

  coverRed: {
    backgroundColor: '#EF4444',
  },

  coverCyan: {
    backgroundColor: '#20B7C5',
  },

  coverPink: {
    backgroundColor: '#E9579D',
  },

  coverIndigo: {
    backgroundColor: '#6366D9',
  },


  /* CONTENIDO */

  courseBody: {
    padding: 16,
  },

  courseName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#293548',
  },

  courseDescription: {
    fontSize: 11,
    lineHeight: 16,
    color: '#8A97AA',
    marginTop: 7,
    minHeight: 34,
  },


  /* BOTÓN */

  courseButton: {
    height: 38,
    marginTop: 16,
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