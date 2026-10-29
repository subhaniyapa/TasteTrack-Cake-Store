import nodemailer from 'nodemailer';

let transporter; 
async function getTransporter() {
  if (transporter !== undefined) return transporter;
  if (process.env.SMTP_HOST) {
    const port = Number(process.env.SMTP_PORT || 587);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
  } else if (process.env.MAIL_PREVIEW === 'true') {
    
    const acc = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({ host: 'smtp.ethereal.email', port: 587, auth: { user: acc.user, pass: acc.pass } });
  } else {
    transporter = null;
  }
  return transporter;
}


export async function sendMail({ to, subject, html, text }) {
  try {
    const t = await getTransporter();
    if (!t || !to) {
      console.log(`[email not sent] to=${to || '(none)'} subject="${subject}"`);
      if (text) console.log(text);
      return;
    }
    const info = await t.sendMail({ from: process.env.MAIL_FROM || 'TastTrack <no-reply@tasttrack.lk>', to, subject, html, text });
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.log('Email preview:', preview);
  } catch (e) {
    console.error('Email failed:', e.message);
  }
}
