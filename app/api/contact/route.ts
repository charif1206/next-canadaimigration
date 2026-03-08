import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.CONTACT_ADMIN_EMAIL || 'abedcharif027@gmail.com';

/**
 * POST /api/contact
 * Send a contact message from the public form to the admin email.
 *
 * Body:
 * {
 *   name: string
 *   senderEmail: string
 *   subject?: string
 *   message: string
 * }
 *
 * Public route — no authentication required.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, senderEmail, subject, message } = body as {
      name: string;
      senderEmail: string;
      subject?: string;
      message: string;
    };

    if (!name || !senderEmail || !message) {
      return NextResponse.json(
        { message: 'name, senderEmail and message are required' },
        { status: 400 },
      );
    }

    const emailSubject = subject || `Contact Form Submission from ${name}`;

    await sendEmail({
      to: ADMIN_EMAIL,
      replyTo: senderEmail,
      subject: emailSubject,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e0e0e0;border-radius:8px">
          <h2 style="color:#0A2540;border-bottom:2px solid #DC2626;padding-bottom:10px">
            📧 New Contact Form Submission
          </h2>
          <div style="margin:20px 0;padding:15px;background:#f8f9fa;border-radius:5px">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${senderEmail}">${senderEmail}</a></p>
            ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ''}
          </div>
          <div style="margin:20px 0">
            <h3 style="color:#0A2540">Message:</h3>
            <div style="padding:15px;background:#fff;border-left:4px solid #DC2626;border-radius:4px">
              <p style="white-space:pre-wrap;line-height:1.6;color:#333">${message}</p>
            </div>
          </div>
          <p style="color:#666;font-size:12px;margin-top:20px;border-top:1px solid #e0e0e0;padding-top:10px">
            Submitted on: ${new Date().toLocaleString()}
          </p>
        </div>`,
    });

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully! We will get back to you soon.',
    });
  } catch (error) {
    console.error('[POST /api/contact]', error);
    return NextResponse.json(
      { message: 'Failed to send message. Please try again later.' },
      { status: 500 },
    );
  }
}
