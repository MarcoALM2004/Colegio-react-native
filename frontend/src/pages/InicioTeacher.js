import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const azul = '#2863EB';
const verde = '#16A879';
const naranja = '#F59E38';
const morado = '#8067E8';
const texto = '#293548';
const gris = '#91A0B8';
const borde = '#E5EBF4';

export default function InicioTeacher() {
  const { width } = useWindowDimensions();
  const movil = width < 600;
  const tablet = width >= 600 && width < 1000;

  const estadisticas = [
    {
      icon: 'book-outline',
      color: azul,
      titulo: 'Cursos',
      valor: '5',
      detalle: 'Este ciclo escolar',
    },
    {
      icon: 'people-outline',
      color: verde,
      titulo: 'Estudiantes',
      valor: '142',
      detalle: 'En este periodo',
    },
    {
      icon: 'document-text-outline',
      color: naranja,
      titulo: 'Tareas por calificar',
      valor: '18',
      detalle: '6 vencen hoy',
    },
    {
      icon: 'bar-chart-outline',
      color: morado,
      titulo: 'Asistencia hoy',
      valor: '94%',
      detalle: '133 de 142 presentes',
    },
  ];

  const clases = [
    {
      icon: 'book-outline',
      color: azul,
      titulo: 'Comunicación',
      detalle: '5.º A · Aula 204',
      hora: '08:00',
      estado: 'En curso',
    },
    {
      icon: 'flask-outline',
      color: verde,
      titulo: 'Literatura',
      detalle: '4.º B · Laboratorio',
      hora: '10:00',
      estado: 'Próxima',
    },
    {
      icon: 'people-outline',
      color: morado,
      titulo: 'Literatura',
      detalle: '5.º A · Aula 204',
      hora: '12:00',
      estado: 'Después',
    },
  ];

  const pendientes = [
    {
      icon: 'document-text-outline',
      color: azul,
      titulo: 'Práctica: fracciones',
      detalle: 'Matemática · 5.º A',
      derecha: '8 entregas',
    },
    {
      icon: 'flask-outline',
      color: verde,
      titulo: 'Informe de laboratorio',
      detalle: 'Ciencia y Tecnología · 4.º B',
      derecha: '6 entregas',
    },
    {
      icon: 'document-outline',
      color: naranja,
      titulo: 'Ficha de ejercicios',
      detalle: 'Matemática · 4.º A',
      derecha: '4 entregas',
    },
  ];

  const anuncios = [
    {
      icon: 'information-circle-outline',
      color: verde,
      titulo: 'Comunicación',
      detalle: 'Suspensión de clases por temas de salud',
      derecha: 'Hace 8 min',
    },
    {
      icon: 'chatbubble-outline',
      color: azul,
      titulo: 'Literatura',
      detalle: 'Reunión con sus padres',
      derecha: 'Hace 30 min',
    },
    {
      icon: 'book-outline',
      color: naranja,
      titulo: 'Lenguajes',
      detalle: 'Tarea que se revisará en el examen',
      derecha: 'Hoy',
    },
  ];

  const asistencia = [
    {
      seccion: '5.º A',
      porcentaje: 96,
      color: verde,
      comentario: 'Excelente',
    },
    {
      seccion: '4.º B',
      porcentaje: 91,
      color: azul,
      comentario: 'Revisar tardanzas',
    },
    {
      seccion: '4.º A',
      porcentaje: 95,
      color: morado,
      comentario: 'Muy bien',
    },
  ];

  function TarjetaEstadistica({ item }) {
    return (
      <View
        style={[
          styles.tarjetaEstadistica,
          movil && styles.tarjetaEstadisticaMovil,
          { backgroundColor: item.color + '12' },
        ]}
      >
        <View
          style={[
            styles.iconoGrande,
            movil && styles.iconoGrandeMovil,
            { backgroundColor: item.color + '20' },
          ]}
        >
          <Ionicons
            name={item.icon}
            size={movil ? 20 : 22}
            color={item.color}
          />
        </View>

        <View style={styles.infoEstadistica}>
          <Text
            style={[
              styles.etiqueta,
              movil && styles.etiquetaMovil,
            ]}
          >
            {item.titulo}
          </Text>

          <Text
            style={[
              styles.valor,
              movil && styles.valorMovil,
            ]}
          >
            {item.valor}
          </Text>

          {!movil && (
            <Text style={styles.detalle}>
              {item.detalle}
            </Text>
          )}
        </View>
      </View>
    );
  }

  function Fila({ item, ultima = false }) {
    return (
      <View
        style={[
          styles.fila,
          movil && styles.filaMovil,
          ultima && styles.ultimaFila,
        ]}
      >
        <View
          style={[
            styles.iconoFila,
            movil && styles.iconoFilaMovil,
            { backgroundColor: item.color + '20' },
          ]}
        >
          <Ionicons
            name={item.icon}
            size={movil ? 17 : 18}
            color={item.color}
          />
        </View>

        <View style={styles.infoFila}>
          <Text style={styles.tituloFila}>
            {item.titulo}
          </Text>

          <Text style={styles.detalleFila}>
            {item.detalle}
          </Text>
        </View>

        <View
          style={[
            styles.derechaFila,
            movil && styles.derechaFilaMovil,
          ]}
        >
          {item.hora && (
            <Text style={styles.horaFila}>
              {item.hora}
            </Text>
          )}

          {item.derecha && (
            <Text style={styles.tituloFila}>
              {item.derecha}
            </Text>
          )}

          {item.estado && (
            <Text
              style={[
                styles.estado,
                { color: item.color },
                item.estado === 'En curso'
                  ? styles.estadoEnCurso
                  : styles.estadoProxima,
              ]}
            >
              {item.estado}
            </Text>
          )}
        </View>
      </View>
    );
  }

  function Panel({ titulo, accion, children }) {
    return (
      <View
        style={[
          styles.panel,
          movil && styles.panelMovil,
        ]}
      >
        <View style={styles.cabeceraPanel}>
          <Text
            style={[
              styles.tituloPanel,
              movil && styles.tituloPanelMovil,
            ]}
          >
            {titulo}
          </Text>

          <Text style={styles.accionPanel}>
            {accion}
          </Text>
        </View>

        {children}
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.contenedor}
      contentContainerStyle={[
        styles.contenido,
        {
          paddingHorizontal: movil ? 0 : tablet ? 22 : 30,
          paddingTop: movil ? 8 : 20,
          paddingBottom: movil ? 24 : 36,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* BIENVENIDA */}

      <Text style={styles.fecha}>
        12 de octubre de 2026
      </Text>

      <Text
        style={[
          styles.saludo,
          { fontSize: movil ? 22 : 28 },
        ]}
      >
        Buenos días, profesora Ana
      </Text>

      <Text
        style={[
          styles.subtitulo,
          movil && styles.subtituloMovil,
        ]}
      >
        Aquí tienes el resumen de tus clases y actividades de hoy.
      </Text>

      {/* ESTADÍSTICAS */}

      <View
        style={[
          styles.estadisticas,
          movil && styles.estadisticasMovil,
        ]}
      >
        {estadisticas.map((item) => (
          <View
            key={item.titulo}
            style={[
              styles.contenedorEstadistica,
              {
                width: movil
                  ? '48%'
                  : tablet
                  ? '48%'
                  : undefined,
                flex: movil || tablet ? undefined : 1,
              },
            ]}
          >
            <TarjetaEstadistica item={item} />
          </View>
        ))}
      </View>

      {/* PANELES */}

      <View
        style={[
          styles.columnas,
          movil && styles.columnaMovil,
        ]}
      >
        {/* COLUMNA IZQUIERDA */}

        <View
          style={[
            styles.columna,
            movil && styles.columnaCompleta,
          ]}
        >
          <Panel
            titulo="Próximas clases"
            accion="Ver todas"
          >
            {clases.map((item, i) => (
              <Fila
                key={item.titulo + i}
                item={item}
                ultima={i === clases.length - 1}
              />
            ))}
          </Panel>

          {!movil && (
            <Panel
              titulo="Asistencia por sección"
              accion="Ver reporte"
            >
              <Text style={styles.textoAsistencia}>
                Resumen de asistencia de hoy
              </Text>

              {asistencia.map((item, i) => (
                <View
                  key={item.seccion}
                  style={[
                    styles.filaAsistencia,
                    i === asistencia.length - 1 &&
                      styles.ultimaFila,
                  ]}
                >
                  <View style={styles.etiquetaAsistencia}>
                    <Text style={styles.tituloFila}>
                      {item.seccion}
                    </Text>

                    <Text style={styles.detalleFila}>
                      {item.comentario}
                    </Text>
                  </View>

                  <View style={styles.fondoBarra}>
                    <View
                      style={[
                        styles.barra,
                        {
                          width: `${item.porcentaje}%`,
                          backgroundColor: item.color,
                        },
                      ]}
                    />
                  </View>

                  <Text style={styles.porcentaje}>
                    {item.porcentaje}%
                  </Text>
                </View>
              ))}
            </Panel>
          )}
        </View>

        {/* COLUMNA DERECHA: SOLO ESCRITORIO */}

        {!movil && (
          <View style={styles.columna}>
            <Panel
              titulo="Pendiente de calificar"
              accion="Ver todas"
            >
              {pendientes.map((item, i) => (
                <Fila
                  key={item.titulo}
                  item={item}
                  ultima={i === pendientes.length - 1}
                />
              ))}
            </Panel>

            <Panel
              titulo="Anuncios a alumnos"
              accion="Ver todo"
            >
              {anuncios.map((item, i) => (
                <Fila
                  key={item.titulo}
                  item={item}
                  ultima={i === anuncios.length - 1}
                />
              ))}
            </Panel>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    minWidth: 0,
    width: '100%',
  },

  contenido: {
    flexGrow: 1,
    width: '100%',
  },

  fecha: {
    fontSize: 12,
    color: gris,
    marginBottom: 7,
  },

  saludo: {
    fontWeight: '800',
    color: texto,
    marginBottom: 6,
  },

  subtitulo: {
    fontSize: 13,
    color: gris,
    marginBottom: 26,
    lineHeight: 19,
  },

  subtituloMovil: {
    fontSize: 12,
    marginBottom: 17,
  },

  estadisticas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 22,
    width: '100%',
  },

  estadisticasMovil: {
    gap: 8,
    marginBottom: 20,
    justifyContent: 'space-between',
  },

  contenedorEstadistica: {
    minWidth: 0,
  },

  tarjetaEstadistica: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: borde,
  },

  tarjetaEstadisticaMovil: {
    minHeight: 62,
    height: 70,
    padding: 9,
    gap: 7,
    borderRadius: 11,
    borderWidth: 0,
  },

  iconoGrande: {
    width: 42,
    height: 42,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconoGrandeMovil: {
    width: 31,
    height: 31,
    borderRadius: 9,
  },

  infoEstadistica: {
    flex: 1,
    minWidth: 0,
  },

  etiqueta: {
    fontSize: 11,
    color: gris,
  },

  etiquetaMovil: {
    fontSize: 10,
    lineHeight: 13,
  },

  valor: {
    fontSize: 23,
    fontWeight: '800',
    color: texto,
    marginTop: 3,
  },

  valorMovil: {
    fontSize: 18,
    marginTop: 1,
  },

  detalle: {
    fontSize: 10,
    color: gris,
    marginTop: 4,
  },

  columnas: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    width: '100%',
  },

  columnaMovil: {
    flexDirection: 'column',
    width: '100%',
    alignSelf: 'stretch',
    gap: 14,
  },

  columna: {
    flex: 1,
    minWidth: 0,
    gap: 16,
  },

  columnaCompleta: {
    width: '100%',
    flex: 1,
    alignSelf: 'stretch',
  },

  panel: {
    width: '100%',
    minHeight: 300,
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: borde,
    padding: 18,
    paddingTop: 20,
    paddingBottom: 18,
  },

  panelMovil: {
    width: '100%',
    minHeight: 0,
    padding: 12,
    paddingTop: 14,
    paddingBottom: 12,
    borderRadius: 12,
  },

  cabeceraPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingBottom: 11,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: borde,
  },

  tituloPanel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    color: texto,
  },

  tituloPanelMovil: {
    fontSize: 13,
  },

  accionPanel: {
    color: azul,
    fontSize: 11,
    fontWeight: '600',
  },

  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    minHeight: 76,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3F8',
  },

  filaMovil: {
    gap: 9,
    minHeight: 65,
    paddingVertical: 10,
  },

  ultimaFila: {
    borderBottomWidth: 0,
    marginBottom: 0,
    paddingBottom: 6,
  },

  iconoFila: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },

  iconoFilaMovil: {
    width: 31,
    height: 31,
    borderRadius: 9,
  },

  infoFila: {
    flex: 1,
    minWidth: 0,
  },

  tituloFila: {
    fontSize: 11,
    fontWeight: '700',
    color: texto,
  },

  detalleFila: {
    fontSize: 10,
    color: gris,
    marginTop: 5,
    lineHeight: 15,
  },

  derechaFila: {
    alignItems: 'flex-end',
    maxWidth: 100,
    gap: 6,
  },

  derechaFilaMovil: {
    maxWidth: 78,
    gap: 5,
  },

  horaFila: {
    fontSize: 10,
    fontWeight: '600',
    color: texto,
  },

  estado: {
    fontSize: 9,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    overflow: 'hidden',
  },

  estadoEnCurso: {
    backgroundColor: '#D8F7E7',
  },

  estadoProxima: {
    backgroundColor: '#EDF2F8',
  },

  textoAsistencia: {
    color: gris,
    fontSize: 11,
    marginTop: 8,
    marginBottom: 6,
  },

  filaAsistencia: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 48,
    marginVertical: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3F8',
  },

  etiquetaAsistencia: {
    width: 76,
  },

  fondoBarra: {
    flex: 1,
    height: 9,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#EAF0F7',
  },

  barra: {
    height: '100%',
    borderRadius: 10,
  },

  porcentaje: {
    width: 36,
    textAlign: 'right',
    fontSize: 11,
    fontWeight: '700',
    color: texto,
  },
});