"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, User, Upload, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { getInitials } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    bio: '',
  })
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  
  useEffect(() => {
    const getUser = async () => {
      setIsLoading(true)
      
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          // Not authenticated, redirect to sign in
          router.push('/auth/signin?redirect=/profile')
          return
        }
        
        setUser(user)
        
        // Fetch user's profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (profileData) {
          setProfile(profileData)
          
          // Initialize form with profile data
          setFormData({
            full_name: profileData.full_name || '',
            email: user.email || '',
            phone: profileData.phone || '',
            address: '',
            city: '',
            state: '',
            postal_code: '',
            country: '',
            bio: '',
          })
          
          setAvatarUrl(profileData.avatar_url)
          
          // Fetch extended profile based on user type
          if (profileData.user_type === 'client') {
            const { data: clientData } = await supabase
              .from('client_profiles')
              .select('*')
              .eq('id', user.id)
              .single()
            
            if (clientData) {
              setFormData(prevData => ({
                ...prevData,
                address: clientData.address || '',
                city: clientData.city || '',
                state: clientData.state || '',
                postal_code: clientData.postal_code || '',
                country: clientData.country || '',
              }))
            }
          } else if (profileData.user_type === 'artist') {
            const { data: artistData } = await supabase
              .from('artist_profiles')
              .select('*')
              .eq('id', user.id)
              .single()
            
            if (artistData) {
              setFormData(prevData => ({
                ...prevData,
                bio: artistData.bio || '',
                city: artistData.city || '',
                state: artistData.state || '',
                postal_code: artistData.postal_code || '',
                country: artistData.country || '',
              }))
            }
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load profile data. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    getUser()
  }, [router, toast])
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }))
  }
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setAvatarFile(file)
      
      // Create a preview URL
      const reader = new FileReader()
      reader.onload = () => {
        setAvatarUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }
  
  const uploadAvatar = async () => {
    if (!avatarFile || !user) return null
    
    try {
      // Upload to Supabase Storage
      const fileExt = avatarFile.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`
      
      const { data, error } = await supabase.storage
        .from('profile-images')
        .upload(filePath, avatarFile, {
          upsert: true,
        })
      
      if (error) throw error
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath)
      
      return publicUrl
    } catch (error) {
      console.error('Error uploading avatar:', error)
      return null
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      // Upload avatar if changed
      let newAvatarUrl = avatarUrl
      if (avatarFile) {
        newAvatarUrl = await uploadAvatar()
      }
      
      // Update base profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          avatar_url: newAvatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
      
      if (profileError) throw profileError
      
      // Update extended profile based on user type
      if (profile.user_type === 'client') {
        const { error: clientError } = await supabase
          .from('client_profiles')
          .update({
            address: formData.address,
            city: formData.city,
            state: formData.state,
            postal_code: formData.postal_code,
            country: formData.country,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)
        
        if (clientError) throw clientError
      } else if (profile.user_type === 'artist') {
        const { error: artistError } = await supabase
          .from('artist_profiles')
          .update({
            bio: formData.bio,
            city: formData.city,
            state: formData.state,
            postal_code: formData.postal_code,
            country: formData.country,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)
        
        if (artistError) throw artistError
      }
      
      toast({
        title: 'Success',
        description: 'Your profile has been updated successfully.',
      })
      
      router.push('/dashboard')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }
  
  if (!user || !profile) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Account not found</h1>
        <p className="mb-6">Please sign in to access your profile.</p>
        <Button asChild>
          <Link href="/auth/signin?redirect=/profile">Sign In</Link>
        </Button>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Edit Profile</h1>
      </div>
      
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-950 rounded-lg border shadow-sm p-6 mb-8">
          <form onSubmit={handleSubmit}>
            {/* Avatar Upload */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group mb-4">
                {avatarUrl ? (
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-md">
                    <Image
                      src={avatarUrl}
                      alt={formData.full_name || user.email}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-md">
                    <span className="text-3xl font-semibold text-gray-500 dark:text-gray-400">
                      {getInitials(formData.full_name || user.email)}
                    </span>
                  </div>
                )}
                <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer shadow-md">
                  <Camera className="h-5 w-5" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Click the camera icon to change your profile picture
              </p>
            </div>
            
            {/* Basic Information */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="full_name" className="block text-sm font-medium mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="full_name"
                      name="full_name"
                      className="w-full px-3 py-2 border rounded-md"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-800"
                      value={formData.email}
                      readOnly
                      disabled
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Email cannot be changed
                    </p>
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="w-full px-3 py-2 border rounded-md"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
              
              {/* Address */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Address</h2>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      className="w-full px-3 py-2 border rounded-md"
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        className="w-full px-3 py-2 border rounded-md"
                        value={formData.city}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium mb-1">
                        State/Province
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        className="w-full px-3 py-2 border rounded-md"
                        value={formData.state}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="postal_code" className="block text-sm font-medium mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        id="postal_code"
                        name="postal_code"
                        className="w-full px-3 py-2 border rounded-md"
                        value={formData.postal_code}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="country" className="block text-sm font-medium mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        id="country"
                        name="country"
                        className="w-full px-3 py-2 border rounded-md"
                        value={formData.country}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Artist Bio (only for artists) */}
              {profile.user_type === 'artist' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Professional Information</h2>
                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium mb-1">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows={5}
                      className="w-full px-3 py-2 border rounded-md"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Tell clients about yourself, your experience, and your tattooing style..."
                    />
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-4">
                <Button 
                  variant="outline" 
                  type="button"
                  onClick={() => router.push('/dashboard')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </form>
        </div>
        
        {/* Account Management */}
        <div className="bg-white dark:bg-gray-950 rounded-lg border shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Account Management</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Change Password</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Update your password to keep your account secure.
              </p>
              <Button variant="outline" asChild>
                <Link href="/auth/reset-password">
                  Change Password
                </Link>
              </Button>
            </div>
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-medium text-red-600 dark:text-red-500 mb-2">
                Delete Account
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <Button variant="destructive">
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}