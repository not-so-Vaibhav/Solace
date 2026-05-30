import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import nodemailer from 'nodemailer';

export async function GET(request) {
  try {
    // 10 minutes from now
    const now = new Date();
    // We look for sessions starting between 5 and 15 mins from now to account for cron execution delays
    const fiveMinsFromNow = new Date(now.getTime() + 5 * 60000);
    const fifteenMinsFromNow = new Date(now.getTime() + 15 * 60000);

    // Fetch sessions assigned but not yet started that are starting between 5 and 15 mins from now
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('*, student:student_id(email, full_name), listener:listener_id(full_name)')
      .eq('status', 'assigned')
      .gte('scheduled_at', fiveMinsFromNow.toISOString())
      .lte('scheduled_at', fifteenMinsFromNow.toISOString());

    if (error) {
      throw error;
    }

    // Set up nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const emailPromises = sessions.map(async (session) => {
      const studentEmail = session.student?.email;
      const jitsiLink = `https://meet.jit.si/Solace-Session-${session.id}`;

      if (studentEmail && process.env.SMTP_USER) {
        const mailOptions = {
          from: `"Solace Support" <${process.env.SMTP_USER}>`,
          to: studentEmail,
          subject: 'Your Solace Session is starting in 10 minutes',
          html: `
            <h2>Your session is starting soon!</h2>
            <p>Hi ${session.student?.full_name || 'there'},</p>
            <p>Your session with ${session.listener?.full_name || 'your listener'} is starting in 10 minutes.</p>
            <p>Please use the following secure link to join the session:</p>
            <p><a href="${jitsiLink}" style="padding: 12px 24px; background: #517C71; color: white; text-decoration: none; border-radius: 8px;">Join Session</a></p>
            <p>If the listener hasn't started the session yet when you join, please wait a few moments.</p>
            <br/>
            <p>Thanks,<br/>The Solace Team</p>
          `
        };
        return transporter.sendMail(mailOptions);
      } else {
        console.log('--- EMAIL SIMULATION (CRON) ---');
        console.log('To:', studentEmail);
        console.log('Link:', jitsiLink);
      }
    });

    await Promise.all(emailPromises);

    return NextResponse.json({ success: true, processed: sessions.length });
  } catch (err) {
    console.error('Cron Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
