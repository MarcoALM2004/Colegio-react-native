import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { initialTasks } from '../data/studentMockData';
import { Page, Card, Icon, colors } from '../components/StudentUI';

const filters = ['Todas', 'Pendiente', 'Entregada', 'Vencida'];

export default function TareasStudent() {
  const [filter, setFilter] = useState('Todas');
  const [tasks, setTasks] = useState(initialTasks);

  const shown = useMemo(
    () =>
      filter === 'Todas'
        ? tasks
        : tasks.filter((task) => task.estado === filter),
    [filter, tasks]
  );

  const deliver = (id) => {
    setTasks((previous) =>
      previous.map((task) =>
        task.id === id ? { ...task, estado: 'Entregada' } : task
      )
    );
  };

  return (
    <Page
      title="Mis Tareas"
      subtitle="Revisa y organiza todas tus tareas y trabajos."
    >
      <View style={styles.filters}>
        {filters.map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setFilter(item)}
            style={[
              styles.chip,
              filter === item && styles.chipActive,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                filter === item && styles.chipTextActive,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Card style={styles.card}>
        {shown.length > 0 ? (
          shown.map((task, index) => (
            <View
              key={task.id}
              style={[
                styles.row,
                index > 0 && styles.line,
              ]}
            >
              <Icon name={task.icono} color={task.color} />

              <View style={styles.grow}>
                <Text style={styles.name}>{task.titulo}</Text>
                <Text style={styles.sub}>
                  {task.curso} · Entrega: {task.fecha}
                </Text>
              </View>

              {task.estado === 'Pendiente' ? (
                <TouchableOpacity
                  onPress={() => deliver(task.id)}
                  style={styles.deliver}
                >
                  <Text style={styles.deliverText}>Entregar</Text>
                </TouchableOpacity>
              ) : (
                <Text
                  style={[
                    styles.status,
                    task.estado === 'Vencida'
                      ? styles.late
                      : task.estado === 'Entregada'
                        ? styles.done
                        : styles.wait,
                  ]}
                >
                  {task.estado}
                </Text>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.empty}>
            No hay tareas en esta categoría.
          </Text>
        )}
      </Card>
    </Page>
  );
}

const styles = StyleSheet.create({
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 13,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
  },
  chipActive: {
    backgroundColor: colors.blue,
  },
  chipText: {
    fontSize: 12,
    color: '#718096',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  card: {
    padding: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 15,
  },
  line: {
    borderTopWidth: 1,
    borderTopColor: '#EEF1F5',
  },
  grow: {
    flex: 1,
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  sub: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 4,
  },
  status: {
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 7,
    overflow: 'hidden',
  },
  wait: {
    color: '#C27607',
    backgroundColor: '#FFF4DD',
  },
  done: {
    color: '#16803D',
    backgroundColor: '#E3F7EA',
  },
  late: {
    color: '#D22C3A',
    backgroundColor: '#FFE9EC',
  },
  deliver: {
    backgroundColor: '#EAF2FF',
    padding: 7,
    borderRadius: 7,
  },
  deliverText: {
    fontSize: 10,
    color: colors.blue,
    fontWeight: '700',
  },
  empty: {
    padding: 16,
    fontSize: 13,
    color: colors.muted,
  },
}); 