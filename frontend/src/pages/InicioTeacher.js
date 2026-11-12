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

export default function InicioTeacher({ usuario = {} }) {
  const { width } = useWindowDimensions();
  const movil = width < 600;
  const tablet = width >= 600 && width < 1000;

  const nombreDocente = [
    usuario.nombres || usuario.nombre || '',
    usuario.apellidos || usuario.apellido || '',
  ]
    .filter(Boolean)
    .join(' ')
    .trim() || 'Docente';

  const estadisticas = [
    {
      icon: 'book',
      color: azul,
      titulo: 'Cursos asignados',
      valor: '5',
      detalle: 'Este ciclo escolar',
    },
    {
      icon: 'people',
      color: verde,
      titulo: 'Estudiantes',
      valor: '142',
      detalle: 'En este periodo',
    },
    {
      icon: 'clipboard',
      color: naranja,
      titulo: 'Por calificar',
      valor: '18',
      detalle: '6 vencen hoy',
    },
    {
      icon: 'pie-chart',
      color: morado,
      titulo: 'Asistencia de hoy',
      valor: '94%',
      detalle: '133 de 142 presentes',
    },
  ];

  const clases = [
    {
      icon: 'book',
      color: azul,
      titulo: 'Comunicación',
      detalle: '5.º A · Aula 204',
      hora: '08:00',
      estado: 'En curso',
    },
    {
      icon: 'flask',
      color: verde,
      titulo: 'Literatura',
      detalle: '4.º B · Laboratorio',
      hora: '10:00',
      estado: 'Próxima',
    },
    {
      icon: 'people',
      color: morado,
      titulo: 'Literatura',
      detalle: '5.º A · Aula 204',
      hora: '12:00',
      estado: 'Después',
    },
  ];

  const pendientes = [
    {
      icon: 'document-text',
      color: azul,
      titulo: 'Práctica: fracciones',
      detalle: 'Matemática · 5.º A',
      derecha: '8 entregas',
    },
    {
      icon: 'flask',
      color: verde,
      titulo: 'Informe de laboratorio',
      detalle: 'Ciencia y Tecnología · 4.º B',
      derecha: '6 entregas',
    },
    {
      icon: 'document',
      color: naranja,
      titulo: 'Ficha de ejercicios',
      detalle: 'Matemática · 4.º A',
      derecha: '4 entregas',
    },
  ];

  const anuncios = [
    {
      icon: 'information-circle',
      color: verde,
      titulo: 'Comunicación',
      detalle: 'Suspensión de clases por temas de salud',
      derecha: 'Hace 8 min',
    },
    {
      icon: 'chatbubble',
      color: azul,
      titulo: 'Literatura',
      detalle: 'Reunión con sus padres',
      derecha: 'Hace 30 min',
    },
    {
      icon: 'book',
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
      <View style={styles.tarjetaEstadistica}>
        <View
          style={[
            styles.iconoGrande,
            { backgroundColor: item.color + '20' },
          ]}
        >
          <Ionicons name={item.icon} size={22} color={item.color} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.etiqueta}>{item.titulo}</Text>
          <Text style={styles.valor}>{item.valor}</Text>
          <Text style={styles.detalle}>{item.detalle}</Text>
        </View>
      </View>
    );
  }

  function Fila({ item, ultima = false }) {
    return (
      <View style={[styles.fila, ultima && styles.ultimaFila]}>
        <View
          style={[
            styles.iconoFila,
            { backgroundColor: item.color + '20' },
          ]}
        >
          <Ionicons name={item.icon} size={18} color={item.color} />
        </View>

        <View style={styles.infoFila}>
          <Text style={styles.tituloFila}>{item.titulo}</Text>
          <Text style={styles.detalleFila}>{item.detalle}</Text>
        </View>

        <View style={styles.derechaFila}>
          {item.hora && (
            <Text style={styles.tituloFila}>{item.hora}</Text>
          )}

          {item.derecha && (
            <Text style={styles.tituloFila}>{item.derecha}</Text>
          )}

          {item.estado && (
            <Text
              style={[
                styles.estado,
                {
                  color: item.color,
                  backgroundColor: item.color + '20',
                },
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
      <View style={styles.panel}>
        <View style={styles.cabeceraPanel}>
          <Text style={styles.tituloPanel}>{titulo}</Text>
          <Text style={styles.accionPanel}>{accion}</Text>
        </View>
        {children}
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.contenedor}
      contentContainerStyle={{
        paddingHorizontal: movil ? 14 : tablet ? 22 : 30,
        paddingTop: movil ? 14 : 20,
        paddingBottom: 36,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.fecha}>
        {new Date().toLocaleDateString('es-PE', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      </Text>

      <Text style={[styles.saludo, { fontSize: movil ? 23 : 28 }]}>
        Buenos días, {nombreDocente}
      </Text>

      <Text style={styles.subtitulo}>
        Aquí tienes el resumen de tus clases y actividades de hoy.
      </Text>

      <View style={styles.estadisticas}>
        {estadisticas.map((item) => (
          <View
            key={item.titulo}
            style={{
              width: movil ? '100%' : tablet ? '48%' : undefined,
              flex: movil || tablet ? undefined : 1,
            }}
          >
            <TarjetaEstadistica item={item} />
          </View>
        ))}
      </View>

      <View style={[styles.columnas, movil && styles.columnaMovil]}>
        <View style={styles.columna}>
          <Panel titulo="Próximas clases" accion="Ver horario">
            {clases.map((item, i) => (
              <Fila
                key={item.titulo + i}
                item={item}
                ultima={i === clases.length - 1}
              />
            ))}
          </Panel>

          {!movil && (
            <Panel titulo="Asistencia por sección" accion="Ver reporte">
              <Text style={styles.textoAsistencia}>
                Resumen de asistencia de hoy
              </Text>

              {asistencia.map((item, i) => (
                <View
                  key={item.seccion}
                  style={[
                    styles.filaAsistencia,
                    i === asistencia.length - 1 && styles.ultimaFila,
                  ]}
                >
                  <View style={styles.etiquetaAsistencia}>
                    <Text style={styles.tituloFila}>{item.seccion}</Text>
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

        {!movil && (
          <View style={styles.columna}>
            <Panel titulo="Pendiente de calificar" accion="Ver todas">
              {pendientes.map((item, i) => (
                <Fila
                  key={item.titulo}
                  item={item}
                  ultima={i === pendientes.length - 1}
                />
              ))}
            </Panel>

            <Panel titulo="Anuncios a alumnos" accion="Ver todo">
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
  },
  estadisticas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 22,
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
  iconoGrande: {
    width: 42,
    height: 42,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  etiqueta: {
    fontSize: 11,
    color: gris,
  },
  valor: {
    fontSize: 23,
    fontWeight: '800',
    color: texto,
    marginTop: 3,
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
  },
  columnaMovil: {
    flexDirection: 'column',
  },
  columna: {
    flex: 1,
    minWidth: 0,
    gap: 16,
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
    paddingBottom: 0,
  },
  cabeceraPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingBottom: 13,
    marginBottom: 9,
    borderBottomWidth: 1,
    borderBottomColor: borde,
  },
  tituloPanel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    color: texto,
  },
  accionPanel: {
    color: azul,
    fontSize: 11,
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
  ultimaFila: {
    borderBottomWidth: 0,
    marginBottom: 0,
    paddingBottom: 12,
  },
  iconoFila: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
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
  estado: {
    fontSize: 9,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    overflow: 'hidden',
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