import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { sendEmailServer } from '@/lib/email-server';
import { getRefundProcessedTemplate } from '@/lib/email-templates';

// Initialize Supabase Admin with service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-webhook-signature');
    const timestamp = request.headers.get('x-webhook-timestamp');
    const secretKey = process.env.CASHFREE_SECRET_KEY;

    console.log('📬 Cashfree Webhook Received. Timestamp:', timestamp);

    // 1. Signature Verification (Only if signature headers and secret key are present)
    if (signature && timestamp && secretKey) {
      const payload = timestamp + rawBody;
      const expectedSignature = crypto
        .createHmac('sha256', secretKey)
        .update(payload)
        .digest('base64');

      if (signature !== expectedSignature) {
        console.error('❌ Cashfree Webhook: Signature verification failed.');
        return NextResponse.json({ error: 'Invalid Signature' }, { status: 400 });
      }
      console.log('✅ Cashfree Webhook: Signature verified successfully.');
    } else {
      console.warn('⚠️ Cashfree Webhook: Missing signature, timestamp, or secret key. Processing without signature check.');
    }

    const bodyJson = JSON.parse(rawBody);
    console.log('Webhook Payload:', JSON.stringify(bodyJson, null, 2));

    const event = bodyJson.event;
    const refundData = bodyJson.data?.refund || bodyJson.refund || {};
    const orderId = refundData.order_id || bodyJson.data?.order?.order_id;
    const refundStatus = refundData.refund_status || bodyJson.refund_status || refundData.status;
    const refundAmount = refundData.refund_amount || bodyJson.refund_amount;

    if (event === 'REFUND_STATUS' && refundStatus === 'SUCCESS') {
      if (!orderId) {
        console.error('❌ Cashfree Webhook: Missing order_id in refund payload.');
        return NextResponse.json({ error: 'Missing order_id' }, { status: 400 });
      }

      console.log(`🔄 Processing refund success for Order ID: ${orderId}, Amount: ${refundAmount}`);

      // 2. Update payment status to 'refunded' in the payments table
      const { data: payment, error: paymentError } = await supabaseAdmin
        .from('payments')
        .update({ status: 'refunded' })
        .eq('provider_payment_id', orderId)
        .select()
        .single();

      if (paymentError || !payment) {
        console.error('❌ Cashfree Webhook: Failed to update payment status in Supabase:', paymentError);
        return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
      }

      console.log('✅ Supabase: Payment status updated to refunded.');

      // 3. Update associated session status to 'cancelled' in the sessions table
      if (payment.session_id) {
        const { error: sessionError } = await supabaseAdmin
          .from('sessions')
          .update({ status: 'cancelled' })
          .eq('id', payment.session_id);
        
        if (sessionError) {
          console.error('❌ Cashfree Webhook: Failed to update session status to cancelled:', sessionError);
        } else {
          console.log(`✅ Supabase: Session ${payment.session_id} updated to cancelled.`);
        }
      }

      // 4. Fetch User info to send the refund email
      const { data: userProfile, error: userError } = await supabaseAdmin
        .from('users')
        .select('email, full_name')
        .eq('id', payment.user_id)
        .single();

      if (userError || !userProfile) {
        console.error('❌ Cashfree Webhook: User not found for email notification:', userError);
      } else {
        // Send refund email using the direct server helper
        try {
          const emailHtml = getRefundProcessedTemplate(
            userProfile.full_name || 'Student',
            refundAmount || payment.amount || 0,
            orderId
          );
          
          await sendEmailServer({
            to: userProfile.email,
            subject: 'Refund Processed - Solace',
            html: emailHtml
          });
          console.log(`✉️ Refund email sent to: ${userProfile.email}`);
        } catch (emailSendError) {
          console.error('❌ Cashfree Webhook: Error sending refund email:', emailSendError);
        }
      }
    } else {
      console.log(`ℹ️ Ignoring non-refund success event: ${event} with status: ${refundStatus}`);
    }

    // Always acknowledge receipt of the webhook to Cashfree with 200 OK
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Cashfree Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
