import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Conversation, Message } from '../types';
import { Send, User as UserIcon, Search, MessageSquare, ArrowLeft, Loader2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';

interface MessagingSystemProps {
  initialChatRole?: string | null;
  initialUserId?: string | null;
  initialUserName?: string | null;
}

export default function MessagingSystem({ initialChatRole, initialUserId, initialUserName }: MessagingSystemProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchInitialChat = async () => {
      if (initialUserId && initialUserName && user) {
        const newConv: Conversation = {
          other_user_id: Number(initialUserId),
          other_user_name: initialUserName,
          other_user_role: initialChatRole || 'user',
          last_message: '',
          last_message_time: new Date().toISOString(),
          unread_count: 0
        };
        setSelectedChat(newConv);
      } else if (initialChatRole === 'admin' && user) {
        try {
          const res = await fetch('/api/users/admin');
          const adminData = await res.json();
          if (adminData) {
            const newConv: Conversation = {
              other_user_id: adminData.id,
              other_user_name: adminData.name,
              other_user_role: 'admin',
              last_message: '',
              last_message_time: new Date().toISOString(),
              unread_count: 0
            };
            setSelectedChat(newConv);
          }
        } catch (err) {
          console.error('Error fetching admin for message:', err);
        }
      }
    };

    fetchInitialChat();
  }, [initialUserId, initialUserName, initialChatRole, user]);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (selectedChat && user) {
      fetchMessages(true);
      markAsRead();
      
      const interval = setInterval(() => fetchMessages(false), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedChat, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/messages/conversations/${user.id}`);
      const data = await res.json();
      setConversations(data);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (showLoading = false) => {
    if (!user || !selectedChat) return;
    if (showLoading) setMessagesLoading(true);
    try {
      const res = await fetch(`/api/messages/${user.id}/${selectedChat.other_user_id}`);
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      if (showLoading) setMessagesLoading(false);
    }
  };

  const markAsRead = async () => {
    if (!user || !selectedChat) return;
    try {
      await fetch(`/api/messages/read/${user.id}/${selectedChat.other_user_id}`, {
        method: 'PUT'
      });
      fetchConversations();
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedChat || !newMessage.trim()) return;

    const content = newMessage;
    setNewMessage('');
    
    const tempId = Date.now();
    const optimisticMsg: Message = {
      id: tempId,
      sender_id: user.id,
      receiver_id: selectedChat.other_user_id,
      content: content,
      is_read: 0,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMsg]);

    setSending(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: user.id,
          receiver_id: selectedChat.other_user_id,
          content: content
        })
      });

      if (response.ok) {
        fetchMessages(false);
        fetchConversations();
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter(c => 
    c.other_user_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-full bg-white md:rounded-3xl border border-emerald-100 shadow-xl overflow-hidden flex">
      {/* Sidebar - Conversation List */}
      <div className={`w-full md:w-80 border-r border-emerald-50 flex flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 md:p-6 border-b border-emerald-50">
          <h1 className="text-lg md:text-xl font-bold text-emerald-900 mb-4">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" size={16} />
            <input 
              type="text" 
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-emerald-50/50 border border-emerald-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 bg-emerald-50 rounded w-3/4" />
                    <div className="h-2 bg-emerald-50 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations.length > 0 ? (
            <div className="divide-y divide-emerald-50">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.other_user_id}
                  onClick={() => setSelectedChat(conv)}
                  className={`w-full p-4 flex gap-3 hover:bg-emerald-50 transition-all text-left ${selectedChat?.other_user_id === conv.other_user_id ? 'bg-emerald-50' : ''}`}
                >
                  <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
                    <UserIcon size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-emerald-900 truncate">{conv.other_user_name}</h3>
                      <span className="text-[10px] text-emerald-400">{formatTime(conv.last_message_time)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-emerald-500 truncate pr-2">{conv.last_message}</p>
                      {conv.unread_count > 0 && (
                        <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="inline-flex p-3 bg-emerald-50 rounded-2xl text-emerald-300 mb-3">
                <MessageSquare size={32} />
              </div>
              <p className="text-sm font-medium text-emerald-900">No messages yet</p>
              <p className="text-xs text-emerald-400 mt-1">Start a conversation with a farmer from the marketplace.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-emerald-50/20 ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
        <AnimatePresence mode="wait">
          {selectedChat ? (
            <motion.div 
              key={selectedChat.other_user_id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col h-full"
            >
              {/* Chat Header */}
              <div className="p-4 bg-white border-b border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setSelectedChat(null)}
                    className="md:hidden p-2 hover:bg-emerald-50 rounded-xl text-emerald-600"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                    <UserIcon size={20} />
                  </div>
                  <div>
                    <h2 className="font-bold text-emerald-900">{selectedChat.other_user_name}</h2>
                    <span className="text-[10px] text-emerald-500 uppercase font-bold tracking-wider">{selectedChat.other_user_role}</span>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                {messagesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'} animate-pulse`}>
                        <div className={`w-2/3 h-16 bg-white rounded-2xl border border-emerald-50`} />
                      </div>
                    ))}
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((msg) => {
                    const isMe = msg.sender_id === user?.id;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] ${isMe ? 'order-1' : 'order-2'}`}>
                          <div className={`p-4 rounded-2xl text-sm shadow-sm ${
                            isMe 
                              ? 'bg-emerald-600 text-white rounded-tr-none' 
                              : 'bg-white text-emerald-900 border border-emerald-100 rounded-tl-none'
                          }`}>
                            {msg.content}
                          </div>
                          <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <Clock size={10} className="text-emerald-300" />
                            <span className="text-[10px] text-emerald-400">{formatTime(msg.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <div className="w-16 h-16 bg-white rounded-3xl shadow-sm border border-emerald-100 flex items-center justify-center text-emerald-200 mb-4">
                      <MessageSquare size={32} />
                    </div>
                    <h3 className="font-bold text-emerald-900">Start of Conversation</h3>
                    <p className="text-xs text-emerald-400 mt-1">Send a message to start chatting with {selectedChat.other_user_name}.</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-emerald-100">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                  <button 
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-200 text-white p-3 rounded-xl shadow-lg shadow-emerald-100 transition-all active:scale-95 flex items-center justify-center"
                  >
                    {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                  </button>
                </form>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center p-12 text-center"
            >
              <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl border border-emerald-50 flex items-center justify-center text-emerald-100 mb-6">
                <MessageSquare size={48} />
              </div>
              <h2 className="text-2xl font-bold text-emerald-900">Your Conversations</h2>
              <p className="text-emerald-500 mt-2 max-w-xs">Select a chat from the list to start messaging or view history.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
