import { theme } from '@/constants/theme';
import { useAuth } from '@/hooks/auth-context';
import { useEvents } from '@/hooks/events-context';
import { useVotes } from '@/hooks/votes-context';
import { Event, Proposal } from '@/types';
import { router } from 'expo-router';
import { Building2, MapPin, Plus, ThumbsUp, User, Vote, Wrench } from 'lucide-react-native';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

type MarkerData = (Event & { markerType: 'event' }) | (Proposal & { markerType: 'proposal' });

export default function MapScreen() {
  const { proposals, voteForProposal } = useVotes();
  const { events } = useEvents();
  const { user } = useAuth();
  
  const initialRegion = {
    latitude: 40.730610,
    longitude: -73.935242,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  };

  const allMarkers: MarkerData[] = [
    ...events.map(e => ({ ...e, markerType: 'event' as const })),
    ...proposals.map(p => ({ ...p, markerType: 'proposal' as const })),
  ];

  const handleLongPress = (e: any) => {
    const { coordinate } = e.nativeEvent;
    console.log('Long press at:', coordinate);
    Alert.alert(
      'Create Proposal', 
      'Do you want to create a new proposal at this location?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Create', onPress: () => router.push('/create-event') }, // Placeholder
      ]
    );
  };

  const getMarkerIcon = (marker: MarkerData) => {
    if (marker.markerType === 'event') {
      return <MapPin size={24} color={theme.colors.primary} />;
    }
    switch ((marker as Proposal).category) {
      case 'cleanup': return <Vote size={24} color={theme.colors.info} />;
      case 'planting': return <User size={24} color={theme.colors.success} />;
      case 'infrastructure': return <Wrench size={24} color={theme.colors.warning} />;
      default: return <Building2 size={24} color={theme.colors.secondary} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return theme.colors.success;
      case 'in_progress': return theme.colors.warning;
      case 'completed': return theme.colors.info;
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Under Review';
      case 'approved': return 'Approved';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Map on top */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={initialRegion}
          onLongPress={handleLongPress}
          mapStyle={mapStyle}
        >
          {allMarkers.map((marker) => (
            <Marker
              key={`${marker.markerType}-${(marker as any)._id}`}
              coordinate={{
                latitude: (marker as any).location.latitude,
                longitude: (marker as any).location.longitude,
              }}
              onPress={() => {
                if (marker.markerType === 'event') {
                  router.push(`/event/${(marker as any)._id}`);
                }
              }}
            >
              {getMarkerIcon(marker)}
              <Callout>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle}>
                    {marker.markerType === 'event' ? (marker as any).title : (marker as any).category}
                  </Text>
                  {marker.markerType === 'proposal' && (
                    <Text style={styles.calloutDescription}>
                      {(marker as any).description.substring(0, 100)}...
                    </Text>
                  )}
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>



        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/create-event')}
        >
          <Plus size={24} color={theme.colors.background} />
        </TouchableOpacity>
      </View>

      {/* Lists under the map */}
      <ScrollView style={styles.lists} contentContainerStyle={styles.listsContent}>
        <Text style={styles.sectionTitle}>Active Proposals</Text>
        {proposals.map((proposal) => (
          <View key={(proposal as any)._id} style={styles.voteCard}>
            <View style={styles.voteHeader}>
              <View style={[styles.categoryBadge, { backgroundColor: getStatusColor(proposal.status) + '22' }]}> 
                <Text style={styles.categoryText}>{proposal.category}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(proposal.status) }]}> 
                <Text style={styles.statusText}>{getStatusLabel(proposal.status)}</Text>
              </View>
            </View>

            <Text style={styles.voteDescription}>{proposal.description}</Text>
            <View style={styles.voteLocation}>
              <MapPin size={14} color={theme.colors.textSecondary} />
              <Text style={styles.locationText}>{proposal.location.address}</Text>
            </View>

            <View style={styles.voteFooter}>
              <TouchableOpacity
                style={styles.voteButton}
                onPress={() => voteForProposal((proposal as any)._id)}
              >
                <ThumbsUp size={16} color={theme.colors.primary} />
                <Text style={styles.voteCount}>{proposal.votes}</Text>
              </TouchableOpacity>
              <Text style={styles.voteDate}>
                {new Date(proposal.createdAt as any).toLocaleDateString('en-US')}
              </Text>
            </View>
          </View>
        ))}

        <Text style={[styles.sectionTitle, { marginTop: theme.spacing.lg }]}>Events</Text>
        {events.map((e) => (
          <TouchableOpacity key={(e as any)._id} style={styles.eventRow} onPress={() => router.push(`/event/${(e as any)._id}`)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.eventTitle}>{e.title}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MapPin size={14} color={theme.colors.textSecondary} />
                <Text style={styles.locationText}>{e.location.district}</Text>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: e.status === 'ongoing' ? theme.colors.info : theme.colors.warning }]}>
              <Text style={styles.statusText}>{e.status}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    mapContainer: {
      height: 260,
      position: 'relative',
    },
    map: {
      width: '100%',
      height: '100%',
    },

    addButton: {
      position: 'absolute',
      bottom: 16,
      right: theme.spacing.md,
      width: 48,
      height: 48,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.full,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.lg,
    },
    calloutContainer: {
      width: 200,
    },
    calloutTitle: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text,
    },
    calloutDescription: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    lists: {
      flex: 1,
    },
    listsContent: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.xxl,
    },
    sectionTitle: {
      fontSize: theme.fontSize.xl,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    voteCard: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
    },
    voteHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    categoryBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.sm,
    },
    categoryText: {
      color: theme.colors.text,
      fontSize: theme.fontSize.xs,
      fontWeight: '600',
    },
    statusBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.sm,
    },
    statusText: {
      color: theme.colors.background,
      fontSize: theme.fontSize.xs,
      fontWeight: '600',
    },
    voteDescription: {
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
      lineHeight: 22,
    },
    voteLocation: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      marginBottom: theme.spacing.md,
    },
    locationText: {
      color: theme.colors.textSecondary,
      fontSize: theme.fontSize.sm,
      flex: 1,
    },
    voteFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    voteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
    },
    voteCount: {
      color: theme.colors.primary,
      fontSize: theme.fontSize.sm,
      fontWeight: '600',
    },
    voteDate: {
      color: theme.colors.textMuted,
      fontSize: theme.fontSize.xs,
    },
    eventRow: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      marginBottom: theme.spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    eventTitle: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 2,
    },
});

// Basic dark map style for Google Maps
const mapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#263c3f' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b9a76' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#38414e' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#212a37' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ca5b3' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#746855' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1f2835' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f3d19c' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#2f3948' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#17263c' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#515c6d' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#17263c' }],
  },
];