import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAssistantState {
  messages: Message[];
  isLoading: boolean;
  isVisible: boolean;
  sendMessage: (content: string) => Promise<void>;
  toggleVisibility: () => void;
  clearMessages: () => void;
}

const GEMINI_API_KEY = 'AIzaSyCTTodcB-nFRD3bZPdmKxWd0L4eb1Bee6g';

export const [AIAssistantProvider, useAIAssistant] = createContextHook<AIAssistantState>(() => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! I\'m your GreenCity AI assistant 🌱 I can help you understand the importance of environmental events, explain how they benefit our community, and answer any questions about eco-friendly activities in New York City. How can I help you today?',
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=' + GEMINI_API_KEY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a helpful AI assistant for GreenCity, an official NYC environmental app. You help residents understand the importance of environmental events, explain how they benefit the community, and encourage participation in eco-friendly activities. Be enthusiastic, informative, and focus on environmental topics. Keep responses concise but engaging. User question: ${content}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        }),
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.candidates[0].content.parts[0].text,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('AI Assistant error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again later! 🌱',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleVisibility = useCallback(() => {
    setIsVisible(prev => !prev);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Hi! I\'m your GreenCity AI assistant 🌱 I can help you understand the importance of environmental events, explain how they benefit our community, and answer any questions about eco-friendly activities in New York City. How can I help you today?',
        timestamp: new Date(),
      },
    ]);
  }, []);

  return useMemo(() => ({
    messages,
    isLoading,
    isVisible,
    sendMessage,
    toggleVisibility,
    clearMessages,
  }), [messages, isLoading, isVisible, sendMessage, toggleVisibility, clearMessages]);
});