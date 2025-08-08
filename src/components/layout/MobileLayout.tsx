import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, User, Shield } from 'lucide-react';
import { useIsAdmin } from '@/hooks/use-authz';

export const MobileLayout = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const isAdmin = useIsAdmin();
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="sticky top-0 z-20 border-b border-border/60 bg-card/80 backdrop-blur supports-backdrop-blur:bg-background/70 shadow-md">
        <div className="h-16 pt-[env(safe-area-inset-top)] flex items-center px-4">
          <h1 className="text-base font-semibold truncate">{title}</h1>
        </div>
      </div>

      <div className="flex-1 min-h-0">{children}</div>

      <nav className="sticky bottom-0 z-20 border-t border-border/60 bg-card/80 backdrop-blur shadow-md">
        <div className={`grid ${isAdmin ? 'grid-cols-4' : 'grid-cols-3'} h-16 pb-[env(safe-area-inset-bottom)]`}>
          <NavLink
            to="/feed"
            className={({ isActive }) => `flex flex-col items-center justify-center text-xs ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Home className="h-5 w-5" />
            <span>Feed</span>
          </NavLink>
          <NavLink
            to="/groups"
            className={({ isActive }) => `flex flex-col items-center justify-center text-xs ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Users className="h-5 w-5" />
            <span>Grupos</span>
          </NavLink>
          <NavLink
            to="/profile/me"
            className={({ isActive }) => `flex flex-col items-center justify-center text-xs ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <User className="h-5 w-5" />
            <span>Perfil</span>
          </NavLink>
          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) => `flex flex-col items-center justify-center text-xs ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <Shield className="h-5 w-5" />
              <span>Admin</span>
            </NavLink>
          )}
        </div>
      </nav>
    </div>
  );
};