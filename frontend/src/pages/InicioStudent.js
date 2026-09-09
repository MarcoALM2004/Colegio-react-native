import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function InicioStudent() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Buenos días, Marco 👋</Text>
      <Text style={styles.subtitle}>
        Continúa tu aprendizaje donde lo dejaste.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Bienvenido a Goledio</Text>
        <Text style={styles.cardText}>
          Aquí aparecerá el contenido principal de Inicio.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#263244',
  },

  subtitle: {
    marginTop: 8,
    fontSize: 13,
    color: '#91A0B6',
  },

  card: {
    marginTop: 25,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 25,
    borderWidth: 1,
    borderColor: '#E8ECF3',
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#293548',
  },

  cardText: {
    marginTop: 8,
    color: '#8A97AA',
  },
});