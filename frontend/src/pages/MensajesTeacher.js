import React from 'react';
import MensajesUI from '../components/MensajesUI';

const teacherConversations = [
  {
    id: 't1',
    name: 'Ana Torres',
    role: 'Estudiante · 5° A',
    avatar: 'AT',
    color: '#4A8AF4',
    ultimo: '¿Podría explicarme nuevamente el proyecto?',
    hora: '09:20',
    messages: [
      {
        id: 'm1',
        text: 'Profesor, ¿podría explicarme nuevamente el proyecto final?',
        time: '09:15',
        mine: false,
      },
      {
        id: 'm2',
        text: 'Claro, revisaremos las indicaciones en clase.',
        time: '09:20',
        mine: true,
      },
    ],
  },
  {
    id: 't2',
    name: 'Luis Mendoza',
    role: 'Estudiante · 4° A',
    avatar: 'LM',
    color: '#20A875',
    ultimo: '¿La práctica se entrega mañana?',
    hora: '10:30',
    messages: [
      {
        id: 'm3',
        text: '¿La práctica se entrega mañana?',
        time: '10:30',
        mine: false,
      },
    ],
  },
  {
    id: 't3',
    name: 'María Flores',
    role: 'Estudiante · 5° B',
    avatar: 'MF',
    color: '#8067E8',
    ultimo: 'Ya envié mi actividad.',
    hora: 'Ayer',
    messages: [
      {
        id: 'm4',
        text: 'Ya envié mi actividad.',
        time: 'Ayer',
        mine: false,
      },
    ],
  },
];

export default function MensajesTeacher() {
  return (
    <MensajesUI
      title="Mensajes"
      subtitle="Comunícate con tus estudiantes."
      contacts={teacherConversations}
      isTeacher={true}
    />
  );
}
