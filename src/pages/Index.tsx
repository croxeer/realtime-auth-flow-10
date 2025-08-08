import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthPage } from '@/components/AuthPage';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (user) {
    navigate('/feed');
    return null;
  }

  return <AuthPage />;
};

export default Index;
