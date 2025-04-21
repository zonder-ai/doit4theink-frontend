"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { User, Users, PenTool, Store, ArrowRight, Paintbrush } from 'lucide-react'

export default function ProfileCreatePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultType = searchParams.get('type')
  
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<'client' | 'artist' | 'studio' | null>(
    defaultType === 'client' || defaultType === 'artist' || defaultType === 'studio' 
      ? defaultType 
      : null
  )
  
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
        
        // Check if user already has a profile
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', user.id)
          .single()
        
        if (existingProfile?.user_type) {
          // User already has a profile, check if they have completed the profile creation
          if (existingProfile.user_type === 'client') {
            const { data: clientProfile } = await supabase
              .from('client_profiles')
              .select('id')
              .eq('id', user.id)
              .single()
            
            if (clientProfile) {
              // Client profile exists, redirect to dashboard
              router.push('/dashboard')
              return
            }
          } else if (existingProfile.user_type === 'artist') {
            const { data: artistProfile } = await supabase
              .from('artist_profiles')
              .select('id')
              .eq('id', user.id)
              .single()
            
            if (artistProfile) {
              // Artist profile exists, redirect to dashboard
              router.push('/dashboard')
              return
            }
          }
          
          // If we reach here, the user has a partial profile, we can allow them to continue
          // by updating their existing profile type
          setSelectedType(existingProfile.user_type as any)
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuth()
  }, [router])
  
  const handleContinue = async () => {
    if (!selectedType || !user) return
    
    try {
      // Update or create the user's profile with the selected type
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          user_type: selectedType,
          updated_at: new Date().toISOString()
        })
      
      if (error) throw error
      
      // Redirect to the specific profile creation form
      router.push(`/profile/create/${selectedType}`)
    } catch (error) {
      console.error('Error updating profile type:', error)
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
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Create Your Profile</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Select the type of profile you want to create to get started.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Client Profile Option */}
          <div
            className={`border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer ${
              selectedType === 'client' ? 'border-primary bg-primary/5 dark:bg-primary/10' : ''
            }`}
            onClick={() => setSelectedType('client')}
          >
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-center mb-2">Client</h2>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
              Create a client profile to book appointments and save your favorite designs.
            </p>
            <div className="space-y-2">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-sm">Browse artists and designs</span>
              </div>
              <div className="flex items-center">
                <PenTool className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-sm">Book tattoo appointments</span>
              </div>
              <div className="flex items-center">
                <Paintbrush className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-sm">Save favorite designs</span>
              </div>
            </div>
          </div>
          
          {/* Artist Profile Option */}
          <div
            className={`border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer ${
              selectedType === 'artist' ? 'border-primary bg-primary/5 dark:bg-primary/10' : ''
            }`}
            onClick={() => setSelectedType('artist')}
          >
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <Paintbrush className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-center mb-2">Artist</h2>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
              Create an artist profile to showcase your work and manage bookings.
            </p>
            <div className="space-y-2">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-sm">Attract new clients</span>
              </div>
              <div className="flex items-center">
                <PenTool className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-sm">Upload your design portfolio</span>
              </div>
              <div className="flex items-center">
                <Paintbrush className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-sm">Manage appointments</span>
              </div>
            </div>
          </div>
          
          {/* Studio Profile Option */}
          <div
            className={`border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer ${
              selectedType === 'studio' ? 'border-primary bg-primary/5 dark:bg-primary/10' : ''
            }`}
            onClick={() => setSelectedType('studio')}
          >
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Store className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-center mb-2">Studio</h2>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
              Create a studio profile to manage your business and artists.
            </p>
            <div className="space-y-2">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-sm">Manage multiple artists</span>
              </div>
              <div className="flex items-center">
                <PenTool className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-sm">Showcase your studio</span>
              </div>
              <div className="flex items-center">
                <Paintbrush className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-sm">Centralize booking management</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Button 
            size="lg" 
            onClick={handleContinue} 
            disabled={!selectedType}
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  )
}