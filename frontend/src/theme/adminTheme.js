// Paleta y medidas compartidas del panel de administrador.
// Mantiene los mismos tonos que ya usa el panel del estudiante.

export const colors = {
  primary: '#2563EB',
  primarySoft: '#EAF2FF',
  background: '#F5F7FB',
  header: '#DBF9FF',
  card: '#FFFFFF',
  border: '#E8ECF3',
  divider: '#EEF1F5',
  text: '#263244',
  textStrong: '#293548',
  textMuted: '#91A0B6',
  icon: '#7D8798',
  danger: '#EF4444',
  dangerSoft: '#FFE9EC',
  success: '#16A34A',
  successSoft: '#E3F7EA',
};

// Colores por "tono" para íconos, portadas y etiquetas.
export const tones = {
  blue: { solid: '#4A8AF4', soft: '#EAF2FF' },
  green: { solid: '#20A875', soft: '#E3F7EF' },
  orange: { solid: '#F2A93B', soft: '#FFF4DD' },
  purple: { solid: '#8067E8', soft: '#F0EBFF' },
  red: { solid: '#EF4444', soft: '#FFE1E1' },
  pink: { solid: '#E9579D', soft: '#FDE7F1' },
  cyan: { solid: '#20B7C5', soft: '#E0F7F9' },
  indigo: { solid: '#6366D9', soft: '#E8E9FB' },
};

export const toneList = Object.keys(tones);

export const radius = {
  sm: 10,
  md: 13,
  lg: 16,
};

// Puntos de quiebre usados en todo el proyecto.
export const breakpoints = {
  mobile: 600,
  desktop: 1000,
};
