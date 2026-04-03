import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from "path";
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { ipMiddleware } from './middleware/ipMiddleware';
import { connectMongoDB } from './config/mongodb';
import { serverAdapter } from "./config/bullBoard";
import { initializeChatSocket } from './sockets/chatSocket';
dotenv.config();

const app = express();
const server = createServer(app);

// Initialize Socket.IO with CORS
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(ipMiddleware);
app.use(express.static(path.join(__dirname, "../public")));
app.use('/api/public', express.static(path.join(__dirname, "../public")));
app.use('/uploads', express.static(path.join(__dirname, "../uploads")));
app.set("trust proxy", 1);

// Initialize MongoDB
connectMongoDB();

// Initialize BullMQ Workers
import { sosWorker, initializeSosWorker } from './modules/safety/sos.worker';
import { logsExportWorker, initializeLogsExportWorker } from './modules/account/logs-export.worker';
import { authWorker, initializeAuthWorker } from './modules/account/auth.worker';

import authRouter from './modules/account/auth.routes';
import userRouter from './modules/account/user.routes';
import weatherRouter from './modules/weather/weather.routes';
import safetyRouter from './modules/safety/safety.routes';
import routesRouter from './modules/route/route.routes';
import alertRouter from './modules/alert/alert.routes';
import announcementRouter from './modules/announcement/announcement.routes';
import systemRouter from './modules/system/system.routes';
import itineraryRouter from './modules/itinerary/itinerary.routes';
import placesRouter from './modules/places/places.routes';
import roomRouter from './modules/room/room.routes';
import messageRouter from './modules/room/message.routes';
import aiChatRouter from './modules/ai/ai.routes';
import taraBuddyRouter from './modules/tarabuddy/tarabuddy.routes';

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/weather', weatherRouter);
app.use('/api/safety', safetyRouter);
app.use('/api/routes', routesRouter);
app.use('/api/alerts', alertRouter);
app.use('/api/announcements', announcementRouter);
app.use('/api/system', systemRouter);
app.use('/api/itineraries', itineraryRouter);
app.use('/api/locations', placesRouter);
app.use('/api/rooms', roomRouter);
app.use('/api/messages', messageRouter);
app.use('/api/ai', aiChatRouter);
app.use('/api/tarabuddy', taraBuddyRouter);
app.use("/admin/queues", serverAdapter.getRouter());

// Initialize Socket.IO chat
initializeChatSocket(io);

app.get('/', (_req, res) => {
  res.send('TaraG Backend is Running');
});

(async () => {
  // Initialize BullMQ workers
  await initializeSosWorker();
  await initializeLogsExportWorker();
  await initializeAuthWorker();
  
  server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`🔌 Socket.IO listening on port ${PORT}`);
  });
})();

