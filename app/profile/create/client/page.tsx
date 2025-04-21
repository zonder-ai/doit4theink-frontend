"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Save, Upload, User } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function ClientProfileCreatePage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  
  // Form state
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [country, setCountry] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  
  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true)
      
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          // Not authenticated, redirect to sign in
          router.push('/auth/signin?redirect=/profile/create')
          return
        }
        
        setUser(user)
        
        // Check if user has selected the client profile type
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (!existingProfile) {
          // No profile found, redirect to profile type selection
          router.push('/profile/create')
          return
        }
        
        if (existingProfile.user_type !== 'client') {
          // User has not selected client profile type, redirect to profile type selection
          router.push('/profile/create')
          return
        }
        
        setProfile(existingProfile)
        
        // Pre-fill form fields if data exists
        if (existingProfile.full_name) setFullName(existingProfile.full_name)
        if (existingProfile.phone) setPhone(existingProfile.phone)
        if (existingProfile.avatar_url) setAvatarUrl(existingProfile.avatar_url)
        
        // Check if client profile already exists
        const { data: clientProfile } = await supabase
          .from('client_profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (clientProfile) {
          // Pre-fill form fields if data exists
          if (clientProfile.address) setAddress(clientProfile.address)
          if (clientProfile.city) setCity(clientProfile.city)
          if (clientProfile.state) setState(clientProfile.state)
          if (clientProfile.postal_code) setPostalCode(clientProfile.postal_code)
          if (clientProfile.country) setCountry(clientProfile.country)
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuth()
  }, [router])
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }
    
    if (phone && !/^\+?[0-9()-\s]+$/.test(phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }
    
    if (!city.trim()) {
      newErrors.city = 'City is required'
    }
    
    if (!country.trim()) {
      newErrors.country = 'Country is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return
    }
    
    const file = e.target.files[0]
    setAvatarFile(file)
    
    // Display preview
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatarUrl(event.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }
  
  const uploadAvatar = async () => {
    if (!avatarFile || !user) return null
    
    try {
      // Generate a unique file path
      const fileExt = avatarFile.name.split('.').pop()
      const filePath = `avatars/${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`
      
      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, avatarFile)
      
      if (uploadError) throw uploadError
      
      // Get the public URL
      const { data } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath)
      
      return data.publicUrl
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast({
        title: 'Upload Error',
        description: 'Failed to upload profile picture. Please try again.',
        variant: 'destructive',
      })
      return null
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !user) return
    
    setIsSaving(true)
    
    try {
      // Upload avatar if selected
      let avatarPublicUrl = profile?.avatar_url
      if (avatarFile) {
        const uploadedUrl = await uploadAvatar()
        if (uploadedUrl) {
          avatarPublicUrl = uploadedUrl
        }
      }
      
      // Update profile in the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: phone,
          avatar_url: avatarPublicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
      
      if (profileError) throw profileError
      
      // Check if client profile exists
      const { data: existingClientProfile } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('id', user.id)
        .single()
      
      if (existingClientProfile) {
        // Update client profile
        const { error: clientError } = await supabase
          .from('client_profiles')
          .update({
            address,
            city,
            state,
            postal_code: postalCode,
            country,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
        
        if (clientError) throw clientError
      } else {
        // Create client profile
        const { error: clientError } = await supabase
          .from('client_profiles')
          .insert({
            id: user.id,
            address,
            city,
            state,
            postal_code: postalCode,
            country,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        
        if (clientError) throw clientError
      }
      
      toast({
        title: 'Profile Created',
        description: 'Your client profile has been successfully created!',
      })
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving profile:', error)
      toast({
        title: 'Save Error',
        description: 'Failed to save your profile. Please try again.',
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
        <h1 className="text-2xl font-bold mb-4">Authentication required</h1>
        <p className="mb-6">Please sign in to create your profile.</p>
        <Button asChild>
          <Link href="/auth/signin?redirect=/profile/create">
            Sign In
          </Link>
        </Button>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/profile/create">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">Create Client Profile</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Complete your profile to start booking tattoo appointments.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              {avatarUrl ? (
                <div className="relative w-32 h-32 rounded-full overflow-hidden">
                  <Image
                    src={avatarUrl}
                    alt={fullName || 'Profile'}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                  <User className="h-12 w-12 text-gray-400" />
                </div>
              )}
              
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center cursor-pointer text-white"
              >
                <Upload className="h-4 w-4" />
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Upload a profile picture (optional)
            </p>
          </div>
          
          {/* Personal Information */}
          <div className="bg-white dark:bg-gray-950 rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="full-name" className="block text-sm font-medium mb-1">
                  Full Name*
                </label>
                <input
                  type="text"
                  id="full-name"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.fullName ? 'border-red-500' : ''
                  }`}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.phone ? 'border-red-500' : ''
                  }`}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  We'll only use this for appointment reminders (optional)
                </p>
              </div>
            </div>
          </div>
          
          {/* Location Information */}
          <div className="bg-white dark:bg-gray-950 rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Location</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="address" className="block text-sm font-medium mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  id="address"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium mb-1">
                    City*
                  </label>
                  <input
                    type="text"
                    id="city"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.city ? 'border-red-500' : ''
                    }`}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-500">{errors.city}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="state" className="block text-sm font-medium mb-1">
                    State/Province
                  </label>
                  <input
                    type="text"
                    id="state"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="postal-code" className="block text-sm font-medium mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    id="postal-code"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor="country" className="block text-sm font-medium mb-1">
                    Country*
                  </label>
                  <input
                    type="text"
                    id="country"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.country ? 'border-red-500' : ''
                    }`}
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                  />
                  {errors.country && (
                    <p className="mt-1 text-sm text-red-500">{errors.country}</p>
                  )}
                </div>
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Your location helps us find nearby artists and studios
              </p>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={isSaving}>
              {isSaving ? (
                <>
                  <div className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Profile
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}