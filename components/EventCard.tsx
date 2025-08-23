import { theme } from '@/constants/theme';
import { Event } from '@/types';
import { router } from 'expo-router';
import { Calendar, Gift, MapPin, Users } from 'lucide-react-native';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface EventCardProps {
  event: Event;
  onPress?: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onPress }) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Use backend id field
      router.push(`/event/${(event as any)._id ?? (event as any).id}`);
    }
  };

  const getEventTypeColor = () => {
    switch (event.type) {
      case 'cleanup': return theme.colors.info;
      case 'planting': return theme.colors.success;
      case 'recycling': return theme.colors.warning;
      case 'education': return theme.colors.secondary;
      default: return theme.colors.primary;
    }
  };

  const getEventTypeLabel = () => {
    switch (event.type) {
      case 'cleanup': return 'Cleanup';
      case 'planting': return 'Planting';
      case 'recycling': return 'Recycling';
      case 'education': return 'Education';
      default: return 'Other';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
    });
  };

  const participantsCount = Array.isArray((event as any).currentParticipants)
    ? (event as any).currentParticipants.length
    : (event as any).currentParticipants ?? 0;

  const participantsPercentage = (participantsCount / event.maxParticipants) * 100;

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.9}>
      <Image source={{ uri: event.image }} style={styles.image} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.typeBadge, { backgroundColor: getEventTypeColor() }]}>
            <Text style={styles.typeText}>{getEventTypeLabel()}</Text>
          </View>
          {event.status === 'ongoing' && (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Live now</Text>
            </View>
          )}
        </View>

        <Text style={styles.title} numberOfLines={2}>{event.title}</Text>
        
        <View style={styles.info}>
          <View style={styles.infoRow}>
            <Calendar size={14} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>
              {formatDate(event.date)} • {event.startTime}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <MapPin size={14} color={theme.colors.textSecondary} />
            <Text style={styles.infoText} numberOfLines={1}>
              {event.location.district}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.participants}>
            <Users size={16} color={theme.colors.primary} />
            <Text style={styles.participantsText}>
              {participantsCount}/{event.maxParticipants}
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, { width: `${participantsPercentage}%` }]} 
              />
            </View>
          </View>

          {event.rewards.length > 0 && (
            <View style={styles.rewards}>
              <Gift size={16} color={theme.colors.gold} />
              <Text style={styles.rewardText}>
                +{event.rewards[0].value} {event.rewards[0].type === 'points' ? 'points' : ''}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: theme.colors.surface,
  },
  content: {
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  typeText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.error,
  },
  liveText: {
    color: theme.colors.error,
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  info: {
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  infoText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participants: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    flex: 1,
  },
  participantsText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: theme.colors.surface,
    borderRadius: 2,
    marginLeft: theme.spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  rewards: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rewardText: {
    color: theme.colors.gold,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
});

export default EventCard;