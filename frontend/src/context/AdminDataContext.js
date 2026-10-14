import React, { createContext, useContext, useMemo, useState } from 'react';

import {
  adminProfile,
  initialActivity,
  initialConversations,
  initialCourses,
  initialEvents,
  initialLibrary,
  initialUsers,
  defaultSettings,
  ROLES,
} from '../data/adminMockData';

// Estado del panel de administrador.
// Por ahora vive en memoria con datos de ejemplo; aquí es donde se
// conectarían los endpoints del backend cuando existan.

const AdminDataContext = createContext(null);

let contador = 100;
const nuevoId = (prefijo) => `${prefijo}${++contador}`;

const horaActual = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const PREFIJO_CODIGO = {
  [ROLES.ESTUDIANTE]: 'ES',
  [ROLES.DOCENTE]: 'DO',
  [ROLES.ADMIN]: 'AD',
};

export function AdminDataProvider({ children }) {
  const [profile, setProfile] = useState(adminProfile);
  const [users, setUsers] = useState(initialUsers);
  const [courses, setCourses] = useState(initialCourses);
  const [library, setLibrary] = useState(initialLibrary);
  const [events, setEvents] = useState(initialEvents);
  const [conversations, setConversations] = useState(initialConversations);
  const [activity, setActivity] = useState(initialActivity);
  const [settings, setSettings] = useState(defaultSettings);

  const registrarActividad = (icono, titulo, detalle) => {
    setActivity((prev) => [{ id: nuevoId('a'), icono, titulo, detalle, fecha: `Hoy ${horaActual()}` }, ...prev]);
  };

  const value = useMemo(() => {
    // ---------- Consultas ----------
    const getUser = (id) => users.find((u) => u.id === id);
    const getCourse = (id) => courses.find((c) => c.id === id);

    const courseName = (course) => (course ? `${course.grado} ${course.nivel} ${course.seccion}` : 'Sin asignar');

    const courseShortName = (course) =>
      course ? `${course.grado} ${course.nivel === 'Secundaria' ? 'Sec' : 'Prim'} ${course.seccion}` : '';

    const studentsInCourse = (courseId) => users.filter((u) => u.rol === ROLES.ESTUDIANTE && u.cursoId === courseId);

    // Matriculados = base histórica + estudiantes registrados en la app.
    const courseStudentCount = (course) => course.estudiantesBase + studentsInCourse(course.id).length;

    const stats = {
      estudiantes: courses.reduce((acc, c) => acc + courseStudentCount(c), 0),
      docentes: users.filter((u) => u.rol === ROLES.DOCENTE).length,
      cursos: courses.length,
      inactivos: users.filter((u) => !u.activo).length,
      libros: library.length,
      mensajesNoLeidos: conversations.reduce((acc, c) => acc + c.noLeidos, 0),
    };

    // ---------- Usuarios ----------
    const generarCodigo = (rol) => {
      const prefijo = PREFIJO_CODIGO[rol] || 'US';
      const numeros = users
        .filter((u) => u.codigo.startsWith(prefijo))
        .map((u) => parseInt(u.codigo.slice(2), 10) || 0);
      const siguiente = (numeros.length ? Math.max(...numeros) : 100000) + 1;
      return `${prefijo}${siguiente}`;
    };

    const addUser = (data) => {
      const user = {
        id: nuevoId('u'),
        codigo: generarCodigo(data.rol),
        activo: true,
        fechaRegistro: new Date().toISOString().slice(0, 10),
        detalle: '',
        cursoId: null,
        ...data,
      };
      setUsers((prev) => [user, ...prev]);
      registrarActividad(
        'person-add-outline',
        `Nuevo ${data.rol.toLowerCase()} registrado`,
        `${user.nombres} ${user.apellidos}`
      );
      return user;
    };

    const updateUser = (id, data) => {
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)));
    };

    const toggleUserActive = (id) => {
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, activo: !u.activo } : u)));
    };

    const deleteUser = (id) => {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setConversations((prev) => prev.filter((c) => c.usuarioId !== id));
    };

    const resetPassword = (id) => {
      const user = getUser(id);
      if (user) {
        registrarActividad('key-outline', 'Contraseña restablecida', `${user.nombres} ${user.apellidos}`);
      }
    };

    // ---------- Cursos ----------
    const addCourse = (data) => {
      const course = {
        id: nuevoId('c'),
        estudiantesBase: 0,
        anio: new Date().getFullYear(),
        horario: [],
        ...data,
        codigo: `${data.nivel === 'Primaria' ? 'PRI' : 'SEC'}-${parseInt(data.grado, 10)}${data.seccion}`,
      };
      setCourses((prev) => [...prev, course]);
      registrarActividad('school-outline', 'Curso creado', courseName(course));
      return course;
    };

    const updateCourse = (id, data) => {
      setCourses((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c;
          const merged = { ...c, ...data };
          merged.codigo = `${merged.nivel === 'Primaria' ? 'PRI' : 'SEC'}-${parseInt(merged.grado, 10)}${merged.seccion}`;
          return merged;
        })
      );
      registrarActividad('create-outline', 'Curso actualizado', courseName({ ...getCourse(id), ...data }));
    };

    const deleteCourse = (id) => {
      setCourses((prev) => prev.filter((c) => c.id !== id));
      setUsers((prev) => prev.map((u) => (u.cursoId === id ? { ...u, cursoId: null } : u)));
    };

    // ---------- Biblioteca ----------
    const addResource = (data) => {
      const item = { id: nuevoId('b'), descargas: 0, ...data };
      setLibrary((prev) => [item, ...prev]);
      registrarActividad('book-outline', 'Recurso agregado', data.titulo);
      return item;
    };

    const deleteResource = (id) => setLibrary((prev) => prev.filter((b) => b.id !== id));

    const registerDownload = (id) =>
      setLibrary((prev) => prev.map((b) => (b.id === id ? { ...b, descargas: b.descargas + 1 } : b)));

    // ---------- Calendario ----------
    const addEvent = (data) => {
      const evento = { id: nuevoId('e'), ...data };
      setEvents((prev) => [...prev, evento]);
      return evento;
    };

    const deleteEvent = (id) => setEvents((prev) => prev.filter((e) => e.id !== id));

    // ---------- Mensajes ----------
    const getConversation = (id) => conversations.find((c) => c.id === id);

    const openConversationWith = (usuarioId) => {
      const existente = conversations.find((c) => c.usuarioId === usuarioId);
      if (existente) return existente.id;
      const id = nuevoId('m');
      setConversations((prev) => [{ id, usuarioId, noLeidos: 0, mensajes: [] }, ...prev]);
      return id;
    };

    const markAsRead = (id) => setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, noLeidos: 0 } : c)));

    const sendMessage = (conversationId, texto) => {
      const mensaje = { id: nuevoId('msg'), deMi: true, texto, hora: horaActual() };
      setConversations((prev) => {
        const actual = prev.find((c) => c.id === conversationId);
        if (!actual) return prev;
        const actualizada = { ...actual, mensajes: [...actual.mensajes, mensaje] };
        // La conversación con el último mensaje sube al inicio
        return [actualizada, ...prev.filter((c) => c.id !== conversationId)];
      });
    };

    // ---------- Perfil y configuración ----------
    const updateProfile = (data) => setProfile((prev) => ({ ...prev, ...data }));

    const updateSettings = (section, data) =>
      setSettings((prev) => ({
        ...prev,
        [section]: typeof data === 'object' ? { ...prev[section], ...data } : data,
      }));

    return {
      profile,
      users,
      courses,
      library,
      events,
      conversations,
      activity,
      settings,
      stats,

      getUser,
      getCourse,
      courseName,
      courseShortName,
      studentsInCourse,
      courseStudentCount,

      addUser,
      updateUser,
      toggleUserActive,
      deleteUser,
      resetPassword,

      addCourse,
      updateCourse,
      deleteCourse,

      addResource,
      deleteResource,
      registerDownload,

      addEvent,
      deleteEvent,

      getConversation,
      openConversationWith,
      markAsRead,
      sendMessage,

      updateProfile,
      updateSettings,
    };
  }, [profile, users, courses, library, events, conversations, activity, settings]);

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}

export function useAdminData() {
  const ctx = useContext(AdminDataContext);
  if (!ctx) {
    throw new Error('useAdminData debe usarse dentro de <AdminDataProvider>');
  }
  return ctx;
}
