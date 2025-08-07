import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Send } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  userId: string;
  userName: string;
  timestamp: string;
  createdAt?: string;
}

interface ChatUser {
  id: string;
  name: string;
  email: string;
  isOnline?: boolean;
}

const API_BASE = 'https://skillzeer-realtime.hf.space';

export const Chat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<ChatUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user) {
      console.log('⏳ Aguardando usuário para conectar chat...');
      return;
    }

    console.log('🚀 Inicializando chat para usuário:', user.name);
    
    connectWebSocket();
    loadMessages();
    loadOnlineUsers();

    return () => {
      if (wsRef.current) {
        wsRef.current.close(1000);
      }
    };
  }, [user]);

  const connectWebSocket = () => {
    if (!user) {
      console.log('❌ Usuário não disponível para conectar WebSocket');
      return;
    }

    try {
      console.log('🔌 Conectando ao WebSocket para usuário:', user.name);
      
      const wsUrl = 'wss://skillzeer-realtime.hf.space';
      console.log('🌐 URL WebSocket:', wsUrl);
      
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('✅ WebSocket conectado com sucesso');
        setIsConnected(true);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const update = JSON.parse(event.data);
          console.log('📨 Mensagem WebSocket recebida:', update);
          
          if (update.collection === 'messages' && update.type === 'create') {
            const newMsg = update.data;
            setMessages(prev => {
              if (prev.some(msg => msg.id === newMsg.id)) {
                return prev;
              }
              return [...prev, newMsg].sort((a, b) => 
                new Date(a.timestamp || a.createdAt || '').getTime() - 
                new Date(b.timestamp || b.createdAt || '').getTime()
              );
            });
          }
        } catch (error) {
          console.error('❌ Erro ao processar mensagem WebSocket:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('❌ WebSocket desconectado');
        console.log('🔍 Código de fechamento:', event.code);
        console.log('🔍 Razão:', event.reason);
        
        setIsConnected(false);
        
        setTimeout(() => {
          console.log('🔄 Tentando reconectar WebSocket...');
          connectWebSocket();
        }, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error('❌ Erro detalhado no WebSocket:', error);
        setIsConnected(false);
      };
    } catch (error) {
      console.error('❌ Erro ao criar WebSocket:', error);
    }
  };

  const loadMessages = async () => {
    try {
      console.log('📥 Carregando mensagens...');
      const response = await fetch(`${API_BASE}/api/messages`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Dados de mensagens:', data);
        
        const messagesData = data.data || data;
        if (Array.isArray(messagesData)) {
          const sortedMessages = messagesData.sort((a, b) => 
            new Date(a.timestamp || a.createdAt || '').getTime() - 
            new Date(b.timestamp || b.createdAt || '').getTime()
          );
          setMessages(sortedMessages);
          console.log(`✅ ${sortedMessages.length} mensagens carregadas`);
        }
      } else {
        console.log('ℹ️ Nenhuma mensagem encontrada ou coleção não existe ainda');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar mensagens:', error);
    }
  };

  const loadOnlineUsers = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/users`);
      
      if (response.ok) {
        const data = await response.json();
        const usersData = data.data || data;
        if (Array.isArray(usersData)) {
          setOnlineUsers(usersData.map(u => ({ ...u, isOnline: true })));
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar usuários:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || isLoading) return;

    setIsLoading(true);
    try {
      console.log('📤 Enviando mensagem...');
      
      const messageData = {
        content: newMessage.trim(),
        userId: user.id,
        userName: user.name,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      console.log('📋 Dados da mensagem:', messageData);

      const response = await fetch(`${API_BASE}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(messageData)
      });

      console.log('📡 Status do envio:', response.status);

      if (response.ok) {
        const sentMessage = await response.json();
        console.log('✅ Mensagem enviada:', sentMessage);
        
        setNewMessage('');
        
        setMessages(prev => {
          const messageToAdd = sentMessage.id ? sentMessage : { 
            ...messageData, 
            id: Date.now().toString() 
          };
          
          if (prev.some(msg => msg.id === messageToAdd.id)) {
            return prev;
          }
          
          return [...prev, messageToAdd].sort((a, b) => 
            new Date(a.timestamp || a.createdAt || '').getTime() - 
            new Date(b.timestamp || b.createdAt || '').getTime()
          );
        });
      } else {
        const errorText = await response.text();
        console.error('❌ Erro ao enviar mensagem:', errorText);
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Erro completo ao enviar mensagem:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="p-4">
          <h1 className="text-xl font-semibold">Chat</h1>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col min-h-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Nenhuma mensagem ainda</p>
                <p className="text-sm">Seja o primeiro a enviar uma mensagem!</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={message.id || index}
                  className={`flex gap-3 ${
                    message.userId === user?.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.userId !== user?.id && (
                    <Avatar className="h-8 w-8 mt-1 shrink-0">
                      <AvatarFallback className="text-xs bg-muted">
                        {getInitials(message.userName)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      message.userId === user?.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {message.userId !== user?.id && (
                      <p className="text-xs font-medium mb-1 opacity-70">
                        {message.userName}
                      </p>
                    )}
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                    <p className={`text-xs mt-1 opacity-70`}>
                      {formatTime(message.timestamp || message.createdAt || '')}
                    </p>
                  </div>
                  
                  {message.userId === user?.id && (
                    <Avatar className="h-8 w-8 mt-1 shrink-0">
                      <AvatarFallback className="text-xs bg-primary/20">
                        {getInitials(user?.name || '')}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="border-t border-border bg-card/50 backdrop-blur-sm">
          <div className="p-4 max-w-4xl mx-auto">
            <div className="flex gap-2">
              <Input
                placeholder="Digite sua mensagem..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={!isConnected || isLoading}
                className="flex-1 rounded-full bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
              />
              <Button 
                onClick={sendMessage}
                disabled={!newMessage.trim() || !isConnected || isLoading}
                size="icon"
                className="rounded-full shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};