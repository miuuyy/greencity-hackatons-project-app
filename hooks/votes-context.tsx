import apiClient from '@/lib/api-client';
import { Proposal } from '@/types';
import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from './auth-context';

type CreateProposalPayload = Omit<Proposal, '_id' | 'id' | 'createdAt' | 'updatedAt' | 'proposer' | 'votes' | 'voters' | 'status'>;

interface VotesState {
  proposals: Proposal[];
  isLoading: boolean;
  fetchProposals: () => Promise<void>;
  createProposal: (proposal: CreateProposalPayload) => Promise<{ success: boolean; message?: string; }>;
  voteForProposal: (proposalId: string) => Promise<{ success: boolean; message?: string; }>;
}

export const [VotesProvider, useVotes] = createContextHook<VotesState>(() => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  const fetchProposals = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/proposals');
      setProposals(response.data.proposals);
    } catch (error) {
      console.error('Failed to fetch proposals:', error);
      Alert.alert('Error', 'Could not fetch proposals from the server.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProposals();
    }
  }, [isAuthenticated, fetchProposals]);

  const createProposal = async (proposalData: CreateProposalPayload) => {
    try {
      const response = await apiClient.post('/proposals', proposalData);
      const newProposal = response.data.proposal;
      setProposals(prev => [newProposal, ...prev]);
      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create proposal.';
      console.error('Create proposal error:', message);
      Alert.alert('Error', message);
      return { success: false, message };
    }
  };

  const voteForProposal = async (proposalId: string) => {
    try {
      const response = await apiClient.post(`/proposals/${proposalId}/vote`);
      const updatedProposal = response.data.proposal;
      setProposals(prev => prev.map(p => p._id === proposalId ? updatedProposal : p));
      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to vote.';
      console.error('Vote error:', message);
      Alert.alert('Error', message);
      return { success: false, message };
    }
  };

  return {
    proposals,
    isLoading,
    fetchProposals,
    createProposal,
    voteForProposal,
  };
});