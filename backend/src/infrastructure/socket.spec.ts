import assert from 'node:assert/strict';
import http from 'node:http';
import test from 'node:test';
import jwt from 'jsonwebtoken';
import { io as Client } from 'socket.io-client';

import { initializeSocketServer, isValidItineraryRoomPayload, notifyItineraryUpdated, resetSocketServer } from './socket';
import * as itineraryService from '../modules/v2/itinerary/itinerary.service';
import * as userService from '../modules/v2/user/user.service';

const secret = process.env.ACCESS_TOKEN_SECRET || 'default_secret';
const roomId = '123e4567-e89b-12d3-a456-426614174000';
const createToken = (userId: string) => jwt.sign({ sub: userId }, secret);

const waitForEvent = <T>(socket: { once: (event: string, handler: (payload: T) => void) => void }) =>
  new Promise<T>((resolve) => {
    socket.once('itinerary:joined', resolve);
  });

const waitForError = <T>(socket: { once: (event: string, handler: (payload: T) => void) => void }) =>
  new Promise<T>((resolve) => {
    socket.once('itinerary:error', resolve);
  });

test.beforeEach(() => {
  resetSocketServer();
  (itineraryService as any).getItineraryService = async (itineraryId: string, userId: string) => {
    if (itineraryId === roomId && userId === 'user-allowed') {
      return { id: itineraryId, user: { id: userId } } as any;
    }
    return null;
  };
  (userService as any).getUserById = async () => ({
    fname: 'Alex',
    lname: 'Traveler',
  });
});

test.afterEach(() => {
  resetSocketServer();
});

test('valid itinerary room payload is accepted', () => {
  assert.equal(isValidItineraryRoomPayload({ itineraryId: roomId }), true);
  assert.equal(isValidItineraryRoomPayload({}), false);
  assert.equal(isValidItineraryRoomPayload({ itineraryId: '' }), false);
});

test('authorized users can join itinerary rooms and receive update notifications', async () => {
  const httpServer = http.createServer();
  const io = initializeSocketServer(httpServer);
  assert.ok(io);

  await new Promise<void>((resolve) => httpServer.listen(0, resolve));
  const { port } = httpServer.address() as { port: number };

  const client = Client(`http://localhost:${port}`, {
    transports: ['websocket'],
    auth: { token: createToken('user-allowed') },
  });

  await new Promise<void>((resolve) => client.on('connect', () => resolve()));
  client.emit('itinerary:join', { itineraryId: roomId });

  const joined = await waitForEvent<{ itineraryId: string }>(client);
  assert.equal(joined.itineraryId, roomId);

  const payloadPromise = new Promise<{
    itineraryId: string;
    version: number;
    actorUserId: string;
    actorName: string;
  }>((resolve) => {
    client.on('itinerary.updated', (event) => resolve(event));
  });

  notifyItineraryUpdated(roomId, 7, '2026-10-26T00:00:00.000Z', 'user-allowed');
  const payload = await payloadPromise;
  assert.equal(payload.itineraryId, roomId);
  assert.equal(payload.version, 7);
  assert.equal(payload.actorUserId, 'user-allowed');
  assert.equal(payload.actorName, 'Alex Traveler');

  client.disconnect();
  await new Promise<void>((resolve) => httpServer.close(() => resolve()));
});

test('unauthorized users cannot join itinerary rooms', async () => {
  const httpServer = http.createServer();
  const io = initializeSocketServer(httpServer);
  assert.ok(io);

  await new Promise<void>((resolve) => httpServer.listen(0, resolve));
  const { port } = httpServer.address() as { port: number };

  const client = Client(`http://localhost:${port}`, {
    transports: ['websocket'],
    auth: { token: createToken('user-denied') },
  });

  await new Promise<void>((resolve) => client.on('connect', () => resolve()));
  client.emit('itinerary:join', { itineraryId: roomId });

  const errorPayload = await waitForError<{ message: string }>(client);
  assert.equal(errorPayload.message, 'Access denied');

  client.disconnect();
  await new Promise<void>((resolve) => httpServer.close(() => resolve()));
});
