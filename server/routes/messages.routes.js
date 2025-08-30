import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get('/messages', (req, res) => {
  try {
    const messagesPath = path.join(__dirname, '../data/message.json');
    
    if (!fs.existsSync(messagesPath)) {
      return res.status(404).json({ error: 'message.json file not found' });
    }
    
    const messagesData = fs.readFileSync(messagesPath, 'utf8');
    const messages = JSON.parse(messagesData);
    res.json(messages);
  } catch (error) {
    console.error('❌ Error loading messages:', error.message);
    res.status(500).json({ error: 'Failed to load messages' });
  }
});

// ✅ FIXED: Use wildcard (*) to capture dot notation paths
router.get('/messages/*', (req, res) => {
  try {
    const messagePath = req.params[0]; // Get everything after /messages/
    const { replacements } = req.query;
    
    console.log('🔍 API Request - Path:', messagePath);
    console.log('🔍 API Request - Replacements:', replacements);
    
    const messagesFilePath = path.join(__dirname, '../data/message.json');
    
    if (!fs.existsSync(messagesFilePath)) {
      return res.status(404).json({ error: 'message.json file not found' });
    }
    
    const messagesData = fs.readFileSync(messagesFilePath, 'utf8');
    const messages = JSON.parse(messagesData);
    
    // Navigate through dot notation (welcome.initial → messages.welcome.initial)
    const keys = messagePath.split('.');
    let message = messages;
    
    for (const key of keys) {
      if (message && typeof message === 'object' && key in message) {
        message = message[key];
      } else {
        return res.status(404).json({ 
          error: `Message not found: ${messagePath}`,
          availableKeys: Object.keys(message || {}),
          searchedKey: key
        });
      }
    }
    
    // Apply replacements if message is a string
    if (replacements && typeof message === 'string') {
      try {
        const replacementObj = JSON.parse(replacements);
        Object.entries(replacementObj).forEach(([key, value]) => {
          message = message.replace(new RegExp(`{${key}}`, 'g'), value);
        });
      } catch (parseError) {
        return res.status(400).json({ error: 'Invalid replacements format' });
      }
    }
    
    res.json({ path: messagePath, message, replacements });
  } catch (error) {
    console.error('❌ Error fetching message:', error.message);
    res.status(500).json({ error: 'Failed to fetch message' });
  }
});

export default router;
