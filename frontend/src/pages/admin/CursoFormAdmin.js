import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import AdminDashboard from '../../components/AdminDashboard';
import { useAdminData } from '../../context/AdminDataContext';
import {
  Button,
  Card,
  Field,
  PageScroll,
  SelectField,
} from '../../components/admin/AdminUI';
import {
  NIVELES,
  ROLES,
} from '../../data/adminMockData';
import {
  colors,
  toneList,
  tones,
} from '../../theme/adminTheme';

const GRADOS = {
  Primaria: ['1°', '2°', '3°', '4°', '5°', '6°'],
  Secundaria: ['1°', '2°', '3°', '4°', '5°'],
};

const SECCIONES = ['A', 'B', 'C'];

// Iconos organizados por asignaturas escolares.
// Se usan nombres válidos de Ionicons.
const ICONOS_CURSOS = [
  // Comunicación e idiomas
  { nombre: 'book-outline', etiqueta: 'Comunicación' },
  { nombre: 'library-outline', etiqueta: 'Literatura' },
  { nombre: 'reader-outline', etiqueta: 'Lectura' },
  { nombre: 'pencil-outline', etiqueta: 'Escritura' },
  { nombre: 'document-text-outline', etiqueta: 'Redacción' },
  { nombre: 'chatbubbles-outline', etiqueta: 'Lenguaje' },
  { nombre: 'language-outline', etiqueta: 'Inglés' },
  { nombre: 'globe-outline', etiqueta: 'Francés' },
  { nombre: 'mic-outline', etiqueta: 'Oratoria' },
  { nombre: 'newspaper-outline', etiqueta: 'Periodismo' },
  { nombre: 'chatbox-ellipses-outline', etiqueta: 'Debate' },
  { nombre: 'bookmarks-outline', etiqueta: 'Comprensión' },

  // Matemáticas
  { nombre: 'calculator-outline', etiqueta: 'Matemática' },
  { nombre: 'grid-outline', etiqueta: 'Álgebra' },
  { nombre: 'shapes-outline', etiqueta: 'Geometría' },
  { nombre: 'analytics-outline', etiqueta: 'Aritmética' },
  { nombre: 'stats-chart-outline', etiqueta: 'Estadística' },
  { nombre: 'trending-up-outline', etiqueta: 'Trigonometría' },
  { nombre: 'pie-chart-outline', etiqueta: 'Probabilidad' },
  { nombre: 'infinite-outline', etiqueta: 'Razonamiento Mat.' },

  // Ciencias naturales
  { nombre: 'flask-outline', etiqueta: 'Química' },
  { nombre: 'flask-outline', etiqueta: 'Química II' },
  { nombre: 'nuclear-outline', etiqueta: 'Física' },
  { nombre: 'planet-outline', etiqueta: 'Física II' },
  { nombre: 'leaf-outline', etiqueta: 'Biología' },
  { nombre: 'flower-outline', etiqueta: 'Botánica' },
  { nombre: 'paw-outline', etiqueta: 'Zoología' },
  { nombre: 'earth-outline', etiqueta: 'Ciencia y Tec.' },
  { nombre: 'water-outline', etiqueta: 'Ecología' },
  { nombre: 'sunny-outline', etiqueta: 'Medio Ambiente' },
  { nombre: 'medical-outline', etiqueta: 'Anatomía' },
  { nombre: 'pulse-outline', etiqueta: 'Salud' },
  { nombre: 'thermometer-outline', etiqueta: 'Termodinámica' },
  { nombre: 'flash-outline', etiqueta: 'Electricidad' },
  { nombre: 'magnet-outline', etiqueta: 'Magnetismo' },
  { nombre: 'moon-outline', etiqueta: 'Astronomía' },

  // Ciencias sociales
  { nombre: 'time-outline', etiqueta: 'Historia' },
  { nombre: 'earth-outline', etiqueta: 'Geografía' },
  { nombre: 'map-outline', etiqueta: 'Historia Perú' },
  { nombre: 'globe-outline', etiqueta: 'Historia Univ.' },
  { nombre: 'people-outline', etiqueta: 'Ciencias Soc.' },
  { nombre: 'person-outline', etiqueta: 'Psicología' },
  { nombre: 'bulb-outline', etiqueta: 'Filosofía' },
  { nombre: 'scale-outline', etiqueta: 'Cívica' },
  { nombre: 'flag-outline', etiqueta: 'Ciudadanía' },
  { nombre: 'business-outline', etiqueta: 'Economía' },
  { nombre: 'compass-outline', etiqueta: 'Geopolítica' },
  { nombre: 'people-circle-outline', etiqueta: 'Sociología' },

  // Educación artística
  { nombre: 'color-palette-outline', etiqueta: 'Arte' },
  { nombre: 'brush-outline', etiqueta: 'Pintura' },
  { nombre: 'create-outline', etiqueta: 'Dibujo' },
  { nombre: 'musical-notes-outline', etiqueta: 'Música' },
  { nombre: 'mic-outline', etiqueta: 'Canto' },
  { nombre: 'film-outline', etiqueta: 'Teatro' },
  { nombre: 'camera-outline', etiqueta: 'Fotografía' },
  { nombre: 'images-outline', etiqueta: 'Diseño' },
  { nombre: 'videocam-outline', etiqueta: 'Audiovisual' },
  { nombre: 'sparkles-outline', etiqueta: 'Creatividad' },
  { nombre: 'cut-outline', etiqueta: 'Manualidades' },
  { nombre: 'shirt-outline', etiqueta: 'Danza' },

  // Tecnología
  { nombre: 'desktop-outline', etiqueta: 'Computación' },
  { nombre: 'laptop-outline', etiqueta: 'Informática' },
  { nombre: 'code-slash-outline', etiqueta: 'Programación' },
  { nombre: 'hardware-chip-outline', etiqueta: 'Robótica' },
  { nombre: 'server-outline', etiqueta: 'Sistemas' },
  { nombre: 'wifi-outline', etiqueta: 'Redes' },
  { nombre: 'terminal-outline', etiqueta: 'Algoritmos' },
  { nombre: 'construct-outline', etiqueta: 'Tecnología' },
  { nombre: 'game-controller-outline', etiqueta: 'Videojuegos' },
  { nombre: 'phone-portrait-outline', etiqueta: 'Apps Móviles' },
  { nombre: 'globe-outline', etiqueta: 'Internet' },
  { nombre: 'shield-checkmark-outline', etiqueta: 'Seguridad Dig.' },

  // Educación física
  { nombre: 'barbell-outline', etiqueta: 'Educación Fís.' },
  { nombre: 'football-outline', etiqueta: 'Fútbol' },
  { nombre: 'basketball-outline', etiqueta: 'Básquet' },
  { nombre: 'tennisball-outline', etiqueta: 'Tenis' },
  { nombre: 'bicycle-outline', etiqueta: 'Ciclismo' },
  { nombre: 'walk-outline', etiqueta: 'Atletismo' },
  { nombre: 'fitness-outline', etiqueta: 'Gimnasia' },
  { nombre: 'trophy-outline', etiqueta: 'Deportes' },
  { nombre: 'stopwatch-outline', etiqueta: 'Resistencia' },
  { nombre: 'heart-outline', etiqueta: 'Vida Saludable' },
  { nombre: 'nutrition-outline', etiqueta: 'Nutrición' },
  { nombre: 'medal-outline', etiqueta: 'Competencias' },

  // Formación personal
  { nombre: 'school-outline', etiqueta: 'Tutoría' },
  { nombre: 'heart-outline', etiqueta: 'Valores' },
  { nombre: 'hand-left-outline', etiqueta: 'Religión' },
  { nombre: 'people-outline', etiqueta: 'Convivencia' },
  { nombre: 'happy-outline', etiqueta: 'Desarrollo Pers.' },
  { nombre: 'shield-checkmark-outline', etiqueta: 'Ética' },
  { nombre: 'person-circle-outline', etiqueta: 'Orientación' },
  { nombre: 'bulb-outline', etiqueta: 'Emprendimiento' },
  { nombre: 'briefcase-outline', etiqueta: 'Educación Trab.' },
  { nombre: 'cash-outline', etiqueta: 'Finanzas' },
  { nombre: 'construct-outline', etiqueta: 'Talleres' },
  { nombre: 'star-outline', etiqueta: 'Otros Cursos' },
];

export default function CursoFormAdmin() {
  const navigation = useNavigation();
  const params = useRoute().params || {};

  const {
    getCourse,
    users,
    addCourse,
    updateCourse,
  } = useAdminData();

  const existente = params.id
    ? getCourse(params.id)
    : null;

  const editando = !!existente;

  const [form, setForm] = useState({
    nombre: existente?.nombre || '',
    nivel: existente?.nivel || 'Primaria',
    grado: existente?.grado || '1°',
    seccion: existente?.seccion || 'A',
    docenteId: existente?.docenteId ?? null,
    descripcion: existente?.descripcion || '',
    tono:
      existente?.tono ||
      existente?.color ||
      'blue',
    icono: existente?.icono || 'book-outline',
  });

  const [busquedaDocente, setBusquedaDocente] =
    useState('');

  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const set = (campo) => (valor) => {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const cambiarNivel = (nivel) => {
    setForm((prev) => ({
      ...prev,
      nivel,
      grado: GRADOS[nivel].includes(prev.grado)
        ? prev.grado
        : GRADOS[nivel][0],
    }));
  };

  const docentes = useMemo(
    () =>
      users
        .filter(
          (u) =>
            u.rol === ROLES.DOCENTE &&
            u.activo
        )
        .filter((u) =>
          `${u.nombres} ${u.apellidos} ${u.codigo}`
            .toLowerCase()
            .includes(busquedaDocente.toLowerCase())
        )
        .map((u) => ({
          value: u.id,
          label: `${u.nombres} ${u.apellidos} · ${u.codigo}`,
        })),
    [users, busquedaDocente]
  );

  const guardar = async () => {
    setError('');

    if (!form.nombre.trim()) {
      setError('Escribe el nombre del curso.');
      return;
    }

    if (
      !form.nivel ||
      !form.grado ||
      !form.seccion
    ) {
      setError(
        'Selecciona el nivel, grado y sección.'
      );
      return;
    }

    setGuardando(true);

    try {
      const datos = {
        nombre: form.nombre.trim(),
        nivel: form.nivel,
        grado: form.grado,
        seccion: form.seccion,
        docenteId: form.docenteId || null,
        descripcion: form.descripcion.trim(),
        tono: form.tono,
        icono: form.icono,
      };

      if (editando) {
        await updateCourse(existente.id, datos);
        navigation.goBack();
      } else {
        const nuevo = await addCourse(datos);

        navigation.replace(
          'AdminCursoDetalle',
          { id: nuevo.id }
        );
      }
    } catch (e) {
      setError(
        e.message || 'No se pudo guardar el curso.'
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <AdminDashboard
      variant="detail"
      title={editando ? 'Editar curso' : 'Nuevo curso'}
    >
      <PageScroll>
        <Card style={styles.card}>
          <Text style={styles.label}>
            Nombre del curso *
          </Text>

          <Field
            value={form.nombre}
            onChangeText={set('nombre')}
            placeholder="Ej. Matemática, Comunicación, Ciencia y Tecnología"
          />

          <Text style={styles.helper}>
            Escribe el nombre de la asignatura o curso.
          </Text>

          <SelectField
            label="Nivel"
            options={NIVELES}
            value={form.nivel}
            onChange={cambiarNivel}
          />

          <SelectField
            label="Grado"
            options={GRADOS[form.nivel]}
            value={form.grado}
            onChange={set('grado')}
          />

          <SelectField
            label="Sección"
            options={SECCIONES}
            value={form.seccion}
            onChange={set('seccion')}
          />

          <Text style={styles.label}>
            Buscar docente por nombre o código
          </Text>

          <Field
            value={busquedaDocente}
            onChangeText={setBusquedaDocente}
            placeholder="Nombre o código del docente"
          />

          <SelectField
            label="Docente responsable"
            options={[
              {
                value: null,
                label: 'Sin asignar',
              },
              ...docentes,
            ]}
            value={form.docenteId}
            onChange={set('docenteId')}
          />

          <Text style={styles.label}>
            Descripción (opcional)
          </Text>

          <Field
            value={form.descripcion}
            onChangeText={set('descripcion')}
            placeholder="Descripción del curso"
            multiline
          />

          <Text style={styles.label}>
            Color del curso
          </Text>

          <View style={styles.colors}>
            {toneList.map((tono) => (
              <TouchableOpacity
                key={tono}
                accessibilityRole="button"
                accessibilityLabel={`Seleccionar color ${tono}`}
                onPress={() => set('tono')(tono)}
                style={[
                  styles.color,
                  {
                    backgroundColor:
                      tones[tono].solid,
                  },
                  form.tono === tono &&
                    styles.colorActive,
                ]}
              />
            ))}
          </View>

          {/* Selector de iconos */}
          <Text style={styles.label}>
            Icono del curso
          </Text>

          <Text style={styles.iconHelper}>
            Selecciona el icono que mejor represente la asignatura.
          </Text>

          <View style={styles.iconosGrid}>
            {ICONOS_CURSOS.map((item, index) => {
              const seleccionado =
                form.icono === item.nombre;

              return (
                <TouchableOpacity
                  key={`${item.nombre}-${index}`}
                  accessibilityRole="button"
                  accessibilityLabel={`Seleccionar ${item.etiqueta}`}
                  accessibilityState={{
                    selected: seleccionado,
                  }}
                  onPress={() => set('icono')(item.nombre)}
                  activeOpacity={0.7}
                  style={[
                    styles.iconoItem,
                    seleccionado &&
                      styles.iconoItemActive,
                  ]}
                >
                  <Ionicons
                    name={item.nombre}
                    size={23}
                    color={
                      seleccionado
                        ? colors.primary
                        : colors.icon
                    }
                  />

                  <Text
                    style={[
                      styles.iconoTexto,
                      seleccionado &&
                        styles.iconoTextoActive,
                    ]}
                    numberOfLines={2}
                  >
                    {item.etiqueta}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {!!error && (
            <Text style={styles.error}>
              {error}
            </Text>
          )}
        </Card>

        <Button
          title={
            guardando
              ? 'Guardando...'
              : editando
                ? 'Guardar cambios'
                : 'Crear curso'
          }
          icon="checkmark"
          onPress={guardar}
          disabled={guardando}
        />

        <Button
          title="Cancelar"
          variant="outline"
          onPress={() => navigation.goBack()}
        />
      </PageScroll>
    </AdminDashboard>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textStrong,
    marginBottom: 8,
    marginTop: 12,
  },
  helper: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: -2,
    marginBottom: 8,
  },
  colors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  color: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  colorActive: {
    borderWidth: 3,
    borderColor: colors.textStrong,
  },
  iconHelper: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: -2,
    marginBottom: 12,
  },
  iconosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  iconoItem: {
    width: '15.8%',
    minHeight: 76,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 2,
    marginBottom: 7,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  iconoItemActive: {
    backgroundColor: '#EFF6FF',
    borderColor: colors.primary,
    borderWidth: 2,
  },
  iconoTexto: {
    fontSize: 9,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 5,
  },
  iconoTextoActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  error: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 8,
  },
});
