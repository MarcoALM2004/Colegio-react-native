import React, { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';

import AdminDashboard from '../../components/AdminDashboard';
import { useAdminData } from '../../context/AdminDataContext';
import {
  Button,
  Card,
  Field,
  PageScroll,
  SelectField,
  notify,
} from '../../components/admin/AdminUI';
import { ROLES } from '../../data/adminMockData';
import { esCorreoValido } from '../../utils/adminHelpers';

const OPCIONES_GRADO = [
  { value: '1', label: '1.° grado' },
  { value: '2', label: '2.° grado' },
  { value: '3', label: '3.° grado' },
  { value: '4', label: '4.° grado' },
  { value: '5', label: '5.° grado' },
  { value: '6', label: '6.° grado' },
];

const OPCIONES_SECCION = ['A', 'B', 'C', 'D'].map((seccion) => ({
  value: seccion,
  label: seccion,
}));

export default function UsuarioFormAdmin() {
  const navigation = useNavigation();
  const params = useRoute().params || {};

  const { getUser, users, addUser, updateUser } = useAdminData();

  const existente = params.id ? getUser(params.id) : null;
  const editando = Boolean(existente);

  const [form, setForm] = useState({
    nombres: existente?.nombres || '',
    apellidos: existente?.apellidos || '',
    rol: existente?.rol || params.rol || ROLES.ESTUDIANTE,
    correo: existente?.correo || '',
    documento: existente?.documento || existente?.dni || '',
    telefono: existente?.telefono || '',
    grado: existente?.grado || '',
    seccion: existente?.seccion || '',
    detalle: existente?.detalle || existente?.especialidad || '',
    password: '',
    mostrarPassword: false,
  });

  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  const set = (campo) => (valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const validar = () => {
    const e = {};

    if (!form.nombres.trim()) {
      e.nombres = 'Ingresa los nombres.';
    }

    if (!form.apellidos.trim()) {
      e.apellidos = 'Ingresa los apellidos.';
    }

    if (!esCorreoValido(form.correo)) {
      e.correo = 'Correo no válido.';
    } else if (
      users.some(
        (u) =>
          (u.correo || '').toLowerCase() ===
            form.correo.trim().toLowerCase() &&
          String(u.id) !== String(existente?.id) &&
          u.codigo !== existente?.codigo
      )
    ) {
      e.correo = 'Ya existe un usuario con ese correo.';
    }

    if (!/^\d{8}$/.test(form.documento)) {
      e.documento = 'El DNI debe tener 8 dígitos.';
    }

    if (!editando && form.password.length < 8) {
      e.password = 'La contraseña debe tener al menos 8 caracteres.';
    }

    if (editando && form.password && form.password.length < 8) {
      e.password = 'La nueva contraseña debe tener al menos 8 caracteres.';
    }

    if (
      form.rol === ROLES.ESTUDIANTE &&
      (!form.grado || !form.seccion)
    ) {
      if (!form.grado) e.grado = 'Selecciona el grado.';
      if (!form.seccion) e.seccion = 'Selecciona la sección.';
    }

    if (
      form.rol === ROLES.DOCENTE &&
      !form.detalle.trim()
    ) {
      e.detalle = 'Ingresa la especialidad.';
    }

    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const guardar = async () => {
    if (guardando || !validar()) return;

    setGuardando(true);

    try {
      const datos = {
        nombres: form.nombres.trim(),
        apellidos: form.apellidos.trim(),
        rol: form.rol,
        correo: form.correo.trim().toLowerCase(),
        documento: form.documento.trim(),
        telefono: form.telefono.trim(),
        grado: form.rol === ROLES.ESTUDIANTE ? form.grado : null,
        seccion: form.rol === ROLES.ESTUDIANTE ? form.seccion : null,
        detalle: form.rol === ROLES.DOCENTE ? form.detalle.trim() : '',
        password: form.password,
      };

      if (editando) {
        await updateUser(existente.id, datos);
        notify('Usuario actualizado');
        navigation.goBack();
      } else {
        const nuevo = await addUser(datos);

        notify(
          'Usuario creado',
          `Código: ${nuevo.codigo}\nContraseña: ${form.password}`
        );

        navigation.replace('AdminUsuarioDetalle', {
          id: nuevo.id,
        });
      }
    } catch (error) {
      notify(
        'No se pudo guardar',
        error?.message || 'Verifica los datos e inténtalo nuevamente.'
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <AdminDashboard
      variant="detail"
      title={editando ? 'Editar usuario' : 'Nuevo usuario'}
    >
      <PageScroll>
        <Card style={{ paddingVertical: 14 }}>
          <SelectField
            label="Rol"
            options={Object.values(ROLES)}
            value={form.rol}
            onChange={set('rol')}
          />

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
            placeholder="nombre@salcantay.edu.pe"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errores.correo}
          />

          <Field
            label="Documento (DNI)"
            value={form.documento}
            onChangeText={(valor) =>
              set('documento')(valor.replace(/\D/g, '').slice(0, 8))
            }
            placeholder="8 dígitos"
            keyboardType="number-pad"
            error={errores.documento}
          />

          <Field
            label="Teléfono"
            value={form.telefono}
            onChangeText={(valor) =>
              set('telefono')(valor.replace(/\D/g, '').slice(0, 15))
            }
            placeholder="Número de teléfono"
            keyboardType="phone-pad"
          />

          <Field
            label={editando ? 'Nueva contraseña (opcional)' : 'Contraseña'}
            value={form.password}
            onChangeText={set('password')}
            placeholder={
              editando
                ? 'Vacío para conservar la actual'
                : 'Mínimo 8 caracteres'
            }
            secureTextEntry={!form.mostrarPassword}
            autoCapitalize="none"
            error={errores.password}
          />

          <Button
            title={
              form.mostrarPassword
                ? 'Ocultar contraseña'
                : 'Mostrar contraseña'
            }
            variant="outline"
            onPress={() =>
              setForm((prev) => ({
                ...prev,
                mostrarPassword: !prev.mostrarPassword,
              }))
            }
          />

          {form.rol === ROLES.ESTUDIANTE && (
            <>
              <SelectField
                label="Grado"
                options={OPCIONES_GRADO}
                value={form.grado}
                onChange={set('grado')}
                error={errores.grado}
              />

              <SelectField
                label="Sección"
                options={OPCIONES_SECCION}
                value={form.seccion}
                onChange={set('seccion')}
                error={errores.seccion}
              />
            </>
          )}

          {form.rol === ROLES.DOCENTE && (
            <Field
              label="Especialidad"
              value={form.detalle}
              onChangeText={set('detalle')}
              placeholder="Ej. Matemáticas"
              error={errores.detalle}
            />
          )}
        </Card>

        <Button
          title={
            guardando
              ? 'Guardando...'
              : editando
                ? 'Guardar cambios'
                : 'Crear usuario'
          }
          icon="checkmark"
          onPress={guardar}
          disabled={guardando}
        />

        <Button
          title="Cancelar"
          variant="outline"
          onPress={() => navigation.goBack()}
        />
      </PageScroll>
    </AdminDashboard>
  );
}
