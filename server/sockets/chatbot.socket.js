import { Server } from 'socket.io';
import { 
  getOrCreateUser, 
  addMessageToUser, 
  getUserMessages, 
  getUserBySocket, 
  generateMessageId,
  updateUser 
} from '../models/chatbot.model.js';
import { processConversationStep } from '../services/chatbotService.js';

export function initChatbotSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:3000"],
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ Chatbot user connected: ${socket.id}`);
    
    socket.on('join-conversation', async (conversationId) => {
      const user = await getOrCreateUser(conversationId, socket.id);
      if (user) {
        const userMessages = await getUserMessages(socket.id, conversationId);
        socket.emit('initial-messages', userMessages);
        
        if (userMessages.length === 0 || user.step === 0) {
          socket.emit('fetch-message', { path: 'welcome.initial' });
          
          setTimeout(() => {
            socket.emit('show-options', [
              { text: "🚀 Get Started", value: "Get Started", className: "get-started-btn" }
            ]);
          }, 1000);
        }
      }
    });

    socket.on('send-message', async (data) => {
      const userMessage = {
        id: generateMessageId(),
        text: data.message,
        sender: 'user',
        timestamp: new Date().toISOString()
      };
      
      await addMessageToUser(socket.id, data.conversationId, userMessage);
      socket.emit('new-message', userMessage);
      
      await processConversationStep(socket, data.conversationId, data.message, socket.id);
    });

    socket.on('select-option', async (data) => {
      const user = await getUserBySocket(socket.id);
      if (user) {
        const userMessage = {
          id: generateMessageId(),
          text: data.option,
          sender: 'user',
          timestamp: new Date().toISOString()
        };
        
        await addMessageToUser(socket.id, user.conversation_id, userMessage);
        socket.emit('new-message', userMessage);
        
        await processConversationStep(socket, user.conversation_id, data.option, socket.id);
      }
    });

    socket.on('fetch-message', async (data) => {
      try {
        const response = await fetch(`http://localhost:${process.env.PORT || 5000}/api/messages/${data.path}${data.replacements ? `?replacements=${encodeURIComponent(JSON.stringify(data.replacements))}` : ''}`);
        const messageData = await response.json();
        
        if (messageData.message) {
          const botMessage = {
            id: generateMessageId(),
            text: messageData.message,
            sender: 'bot',
            timestamp: new Date().toISOString()
          };
          
          await addMessageToUser(socket.id, data.conversationId || 'payona_overseas_chat', botMessage);
          socket.emit('new-message', botMessage);
        }
      } catch (error) {
        console.error('❌ Error fetching message:', error);
      }
    });

    socket.on('upload-file', async (data) => {
      try {
        const user = await getUserBySocket(socket.id);
        if (user) {
          await updateUser(socket.id, user.conversation_id, { 
            resume: data.fileName, 
            step: 7 
          });
          
          const resumeMessage = {
            id: generateMessageId(),
            text: `📄 Resume uploaded: ${data.fileName}`,
            sender: 'user',
            timestamp: new Date().toISOString()
          };
          
          await addMessageToUser(socket.id, user.conversation_id, resumeMessage);
          socket.emit('new-message', resumeMessage);
          
          setTimeout(async () => {
            await processConversationStep(socket, user.conversation_id, 'Resume uploaded', socket.id);
          }, 500);
        }
      } catch (error) {
        console.error('❌ Error handling file upload:', error.message);
      }
    });

    socket.on('disconnect', () => {
      console.log(`👋 Chatbot user disconnected: ${socket.id}`);
    });
  });

  return io;
}
