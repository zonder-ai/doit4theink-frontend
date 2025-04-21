"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { ChevronLeft, User, Upload, Save } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function ClientProfileCreatePage() {
  const router = useRouter()
  const { toast } = useToast()
  
  // Current user and loading state
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
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
  const [profilePreferences, setProfilePreferences] = useState<string[]>([])
  
  // Form validation
  const [errors, setErrors] = useState<{
    fullName?: string;
    phone?: string;
    city?: string;
    state?: string;
  }>({})
  
  // Tattoo style options for preferences
  const styleOptions = [
    { id: 'traditional', label: 'Traditional' },
    { id: 'neo-traditional', label: 'Neo Traditional' },
    { id: 'japanese', label: 'Japanese' },
    { id: 'realism', label: 'Realism' },
    { id: 'blackwork', label: 'Blackwork' },
    { id: 'tribal', label: 'Tribal' },
    { id: 'new-school', label: 'New School' },
    { id: 'minimalist', label: 'Minimalist' },
    { id: 'watercolor', label: 'Watercolor' },
    { id: 'geometric', label: 'Geometric' },
  ]
  
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
        
        // Check if user is actually set to be a client type
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type, full_name, phone, avatar_url')
          .eq('id', user.id)
          .single()
        
        if (!profile || profile.user_type !== 'client') {
          // User is not set as a client, redirect to profile creation
          router.push('/profile/create')
          return
        }
        
        // Set initial form data if profile has some data
        if (profile.full_name) setFullName(profile.full_name)
        if (profile.phone) setPhone(profile.phone)
        if (profile.avatar_url) setAvatarUrl(profile.avatar_url)
        
        // Check if client profile already exists
        const { data: clientProfile } = await supabase
          .from('client_profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (clientProfile) {
          // Pre-fill the form with existing data
          if (clientProfile.address) setAddress(clientProfile.address)
          if (clientProfile.city) setCity(clientProfile.city)
          if (clientProfile.state) setState(clientProfile.state)
          if (clientProfile.postal_code) setPostalCode(clientProfile.postal_code)
          if (clientProfile.country) setCountry(clientProfile.country)
          if (clientProfile.preferences && typeof clientProfile.preferences === 'object') {
            // Handle preferences JSON data
            if (clientProfile.preferences.styles) {
              setProfilePreferences(clientProfile.preferences.styles as string[])
            }
          }
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
    const newErrors: any = {}
    
    if (!fullName.trim()) {
      newErrors.fullName = 'Name is required'
    }
    
    if (phone && !/^\+?[0-9\s\-()]+$/.test(phone)) {
      newErrors.phone = 'Invalid phone number format'
    }
    
    if (!city.trim()) {
      newErrors.city = 'City is required'
    }
    
    if (!state.trim()) {
      newErrors.state = 'State/Province is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Profile picture must be less than 5MB",
          variant: "destructive"
        })
        return
      }
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive"
        })
        return
      }
      
      setAvatarFile(file)
      
      // Create a preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }
  
  const uploadAvatar = async () => {
    if (!avatarFile || !user) return null
    
    // Upload the file to Supabase Storage
    const fileName = `${user.id}_${Date.now()}.${avatarFile.name.split('.').pop()}`
    
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, avatarFile, {
        upsert: true,
      })
    
    if (error) {
      console.error('Error uploading avatar:', error)
      return null
    }
    
    // Get the public URL for the file
    const { data: publicUrl } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)
    
    return publicUrl.publicUrl
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !user) return
    
    setIsSaving(true)
    
    try {
      // Upload avatar if a new one is selected
      let avatarPublicUrl = avatarUrl
      if (avatarFile) {
        const uploadedUrl = await uploadAvatar()
        if (uploadedUrl) {
          avatarPublicUrl = uploadedUrl
        }
      }
      
      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone,
          avatar_url: avatarPublicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
      
      if (profileError) throw profileError
      
      // Create or update client_profiles table
      const { error: clientProfileError } = await supabase
        .from('client_profiles')
        .upsert({
          id: user.id,
          address,
          city,
          state,
          postal_code: postalCode,
          country,
          preferences: {
            styles: profilePreferences
          },
          updated_at: new Date().toISOString()
        })
      
      if (clientProfileError) throw clientProfileError
      
      toast({
        title: "Profile created",
        description: "Your client profile has been created successfully.",
      })
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving profile:', error)
      toast({
        title: "Error",
        description: "There was an error saving your profile. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }
  
  const togglePreference = (styleId: string) => {
    if (profilePreferences.includes(styleId)) {
      setProfilePreferences(profilePreferences.filter(id => id !== styleId))
    } else {
      setProfilePreferences([...profilePreferences, styleId])
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }
  
  if (!user) {
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
          
          <h1 className="text-3xl font-bold mb-4">Create Client Profile</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Please fill out the information below to complete your profile.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center">
            <div className="mb-4 relative w-32 h-32">
              {avatarUrl ? (
                <div className="w-full h-full rounded-full overflow-hidden">
                  <Image
                    src={avatarUrl}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                  <User className="h-12 w-12 text-gray-500 dark:text-gray-400" />
                </div>
              )}
            </div>
            
            <div>
              <input
                type="file"
                id="avatar"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button type="button" variant="outline" onClick={() => document.getElementById('avatar')?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Profile Picture
              </Button>
            </div>
          </div>
          
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-950 rounded-lg border shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium mb-1">
                  Full Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.fullName ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.phone ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Address Information */}
          <div className="bg-white dark:bg-gray-950 rounded-lg border shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Address Information</h2>
            
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium mb-1">
                    City<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="city"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.city ? 'border-red-500 focus:ring-red-500' : ''
                    }`}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-500">{errors.city}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="state" className="block text-sm font-medium mb-1">
                    State/Province<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="state"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.state ? 'border-red-500 focus:ring-red-500' : ''
                    }`}
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                  {errors.state && (
                    <p className="mt-1 text-sm text-red-500">{errors.state}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor="country" className="block text-sm font-medium mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Preferences */}
          <div className="bg-white dark:bg-gray-950 rounded-lg border shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Tattoo Style Preferences</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Select the tattoo styles you're interested in (optional)
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {styleOptions.map(style => (
                <div
                  key={style.id}
                  onClick={() => togglePreference(style.id)}
                  className={`px-4 py-2 rounded-md border cursor-pointer text-center transition-colors
                    ${profilePreferences.includes(style.id)
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-900'
                    }`}
                >
                  {style.label}
                </div>
              ))}
            </div>
          </div>
          
          {/* Submit Button */}
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
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}