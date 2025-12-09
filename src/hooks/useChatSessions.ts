import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ChatSession {
  id: string;
  title: string;
  emoji: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: string;
  content: string;
  created_at: string;
  domains?: any;
  calculations?: any;
}

export function useChatSessions() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  // Load all sessions
  const loadSessions = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('session-list');
      if (error) throw error;
      setSessions(data || []);
      return data || [];
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast.error('Failed to load chat history');
      return [];
    }
  }, []);

  // Load messages for a session
  const loadMessages = useCallback(async (sessionId: string) => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('session-messages', {
        body: { session_id: sessionId }
      });
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new session
  const createSession = useCallback(async (title?: string, emoji?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('session-create', {
        body: { title: title || 'New Chat', emoji: emoji || '✨' }
      });
      if (error) throw error;
      
      setSessions(prev => [data, ...prev]);
      setCurrentSessionId(data.id);
      setMessages([]);
      return data;
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to create new chat');
      return null;
    }
  }, []);

  // Update session title/emoji
  const updateSession = useCallback(async (sessionId: string, title?: string, emoji?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('session-update', {
        body: { session_id: sessionId, title, emoji }
      });
      if (error) throw error;
      
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, ...data } : s));
      return data;
    } catch (error) {
      console.error('Error updating session:', error);
      toast.error('Failed to update chat');
      return null;
    }
  }, []);

  // Delete a session
  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      const { error } = await supabase.functions.invoke('session-delete', {
        body: { session_id: sessionId }
      });
      if (error) throw error;
      
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      // If deleted current session, switch to another or create new
      if (currentSessionId === sessionId) {
        const remaining = sessions.filter(s => s.id !== sessionId);
        if (remaining.length > 0) {
          setCurrentSessionId(remaining[0].id);
          loadMessages(remaining[0].id);
        } else {
          createSession();
        }
      }
      
      toast.success('Chat deleted');
      return true;
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Failed to delete chat');
      return false;
    }
  }, [currentSessionId, sessions, loadMessages, createSession]);

  // Add a message to current session
  const addMessage = useCallback(async (role: string, content: string) => {
    if (!currentSessionId) return null;
    
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          session_id: currentSessionId,
          role,
          content,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setMessages(prev => [...prev, data as ChatMessage]);
      
      // Update session timestamp
      await supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', currentSessionId);
      
      return data;
    } catch (error) {
      console.error('Error adding message:', error);
      return null;
    }
  }, [currentSessionId]);

  // Generate auto-title from first message
  const generateAutoTitle = useCallback((content: string) => {
    const words = content.trim().split(/\s+/).slice(0, 4).join(' ');
    const text = content.toLowerCase();
    
    let emoji = '✨';
    if (/\b(love|heart|romance)\b/.test(text)) emoji = '❤️';
    else if (/\b(happy|joy|great|amazing)\b/.test(text)) emoji = '😊';
    else if (/\b(sad|unhappy|sorry)\b/.test(text)) emoji = '😢';
    else if (/\b(code|program|bug|js|python|react)\b/.test(text)) emoji = '💻';
    else if (/\b(security|hack|password)\b/.test(text)) emoji = '🛡️';
    else if (/\b(learn|study|knowledge)\b/.test(text)) emoji = '📚';
    else if (/\b(help|question|how)\b/.test(text)) emoji = '❓';
    else if (/\b(idea|think|brain)\b/.test(text)) emoji = '💡';
    
    return { title: words.length > 30 ? words.slice(0, 30) + '...' : words, emoji };
  }, []);

  // Select a session
  const selectSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
    loadMessages(sessionId);
  }, [loadMessages]);

  // Initialize: load sessions and select first or create new
  useEffect(() => {
    const init = async () => {
      const loaded = await loadSessions();
      if (loaded.length > 0) {
        setCurrentSessionId(loaded[0].id);
        loadMessages(loaded[0].id);
      } else {
        createSession();
      }
    };
    init();
  }, []);

  return {
    sessions,
    currentSessionId,
    messages,
    loading,
    loadSessions,
    loadMessages,
    createSession,
    updateSession,
    deleteSession,
    addMessage,
    selectSession,
    generateAutoTitle,
    setMessages,
  };
}
