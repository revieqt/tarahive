import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { BACKEND_URL } from '@/constants/Config';
import { useSession } from '@/context/SessionContext';
import { getAccessToken } from '@/services/token.service';
import { Itinerary } from '@/types/itineraryTypes';

interface ItineraryUpdatedPayload {
  itineraryId: string;
  version: number;
  updatedAt: string;
  actorUserId: string;
  actorName: string;
}

export interface ItineraryRemoteUpdateNotice {
  actorName: string;
  version: number;
}

const itinerarySockets = new Map<string, { socket: Socket; refs: number }>();

export const useItineraryRealtime = (itineraryId?: string | null) => {
  const queryClient = useQueryClient();
  const { session } = useSession();
  const [remoteUpdateNotice, setRemoteUpdateNotice] = useState<ItineraryRemoteUpdateNotice | null>(null);

  useEffect(() => {
    setRemoteUpdateNotice(null);
    if (!itineraryId || !session?.user?.id) {
      return undefined;
    }

    let cancelled = false;
    let activeSocket: Socket | null = null;

    const connectSocket = async () => {
      try {
        const token = await getAccessToken().catch(() => null);
        if (!token || cancelled) {
          return;
        }

        const existingEntry = itinerarySockets.get(itineraryId);
        if (existingEntry) {
          existingEntry.refs += 1;
          activeSocket = existingEntry.socket;
        } else {
          const socket = io(BACKEND_URL, {
            transports: ['websocket'],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            auth: { token },
          });

          const handleUpdated = (payload: ItineraryUpdatedPayload) => {
            if (!payload || payload.itineraryId !== itineraryId) {
              return;
            }

            const current = queryClient.getQueryData<Itinerary>(['itinerary', itineraryId]);
            const currentUpdatedAt = current?.updatedOn ? new Date(current.updatedOn).getTime() : 0;
            const payloadUpdatedAt = payload.updatedAt ? new Date(payload.updatedAt).getTime() : 0;
            if (
              (typeof current?.v === 'number' &&
                typeof payload.version === 'number' &&
                current.v >= payload.version) ||
              (!(typeof current?.v === 'number' && typeof payload.version === 'number') &&
                currentUpdatedAt > 0 &&
                payloadUpdatedAt > 0 &&
                payloadUpdatedAt <= currentUpdatedAt)
            ) {
              return;
            }

            if (payload.actorUserId !== session?.user?.id) {
              setRemoteUpdateNotice({
                actorName: payload.actorName || 'A collaborator',
                version: payload.version,
              });
            }

            void queryClient.refetchQueries({
              queryKey: ['itinerary', itineraryId],
              type: 'active',
            });
            void queryClient.refetchQueries({
              queryKey: ['user-itineraries'],
              type: 'active',
            });
          };

          socket.on('connect', () => {
            if (cancelled) {
              return;
            }
            socket.emit('itinerary:join', { itineraryId });
          });

          socket.on('itinerary.updated', handleUpdated);
          socket.on('itinerary:error', () => {
            // Ignore; real-time sync is optional and should never break the REST save flow.
          });
          socket.on('connect_error', () => {
            // Real-time sync is optional; any REST-based save still works normally.
          });

          activeSocket = socket;
          itinerarySockets.set(itineraryId, { socket, refs: 1 });
        }

        if (activeSocket && !activeSocket.connected) {
          activeSocket.connect();
        }
      } catch {
        // no-op: realtime sync is intentionally best effort
      }
    };

    void connectSocket();

    return () => {
      cancelled = true;
      const currentEntry = itinerarySockets.get(itineraryId);
      if (!currentEntry) {
        return;
      }

      currentEntry.refs -= 1;
      if (currentEntry.refs <= 0) {
        currentEntry.socket.emit('itinerary:leave', { itineraryId });
        currentEntry.socket.off('itinerary.updated');
        currentEntry.socket.off('connect');
        currentEntry.socket.off('itinerary:error');
        currentEntry.socket.off('connect_error');
        currentEntry.socket.disconnect();
        itinerarySockets.delete(itineraryId);
      }
    };
  }, [itineraryId, session?.user?.id, queryClient]);

  return remoteUpdateNotice;
};
