import { Router } from 'express';
import { sendEmail, formatAsTable } from '../services/emailService.js';

const router = Router();

/* 🛂 Visa Application endpoint - ✅ FIXED: Removed /api prefix */
router.post('/visa-application', async (req, res) => {
  console.log('📧 Visa application endpoint hit');
  console.log('Request body:', req.body);
  
  try {
    const { formData } = req.body || {};

    if (!formData) {
      console.log('❌ Missing formData');
      return res.status(400).json({ 
        success: false, 
        message: 'Missing visa application data' 
      });
    }

    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'destination', 'visaType'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      console.log('❌ Missing required fields:', missingFields);
      return res.status(400).json({ 
        success: false, 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    console.log('📝 Processing visa application for:', formData.name);

    // Create email content
    const html = `
      <h2>🛂 New Visa Application</h2>
      ${formatAsTable(formData)}
      <hr>
      <p><small>Submitted on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</small></p>
    `;

    // Send email
    console.log('📨 Sending email...');
    await sendEmail(
      `Visa Application – ${formData.destination} (${formData.name})`, 
      html
    );
    
    console.log('✅ Visa application email sent successfully');
    
    return res.json({ 
      success: true, 
      message: 'Visa application submitted successfully' 
    });

  } catch (error) {
    console.error('💥 Error in visa application endpoint:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to submit visa application',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/* ❌ REMOVE THIS: Duplicate /send-email route - already exists in forms.routes.js */
/* 
router.post('/send-email', async (req, res) => {
  // This conflicts with forms.routes.js - remove it
});
*/

export default router;
