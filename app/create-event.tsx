import { theme } from '@/constants/theme';
import { useAuth } from '@/hooks/auth-context';
import { useEvents } from '@/hooks/events-context';
import { Stack, router } from 'expo-router';
import { X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateEventScreen() {
  const { createEvent } = useEvents();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'cleanup' as const,
    address: '',
    district: '',
    date: '',
    startTime: '',
    endTime: '',
    maxParticipants: '',
    rewardPoints: '',
    requirements: '',
  });

  const eventTypes = [
    { id: 'cleanup', label: 'Cleanup' },
    { id: 'planting', label: 'Planting' },
    { id: 'recycling', label: 'Recycling' },
    { id: 'education', label: 'Education' },
    { id: 'other', label: 'Other' },
  ];

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.address || 
        !formData.date || !formData.startTime || !formData.endTime || 
        !formData.maxParticipants) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await createEvent({
        title: formData.title,
        description: formData.description,
        type: formData.type,
        location: {
          address: formData.address,
          latitude: 55.751244 + Math.random() * 0.1,
          longitude: 37.618423 + Math.random() * 0.1,
          district: formData.district || 'Central',
        },
        date: new Date(formData.date),
        startTime: formData.startTime,
        endTime: formData.endTime,
        maxParticipants: parseInt(formData.maxParticipants),
        currentParticipants: 0,
        registeredUsers: [],
        confirmedUsers: [],
        organizerId: user?.id || '',
        organizerName: user?.name || 'Organizer',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        rewards: formData.rewardPoints ? [
          {
            id: `r-${Date.now()}`,
            type: 'points',
            value: parseInt(formData.rewardPoints),
            description: `${formData.rewardPoints} eco-points`,
          }
        ] : [],
        status: 'upcoming',
        requirements: formData.requirements ? formData.requirements.split(',').map(r => r.trim()) : [],
        tags: [formData.type],
      });

      Alert.alert('Success', 'Event created successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'New Event',
          headerRight: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="E.g., Central Park Cleanup"
              placeholderTextColor={theme.colors.textMuted}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />

            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Detailed description of the event"
              placeholderTextColor={theme.colors.textMuted}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>Event Type</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.typeSelector}
            >
              {eventTypes.map(type => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeChip,
                    formData.type === type.id && styles.typeChipActive,
                  ]}
                  onPress={() => setFormData({ ...formData, type: type.id as any })}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      formData.type === type.id && styles.typeChipTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location and Time</Text>
            
            <Text style={styles.label}>Address *</Text>
            <TextInput
              style={styles.input}
              placeholder="Street, house number, landmark"
              placeholderTextColor={theme.colors.textMuted}
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
            />

            <Text style={styles.label}>District</Text>
            <TextInput
              style={styles.input}
              placeholder="E.g., Central"
              placeholderTextColor={theme.colors.textMuted}
              value={formData.district}
              onChangeText={(text) => setFormData({ ...formData, district: text })}
            />

            <Text style={styles.label}>Date *</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.colors.textMuted}
              value={formData.date}
              onChangeText={(text) => setFormData({ ...formData, date: text })}
            />

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Start Time *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="HH:MM"
                  placeholderTextColor={theme.colors.textMuted}
                  value={formData.startTime}
                  onChangeText={(text) => setFormData({ ...formData, startTime: text })}
                />
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.label}>End Time *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="HH:MM"
                  placeholderTextColor={theme.colors.textMuted}
                  value={formData.endTime}
                  onChangeText={(text) => setFormData({ ...formData, endTime: text })}
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Participants and Rewards</Text>
            
            <Text style={styles.label}>Max Participants *</Text>
            <TextInput
              style={styles.input}
              placeholder="E.g., 50"
              placeholderTextColor={theme.colors.textMuted}
              value={formData.maxParticipants}
              onChangeText={(text) => setFormData({ ...formData, maxParticipants: text })}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Eco-points for participation</Text>
            <TextInput
              style={styles.input}
              placeholder="E.g., 150"
              placeholderTextColor={theme.colors.textMuted}
              value={formData.rewardPoints}
              onChangeText={(text) => setFormData({ ...formData, rewardPoints: text })}
              keyboardType="numeric"
            />

            <Text style={styles.label}>What to bring</Text>
            <TextInput
              style={styles.input}
              placeholder="Gloves, water (comma-separated)"
              placeholderTextColor={theme.colors.textMuted}
              value={formData.requirements}
              onChangeText={(text) => setFormData({ ...formData, requirements: text })}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexGrow: 0,
    marginTop: theme.spacing.sm,
  },
  typeChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  typeChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  typeChipText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
  typeChipTextActive: {
    color: theme.colors.background,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.md,
    fontWeight: '700',
  },
});