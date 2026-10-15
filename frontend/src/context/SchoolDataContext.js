import React, {
  createContext,
  useContext,
  useState,
  useMemo,
} from 'react';

const SchoolDataContext = createContext(null);

const initialEvents = [
  {
    id: '1',
    title: 'Entrega del proyecto final',
    date: '2026-10-15',
    time: '10:00',
    course: 'Computación - 5° A',
    type: 'Entrega',
  },
  {
    id: '2',
    title: 'Evaluación práctica',
    date: '2026-10-18',
    time: '09:00',
    course: 'Computación - 4° A',
    type: 'Evaluación',
  },
];

export function SchoolDataProvider({ children }) {
  const [courses, setCourses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState(initialEvents);

  const addEvent = (data) => {
    const event = { id: String(Date.now()), ...data };
    setEvents((prev) => [...prev, event]);
    return event;
  };

  const updateEvent = (id, data) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === id ? { ...event, ...data } : event
      )
    );
  };

  const deleteEvent = (id) => {
    setEvents((prev) => prev.filter((event) => event.id !== id));
  };

  const value = useMemo(
    () => ({
      courses,
      setCourses,
      tasks,
      setTasks,
      events,
      addEvent,
      updateEvent,
      deleteEvent,
    }),
    [courses, tasks, events]
  );

  return (
    <SchoolDataContext.Provider value={value}>
      {children}
    </SchoolDataContext.Provider>
  );
}

export function useSchoolData() {
  const context = useContext(SchoolDataContext);

  if (!context) {
    throw new Error(
      'useSchoolData debe usarse dentro de SchoolDataProvider'
    );
  }

  return context;
}