'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AccountPage from '@/components/AccountPage';
import { Loader2, User as UserIcon, Shield } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  console.log('🔐 Profile - Session status:', status);
  console.log('🔐 Profile - Session data:', session);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=' + encodeURIComponent('/profile'));
    }
  }, [status, router]);

  // Fetch user data when authenticated
  useEffect(() => {
    const fetchUserData = async () => {
      if (status !== 'authenticated' || !session?.user?.id) return;
      
      setLoading(true);
      try {
        console.log('📡 Fetching user data for ID:', session.user.id);
        
        const res = await fetch(`/api/users/${session.user.id}`);
        
        if (res.ok) {
          const data = await res.json();
          console.log('✅ User data fetched:', data);
          setUserData(data);
        } else {
          console.error('Failed to fetch user:', res.status);
          // Try fallback to /api/users/me
          const fallbackRes = await fetch('/api/users/me');
          if (fallbackRes.ok) {
            const fallbackData = await fallbackRes.json();
            setUserData(fallbackData);
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [status, session]);

  // Loading state
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
          <p className="text-gray-600 mb-6">
            You need to be logged in to view your profile.
          </p>
          <Link
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  // User data not found
  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-gray-600 mb-6">
            We couldn't find your profile data.
          </p>
          <button
            onClick={() => router.refresh()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg mr-4"
          >
            Refresh
          </button>
          <Link
            href="/"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  // Show profile page
  return <AccountPage user={userData} setUser={setUserData} isOwnProfile={true} />;
}