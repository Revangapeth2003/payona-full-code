import { transporter } from '../config/mail.js';

export const formatAsTable = obj => `
  <table border="1" cellpadding="8" cellspacing="0"
         style="border-collapse:collapse;max-width:600px;width:100%">
    ${Object.entries(obj).map(
      ([k,v])=>`<tr><th align="left" style="background:#f0f0f0">${k}</th><td>${v}</td></tr>`
    ).join('')}
  </table>`;

export const sendEmail = (subject,html)=>
  transporter.sendMail(
    { from:process.env.EMAIL_USER,to:process.env.EMAIL_RECIVER,subject,html },
    err=> err
      ? console.error('❌  sendEmail:',err.message)
      : console.log('✅  Email sent')
);

export async function sendChatbotEmail(emailData,type){
  try{
    let subject='',html='';
    switch(type){
      case 'german':
        subject = `🇩🇪 New German Program Inquiry - ${emailData.name}`;
        html = /* -- same HTML block you had for german -- */ `
          <h2>🇩🇪 New German Program Application</h2>
          ${formatAsTable(emailData)}
        `;
        break;
      case 'ug':
        subject = `🎓 New UG Program Inquiry - ${emailData.name}`;
        html = `
          <h2>🎓 New UG Program Application</h2>
          ${formatAsTable(emailData)}
        `;
        break;
      case 'study':
        subject = `📚 New Study Program Inquiry - ${emailData.name}`;
        html = `
          <h2>📚 New Study Program Application</h2>
          ${formatAsTable(emailData)}
        `;
        break;
      default:
        throw new Error('Unknown email type');
    }
    await transporter.sendMail({
      from:process.env.EMAIL_USER,
      to  :process.env.EMAIL_RECIVER,
      cc  :emailData.email,
      subject, html
    });
    console.log(`✅  ${type} chatbot email sent`);
    return true;
  }catch(err){
    console.error(`❌  ${type} chatbot email error:`,err.message);
    return false;
  }
}
