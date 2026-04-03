import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from "path";
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { ipMiddleware } from './middleware/ipMiddleware';
import { connectMongoDB } from './config/mongodb';
import { serverAdapter } from "./config/bullBoard";
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
import { logsExportWorker, initializeLogsExportWorker } from './modules/shared/account/logs-export.worker';
import { authWorker, initializeAuthWorker } from './modules/shared/account/auth.worker';

import sharedRouter from './modules/shared/shared.routes';
import taragRouter from './modules/tarag/tarag.routes';
import veehiveRouter from './modules/veehive/veehive.routes';

app.use('/', sharedRouter);
app.use('/tarag', taragRouter);
app.use('/veehive', veehiveRouter);
app.use("/admin/queues", serverAdapter.getRouter());


app.get('/health', (_req, res) => {
  res.send('TaraG Backend is Running');
});

(async () => {
  // Initialize BullMQ workers
  await initializeLogsExportWorker();
  await initializeAuthWorker();
  
  server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`🔌 Socket.IO listening on port ${PORT}`);
  });
})();

