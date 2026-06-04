
import NextAuth, { NextAuthOptions } from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
  if (!credentials?.email || !credentials?.password) {
    throw new Error("Email and password are required");
  }

  const client = await clientPromise;
  const db = client.db("breadverse");
  
  const user = await db.collection("users").findOne({
    email: credentials.email.toLowerCase().trim()
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  // Check if email is verified (only for credential users)
  if (user.auth_provider === "credentials" && !user.email_verified) {
    // Check if verification token is expired
    if (user.verification_expires && new Date(user.verification_expires) < new Date()) {
      throw new Error("Verification link expired. Please request a new verification email.");
    }
    throw new Error("Please verify your email before logging in. Check your inbox (and spam folder).");
  }

  // Check if this is an OAuth-only account
  if (user.auth_provider && user.auth_provider !== "credentials" && !user.password) {
    throw new Error(`This account uses ${user.auth_provider} login. Please sign in with ${user.auth_provider}.`);
  }

  if (!user.password) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(credentials.password, user.password);
  
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  // Return user with role from user_type field
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.user_type || "user",
    image: user.profile_picture || ""
  };
}
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      console.log("🔐 JWT Callback - User:", user);
      
      if (user) {
        token.id = user.id;
        token.email = user.email ?? undefined; // Convert null/undefined to undefined
    token.name = user.name ?? undefined; // Convert null/undefined to undefined
        
        console.log("🔄 Initial sign-in, fetching role from DB...");
        try {
          const client = await clientPromise;
          const db = client.db("breadverse");
          
          const dbUser = await db.collection("users").findOne({
            email: token.email?.toLowerCase()
          });
          
          if (dbUser) {
            console.log("✅ Found user in DB, role:", dbUser.user_type);
            token.role = dbUser.user_type || "user";
            token.id = dbUser._id.toString();
          } else {
            console.log("❌ User not found in DB, defaulting to user");
            token.role = "user";
          }
        } catch (error) {
          console.error("❌ Error fetching user role:", error);
          token.role = "user";
        }
      }
      
      if (token.email) {
        try {
          const client = await clientPromise;
          const db = client.db("breadverse");
          
          const dbUser = await db.collection("users").findOne({
            email: token.email.toLowerCase()
          });
          
          if (dbUser) {
            const dbRole = dbUser.user_type || "user";
            console.log("🔄 Verifying role from DB:", dbRole, "vs token role:", token.role);
            
            if (dbRole !== token.role) {
              console.log("🔄 Updating token role from", token.role, "to", dbRole);
              token.role = dbRole;
              token.id = dbUser._id.toString();
            }
          }
        } catch (error) {
          console.error("❌ Error verifying role in JWT:", error);
        }
      }
      
      if (trigger === "update" && session?.user) {
        token.role = session.user.role || token.role;
      }
      
      console.log("✅ Final JWT token role:", token.role);
      return token;
    },
    
    async session({ session, token }) {
      console.log("🔐 Session Callback - Token role:", token.role);
      
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        
        if (session.user.role === "user" && token.email) {
          try {
            const client = await clientPromise;
            const db = client.db("breadverse");
            
            const dbUser = await db.collection("users").findOne({
              email: token.email.toLowerCase()
            });
            
            if (dbUser && dbUser.user_type === "admin") {
              console.log("🔄 Session callback: Fixing role from DB");
              session.user.role = dbUser.user_type;
              session.user.id = dbUser._id.toString();
            }
          } catch (error) {
            console.error("❌ Error in session callback:", error);
          }
        }
      }
      
      console.log("✅ Final session role:", session?.user?.role);
      return session;
    },
    
    async signIn({ user, account, profile }) {
  console.log("🔐 SignIn callback for:", user.email);
  console.log("🔐 SignIn provider:", account?.provider);
  
  try {
    const client = await clientPromise;
    const db = client.db("breadverse");
    
    // Find existing user (case-insensitive)
    const existingUser = await db.collection("users").findOne({
      email: { $regex: new RegExp(`^${user.email}$`, 'i') }
    });

    if (existingUser) {
      console.log("✅ Found existing user");
      
      const shouldUpdateName = !existingUser.name || existingUser.name.trim() === "";
      const newName = shouldUpdateName ? user.name : existingUser.name;
      
      const updateData: any = {
        updated_at: new Date(),
        auth_provider: account?.provider,
        name: newName,
        profile_picture: user.image || existingUser.profile_picture,
        email_verified: true,
        user_type: existingUser.user_type || "user"
      };
      
      // Add provider-specific IDs with type safety
      if (account?.provider === "github") {
        // GitHub uses 'id' field
        const githubId = (profile as any)?.id;
        if (githubId) updateData.github_id = githubId;
      } else if (account?.provider === "google") {
        // Google uses 'sub' field
        const googleId = (profile as any)?.sub;
        if (googleId) updateData.google_id = googleId;
      } else if (account?.provider === "facebook") {
        // Facebook uses 'id' field
        const facebookId = (profile as any)?.id;
        if (facebookId) updateData.facebook_id = facebookId;
      }
      
      // Preserve existing provider IDs
      if (existingUser.github_id && account?.provider !== "github") {
        updateData.github_id = existingUser.github_id;
      }
      if (existingUser.google_id && account?.provider !== "google") {
        updateData.google_id = existingUser.google_id;
      }
      if (existingUser.facebook_id && account?.provider !== "facebook") {
        updateData.facebook_id = existingUser.facebook_id;
      }
      
      await db.collection("users").updateOne(
        { _id: existingUser._id },
        { $set: updateData }
      );
      
      user.id = existingUser._id.toString();
      user.name = newName;
      
    } else {
      console.log("👤 Creating new OAuth user");
      
      const newUser: any = {
        name: user.name || "",
        email: user.email?.toLowerCase().trim() || "",
        password: "",
        img: user.image || "",
        user_type: "user",
        phone: "",
        dob: "",
        address: "",
        about: "",
        created_at: new Date(),
        updated_at: new Date(),
        profile_picture: user.image || "",
        email_verified: true,
        auth_provider: account?.provider
      };

      // Add provider-specific IDs with type safety
      if (account?.provider === "github") {
        const githubId = (profile as any)?.id;
        if (githubId) newUser.github_id = githubId;
      } else if (account?.provider === "google") {
        const googleId = (profile as any)?.sub;
        if (googleId) newUser.google_id = googleId;
      } else if (account?.provider === "facebook") {
        const facebookId = (profile as any)?.id;
        if (facebookId) newUser.facebook_id = facebookId;
      }

      const result = await db.collection("users").insertOne(newUser);
      console.log("✅ Created new user");
      user.id = result.insertedId.toString();
    }
    
    return true;
  } catch (error) {
    console.error("❌ Error in signIn callback:", error);
    return false;
  }
}
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };