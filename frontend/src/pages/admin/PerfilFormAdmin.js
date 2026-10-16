import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';

import AdminDashboard from '../../components/AdminDashboard';
import { useAdminData } from '../../context/AdminDataContext';
import {
  Button,
  Card,
  Field,
  PageScroll,
  notify,
} from '../../components/admin/AdminUI';
import { esCorreoValido } from '../../utils/adminHelpers';

export default function PerfilFormAdmin() {
  const navigation = useNavigation();
  const { profile, updateProfile } = useAdminData();

  const [correo, setCorreo] = useState(profile.correo || '');
  const [telefono, setTelefono] = useState(profile.telefono || '');
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  const guardar = async () => {
    const e = {};
    const correoLimpio = correo.trim();
    const telefonoLimpio = telefono.trim();

    if (!esCorreoValido(correoLimpio)) {
      e.correo = 'Ingresa un correo válido.';
    }

    if (
      telefonoLimpio &&
      !/^[0-9+\s()-]{7,15}$/.test(telefonoLimpio)
    ) {
      e.telefono = 'Ingresa un teléfono válido.';
    }

    setErrores(e);

    if (Object.keys(e).length > 0) return;

    try {
      setGuardando(true);

      await updateProfile({
        correo: correoLimpio,
        telefono: telefonoLimpio,
      });

      notify('Perfil actualizado correctamente.');
      navigation.goBack();
    } catch (error) {
      notify(error.message || 'No se pudo actualizar el perfil.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <AdminDashboard variant="detail" title="Editar perfil">
      <PageScroll>
        <Card style={{ paddingVertical: 14 }}>
          <Field
            label="Nombres"
            value={profile.nombres || ''}
            editable={false}
          />

          <Field
            label="Apellidos"
            value={profile.apellidos || ''}
            editable={false}
          />

          <Field
            label="Correo institucional"
            value={correo}
            onChangeText={setCorreo}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errores.correo}
          />

          <Field
            label="Teléfono"
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
            error={errores.telefono}
          />

          <Field
            label="Rol"
            value={profile.rol || 'ADMIN'}
            editable={false}
          />
        </Card>

        <Button
          title={guardando ? 'Guardando...' : 'Guardar cambios'}
          icon="checkmark"
          onPress={guardar}
          disabled={guardando}
        />

        <Button
          title="Cancelar"
          variant="outline"
          onPress={() => navigation.goBack()}
          disabled={guardando}
        />
      </PageScroll>
    </AdminDashboard>
  );
}
