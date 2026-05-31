'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function ChatWindow({ sessionId, currentUserId, onClose, readonly = false }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [partnerOnline, setPartnerOnline] = useState(false);
  
  const messagesEndRef = useRef(null);
  const channelRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (!error && data) {
        setMessages(data.reverse());
        // Mark all as read that are not from me
        const unreadMsgIds = data.filter(msg => msg.sender_id !== currentUserId && !msg.read_at).map(msg => msg.id);
        if (unreadMsgIds.length > 0 && !readonly) {
          await supabase.from('messages').update({ read_at: new Date().toISOString() }).in('id', unreadMsgIds);
        }
      }
      setLoading(false);
      setTimeout(scrollToBottom, 100);
    };

    fetchMessages();
  }, [sessionId, currentUserId]);

  // Set up Supabase Realtime & Presence
  useEffect(() => {
    const channel = supabase.channel(`chat:${sessionId}`, {
      config: { presence: { key: currentUserId } }
    });

    channelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        // Check if anyone else is in the room
        const isPartnerHere = Object.keys(state).some(key => key !== currentUserId);
        setPartnerOnline(isPartnerHere);
      })
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.user !== currentUserId) {
          setIsTyping(payload.payload.isTyping);
        }
      })
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `session_id=eq.${sessionId}` 
      }, async (payload) => {
        // Only append if it's not our own message (handled optimistically)
        if (payload.new.sender_id !== currentUserId) {
          setMessages((prev) => {
            if (prev.find(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
          // Mark as read immediately if we are viewing
          if (!readonly) {
            await supabase
              .from('messages')
              .update({ read_at: new Date().toISOString() })
              .eq('id', payload.new.id);
          }
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `session_id=eq.${sessionId}` 
      }, (payload) => {
        // Update read receipts
        setMessages((prev) => 
          prev.map(msg => msg.id === payload.new.id ? payload.new : msg)
        );
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, currentUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    // Broadcast typing status
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { user: currentUserId, isTyping: true }
      });

      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        if (channelRef.current) {
          channelRef.current.send({
            type: 'broadcast',
            event: 'typing',
            payload: { user: currentUserId, isTyping: false }
          });
        }
      }, 2000);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      session_id: sessionId,
      sender_id: currentUserId,
      content: newMessage.trim(),
      created_at: new Date().toISOString(),
      read_at: null,
      isOptimistic: true // flag for UI
    };

    // Optimistic UI update
    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage('');
    setIsTyping(false);
    
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { user: currentUserId, isTyping: false }
      });
    }

    // Actual DB Insert
    const { data, error } = await supabase
      .from('messages')
      .insert({
        session_id: sessionId,
        sender_id: currentUserId,
        content: optimisticMessage.content
      })
      .select()
      .single();

    if (!error && data) {
      // Replace optimistic message with real DB message
      setMessages((prev) => 
        prev.map(msg => msg.id === tempId ? data : msg)
      );
    } else {
      // Handle error (e.g. remove optimistic message or show error state)
      setMessages((prev) => prev.filter(msg => msg.id !== tempId));
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    }
  };

  return (
    <div className="chat-overlay">
      <div className="chat-container">
        {/* Header */}
        <div className="chat-header">
          <div>
            <h3 className="chat-title">Session Chat</h3>
            <div className="chat-status">
              <span className={`status-dot ${partnerOnline ? 'online' : ''}`}></span>
              <span>{partnerOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="chat-close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Messages Area */}
        <div className="chat-messages">
          {loading ? (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)' }}>Loading chat...</div>
          ) : messages.length === 0 ? (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)' }}>No messages yet. Say hi!</div>
          ) : (
            <>
              {messages.map((msg) => {
                const isMine = msg.sender_id === currentUserId;
                return (
                  <div key={msg.id} className={`chat-msg-row ${isMine ? 'mine' : 'theirs'}`}>
                    <div 
                      className={`chat-bubble ${isMine ? 'mine' : 'theirs'}`}
                      style={{ opacity: msg.isOptimistic ? 0.7 : 1 }}
                    >
                      {msg.content}
                    </div>
                    <div className="chat-msg-meta">
                      <span className="chat-time">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isMine && !msg.isOptimistic && (
                        <span className={`chat-read-status ${msg.read_at ? 'read' : ''}`}>
                          {msg.read_at ? 'Read' : 'Delivered'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {isTyping && (
                <div className="chat-msg-row theirs">
                  <div className="typing-indicator">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        {!readonly && (
          <div className="chat-input-area">
            <form onSubmit={sendMessage} className="chat-form">
              <input
                type="text"
                value={newMessage}
                onChange={handleTyping}
                placeholder="Type your message..."
                className="chat-input"
              />
              <button 
                type="submit"
                disabled={!newMessage.trim()}
                className="chat-send-btn"
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
