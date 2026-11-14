import React, { useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';

import AdminDashboard from '../../components/AdminDashboard';
import { useAdminData } from '../../context/AdminDataContext';
import {
  Card,
  EmptyState,
  IconBox,
  ListRow,
  PageScroll,
  PageTitle,
  SearchBar,
  Chips,
} from '../../components/admin/AdminUI';
import { NIVELES } from '../../data/adminMockData';
import { normalizar } from '../../utils/adminHelpers';

export default function CursosAdmin() {
  const navigation = useNavigation();

  const {
    courses,
    getUser,
    courseStudentCount,
  } = useAdminData();

  const [busqueda, setBusqueda] = useState('');
  const [nivel, setNivel] = useState('Todos');

  const lista = useMemo(() => {
    const q = normalizar(busqueda.trim());

    return courses
      .filter(
        (c) => nivel === 'Todos' || c.nivel === nivel
      )
      .filter((c) => {
        const texto = [
          c.nombre,
          c.grado,
          c.nivel,
          c.seccion,
          c.codigo,
        ]
          .filter(Boolean)
          .join(' ');

        return !q || normalizar(texto).includes(q);
      })
      .sort((a, b) =>
        `${a.nivel}${a.grado}${a.seccion}`.localeCompare(
          `${b.nivel}${b.grado}${b.seccion}`
        )
      );
  }, [courses, busqueda, nivel]);

  return (
    <AdminDashboard>
      <PageScroll>
        <PageTitle
          title="Cursos"
          actionLabel="Nuevo curso"
          onAction={() =>
            navigation.navigate('AdminCursoForm')
          }
        />

        <SearchBar
          value={busqueda}
          onChangeText={setBusqueda}
          placeholder="Buscar por nombre, grado o sección..."
        />

        <Chips
          options={['Todos', ...NIVELES]}
          value={nivel}
          onChange={setNivel}
        />

        <Card>
          {lista.length === 0 ? (
            <EmptyState
              text="No se encontraron cursos. Crea un curso para comenzar."
            />
          ) : (
            lista.map((curso) => {
              const docente = getUser(curso.docenteId);

              return (
                <ListRow
                  key={String(curso.id)}
                  onPress={() =>
                    navigation.navigate(
                      'AdminCursoDetalle',
                      { id: curso.id }
                    )
                  }
                  left={
                    <IconBox
                      icon="book-outline"
                      tone={curso.tono || 'blue'}
                      size={46}
                      solid
                    />
                  }
                  title={curso.nombre || 'Curso sin nombre'}
                  subtitle={`${curso.grado} ${curso.nivel} · Sección ${curso.seccion}`}
                  meta={`${courseStudentCount(
                    curso
                  )} estudiantes matriculados${
                    docente
                      ? ` · Prof. ${docente.nombres} ${docente.apellidos}`
                      : ''
                  }`}
                />
              );
            })
          )}
        </Card>
      </PageScroll>
    </AdminDashboard>
  );
}