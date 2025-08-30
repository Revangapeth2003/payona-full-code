import { pool } from '../config/db.js';

// Utility function for generating message IDs
export const generateMessageId = () => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const getOrCreateUser = async (conversationId, socketId) => {
  const client = await pool.connect();
  try {
    let result = await client.query(
      'SELECT * FROM chatbot_users WHERE socket_id = $1 AND conversation_id = $2',
      [socketId, conversationId]
    );

    if (result.rows.length > 0) {
      return result.rows[0];
    }

    const insertResult = await client.query(`
      INSERT INTO chatbot_users (socket_id, conversation_id, step, last_activity, status, joined_at)
      VALUES ($1, $2, 0, CURRENT_TIMESTAMP, 'active', CURRENT_TIMESTAMP)
      RETURNING *
    `, [socketId, conversationId]);

    console.log('✅ New chatbot user created:', insertResult.rows[0].id);
    return insertResult.rows[0];
  } catch (error) {
    console.error('❌ Error creating/fetching chatbot user:', error.message);
    return null;
  } finally {
    client.release();
  }
};

export const addMessageToUser = async (socketId, conversationId, messageData) => {
  const client = await pool.connect();
  try {
    const userResult = await client.query(
      'SELECT id FROM chatbot_users WHERE socket_id = $1 AND conversation_id = $2',
      [socketId, conversationId]
    );

    if (userResult.rows.length === 0) {
      return false;
    }

    const userId = userResult.rows[0].id;

    await client.query(`
      INSERT INTO chatbot_messages (user_id, message_id, text, sender, message_type, timestamp)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      userId,
      messageData.id,
      messageData.text,
      messageData.sender,
      messageData.messageType || 'text',
      messageData.timestamp
    ]);

    await client.query(
      'UPDATE chatbot_users SET last_activity = CURRENT_TIMESTAMP WHERE id = $1',
      [userId]
    );

    return true;
  } catch (error) {
    console.error('❌ Error adding message:', error.message);
    return false;
  } finally {
    client.release();
  }
};

export const updateUser = async (socketId, conversationId, updates) => {
  const client = await pool.connect();
  try {
    const updateFields = Object.keys(updates);
    const updateValues = Object.values(updates);
    
    const setClause = updateFields.map((field, index) => {
      const dbField = field.replace(/([A-Z])/g, '_$1').toLowerCase();
      return `${dbField} = $${index + 3}`;
    }).join(', ');

    const query = `
      UPDATE chatbot_users 
      SET ${setClause}, last_activity = CURRENT_TIMESTAMP
      WHERE socket_id = $1 AND conversation_id = $2
      RETURNING *
    `;

    const result = await client.query(query, [socketId, conversationId, ...updateValues]);
    return result.rows.length > 0;
  } catch (error) {
    console.error('❌ Error updating chatbot user:', error.message);
    return false;
  } finally {
    client.release();
  }
};

export const getUserMessages = async (socketId, conversationId) => {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT m.message_id as id, m.text, m.sender, m.timestamp, m.message_type as "messageType"
      FROM chatbot_messages m
      JOIN chatbot_users u ON m.user_id = u.id
      WHERE u.socket_id = $1 AND u.conversation_id = $2
      ORDER BY m.timestamp ASC
    `, [socketId, conversationId]);

    return result.rows;
  } catch (error) {
    console.error('❌ Error fetching messages:', error.message);
    return [];
  } finally {
    client.release();
  }
};

export const getUserBySocket = async (socketId) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM chatbot_users WHERE socket_id = $1 ORDER BY created_at DESC LIMIT 1',
      [socketId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('❌ Error fetching user by socket:', error.message);
    return null;
  } finally {
    client.release();
  }
};
