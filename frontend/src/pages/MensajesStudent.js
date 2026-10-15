import React from 'react';
import MensajesUI from '../components/MensajesUI';
import { conversations } from '../data/studentMockData';

export default function MensajesStudent() {
  return (
    <MensajesUI
      title="Mensajes"
      subtitle="Mantente en contacto con tus profesores."
      contacts={conversations}
    />
  );
}
