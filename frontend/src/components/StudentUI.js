
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const colors = {
  blue: '#2563EB',
  bg: '#F5F7FB',
  card: '#FFFFFF',
  text: '#263244',
  muted: '#91A0B6',
  border: '#E8ECF3',
};

export function Page({ title, subtitle, children, action }) {
  return (
    <ScrollView
      style={s.page}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={s.head}>
        <View>
          <Text style={s.title}>{title}</Text>
          {subtitle && (
            <Text style={s.subtitle}>{subtitle}</Text>
          )}
        </View>
        {action}
      </View>

      {children}
    </ScrollView>
  );
}

export function Card({ children, style }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function Icon({
  name,
  color = colors.blue,
  size = 19,
}) {
  return (
    <View
      style={[
        s.icon,
        { backgroundColor: `${color}20` },
      ]}
    >
      <Ionicons name={name} size={size} color={color} />
    </View>
  );
}

export function Button({
  title,
  onPress,
  outline = false,
  icon = 'arrow-forward',
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[s.button, outline && s.outline]}
    >
      <Text
        style={[
          s.buttonText,
          outline && s.outlineText,
        ]}
      >
        {title}
      </Text>

      {icon && (
        <Ionicons
          name={icon}
          size={16}
          color={outline ? colors.blue : '#fff'}
        />
      )}
    </TouchableOpacity>
  );
}

export function Empty({ icon, text }) {
  return (
    <Card style={s.empty}>
      <Ionicons
        name={icon}
        size={30}
        color={colors.muted}
      />
      <Text style={s.emptyText}>{text}</Text>
    </Card>
  );
}

const s = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: 28,
    paddingBottom: 42,
  },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 25,
    gap: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 7,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 16,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: colors.blue,
    height: 38,
    borderRadius: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  outline: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.blue,
  },
  outlineText: {
    color: colors.blue,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 35,
  },
  emptyText: {
    color: colors.muted,
    marginTop: 10,
    fontSize: 13,
  },
});
