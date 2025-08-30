import { Router } from 'express';
import { sendEmail, formatAsTable } from '../services/emailService.js';
const r = Router();

/* ✅ Fixed: Remove /api from route path since it's added during mounting */
r.post('/send-email', (req, res) => {
  const { formData } = req.body || {};

  if (!formData) {
    return res.status(400).json({ success: false, message: 'Missing formData' });
  }

  const html = `
    <h2>💼 New Website Enquiry</h2>
    ${formatAsTable(formData)}
  `;

  try {
    sendEmail(`Website enquiry – ${formData.name || 'unknown'}`, html);
    console.log('✅ Email sent for:', formData.name || 'unknown');
    return res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to send email'
    });
  }
});

/* …existing study / work / invest routes stay below … */

export default r;
