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