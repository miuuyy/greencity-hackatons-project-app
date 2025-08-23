import { theme } from '@/constants/theme';
import { useAuth } from '@/hooks/auth-context';
import { router } from 'expo-router';
import {
    Bell,
    ChevronRight,
    Globe,
    HelpCircle,
    LogOut,
    Shield,
    Smartphone,
    User,
} from 'lucide-react-native';
import React from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const { user, logout, switchRole } = useAuth();
  const [notifications, setNotifications] = React.useState(true);
  const [locationTracking, setLocationTracking] = React.useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          label: 'Edit Profile',
          onPress: () => Alert.alert('Soon', 'This feature is under development'),
        },
        {
          icon: Shield,
          label: 'Privacy',
          onPress: () => Alert.alert('Soon', 'This feature is under development'),
        },
      ],
    },
    {
      title: 'Settings',
      items: [
        {
          icon: Bell,
          label: 'Notifications',
          toggle: true,
          value: notifications,
          onToggle: setNotifications,
        },
        {
          icon: Globe,
          label: 'Location Tracking',
          toggle: true,
          value: locationTracking,
          onToggle: setLocationTracking,
        },
        {
          icon: Smartphone,
          label: 'App Language',
          value: 'English',
          onPress: () => Alert.alert('Soon', 'This feature is under development'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          label: 'Help & FAQ',
          onPress: () => Alert.alert('Soon', 'This feature is under development'),
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>


        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            
            {section.items.map((item, itemIndex) => {
              const Icon = item.icon;
              
              return (
                <TouchableOpacity
                  key={itemIndex}
                  style={styles.settingItem}
                  onPress={item.onPress}
                  disabled={item.toggle}
                >
                  <View style={styles.settingLeft}>
                    <Icon size={20} color={theme.colors.textSecondary} />
                    <Text style={styles.settingLabel}>{item.label}</Text>
                  </View>
                  
                  {item.toggle ? (
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{
                        false: theme.colors.surface,
                        true: theme.colors.primary,
                      }}
                      thumbColor={theme.colors.text}
                    />
                  ) : (
                    <View style={styles.settingRight}>
                      {item.value && (
                        <Text style={styles.settingValue}>{item.value}</Text>
                      )}
                      <ChevronRight size={20} color={theme.colors.textSecondary} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={theme.colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.version}>Version 1.0.0</Text>
          <Text style={styles.copyright}>© 2025 GreenCity</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.cardBorder,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    flex: 1,
  },
  settingLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  settingValue: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.card,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.lg,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  logoutText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.error,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  version: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  copyright: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
});