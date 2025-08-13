const express = require('express');
const { createServer } = require('http');
const { Server: SocketIOServer } = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const server = createServer(app);
const port = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.IO Setup
const io = new SocketIOServer(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// PostgreSQL setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test database connection
pool.connect()
  .then(client => {
    console.log('✅ Connected to PostgreSQL');
    client.release();
  })
  .catch(error => {
    console.error('❌ PostgreSQL connection error:', error);
    process.exit(1);
  });

// Nodemailer setup - CORRECTED
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD
  }
});

// Email functions
const sendEmail = (subject, htmlContent) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_RECIVER || process.env.ADMIN_EMAIL,
    subject,
    html: htmlContent
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.error('Error sending email:', error);
    }
    console.log('Email sent:', info.response);
  });
};

const sendChatbotEmail = async (emailData, type) => {
  try {
    let subject = '';
    let htmlContent = '';

    switch(type) {
      case 'german':
        subject = `New German Program Inquiry - ${emailData.name}`;
        htmlContent = `
          <h2>🇩🇪 New German Program Application</h2>
          <p><strong>Name:</strong> ${emailData.name}</p>
          <p><strong>Age:</strong> ${emailData.age}</p>
          <p><strong>Email:</strong> ${emailData.email}</p>
          <p><strong>Purpose:</strong> ${emailData.purpose}</p>
          <p><strong>Passport:</strong> ${emailData.passport}</p>
          <p><strong>Resume:</strong> ${emailData.resume}</p>
          <p><strong>Qualification:</strong> ${emailData.qualification}</p>
          <p><strong>Experience:</strong> ${emailData.experience}</p>
          <p><strong>Interested Categories:</strong> ${emailData.interestedInCategories}</p>
          <p><strong>German Language:</strong> ${emailData.germanLanguage}</p>
          <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
        `;
        break;
      case 'ug':
        subject = `New UG Program Inquiry - ${emailData.name}`;
        htmlContent = `
          <h2>🎓 New UG Program Application</h2>
          <p><strong>Name:</strong> ${emailData.name}</p>
          <p><strong>Age:</strong> ${emailData.age}</p>
          <p><strong>Email:</strong> ${emailData.email}</p>
          <p><strong>UG Major:</strong> ${emailData.ugMajor}</p>
          <p><strong>Work Experience:</strong> ${emailData.workExperience}</p>
          ${emailData.experienceYears ? `<p><strong>Experience Years:</strong> ${emailData.experienceYears}</p>` : ''}
          <p><strong>German Language:</strong> ${emailData.germanLanguageUG}</p>
          <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
        `;
        break;
      case 'study':
        subject = `New Study Program Inquiry - ${emailData.name}`;
        htmlContent = `
          <h2>📚 New Study Program Application</h2>
          <p><strong>Name:</strong> ${emailData.name}</p>
          <p><strong>Age:</strong> ${emailData.age}</p>
          <p><strong>Email:</strong> ${emailData.email}</p>
          <p><strong>Qualification:</strong> ${emailData.qualification}</p>
          <p><strong>Study Country:</strong> ${emailData.studyCountry}</p>
          <p><strong>Study Level:</strong> ${emailData.studyLevel}</p>
          <p><strong>Field of Study:</strong> ${emailData.studyField}</p>
          <p><strong>Budget:</strong> ${emailData.studyBudget}</p>
          <p><strong>Start Time:</strong> ${emailData.studyStartTime}</p>
          <p><strong>Duration:</strong> ${emailData.studyDuration}</p>
          <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
        `;
        break;
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_RECIVER || process.env.ADMIN_EMAIL || 'admin@payanaoverseas.com',
      cc: emailData.email,
      subject,
      html: htmlContent
    });

    console.log(`✅ ${type} chatbot email sent successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Error sending ${type} chatbot email:`, error.message);
    return false;
  }
};

const formatAsTable = (dataObj) => {
  return `
    <table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse;">
      ${Object.entries(dataObj).map(([key, value]) =>
        `<tr><th align="left">${key}</th><td>${value}</td></tr>`).join('')}
    </table>
  `;
};

// Create all tables
const createTables = async () => {
  const client = await pool.connect();
  try {
    // Existing tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS study (
        id SERIAL PRIMARY KEY,
        country VARCHAR(100),
        qualification VARCHAR(50),
        age VARCHAR(20),
        education_topic VARCHAR(100),
        cgpa VARCHAR(20),
        budget VARCHAR(50),
        needs_loan BOOLEAN,
        name VARCHAR(100),
        email VARCHAR(100),
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Study table created or already exists');

    await client.query(`
      CREATE TABLE IF NOT EXISTS work_profiles (
        id SERIAL PRIMARY KEY,
        occupation VARCHAR(100),
        education VARCHAR(100),
        experience VARCHAR(100),
        name VARCHAR(100),
        email VARCHAR(100),
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Work_profiles table created or already exists');

    await client.query(`
      CREATE TABLE IF NOT EXISTS invest (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100),
        country VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Invest table created or already exists');

    // Chatbot tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS chatbot_users (
        id SERIAL PRIMARY KEY,
        socket_id VARCHAR(255) NOT NULL,
        conversation_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) DEFAULT '',
        age VARCHAR(10) DEFAULT '',
        email VARCHAR(255) DEFAULT '',
        purpose VARCHAR(100) DEFAULT '',
        passport VARCHAR(10) DEFAULT '',
        resume VARCHAR(500) DEFAULT NULL,
        qualification VARCHAR(100) DEFAULT '',
        ug_major VARCHAR(100) DEFAULT '',
        work_experience VARCHAR(10) DEFAULT '',
        experience_years VARCHAR(50) DEFAULT '',
        german_language_ug VARCHAR(10) DEFAULT '',
        ug_email_sent BOOLEAN DEFAULT FALSE,
        ug_program_continue VARCHAR(10) DEFAULT '',
        ug_program_start_time VARCHAR(50) DEFAULT '',
        experience VARCHAR(100) DEFAULT '',
        interested_in_categories VARCHAR(100) DEFAULT '',
        german_language VARCHAR(10) DEFAULT '',
        continue_program VARCHAR(10) DEFAULT '',
        program_start_time VARCHAR(50) DEFAULT '',
        email_sent BOOLEAN DEFAULT FALSE,
        is_processing_email BOOLEAN DEFAULT FALSE,
        current_flow VARCHAR(50) DEFAULT '',
        is_processing_ug_email BOOLEAN DEFAULT FALSE,
        step INTEGER DEFAULT 0,
        study_country VARCHAR(100) DEFAULT '',
        study_level VARCHAR(100) DEFAULT '',
        study_field VARCHAR(100) DEFAULT '',
        study_budget VARCHAR(100) DEFAULT '',
        study_start_time VARCHAR(100) DEFAULT '',
        study_duration VARCHAR(100) DEFAULT '',
        study_email_sent BOOLEAN DEFAULT FALSE,
        study_program_continue VARCHAR(10) DEFAULT '',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(socket_id, conversation_id)
      )
    `);
    console.log('Chatbot_users table created or already exists');

    await client.query(`
      CREATE TABLE IF NOT EXISTS chatbot_messages (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES chatbot_users(id) ON DELETE CASCADE,
        message_id VARCHAR(255) NOT NULL UNIQUE,
        text TEXT NOT NULL,
        sender VARCHAR(10) NOT NULL CHECK (sender IN ('user', 'bot')),
        message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'options', 'summary')),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Chatbot_messages table created or already exists');

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_chatbot_users_socket_conversation 
      ON chatbot_users(socket_id, conversation_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_chatbot_users_conversation_id 
      ON chatbot_users(conversation_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_chatbot_users_last_activity 
      ON chatbot_users(last_activity)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_chatbot_messages_user_id 
      ON chatbot_messages(user_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_chatbot_messages_timestamp 
      ON chatbot_messages(timestamp)
    `);

    // Create trigger function for updating updated_at
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_chatbot_users_updated_at ON chatbot_users
    `);
    await client.query(`
      CREATE TRIGGER update_chatbot_users_updated_at 
      BEFORE UPDATE ON chatbot_users
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);

    console.log('All database tables and indexes created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    client.release();
  }
};

// Initialize tables
createTables();

// Utility Functions for Chatbot
const generateMessageId = () => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validateName = (name) => {
  return /^[a-zA-Z\s]+$/.test(name.trim()) && name.trim().length >= 2;
};

const validateAge = (age) => {
  const numAge = parseInt(age);
  return !isNaN(numAge) && numAge >= 16 && numAge <= 65;
};

// Chatbot Database Functions
const getOrCreateUser = async (conversationId, socketId) => {
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
      INSERT INTO chatbot_users (socket_id, conversation_id, step)
      VALUES ($1, $2, 0)
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

const addMessageToUser = async (socketId, conversationId, messageData) => {
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

const updateUser = async (socketId, conversationId, updates) => {
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

const getUserMessages = async (socketId, conversationId) => {
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

const getUserBySocket = async (socketId) => {
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

// COMPLETE Chatbot Conversation Logic with ALL STEPS
const processConversationStep = async (socket, conversationId, response, socketId) => {
  const user = await getUserBySocket(socketId);
  if (!user) return;

  const step = user.step;
  console.log(`🔄 Processing step ${step}: "${response}"`);

  const requestMessage = (path, replacements, delay = 300) => {
    setTimeout(() => {
      socket.emit('fetch-message', { path, replacements });
    }, delay);
  };

  const showOptions = (options, delay = 500) => {
    setTimeout(() => {
      socket.emit('show-options', options);
    }, delay);
  };

  switch(step) {
    case 0: // Get Started
      if (response === 'Get Started') {
        await updateUser(socketId, conversationId, { step: 1 });
        requestMessage('prompts.name');
      }
      break;
      
    case 1: // Name validation
      if (validateName(response)) {
        await updateUser(socketId, conversationId, { step: 2, name: response.trim() });
        requestMessage('prompts.nameSuccess', { name: response.trim() });
      } else {
        requestMessage('validation.nameInvalid');
      }
      break;
      
    case 2: // Age validation
      if (validateAge(response)) {
        await updateUser(socketId, conversationId, { step: 3, age: response });
        requestMessage('prompts.age');
      } else {
        requestMessage('validation.ageInvalid');
      }
      break;
      
    case 3: // Email validation
      if (validateEmail(response)) {
        await updateUser(socketId, conversationId, { step: 4, email: response.toLowerCase() });
        requestMessage('prompts.email');
        showOptions([
          { text: "📚 Study", value: "Study", className: "study-btn" },
          { text: "💼 Work", value: "Work", className: "work-btn" }
        ]);
      } else {
        requestMessage('validation.emailInvalid');
      }
      break;
      
    case 4: // Purpose selection
      if (response === 'Study') {
        await updateUser(socketId, conversationId, { step: 50, purpose: response, currentFlow: 'study' });
        requestMessage('qualificationOptions.study');
        showOptions([
          { text: "🎓 12th Completed", value: "12th Completed", className: "qualification-btn" },
          { text: "🎓 UG Completed", value: "UG Completed", className: "qualification-btn" },
          { text: "🎓 PG Completed", value: "PG Completed", className: "qualification-btn" }
        ]);
      } else if (response === 'Work') {
        await updateUser(socketId, conversationId, { step: 5, purpose: response, currentFlow: 'work' });
        requestMessage('prompts.passport');
        showOptions([
          { text: "✅ Yes", value: "Yes", className: "yes-btn" },
          { text: "❌ No", value: "No", className: "no-btn" }
        ]);
      } else {
        requestMessage('validation.selectStudyOrWork');
      }
      break;

    // Work Flow Cases (5-19)
    case 5: // Passport question
      if (response === 'Yes' || response === 'No') {
        const nextStep = response === 'No' ? 19 : 6;
        await updateUser(socketId, conversationId, { 
          passport: response, 
          step: nextStep
        });
        
        if (response === 'No') {
          requestMessage('responses.noPassport');
          setTimeout(async () => {
            requestMessage('responses.noPassportContinue');
            showOptions([
              { text: "✅ Yes", value: "Yes", className: "yes-btn" },
              { text: "📘 Claim Free Passport", value: "Claim Free Passport", className: "passport-btn" },
              { text: "📝 Register Now", value: "Register Now", className: "register-btn" }
            ]);
          }, 1000);
        } else {
          requestMessage('prompts.resume');
          showOptions([
            { text: "📄 Upload Resume", value: "Upload Resume", className: "upload-btn" },
            { text: "🚫 No Resume", value: "No Resume", className: "no-resume-btn" }
          ]);
        }
      } else {
        requestMessage('validation.selectYesOrNo');
      }
      break;

    case 6: // Resume handling
      if (response === 'Upload Resume') {
        socket.emit('trigger-file-upload');
      } else if (response === 'No Resume') {
        await updateUser(socketId, conversationId, { resume: 'No resume', step: 7 });
        requestMessage('prompts.qualification');
        showOptions([
          { text: "🎓 12th Completed", value: "12th Completed", className: "qualification-btn" },
          { text: "🎓 UG Completed", value: "UG Completed", className: "qualification-btn" },
          { text: "🎓 PG Completed", value: "PG Completed", className: "qualification-btn" }
        ]);
      }
      break;

    case 7: // Qualification selection (Work flow)
      const qualifications = ["12th Completed", "UG Completed", "PG Completed"];
      if (qualifications.includes(response)) {
        if (response === "UG Completed") {
          await updateUser(socketId, conversationId, { qualification: response, step: 14, currentFlow: 'ug_selection' });
          requestMessage('prompts.ugMajor');
          showOptions([
            { text: "⚕️ MBBS", value: "MBBS", className: "major-btn" },
            { text: "🦷 BDS", value: "BDS", className: "major-btn" },
            { text: "💊 Pharmacy", value: "Pharmacy", className: "major-btn" },
            { text: "🔬 Physiotherapy", value: "Physiotherapy", className: "major-btn" },
            { text: "🧬 Nursing", value: "Nursing", className: "major-btn" },
            { text: "🏥 Other Medical", value: "Other Medical", className: "major-btn" }
          ]);
        } else {
          await updateUser(socketId, conversationId, { qualification: response, step: 8 });
          requestMessage('prompts.workExperience');
          showOptions([
            { text: "✅ Yes", value: "Yes", className: "yes-btn" },
            { text: "❌ No", value: "No", className: "no-btn" }
          ]);
        }
      } else {
        requestMessage('validation.selectQualification');
      }
      break;

    case 8: // Work experience question
      if (response === 'Yes' || response === 'No') {
        if (response === 'Yes') {
          await updateUser(socketId, conversationId, { workExperience: response, step: 9 });
          requestMessage('prompts.experienceYears');
          showOptions([
            { text: "1-2 years", value: "1-2 years", className: "experience-btn" },
            { text: "3-5 years", value: "3-5 years", className: "experience-btn" },
            { text: "5+ years", value: "5+ years", className: "experience-btn" }
          ]);
        } else {
          await updateUser(socketId, conversationId, { workExperience: response, step: 10, experience: 'No experience' });
          requestMessage('prompts.interestedCategories');
          showOptions([
            { text: "🏗️ Construction", value: "Construction", className: "category-btn" },
            { text: "🍳 Hotel Management", value: "Hotel Management", className: "category-btn" },
            { text: "👩‍⚕️ Healthcare", value: "Healthcare", className: "category-btn" },
            { text: "🛠️ Technical", value: "Technical", className: "category-btn" }
          ]);
        }
      } else {
        requestMessage('validation.selectYesOrNo');
      }
      break;

    case 9: // Experience years selection
      const experienceOptions = ["1-2 years", "3-5 years", "5+ years"];
      if (experienceOptions.includes(response)) {
        await updateUser(socketId, conversationId, { experienceYears: response, step: 10, experience: response });
        requestMessage('prompts.interestedCategories');
        showOptions([
          { text: "🏗️ Construction", value: "Construction", className: "category-btn" },
          { text: "🍳 Hotel Management", value: "Hotel Management", className: "category-btn" },
          { text: "👩‍⚕️ Healthcare", value: "Healthcare", className: "category-btn" },
          { text: "🛠️ Technical", value: "Technical", className: "category-btn" }
        ]);
      } else {
        requestMessage('validation.selectExperience');
      }
      break;

    case 10: // Interested categories
      const categories = ["Construction", "Hotel Management", "Healthcare", "Technical"];
      if (categories.includes(response)) {
        await updateUser(socketId, conversationId, { interestedInCategories: response, step: 11 });
        requestMessage('prompts.germanLanguage');
        showOptions([
          { text: "✅ Yes", value: "Yes", className: "yes-btn" },
          { text: "❌ No", value: "No", className: "no-btn" }
        ]);
      } else {
        requestMessage('validation.selectYesOrNo');
      }
      break;

    case 11: // German language - Send email
      if (response === 'Yes' || response === 'No') {
        await updateUser(socketId, conversationId, { germanLanguage: response, step: 12 });
        
        const emailData = {
          name: user.name,
          age: user.age,
          email: user.email,
          purpose: user.purpose,
          passport: user.passport,
          resume: user.resume,
          qualification: user.qualification,
          experience: user.experience,
          interestedInCategories: user.interested_in_categories,
          germanLanguage: response
        };
        
        const emailSent = await sendChatbotEmail(emailData, 'german');
        await updateUser(socketId, conversationId, { emailSent });
        
        if (emailSent) {
          requestMessage('success.emailSent');
        } else {
          requestMessage('errors.emailFailed');
        }
        
        setTimeout(async () => {
          requestMessage('prompts.continueProgram');
          showOptions([
            { text: "✅ Yes", value: "Yes", className: "yes-btn" },
            { text: "❌ No", value: "No", className: "no-btn" }
          ]);
        }, 1500);
      } else {
        requestMessage('validation.selectYesOrNo');
      }
      break;

    case 12: // Continue program question
      if (response === 'Yes' || response === 'No') {
        await updateUser(socketId, conversationId, { continueProgram: response, step: 13 });
        
        if (response === 'Yes') {
          requestMessage('prompts.programStart');
          showOptions([
            { text: "🚀 Immediately", value: "Immediately", className: "time-btn" },
            { text: "📅 Within 1 month", value: "Within 1 month", className: "time-btn" },
            { text: "⏰ Within 3 months", value: "Within 3 months", className: "time-btn" },
            { text: "📆 Within 6 months", value: "Within 6 months", className: "time-btn" }
          ]);
        } else {
          requestMessage('responses.noContinueProgram');
        }
      } else {
        requestMessage('validation.selectYesOrNo');
      }
      break;

    case 13: // Program start time
      const startTimes = ["Immediately", "Within 1 month", "Within 3 months", "Within 6 months"];
      if (startTimes.includes(response)) {
        await updateUser(socketId, conversationId, { programStartTime: response });
        requestMessage('summary.thankYouWork', { name: user.name });
      } else {
        requestMessage('validation.selectStartTime');
      }
      break;

    // UG Flow cases (14-18)
    case 14: // UG Major selection
      const ugMajors = ["MBBS", "BDS", "Pharmacy", "Physiotherapy", "Nursing", "Other Medical"];
      if (ugMajors.includes(response)) {
        await updateUser(socketId, conversationId, { ugMajor: response, step: 15 });
        requestMessage('prompts.workExperience');
        showOptions([
          { text: "✅ Yes", value: "Yes", className: "yes-btn" },
          { text: "❌ No", value: "No", className: "no-btn" }
        ]);
      } else {
        requestMessage('validation.selectUgMajor');
      }
      break;

    case 15: // UG Work experience
      if (response === 'Yes' || response === 'No') {
        if (response === 'Yes') {
          await updateUser(socketId, conversationId, { workExperience: response, step: 16 });
          requestMessage('prompts.experienceYears');
          showOptions([
            { text: "1-2 years", value: "1-2 years", className: "experience-btn" },
            { text: "3-5 years", value: "3-5 years", className: "experience-btn" },
            { text: "5+ years", value: "5+ years", className: "experience-btn" }
          ]);
        } else {
          await updateUser(socketId, conversationId, { workExperience: response, step: 17 });
          const promptKey = user.ug_major === 'MBBS' || user.ug_major === 'BDS' ? 'prompts.germanLanguageDentist' : 'prompts.germanLanguageUG';
          requestMessage(promptKey);
          showOptions([
            { text: "✅ Yes", value: "Yes", className: "yes-btn" },
            { text: "❌ No", value: "No", className: "no-btn" }
          ]);
        }
      } else {
        requestMessage('validation.selectYesOrNo');
      }
      break;

    case 16: // UG Experience years
      const ugExperienceOptions = ["1-2 years", "3-5 years", "5+ years"];
      if (ugExperienceOptions.includes(response)) {
        await updateUser(socketId, conversationId, { experienceYears: response, step: 17 });
        const promptKey = user.ug_major === 'MBBS' || user.ug_major === 'BDS' ? 'prompts.germanLanguageDentist' : 'prompts.germanLanguageUG';
        requestMessage(promptKey);
        showOptions([
          { text: "✅ Yes", value: "Yes", className: "yes-btn" },
          { text: "❌ No", value: "No", className: "no-btn" }
        ]);
      } else {
        requestMessage('validation.selectExperience');
      }
      break;

    case 17: // UG German language & exam readiness - Send email
      if (response === 'Yes' || response === 'No') {
        await updateUser(socketId, conversationId, { germanLanguageUG: response, step: 18 });
        
        const emailData = {
          name: user.name,
          age: user.age,
          email: user.email,
          ugMajor: user.ug_major,
          workExperience: user.work_experience,
          experienceYears: user.experience_years,
          germanLanguageUG: response
        };
        
        const emailSent = await sendChatbotEmail(emailData, 'ug');
        await updateUser(socketId, conversationId, { ugEmailSent: emailSent });
        
        if (emailSent) {
          requestMessage('success.ugEmailSent');
        } else {
          requestMessage('errors.ugEmailFailed');
        }
        
        setTimeout(async () => {
          requestMessage('prompts.continueProgramUG');
          showOptions([
            { text: "✅ Yes", value: "Yes", className: "yes-btn" },
            { text: "❌ No", value: "No", className: "no-btn" }
          ]);
        }, 1500);
      } else {
        requestMessage('validation.selectYesOrNo');
      }
      break;

    case 18: // UG Continue program
      if (response === 'Yes' || response === 'No') {
        await updateUser(socketId, conversationId, { ugProgramContinue: response });
        
        if (response === 'Yes') {
          requestMessage('prompts.programStart');
          showOptions([
            { text: "🚀 Immediately", value: "Immediately", className: "time-btn" },
            { text: "📅 Within 1 month", value: "Within 1 month", className: "time-btn" },
            { text: "⏰ Within 3 months", value: "Within 3 months", className: "time-btn" },
            { text: "📆 Within 6 months", value: "Within 6 months", className: "time-btn" }
          ]);
        } else {
          requestMessage('responses.noUGProgram');
        }
      } else {
        requestMessage('validation.selectYesOrNo');
      }
      break;

    case 19: // No passport flow continuation
      if (response === 'Yes' || response === 'Claim Free Passport' || response === 'Register Now') {
        requestMessage('summary.contactImmediate');
      } else {
        requestMessage('validation.selectYesOrNo');
      }
      break;

    // Study Flow Cases (50-57)
    case 50: // Study qualification
      const studyQualifications = ["12th Completed", "UG Completed", "PG Completed"];
      if (studyQualifications.includes(response)) {
        await updateUser(socketId, conversationId, { qualification: response, step: 51 });
        requestMessage('prompts.studyCountry');
        showOptions([
          { text: "🇺🇸 USA", value: "USA", className: "country-btn" },
          { text: "🇬🇧 UK", value: "UK", className: "country-btn" },
          { text: "🇨🇦 Canada", value: "Canada", className: "country-btn" },
          { text: "🇦🇺 Australia", value: "Australia", className: "country-btn" },
          { text: "🇩🇪 Germany", value: "Germany", className: "country-btn" },
          { text: "🌍 Other", value: "Other", className: "country-btn" }
        ]);
      } else {
        requestMessage('validation.selectQualification');
      }
      break;

    case 51: // Study country selection
      const countries = ["USA", "UK", "Canada", "Australia", "Germany", "Other"];
      if (countries.includes(response)) {
        await updateUser(socketId, conversationId, { studyCountry: response, step: 52 });
        requestMessage('prompts.studyLevel');
        showOptions([
          { text: "🎓 Bachelor's", value: "Bachelor's", className: "level-btn" },
          { text: "🎓 Master's", value: "Master's", className: "level-btn" },
          { text: "🎓 PhD", value: "PhD", className: "level-btn" },
          { text: "📜 Diploma", value: "Diploma", className: "level-btn" }
        ]);
      } else {
        requestMessage('validation.selectCountry');
      }
      break;

    case 52: // Study level selection
      const studyLevels = ["Bachelor's", "Master's", "PhD", "Diploma"];
      if (studyLevels.includes(response)) {
        await updateUser(socketId, conversationId, { studyLevel: response, step: 53 });
        requestMessage('prompts.studyField');
        showOptions([
          { text: "💻 Engineering", value: "Engineering", className: "field-btn" },
          { text: "💼 Business", value: "Business", className: "field-btn" },
          { text: "⚕️ Medicine", value: "Medicine", className: "field-btn" },
          { text: "🎨 Arts", value: "Arts", className: "field-btn" },
          { text: "🔬 Science", value: "Science", className: "field-btn" },
          { text: "🌍 Other", value: "Other", className: "field-btn" }
        ]);
      } else {
        requestMessage('validation.selectStudyLevel');
      }
      break;

    case 53: // Study field selection
      const studyFields = ["Engineering", "Business", "Medicine", "Arts", "Science", "Other"];
      if (studyFields.includes(response)) {
        await updateUser(socketId, conversationId, { studyField: response, step: 54 });
        requestMessage('prompts.studyBudget');
        showOptions([
          { text: "💰 $10,000 - $20,000", value: "$10,000 - $20,000", className: "budget-btn" },
          { text: "💰 $20,000 - $40,000", value: "$20,000 - $40,000", className: "budget-btn" },
          { text: "💰 $40,000 - $60,000", value: "$40,000 - $60,000", className: "budget-btn" },
          { text: "💰 $60,000+", value: "$60,000+", className: "budget-btn" }
        ]);
      } else {
        requestMessage('validation.selectStudyField');
      }
      break;

    case 54: // Study budget selection
      const budgets = ["$10,000 - $20,000", "$20,000 - $40,000", "$40,000 - $60,000", "$60,000+"];
      if (budgets.includes(response)) {
        await updateUser(socketId, conversationId, { studyBudget: response, step: 55 });
        requestMessage('prompts.studyStartTime');
        showOptions([
          { text: "📅 Next Semester", value: "Next Semester", className: "start-btn" },
          { text: "📅 Fall 2025", value: "Fall 2025", className: "start-btn" },
          { text: "📅 Spring 2026", value: "Spring 2026", className: "start-btn" },
          { text: "📅 Fall 2026", value: "Fall 2026", className: "start-btn" }
        ]);
      } else {
        requestMessage('validation.selectBudget');
      }
      break;

    case 55: // Study start time selection
      const startTimes2 = ["Next Semester", "Fall 2025", "Spring 2026", "Fall 2026"];
      if (startTimes2.includes(response)) {
        await updateUser(socketId, conversationId, { studyStartTime: response, step: 56 });
        requestMessage('prompts.studyDuration');
        showOptions([
          { text: "⏰ 1 year", value: "1 year", className: "duration-btn" },
          { text: "⏰ 2 years", value: "2 years", className: "duration-btn" },
          { text: "⏰ 3-4 years", value: "3-4 years", className: "duration-btn" },
          { text: "⏰ 5+ years", value: "5+ years", className: "duration-btn" }
        ]);
      } else {
        requestMessage('validation.selectStartTime');
      }
      break;

    case 56: // Study duration selection - Send email
      const durations = ["1 year", "2 years", "3-4 years", "5+ years"];
      if (durations.includes(response)) {
        await updateUser(socketId, conversationId, { studyDuration: response, step: 57 });
        
        const emailData = {
          name: user.name,
          age: user.age,
          email: user.email,
          purpose: user.purpose,
          qualification: user.qualification,
          studyCountry: user.study_country,
          studyLevel: user.study_level,
          studyField: user.study_field,
          studyBudget: user.study_budget,
          studyStartTime: user.study_start_time,
          studyDuration: response
        };
        
        const emailSent = await sendChatbotEmail(emailData, 'study');
        await updateUser(socketId, conversationId, { studyEmailSent: emailSent });
        
        if (emailSent) {
          requestMessage('success.studyEmailSent');
        } else {
          requestMessage('errors.emailFailed');
        }
        
        setTimeout(async () => {
          requestMessage('prompts.studyProgramContinue');
          showOptions([
            { text: "✅ Yes", value: "Yes", className: "yes-btn" },
            { text: "❌ No", value: "No", className: "no-btn" }
          ]);
        }, 1500);
      } else {
        requestMessage('validation.selectDuration');
      }
      break;

    case 57: // Study program continue
      if (response === 'Yes' || response === 'No') {
        await updateUser(socketId, conversationId, { studyProgramContinue: response });
        
        if (response === 'Yes') {
          requestMessage('success.studyProceed');
        } else {
          requestMessage('responses.noStudyProgram');
        }
      } else {
        requestMessage('validation.selectYesOrNo');
      }
      break;

    default:
      requestMessage('responses.defaultResponse');
  }
};

// Socket.IO Event Handlers
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

// EXISTING ROUTES (unchanged)
app.post('/submit-form', (req, res) => {
  const formData = req.body;
  console.log('Received study form data:', formData);

  const query = `
    INSERT INTO study (
      country, qualification, age, education_topic, cgpa, budget,
      needs_loan, name, email, phone
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;

  const values = [
    formData.selectedCountry,
    formData.selectedQualification,
    formData.selectedAge,
    formData.selectedEducationTopic,
    formData.currentCgpa,
    formData.selectedBudget,
    formData.needsLoan,
    formData.name,
    formData.email,
    formData.phone
  ];

  pool.query(query, values, (err, result) => {
    if (err) {
      console.error('Error inserting study data:', err);
      return res.status(500).json({
        success: false,
        message: 'Database error',
        error: err.message
      });
    }

    console.log('Study data inserted successfully:', result.rows[0]);

    const emailSubject = 'Study Abroad Inquiry';
    const emailBody = `
      <p>For Study: This person wants to study abroad. Their details are:</p>
      ${formatAsTable(formData)}
    `;
    sendEmail(emailSubject, emailBody);

    res.status(200).json({
      success: true,
      message: 'Form submitted successfully',
      data: result.rows[0]
    });
  });
});

app.post('/submit-work-form', (req, res) => {
  const formData = req.body;
  console.log('Received work profile data:', formData);

  const query = `
    INSERT INTO work_profiles (
      occupation, education, experience, name, email, phone
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;

  const values = [
    formData.occupation,
    formData.education,
    formData.experience,
    formData.name,
    formData.email,
    formData.phone
  ];

  pool.query(query, values, (err, result) => {
    if (err) {
      console.error('Error inserting work data:', err);
      return res.status(500).json({
        success: false,
        message: 'Database error',
        error: err.message
      });
    }

    console.log('Work profile data inserted successfully:', result.rows[0]);

    const emailSubject = 'Work Abroad Inquiry';
    const emailBody = `
      <p>For Work: This person wants to work abroad. Their details are:</p>
      ${formatAsTable(formData)}
    `;
    sendEmail(emailSubject, emailBody);

    res.status(200).json({
      success: true,
      message: 'Work profile saved successfully',
      data: result.rows[0]
    });
  });
});

app.post('/submit-invest-form', (req, res) => {
  const { name, email, country } = req.body;

  const query = `
    INSERT INTO invest (name, email, country)
    VALUES ($1, $2, $3)
    RETURNING *
  `;

  pool.query(query, [name, email, country], (err, result) => {
    if (err) {
      console.error('Error inserting investment data:', err);
      return res.status(500).json({
        success: false,
        message: 'Database error',
        error: err.message
      });
    }

    console.log('Investment data inserted successfully:', result.rows[0]);

    const emailSubject = 'Investment Abroad Inquiry';
    const emailBody = `
      <p>For Investment: This person wants to invest abroad. Their details are:</p>
      ${formatAsTable({ name, email, country })}
    `;
    sendEmail(emailSubject, emailBody);

    res.status(200).json({
      success: true,
      message: 'Investment inquiry submitted successfully',
      data: result.rows[0]
    });
  });
});

// CHATBOT API ROUTES
app.get('/api/messages', (req, res) => {
  try {
    const messagesPath = path.join(__dirname, 'message.json');
    console.log('📁 Loading messages from:', messagesPath);
    
    if (!fs.existsSync(messagesPath)) {
      console.error('❌ message.json file not found at:', messagesPath);
      return res.status(404).json({ error: 'message.json file not found' });
    }
    
    const messagesData = fs.readFileSync(messagesPath, 'utf8');
    const messages = JSON.parse(messagesData);
    console.log('✅ Successfully loaded messages with keys:', Object.keys(messages));
    res.json(messages);
  } catch (error) {
    console.error('❌ Error loading messages:', error.message);
    res.status(500).json({ error: 'Failed to load messages', details: error.message });
  }
});

app.get('/api/messages/:messagePath', (req, res) => {
  try {
    const { messagePath } = req.params;
    const { replacements } = req.query;
    
    console.log('🔍 API Request - Path:', messagePath);
    console.log('🔍 API Request - Replacements:', replacements);
    
    const messagesFilePath = path.join(__dirname, 'message.json');
    
    if (!fs.existsSync(messagesFilePath)) {
      console.error('❌ message.json file not found at:', messagesFilePath);
      return res.status(404).json({ error: 'message.json file not found' });
    }
    
    const messagesData = fs.readFileSync(messagesFilePath, 'utf8');
    const messages = JSON.parse(messagesData);
    
    const keys = messagePath.split('.');
    let message = messages;
    
    console.log('🔍 Navigating path:', keys);
    
    for (const key of keys) {
      console.log(`🔍 Looking for key "${key}" in:`, Object.keys(message || {}));
      if (message && typeof message === 'object' && key in message) {
        message = message[key];
        console.log(`✅ Found "${key}":`, typeof message === 'string' ? message : `[${typeof message}]`);
      } else {
        console.error(`❌ Key "${key}" not found. Available keys:`, Object.keys(message || {}));
        return res.status(404).json({ 
          error: `Message not found: ${messagePath}`,
          availableKeys: Object.keys(message || {}),
          searchedKey: key
        });
      }
    }
    
    if (replacements && typeof message === 'string') {
      try {
        const replacementObj = JSON.parse(replacements);
        Object.entries(replacementObj).forEach(([key, value]) => {
          message = message.replace(new RegExp(`{${key}}`, 'g'), value);
        });
      } catch (parseError) {
        console.error('❌ Error parsing replacements:', parseError.message);
        return res.status(400).json({ error: 'Invalid replacements format' });
      }
    }
    
    console.log('✅ Returning message:', message);
    res.json({ path: messagePath, message, replacements });
  } catch (error) {
    console.error('❌ Error fetching message:', error.message);
    res.status(500).json({ error: 'Failed to fetch message', details: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    connections: io.engine.clientsCount
  });
});

server.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📝 Form submission endpoints available`);
  console.log(`💬 Chatbot functionality available`);  
  console.log(`📝 Messages API: http://localhost:${port}/api/messages`);
  console.log(`🎯 Specific message: http://localhost:${port}/api/messages/welcome.initial`);
  console.log(`💾 Database: PostgreSQL`);
  console.log(`🏠 Tables: study, work_profiles, invest, chatbot_users, chatbot_messages`);
  console.log(`📋 Complete flows: Work (5-19), UG (14-18), Study (50-57)`);
});
