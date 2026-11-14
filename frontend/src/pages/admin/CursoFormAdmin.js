import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
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
  error: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 8,
  },
});