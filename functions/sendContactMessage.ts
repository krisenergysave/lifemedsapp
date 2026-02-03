import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { name, email, subject, message } = await req.json();

    // Validate required fields
    if (!name || !email || !message) {
      return Response.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Send email using SendEmail integration
    await base44.asServiceRole.integrations.Core.SendEmail({
      from_name: 'Life-Meds Support',
      to: 'lifemedsworld@gmail.com',
      subject: `${subject || 'New Message'} - from ${name}`,
      body: `
New Contact Form Message from Life-Meds

From: ${name}
Reply To Email: ${email}
Subject: ${subject || 'General Inquiry'}

Message:
${message}

---
This message was sent via the Life-Meds contact form.
IMPORTANT: Reply directly to ${email}
      `.trim()
    });

    return Response.json({
      success: true,
      message: 'Your message has been sent successfully!'
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return Response.json(
      { error: error.message || 'Failed to send message' },
      { status: 500 }
    );
  }
});