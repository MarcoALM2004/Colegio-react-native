import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

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

import {
  listarUsuariosAdmin,
  crearUsuarioAdmin,
  actualizarUsuarioAdmin,
} from '../service/adminUsuariosService';

import {
  obtenerPerfilAdmin,
  actualizarPerfilAdmin,
} from '../service/adminPerfilService';

import { eliminarUsuarioAdmin } from '../service/adminUsuariosService';

const AdminDataContext = createContext(null);

let contador = 100;

const nuevoId = (prefijo) => `${prefijo}${++contador}`;

const horaActual = () => {
  const d = new Date();

  return `${String(d.getHours()).padStart(2, '0')}:${String(
    d.getMinutes()
  ).padStart(2, '0')}`;
};

const PREFIJO_CODIGO = {
  [ROLES.ESTUDIANTE]: 'ES',
  [ROLES.DOCENTE]: 'DO',
  [ROLES.ADMIN]: 'AD',
};

export function AdminDataProvider({ children, codigoUsuario }) {
  const [profile, setProfile] = useState(adminProfile);
  const [users, setUsers] = useState(initialUsers);
  const [courses, setCourses] = useState(initialCourses);
  const [library, setLibrary] = useState(initialLibrary);
  const [events, setEvents] = useState(initialEvents);
  const [conversations, setConversations] = useState(initialConversations);
  const [activity, setActivity] = useState(initialActivity);
  const [settings, setSettings] = useState(defaultSettings);

  // ---------- Cargar perfil del administrador ----------
  useEffect(() => {
    if (!codigoUsuario) return;

    let cancelado = false;

    const cargarPerfil = async () => {
      try {
        const datos = await obtenerPerfilAdmin(codigoUsuario);

        if (cancelado) return;

        setProfile((anterior) => ({
          ...anterior,
          ...datos,
        }));
      } catch (error) {
        console.error(
          'Error al cargar el perfil del administrador:',
          error.message
        );
      }
    };

    cargarPerfil();

    return () => {
      cancelado = true;
    };
  }, [codigoUsuario]);

  const registrarActividad = (icono, titulo, detalle) => {
    setActivity((prev) => [
      {
        id: nuevoId('a'),
        icono,
        titulo,
        detalle,
        fecha: `Hoy ${horaActual()}`,
      },
      ...prev,
    ]);
  };

  //-------------mapeo roles t datos----------
  const rolBackendAFrontend = (rol) => {
    switch ((rol || '').toUpperCase()) {
      case 'ALUMNO':
        return ROLES.ESTUDIANTE;
      case 'DOCENTE':
        return ROLES.DOCENTE;
      case 'ADMIN':
        return ROLES.ADMIN;
      default:
        return rol;
    }
  };

  const usuarioBackendAFrontend = (u) => ({
    ...u,
    id: u.id,
    codigo: u.codigo,
    rol: rolBackendAFrontend(u.rol),
    documento: u.dni || '',
    detalle: u.especialidad || '',
    cursoId: null,
    grado: u.grado || '',
    seccion: u.seccion || '',
    activo: u.activo,
  });

    //-----
    useEffect(() => {
      let cancelado = false;

      const cargarUsuarios = async () => {
        try {
          const datos = await listarUsuariosAdmin();

          if (!cancelado) {
            setUsers(datos.map(usuarioBackendAFrontend));
          }
        } catch (error) {
          console.error('Error al cargar usuarios:', error.message);
        }
      };

      cargarUsuarios();

      return () => {
        cancelado = true;
      };
    }, []);

  //-----------------------------

  const value = useMemo(() => {
    // ---------- Consultas ----------
    const getUser = (id) => users.find((u) => u.id === id);

    const getCourse = (id) => courses.find((c) => c.id === id);

    const courseName = (course) =>
      course
        ? `${course.grado} ${course.nivel} ${course.seccion}`
        : 'Sin asignar';

    const courseShortName = (course) =>
      course
        ? `${course.grado} ${
            course.nivel === 'Secundaria' ? 'Sec' : 'Prim'
          } ${course.seccion}`
        : '';

    const studentsInCourse = (courseId) =>
      users.filter(
        (u) =>
          u.rol === ROLES.ESTUDIANTE &&
          u.cursoId === courseId
      );

    const courseStudentCount = (course) =>
      course.estudiantesBase + studentsInCourse(course.id).length;

    const stats = {
      estudiantes: courses.reduce(
        (acc, c) => acc + courseStudentCount(c),
        0
      ),
      docentes: users.filter((u) => u.rol === ROLES.DOCENTE).length,
      cursos: courses.length,
      inactivos: users.filter((u) => !u.activo).length,
      libros: library.length,
      mensajesNoLeidos: conversations.reduce(
        (acc, c) => acc + c.noLeidos,
        0
      ),
    };

    // ---------- Usuarios ----------
    const addUser = async (data) => {
      const prefijos = {
        [ROLES.ADMIN]: 'A',
        [ROLES.DOCENTE]: 'C',
        [ROLES.ESTUDIANTE]: 'E',
      };

      const nuevo = await crearUsuarioAdmin({
        rol: prefijos[data.rol],
        nombres: data.nombres.trim(),
        apellidos: data.apellidos.trim(),
        correo: data.correo.trim().toLowerCase(),
        dni: data.documento,
        telefono: data.telefono || null,
        grado: data.rol === ROLES.ESTUDIANTE ? data.grado : null,
        seccion: data.rol === ROLES.ESTUDIANTE ? data.seccion : null,
        especialidad: data.rol === ROLES.DOCENTE ? data.detalle : null,
        password: data.password,
      });

      const datos = await listarUsuariosAdmin();
      setUsers(datos.map(usuarioBackendAFrontend));

      return nuevo;
    };

    const updateUser = async (id, data) => {
      const existente = users.find(
        (u) => String(u.id) === String(id) || u.codigo === id
      );

      if (!existente) {
        throw new Error('No se encontró el usuario que deseas editar.');
      }

      const actualizado = await actualizarUsuarioAdmin(existente.codigo, {
        nombres: data.nombres.trim(),
        apellidos: data.apellidos.trim(),
        correo: data.correo.trim().toLowerCase(),
        dni: data.documento,
        telefono: data.telefono || null,
        grado: data.rol === ROLES.ESTUDIANTE ? data.grado : null,
        seccion: data.rol === ROLES.ESTUDIANTE ? data.seccion : null,
        especialidad: data.rol === ROLES.DOCENTE ? data.detalle : null,
        password: data.password || null,
      });

      const usuario = usuarioBackendAFrontend(actualizado);

      setUsers((prev) =>
        prev.map((u) =>
          String(u.id) === String(id) ? usuario : u
        )
      );

      registrarActividad(
        'create-outline',
        'Usuario actualizado',
        `${usuario.nombres} ${usuario.apellidos}`
      );

      return usuario;
    };

    // ---------- Acciones de usuarios ----------

    const toggleUserActive = (id) => {
      setUsers((prev) =>
        prev.map((u) =>
          String(u.id) === String(id) || u.codigo === id
            ? { ...u, activo: !u.activo }
            : u
        )
      );
    };


    const deleteUser = async (id) => {
      const usuario = users.find(
        (u) =>
          String(u.id) === String(id) || u.codigo === id
      );

      if (!usuario) {
        throw new Error('No se encontró el usuario.');
      }

      await eliminarUsuarioAdmin(usuario.codigo);

      setUsers((prev) =>
        prev.filter((u) => u.codigo !== usuario.codigo)
      );

      registrarActividad(
        'trash-outline',
        'Usuario eliminado',
        `${usuario.nombres} ${usuario.apellidos}`
      );
    };


    const resetPassword = (id) => {
      const usuario = users.find(
        (u) =>
          String(u.id) === String(id) || u.codigo === id
      );

      if (!usuario) {
        throw new Error('No se encontró el usuario.');
      }

      throw new Error(
        'El restablecimiento de contraseña todavía no está conectado al backend.'
      );
    };

    // ---------- Cursos ----------
    const addCourse = (data) => {
      const course = {
        id: nuevoId('c'),
        estudiantesBase: 0,
        anio: new Date().getFullYear(),
        horario: [],
        ...data,
        codigo: `${
          data.nivel === 'Primaria' ? 'PRI' : 'SEC'
        }-${parseInt(data.grado, 10)}${data.seccion}`,
      };

      setCourses((prev) => [...prev, course]);

      registrarActividad(
        'school-outline',
        'Curso creado',
        courseName(course)
      );

      return course;
    };

    const updateCourse = (id, data) => {
      setCourses((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c;

          const merged = { ...c, ...data };

          merged.codigo = `${
            merged.nivel === 'Primaria' ? 'PRI' : 'SEC'
          }-${parseInt(merged.grado, 10)}${merged.seccion}`;

          return merged;
        })
      );

      registrarActividad(
        'create-outline',
        'Curso actualizado',
        courseName({ ...getCourse(id), ...data })
      );
    };

    const deleteCourse = (id) => {
      setCourses((prev) => prev.filter((c) => c.id !== id));

      setUsers((prev) =>
        prev.map((u) =>
          u.cursoId === id ? { ...u, cursoId: null } : u
        )
      );
    };

    // ---------- Biblioteca ----------
    const addResource = (data) => {
      const item = {
        id: nuevoId('b'),
        descargas: 0,
        ...data,
      };

      setLibrary((prev) => [item, ...prev]);

      registrarActividad(
        'book-outline',
        'Recurso agregado',
        data.titulo
      );

      return item;
    };

    const deleteResource = (id) => {
      setLibrary((prev) => prev.filter((b) => b.id !== id));
    };

    const registerDownload = (id) => {
      setLibrary((prev) =>
        prev.map((b) =>
          b.id === id
            ? { ...b, descargas: b.descargas + 1 }
            : b
        )
      );
    };

    // ---------- Calendario ----------
    const addEvent = (data) => {
      const evento = {
        id: nuevoId('e'),
        ...data,
      };

      setEvents((prev) => [...prev, evento]);

      return evento;
    };

    const deleteEvent = (id) => {
      setEvents((prev) => prev.filter((e) => e.id !== id));
    };

    // ---------- Mensajes ----------
    const getConversation = (id) =>
      conversations.find((c) => c.id === id);

    const openConversationWith = (usuarioId) => {
      const existente = conversations.find(
        (c) => c.usuarioId === usuarioId
      );

      if (existente) return existente.id;

      const id = nuevoId('m');

      setConversations((prev) => [
        { id, usuarioId, noLeidos: 0, mensajes: [] },
        ...prev,
      ]);

      return id;
    };

    const markAsRead = (id) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, noLeidos: 0 } : c
        )
      );
    };

    const sendMessage = (conversationId, texto) => {
      const mensaje = {
        id: nuevoId('msg'),
        deMi: true,
        texto,
        hora: horaActual(),
      };

      setConversations((prev) => {
        const actual = prev.find(
          (c) => c.id === conversationId
        );

        if (!actual) return prev;

        const actualizada = {
          ...actual,
          mensajes: [...actual.mensajes, mensaje],
        };

        return [
          actualizada,
          ...prev.filter((c) => c.id !== conversationId),
        ];
      });
    };

    // ---------- Perfil ----------
    const updateProfile = async (data) => {
      if (!codigoUsuario) {
        throw new Error(
          'No se encontró el código del administrador.'
        );
      }

      const actualizado = await actualizarPerfilAdmin(
        codigoUsuario,
        {
          correo: data.correo,
          telefono: data.telefono,
        }
      );

      setProfile((anterior) => ({
        ...anterior,
        ...actualizado,
      }));

      return actualizado;
    };

    // ---------- Configuración ----------
    const updateSettings = (section, data) =>
      setSettings((prev) => ({
        ...prev,
        [section]:
          typeof data === 'object'
            ? { ...prev[section], ...data }
            : data,
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
  }, [
    profile,
    users,
    courses,
    library,
    events,
    conversations,
    activity,
    settings,
    codigoUsuario,
  ]);

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  const ctx = useContext(AdminDataContext);

  if (!ctx) {
    throw new Error(
      'useAdminData debe usarse dentro de <AdminDataProvider>'
    );
  }

  return ctx;
}
