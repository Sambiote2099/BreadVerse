'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, useGSAP);
}
interface AccountPageProps {
  user: UserData;
  setUser?: (user: UserData) => void;
}
export interface UserData {
  // Support both MongoDB _id and normalized id
  id?: string;
  _id?: string;
  name: string;
  email: string;
  img: string;
  user_type?: string;
  phone: string;
  address: string;
  dob: string;
  nid: string;
  about: string;
  
  // Add any new fields from your API
  profile_picture?: string;
  created_at?: string;
  updated_at?: string;
  auth_provider?: string;
  email_verified?: boolean;
}

const AccountPage: React.FC<AccountPageProps> = ({ 
  user: initialUser, 
  setUser: propSetUser 
}) => {
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState<UserData>(initialUser);
  const [currentUser, setCurrentUser] = useState<UserData>(initialUser);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const UserDetailsRef = useRef<HTMLDivElement>(null);
    const ImageRef = useRef<HTMLDivElement>(null);
    const HeaderRef = useRef<HTMLDivElement>(null);
  
    useGSAP(() => {
  
      if (typeof window === 'undefined') return;
  
      if (UserDetailsRef.current) {
          gsap.fromTo(UserDetailsRef.current,
            {
              opacity: 0,
              y: 500,
              scale: 0.95,
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 2,
              ease: "power4.inOut",
              clearProps:"opacity",
            }
          );
        }

        if (ImageRef.current) {
          gsap.fromTo(ImageRef.current,
            {
              opacity: 0,
              x: 600,
              scale: 0.95,
            },
            {
              opacity: 1,
              x: 0,
              scale: 1,
              duration: 3.5,
              ease: "power4.inOut",
              scrollTrigger: {
                trigger: ImageRef.current,
                start: "top 100%",
                toggleActions: "play none none none",
              }
            }
          );
        }

        if (HeaderRef.current) {
          gsap.fromTo(HeaderRef.current,
            {
              opacity: 0,
              x: -800,
              scale: 0.95,
            },
            {
              opacity: 1,
              x: 0,
              scale: 1,
              duration: 3,
              ease: "elastic.inOut",
              clearProps:"all",
              scrollTrigger: {
                trigger: HeaderRef.current,
                start: "top 100%",
                toggleActions: "play none none none",
              }
            }
          );
        }
      },{dependencies: []});

  // Use prop setter if provided, otherwise use local state
  const user = initialUser;
  const setUser = propSetUser || setCurrentUser;

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Validate file type
  if (!file.type.startsWith('image/')) {
    toast.error('Please upload an image file (JPG, PNG, GIF)');
    return;
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    toast.error('Image size should be less than 5MB');
    return;
  }

  const toastId = toast.loading('Uploading image to Cloudinary...');

  try {
    // Create FormData for Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'breadverse_profiles'); // Use default preset or create one
    formData.append('folder', 'BreadVerse');
    
    // Use your cloud name from environment
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();
    
    console.log('Cloudinary response:', data); // Debug log

    if (response.ok && data.secure_url) {
      // Update user profile in your database
      const updateResponse = await fetch(`/api/users/${user.id}/profile-image`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: data.secure_url
        }),
      });

      if (updateResponse.ok) {
        // Update local user state
        const updatedUser = {
          ...user,
          img: data.secure_url
        };
        setUser(updatedUser);
        
        toast.update(toastId, {
          render: 'Profile image updated successfully!',
          type: 'success',
          isLoading: false,
          autoClose: 2000,
        });
      } else {
        throw new Error('Failed to update profile in database');
      }
    } else {
      throw new Error(data.error?.message || 'Cloudinary upload failed');
    }
  } catch (error) {
    console.error('Upload error:', error);
    toast.update(toastId, {
      render: error instanceof Error ? error.message : 'Failed to upload image. Please try again.',
      type: 'error',
      isLoading: false,
      autoClose: 2000,
    });
  }
};

  const handleFieldChange = (field: keyof UserData, value: string) => {
    setEditedUser(prev => ({ ...prev, [field]: value }));
  };

  const updateCredentials = async () => {
  // Validation
  if (!/^[0-9]{11}$/.test(editedUser.phone)) {
    toast.warn('Phone number must be exactly 11 digits.');
    return;
  }

  if (!editedUser.email.includes('@')) {
    toast.warn('Please enter a valid email address.');
    return;
  }

  if (!editedUser.name.trim()) {
    toast.warn('Name cannot be empty.');
    return;
  }

  const toastId = toast.loading('Updating profile...');
  
  try {
    if (!user.id) {
      throw new Error('User ID is required');
    }

    const response = await fetch(`/api/users/${user.id}/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: editedUser.name,
        email: editedUser.email,
        phoneNo: editedUser.phone,
        address: editedUser.address,
        doB: editedUser.dob,
        about: editedUser.about
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Update failed (${response.status})`);
    }

    // Update local user state with server response
    if (data.success && data.user) {
      setUser(data.user);
      setEditedUser(data.user); // Also update editedUser to match
      
      toast.update(toastId, {
        render: data.message || 'Profile updated successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 2000,
      });
      setEditMode(false);
    } else {
      throw new Error('Update response format error');
    }
  } catch (error) {
    console.error('Update error:', error);
    toast.update(toastId, {
      render: error instanceof Error ? error.message : 'Failed to update profile',
      type: 'error',
      isLoading: false,
      autoClose: 2000,
    });
  }
};

  const cancelEdit = () => {
    setEditedUser(user);
    setEditMode(false);
    toast.info('Changes discarded');
  };

  return (
    <div className="min-h-screen mt-16 bg-[#f3ecd8] dark:bg-[#2c2c2cbe] transition-colors duration-1000 text-gray-900 dark:text-white">
      {/* Profile Header */}
      <div ref={HeaderRef} className="bg-linear-to-r from-blue-50 to-transparent dark:from-[#030a13de] dark:to-transparent py-6 sm:py-8 px-4">
        <div className="container mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl dark:text-[#977449] font-bold break-words">
            {user.name}&apos;s Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base break-all">
            User ID: {user.id} • {user.user_type}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-4 md:p-6 lg:p-8 py-8">
        <div className="flex flex-col-reverse lg:flex-row gap-8 lg:gap-12">

          {/* Right Column - User Details */}
          <div ref={UserDetailsRef} className="lg:w-2/3 space-y-6">
            {/* User Info Card */}
            <div className="bg-white dark:bg-[#1c1c1c] rounded-2xl shadow-lg p-6 text-black dark:text-[#977449]">
              <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
                <h2 className="text-xl sm:text-2xl font-bold">Personal Information</h2>
                {!editMode ? (
                  <button
                    onClick={() => setEditMode(true)}
                    className="bg-[#c6aa80] hover:bg-emerald-600 dark:bg-gray-300 dark:text-black dark:hover:bg-emerald-600 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 text-sm sm:text-base"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2 sm:gap-3">
                    <button
                      onClick={updateCredentials}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center gap-1.5 text-sm sm:text-base"
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center gap-1.5 text-sm sm:text-base"
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* User Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Read-only fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Full Name
                  </label>
                  <div className="text-lg font-medium">{user.name}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    User Type
                  </label>
                  <div className="text-lg font-medium">
  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
    (user.user_type) === 'admin' 
      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  }`}>
    {(user.user_type || 'user')?.charAt(0).toUpperCase() + (user.user_type || 'user')?.slice(1)}
  </span>
</div>
                </div>

                {/* Editable fields */}
                {editMode ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={editedUser.dob}
                        onChange={e => handleFieldChange('dob', e.target.value)}
                        className="w-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        disabled
                        value={editedUser.email}
                        onChange={e => handleFieldChange('email', e.target.value)}
                        className="w-full bg-amber-50 cursor-not-allowed font-semibold dark:bg-black rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="your.email@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={editedUser.phone}
                        onChange={e => {
                          const numeric = e.target.value.replace(/\D/g, '');
                          if (numeric.length <= 11) {
                            handleFieldChange('phone', numeric);
                          }
                        }}
                        className="w-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="01XXXXXXXXX"
                        maxLength={11}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Address
                      </label>
                      <input
                        value={editedUser.address}
                        onChange={e => handleFieldChange('address', e.target.value)}
                        className="w-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter your full address"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Date of Birth
                      </label>
                      <div className="text-lg font-medium">{user.dob}</div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Email Address
                      </label>
                      <div className="text-lg font-medium">{user.email}</div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Phone Number
                      </label>
                      <div className="text-lg font-medium">{user.phone}</div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Address
                      </label>
                      <div className="text-lg font-medium">{user.address}</div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* About Section */}
            <div className="bg-white dark:bg-[#1c1c1c] text-black dark:text-[#977449] rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <span className="text-2xl">📝</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold">About {user.name}</h2>
              </div>

              {editMode ? (
                <textarea
                  value={editedUser.about}
                  onChange={e => handleFieldChange('about', e.target.value)}
                  className="w-full h-48 bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Tell us about yourself, your interests, experiences, or anything you'd like to share..."
                  rows={6}
                />
              ) : (
                <div className="text-gray-700 dark:text-[#977449da] text-lg leading-relaxed whitespace-pre-wrap bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                  {user.about || 'No information provided.'}
                </div>
              )}
            </div>
          </div>
           {/* Left Column - Profile Image */}
          <div ref={ImageRef} className="lg:w-1/3 flex flex-col items-center">
            <div className="relative w-40 h-40 sm:w-56 sm:h-56 md:w-72 md:h-72 lg:w-80 lg:h-80 rounded-full overflow-hidden shadow-2xl border-4 border-white dark:border-black">
              <Image
                src={user.img}
                alt={`${user.name}'s profile`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 160px, (max-width: 768px) 224px, (max-width: 1024px) 288px, 320px"
                priority
              />
            </div>
            
            <div className="mt-6 w-full max-w-xs sm:max-w-sm">
              <button
                onClick={handleImageUploadClick}
                className="w-full bg-[#c6aa80] hover:bg-yellow-600 dark:bg-gray-300 dark:text-black dark:hover:bg-yellow-600 text-white font-semibold py-3 px-4 rounded-xl text-base sm:text-lg transition-all duration-300 ease-in-out transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Change Profile Picture
              </button>
              
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleImageChange}
              />
              
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3 text-center">
                Supported formats: JPG, PNG, WebP • Max size: 5MB
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;