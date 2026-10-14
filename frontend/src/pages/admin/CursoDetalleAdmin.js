import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import AdminDashboard from '../../components/AdminDashboard';
import { useAdminData } from '../../context/AdminDataContext';
import {
  ActionSheet,
  Avatar,
  BottomSheet,
  Button,
  Card,
  EmptyState,
  Field,
  IconBox,
  InfoRow,
  ListRow,
  PageScroll,
  SelectField,
  UnderlineTabs,
  confirmAction,
} from '../../components/admin/AdminUI';
import { colors } from '../../theme/adminTheme';
import { ROLE_TONE } from '../../utils/adminHelpers';

const TABS = ['Información', 'Estudiantes', 'Docentes', 'Horario'];
const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

export default function CursoDetalleAdmin() {
  const navigation = useNavigation();
  const { id } = useRoute().params || {};
  const { getCourse, getUser, courseName, courseStudentCount, studentsInCourse, updateCourse, deleteCourse } =
    useAdminData();

  const [tab, setTab] = useState(TABS[0]);
  const [menu, setMenu] = useState(false);
  const [nuevoBloque, setNuevoBloque] = useState(null); // { dia, hora, materia }

  const curso = getCourse(id);

  if (!curso) {
    return (
      <AdminDashboard variant="detail" title="Curso">
        <EmptyState icon="book-outline" text="El curso no existe o fue eliminado." />
      </AdminDashboard>
    );
  }

  const docente = getUser(curso.docenteId);
  const estudiantes = studentsInCourse(curso.id);
  const total = courseStudentCount(curso);

  // Docentes = tutor + quienes dictan materias en el horario (por especialidad)
  const materias = [...new Set(curso.horario.map((h) => h.materia))];

  const eliminar = () =>
    confirmAction(
      'Eliminar curso',
      `¿Eliminar ${courseName(curso)}? Los estudiantes quedarán sin curso asignado.`,
      () => {
        deleteCourse(curso.id);
        navigation.goBack();
      },
      'Eliminar'
    );

  const agregarBloque = () => {
    if (!nuevoBloque.hora.trim() || !nuevoBloque.materia.trim()) return;
    updateCourse(curso.id, { horario: [...curso.horario, { ...nuevoBloque }] });
    setNuevoBloque(null);
  };

  const quitarBloque = (index) => updateCourse(curso.id, { horario: curso.horario.filter((_, i) => i !== index) });

  return (
    <AdminDashboard
      variant="detail"
      title="Detalle de curso"
      headerRight={
        <TouchableOpacity onPress={() => setMenu(true)} style={styles.headerBtn}>
          <Ionicons name="ellipsis-vertical" size={20} color={colors.textStrong} />
        </TouchableOpacity>
      }
    >
      <PageScroll>
        {/* CABECERA */}
        <Card style={styles.hero}>
          <IconBox icon="book-outline" tone={curso.tono} size={64} iconSize={30} solid />
          <View style={styles.heroText}>
            <Text style={styles.title}>{courseName(curso)}</Text>
            <Text style={styles.sub}>Nivel {curso.nivel}</Text>
            <Text style={styles.sub}>
              {total} / {curso.capacidad} estudiantes
            </Text>
          </View>
        </Card>

        <UnderlineTabs tabs={TABS} value={tab} onChange={setTab} />

        {tab === 'Información' && (
          <Card>
            <InfoRow icon="barcode-outline" label="Código" value={curso.codigo} />
            <InfoRow icon="layers-outline" label="Nivel" value={curso.nivel} />
            <InfoRow
              icon="people-outline"
              label="Grado y sección"
              value={`${curso.grado} ${curso.nivel} ${curso.seccion}`}
            />
            <InfoRow
              icon="person-outline"
              label="Tutor"
              value={docente ? `Prof. ${docente.nombres} ${docente.apellidos}` : 'Sin asignar'}
            />
            <InfoRow icon="calendar-outline" label="Año académico" value={String(curso.anio)} />
            <InfoRow icon="information-circle-outline" label="Descripción" value={curso.descripcion} />
          </Card>
        )}

        {tab === 'Estudiantes' && (
          <>
            <Text style={styles.note}>
              {total} matriculados · {estudiantes.length} con cuenta en la plataforma
            </Text>
            <Card>
              {estudiantes.length === 0 ? (
                <EmptyState icon="people-outline" text="Aún no hay estudiantes con cuenta en este curso." />
              ) : (
                estudiantes.map((u) => (
                  <ListRow
                    key={u.id}
                    left={<Avatar nombres={u.nombres} apellidos={u.apellidos} tone={ROLE_TONE[u.rol]} size={38} />}
                    title={`${u.nombres} ${u.apellidos}`}
                    subtitle={u.codigo}
                    onPress={() => navigation.navigate('AdminUsuarioDetalle', { id: u.id })}
                  />
                ))
              )}
            </Card>
          </>
        )}

        {tab === 'Docentes' && (
          <Card>
            {docente ? (
              <ListRow
                left={<Avatar nombres={docente.nombres} apellidos={docente.apellidos} tone="purple" size={38} />}
                title={`${docente.nombres} ${docente.apellidos}`}
                subtitle={`Tutor · ${docente.detalle}`}
                onPress={() => navigation.navigate('AdminUsuarioDetalle', { id: docente.id })}
              />
            ) : (
              <EmptyState icon="person-outline" text="Sin tutor asignado. Edita el curso para asignarlo." />
            )}
            {materias.map((m) => (
              <ListRow
                key={m}
                left={<IconBox icon="bookmark-outline" tone="indigo" size={38} iconSize={18} />}
                title={m}
                subtitle="Materia del horario"
              />
            ))}
          </Card>
        )}

        {tab === 'Horario' && (
          <Card>
            {curso.horario.length === 0 && <EmptyState icon="time-outline" text="Sin horario registrado." />}
            {curso.horario.map((h, i) => (
              <ListRow
                key={`${h.dia}-${h.hora}-${i}`}
                left={<IconBox icon="time-outline" tone={curso.tono} size={38} iconSize={18} />}
                title={h.materia}
                subtitle={`${h.dia} · ${h.hora}`}
                right={
                  <TouchableOpacity onPress={() => quitarBloque(i)} style={styles.headerBtn}>
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </TouchableOpacity>
                }
              />
            ))}
            <Button
              title="Agregar bloque"
              icon="add"
              variant="outline"
              style={styles.addBtn}
              onPress={() => setNuevoBloque({ dia: 'Lunes', hora: '', materia: '' })}
            />
          </Card>
        )}

        <Button title="Editar curso" onPress={() => navigation.navigate('AdminCursoForm', { id: curso.id })} />
      </PageScroll>

      <ActionSheet
        visible={menu}
        title={courseName(curso)}
        onClose={() => setMenu(false)}
        actions={[
          {
            label: 'Editar curso',
            icon: 'create-outline',
            onPress: () => navigation.navigate('AdminCursoForm', { id: curso.id }),
          },
          { label: 'Eliminar curso', icon: 'trash-outline', danger: true, onPress: eliminar },
        ]}
      />

      <BottomSheet visible={!!nuevoBloque} title="Nuevo bloque de horario" onClose={() => setNuevoBloque(null)}>
        {nuevoBloque && (
          <>
            <SelectField
              label="Día"
              options={DIAS}
              value={nuevoBloque.dia}
              onChange={(dia) => setNuevoBloque((b) => ({ ...b, dia }))}
            />
            <Field
              label="Hora"
              placeholder="08:00 - 10:00"
              value={nuevoBloque.hora}
              onChangeText={(hora) => setNuevoBloque((b) => ({ ...b, hora }))}
            />
            <Field
              label="Materia"
              placeholder="Ej. Matemáticas"
              value={nuevoBloque.materia}
              onChangeText={(materia) => setNuevoBloque((b) => ({ ...b, materia }))}
            />
            <Button
              title="Agregar"
              onPress={agregarBloque}
              disabled={!nuevoBloque.hora.trim() || !nuevoBloque.materia.trim()}
            />
          </>
        )}
      </BottomSheet>
    </AdminDashboard>
  );
}

const styles = StyleSheet.create({
  headerBtn: { padding: 6 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 16 },
  heroText: { flex: 1 },
  title: { fontSize: 19, fontWeight: '700', color: colors.text },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  note: { fontSize: 12, color: colors.textMuted, marginBottom: 8 },
  addBtn: { marginBottom: 14 },
});
