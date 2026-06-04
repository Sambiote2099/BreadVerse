import { Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import VerifyEmailForm from '@/components/verify-email-form';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Suspense fallback={
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="text-center">
              <Loader2 className="h-16 w-16 animate-spin text-amber-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Loading...</h1>
              <p className="text-gray-600">Please wait while we prepare the verification page.</p>
            </div>
          </CardContent>
        </Card>
      }>
        <VerifyEmailForm />
      </Suspense>
    </div>
  );
}