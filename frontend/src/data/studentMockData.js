export const studentProfile = {
  nombres: 'Marco Antonio', apellidos: 'Flores', codigo: 'E223',
  grado: '1° de Secundaria', correo: 'marco@salcantay.edu.pe',
  telefono: '+51 987 654 321', fechaNacimiento: '15 de julio de 2009',
};

export const courses = [
  { id: 'matematica', nombre: 'Matemática', descripcion: 'Desarrolla tu pensamiento lógico y resuelve problemas.', docente: 'María López', aula: 'Aula 305', horario: 'Lun y Mié · 10:30 - 12:00', color: '#4A8AF4', icono: 'book-outline', nota: 18 },
  { id: 'ciencia', nombre: 'Ciencia y Tecnología', descripcion: 'Explora el mundo a través de la ciencia.', docente: 'Elena Díaz', aula: 'Laboratorio 2', horario: 'Mar y Jue · 08:00 - 09:30', color: '#8067E8', icono: 'flask-outline', nota: 16 },
  { id: 'comunicacion', nombre: 'Comunicación', descripcion: 'Mejora tus habilidades de lectura, escritura y expresión.', docente: 'Carlos Mendoza', aula: 'Aula 204', horario: 'Lun y Vie · 08:00 - 10:00', color: '#20A875', icono: 'chatbox-ellipses-outline', nota: 16 },
  { id: 'arte', nombre: 'Arte y Cultura', descripcion: 'Desarrolla tu creatividad y aprecia el arte.', docente: 'Rosa Quispe', aula: 'Aula de arte', horario: 'Mié · 14:00 - 16:00', color: '#F2A93B', icono: 'color-palette-outline', nota: 15 },
  { id: 'fisica', nombre: 'Educación Física', descripcion: 'Cuida tu salud y desarrolla un estilo de vida activo.', docente: 'José Ramírez', aula: 'Patio principal', horario: 'Vie · 14:00 - 16:00', color: '#EF4444', icono: 'barbell-outline', nota: 19 },
  { id: 'social', nombre: 'Personal Social', descripcion: 'Conoce tu entorno y participa en la sociedad.', docente: 'Ana Ruiz', aula: 'Aula 201', horario: 'Mar · 10:30 - 12:00', color: '#20B7C5', icono: 'people-outline', nota: 16 },
  { id: 'ingles', nombre: 'Inglés', descripcion: 'Mejora tu comunicación en un mundo global.', docente: 'Carlos Ramírez', aula: 'Aula 203', horario: 'Jue · 10:30 - 12:00', color: '#E9579D', icono: 'language-outline', nota: 18 },
  { id: 'computacion', nombre: 'Computación', descripcion: 'Aprende y crea con la tecnología del futuro.', docente: 'Luis Soto', aula: 'Aula 305', horario: 'Lun · 10:30 - 12:30', color: '#6366D9', icono: 'laptop-outline', nota: 17 },
];

export const initialTasks = [
  { id: 't1', titulo: 'Tarea de comunicación', curso: 'Comunicación', fecha: '12 sep', estado: 'Pendiente', icono: 'document-text-outline', color: '#F16A76' },
  { id: 't2', titulo: 'Investigación sobre IA', curso: 'Computación', fecha: '13 sep', estado: 'Pendiente', icono: 'bulb-outline', color: '#8067E8' },
  { id: 't3', titulo: 'Mapa conceptual', curso: 'Personal Social', fecha: '15 sep', estado: 'Pendiente', icono: 'map-outline', color: '#20B7C5' },
  { id: 't4', titulo: 'Ejercicios de álgebra', curso: 'Matemática', fecha: '18 sep', estado: 'Vencida', icono: 'calculator-outline', color: '#EF4444' },
  { id: 't5', titulo: 'Resumen de la unidad', curso: 'Ciencia y Tecnología', fecha: '20 sep', estado: 'Entregada', icono: 'document-attach-outline', color: '#20A875' },
];

export const events = [
  { dia: 8, titulo: 'Comunicación', hora: '08:00 - 10:00', color: '#20A875' },
  { dia: 9, titulo: 'Ciencia y Tecnología', hora: '08:00 - 09:30', color: '#8067E8' },
  { dia: 10, titulo: 'Clase de Inglés', hora: '10:30 - 12:00', color: '#4A8AF4' },
  { dia: 15, titulo: 'Tarea: Ensayo', hora: 'Hasta las 23:59', color: '#F2A93B' },
  { dia: 18, titulo: 'Evaluación de Matemática', hora: '10:30 - 12:00', color: '#EF4444' },
  { dia: 22, titulo: 'Entrega de proyecto', hora: 'Computación', color: '#6366D9' },
];

export const conversations = [
  { id: 'c1', nombre: 'Prof. Carlos Mendoza', iniciales: 'CM', color: '#4A8AF4', ultimo: 'Hola Marco, te comparto la tarea de la próxima clase.', hora: '10:24', mensajes: [{ deMi: false, texto: 'Hola Marco, te comparto la tarea de la próxima clase.', hora: '10:24' }, { deMi: false, texto: 'Guía de trabajo de la unidad 2', hora: '10:25' }] },
  { id: 'c2', nombre: 'Prof. Ana Torres', iniciales: 'AT', color: '#20A875', ultimo: 'Recuerda traer tus materiales.', hora: 'Ayer', mensajes: [{ deMi: false, texto: 'Recuerda traer tus materiales.', hora: 'Ayer' }] },
  { id: 'c3', nombre: 'Prof. Miguel Ruiz', iniciales: 'MR', color: '#8067E8', ultimo: 'Entrega del proyecto final.', hora: 'Lun', mensajes: [{ deMi: false, texto: 'Entrega del proyecto final.', hora: 'Lun' }] },
];
