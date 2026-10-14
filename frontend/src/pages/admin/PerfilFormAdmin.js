import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';

import AdminDashboard from '../../components/AdminDashboard';
import { useAdminData } from '../../context/AdminDataContext';
import { Button, Card, Field, PageScroll, notify } from '../../components/admin/AdminUI';
import { esCorreoValido } from '../../utils/adminHelpers';

export default function PerfilFormAdmin() {
  const navigation = useNavigation();
  const { profile, updateProfile } = useAdminData();

  const [form, setForm] = useState({
    nombres: profile.nombres,
    apellidos: profile.apellidos,
    correo: profile.correo,
    telefono: profile.telefono,
    documento: profile.documento,
  });
  const [errores, setErrores] = useState({});

  const set = (campo) => (valor) => setForm((prev) => ({ ...prev, [campo]: valor }));

  const guardar = () => {
    const e = {};
    if (!form.nombres.trim()) e.nombres = 'Ingresa tus nombres.';
    if (!form.apellidos.trim()) e.apellidos = 'Ingresa tus apellidos.';
    if (!esCorreoValido(form.correo)) e.correo = 'Correo no válido.';
    if (!/^\d{8}$/.test(form.documento)) e.documento = 'El DNI debe tener 8 dígitos.';
    setErrores(e);
    if (Object.keys(e).length) return;

    updateProfile({
      ...form,
      nombres: form.nombres.trim(),
      apellidos: form.apellidos.trim(),
      correo: form.correo.trim().toLowerCase(),
    });
    notify('Perfil actualizado');
    navigation.goBack();
  };

  return (
    <AdminDashboard variant="detail" title="Editar perfil">
      <PageScroll>
        <Card style={{ paddingVertical: 14 }}>
          <Field label="Nombres" value={form.nombres} onChangeText={set('nombres')} error={errores.nombres} />
          <Field label="Apellidos" value={form.apellidos} onChangeText={set('apellidos')} error={errores.apellidos} />
          <Field
            label="Correo institucional"
            value={form.correo}
            onChangeText={set('correo')}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errores.correo}
          />
          <Field label="Teléfono" value={form.telefono} onChangeText={set('telefono')} keyboardType="phone-pad" />
          <Field
            label="Documento (DNI)"
            value={form.documento}
            onChangeText={(t) => set('documento')(t.replace(/\D/g, '').slice(0, 8))}
            keyboardType="number-pad"
            error={errores.documento}
          />
        </Card>
        <Button title="Guardar cambios" icon="checkmark" onPress={guardar} />
        <Button title="Cancelar" variant="outline" onPress={() => navigation.goBack()} />
      </PageScroll>
    </AdminDashboard>
  );
}
