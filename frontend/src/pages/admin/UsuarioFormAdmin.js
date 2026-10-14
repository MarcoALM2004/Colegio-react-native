import React, { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';

import AdminDashboard from '../../components/AdminDashboard';
import { useAdminData } from '../../context/AdminDataContext';
import { Button, Card, Field, PageScroll, SelectField, notify } from '../../components/admin/AdminUI';
import { ROLES } from '../../data/adminMockData';
import { esCorreoValido } from '../../utils/adminHelpers';

// Crea o edita un usuario. Si recibe `id` en los params, edita.
export default function UsuarioFormAdmin() {
  const navigation = useNavigation();
  const params = useRoute().params || {};
  const { getUser, courses, courseShortName, users, addUser, updateUser } = useAdminData();

  const existente = params.id ? getUser(params.id) : null;
  const editando = !!existente;

  const [form, setForm] = useState({
    nombres: existente?.nombres || '',
    apellidos: existente?.apellidos || '',
    rol: existente?.rol || params.rol || ROLES.ESTUDIANTE,
    correo: existente?.correo || '',
    documento: existente?.documento || '',
    cursoId: existente?.cursoId || null,
    detalle: existente?.detalle || '',
  });
  const [errores, setErrores] = useState({});

  const set = (campo) => (valor) => setForm((prev) => ({ ...prev, [campo]: valor }));

  const validar = () => {
    const e = {};
    if (!form.nombres.trim()) e.nombres = 'Ingresa los nombres.';
    if (!form.apellidos.trim()) e.apellidos = 'Ingresa los apellidos.';
    if (!esCorreoValido(form.correo)) e.correo = 'Correo no válido.';
    else if (users.some((u) => u.correo.toLowerCase() === form.correo.toLowerCase() && u.id !== existente?.id)) {
      e.correo = 'Ya existe un usuario con ese correo.';
    }
    if (!/^\d{8}$/.test(form.documento)) e.documento = 'El DNI debe tener 8 dígitos.';
    if (form.rol === ROLES.ESTUDIANTE && !form.cursoId) e.cursoId = 'Selecciona un curso.';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const guardar = () => {
    if (!validar()) return;

    const datos = {
      ...form,
      nombres: form.nombres.trim(),
      apellidos: form.apellidos.trim(),
      correo: form.correo.trim().toLowerCase(),
      cursoId: form.rol === ROLES.ESTUDIANTE ? form.cursoId : null,
      detalle: form.rol === ROLES.ESTUDIANTE ? '' : form.detalle.trim(),
    };

    if (editando) {
      updateUser(existente.id, datos);
      notify('Usuario actualizado');
      navigation.goBack();
    } else {
      const nuevo = addUser(datos);
      notify('Usuario creado', `Código asignado: ${nuevo.codigo}`);
      navigation.replace('AdminUsuarioDetalle', { id: nuevo.id });
    }
  };

  const opcionesCurso = courses.map((c) => ({ value: c.id, label: courseShortName(c) }));

  return (
    <AdminDashboard variant="detail" title={editando ? 'Editar usuario' : 'Nuevo usuario'}>
      <PageScroll>
        <Card style={{ paddingVertical: 14 }}>
          <SelectField label="Rol" options={Object.values(ROLES)} value={form.rol} onChange={set('rol')} />
          <Field
            label="Nombres"
            value={form.nombres}
            onChangeText={set('nombres')}
            placeholder="Ej. Ana"
            error={errores.nombres}
          />
          <Field
            label="Apellidos"
            value={form.apellidos}
            onChangeText={set('apellidos')}
            placeholder="Ej. Torres"
            error={errores.apellidos}
          />
          <Field
            label="Correo institucional"
            value={form.correo}
            onChangeText={set('correo')}
            placeholder="nombre.apellido@salcantay.edu.pe"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errores.correo}
          />
          <Field
            label="Documento (DNI)"
            value={form.documento}
            onChangeText={(t) => set('documento')(t.replace(/\D/g, '').slice(0, 8))}
            placeholder="8 dígitos"
            keyboardType="number-pad"
            error={errores.documento}
          />

          {form.rol === ROLES.ESTUDIANTE ? (
            <SelectField
              label="Grado y sección"
              options={opcionesCurso}
              value={form.cursoId}
              onChange={set('cursoId')}
              error={errores.cursoId}
            />
          ) : (
            <Field
              label={form.rol === ROLES.DOCENTE ? 'Especialidad' : 'Área'}
              value={form.detalle}
              onChangeText={set('detalle')}
              placeholder={form.rol === ROLES.DOCENTE ? 'Ej. Matemáticas' : 'Ej. Secretaría'}
            />
          )}
        </Card>

        <Button title={editando ? 'Guardar cambios' : 'Crear usuario'} icon="checkmark" onPress={guardar} />
        <Button title="Cancelar" variant="outline" onPress={() => navigation.goBack()} />
      </PageScroll>
    </AdminDashboard>
  );
}
