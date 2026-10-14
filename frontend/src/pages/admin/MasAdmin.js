import React from 'react';
import { useNavigation } from '@react-navigation/native';

import AdminDashboard from '../../components/AdminDashboard';
import { useAdminData } from '../../context/AdminDataContext';
import {
  Card,
  CountBadge,
  IconBox,
  ListRow,
  PageScroll,
  PageTitle,
  notify,
  useLogout,
} from '../../components/admin/AdminUI';

export default function MasAdmin() {
  const navigation = useNavigation();
  const { stats } = useAdminData();
  const logout = useLogout();

  const ir = (route) => () => navigation.navigate(route);

  const opciones = [
    { titulo: 'Biblioteca', icono: 'library-outline', tono: 'green', onPress: ir('AdminBiblioteca') },
    { titulo: 'Calendario', icono: 'calendar-outline', tono: 'purple', onPress: ir('AdminCalendario') },
    { titulo: 'Reportes', icono: 'bar-chart-outline', tono: 'orange', onPress: ir('AdminReportes') },
    {
      titulo: 'Mensajes',
      icono: 'chatbubbles-outline',
      tono: 'blue',
      onPress: ir('AdminMensajes'),
      badge: stats.mensajesNoLeidos,
    },
    { titulo: 'Usuarios', icono: 'people-outline', tono: 'indigo', onPress: ir('AdminUsuarios') },
    { titulo: 'Cursos', icono: 'book-outline', tono: 'cyan', onPress: ir('AdminCursos') },
    { titulo: 'Mi perfil', icono: 'person-circle-outline', tono: 'blue', onPress: ir('AdminPerfil') },
    { titulo: 'Configuración', icono: 'settings-outline', tono: 'indigo', onPress: ir('AdminConfiguracion') },
    {
      titulo: 'Ayuda y soporte',
      icono: 'help-circle-outline',
      tono: 'blue',
      onPress: () => notify('Ayuda y soporte', 'Escríbenos a soporte@salcantay.edu.pe o llama al anexo 105.'),
    },
    {
      titulo: 'Acerca de',
      icono: 'information-circle-outline',
      tono: 'blue',
      onPress: () => notify('Salcantay', 'Plataforma educativa · Panel de administrador v1.0'),
    },
  ];

  return (
    <AdminDashboard>
      <PageScroll>
        <PageTitle title="Más opciones" />
        <Card>
          {opciones.map((o) => (
            <ListRow
              key={o.titulo}
              left={<IconBox icon={o.icono} tone={o.tono} size={38} iconSize={19} />}
              title={o.titulo}
              right={<CountBadge count={o.badge} />}
              onPress={o.onPress}
            />
          ))}
          <ListRow
            left={<IconBox icon="log-out-outline" tone="red" size={38} iconSize={19} />}
            title="Cerrar sesión"
            onPress={logout}
          />
        </Card>
      </PageScroll>
    </AdminDashboard>
  );
}
