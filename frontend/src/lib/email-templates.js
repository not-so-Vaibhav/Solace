
export const getBookingConfirmationTemplate = (userName, sessionDate, sessionTime, amount) => `
  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
    <div style="background: #517C71; padding: 32px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Booking Confirmed!</h1>
    </div>
    <div style="padding: 32px; color: #1e293b; line-height: 1.6;">
      <p>Hi ${userName},</p>
      <p>Your session on <strong>Solace</strong> has been successfully booked. We're here to support you.</p>
      
      <div style="background: #f8fafc; padding: 24px; border-radius: 8px; margin: 24px 0;">
        <h2 style="margin-top: 0; font-size: 18px; color: #517C71;">Session Details</h2>
        <p style="margin: 8px 0;"><strong>Date:</strong> ${sessionDate}</p>
        <p style="margin: 8px 0;"><strong>Time:</strong> ${sessionTime}</p>
        <p style="margin: 8px 0;"><strong>Amount Paid:</strong> ₹${amount}</p>
      </div>

      <p>An admin will assign a listener shortly. You'll receive another email once your listener is ready.</p>
      
      <a href="https://solace-wellness.vercel.app/dashboard" style="display: inline-block; background: #517C71; color: white; padding: 12px 24px; border-radius: 50px; text-decoration: none; font-weight: 600; margin-top: 24px;">Go to Dashboard</a>
      
      <hr style="margin: 32px 0; border: 0; border-top: 1px solid #e2e8f0;" />
      <p style="font-size: 12px; color: #64748b; text-align: center;">
        Solace • Peer Emotional Support for Students<br/>
        You received this email because you booked a session on Solace.
      </p>
    </div>
  </div>
`;

export const getPaymentReceiptTemplate = (userName, amount, transactionId) => `
  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 12px;">
    <h1 style="color: #1e293b; font-size: 22px;">Payment Receipt</h1>
    <p>Hi ${userName}, thank you for your payment.</p>
    
    <table style="width: 100%; margin: 24px 0; border-collapse: collapse;">
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 0; color: #64748b;">Transaction ID</td>
        <td style="padding: 12px 0; text-align: right; font-family: monospace;">${transactionId}</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 0; color: #64748b;">Date</td>
        <td style="padding: 12px 0; text-align: right;">${new Date().toLocaleDateString()}</td>
      </tr>
      <tr>
        <td style="padding: 12px 0; font-weight: 700;">Total Amount</td>
        <td style="padding: 12px 0; text-align: right; font-weight: 700; color: #517C71;">₹${amount}</td>
      </tr>
    </table>
    
    <p style="font-size: 14px; color: #64748b;">If you have any questions, please contact us at support@solace.com</p>
  </div>
`;

export const getSessionReminderTemplate = (userName, sessionTime) => `
  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
    <div style="background: #3b82f6; padding: 32px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Upcoming Session Reminder</h1>
    </div>
    <div style="padding: 32px; color: #1e293b; line-height: 1.6;">
      <p>Hi ${userName},</p>
      <p>This is a friendly reminder that your session is starting in <strong>30 minutes</strong> at ${sessionTime}.</p>
      <p>Please make sure you're in a quiet, comfortable space.</p>
      <a href="https://solace-wellness.vercel.app/dashboard" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 50px; text-decoration: none; font-weight: 600; margin-top: 24px;">Join Session</a>
    </div>
  </div>
`;

export const getCancellationTemplate = (userName, sessionDate) => `
  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #fee2e2; border-radius: 12px; background: #fffcfc;">
    <h1 style="color: #dc2626; font-size: 22px;">Session Cancelled</h1>
    <p>Hi ${userName},</p>
    <p>Your session scheduled for <strong>${sessionDate}</strong> has been cancelled.</p>
    <p>If this was unexpected, please reach out to our support team. Any payments made will be refunded to your original payment method within 5-7 business days.</p>
    <p>We're sorry for any inconvenience.</p>
  </div>
`;

export const getListenerAssignedTemplate = (userName, listenerName, sessionDate, sessionTime) => `
  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
    <div style="background: #4A7C6F; padding: 32px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Listener Assigned!</h1>
    </div>
    <div style="padding: 32px; color: #1e293b; line-height: 1.6;">
      <p>Hi ${userName},</p>
      <p>We've assigned a listener to your session. You'll be talking with <strong>${listenerName}</strong>.</p>
      
      <div style="background: #f8fafc; padding: 24px; border-radius: 8px; margin: 24px 0;">
        <h2 style="margin-top: 0; font-size: 18px; color: #4A7C6F;">Final Session Details</h2>
        <p style="margin: 8px 0;"><strong>Listener:</strong> ${listenerName}</p>
        <p style="margin: 8px 0;"><strong>Date:</strong> ${sessionDate}</p>
        <p style="margin: 8px 0;"><strong>Time:</strong> ${sessionTime}</p>
      </div>

      <p>You can join the session from your dashboard at the scheduled time. Your listener is looking forward to connecting with you.</p>
      
      <a href="https://solace-wellness.vercel.app/dashboard" style="display: inline-block; background: #4A7C6F; color: white; padding: 12px 24px; border-radius: 50px; text-decoration: none; font-weight: 600; margin-top: 24px;">View in Dashboard</a>
    </div>
  </div>
`;
