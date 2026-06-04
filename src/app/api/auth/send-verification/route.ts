// app/api/auth/send-verification/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { v4 as uuidv4 } from "uuid";
import clientPromise from "@/lib/mongodb";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { userId, email, name } = await req.json();
    
    if (!userId || !email || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("breadverse");
    
    // Generate verification token
    const verificationToken = uuidv4();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Store token in users collection (or separate collection)
    await db.collection("users").updateOne(
      { _id: userId },
      {
        $set: {
          verification_token: verificationToken,
          verification_expires: verificationExpires,
          updated_at: new Date()
        }
      }
    );
    
    // Create verification URL
    const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${verificationToken}`;
    
    // Send verification email
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'BreadVerse <onboarding@resend.dev>',
      to: email,
      subject: 'Verify your email for BreadVerse',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #c3a579;">Welcome to BreadVerse, ${name}! 🍞</h1>
          
          <p>Thank you for signing up! Please verify your email address to complete your registration.</p>
          
          <div style="margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #c3a579; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 50px; font-weight: bold;
                      display: inline-block;">
              Verify Email Address
            </a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666; font-size: 14px;">
            ${verificationUrl}
          </p>
          
          <p>This link will expire in 24 hours.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          
          <p style="color: #888; font-size: 12px;">
            If you didn't create an account with BreadVerse, you can safely ignore this email.
          </p>
        </div>
      `,
      text: `Welcome to BreadVerse, ${name}!\n\nPlease verify your email by clicking this link: ${verificationUrl}\n\nThis link expires in 24 hours.\n\nIf you didn't create an account, please ignore this email.`
    });
    
    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send verification email" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "Verification email sent",
      emailId: data?.id
    });
    
  } catch (error) {
    console.error("Send verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}