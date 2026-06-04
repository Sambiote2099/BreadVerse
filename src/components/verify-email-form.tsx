"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, Mail } from 'lucide-react';

export default function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }

    verifyEmail(token);
  }, [token]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setMessage(data.message || 'Email verified successfully!');
        
        setTimeout(() => {
          router.push('/login?verified=true');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.error || `Verification failed (Status: ${response.status})`);
        
        if (data.error?.includes('expired')) {
          setStatus('expired');
        }
      }
    } catch (error) {
      console.error('❌ Verification error:', error);
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  const resendVerification = async () => {
    router.push('/login?resend=true');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center">
            {status === 'loading' && (
              <>
                <Loader2 className="h-16 w-16 animate-spin text-amber-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-2">Verifying Your Email</h1>
                <p className="text-gray-600 mb-6">{message}</p>
                <p className="text-sm text-gray-400">Token: {token?.substring(0, 8)}...</p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-2">Email Verified!</h1>
                <p className="text-gray-600 mb-6">{message}</p>
                <p className="text-sm text-gray-500 mb-6">
                  Redirecting you to login page...
                </p>
                <Button 
                  onClick={() => router.push('/login')}
                  className="w-full"
                >
                  Go to Login Now
                </Button>
              </>
            )}

            {status === 'error' && (
              <>
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-2">Verification Failed</h1>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="space-y-3">
                  <Button 
                    onClick={() => router.push('/login')}
                    className="w-full"
                  >
                    Go to Login
                  </Button>
                  <Button 
                    onClick={resendVerification}
                    variant="outline"
                    className="w-full"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Resend Verification Email
                  </Button>
                </div>
              </>
            )}

            {status === 'expired' && (
              <>
                <XCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-2">Link Expired</h1>
                <p className="text-gray-600 mb-6">
                  This verification link has expired. Please request a new one.
                </p>
                <Button 
                  onClick={resendVerification}
                  className="w-full bg-amber-500 hover:bg-amber-600"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Request New Verification Email
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}