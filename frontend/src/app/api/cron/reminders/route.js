import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

export async function GET(request) {
  const logs = [];

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing SUPABASE env vars' 
      }, { status: 500 });
    }

    const adminSupabase = createClient(supabaseUrl, serviceKey);

    const now = new Date();
    // Look for sessions in the next 60 minutes that haven't had a reminder sent yet
    const sixtyMinsFromNow = new Date(now.getTime() + 60 * 60000);

    logs.push(`Now (UTC): ${now.toISOString()}`);
    logs.push(`Looking for sessions before: ${sixtyMinsFromNow.toISOString()}`);

    const { data: sessions, error } = await adminSupabase
      .from('sessions')
      .select('*, student:student_id(email, full_name), listener:listener_id(full_name)')
      .eq('status', 'assigned')
      .eq('reminder_sent', false)
      .gte('scheduled_at', now.toISOString())      // session is in the future
      .lte('scheduled_at', sixtyMinsFromNow.toISOString()); // within next 60 mins

    if (error) throw error;

    logs.push(`Sessions found: ${sessions?.length ?? 0}`);

    if (!sessions || sessions.length === 0) {
      return NextResponse.json({ success: true, processed: 0, logs });
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      logs.push('SMTP not configured — simulating emails');
      sessions.forEach(s => logs.push(`Would email: ${s.student?.email} for session ${s.id}`));
      return NextResponse.json({ success: true, processed: sessions.length, logs });
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

    const results = await Promise.allSettled(
      sessions.map(async (session) => {
        const studentEmail = session.student?.email;
        const jitsiLink = `https://meet.jit.si/Solace-Session-${session.id}`;
        const sessionTime = new Date(session.scheduled_at).toLocaleTimeString('en-IN', { 
          hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' 
        });

        if (!studentEmail) {
          logs.push(`Session ${session.id}: no student email found`);
          return;
        }

        await transporter.sendMail({
          from: `"Solace Support" <${process.env.SMTP_USER}>`,
          to: studentEmail,
          subject: `⏰ Reminder: Your Solace session starts at ${sessionTime} IST`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #517C71; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 22px;">Your Session is Coming Up!</h1>
              </div>
              <div style="background: #f9fafb; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
                <p style="font-size: 16px;">Hi <strong>${session.student?.full_name || 'there'}</strong>,</p>
                <p>This is a reminder that your session with <strong>${session.listener?.full_name || 'your listener'}</strong> is scheduled for today at <strong>${sessionTime} IST</strong>.</p>
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${jitsiLink}" style="background: #517C71; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
                    Join Session →
                  </a>
                </div>
                <p style="color: #6b7280; font-size: 13px;">The join button will become active once your listener starts the session. If the listener hasn't started within 10 minutes of the scheduled time, please contact support.</p>
                <p>Take care,<br/><strong>The Solace Team</strong></p>
              </div>
            </div>
          `
        });

        // Mark reminder as sent so we don't email again
        await adminSupabase
          .from('sessions')
          .update({ reminder_sent: true })
          .eq('id', session.id);

        logs.push(`✅ Email sent to: ${studentEmail} for session at ${sessionTime}`);
      })
    );

    const failed = results.filter(r => r.status === 'rejected');
    if (failed.length > 0) {
      logs.push(`❌ Failed: ${failed.map(f => f.reason?.message).join(', ')}`);
    }

    return NextResponse.json({ success: true, processed: sessions.length, logs });

  } catch (err) {
    console.error('Cron Error:', err);
    return NextResponse.json({ success: false, error: err.message, logs }, { status: 500 });
  }
}
