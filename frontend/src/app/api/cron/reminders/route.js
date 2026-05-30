import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

export async function GET(request) {
  const logs = [];

  try {
    // Use service role key to bypass RLS — critical for server-side reads
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars' 
      }, { status: 500 });
    }

    const adminSupabase = createClient(supabaseUrl, serviceKey);

    const now = new Date();
    // Wide window: sessions starting between 5 and 15 mins from now
    const fiveMinsFromNow = new Date(now.getTime() + 5 * 60000);
    const fifteenMinsFromNow = new Date(now.getTime() + 15 * 60000);
    
    logs.push(`Now: ${now.toISOString()}`);
    logs.push(`Window: ${fiveMinsFromNow.toISOString()} → ${fifteenMinsFromNow.toISOString()}`);

    const { data: sessions, error } = await adminSupabase
      .from('sessions')
      .select('*, student:student_id(email, full_name), listener:listener_id(full_name)')
      .eq('status', 'assigned')
      .gte('scheduled_at', fiveMinsFromNow.toISOString())
      .lte('scheduled_at', fifteenMinsFromNow.toISOString());

    if (error) throw error;

    logs.push(`Sessions found: ${sessions?.length ?? 0}`);

    if (!sessions || sessions.length === 0) {
      return NextResponse.json({ success: true, processed: 0, logs });
    }

    // SMTP check
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

        if (!studentEmail) {
          logs.push(`Session ${session.id}: no student email found`);
          return;
        }

        await transporter.sendMail({
          from: `"Solace Support" <${process.env.SMTP_USER}>`,
          to: studentEmail,
          subject: 'Your Solace Session is starting in 10 minutes ⏰',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #517C71; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0;">Session Starting Soon!</h1>
              </div>
              <div style="background: #f9f9f9; padding: 32px; border-radius: 0 0 12px 12px;">
                <p>Hi <strong>${session.student?.full_name || 'there'}</strong>,</p>
                <p>Your session with <strong>${session.listener?.full_name || 'your listener'}</strong> starts in <strong>10 minutes</strong>.</p>
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${jitsiLink}" style="background: #517C71; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                    Join Session Now →
                  </a>
                </div>
                <p style="color: #888; font-size: 13px;">If the listener hasn't started the session yet, please wait a few moments and try again.</p>
                <p>Thanks,<br/>The Solace Team</p>
              </div>
            </div>
          `
        });
        logs.push(`Email sent to: ${studentEmail}`);
      })
    );

    const failed = results.filter(r => r.status === 'rejected');
    if (failed.length > 0) {
      logs.push(`Failed emails: ${failed.map(f => f.reason?.message).join(', ')}`);
    }

    return NextResponse.json({ success: true, processed: sessions.length, logs });

  } catch (err) {
    console.error('Cron Error:', err);
    return NextResponse.json({ success: false, error: err.message, logs }, { status: 500 });
  }
}
