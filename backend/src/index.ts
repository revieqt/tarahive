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

connectMongoDB();

// import { initializeV1Workers } from './modules/v1/v1.workers';
import v1Router from './modules/v1/v1.routes';

app.use('/v1', v1Router);
app.use("/admin/queues", serverAdapter.getRouter());


app.get('/health', (_req, res) => {
  res.send('Tarahive Backend is Running');
});

(async () => {
  // await initializeV1Workers();
  
  server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`🔌 Socket.IO listening on port ${PORT}`);
  });
})();

