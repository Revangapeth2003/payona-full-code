import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import bodyParser from 'body-parser';

import { pool } from './config/db.js';
import { createTables } from './services/tableInitService.js';

import formsRouter from './routes/forms.routes.js';
import messagesRouter from './routes/messages.routes.js';
import visaRouter from './routes/visa.routes.js';
import { initChatbotSocket } from './sockets/chatbot.socket.js';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

/* global middleware */
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(bodyParser.json());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* routes */
app.use('/api', formsRouter);        // Prefix forms routes with /api
app.use('/api', messagesRouter);     // Prefix messages routes with /api  
app.use('/api', visaRouter);         // Prefix visa routes with /api

/* DB & sockets */
createTables();
const io = initChatbotSocket(server);

/* health & root */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    connections: io?.engine?.clientsCount || 0,
    environment: process.env.NODE_ENV || 'development',
    database: 'Connected',
    chatbot: 'Active',
    routes: {
      forms: '/api/forms/*',
      messages: '/api/messages/*',
      visa: '/api/visa/*',
      email: '/api/send-email', // 🔥 Added email route
      chatbot: 'Socket.IO enabled'
    }
  });
});

app.get('/', (_req, res) => {
  res.json({ 
    message: 'Payana Overseas Backend API', 
    version: '1.0.0',
    status: 'Running',
    features: {
      chatbot: 'Real-time conversation flow with Socket.IO',
      messaging: 'Dynamic messages from message.json',
      database: 'PostgreSQL with conversation tracking',
      email: 'Automated email notifications',
      forms: 'Study/Work/Investment form handling'
    },
    endpoints: {
      chatbot: {
        messages: 'GET /api/messages',
        specificMessage: 'GET /api/messages/:path',
        socketEvents: ['join-conversation', 'send-message', 'select-option']
      },
      forms: {
        study: 'POST /api/submit-form',
        work: 'POST /api/submit-work-form', 
        investment: 'POST /api/submit-invest-form',
        email: 'POST /api/send-email' // 🔥 Added email endpoint
      },
      health: 'GET /health'
    },
    chatbotFlow: {
      steps: 'Welcome → Name → Age → Email → Study/Work → Detailed Flow',
      features: 'Passport check, Resume upload, German language, Appointments',
      emailIntegration: 'Automated lead capture and notifications'
    }
  });
});

/* Error handling middleware */
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!', 
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

/* 404 handler */
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableEndpoints: [
      'GET /',
      'GET /health', 
      'GET /api/messages',
      'GET /api/messages/:path',
      'POST /api/submit-form',
      'POST /api/submit-work-form',
      'POST /api/submit-invest-form',
      'POST /api/send-email' // 🔥 Added to available endpoints
    ]
  });
});

/* Start server */
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`💬 Chatbot Socket.IO active`);  
  console.log(`📝 Messages API: http://localhost:${PORT}/api/messages`);
  console.log(`🎯 Specific message: http://localhost:${PORT}/api/messages/welcome.initial`);
  console.log(`📧 Email API: http://localhost:${PORT}/api/send-email`); // 🔥 Added email endpoint log
  console.log(`💾 Database: PostgreSQL (${process.env.DATABASE_URL ? 'Neon' : 'Local'})`);
  console.log(`📧 Email: ${process.env.EMAIL_USER} → ${process.env.EMAIL_RECIVER}`);
  console.log(`🏠 Tables: study, work_profiles, invest, chatbot_users, chatbot_messages`);
  console.log(`📋 Chatbot flows: Work (steps 5-19), UG (steps 14-18), Study (steps 50-57)`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend: Connect Socket.IO to this server for chatbot`);
});

/* Graceful shutdown */
const gracefulShutdown = (signal) => {
  console.log(`🛑 ${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log('💤 HTTP server closed');
    pool.end(() => {
      console.log('💤 Database pool closed');
      process.exit(0);
    });
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

/* Handle unhandled promise rejections */
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

/* Handle uncaught exceptions */
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

export default app;
