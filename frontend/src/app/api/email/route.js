import { NextResponse } from 'next/server';
import { sendEmailServer } from '@/lib/email-server';

export async function POST(req) {
  try {
    const { to, subject, html } = await req.json();
    const result = await sendEmailServer({ to, subject, html });

    if (!result.success) {
      throw new Error(result.error);
    }

    return NextResponse.json({ success: true, messageId: result.messageId });
  } catch (error) {
    console.error('Email Route Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
