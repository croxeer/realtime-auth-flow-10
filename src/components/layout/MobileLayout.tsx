import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Users, User } from 'lucide-react';

export const MobileLayout = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const location = useLocation();
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="sticky top-0 z-20 border-b border-border/50 bg-card/70 backdrop-blur supports-backdrop-blur:bg-background/60">
        <div className="h-14 flex items-center px-4">
          <h1 className="text-lg font-semibold truncate">{title}</h1>
        </div>
      </div>

      <div className="flex-1 min-h-0">{children}</div>

      <nav className="sticky bottom-0 z-20 border-t border-border/50 bg-card/70 backdrop-blur">
        <div className="grid grid-cols-3 h-14">
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
        </div>
      </nav>
    </div>
  );
};