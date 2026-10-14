import React from 'react';
import { useNavigation } from '@react-navigation/native';

import AdminDashboard from '../../components/AdminDashboard';
import { Card, IconBox, ListRow, PageScroll, PageTitle } from '../../components/admin/AdminUI';

// Catálogo de reportes. El contenido de cada uno se arma en ReporteDetalleAdmin.
export const REPORTES = [
  { key: 'estudiantes', titulo: 'Estudiantes por grado', icono: 'people-outline', tono: 'blue' },
  { key: 'docentes', titulo: 'Docentes y asignaturas', icono: 'school-outline', tono: 'purple' },
  { key: 'cursos', titulo: 'Cursos y secciones', icono: 'grid-outline', tono: 'orange' },
  { key: 'asistencia', titulo: 'Asistencia general', icono: 'checkmark-done-outline', tono: 'green' },
  { key: 'rendimiento', titulo: 'Rendimiento académico', icono: 'trending-up-outline', tono: 'pink' },
  { key: 'uso', titulo: 'Uso de la plataforma', icono: 'phone-portrait-outline', tono: 'cyan' },
  { key: 'biblioteca', titulo: 'Biblioteca y recursos', icono: 'library-outline', tono: 'indigo' },
  { key: 'cuentas', titulo: 'Cuentas y accesos', icono: 'key-outline', tono: 'red' },
];

export default function ReportesAdmin() {
  const navigation = useNavigation();

  return (
    <AdminDashboard>
      <PageScroll>
        <PageTitle title="Reportes" subtitle="Selecciona un reporte para ver el detalle." />
        <Card>
          {REPORTES.map((r) => (
            <ListRow
              key={r.key}
              left={<IconBox icon={r.icono} tone={r.tono} size={40} iconSize={19} />}
              title={r.titulo}
              onPress={() => navigation.navigate('AdminReporteDetalle', { key: r.key })}
            />
          ))}
        </Card>
      </PageScroll>
    </AdminDashboard>
  );
}
