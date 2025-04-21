"use client"
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Save, PencilRuler, Home, Building } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function CreateProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const typeParam = searchParams.get('type')

  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [accountType, setAccountType] = useState<'client' | 'artist' | 'studio'>(
    typeParam === 'artist' ? 'artist' :
    typeParam === 'studio' ? 'studio' :
    'client'
  )

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

  // Studio-specific state
  const [studioName, setStudioName] = useState('')
  const [studioDescription, setStudioDescription] = useState('')
  const [studioEmail, setStudioEmail] = useState('')
  const [studioPhone, setStudioPhone] = useState('')
  const [studioWebsite, setStudioWebsite] = useState('')
  const [studioInstagram, setStudioInstagram] = useState('')

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

        // Check if profile already exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', user.id)
          .single()

        if (existingProfile?.user_type) {
          // Profile already exists, redirect to edit page
          router.push('/profile')
          return
        }

        // Pre-fill email in studio form if it's a new user
        setStudioEmail(user.email || '')
      } catch (error) {
        console.error('Error checking auth:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      if (!user) return

      // Create base profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          full_name: fullName,
          phone,
          email: user.email,
          user_type: accountType,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

      if (profileError) throw profileError

      // Create specific profile type
      if (accountType === 'client') {
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
            updated_at: new Date().toISOString(),
          })

        if (clientError) throw clientError
      } else if (accountType === 'artist') {
        const { error: artistError } = await supabase
          .from('artist_profiles')
          .insert({
            id: user.id,
            bio,
            years_experience: yearsExperience,
            portfolio_url: portfolioUrl,
            instagram_handle: instagramHandle,
            artist_name: artistName,
            city,
            state,
            postal_code: postalCode,
            country,
            is_independent: true, // Default to independent artist
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

        if (artistError) throw artistError
      } else if (accountType === 'studio') {
        // Create the studio record
        const { data: studioData, error: studioError } = await supabase
          .from('studios')
          .insert({
            name: studioName,
            description: studioDescription,
            address,
            city,
            state,
            postal_code: postalCode,
            country,
            contact_email: studioEmail,
            contact_phone: studioPhone,
            website: studioWebsite,
            instagram_handle: studioInstagram,
            created_by: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()

        if (studioError) throw studioError
      }

      // Success! Redirect to dashboard
      toast({
        title: "Profile created!",
        description: "Your profile has been successfully created.",
      })
      
      router.push('/dashboard')
    } catch (error) {
      console.error('Error creating profile:', error)
      toast({
        title: "Error creating profile",
        description: "There was a problem creating your profile. Please try again.",
        variant: "destructive",
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
          <Link href="/">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <h1 className="text-3xl font-bold mb-2">Create Your Profile</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Tell us a bit about yourself to get started.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <button
          className={`flex flex-col items-center p-6 rounded-lg border ${
            accountType === 'client'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900'
          }`}
          onClick={() => setAccountType('client')}
        >
          <Home className="h-12 w-12 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Client</h2>
          <p className="text-center text-sm">
            I want to discover and book tattoo artists.
          </p>
        </button>

        <button
          className={`flex flex-col items-center p-6 rounded-lg border ${
            accountType === 'artist'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900'
          }`}
          onClick={() => setAccountType('artist')}
        >
          <PencilRuler className="h-12 w-12 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Artist</h2>
          <p className="text-center text-sm">
            I am a tattoo artist looking to showcase my work and accept bookings.
          </p>
        </button>

        <button
          className={`flex flex-col items-center p-6 rounded-lg border ${
            accountType === 'studio'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900'
          }`}
          onClick={() => setAccountType('studio')}
        >
          <Building className="h-12 w-12 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Studio</h2>
          <p className="text-center text-sm">
            I own/manage a tattoo studio with multiple artists.
          </p>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-950 rounded-lg border shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">
          {accountType === 'client'
            ? 'Client Profile Information'
            : accountType === 'artist'
            ? 'Artist Profile Information'
            : 'Studio Profile Information'}
        </h2>

        {/* Common fields for all profile types */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium mb-2">
              {accountType === 'studio' ? 'Owner\'s Full Name' : 'Full Name'}
            </label>
            <input
              id="fullName"
              type="text"
              className="w-full px-3 py-2 border rounded-md"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-2">
              {accountType === 'studio' ? 'Owner\'s Phone' : 'Phone'}
            </label>
            <input
              id="phone"
              type="tel"
              className="w-full px-3 py-2 border rounded-md"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        {/* Studio-specific fields */}
        {accountType === 'studio' && (
          <div className="mb-6 border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Studio Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="studioName" className="block text-sm font-medium mb-2">
                  Studio Name
                </label>
                <input
                  id="studioName"
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  value={studioName}
                  onChange={(e) => setStudioName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="studioEmail" className="block text-sm font-medium mb-2">
                  Studio Email
                </label>
                <input
                  id="studioEmail"
                  type="email"
                  className="w-full px-3 py-2 border rounded-md"
                  value={studioEmail}
                  onChange={(e) => setStudioEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="studioPhone" className="block text-sm font-medium mb-2">
                  Studio Phone
                </label>
                <input
                  id="studioPhone"
                  type="tel"
                  className="w-full px-3 py-2 border rounded-md"
                  value={studioPhone}
                  onChange={(e) => setStudioPhone(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="studioWebsite" className="block text-sm font-medium mb-2">
                  Website (Optional)
                </label>
                <input
                  id="studioWebsite"
                  type="url"
                  className="w-full px-3 py-2 border rounded-md"
                  value={studioWebsite}
                  onChange={(e) => setStudioWebsite(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label htmlFor="studioInstagram" className="block text-sm font-medium mb-2">
                  Instagram Handle (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">@</span>
                  <input
                    id="studioInstagram"
                    type="text"
                    className="w-full pl-7 pr-3 py-2 border rounded-md"
                    value={studioInstagram}
                    onChange={(e) => setStudioInstagram(e.target.value)}
                    placeholder="yourstudio"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="studioDescription" className="block text-sm font-medium mb-2">
                  Studio Description
                </label>
                <textarea
                  id="studioDescription"
                  className="w-full px-3 py-2 border rounded-md"
                  rows={4}
                  value={studioDescription}
                  onChange={(e) => setStudioDescription(e.target.value)}
                  required
                ></textarea>
              </div>
            </div>
          </div>
        )}