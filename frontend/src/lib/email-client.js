
/**
 * Utility to send emails via the internal /api/email route
 */
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const response = await fetch('/api/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to, subject, html }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to send email');
    return data;
  } catch (error) {
    console.error('sendEmail Helper Error:', error);
    // We don't want to crash the main app if email fails
    return { success: false, error: error.message };
  }
};
