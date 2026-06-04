"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const sectionRef = useRef<HTMLDivElement>(null);

   useGSAP(() => {

    if (typeof window === 'undefined') return;

    if (sectionRef.current) {
      gsap.fromTo(sectionRef.current,
        {
          opacity: 0,
        
          scale: 0.95,
        },
        {
          opacity: 1,
      
          scale: 1,
          duration: 2,
          ease: "power4.Out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 100%", // Starts when top of element is 80% from top of viewport
            toggleActions: "play none none none", // play on enter, none on leave, none on enterBack, none on leaveBack
          }
        }
      );
    }
  });

  const validateForm = () => {
    setError("");

    if (!name.trim()) {
      setError("Name is required");
      return false;
    }

    if (!email.trim()) {
      setError("Email is required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (!password) {
      setError("Password is required");
      return false;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) {
    return;
  }

  setLoading(true);
  setError("");
  setSuccess("");

  try {
    console.log("Signup attempt:", { name, email });
    
    // 1. Create account via API
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ 
        name: name.trim(), 
        email: email.trim().toLowerCase(), 
        password 
      }),
    });

    console.log("Signup response status:", res.status);
    
    const data = await res.json();
    console.log("Signup response data:", data);

    if (!res.ok) {
      throw new Error(data.error || `Signup failed (${res.status})`);
    }

    if (!data.success) {
      throw new Error(data.error || "Signup failed");
    }

    // ✅ SUCCESS - Account created
    if (data.requiresVerification) {
      // Show verification message instead of auto-login
      setSuccess("Account created! Please check your email to verify your account before logging in.");
      
      // Clear form
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      
      // Redirect to login after 5 seconds
      setTimeout(() => {
        window.location.href = "/login?message=Please verify your email to login";
      }, 5000);
    } else {
      // For OAuth or already verified, auto-login
      setSuccess("Account created successfully! Logging you in...");
      
      try {
        const result = await signIn("credentials", {
          email: email.trim(),
          password,
          redirect: false,
          callbackUrl: "/"
        });

        if (result?.error) {
          setTimeout(() => {
            window.location.href = "/login?message=Account created. Please login.";
          }, 2000);
        } else if (result?.ok) {
          setTimeout(() => {
            window.location.href = result.url || "/";
          }, 1000);
        }
      } catch (loginError) {
        console.error("Auto-login failed:", loginError);
        setTimeout(() => {
          window.location.href = "/login?message=Account created. Please login.";
        }, 2000);
      }
    }

  } catch (err: any) {
    console.error("Signup error:", err);
    setError(err.message || "Signup failed. Please try again.");
  } finally {
    setLoading(false);
  }
};

  const handleOAuthSignIn = async (provider: "google" | "github" | "facebook") => {
    try {
      setError("");
      setOauthLoading(provider);
      
      await signIn(provider, {
        callbackUrl: "/",
        redirect: true
      });
    } catch (err: any) {
      console.error(`${provider} sign in error:`, err);
      setError(`Failed to sign in with ${provider}`);
      setOauthLoading(null);
    }
  };

  return (
    <div ref={sectionRef} className={cn("flex flex-col gap-4 md:mt-8 mt-14 scale-95", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Create your account</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Enter your details below to create your account
                </p>
              </div>
              
              {/* Success Message */}
              {success && (
                <div className="p-3 mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-600 dark:text-green-400 text-center">
                    {success}
                  </p>
                </div>
              )}
              
              {/* Error Message */}
              {error && (
                <div className="p-3 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400 text-center">
                    {error}
                  </p>
                </div>
              )}
              
              <Field>
                <FieldLabel htmlFor="name">Full Name *</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading || oauthLoading !== null}
                  className={error ? "border-red-500" : ""}
                />
              </Field>
              
              <Field>
                <FieldLabel htmlFor="email">Email Address *</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading || oauthLoading !== null}
                  className={error ? "border-red-500" : ""}
                />
                <FieldDescription className="mt-2">
                  We'll use this to contact you. We will not share your email with anyone else.
                </FieldDescription>
              </Field>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="password">Password *</FieldLabel>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading || oauthLoading !== null}
                    className={error ? "border-red-500" : ""}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="confirmPassword">
                    Confirm Password *
                  </FieldLabel>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading || oauthLoading !== null}
                    className={error ? "border-red-500" : ""}
                  />
                </Field>
              </div>
              
              <FieldDescription className="text-sm text-gray-500">
                Password must be at least 6 characters long.
              </FieldDescription>
              
              <Field>
                <Button 
                  type="submit" 
                  disabled={loading || oauthLoading !== null}
                  className="w-full text-md transition-all duration-700 hover:bg-amber-800 dark:bg-[#c3aa88] bg-[#c3a579] text-white hover:dark:bg-amber-200 rounded-4xl dark:text-black py-5 font-bold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </Field>
              
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or sign in with
              </FieldSeparator>
              
              <Field className="grid grid-cols-3 gap-4">
                {/* Facebook Button */}
                <Button 
                  variant="outline" 
                  type="button" 
                  disabled={loading}
                  onClick={() => handleOAuthSignIn("facebook")}
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 dark:text-blue-500 text-white border-blue-600"
                >
                  <svg 
                    className="w-5 h-5" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                    aria-label="Facebook logo"
                  >
                    <path fillRule="evenodd" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" clipRule="evenodd" />
                  </svg>
                  <span className="sr-only">Login with Facebook</span>
                </Button>
                
                {/* Google Button */}
                <Button 
                  variant="outline" 
                  type="button" 
                  disabled={loading}
                  onClick={() => handleOAuthSignIn("google")}
                  className="flex items-center justify-center gap-2 bg-linear-to-l hover:bg-teal-200 dark:hover:bg-emerald-200 bg-emerald-100 to-yellow-100 dark:bg-linear-to-r dark:bg-emerald-100 dark:to-yellow-100"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span className="sr-only">Login with Google</span>
                </Button>
                
                {/* GitHub Button */}
                <Button 
                  variant="outline" 
                  type="button" 
                  disabled={loading}
                  onClick={() => handleOAuthSignIn("github")}
                  className="flex items-center justify-center gap-2 bg-black text-white dark:text-black dark:bg-white"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                  </svg>
                  <span className="sr-only">Login with GitHub</span>
                </Button>
              </Field>
              
              <FieldDescription className="text-center">
                Already have an account? <a href="/login" className="text-amber-600 hover:underline">Sign in</a>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="https://plus.unsplash.com/premium_photo-1700767195067-cebeea138cea?q=80&w=1376&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center text-amber-100">
        By clicking continue, you agree to our <a href="#" className="text-white hover:underline">Terms of Service</a>{" "}
        and <a href="#" className="text-white hover:underline">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}