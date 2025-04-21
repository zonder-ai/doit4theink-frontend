"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChevronLeft, Upload, User, Shield, Key } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { getInitials } from '@/lib/utils'

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>({})
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  
  // Form states
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
  })
  
  // Password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  
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
          
          // Fetch extended profile based on user type
          if (profileData.user_type === 'client') {
            const { data: clientData } = await supabase
              .from('client_profiles')
              .select('*')
              .eq('id', user.id)
              .single()
            
            if (clientData) {
              setProfile({ ...profileData, ...clientData })
              
              // Set form data
              setFormData({
                full_name: profileData.full_name || '',
                phone: profileData.phone || '',
                address: clientData.address || '',
                city: clientData.city || '',
                state: clientData.state || '',
                postal_code: clientData.postal_code || '',
                country: clientData.country || '',
              })
            }
          } else if (profileData.user_type === 'artist') {
            const { data: artistData } = await supabase
              .from('artist_profiles')
              .select('*')
              .eq('id', user.id)
              .single()
            
            if (artistData) {
              setProfile({ ...profileData, ...artistData })
              
              // Set form data for artist
              setFormData({
                full_name: profileData.full_name || '',
                phone: profileData.phone || '',
                address: '', // Artists don't have address in this schema
                city: artistData.city || '',
                state: artistData.state || '',
                postal_code: artistData.postal_code || '',
                country: artistData.country || '',
              })
            }
          } else {
            // Basic profile
            setFormData({
              full_name: profileData.full_name || '',
              phone: profileData.phone || '',
              address: '',
              city: '',
              state: '',
              postal_code: '',
              country: '',
            })
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load profile information.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    getUser()
  }, [router, toast])
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData({ ...passwordData, [name]: value })
  }
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAvatarFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarPreview(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }
  
  const saveProfile = async () => {
    setIsSaving(true)
    
    try {
      // Update profile table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
      
      if (profileError) throw profileError
      
      // Update user type specific table
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
            city: formData.city,
            state: formData.state,
            postal_code: formData.postal_code,
            country: formData.country,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)
        
        if (artistError) throw artistError
      }
      
      // Upload avatar if changed
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        const filePath = `avatars/${fileName}`
        
        const { error: uploadError } = await supabase.storage
          .from('profiles')
          .upload(filePath, avatarFile)
        
        if (uploadError) throw uploadError
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('profiles')
          .getPublicUrl(filePath)
        
        // Update profile with new avatar URL
        const { error: avatarUpdateError } = await supabase
          .from('profiles')
          .update({
            avatar_url: publicUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)
        
        if (avatarUpdateError) throw avatarUpdateError
      }
      
      toast({
        title: 'Success',
        description: 'Your profile has been updated.',
      })
      
      // Refresh page to show updated data
      router.refresh()
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
  
  const changePassword = async () => {
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match.',
        variant: 'destructive',
      })
      return
    }
    
    if (passwordData.newPassword.length < 8) {
      toast({
        title: 'Error',
        description: 'New password must be at least 8 characters long.',
        variant: 'destructive',
      })
      return
    }
    
    setIsSaving(true)
    
    try {
      // Update password
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      })
      
      if (error) throw error
      
      toast({
        title: 'Success',
        description: 'Your password has been updated.',
      })
      
      // Clear password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error) {
      console.error('Error updating password:', error)
      toast({
        title: 'Error',
        description: 'Failed to update password. Please try again.',
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
        <h1 className="text-3xl font-bold">Profile Settings</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-950 rounded-lg border shadow-sm p-6 mb-6">
            <div className="flex flex-col items-center text-center mb-6">
              {/* Avatar with Upload Option */}
              <div className="relative mb-4">
                {avatarPreview || profile.avatar_url ? (
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg">
                    <Image
                      src={avatarPreview || profile.avatar_url}
                      alt={profile.full_name || 'User'}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg">
                    <span className="text-3xl font-semibold text-gray-500 dark:text-gray-400">
                      {getInitials(profile.full_name || user.email)}
                    </span>
                  </div>
                )}
                
                <label
                  htmlFor="avatar-upload"
                  className="absolute -bottom-2 right-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer shadow-md hover:bg-primary/90 transition-colors"
                >
                  <Upload className="h-5 w-5" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
              
              <h2 className="text-xl font-semibold">{profile.full_name || 'User'}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
              
              <div className="mt-4 py-2 px-4 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-medium capitalize">
                {profile.user_type || 'User'}
              </div>
            </div>
            
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
              <p>
                Member since: {new Date(profile.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="md:col-span-3">
          <div className="bg-white dark:bg-gray-950 rounded-lg border shadow-sm">
            <Tabs defaultValue="personal">
              <div className="border-b">
                <TabsList className="w-full rounded-none bg-transparent border-b p-0">
                  <TabsTrigger
                    value="personal"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Personal Information
                  </TabsTrigger>
                  <TabsTrigger
                    value="security"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Security
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="personal" className="p-6">
                <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="full_name" className="block text-sm font-medium mb-1">
                        Full Name
                      </label>
                      <input
                        id="full_name"
                        name="full_name"
                        type="text"
                        className="w-full px-3 py-2 border rounded-md"
                        value={formData.full_name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium mb-1">
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        className="w-full px-3 py-2 border rounded-md"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
                      value={user.email}
                      readOnly
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      You cannot change your email address
                    </p>
                  </div>
                  
                  {(profile.user_type === 'client' || profile.user_type === 'artist') && (
                    <>
                      <div className="mt-8 mb-4">
                        <h3 className="text-lg font-medium">Address Information</h3>
                      </div>
                      
                      {profile.user_type === 'client' && (
                        <div>
                          <label htmlFor="address" className="block text-sm font-medium mb-1">
                            Street Address
                          </label>
                          <input
                            id="address"
                            name="address"
                            type="text"
                            className="w-full px-3 py-2 border rounded-md"
                            value={formData.address}
                            onChange={handleInputChange}
                          />
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="city" className="block text-sm font-medium mb-1">
                            City
                          </label>
                          <input
                            id="city"
                            name="city"
                            type="text"
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
                            id="state"
                            name="state"
                            type="text"
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
                            id="postal_code"
                            name="postal_code"
                            type="text"
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
                            id="country"
                            name="country"
                            type="text"
                            className="w-full px-3 py-2 border rounded-md"
                            value={formData.country}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </>
                  )}
                  
                  <div className="mt-6 flex justify-end">
                    <Button onClick={saveProfile} disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="security" className="p-6">
                <h2 className="text-xl font-semibold mb-6">Security Settings</h2>
                
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <Key className="h-4 w-4 mr-2" />
                    Change Password
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium mb-1">
                        Current Password
                      </label>
                      <input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        className="w-full px-3 py-2 border rounded-md"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium mb-1">
                        New Password
                      </label>
                      <input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        className="w-full px-3 py-2 border rounded-md"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                        Confirm New Password
                      </label>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        className="w-full px-3 py-2 border rounded-md"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                      />
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <Button onClick={changePassword} disabled={isSaving}>
                        {isSaving ? 'Updating...' : 'Update Password'}
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
                  <h3 className="text-lg font-medium mb-4">Account Management</h3>
                  
                  <div className="space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      Download Personal Data
                    </Button>
                    
                    <Button variant="destructive" className="w-full justify-start">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}