import React from 'react';
import MensajesUI from '../components/MensajesUI';

export default function MensajesStudent({ usuario }) {
  return (
    <MensajesUI
      title="Mensajes"
      subtitle="Mantente en contacto con tus profesores."
      usuario={usuario}
      isTeacher={false}
    />
  );
}