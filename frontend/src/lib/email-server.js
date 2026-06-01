import nodemailer from 'nodemailer';

/**
 * Send an email directly from server-side code using nodemailer.
 * If SMTP keys are missing, it will gracefully log a simulation.
 */
export async function sendEmailServer({ to, subject, html }) {
  try {
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpUser || !smtpPass) {
      console.log('--- EMAIL SIMULATION (SMTP not configured) ---');
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('Body:', html.substring(0, 150) + '...');
      console.log('--------------------------------------------');
      return { success: true, message: 'Email simulated in development' };
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const mailOptions = {
      from: `"Solace Support" <${smtpUser}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully via SMTP:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('SMTP direct send failed:', error);
    return { success: false, error: error.message };
  }
}
