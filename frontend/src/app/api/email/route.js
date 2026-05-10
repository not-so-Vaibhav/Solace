
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req) {
  try {
    const { to, subject, html } = await req.json();

    // Create transporter
    // If SMTP env vars are missing, we log it and return success for dev purposes
    // In production, these should be set in .env.local
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('--- EMAIL SIMULATION (SMTP not configured) ---');
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('Body:', html.substring(0, 100) + '...');
      console.log('--------------------------------------------');
      return NextResponse.json({ success: true, message: 'Email simulated in development' });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"Solace Support" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Email Send Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
