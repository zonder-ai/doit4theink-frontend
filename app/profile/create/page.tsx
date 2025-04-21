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
        // Create studio
        const { data: studio, error: studioError } = await supabase
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
          .single()
        
        if (studioError) throw studioError
        
        // Create artist profile for studio owner
        const { error: artistError } = await supabase
          .from('artist_profiles')
          .insert({
            id: user.id,
            artist_name: artistName || fullName,
            city,
            state,
            postal_code: postalCode,
            country,
            is_independent: false,
            primary_studio_id: studio.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        
        if (artistError) throw artistError
        
        // Connect artist to studio
        const { error: studioArtistError } = await supabase
          .from('studio_artists')
          .insert({
            studio_id: studio.id,
            artist_id: user.id,
            role: 'Owner',
            is_active: true,
            start_date: new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        
        if (studioArtistError) throw studioArtistError
      }
      
      toast({
        title: 'Profile Created',
        description: 'Your profile has been successfully created.',
      })
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Error creating profile:', error)
      toast({
        title: 'Error',
        description: 'Failed to create profile. Please try again later.',
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
          <Link href="/">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <h1 className="text-3xl font-bold mb-2">Create Your Profile</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Set up your account to start using DoIt4TheInk
        </p>
      </div>
      
      <div className="max-w-3xl mx-auto">
        {/* Account Type Selection */}
        <div className="bg-white dark:bg-gray-950 rounded-lg border shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Account Type</h2>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            Select the type of account you want to create:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              className={`p-4 rounded-lg border text-left flex items-start ${
                accountType === 'client'
                  ? 'border-primary bg-primary/5'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-900'
              }`}
              onClick={() => setAccountType('client')}
            >
              <Home className={`mr-3 h-6 w-6 ${
                accountType === 'client' ? 'text-primary' : 'text-gray-400'
              }`} />
              <div>
                <h3 className="font-medium">Client</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Book appointments with tattoo artists
                </p>
              </div>
            </button>
            
            <button
              type="button"
              className={`p-4 rounded-lg border text-left flex items-start ${
                accountType === 'artist'
                  ? 'border-primary bg-primary/5'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-900'
              }`}
              onClick={() => setAccountType('artist')}
            >
              <PencilRuler className={`mr-3 h-6 w-6 ${
                accountType === 'artist' ? 'text-primary' : 'text-gray-400'
              }`} />
              <div>
                <h3 className="font-medium">Artist</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Showcase your work and take bookings
                </p>
              </div>
            </button>
            
            <button
              type="button"
              className={`p-4 rounded-lg border text-left flex items-start ${
                accountType === 'studio'
                  ? 'border-primary bg-primary/5'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-900'
              }`}
              onClick={() => setAccountType('studio')}
            >
              <Building className={`mr-3 h-6 w-6 ${
                accountType === 'studio' ? 'text-primary' : 'text-gray-400'
              }`} />
              <div>
                <h3 className="font-medium">Studio</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage your tattoo studio and artists
                </p>
              </div>
            </button>
          </div>
        </div>
        
        {/* Profile Form */}
        <div className="bg-white dark:bg-gray-950 rounded-lg border shadow-sm p-6">
          <form onSubmit={handleSubmit}>
            <h2 className="text-xl font-semibold mb-6">
              {accountType === 'client' ? 'Client Information' :
               accountType === 'artist' ? 'Artist Information' :
               'Studio Information'}
            </h2>
            
            {/* Basic Information */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Personal Information</h3>
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
            {accountType === 'artist' && (
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
            
            {/* Studio-specific fields */}
            {accountType === 'studio' && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">Studio Information</h3>
                <div className="mb-4">
                  <label htmlFor="studioName" className="block text-sm font-medium mb-1">
                    Studio Name
                  </label>
                  <input
                    id="studioName"
                    type="text"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={studioName}
                    onChange={(e) => setStudioName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="studioDescription" className="block text-sm font-medium mb-1">
                    Studio Description
                  </label>
                  <textarea
                    id="studioDescription"
                    rows={4}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={studioDescription}
                    onChange={(e) => setStudioDescription(e.target.value)}
                  ></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="studioEmail" className="block text-sm font-medium mb-1">
                      Studio Email
                    </label>
                    <input
                      id="studioEmail"
                      type="email"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={studioEmail}
                      onChange={(e) => setStudioEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="studioPhone" className="block text-sm font-medium mb-1">
                      Studio Phone
                    </label>
                    <input
                      id="studioPhone"
                      type="tel"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={studioPhone}
                      onChange={(e) => setStudioPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="studioWebsite" className="block text-sm font-medium mb-1">
                      Website
                    </label>
                    <input
                      id="studioWebsite"
                      type="url"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={studioWebsite}
                      onChange={(e) => setStudioWebsite(e.target.value)}
                      placeholder="https://yourstudio.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="studioInstagram" className="block text-sm font-medium mb-1">
                      Instagram Handle
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500">@</span>
                      <input
                        id="studioInstagram"
                        type="text"
                        className="w-full pl-7 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        value={studioInstagram}
                        onChange={(e) => setStudioInstagram(e.target.value)}
                        placeholder="yourstudio"
                      />
                    </div>
                  </div>
                </div>
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-900 dark:text-yellow-100">
                  <p>
                    <strong>Note:</strong> As the studio owner, you will also need to provide your personal information as an artist associated with this studio.
                  </p>
                </div>
              </div>
            )}
            
            {/* Address */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">
                {accountType === 'studio' ? 'Studio Address' : 'Address'}
              </h3>
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
                  required={accountType === 'studio'}
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
                    required={accountType === 'studio'}
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
                    required={accountType === 'studio'}
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
                    required={accountType === 'studio'}
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
                    required={accountType === 'studio'}
                  />
                </div>
              </div>
            </div>
            
            {/* Terms acceptance */}
            <div className="mb-6">
              <div className="flex items-start">
                <input
                  id="terms"
                  type="checkbox"
                  className="mt-1"
                  required
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  I agree to the <Link href="/terms" className="text-primary hover:text-primary/80">Terms of Service</Link> and <Link href="/privacy" className="text-primary hover:text-primary/80">Privacy Policy</Link>.
                  {accountType !== 'client' && ' I also accept the platform commission fees for bookings made through DoIt4TheInk.'}
                </label>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating Profile...
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
    </div>
  )
}