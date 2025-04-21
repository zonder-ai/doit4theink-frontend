"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ArrowLeft, Save } from 'lucide-react'
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

// Define form validation schema
const clientProfileSchema = z.object({
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
})

type ClientProfileFormValues = z.infer<typeof clientProfileSchema>

export default function ClientProfileCreatePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  
  // Initialize the form
  const form = useForm<ClientProfileFormValues>({
    resolver: zodResolver(clientProfileSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
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
          
          // Verify this is a client profile
          if (existingProfile.user_type !== 'client') {
            // Wrong profile type, redirect to profile creation
            router.push('/profile/create')
            return
          }
          
          // Check if client profile already exists
          const { data: clientProfile } = await supabase
            .from('client_profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          
          if (clientProfile) {
            // Pre-fill form with client profile data
            form.setValue('address', clientProfile.address || '')
            form.setValue('city', clientProfile.city || '')
            form.setValue('state', clientProfile.state || '')
            form.setValue('postalCode', clientProfile.postal_code || '')
            form.setValue('country', clientProfile.country || '')
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
  
  const onSubmit = async (values: ClientProfileFormValues) => {
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
      
      // Update or create the client profile
      const { error: clientProfileError } = await supabase
        .from('client_profiles')
        .upsert({
          id: user.id,
          address: values.address,
          city: values.city,
          state: values.state,
          postal_code: values.postalCode,
          country: values.country,
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        })
      
      if (clientProfileError) throw clientProfileError
      
      toast({
        title: "Profile created!",
        description: "Your client profile has been successfully created.",
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
        <h1 className="text-3xl font-bold">Create Client Profile</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Set up your client profile to browse and book tattoo designs.
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
                    <FormDescription>
                      Used to contact you about your appointments
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <h2 className="text-xl font-semibold pt-4 mb-4">Address Information</h2>
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter your street address (optional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
