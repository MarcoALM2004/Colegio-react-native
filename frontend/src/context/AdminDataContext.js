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
  eliminarUsuarioAdmin,
} from '../service/adminUsuariosService';

import {
  obtenerPerfilAdmin,
  actualizarPerfilAdmin,
} from '../service/adminPerfilService';

import {
  listarCursosAdmin,
  crearCursoAdmin,
  actualizarCursoAdmin,
  eliminarCursoAdmin,
  listarEstudiantesCursoAdmin,
  listarEstudiantesDisponiblesCursoAdmin,
  matricularEstudiantesCursoAdmin,
  retirarEstudianteCursoAdmin,
} from '../service/adminCursosService';

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
  const [courses, setCourses] = useState([]);
  const [estudiantesPorCurso, setEstudiantesPorCurso] = useState({});
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

  // ---------- Conversión de datos del backend ----------
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

  const normalizarCurso = (c) => ({
    ...c,
    id: c.id,
    codigo:
      c.codigo ||
      `${c.nivel === 'Primaria' ? 'PRI' : 'SEC'}-${String(
        c.grado || ''
      ).replace('°', '')}${c.seccion || ''}`,
    nombre: c.nombre || '',
    docenteId: c.docenteId ?? null,
    tono: c.color || 'blue',
    color: c.color || 'blue',
    icono: c.icono || 'book-outline',
    anio: c.anio || new Date().getFullYear(),
    cantidadEstudiantes: Number(c.cantidadEstudiantes || 0),
    horario: Array.isArray(c.horario) ? c.horario : [],
  });

  // ---------- Cargar usuarios ----------
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

  // ---------- Cargar cursos desde el backend ----------
  useEffect(() => {
    let cancelado = false;

    const cargarCursos = async () => {
      try {
        const datos = await listarCursosAdmin();

        if (!cancelado) {
          setCourses(datos.map(normalizarCurso));
        }
      } catch (error) {
        console.error('Error al cargar cursos:', error.message);
      }
    };

    cargarCursos();

    return () => {
      cancelado = true;
    };
  }, []);

  const value = useMemo(() => {
    // ---------- Consultas ----------
    const getUser = (id) =>
      users.find((u) => String(u.id) === String(id));

    const getCourse = (id) =>
      courses.find((c) => String(c.id) === String(id));

    const courseName = (course) =>
      course
        ? `${course.nombre || 'Curso'} — ${course.grado} ${course.nivel} ${course.seccion}`
        : 'Sin asignar';

    const courseShortName = (course) =>
      course
        ? `${course.grado} ${
            course.nivel === 'Secundaria' ? 'Sec' : 'Prim'
          } ${course.seccion}`
        : '';

    const studentsInCourse = (courseId) =>
      estudiantesPorCurso[String(courseId)] || [];

    const courseStudentCount = (course) =>
      Number(
        course?.cantidadEstudiantes ??
          studentsInCourse(course?.id).length ??
          0
      );

    // ---------- Estudiantes de cursos ----------
    const loadCourseStudents = async (courseId) => {
      const data = await listarEstudiantesCursoAdmin(courseId);
      const mapped = data.map(usuarioBackendAFrontend);

      setEstudiantesPorCurso((prev) => ({
        ...prev,
        [String(courseId)]: mapped,
      }));

      return mapped;
    };

    const loadAvailableStudents = async (courseId, busqueda = '') => {
      const data = await listarEstudiantesDisponiblesCursoAdmin(
        courseId,
        busqueda
      );

      return data.map(usuarioBackendAFrontend);
    };

    const refreshCourses = async () => {
      const data = await listarCursosAdmin();
      setCourses(data.map(normalizarCurso));
      return data;
    };

    const enrollStudents = async (courseId, studentIds) => {
      await matricularEstudiantesCursoAdmin(courseId, studentIds);
      await loadCourseStudents(courseId);
      await refreshCourses();
    };

    const removeStudentFromCourse = async (courseId, studentId) => {
      await retirarEstudianteCursoAdmin(courseId, studentId);
      await loadCourseStudents(courseId);
      await refreshCourses();
    };

    // ---------- Estadísticas ----------
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
        grado:
          data.rol === ROLES.ESTUDIANTE ? data.grado : null,
        seccion:
          data.rol === ROLES.ESTUDIANTE ? data.seccion : null,
        especialidad:
          data.rol === ROLES.DOCENTE ? data.detalle : null,
        password: data.password,
      });

      const datos = await listarUsuariosAdmin();
      setUsers(datos.map(usuarioBackendAFrontend));

      return nuevo;
    };

    const updateUser = async (id, data) => {
      const existente = users.find(
        (u) =>
          String(u.id) === String(id) || u.codigo === id
      );

      if (!existente) {
        throw new Error(
          'No se encontró el usuario que deseas editar.'
        );
      }

      const actualizado = await actualizarUsuarioAdmin(
        existente.codigo,
        {
          nombres: data.nombres.trim(),
          apellidos: data.apellidos.trim(),
          correo: data.correo.trim().toLowerCase(),
          dni: data.documento,
          telefono: data.telefono || null,
          grado:
            data.rol === ROLES.ESTUDIANTE ? data.grado : null,
          seccion:
            data.rol === ROLES.ESTUDIANTE ? data.seccion : null,
          especialidad:
            data.rol === ROLES.DOCENTE ? data.detalle : null,
          password: data.password || null,
        }
      );

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

    // ---------- Cursos conectados al backend ----------
    const addCourse = async (data) => {
  const payload = {
      nombre: (data.nombre || '').trim(),
      nivel: data.nivel,
      grado: data.grado,
      seccion: data.seccion,
      docenteId: data.docenteId || null,
      descripcion: data.descripcion || '',
      color: data.tono || data.color || 'blue',
      icono: data.icono || 'book-outline',
    };

    const creado = await crearCursoAdmin(payload);
    await refreshCourses();

    const course = normalizarCurso({
      ...creado,
      nombre: creado.nombre || payload.nombre,
      docenteId: creado.docenteId ?? payload.docenteId,
      color: creado.color || payload.color,
      icono: creado.icono || payload.icono,
    });

    registrarActividad(
      'school-outline',
      'Curso creado',
      courseName(course)
    );

    return course;
  };

    const updateCourse = async (id, data) => {
    const actual = getCourse(id);

    const payload = {
      nombre: (data.nombre ?? actual?.nombre ?? '').trim(),
      nivel: data.nivel ?? actual?.nivel,
      grado: data.grado ?? actual?.grado,
      seccion: data.seccion ?? actual?.seccion,
      docenteId:
        data.docenteId === undefined
          ? actual?.docenteId ?? null
          : data.docenteId,
      descripcion:
        data.descripcion ?? actual?.descripcion ?? '',
      color:
        data.tono ||
        data.color ||
        actual?.color ||
        'blue',
      icono:
        data.icono ||
        actual?.icono ||
        'book-outline',
    };

    await actualizarCursoAdmin(id, payload);
    await refreshCourses();

    registrarActividad(
      'create-outline',
      'Curso actualizado',
      courseName({
        ...actual,
        ...payload,
      })
    );
  };

    const deleteCourse = async (id) => {
      await eliminarCursoAdmin(id);

      setCourses((prev) =>
        prev.filter((c) => String(c.id) !== String(id))
      );

      setEstudiantesPorCurso((prev) => {
        const copia = { ...prev };
        delete copia[String(id)];
        return copia;
      });
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
      setLibrary((prev) =>
        prev.filter((b) => b.id !== id)
      );
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
      setEvents((prev) =>
        prev.filter((e) => e.id !== id)
      );
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
      loadCourseStudents,
      loadAvailableStudents,
      enrollStudents,
      removeStudentFromCourse,

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
    estudiantesPorCurso,
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