"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ArrowLeft, Save, Link as LinkIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/components/ui/use-toast'
import { Checkbox } from '@/components/ui/checkbox'

// Define form validation schema
const artistProfileSchema = z.object({
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  phone: z.string().optional(),
  artistName: z.string().min(2, {
    message: "Artist name must be at least 2 characters.",
  }),
  bio: z.string().optional(),
  yearsExperience: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
  portfolioUrl: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal('')),
  instagramHandle: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  isIndependent: z.boolean().default(true),
  availabilityNotice: z.string().optional(),
})

type ArtistProfileFormValues = z.infer<typeof artistProfileSchema>

export default function ArtistProfileCreatePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  
  // Initialize the form
  const form = useForm<ArtistProfileFormValues>({
    resolver: zodResolver(artistProfileSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      artistName: '',
      bio: '',
      yearsExperience: undefined,
      portfolioUrl: '',
      instagramHandle: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      isIndependent: true,
      availabilityNotice: '',
    },
  })
  
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
          .select('user_type, full_name, phone')
          .eq('id', user.id)
          .single()
        
        if (existingProfile) {
          // Pre-fill form with existing profile data if available
          form.setValue('fullName', existingProfile.full_name || '')
          form.setValue('phone', existingProfile.phone || '')
          
          // Verify this is an artist profile
          if (existingProfile.user_type !== 'artist') {
            // Wrong profile type, redirect to profile creation
            router.push('/profile/create')
            return
          }
          
          // Check if artist profile already exists
          const { data: artistProfile } = await supabase
            .from('artist_profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          
          if (artistProfile) {
            // Pre-fill form with artist profile data
            form.setValue('artistName', artistProfile.artist_name || '')
            form.setValue('bio', artistProfile.bio || '')
            form.setValue('yearsExperience', artistProfile.years_experience?.toString() || '')
            form.setValue('portfolioUrl', artistProfile.portfolio_url || '')
            form.setValue('instagramHandle', artistProfile.instagram_handle || '')
            form.setValue('city', artistProfile.city || '')
            form.setValue('state', artistProfile.state || '')
            form.setValue('postalCode', artistProfile.postal_code || '')
            form.setValue('country', artistProfile.country || '')
            form.setValue('isIndependent', artistProfile.is_independent ?? true)
            form.setValue('availabilityNotice', artistProfile.availability_notice || '')
          }
        } else {
          // No profile found, redirect to initial profile creation
          router.push('/profile/create')
          return
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuth()
  }, [router, form])
  
  const onSubmit = async (values: ArtistProfileFormValues) => {
    if (!user) return
    
    setIsSaving(true)
    
    try {
      // Update the base profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: values.fullName,
          phone: values.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
      
      if (profileError) throw profileError
      
      // Update or create the artist profile
      const { error: artistProfileError } = await supabase
        .from('artist_profiles')
        .upsert({
          id: user.id,
          artist_name: values.artistName,
          bio: values.bio,
          years_experience: values.yearsExperience,
          portfolio_url: values.portfolioUrl,
          instagram_handle: values.instagramHandle,
          city: values.city,
          state: values.state,
          postal_code: values.postalCode,
          country: values.country,
          is_independent: values.isIndependent,
          availability_notice: values.availabilityNotice,
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        })
      
      if (artistProfileError) throw artistProfileError
      
      toast({
        title: "Profile created!",
        description: "Your artist profile has been successfully created.",
      })
      
      // Redirect to the dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving profile:', error)
      toast({
        title: "Error",
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
          <Link href="/profile/create">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Create Artist Profile</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Set up your artist profile to showcase your work and accept bookings.
        </p>
      </div>
      
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-950 rounded-lg border shadow-sm p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
              
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your legal name for account and payment purposes
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your phone number (optional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <h2 className="text-xl font-semibold pt-4 mb-4">Artist Information</h2>
              
              <FormField
                control={form.control}
                name="artistName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Artist Name / Pseudonym</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your artist name" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is how clients will see you on the platform
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell clients about yourself and your style (optional)"
                        {...field}
                        className="min-h-[120px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="yearsExperience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years of Experience</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Years (optional)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isIndependent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mt-8">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Independent Artist</FormLabel>
                        <FormDescription>
                          Check if you're not affiliated with a studio
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="portfolioUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Portfolio Website</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 border border-r-0 rounded-l-md bg-gray-50 dark:bg-gray-800 text-gray-500">
                            <LinkIcon className="h-4 w-4" />
                          </span>
                          <Input
                            placeholder="https://yourportfolio.com"
                            className="rounded-l-none"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="instagramHandle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram Handle</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 border border-r-0 rounded-l-md bg-gray-50 dark:bg-gray-800 text-gray-500">
                            @
                          </span>
                          <Input
                            placeholder="yourusername"
                            className="rounded-l-none"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="availabilityNotice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Availability Notice</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any special notes about your availability (optional)"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Let clients know about your typical schedule or any limitations
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <h2 className="text-xl font-semibold pt-4 mb-4">Location Information</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="City (optional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State/Province</FormLabel>
                      <FormControl>
                        <Input placeholder="State/Province (optional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Postal code (optional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="Country (optional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
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
          </Form>
        </div>
      </div>
    </div>
  )
}
