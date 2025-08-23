import { theme } from '@/constants/theme';
import { useAuth } from '@/hooks/auth-context';
import { useEvents } from '@/hooks/events-context';
import { router } from 'expo-router';
import { ArrowRight, Calendar, Clock, MapPin, Users } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type EventFilter = 'all' | 'upcoming' | 'completed';

export default function MyEventsScreen() {
  const [filter, setFilter] = useState<EventFilter>('all');
  const { events } = useEvents();
  const { user } = useAuth();

  const myEvents = useMemo(() => {
    if (!user) return [];
    return events.filter(event =>
      Array.isArray(event.currentParticipants) &&
      event.currentParticipants.some((p: any) => p?._id === user._id)
    );
  }, [events, user]);

  const isCompleted = (date: Date) => new Date(date) < new Date();

  const filteredEvents = useMemo(() => {
    switch (filter) {
      case 'upcoming':
        return myEvents.filter(e => !isCompleted(e.date));
      case 'completed':
        return myEvents.filter(e => isCompleted(e.date));
      default:
        return myEvents;
    }
  }, [filter, myEvents]);

  const getStatusColor = (eDate: Date) => {
    return isCompleted(eDate) ? theme.colors.success : theme.colors.warning;
  };

  const getStatusText = (eDate: Date) => {
    return isCompleted(eDate) ? 'Completed ✓' : 'Registered';
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  const filters: { key: EventFilter; label: string; count: number }[] = [
    { key: 'all', label: 'All Events', count: myEvents.length },
    { key: 'upcoming', label: 'Upcoming', count: myEvents.filter(e => !isCompleted(e.date)).length },
    { key: 'completed', label: 'Completed', count: myEvents.filter(e => isCompleted(e.date)).length },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Events</Text>
        <Text style={styles.subtitle}>Track your environmental impact</Text>
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map((filterItem) => (
          <TouchableOpacity
            key={filterItem.key}
            style={[
              styles.filterTab,
              filter === filterItem.key && styles.filterTabActive,
            ]}
            onPress={() => setFilter(filterItem.key)}
          >
            <Text
              style={[
                styles.filterText,
                filter === filterItem.key && styles.filterTextActive,
              ]}
            >
              {filterItem.label}
            </Text>
            <View
              style={[
                styles.filterBadge,
                filter === filterItem.key && styles.filterBadgeActive,
              ]}
            >
              <Text
                style={[
                  styles.filterBadgeText,
                  filter === filterItem.key && styles.filterBadgeTextActive,
                ]}
              >
                {filterItem.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Events List */}
      <ScrollView
        style={styles.eventsList}
        contentContainerStyle={styles.eventsContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredEvents.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar size={64} color={theme.colors.textMuted} />
            <Text style={styles.emptyTitle}>No events found</Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'all' 
                ? "You haven't joined any events yet. Check out the Events tab to get started!"
                : `No ${filter} events to show.`
              }
            </Text>
          </View>
        ) : (
          filteredEvents.map((event) => (
            <TouchableOpacity
              key={(event as any)._id}
              style={styles.eventCard}
              onPress={() => router.push(`/event/${(event as any)._id}`)}
            >
              <Image source={{ uri: event.image }} style={styles.eventImage} />
              
              <View style={styles.eventContent}>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventTitle} numberOfLines={2}>
                    {event.title}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(event.date) },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {getStatusText(event.date)}
                    </Text>
                  </View>
                </View>

                <View style={styles.eventDetails}>
                  <View style={styles.eventDetail}>
                    <Calendar size={14} color={theme.colors.textSecondary} />
                    <Text style={styles.eventDetailText}>
                      {formatDate(event.date)}
                    </Text>
                  </View>
                  
                  <View style={styles.eventDetail}>
                    <Clock size={14} color={theme.colors.textSecondary} />
                    <Text style={styles.eventDetailText}>
                      {event.startTime}
                    </Text>
                  </View>
                </View>

                <View style={styles.eventLocation}>
                  <MapPin size={14} color={theme.colors.textSecondary} />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {event.location.address}
                  </Text>
                </View>

                <View style={styles.eventFooter}>
                  <View style={styles.participantsInfo}>
                    <Users size={14} color={theme.colors.textSecondary} />
                    <Text style={styles.participantsText}>
                      {Array.isArray(event.currentParticipants) ? event.currentParticipants.length : 0}/{event.maxParticipants} joined
                    </Text>
                  </View>
                  
                  <ArrowRight size={16} color={theme.colors.textMuted} />
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  filtersContainer: {
    flexGrow: 0,
  },
  filtersContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  filterTabActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.xs,
  },
  filterTextActive: {
    color: theme.colors.background,
  },
  filterBadge: {
    backgroundColor: theme.colors.cardBorder,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    minWidth: 20,
    alignItems: 'center',
  },
  filterBadgeActive: {
    backgroundColor: theme.colors.background + '33',
  },
  filterBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
    color: theme.colors.textMuted,
  },
  filterBadgeTextActive: {
    color: theme.colors.background,
  },
  eventsList: {
    flex: 1,
  },
  eventsContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: theme.spacing.lg,
  },
  eventCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  eventImage: {
    width: '100%',
    height: 120,
    backgroundColor: theme.colors.surface,
  },
  eventContent: {
    padding: theme.spacing.md,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  eventTitle: {
    flex: 1,
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
    marginRight: theme.spacing.sm,
    lineHeight: 24,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.background,
  },
  eventDetails: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  eventDetailText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  eventLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  locationText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  participantsText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
});