import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import AdminDashboard from '../../components/AdminDashboard';
import { useAdminData } from '../../context/AdminDataContext';
import {
  ActionSheet,
  BottomSheet,
  Button,
  Card,
  Chips,
  EmptyState,
  Field,
  IconBox,
  ListRow,
  PageScroll,
  PageTitle,
  SearchBar,
  SelectField,
  confirmAction,
  notify,
} from '../../components/admin/AdminUI';
import { colors, toneList } from '../../theme/adminTheme';
import { LIBRARY_TYPES } from '../../data/adminMockData';
import { normalizar } from '../../utils/adminHelpers';

const FILTROS = [
  { value: 'Todos', label: 'Todos' },
  { value: LIBRARY_TYPES.LIBRO, label: 'Libros' },
  { value: LIBRARY_TYPES.DOCUMENTO, label: 'Documentos' },
  { value: LIBRARY_TYPES.VIDEO, label: 'Videos' },
];

const iconoDe = (item) => {
  if (item.formato === 'Carpeta') return 'folder-outline';
  if (item.tipo === LIBRARY_TYPES.VIDEO) return 'play-circle-outline';
  if (item.tipo === LIBRARY_TYPES.DOCUMENTO) return 'document-text-outline';
  return 'book-outline';
};

const FORMULARIO_VACIO = { titulo: '', tipo: LIBRARY_TYPES.LIBRO, formato: 'PDF', tamano: '' };

export default function BibliotecaAdmin() {
  const navigation = useNavigation();
  const route = useRoute();
  const { library, addResource, deleteResource, registerDownload } = useAdminData();

  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('Todos');
  const [form, setForm] = useState(null);
  const [seleccionado, setSeleccionado] = useState(null);

  // Acceso rápido "Agregar libro" desde el inicio
  useEffect(() => {
    if (route.params?.agregar) {
      setForm({ ...FORMULARIO_VACIO });
      navigation.setParams({ agregar: undefined });
    }
  }, [route.params?.agregar, navigation]);

  const lista = useMemo(() => {
    const q = normalizar(busqueda.trim());
    return library.filter((b) => (filtro === 'Todos' || b.tipo === filtro) && (!q || normalizar(b.titulo).includes(q)));
  }, [library, busqueda, filtro]);

  const descargar = (item) => {
    registerDownload(item.id);
    notify('Descarga iniciada', `${item.titulo} (${item.tamano})`);
  };

  const guardar = () => {
    if (!form.titulo.trim()) return;
    addResource({
      ...form,
      titulo: form.titulo.trim(),
      tamano: form.tamano.trim() || '—',
      tono: toneList[library.length % toneList.length],
    });
    setForm(null);
  };

  return (
    <AdminDashboard>
      <PageScroll>
        <PageTitle title="Biblioteca" actionLabel="Agregar" onAction={() => setForm({ ...FORMULARIO_VACIO })} />

        <SearchBar value={busqueda} onChangeText={setBusqueda} placeholder="Buscar libros o materiales..." />
        <Chips options={FILTROS} value={filtro} onChange={setFiltro} />

        <Card>
          {lista.length === 0 ? (
            <EmptyState icon="library-outline" text="No hay materiales con ese criterio." />
          ) : (
            lista.map((b) => (
              <ListRow
                key={b.id}
                onPress={() => setSeleccionado(b)}
                chevron={false}
                left={<IconBox icon={iconoDe(b)} tone={b.tono} size={46} solid />}
                title={b.titulo}
                subtitle={`${b.tipo} ${b.formato} · ${b.tamano}`}
                meta={`${b.descargas} descargas`}
                right={
                  <View style={styles.right}>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => descargar(b)}>
                      <Ionicons name="download-outline" size={22} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                }
              />
            ))
          )}
        </Card>
      </PageScroll>

      <BottomSheet visible={!!form} title="Agregar material" onClose={() => setForm(null)}>
        {form && (
          <>
            <Field
              label="Título"
              value={form.titulo}
              onChangeText={(titulo) => setForm((f) => ({ ...f, titulo }))}
              placeholder="Ej. Comunicación 2"
            />
            <SelectField
              label="Tipo"
              options={Object.values(LIBRARY_TYPES)}
              value={form.tipo}
              onChange={(tipo) =>
                setForm((f) => ({ ...f, tipo, formato: tipo === LIBRARY_TYPES.VIDEO ? 'MP4' : 'PDF' }))
              }
            />
            <SelectField
              label="Formato"
              options={form.tipo === LIBRARY_TYPES.VIDEO ? ['MP4', 'Enlace'] : ['PDF', 'Word', 'Carpeta']}
              value={form.formato}
              onChange={(formato) => setForm((f) => ({ ...f, formato }))}
            />
            <Field
              label="Tamaño"
              value={form.tamano}
              onChangeText={(tamano) => setForm((f) => ({ ...f, tamano }))}
              placeholder="Ej. 5.2 MB"
            />
            <Button title="Guardar" icon="checkmark" onPress={guardar} disabled={!form.titulo.trim()} />
          </>
        )}
      </BottomSheet>

      <ActionSheet
        visible={!!seleccionado}
        title={seleccionado?.titulo || ''}
        onClose={() => setSeleccionado(null)}
        actions={
          seleccionado
            ? [
                { label: 'Descargar', icon: 'download-outline', onPress: () => descargar(seleccionado) },
                {
                  label: 'Eliminar',
                  icon: 'trash-outline',
                  danger: true,
                  onPress: () =>
                    confirmAction(
                      'Eliminar material',
                      `¿Eliminar "${seleccionado.titulo}" de la biblioteca?`,
                      () => deleteResource(seleccionado.id),
                      'Eliminar'
                    ),
                },
              ]
            : []
        }
      />
    </AdminDashboard>
  );
}

const styles = StyleSheet.create({
  right: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { padding: 6 },
});
