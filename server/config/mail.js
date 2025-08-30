import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const transporter = nodemailer.createTransport({
  service:'gmail',
  auth:{
    user:process.env.EMAIL_USER,
    pass:process.env.EMAIL_PASS
  }
});

transporter.verify(err=>{
  if(err) console.error('❌  Email config error:',err.message);
  else    console.log('✅  Email ready:',process.env.EMAIL_USER,'→',process.env.EMAIL_RECIVER);
});
