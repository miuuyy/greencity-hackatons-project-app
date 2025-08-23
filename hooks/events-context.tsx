import apiClient from '@/lib/api-client';
import { Event } from '@/types';
import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from './auth-context';

interface EventsState {
  events: Event[];
  isLoading: boolean;
  fetchEvents: () => Promise<void>;
  createEvent: (event: Omit<Event, 'id' | '_id' | 'createdAt' | 'updatedAt' | 'organizer' | 'currentParticipants'>) => Promise<{ success: boolean; message?: string; }>;
  registerForEvent: (eventId: string) => Promise<{ success: boolean; message?: string; }>;
  getMyEvents: () => Event[];
  getOrganizerEvents: () => Event[];
}

export const [EventsProvider, useEvents] = createContextHook<EventsState>(() => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/events');
      setEvents(response.data.events);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      Alert.alert('Error', 'Could not fetch events from the server.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchEvents();
    }
  }, [isAuthenticated, fetchEvents]);

  const createEvent = async (eventData: Omit<Event, 'id' | '_id' | 'createdAt' | 'updatedAt' | 'organizer' | 'currentParticipants'>) => {
    try {
      const response = await apiClient.post('/events', eventData);
      const newEvent = response.data.event;
      setEvents(prevEvents => [newEvent, ...prevEvents]);
      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create event.';
      console.error('Create event error:', message);
      Alert.alert('Error', message);
      return { success: false, message };
    }
  };

  const registerForEvent = async (eventId: string) => {
    try {
      const response = await apiClient.post(`/events/${eventId}/join`);
      const updatedEvent = response.data.event;
      setEvents(prev => prev.map(e => e._id === eventId ? updatedEvent : e));
      Alert.alert('Success!', 'You have successfully registered for the event.');
      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to register for the event.';
      console.error('Register for event error:', message);
      Alert.alert('Error', message);
      return { success: false, message };
    }
  };

  const getMyEvents = () => {
    if (!user) return [];
    // TODO: This logic should be backend-driven
    return events.filter(e => 
      e.currentParticipants.some(p => p._id === user._id)
    );
  };

  const getOrganizerEvents = () => {
    if (!user || user.role !== 'organizer') return [];
    return events.filter(e => e.organizer._id === user._id);
  };

  return {
    events,
    isLoading,
    fetchEvents,
    createEvent,
    registerForEvent,
    getMyEvents,
    getOrganizerEvents,
  };
});