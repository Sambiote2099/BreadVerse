// lib/password-reset-email.ts
import nodemailer from 'nodemailer';

export async function sendPasswordResetEmail(email: string, name: string, resetToken: string): Promise<{ success: boolean; previewUrl?: string }> {
  try {
    // Create transporter based on environment
    let transporter;
    
    if (process.env.NODE_ENV === 'production' || (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD)) {
      // Use Gmail SMTP
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, ''),
        },
      });
    } else {
      // Development: Use Ethereal (fake SMTP service)
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }
    
    // Create reset URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
    
    // Email content
    const mailOptions = {
      from: `"BreadVerse" <${process.env.GMAIL_USER || 'noreply@breadverse.com'}>`,
      to: email,
      subject: 'Reset Your BreadVerse Password 🍞',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #c3a579; margin: 0;">Password Reset Request</h1>
            <p style="color: #666; font-size: 16px;">BreadVerse Account Security</p>
          </div>
          
          <p>Hi <strong>${name}</strong>,</p>
          
          <p>We received a request to reset your password for your BreadVerse account. If you didn't make this request, you can safely ignore this email.</p>
          
          <p>To reset your password, click the button below:</p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${resetUrl}" 
               style="background-color: #c3a579; color: white; padding: 16px 32px; 
                      text-decoration: none; border-radius: 50px; font-weight: bold;
                      display: inline-block; font-size: 16px; border: none; cursor: pointer;">
              Reset Password
            </a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; word-break: break-all;">
            <code style="color: #666; font-size: 14px;">${resetUrl}</code>
          </div>
          
          <p style="color: #ff6b6b; font-size: 14px;">
            ⚠️ <strong>Important:</strong> This reset link will expire in <strong>1 hour</strong>.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />
          
          <div style="background-color: #fff8e1; padding: 15px; border-radius: 5px; border-left: 4px solid #c3a579;">
            <p style="margin: 0; color: #5d4037; font-size: 14px;">
              <strong>Security Tip:</strong> Never share your password or this link with anyone. BreadVerse will never ask for your password.
            </p>
          </div>
          
          <div style="margin-top: 40px; text-align: center; color: #999; font-size: 12px;">
            <p>© ${new Date().getFullYear()} BreadVerse. All rights reserved.</p>
            <p>This email was sent to ${email}</p>
          </div>
        </div>
      `,
      text: `
Password Reset Request - BreadVerse

Hi ${name},

We received a request to reset your password for your BreadVerse account. If you didn't make this request, you can safely ignore this email.

To reset your password, click this link:
${resetUrl}

Or copy and paste this link into your browser:
${resetUrl}

⚠️ Important: This reset link will expire in 1 hour.

Security Tip: Never share your password or this link with anyone. BreadVerse will never ask for your password.

© ${new Date().getFullYear()} BreadVerse. All rights reserved.
This email was sent to ${email}
      `,
    };
    
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    
    // For development/testing, log the preview URL
    let previewUrl = null;
    if (process.env.NODE_ENV !== 'production' && !process.env.GMAIL_USER) {
      previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('📧 Password reset email preview URL:', previewUrl);
    }
    
    return { 
      success: true, 
      previewUrl 
    };
    
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    return { success: false };
  }
}