import React, { useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';

import AdminDashboard from '../../components/AdminDashboard';
import { useAdminData } from '../../context/AdminDataContext';
import {
  Card,
  Chips,
  EmptyState,
  IconBox,
  ListRow,
  PageScroll,
  PageTitle,
  SearchBar,
} from '../../components/admin/AdminUI';
import { NIVELES } from '../../data/adminMockData';
import { normalizar } from '../../utils/adminHelpers';

export default function CursosAdmin() {
  const navigation = useNavigation();
  const { courses, getUser, courseName, courseStudentCount } = useAdminData();

  const [busqueda, setBusqueda] = useState('');
  const [nivel, setNivel] = useState('Todos');

  const lista = useMemo(() => {
    const q = normalizar(busqueda.trim());
    return courses
      .filter((c) => nivel === 'Todos' || c.nivel === nivel)
      .filter((c) => !q || normalizar(`${courseName(c)} ${c.codigo}`).includes(q))
      .sort((a, b) => (a.nivel + a.grado + a.seccion).localeCompare(b.nivel + b.grado + b.seccion));
  }, [courses, busqueda, nivel, courseName]);

  return (
    <AdminDashboard>
      <PageScroll>
        <PageTitle title="Cursos" actionLabel="Nuevo curso" onAction={() => navigation.navigate('AdminCursoForm')} />

        <SearchBar value={busqueda} onChangeText={setBusqueda} placeholder="Buscar curso o grado..." />
        <Chips options={['Todos', ...NIVELES]} value={nivel} onChange={setNivel} />

        <Card>
          {lista.length === 0 ? (
            <EmptyState text="No se encontraron cursos." />
          ) : (
            lista.map((c) => {
              const docente = getUser(c.docenteId);
              return (
                <ListRow
                  key={c.id}
                  onPress={() => navigation.navigate('AdminCursoDetalle', { id: c.id })}
                  left={<IconBox icon="book-outline" tone={c.tono} size={46} solid />}
                  title={courseName(c)}
                  subtitle={`${courseStudentCount(c)} estudiantes`}
                  meta={docente ? `Prof. ${docente.nombres} ${docente.apellidos}` : 'Sin docente asignado'}
                />
              );
            })
          )}
        </Card>
      </PageScroll>
    </AdminDashboard>
  );
}
