import { theme } from '@/constants/theme';
import { useAuth } from '@/hooks/auth-context';
import { useEvents } from '@/hooks/events-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Calendar, Gift, MapPin, Users } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { events, registerForEvent, isLoading } = useEvents();
  const { user } = useAuth();
  
  const event = events.find(e => e._id === id);

  if (isLoading && !event) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Event not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isUserRegistered = event.currentParticipants.some(p => p._id === user?._id);
  const isEventFull = event.currentParticipants.length >= event.maxParticipants;
  const canRegister = !isUserRegistered && !isEventFull;

  const handleRegister = () => {
    if (canRegister) {
      registerForEvent(event._id);
    }
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView>
        <Image source={{ uri: event.image }} style={styles.image} />
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        
        <View style={styles.content}>
          <Text style={styles.title}>{event.title}</Text>
          
          <View style={styles.infoRow}>
            <Calendar size={16} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>{new Date(event.date).toLocaleDateString()} at {event.startTime}</Text>
          </View>
          <View style={styles.infoRow}>
            <MapPin size={16} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>{event.location.address}</Text>
          </View>
          <View style={styles.infoRow}>
            <Users size={16} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>{event.currentParticipants.length} / {event.maxParticipants} participants</Text>
          </View>

          <Text style={styles.description}>{event.description}</Text>
          
          {event.rewards.length > 0 && (
            <View>
              <Text style={styles.sectionTitle}>Rewards</Text>
              {event.rewards.map((reward, index) => (
                <View key={index} style={styles.rewardRow}>
                  <Gift size={16} color={theme.colors.primary} />
                  <Text style={styles.infoText}>{reward.value} {reward.type}</Text>
                </View>
              ))}
            </View>
          )}

        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.joinButton, !canRegister && styles.disabledButton]}
          onPress={handleRegister}
          disabled={!canRegister}
        >
          <Text style={styles.joinButtonText}>
            {isUserRegistered ? "You're Registered" : isEventFull ? "Event Full" : "Join Event"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: 250 },
  backButton: { position: 'absolute', top: 16, left: 16, backgroundColor: 'rgba(255,255,255,0.7)', padding: 8, borderRadius: 20 },
  content: { padding: theme.spacing.md },
  title: { fontSize: theme.fontSize.xl, fontWeight: '700', color: theme.colors.text, marginBottom: theme.spacing.md },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginBottom: theme.spacing.sm },
  infoText: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary },
  description: { fontSize: theme.fontSize.md, color: theme.colors.text, lineHeight: 22, marginVertical: theme.spacing.md },
  sectionTitle: { fontSize: theme.fontSize.lg, fontWeight: '600', color: theme.colors.text, marginTop: theme.spacing.md, marginBottom: theme.spacing.sm },
  rewardRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginBottom: theme.spacing.xs },
  footer: { padding: theme.spacing.md, borderTopWidth: 1, borderTopColor: theme.colors.cardBorder },
  joinButton: { backgroundColor: theme.colors.primary, padding: theme.spacing.md, borderRadius: theme.borderRadius.md, alignItems: 'center' },
  disabledButton: { backgroundColor: theme.colors.textMuted },
  joinButtonText: { color: theme.colors.background, fontSize: theme.fontSize.md, fontWeight: '600' },
  backLink: { color: theme.colors.primary, fontSize: theme.fontSize.md },
});