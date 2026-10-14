import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import AdminDashboard from '../../components/AdminDashboard';
import { useAdminData } from '../../context/AdminDataContext';
import { Button, Card, Field, PageScroll, SelectField, notify } from '../../components/admin/AdminUI';
import { NIVELES, ROLES } from '../../data/adminMockData';
import { colors, toneList, tones } from '../../theme/adminTheme';

const GRADOS = {
  Primaria: ['1°', '2°', '3°', '4°', '5°', '6°'],
  Secundaria: ['1°', '2°', '3°', '4°', '5°'],
};
const SECCIONES = ['A', 'B', 'C', 'D', 'E'];

export default function CursoFormAdmin() {
  const navigation = useNavigation();
  const params = useRoute().params || {};
  const { getCourse, courses, users, addCourse, updateCourse } = useAdminData();

  const existente = params.id ? getCourse(params.id) : null;
  const editando = !!existente;

  const [form, setForm] = useState({
    nivel: existente?.nivel || 'Secundaria',
    grado: existente?.grado || '1°',
    seccion: existente?.seccion || 'A',
    docenteId: existente?.docenteId || null,
    capacidad: String(existente?.capacidad || 30),
    descripcion: existente?.descripcion || '',
    tono: existente?.tono || 'blue',
  });
  const [error, setError] = useState('');

  const set = (campo) => (valor) => setForm((prev) => ({ ...prev, [campo]: valor }));

  const cambiarNivel = (nivel) =>
    setForm((prev) => ({
      ...prev,
      nivel,
      grado: GRADOS[nivel].includes(prev.grado) ? prev.grado : GRADOS[nivel][0],
    }));

  const docentes = users
    .filter((u) => u.rol === ROLES.DOCENTE && u.activo)
    .map((u) => ({ value: u.id, label: `${u.nombres} ${u.apellidos}` }));

  const guardar = () => {
    const duplicado = courses.some(
      (c) => c.nivel === form.nivel && c.grado === form.grado && c.seccion === form.seccion && c.id !== existente?.id
    );
    if (duplicado) {
      setError(`Ya existe ${form.grado} ${form.nivel} ${form.seccion}.`);
      return;
    }
    const capacidad = parseInt(form.capacidad, 10);
    if (!capacidad || capacidad < 1) {
      setError('La capacidad debe ser un número mayor a 0.');
      return;
    }

    const datos = {
      ...form,
      capacidad,
      descripcion:
        form.descripcion.trim() || `Curso de ${form.grado} de ${form.nivel.toLowerCase()} sección ${form.seccion}.`,
    };

    if (editando) {
      updateCourse(existente.id, datos);
      notify('Curso actualizado');
      navigation.goBack();
    } else {
      const nuevo = addCourse(datos);
      notify('Curso creado', `Código: ${nuevo.codigo}`);
      navigation.replace('AdminCursoDetalle', { id: nuevo.id });
    }
  };

  return (
    <AdminDashboard variant="detail" title={editando ? 'Editar curso' : 'Nuevo curso'}>
      <PageScroll>
        <Card style={styles.card}>
          <SelectField label="Nivel" options={NIVELES} value={form.nivel} onChange={cambiarNivel} />
          <SelectField label="Grado" options={GRADOS[form.nivel]} value={form.grado} onChange={set('grado')} />
          <SelectField label="Sección" options={SECCIONES} value={form.seccion} onChange={set('seccion')} />
          {docentes.length > 0 && (
            <SelectField label="Tutor" options={docentes} value={form.docenteId} onChange={set('docenteId')} />
          )}
          <Field
            label="Capacidad"
            value={form.capacidad}
            onChangeText={(t) => set('capacidad')(t.replace(/\D/g, ''))}
            keyboardType="number-pad"
          />
          <Field
            label="Descripción"
            value={form.descripcion}
            onChangeText={set('descripcion')}
            placeholder="Opcional"
            multiline
          />

          <Text style={styles.label}>Color</Text>
          <View style={styles.colors}>
            {toneList.map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => set('tono')(t)}
                style={[styles.color, { backgroundColor: tones[t].solid }, form.tono === t && styles.colorActive]}
              />
            ))}
          </View>

          {!!error && <Text style={styles.error}>{error}</Text>}
        </Card>

        <Button title={editando ? 'Guardar cambios' : 'Crear curso'} icon="checkmark" onPress={guardar} />
        <Button title="Cancelar" variant="outline" onPress={() => navigation.goBack()} />
      </PageScroll>
    </AdminDashboard>
  );
}

const styles = StyleSheet.create({
  card: { paddingVertical: 14 },
  label: { fontSize: 12, fontWeight: '600', color: colors.textStrong, marginBottom: 8 },
  colors: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  color: { width: 32, height: 32, borderRadius: 16 },
  colorActive: { borderWidth: 3, borderColor: colors.textStrong },
  error: { color: colors.danger, fontSize: 12, marginTop: 8 },
});
