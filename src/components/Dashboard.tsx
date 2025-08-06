import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Users, Database, Wifi, WifiOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const [wsConnected, setWsConnected] = useState(false);
  const [realtimeUpdates, setRealtimeUpdates] = useState<any[]>([]);
  const [stats, setStats] = useState({ users: 0, collections: 0 });

  useEffect(() => {
    // Connect to WebSocket for real-time updates
    const ws = new WebSocket('ws://skillzeer-realtime.hf.space:7860');
    
    ws.onopen = () => {
      setWsConnected(true);
      toast({
        title: "WebSocket conectado",
        description: "Recebendo atualizações em tempo real",
      });
    };

    ws.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data);
        setRealtimeUpdates(prev => [update, ...prev.slice(0, 9)]);
        toast({
          title: "Atualização em tempo real",
          description: `${update.type}: ${update.collection}`,
        });
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      setWsConnected(false);
      toast({
        title: "WebSocket desconectado",
        description: "Conexão em tempo real perdida",
        variant: "destructive",
      });
    };

    ws.onerror = () => {
      setWsConnected(false);
    };

    // Fetch initial stats
    fetchStats();

    return () => {
      ws.close();
    };
  }, []);

  const fetchStats = async () => {
    try {
      console.log('📊 Buscando estatísticas...');
      
      const [usersRes, collectionsRes] = await Promise.all([
        fetch('https://skillzeer-realtime.hf.space/api/users'),
        fetch('https://skillzeer-realtime.hf.space/api/collections')
      ]);

      console.log('📡 Status users:', usersRes.status);
      console.log('📡 Status collections:', collectionsRes.status);

      if (usersRes.ok && collectionsRes.ok) {
        const usersData = await usersRes.json();
        const collectionsData = await collectionsRes.json();
        
        console.log('👥 Dados de usuários:', usersData);
        console.log('📦 Dados de coleções:', collectionsData);
        
        // Handle the API response format
        const users = usersData.data || usersData;
        const collections = Array.isArray(collectionsData) ? collectionsData : collectionsData.data || [];
        
        setStats({
          users: Array.isArray(users) ? users.length : (usersData.count || 0),
          collections: Array.isArray(collections) ? collections.length : (collectionsData.count || 0)
        });
      }
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas:', error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-bg p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
            <p className="text-muted-foreground">
              Bem-vindo, {user?.name}!
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant={wsConnected ? "default" : "destructive"} className="flex items-center gap-2">
              {wsConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
              {wsConnected ? 'Online' : 'Offline'}
            </Badge>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="auth-container border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Total</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.users}</div>
              <p className="text-xs text-muted-foreground">
                Usuários cadastrados no sistema
              </p>
            </CardContent>
          </Card>

          <Card className="auth-container border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Coleções</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.collections}</div>
              <p className="text-xs text-muted-foreground">
                Coleções no banco de dados
              </p>
            </CardContent>
          </Card>

          <Card className="auth-container border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status WebSocket</CardTitle>
              {wsConnected ? <Wifi className="h-4 w-4 text-primary" /> : <WifiOff className="h-4 w-4 text-destructive" />}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {wsConnected ? 'Conectado' : 'Desconectado'}
              </div>
              <p className="text-xs text-muted-foreground">
                Atualizações em tempo real
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Updates */}
        <Card className="auth-container border-border/50">
          <CardHeader>
            <CardTitle>Atualizações em Tempo Real</CardTitle>
            <CardDescription>
              Últimas atividades no banco de dados via WebSocket
            </CardDescription>
          </CardHeader>
          <CardContent>
            {realtimeUpdates.length > 0 ? (
              <div className="space-y-3">
                {realtimeUpdates.map((update, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div>
                      <p className="font-medium">{update.type || 'Atualização'}</p>
                      <p className="text-sm text-muted-foreground">
                        Coleção: {update.collection || 'N/A'}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {new Date().toLocaleTimeString()}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma atualização em tempo real ainda</p>
                <p className="text-sm">As atividades do banco aparecerão aqui</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Info */}
        <Card className="auth-container border-border/50">
          <CardHeader>
            <CardTitle>Informações do Usuário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Nome</Label>
                <p className="text-lg">{user?.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-lg">{user?.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">ID</Label>
                <p className="text-sm font-mono bg-secondary/50 p-2 rounded">{user?.id}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Membro desde</Label>
                <p className="text-lg">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Add missing import for Label
import { Label } from '@/components/ui/label';