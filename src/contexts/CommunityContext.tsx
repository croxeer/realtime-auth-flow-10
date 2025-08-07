import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CommunityAPI, CommunityGroup, CommunityPost, CommunityComment, API_BASE } from '@/lib/api';

interface CommunityContextValue {
  latestEvent?: any;
}

const CommunityContext = createContext<CommunityContextValue | undefined>(undefined);

export const CommunityProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const [latestEvent, setLatestEvent] = useState<any>();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const wsUrl = 'wss://skillzeer-realtime.hf.space';
    try {
      wsRef.current = new WebSocket(wsUrl);
      wsRef.current.onopen = () => {};
      wsRef.current.onmessage = (event) => {
        try {
          const update = JSON.parse(event.data);
          setLatestEvent(update);
          const collection = update.collection as string | undefined;
          if (collection === 'groups') {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
          }
          if (collection === 'posts') {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
          }
          if (collection === 'comments') {
            queryClient.invalidateQueries({ queryKey: ['comments'] });
          }
          if (collection === 'profiles') {
            queryClient.invalidateQueries({ queryKey: ['profiles'] });
          }
        } catch {}
      };
      wsRef.current.onclose = () => {
        setTimeout(() => {
          // attempt reconnect
          if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
            wsRef.current = null;
            // simple re-mount effect: set state to trigger re-creation
            setLatestEvent((p: any) => ({ ...p }));
          }
        }, 2000);
      };
    } catch {}

    return () => {
      if (wsRef.current) wsRef.current.close(1000);
    };
  }, [queryClient]);

  const value = useMemo<CommunityContextValue>(() => ({ latestEvent }), [latestEvent]);

  return <CommunityContext.Provider value={value}>{children}</CommunityContext.Provider>;
};

export const useCommunity = () => {
  const ctx = useContext(CommunityContext);
  if (!ctx) throw new Error('useCommunity must be used within CommunityProvider');
  return ctx;
};