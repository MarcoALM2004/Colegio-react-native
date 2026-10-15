import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { events } from '../data/studentMockData';
import { Page, Card, colors } from '../components/StudentUI';

const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function CalendarioStudent() {
  const [selected, setSelected] = useState(8);

  const selectedEvents = events.filter((event) => event.dia === selected);

  return (
    <Page
      title="Calendario"
      subtitle="Tus clases, tareas y eventos importantes."
    >
      <Card>
        <View style={styles.month}>
          <TouchableOpacity>
            <Text style={styles.arrow}>‹</Text>
          </TouchableOpacity>

          <Text style={styles.monthName}>Septiembre 2026</Text>

          <TouchableOpacity>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          {days.map((day) => (
            <Text style={styles.day} key={day}>
              {day}
            </Text>
          ))}

          {Array.from({ length: 30 }, (_, index) => index + 1).map((day) => {
            const dayEvents = events.filter((event) => event.dia === day);

            return (
              <TouchableOpacity
                key={day}
                onPress={() => setSelected(day)}
                style={[
                  styles.cell,
                  selected === day && styles.selected,
                ]}
              >
                <Text
                  style={[
                    styles.date,
                    selected === day && styles.dateSelected,
                  ]}
                >
                  {day}
                </Text>

                {dayEvents.slice(0, 1).map((event) => (
                  <View
                    key={event.titulo}
                    style={[styles.dot, { backgroundColor: event.color }]}
                  />
                ))}
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      <Card>
        <Text style={styles.section}>
          Eventos del {selected} de septiembre
        </Text>

        {selectedEvents.length > 0 ? (
          selectedEvents.map((event) => (
            <View style={styles.event} key={event.titulo}>
              <View
                style={[styles.bar, { backgroundColor: event.color }]}
              />

              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{event.titulo}</Text>
                <Text style={styles.eventTime}>{event.hora}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.none}>
            No hay eventos programados para este día.
          </Text>
        )}
      </Card>
    </Page>
  );
}

const styles = StyleSheet.create({
  month: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  arrow: {
    fontSize: 28,
    color: colors.blue,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  day: {
    width: '14.2857%',
    textAlign: 'center',
    fontSize: 11,
    color: colors.muted,
    marginBottom: 10,
  },
  cell: {
    width: '14.2857%',
    height: 48,
    alignItems: 'center',
    paddingTop: 4,
    borderRadius: 8,
  },
  selected: {
    backgroundColor: '#EAF2FF',
  },
  date: {
    fontSize: 12,
    color: colors.text,
  },
  dateSelected: {
    color: colors.blue,
    fontWeight: '800',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 5,
    marginTop: 4,
  },
  section: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  event: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEF1F5',
    paddingVertical: 11,
  },
  bar: {
    width: 4,
    borderRadius: 5,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  eventTime: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 3,
  },
  none: {
    fontSize: 13,
    color: colors.muted,
    paddingVertical: 12,
  },
});