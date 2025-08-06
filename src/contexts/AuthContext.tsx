import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = 'https://skillzeer-realtime.hf.space';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log('🔍 Iniciando login para:', email);
      
      // First, get all users to check if email exists
      const response = await fetch(`${API_BASE}/api/users`);
      console.log('📡 Status da resposta GET /api/users:', response.status);
      
      if (!response.ok) {
        console.error('❌ Erro na resposta:', response.status, response.statusText);
        throw new Error(`Erro no servidor: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('📊 Dados recebidos:', responseData);
      
      // Handle the API response format: {"collection":"users","count":1,"data":[...]}
      const users = responseData.data || responseData;
      console.log('👥 Usuários encontrados:', users);
      
      const foundUser = users.find((u: any) => u.email === email && u.password === password);
      console.log('🔍 Usuário encontrado:', foundUser ? 'Sim' : 'Não');
      
      if (foundUser) {
        const userInfo = {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          createdAt: foundUser.createdAt
        };
        setUser(userInfo);
        localStorage.setItem('auth_user', JSON.stringify(userInfo));
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo de volta, ${foundUser.name}!`,
        });
        return true;
      } else {
        toast({
          title: "Erro no login",
          description: "Email ou senha incorretos.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('❌ Erro completo no login:', error);
      toast({
        title: "Erro de conexão",
        description: `Não foi possível conectar ao servidor: ${error}`,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log('🔄 Iniciando registro para:', { name, email });
      
      // Check if email already exists
      const checkResponse = await fetch(`${API_BASE}/api/users`);
      console.log('📡 Status da verificação GET /api/users:', checkResponse.status);
      
      if (checkResponse.ok) {
        const responseData = await checkResponse.json();
        console.log('📊 Dados de verificação:', responseData);
        
        // Handle the API response format
        const users = responseData.data || responseData;
        const existingUser = users.find((u: any) => u.email === email);
        
        if (existingUser) {
          console.log('⚠️ Email já existe:', email);
          toast({
            title: "Email já cadastrado",
            description: "Este email já está em uso.",
            variant: "destructive",
          });
          return false;
        }
      }

      // Try to create new user
      console.log('📝 Tentando criar usuário...');
      const userData = {
        name,
        email,
        password,
        createdAt: new Date().toISOString()
      };
      console.log('📤 Dados sendo enviados:', userData);

      const createResponse = await fetch(`${API_BASE}/api/users`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      console.log('📡 Status da criação POST /api/users:', createResponse.status);
      console.log('📋 Headers da resposta:', Object.fromEntries(createResponse.headers.entries()));

      if (createResponse.ok) {
        const newUser = await createResponse.json();
        console.log('✅ Usuário criado:', newUser);
        
        const userInfo = {
          id: newUser.id || Date.now().toString(), // Fallback ID
          name: newUser.name || name,
          email: newUser.email || email,
          createdAt: newUser.createdAt || new Date().toISOString()
        };
        setUser(userInfo);
        localStorage.setItem('auth_user', JSON.stringify(userInfo));
        toast({
          title: "Conta criada com sucesso!",
          description: `Bem-vindo, ${name}!`,
        });
        return true;
      } else {
        // Try to get error details
        let errorText = '';
        try {
          const errorData = await createResponse.text();
          console.log('❌ Erro detalhado da API:', errorData);
          errorText = errorData;
        } catch (e) {
          console.log('❌ Não foi possível ler erro da API');
        }
        
        throw new Error(`Erro ${createResponse.status}: ${createResponse.statusText}. ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Erro completo no registro:', error);
      
      // Show detailed error to user
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro ao criar conta",
        description: `Detalhes: ${errorMessage}`,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};