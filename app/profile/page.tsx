"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Camera, ChevronLeft, Save, User } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { getInitials } from '@/lib/utils'

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  
  // Form state
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [country, setCountry] = useState('')
  
  // Artist-specific state
  const [bio, setBio] = useState('')
  const [yearsExperience, setYearsExperience] = useState<number | undefined>(undefined)
  const [portfolioUrl, setPortfolioUrl] = useState('')
  const [instagramHandle, setInstagramHandle] = useState('')
  const [artistName, setArtistName] = useState('')
  
  useEffect(() => {
    const getProfile = async () => {
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
          setFullName(profileData.full_name || '')
          setPhone(profileData.phone || '')
          setAvatarUrl(profileData.avatar_url || null)
          
          // Fetch specific profile type data
          if (profileData.user_type === 'client') {
            const { data: clientData } = await supabase
              .from('client_profiles')
              .select('*')
              .eq('id', user.id)
              .single()
            
            if (clientData) {
              setAddress(clientData.address || '')
              setCity(clientData.city || '')
              setState(clientData.state || '')
              setPostalCode(clientData.postal_code || '')
              setCountry(clientData.country || '')
            }
          } else if (profileData.user_type === 'artist') {
            const { data: artistData } = await supabase
              .from('artist_profiles')
              .select('*')
              .eq('id', user.id)
              .single()
            
            if (artistData) {
              setBio(artistData.bio || '')
              setYearsExperience(artistData.years_experience || undefined)
              setPortfolioUrl(artistData.portfolio_url || '')
              setInstagramHandle(artistData.instagram_handle || '')
              setArtistName(artistData.artist_name || '')
              setCity(artistData.city || '')
              setState(artistData.state || '')
              setPostalCode(artistData.postal_code || '')
              setCountry(artistData.country || '')
            }
          }
        } else {
          // No profile found, redirect to profile creation
          router.push('/profile/create')
          return
        }
      } catch (error) {
        console.error('Error loading profile:', error)
        toast({
          title: 'Error',
          description: 'Failed to load profile. Please try again later.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    getProfile()
  }, [router, toast])
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return
    }
    
    const file = e.target.files[0]
    setAvatarFile(file)
    
    // Create a preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }
  
  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return avatarUrl
    
    try {
      // Upload to Supabase Storage
      const fileExt = avatarFile.name.split('.').pop()
      const filePath = `avatars/${user.id}-${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, avatarFile)
      
      if (uploadError) {
        throw uploadError
      }
      
      // Get public URL
      const { data } = supabase.storage.from('profiles').getPublicUrl(filePath)
      
      return data.publicUrl
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload profile picture. Please try again.',
        variant: 'destructive',
      })
      return null
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      if (!user || !profile) return
      
      // Upload avatar if changed
      const newAvatarUrl = avatarFile ? await uploadAvatar() : avatarUrl
      
      // Update base profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone,
          avatar_url: newAvatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
      
      if (profileError) throw profileError
      
      // Update specific profile type
      if (profile.user_type === 'client') {
        const { error: clientError } = await supabase
          .from('client_profiles')
          .update({
            address,
            city,
            state,
            postal_code: postalCode,
            country,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)
        
        if (clientError) throw clientError
      } else if (profile.user_type === 'artist') {
        const { error: artistError } = await supabase
          .from('artist_profiles')
          .update({
            bio,
            years_experience: yearsExperience,
            portfolio_url: portfolioUrl,
            instagram_handle: instagramHandle,
            artist_name: artistName,
            city,
            state,
            postal_code: postalCode,
            country,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)
        
        if (artistError) throw artistError
      }
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      })
      
      // Update UI state
      setAvatarUrl(newAvatarUrl)
      setAvatarPreview(null)
      setAvatarFile(null)
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: 'Update Failed',
        description: 'Failed to update profile. Please try again later.',
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-950 rounded-lg border shadow-sm p-6 mb-6">
            <div className="flex flex-col items-center text-center mb-6">
              {/* Profile Picture */}
              <div className="relative group">
                {avatarPreview || avatarUrl ? (
                  <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4">
                    <Image
                      src={avatarPreview || avatarUrl || ''}
                      alt={fullName || 'User'}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center mb-4">
                    <span className="text-3xl font-semibold text-gray-500 dark:text-gray-400">
                      {getInitials(fullName || user?.email)}
                    </span>
                  </div>
                )}
                
                <label 
                  htmlFor="avatar-upload" 
                  className="absolute bottom-4 right-0 bg-primary text-white rounded-full p-2 cursor-pointer shadow-md
                    opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera className="h-5 w-5" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {profile?.user_type.charAt(0).toUpperCase() + profile?.user_type.slice(1)} Account
              </p>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Account Settings</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link 
                    href="/profile/password" 
                    className="text-primary hover:text-primary/80"
                  >
                    Change Password
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/profile/email" 
                    className="text-primary hover:text-primary/80"
                  >
                    Update Email
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/profile/notifications" 
                    className="text-primary hover:text-primary/80"
                  >
                    Notification Settings
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Profile Form */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-gray-950 rounded-lg border shadow-sm p-6">
            <form onSubmit={handleSubmit}>
              <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
              
              {/* Basic Information */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium mb-1">
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-1">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              {/* Artist-specific fields */}
              {profile?.user_type === 'artist' && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-4">Artist Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="artistName" className="block text-sm font-medium mb-1">
                        Artist Name / Pseudonym
                      </label>
                      <input
                        id="artistName"
                        type="text"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        value={artistName}
                        onChange={(e) => setArtistName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="yearsExperience" className="block text-sm font-medium mb-1">
                        Years of Experience
                      </label>
                      <input
                        id="yearsExperience"
                        type="number"
                        min="0"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        value={yearsExperience || ''}
                        onChange={(e) => setYearsExperience(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="bio" className="block text-sm font-medium mb-1">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      rows={4}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="portfolioUrl" className="block text-sm font-medium mb-1">
                        Portfolio Website
                      </label>
                      <input
                        id="portfolioUrl"
                        type="url"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        placeholder="https://yourportfolio.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="instagramHandle" className="block text-sm font-medium mb-1">
                        Instagram Handle
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-500">@</span>
                        <input
                          id="instagramHandle"
                          type="text"
                          className="w-full pl-7 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          value={instagramHandle}
                          onChange={(e) => setInstagramHandle(e.target.value)}
                          placeholder="yourusername"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Address */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">Address</h3>
                <div className="mb-4">
                  <label htmlFor="address" className="block text-sm font-medium mb-1">
                    Street Address
                  </label>
                  <input
                    id="address"
                    type="text"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <label htmlFor="city" className="block text-sm font-medium mb-1">
                      City
                    </label>
                    <input
                      id="city"
                      type="text"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium mb-1">
                      State/Province
                    </label>
                    <input
                      id="state"
                      type="text"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium mb-1">
                      Postal Code
                    </label>
                    <input
                      id="postalCode"
                      type="text"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label htmlFor="country" className="block text-sm font-medium mb-1">
                      Country
                    </label>
                    <input
                      id="country"
                      type="text"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}