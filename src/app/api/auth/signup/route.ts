// app/api/auth/signup/route.ts - UPDATED
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { sendVerificationEmail } from "@/lib/email-service";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    
    console.log("📝 Signup attempt:", { name, email });

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("breadverse");

    // Check if user already exists
    const existingUser = await db
      .collection("users")
      .findOne({ email: email.toLowerCase().trim() });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Generate verification token
    const verificationToken = uuidv4().trim();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
const cleanToken = verificationToken.replace(/[\x00-\x1F\x7F]/g, '').trim();
    // Create new user
    const newUser = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      img: "",
      user_type: "user",
      phone: "",
      dob: "",
      address: "",
      about: "",
      created_at: new Date(),
      updated_at: new Date(),
      profile_picture: "",
      email_verified: false,
      verification_token: cleanToken,
      verification_expires: verificationExpires,
      auth_provider: "credentials"
    };
console.log("📝 Token to store:", verificationToken);
console.log("📝 Token type:", typeof verificationToken);
console.log("📝 Token to store:", verificationToken);
console.log("📝 Token string:", JSON.stringify(verificationToken));
console.log("📝 Token trimmed:", verificationToken.trim());
console.log("📝 Token char codes:");
for (let i = 0; i < verificationToken.length; i++) {
  console.log(`  ${i}: '${verificationToken[i]}' = ${verificationToken.charCodeAt(i)}`);
}
    // Insert into database
    const result = await db.collection("users").insertOne(newUser);
    
    console.log("✅ User created with ID:", result.insertedId);
    
    // Send verification email (don't await - send in background)
    sendVerificationEmail(email, name, verificationToken)
      .then((emailResult) => {
        if (emailResult.success) {
          console.log("📧 Verification email sent successfully");
          if (emailResult.previewUrl) {
            console.log("🔗 Preview URL:", emailResult.previewUrl);
          }
        } else {
          console.error("❌ Failed to send verification email");
        }
      })
      .catch((emailError) => {
        console.error("❌ Error sending verification email:", emailError);
      });

    // Remove sensitive data from response
    const { password: _, verification_token: __, verification_expires: ___, ...userWithoutSensitive } = newUser;

    return NextResponse.json({
      success: true,
      message: "Account created successfully! Please check your email to verify your account.",
      user: {
        ...userWithoutSensitive,
        _id: result.insertedId.toString()
      },
      requiresVerification: true
    }, { status: 201 });

  } catch (error) {
    console.error("❌ Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}