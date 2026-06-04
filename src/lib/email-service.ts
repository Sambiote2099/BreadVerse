// lib/email-service.ts
import nodemailer from 'nodemailer';

export async function sendVerificationEmail(email: string, name: string, token: string): Promise<{ success: boolean; previewUrl?: string }> {
  try {
    // Create transporter based on environment
    let transporter;
    
    // For production OR if we have Gmail credentials in development
    if (process.env.NODE_ENV === 'production' || (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD)) {
      // Use Gmail SMTP
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, ''), // Remove spaces from app password
        },
      });
      
      console.log('📧 Using Gmail SMTP for:', email);
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
      
      console.log('🧪 Using Ethereal (test) SMTP for:', email);
    }
    
    // Create verification URL
    const baseUrl = process.env.NEXTAUTH_URL;
    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;
    console.log("📧 Sending email with token:", token);
console.log("📧 Token type in email:", typeof token);
console.log("📧 Verification URL being sent:", verificationUrl);
    // Email content
    const mailOptions = {
      from: `"BreadVerse" <${process.env.GMAIL_USER || 'noreply@breadverse.com'}>`,
      to: email,
      subject: 'Verify Your BreadVerse Account 🍞',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #c3a579; margin: 0;">Welcome to BreadVerse!</h1>
            <p style="color: #666; font-size: 16px;">The ultimate platform for bread enthusiasts</p>
          </div>
          
          <p>Hi <strong>${name}</strong>,</p>
          
          <p>Thank you for joining BreadVerse! To get started, please verify your email address by clicking the button below:</p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #c3a579; color: white; padding: 16px 32px; 
                      text-decoration: none; border-radius: 50px; font-weight: bold;
                      display: inline-block; font-size: 16px; border: none; cursor: pointer;">
              Verify Email Address
            </a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; word-break: break-all;">
            <code style="color: #666; font-size: 14px;">${verificationUrl}</code>
          </div>
          
          <p style="color: #ff6b6b; font-size: 14px;">
            ⚠️ <strong>Important:</strong> This verification link will expire in <strong>24 hours</strong>.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />
          
          <div style="background-color: #fff8e1; padding: 15px; border-radius: 5px; border-left: 4px solid #c3a579;">
            <p style="margin: 0; color: #5d4037; font-size: 14px;">
              <strong>Need help?</strong> If you didn't create this account or need assistance, 
              please contact our support team or simply ignore this email.
            </p>
          </div>
          
          <div style="margin-top: 40px; text-align: center; color: #999; font-size: 12px;">
            <p>© ${new Date().getFullYear()} BreadVerse. All rights reserved.</p>
            <p>This email was sent to ${email}</p>
          </div>
        </div>
      `,
      text: `
Welcome to BreadVerse!

Hi ${name},

Thank you for joining BreadVerse! To get started, please verify your email address by clicking the link below:

${verificationUrl}

Or copy and paste this link into your browser:
${verificationUrl}

⚠️ Important: This verification link will expire in 24 hours.

Need help? If you didn't create this account or need assistance, please contact our support team or simply ignore this email.

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
      console.log('📧 Email preview URL:', previewUrl);
    }
    
    return { 
      success: true, 
      previewUrl 
    };
    
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    return { success: false };
  }
}