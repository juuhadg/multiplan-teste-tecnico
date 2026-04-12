import { useEffect } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { NewOfferEvent } from '../types';

let socket: Socket | null = null;

function getSocket(): Socket {
  if (!socket) {
    const url = import.meta.env.VITE_WS_URL ?? 'http://localhost:3000';
    socket = io(url, { transports: ['websocket'] });
  }
  return socket;
}

export function useNewOfferListener(handler: (offer: NewOfferEvent) => void) {
  useEffect(() => {
    const s = getSocket();
    s.on('offer:created', handler);
    return () => {
      s.off('offer:created', handler);
    };
  }, [handler]);
}
