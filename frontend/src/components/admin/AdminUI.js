// Componentes reutilizables del panel de administrador.
// Así cada pantalla se enfoca en su lógica y no repite estilos.

import React from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { colors, radius, tones } from '../../theme/adminTheme';

/* ---------------------------------------------------------------- */
/* Helpers (Alert.alert con botones no funciona en web)             */
/* ---------------------------------------------------------------- */

export function confirmAction(titulo, mensaje, onConfirm, textoConfirmar = 'Aceptar') {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    if (window.confirm(`${titulo}\n\n${mensaje}`)) onConfirm();
    return;
  }
  Alert.alert(titulo, mensaje, [
    { text: 'Cancelar', style: 'cancel' },
    { text: textoConfirmar, style: 'destructive', onPress: onConfirm },
  ]);
}

export function notify(titulo, mensaje = '') {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    window.alert(mensaje ? `${titulo}\n\n${mensaje}` : titulo);
    return;
  }
  Alert.alert(titulo, mensaje);
}

// Cierra sesión volviendo al Login (pantalla del navegador raíz).
export function useLogout() {
  const navigation = useNavigation();
  return () =>
    confirmAction(
      'Cerrar sesión',
      '¿Deseas salir del panel de administrador?',
      () => {
        const root = navigation.getParent() || navigation;
        root.reset({ index: 0, routes: [{ name: 'Login' }] });
      },
      'Salir'
    );
}

export const initials = (nombres = '', apellidos = '') => `${nombres.charAt(0)}${apellidos.charAt(0)}`.toUpperCase();

/* ---------------------------------------------------------------- */
/* Estructura                                                        */
/* ---------------------------------------------------------------- */

export function PageScroll({ children, contentStyle }) {
  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={[styles.pageContent, contentStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

export function PageTitle({ title, subtitle, actionLabel, actionIcon = 'add', onAction, right }) {
  return (
    <View style={styles.pageTitleRow}>
      <View style={styles.flex}>
        <Text style={styles.pageTitle}>{title}</Text>
        {!!subtitle && <Text style={styles.pageSubtitle}>{subtitle}</Text>}
      </View>
      {!!actionLabel && (
        <TouchableOpacity style={styles.smallButton} onPress={onAction}>
          <Ionicons name={actionIcon} size={16} color="#FFFFFF" />
          <Text style={styles.smallButtonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
      {right}
    </View>
  );
}

export function SectionHeader({ title, actionLabel, onAction }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {!!actionLabel && (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.link}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

/* ---------------------------------------------------------------- */
/* Búsqueda y filtros                                                */
/* ---------------------------------------------------------------- */

export function SearchBar({ value, onChangeText, placeholder }) {
  return (
    <View style={styles.search}>
      <Ionicons name="search-outline" size={18} color={colors.textMuted} />
      <TextInput
        style={styles.searchInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
      />
      {!!value && (
        <TouchableOpacity onPress={() => onChangeText('')}>
          <Ionicons name="close-circle" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// options: string[] | {value, label}[]
export function Chips({ options, value, onChange, style }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.chipsScroll, style]}
      contentContainerStyle={styles.chips}
    >
      {options.map((opt) => {
        const optValue = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
        const active = optValue === value;
        return (
          <TouchableOpacity
            key={optValue}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onChange(optValue)}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// Pestañas con subrayado (detalle de usuario / curso)
export function UnderlineTabs({ tabs, value, onChange }) {
  return (
    <View style={styles.utabs}>
      {tabs.map((t) => (
        <TouchableOpacity key={t} style={[styles.utab, value === t && styles.utabActive]} onPress={() => onChange(t)}>
          <Text style={[styles.utabText, value === t && styles.utabTextActive]} numberOfLines={1}>
            {t}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

/* ---------------------------------------------------------------- */
/* Elementos de lista                                                */
/* ---------------------------------------------------------------- */

export function IconBox({ icon, tone = 'blue', size = 44, iconSize = 21, solid = false }) {
  const t = tones[tone] || tones.blue;
  return (
    <View style={[styles.iconBox, { width: size, height: size, backgroundColor: solid ? t.solid : t.soft }]}>
      <Ionicons name={icon} size={iconSize} color={solid ? '#FFFFFF' : t.solid} />
    </View>
  );
}

export function Avatar({ nombres, apellidos, tone = 'purple', size = 44 }) {
  const t = tones[tone] || tones.purple;
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: t.solid }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.36 }]}>{initials(nombres, apellidos)}</Text>
    </View>
  );
}

export function StatusBadge({ active, activeLabel = 'Activo', inactiveLabel = 'Inactivo' }) {
  return (
    <View style={[styles.badge, active ? styles.badgeOn : styles.badgeOff]}>
      <Text style={[styles.badgeText, { color: active ? colors.success : colors.danger }]}>
        {active ? activeLabel : inactiveLabel}
      </Text>
    </View>
  );
}

export function CountBadge({ count }) {
  if (!count) return null;
  return (
    <View style={styles.countBadge}>
      <Text style={styles.countBadgeText}>{count > 9 ? '9+' : count}</Text>
    </View>
  );
}

export function ListRow({ left, title, subtitle, meta, right, onPress, chevron = !!onPress }) {
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper style={styles.listRow} onPress={onPress}>
      {left}
      <View style={styles.listRowText}>
        <Text style={styles.listRowTitle} numberOfLines={1}>
          {title}
        </Text>
        {!!subtitle && (
          <Text style={styles.listRowSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
        {!!meta && (
          <Text style={styles.listRowSubtitle} numberOfLines={1}>
            {meta}
          </Text>
        )}
      </View>
      {right}
      {chevron && <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />}
    </Wrapper>
  );
}

export function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={21} color={colors.icon} style={styles.infoIcon} />
      <View style={styles.flex}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || '—'}</Text>
      </View>
    </View>
  );
}

export function EmptyState({ icon = 'search-outline', text }) {
  return (
    <View style={styles.empty}>
      <Ionicons name={icon} size={34} color={colors.textMuted} />
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

/* ---------------------------------------------------------------- */
/* Formularios                                                       */
/* ---------------------------------------------------------------- */

export function Field({ label, error, style, ...inputProps }) {
  return (
    <View style={[styles.field, style]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, inputProps.multiline && styles.inputMultiline, error && styles.inputError]}
        placeholderTextColor={colors.textMuted}
        {...inputProps}
      />
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

export function SelectField({ label, options, value, onChange, error }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Chips options={options} value={value} onChange={onChange} style={styles.selectChips} />
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

export function Button({ title, onPress, variant = 'primary', icon, style, disabled }) {
  const variantStyle = {
    primary: styles.btnPrimary,
    outline: styles.btnOutline,
    danger: styles.btnDanger,
  }[variant];
  const textColor = variant === 'primary' ? '#FFFFFF' : variant === 'danger' ? colors.danger : colors.primary;

  return (
    <TouchableOpacity
      style={[styles.btn, variantStyle, disabled && styles.btnDisabled, style]}
      onPress={onPress}
      disabled={disabled}
    >
      {!!icon && <Ionicons name={icon} size={18} color={textColor} />}
      <Text style={[styles.btnText, { color: textColor }]}>{title}</Text>
    </TouchableOpacity>
  );
}

/* ---------------------------------------------------------------- */
/* Modal inferior                                                    */
/* ---------------------------------------------------------------- */

export function BottomSheet({ visible, title, onClose, children }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.icon} />
            </TouchableOpacity>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled">{children}</ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// Menú de acciones (ej. los tres puntos de un usuario)
export function ActionSheet({ visible, title, actions, onClose }) {
  return (
    <BottomSheet visible={visible} title={title} onClose={onClose}>
      {actions.map((a) => (
        <TouchableOpacity
          key={a.label}
          style={styles.actionItem}
          onPress={() => {
            onClose();
            a.onPress();
          }}
        >
          <Ionicons name={a.icon} size={20} color={a.danger ? colors.danger : colors.textStrong} />
          <Text style={[styles.actionText, a.danger && { color: colors.danger }]}>{a.label}</Text>
        </TouchableOpacity>
      ))}
    </BottomSheet>
  );
}

/* ---------------------------------------------------------------- */

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },

  page: { flex: 1, backgroundColor: colors.background },
  pageContent: { padding: 16, paddingBottom: 40, width: '100%', maxWidth: 960, alignSelf: 'center' },

  pageTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  pageTitle: { fontSize: 22, fontWeight: '700', color: colors.text },
  pageSubtitle: { fontSize: 13, color: colors.textMuted, marginTop: 4 },

  smallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    height: 36,
    borderRadius: radius.sm,
  },
  smallButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textStrong },
  link: { color: colors.primary, fontSize: 13, fontWeight: '600' },

  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    marginBottom: 14,
  },

  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 44,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 13, color: colors.text, height: '100%', outlineStyle: 'none' },

  chipsScroll: { flexGrow: 0, marginBottom: 14 },
  chips: { gap: 8 },
  chip: {
    paddingHorizontal: 14,
    height: 32,
    borderRadius: radius.sm,
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 12, color: colors.textStrong, fontWeight: '500' },
  chipTextActive: { color: '#FFFFFF', fontWeight: '600' },

  utabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: 14 },
  utab: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  utabActive: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  utabText: { fontSize: 13, color: colors.textMuted },
  utabTextActive: { color: colors.primary, fontWeight: '700' },

  iconBox: { borderRadius: radius.md, justifyContent: 'center', alignItems: 'center' },

  avatar: { justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFFFFF', fontWeight: '700' },

  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, alignSelf: 'flex-start' },
  badgeOn: { backgroundColor: colors.successSoft },
  badgeOff: { backgroundColor: colors.dangerSoft },
  badgeText: { fontSize: 11, fontWeight: '600' },

  countBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },

  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  listRowText: { flex: 1, minWidth: 0 },
  listRowTitle: { fontSize: 14, fontWeight: '600', color: colors.textStrong },
  listRowSubtitle: { fontSize: 12, color: colors.textMuted, marginTop: 2 },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  infoIcon: { width: 36 },
  infoLabel: { fontSize: 12, color: colors.textMuted },
  infoValue: { fontSize: 14, fontWeight: '600', color: colors.textStrong, marginTop: 2 },

  empty: { alignItems: 'center', paddingVertical: 36, gap: 8 },
  emptyText: { color: colors.textMuted, fontSize: 13, textAlign: 'center' },

  field: { marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: colors.textStrong, marginBottom: 6 },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: '#D9DEE8',
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    backgroundColor: colors.card,
    fontSize: 14,
    color: colors.text,
  },
  inputMultiline: { height: 90, paddingTop: 10, textAlignVertical: 'top' },
  inputError: { borderColor: colors.danger },
  errorText: { color: colors.danger, fontSize: 11, marginTop: 4 },
  selectChips: { marginBottom: 0 },

  btn: {
    height: 48,
    borderRadius: radius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },
  btnPrimary: { backgroundColor: colors.primary },
  btnOutline: { borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.card },
  btnDanger: { borderWidth: 1, borderColor: colors.danger, backgroundColor: colors.card },
  btnDisabled: { opacity: 0.5 },
  btnText: { fontSize: 15, fontWeight: '600' },

  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  sheet: {
    width: '100%',
    maxWidth: 560,
    maxHeight: '88%',
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 18,
    paddingBottom: 28,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  actionText: { fontSize: 15, color: colors.textStrong },
});
