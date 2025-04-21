"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Upload, User } from 'lucide-react'
import Link from 'next/link'
import { getInitials } from '@/lib/utils'

export default function ProfilePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [formValues, setFormValues] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
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
          router.push('/auth/signin')
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
          setAvatarUrl(profileData.avatar_url)
          
          // Set form values from profile
          setFormValues({
            fullName: profileData.full_name || '',
            email: user.email || '',
            phone: profileData.phone || '',
            address: '',
            city: '',
            state: '',
            postalCode: '',
            country: '',
          })
          
          // Fetch client profile if user is a client
          if (profileData.user_type === 'client') {
            const { data: clientData } = await supabase
              .from('client_profiles')
              .select('*')
              .eq('id', user.id)
              .single()
            
            if (clientData) {
              setProfile(prev => ({ ...prev, ...clientData }))
              
              // Update form values with client data
              setFormValues(prev => ({
                ...prev,
                address: clientData.address || '',
                city: clientData.city || '',
                state: clientData.state || '',
                postalCode: clientData.postal_code || '',
                country: clientData.country || '',
              }))
            }
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    getUser()
  }, [router])
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormValues(prev => ({ ...prev, [name]: value }))
  }
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAvatarFile(file)
      setAvatarUrl(URL.createObjectURL(file))
    }
  }
  
  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return null
    
    try {
      const fileExt = avatarFile.name.split('.').pop()
      const filePath = `avatars/${user.id}/${Math.random().toString(36).substring(2)}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, avatarFile)
      
      if (uploadError) {
        throw uploadError
      }
      
      const { data } = supabase.storage.from('public').getPublicUrl(filePath)
      
      return data.publicUrl
    } catch (error) {
      console.error('Error uploading avatar:', error)
      return null
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) return
    
    setIsSaving(true)
    
    try {
      // Upload avatar if changed
      let newAvatarUrl = profile?.avatar_url
      if (avatarFile) {
        newAvatarUrl = await uploadAvatar()
      }
      
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formValues.fullName,
          phone: formValues.phone,
          avatar_url: newAvatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
      
      if (profileError) {
        throw profileError
      }
      
      // Update client profile if user is a client
      if (profile?.user_type === 'client') {
        const { error: clientError } = await supabase
          .from('client_profiles')
          .update({
            address: formValues.address,
            city: formValues.city,
            state: formValues.state,
            postal_code: formValues.postalCode,
            country: formValues.country,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)
        
        if (clientError) {
          throw clientError
        }
      }
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile. Please try again.')
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
        <h1 className="text-2xl font-bold mb-4">Not Authenticated</h1>
        <p className="mb-6">Please sign in to access your profile.</p>
        <Button asChild>
          <Link href="/auth/signin">Sign In</Link>
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
        <div className="bg-white dark:bg-gray-950 rounded-lg border shadow-sm p-6">
          <form onSubmit={handleSubmit}>
            {/* Avatar Upload */}
            <div className="flex flex-col items-center mb-8">
              <div className="mb-4">
                {avatarUrl ? (
                  <div className="relative w-32 h-32 rounded-full overflow-hidden">
                    <Image
                      src={avatarUrl}
                      alt="Avatar"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                    <span className="text-3xl font-semibold text-gray-500 dark:text-gray-400">
                      {getInitials(formValues.fullName || user.email)}
                    </span>
                  </div>
                )}
              </div>
              
              <div>
                <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Photo
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Basic Information</h2>
                
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    className="w-full px-3 py-2 border rounded-md"
                    value={formValues.fullName}
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
                    className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-900"
                    value={formValues.email}
                    readOnly
                    disabled
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Email cannot be changed.
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
                    value={formValues.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              {/* Address */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Address</h2>
                
                <div>
                  <label htmlFor="address" className="block text-sm font-medium mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    className="w-full px-3 py-2 border rounded-md"
                    value={formValues.address}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      className="w-full px-3 py-2 border rounded-md"
                      value={formValues.city}
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
                      value={formValues.state}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      className="w-full px-3 py-2 border rounded-md"
                      value={formValues.postalCode}
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
                      value={formValues.country}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <Button 
                type="button" 
                variant="outline" 
                className="mr-2"
                onClick={() => router.push('/dashboard')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}