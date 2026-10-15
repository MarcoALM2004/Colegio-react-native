import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, Modal,
  Alert, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cursos } from './CursosTeacher';

const tabs = ['Inicio', 'Unidades', 'Materiales', 'Tareas', 'Calificaciones', 'Foro'];

const initialUnits = [
  { id: 'u1', titulo: 'Unidad 1: Introducción', descripcion: 'Objetivos, contenidos y sesiones de aprendizaje.' },
  { id: 'u2', titulo: 'Unidad 2: Desarrollo del tema', descripcion: 'Actividades y contenidos principales.' },
];
const initialTasks = [
  { id: 't1', titulo: 'Ejercicios de práctica', descripcion: 'Resolver los ejercicios de la unidad.', fecha: '20 oct 2026' },
];
const initialGrades = [
  { id: 'g1', estudiante: 'Ana Torres', nota: '17' },
  { id: 'g2', estudiante: 'Luis Ramírez', nota: '15' },
  { id: 'g3', estudiante: 'María González', nota: '18' },
];
const initialForum = [
  { id: 'f1', titulo: 'Dudas de la unidad', descripcion: 'Espacio para consultas sobre los temas vistos.' },
];

export default function CursoDetalleTeacher({ route, navigation }) {
  const course = cursos.find((item) => String(item.id) === String(route.params?.id)) || cursos[0];
  const [tab, setTab] = useState('Inicio');
  const [units, setUnits] = useState(initialUnits);
  const [tasks, setTasks] = useState(initialTasks);
  const [grades, setGrades] = useState(initialGrades);
  const [forum, setForum] = useState(initialForum);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ titulo: '', descripcion: '', fecha: '', estudiante: '', nota: '' });

  const openForm = (item = null) => {
    setEditing(item?.id ?? null);
    setForm({
      titulo: item?.titulo || '',
      descripcion: item?.descripcion || '',
      fecha: item?.fecha || '',
      estudiante: item?.estudiante || '',
      nota: item?.nota || '',
    });
    setModal(true);
  };

  const saveItem = () => {
    if (tab === 'Calificaciones') {
      if (!form.estudiante.trim() || form.nota.trim() === '') {
        Alert.alert('Campos obligatorios', 'Completa el estudiante y la nota.');
        return;
      }
      const nota = Number(form.nota);
      if (!Number.isFinite(nota) || nota < 0 || nota > 20) {
        Alert.alert('Nota inválida', 'Ingresa una nota entre 0 y 20.');
        return;
      }
      const item = { id: editing || String(Date.now()), estudiante: form.estudiante.trim(), nota: String(nota) };
      setGrades((prev) => editing ? prev.map((x) => x.id === editing ? item : x) : [...prev, item]);
    } else {
      if (!form.titulo.trim()) {
        Alert.alert('Campo obligatorio', 'Escribe un título.');
        return;
      }
      const item = {
        id: editing || String(Date.now()),
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        ...(tab === 'Tareas' ? { fecha: form.fecha.trim() || 'Sin fecha' } : {}),
      };
      const setter = tab === 'Unidades' ? setUnits : tab === 'Tareas' ? setTasks : setForum;
      setter((prev) => editing ? prev.map((x) => x.id === editing ? item : x) : [...prev, item]);
    }
    setModal(false);
  };

  const deleteItem = (item) => {
    Alert.alert('Eliminar', '¿Deseas eliminar este elemento?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => {
        const setter = tab === 'Unidades' ? setUnits : tab === 'Tareas' ? setTasks : tab === 'Foro' ? setForum : setGrades;
        setter((prev) => prev.filter((x) => x.id !== item.id));
      }},
    ]);
  };

  const renderManagedItems = (items, isGrade = false) => (
    <>
      <View style={styles.sectionHeading}>
        <Text style={styles.section}>{tab === 'Unidades' ? 'Unidades de aprendizaje' : tab === 'Tareas' ? 'Tareas del curso' : tab === 'Calificaciones' ? 'Calificaciones de estudiantes' : 'Foro del curso'}</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => openForm()}>
          <Ionicons name="add" size={17} color="#FFFFFF" />
          <Text style={styles.addText}>{isGrade ? 'Registrar nota' : 'Agregar'}</Text>
        </TouchableOpacity>
      </View>
      {items.length === 0 ? <Text style={styles.body}>Todavía no hay elementos registrados.</Text> : items.map((item) => (
        <View key={item.id} style={styles.itemRow}>
          <View style={styles.itemIcon}>
            <Ionicons name={isGrade ? 'school-outline' : tab === 'Unidades' ? 'book-outline' : tab === 'Tareas' ? 'document-text-outline' : 'chatbubbles-outline'} size={20} color="#3478F6" />
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.itemTitle}>{isGrade ? item.estudiante : item.titulo}</Text>
            <Text style={styles.body}>{isGrade ? `Nota: ${item.nota}/20` : item.descripcion || (tab === 'Tareas' ? `Entrega: ${item.fecha}` : '')}</Text>
            {tab === 'Tareas' && item.fecha ? <Text style={styles.muted}>Entrega: {item.fecha}</Text> : null}
          </View>
          <View style={styles.itemActions}>
            <TouchableOpacity onPress={() => openForm(item)} style={styles.actionButton}><Ionicons name="create-outline" size={18} color="#2563EB" /></TouchableOpacity>
            <TouchableOpacity onPress={() => deleteItem(item)} style={styles.actionButton}><Ionicons name="trash-outline" size={18} color="#DC2626" /></TouchableOpacity>
          </View>
        </View>
      ))}
    </>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.pageHeading}>
        <View style={{ flex: 1 }}>
          <Text style={styles.pageTitle}>{course.nombre}</Text>
          <Text style={styles.muted}>Administra el contenido de tu curso.</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityLabel="Volver">
          <Ionicons name="arrow-back" size={23} color="#263244" />
        </TouchableOpacity>
      </View>

      <View style={[styles.banner, { backgroundColor: course.color }]}>
        <Ionicons name={course.icono} size={34} color="#FFFFFF" />
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>{course.nombre}</Text>
          <Text style={styles.bannerSub}>{course.seccion} · {course.alumnos} estudiantes</Text>
          <Text style={styles.bannerSub}>{course.descripcion}</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        {tabs.map((item) => (
          <TouchableOpacity key={item} onPress={() => setTab(item)} style={[styles.tab, tab === item && styles.tabActive]}>
            <Text style={[styles.tabText, tab === item && styles.tabTextActive]}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'Inicio' && <>
        <View style={styles.card}>
          <Text style={styles.section}>Información del curso</Text>
          <Info icon="person-outline" label="Docente" value="Ana Torres" />
          <Info icon="calendar-outline" label="Horario" value="Lun y Mié · 10:30 - 12:00" />
          <Info icon="location-outline" label="Aula" value="Aula 305" />
          <Info icon="people-outline" label="Estudiantes" value={String(course.alumnos)} />
        </View>
        <View style={styles.card}>
          <Text style={styles.section}>Descripción</Text>
          <Text style={styles.body}>{course.descripcion}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.section}>Próximas actividades</Text>
          {tasks.length ? tasks.slice(0, 3).map((task) => (
            <View key={task.id} style={styles.itemRow}>
              <View style={styles.itemIcon}><Ionicons name="document-text-outline" size={20} color="#E99535" /></View>
              <View style={styles.itemInfo}><Text style={styles.itemTitle}>{task.titulo}</Text><Text style={styles.muted}>Entrega: {task.fecha}</Text></View>
            </View>
          )) : <Text style={styles.body}>No hay actividades próximas.</Text>}
        </View>
      </>}

      {tab === 'Unidades' && <View style={styles.card}>{renderManagedItems(units)}</View>}
      {tab === 'Materiales' && <View style={styles.card}>
        <Text style={styles.section}>Materiales del curso</Text>
        <Text style={styles.body}>Guía de trabajo de la unidad 2</Text>
        <Text style={styles.body}>Lectura complementaria</Text>
        <Text style={styles.body}>Presentación de la semana</Text>
      </View>}
      {tab === 'Tareas' && <View style={styles.card}>{renderManagedItems(tasks)}</View>}
      {tab === 'Calificaciones' && <View style={styles.card}>{renderManagedItems(grades, true)}</View>}
      {tab === 'Foro' && <View style={styles.card}>{renderManagedItems(forum)}</View>}

      <Modal visible={modal} transparent animationType="fade" onRequestClose={() => setModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{editing ? 'Editar' : 'Agregar'} {tab === 'Calificaciones' ? 'calificación' : tab === 'Unidades' ? 'unidad' : tab === 'Tareas' ? 'tarea' : 'tema del foro'}</Text>
            {tab === 'Calificaciones' ? <>
              <Text style={styles.label}>Nombre del estudiante</Text>
              <TextInput style={styles.input} value={form.estudiante} onChangeText={(v) => setForm((p) => ({ ...p, estudiante: v }))} placeholder="Nombre del estudiante" />
              <Text style={styles.label}>Nota (0 a 20)</Text>
              <TextInput style={styles.input} value={form.nota} onChangeText={(v) => setForm((p) => ({ ...p, nota: v }))} keyboardType="decimal-pad" placeholder="Ej. 18" />
            </> : <>
              <Text style={styles.label}>Título</Text>
              <TextInput style={styles.input} value={form.titulo} onChangeText={(v) => setForm((p) => ({ ...p, titulo: v }))} placeholder="Escribe el título" />
              <Text style={styles.label}>Descripción</Text>
              <TextInput style={[styles.input, styles.multiline]} value={form.descripcion} onChangeText={(v) => setForm((p) => ({ ...p, descripcion: v }))} placeholder="Descripción" multiline textAlignVertical="top" />
              {tab === 'Tareas' && <>
                <Text style={styles.label}>Fecha de entrega</Text>
                <TextInput style={styles.input} value={form.fecha} onChangeText={(v) => setForm((p) => ({ ...p, fecha: v }))} placeholder="Ej. 20 oct 2026" />
              </>}
            </>}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModal(false)}><Text style={styles.cancelText}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={saveItem}><Text style={styles.saveText}>Guardar</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function Info({ icon, label, value }) {
  return <View style={styles.info}><Ionicons name={icon} size={20} color="#3478F6" /><View><Text style={styles.muted}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, minWidth: 0, backgroundColor: '#F5F7FB' },
  content: { padding: 20, paddingBottom: 35, gap: 15 },
  pageHeading: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pageTitle: { fontSize: 25, fontWeight: '800', color: '#263244' },
  muted: { fontSize: 11, color: '#91A0B6', marginTop: 3 },
  banner: { borderRadius: 15, padding: 20, flexDirection: 'row', gap: 14, alignItems: 'center' },
  bannerTitle: { fontSize: 21, fontWeight: '800', color: '#FFFFFF' },
  bannerSub: { fontSize: 11, color: '#FFFFFF', marginTop: 4, opacity: 0.92 },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  tab: { paddingVertical: 9, paddingHorizontal: 11, borderRadius: 9 },
  tabActive: { backgroundColor: '#EAF2FF' },
  tabText: { fontSize: 12, color: '#718096' },
  tabTextActive: { color: '#2563EB', fontWeight: '700' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 15, borderWidth: 1, borderColor: '#E4EAF2', padding: 17 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 },
  section: { fontSize: 16, fontWeight: '700', color: '#263244', marginBottom: 13 },
  addButton: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#2563EB', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  addText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  info: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 13 },
  infoValue: { fontSize: 13, fontWeight: '600', color: '#263244', marginTop: 2 },
  body: { fontSize: 13, color: '#617087', lineHeight: 20 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: 1, borderTopColor: '#EEF1F5', paddingVertical: 11 },
  itemIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: '#EAF2FF', alignItems: 'center', justifyContent: 'center' },
  itemInfo: { flex: 1, minWidth: 0 },
  itemTitle: { fontSize: 13, fontWeight: '700', color: '#263244' },
  itemActions: { flexDirection: 'row', gap: 5 },
  actionButton: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'center', alignItems: 'center', padding: 18 },
  modal: { width: '100%', maxWidth: 460, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 19, fontWeight: '800', color: '#263244', marginBottom: 18 },
  label: { fontSize: 12, fontWeight: '700', color: '#526078', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#D9E1EC', borderRadius: 9, paddingHorizontal: 12, paddingVertical: 11, fontSize: 14, color: '#263244', marginBottom: 13 },
  multiline: { minHeight: 80 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 4 },
  cancelButton: { paddingHorizontal: 14, paddingVertical: 11, borderRadius: 9, backgroundColor: '#F1F5F9' },
  cancelText: { color: '#526078', fontWeight: '700' },
  saveButton: { paddingHorizontal: 18, paddingVertical: 11, borderRadius: 9, backgroundColor: '#2563EB' },
  saveText: { color: '#FFFFFF', fontWeight: '700' },
});