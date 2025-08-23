import { theme } from '@/constants/theme';
import { useAuth } from '@/hooks/auth-context';
import { useEvents } from '@/hooks/events-context';
import { mockStatistics } from '@/mocks/data';
import { Stack, router } from 'expo-router';
import {
    Award,
    Calendar,
    Edit,
    TrendingUp,
    Users,
    X
} from 'lucide-react-native';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OrganizerScreen() {
  const { user } = useAuth();
  const { getOrganizerEvents } = useEvents();
  const myEvents = getOrganizerEvents();
  const stats = mockStatistics;

  const statCards = [
    {
      label: 'Total Events',
      value: stats.totalEvents.toString(),
      icon: Calendar,
      color: theme.colors.primary,
      change: '+12%',
    },
    {
      label: 'Participants',
      value: stats.totalParticipants.toLocaleString(),
      icon: Users,
      color: theme.colors.info,
      change: `+${stats.monthlyGrowth}%`,
    },
    {
      label: 'Trees Planted',
      value: stats.totalTreesPlanted.toLocaleString(),
      icon: Award,
      color: theme.colors.success,
      change: '+34%',
    },
    {
      label: 'Waste Collected',
      value: `${(stats.totalWasteCollected / 1000).toFixed(1)}t`,
      icon: TrendingUp,
      color: theme.colors.warning,
      change: '+18%',
    },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Organizer Panel',
          headerRight: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.welcomeText}>Welcome,</Text>
            <Text style={styles.organizerName}>{user?.name}</Text>
          </View>

          <View style={styles.statsGrid}>
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <View key={index} style={styles.statCard}>
                  <View style={styles.statHeader}>
                    <Icon size={24} color={stat.color} />
                    <Text style={[styles.statChange, { color: stat.color }]}>
                      {stat.change}
                    </Text>
                  </View>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              );
            })}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Events</Text>
              <TouchableOpacity onPress={() => router.push('/create-event')}>
                <Text style={styles.createNew}>+ Create New</Text>
              </TouchableOpacity>
            </View>

            {myEvents.length > 0 ? (
              myEvents.map(event => (
                <TouchableOpacity key={event.id} style={styles.eventCard}>
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventDate}>
                      {new Date(event.date).toLocaleDateString('en-US')} • {event.startTime}
                    </Text>
                    <View style={styles.eventStats}>
                      <Text style={styles.eventStat}>
                        {event.currentParticipants}/{event.maxParticipants} participants
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(event.status) }]}>
                        <Text style={styles.statusText}>{getStatusLabel(event.status)}</Text>
                      </View>
                    </View>
                  </View>
                  <Edit size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>You have no events yet</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Districts</Text>
            {stats.topDistricts.map((district, index) => (
              <View key={index} style={styles.districtCard}>
                <View style={styles.districtRank}>
                  <Text style={styles.rankNumber}>#{index + 1}</Text>
                </View>
                <View style={styles.districtInfo}>
                  <Text style={styles.districtName}>{district.name}</Text>
                  <View style={styles.districtBar}>
                    <View
                      style={[
                        styles.districtBarFill,
                        { width: `${(district.score / stats.topDistricts[0].score) * 100}%` },
                      ]}
                    />
                  </View>
                </View>
                <Text style={styles.districtScore}>{district.score}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => router.push('/create-event')}
              >
                <Calendar size={32} color={theme.colors.primary} />
                <Text style={styles.actionText}>Create Event</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionCard}>
                <Users size={32} color={theme.colors.info} />
                <Text style={styles.actionText}>Participants</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionCard}>
                <Award size={32} color={theme.colors.gold} />
                <Text style={styles.actionText}>Rewards</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionCard}>
                <TrendingUp size={32} color={theme.colors.success} />
                <Text style={styles.actionText}>Analytics</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'upcoming': return theme.colors.info;
    case 'ongoing': return theme.colors.success;
    case 'completed': return theme.colors.textSecondary;
    case 'cancelled': return theme.colors.error;
    default: return theme.colors.textSecondary;
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'upcoming': return 'Upcoming';
    case 'ongoing': return 'Ongoing';
    case 'completed': return 'Completed';
    case 'cancelled': return 'Cancelled';
    default: return status;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
  },
  welcomeText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  organizerName: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '700',
    color: theme.colors.text,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statChange: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
  },
  statValue: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.text,
  },
  createNew: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  eventCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  eventDate: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  eventStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  eventStat: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.background,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingVertical: theme.spacing.lg,
  },
  districtCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  districtRank: {
    width: 40,
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  districtInfo: {
    flex: 1,
    marginHorizontal: theme.spacing.md,
  },
  districtName: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  districtBar: {
    height: 6,
    backgroundColor: theme.colors.surface,
    borderRadius: 3,
  },
  districtBarFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
  districtScore: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  actionText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
});