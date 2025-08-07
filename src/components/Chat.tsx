import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Send, Users, Wifi, WifiOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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
    // Garantir que o usuário está disponível antes de conectar
    if (!user) {
      console.log('⏳ Aguardando usuário para conectar chat...');
      return;
    }

    console.log('🚀 Inicializando chat para usuário:', user.name);
    
    // Connect to WebSocket
    connectWebSocket();
    
    // Load initial messages
    loadMessages();
    
    // Load online users
    loadOnlineUsers();

    return () => {
      if (wsRef.current) {
        wsRef.current.close(1000);
      }
    };
  }, [user]);

  const connectWebSocket = () => {
    // Verificar se o usuário está disponível
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
        toast({
          title: "Chat conectado",
          description: "Você está online e pode receber mensagens em tempo real",
        });
      };

      wsRef.current.onmessage = (event) => {
        try {
          const update = JSON.parse(event.data);
          console.log('📨 Mensagem WebSocket recebida:', update);
          
          // Check if it's a message update from the messages collection
          if (update.collection === 'messages' && update.type === 'create') {
            const newMsg = update.data;
            setMessages(prev => {
              // Avoid duplicates
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
        console.log('🔍 Foi limpo:', event.wasClean);
        
        setIsConnected(false);
        toast({
          title: "Chat desconectado",
          description: `Código: ${event.code} - ${event.reason || 'Tentando reconectar...'}`,
          variant: "destructive",
        });
        
        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
          console.log('🔄 Tentando reconectar WebSocket...');
          connectWebSocket();
        }, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error('❌ Erro detalhado no WebSocket:', error);
        console.error('❌ Tipo do erro:', error.type);
        console.error('❌ Target:', error.target);
        console.error('❌ WebSocket readyState:', wsRef.current?.readyState);
        
        setIsConnected(false);
        
        const readyStateText = {
          0: 'CONNECTING',
          1: 'OPEN', 
          2: 'CLOSING',
          3: 'CLOSED'
        }[wsRef.current?.readyState || 3];
        
        toast({
          title: "Erro de conexão WebSocket",
          description: `Estado: ${readyStateText} - Verifique a conexão`,
          variant: "destructive",
        });
      };
    } catch (error) {
      console.error('❌ Erro ao criar WebSocket:', error);
      toast({
        title: "Erro ao inicializar WebSocket",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const loadMessages = async () => {
    try {
      console.log('📥 Carregando mensagens...');
      const response = await fetch(`${API_BASE}/api/messages`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Dados de mensagens:', data);
        
        // Handle the API response format
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
        
        // Add message locally if WebSocket doesn't update immediately
        setMessages(prev => {
          const messageToAdd = sentMessage.id ? sentMessage : { 
            ...messageData, 
            id: Date.now().toString() 
          };
          
          // Avoid duplicates
          if (prev.some(msg => msg.id === messageToAdd.id)) {
            return prev;
          }
          
          return [...prev, messageToAdd].sort((a, b) => 
            new Date(a.timestamp || a.createdAt || '').getTime() - 
            new Date(b.timestamp || b.createdAt || '').getTime()
          );
        });

        toast({
          title: "Mensagem enviada",
          description: "Sua mensagem foi enviada com sucesso",
        });
      } else {
        const errorText = await response.text();
        console.error('❌ Erro ao enviar mensagem:', errorText);
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Erro completo ao enviar mensagem:', error);
      toast({
        title: "Erro ao enviar mensagem",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
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

  const formatDate = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleDateString('pt-BR');
    } catch {
      return '';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups: { [key: string]: Message[] }, message) => {
    const date = formatDate(message.timestamp || message.createdAt || '');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className="h-screen flex flex-col lg:flex-row">
      {/* Mobile header with connection status */}
      <div className="lg:hidden p-4 border-b bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Chat</h2>
            <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-1">
              {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              <span className="hidden sm:inline">{isConnected ? 'Online' : 'Offline'}</span>
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{onlineUsers.length}</span>
          </div>
        </div>
      </div>

      {/* Users sidebar - Desktop only */}
      <Card className="hidden lg:block w-80 auth-container border-border/50 rounded-none border-r">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">Chat Online</CardTitle>
          <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-1">
            {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {isConnected ? 'Online' : 'Offline'}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{onlineUsers.length} usuários online</span>
          </div>
          
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-2">
              {onlineUsers.map((chatUser) => (
                <div
                  key={chatUser.id}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                    chatUser.id === user?.id ? 'bg-primary/10' : 'hover:bg-secondary/50'
                  }`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getInitials(chatUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {chatUser.name}
                      {chatUser.id === user?.id && ' (Você)'}
                    </p>
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 bg-primary rounded-full" />
                      <span className="text-xs text-muted-foreground">Online</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Messages */}
        <Card className="flex-1 auth-container border-border/50 rounded-none">
          <CardHeader className="hidden lg:block border-b border-border/50">
            <div className="flex items-center justify-between">
              <CardTitle>Chat Geral</CardTitle>
              <Badge variant="outline">
                {messages.length} mensagens
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-[calc(100vh-200px)] lg:h-[calc(100vh-240px)] p-3 lg:p-4">
              <div className="space-y-3 lg:space-y-4">
                {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                  <div key={date}>
                    <div className="flex items-center justify-center my-3 lg:my-4">
                      <Badge variant="outline" className="text-xs">
                        {date}
                      </Badge>
                    </div>
                    
                    {dateMessages.map((message, index) => (
                      <div
                        key={message.id || index}
                        className={`flex gap-2 lg:gap-3 mb-3 lg:mb-4 ${
                          message.userId === user?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {message.userId !== user?.id && (
                          <Avatar className="h-6 w-6 lg:h-8 lg:w-8 mt-1 shrink-0">
                            <AvatarFallback className="text-xs">
                              {getInitials(message.userName)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div
                          className={`max-w-[85%] sm:max-w-[75%] lg:max-w-[70%] rounded-lg p-2 lg:p-3 ${
                            message.userId === user?.id
                              ? 'bg-primary text-primary-foreground ml-auto'
                              : 'bg-secondary'
                          }`}
                        >
                          {message.userId !== user?.id && (
                            <p className="text-xs font-medium mb-1 text-muted-foreground">
                              {message.userName}
                            </p>
                          )}
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                          <p className={`text-xs mt-1 ${
                            message.userId === user?.id
                              ? 'text-primary-foreground/70'
                              : 'text-muted-foreground'
                          }`}>
                            {formatTime(message.timestamp || message.createdAt || '')}
                          </p>
                        </div>
                        
                        {message.userId === user?.id && (
                          <Avatar className="h-6 w-6 lg:h-8 lg:w-8 mt-1 shrink-0">
                            <AvatarFallback className="text-xs">
                              {getInitials(user?.name || '')}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
                
                {messages.length === 0 && (
                  <div className="text-center py-8 lg:py-12 text-muted-foreground">
                    <Send className="h-8 w-8 lg:h-12 lg:w-12 mx-auto mb-3 lg:mb-4 opacity-50" />
                    <p className="text-base lg:text-lg font-medium mb-2">Nenhuma mensagem ainda</p>
                    <p className="text-sm">Seja o primeiro a enviar uma mensagem!</p>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Message input */}
        <Card className="auth-container border-border/50 rounded-none border-t">
          <CardContent className="p-3 lg:p-4">
            <div className="flex gap-2">
              <Input
                placeholder={isConnected ? "Digite sua mensagem..." : "Conectando..."}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={!isConnected || isLoading}
                className="flex-1 text-base lg:text-sm"
              />
              <Button 
                onClick={sendMessage}
                disabled={!newMessage.trim() || !isConnected || isLoading}
                size="icon"
                className="shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              {isConnected ? (
                <>
                  <div className="h-2 w-2 bg-primary rounded-full" />
                  <span className="hidden sm:inline">Conectado - mensagens em tempo real</span>
                  <span className="sm:hidden">Online</span>
                </>
              ) : (
                <>
                  <div className="h-2 w-2 bg-destructive rounded-full" />
                  <span className="hidden sm:inline">Desconectado - tentando reconectar...</span>
                  <span className="sm:hidden">Reconectando...</span>
                </>
              )}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};