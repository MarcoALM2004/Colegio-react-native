import React from 'react';
import MensajesUI from '../components/MensajesUI';

export default function MensajesTeacher({ usuario }) {
  return (
    <MensajesUI
      title="Mensajes"
      subtitle="Comunícate con tus estudiantes."
      usuario={usuario}
      isTeacher={true}
    />
  );
}