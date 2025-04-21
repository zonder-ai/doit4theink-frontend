"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

// Form schema for client profile
const clientFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  bio: z.string().max(500, {
    message: "Bio cannot be more than 500 characters.",
  }).optional(),
  phone: z.string().min(10, {
    message: "Please enter a valid phone number.",
  }).optional(),
  location: z.string().min(2, {
    message: "Please enter a valid location.",
  }).optional(),
  style_preferences: z.string().max(200, {
    message: "Style preferences cannot be more than 200 characters.",
  }).optional(),
  notification_preferences: z.object({
    email: z.boolean().default(true),
    sms: z.boolean().default(false),
    app: z.boolean().default(true),
  }),
})

type ClientFormValues = z.infer<typeof clientFormSchema>

export default function ClientProfileCreatePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  
  // Initialize form with default values
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: '',
      bio: '',
      phone: '',
      location: '',
      style_preferences: '',
      notification_preferences: {
        email: true,
        sms: false,
        app: true,
      },
    },
  })

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true)
      
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          // Not authenticated, redirect to sign in
          router.push('/auth/signin?redirect=/profile/create/client')
          return
        }
        
        setUser(user)
        
        // Check if user profile exists and has the correct type
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (!profile) {
          // No profile, redirect to profile type selection
          router.push('/profile/create')
          return
        }
        
        if (profile.user_type !== 'client') {
          // Wrong profile type, redirect to profile type selection
          router.push('/profile/create?type=' + profile.user_type)
          return
        }
        
        // Check if client profile already exists
        const { data: clientProfile } = await supabase
          .from('client_profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (clientProfile) {
          // Pre-fill form with existing data
          form.reset({
            name: clientProfile.name || '',
            bio: clientProfile.bio || '',
            phone: clientProfile.phone || '',
            location: clientProfile.location || '',
            style_preferences: clientProfile.style_preferences || '',
            notification_preferences: {
              email: clientProfile.notification_email || true,
              sms: clientProfile.notification_sms || false,
              app: clientProfile.notification_app || true,
            },
          })
        } else if (profile.full_name) {
          // Use name from auth profile if available
          form.setValue('name', profile.full_name)
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuth()
  }, [router, form])

  const onSubmit = async (data: ClientFormValues) => {
    if (!user) return
    
    setIsSaving(true)
    
    try {
      // Update client profile
      const { error } = await supabase
        .from('client_profiles')
        .upsert({
          id: user.id,
          name: data.name,
          bio: data.bio || null,
          phone: data.phone || null,
          location: data.location || null,
          style_preferences: data.style_preferences || null,
          notification_email: data.notification_preferences.email,
          notification_sms: data.notification_preferences.sms,
          notification_app: data.notification_preferences.app,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      
      if (error) throw error
      
      // Update the main profile
      await supabase
        .from('profiles')
        .update({
          full_name: data.name,
          profile_complete: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
      
      toast({
        title: "Profile saved!",
        description: "Your client profile has been created successfully.",
      })
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Error saving profile:', error)
      toast({
        title: "Error saving profile",
        description: error.message || "Something went wrong. Please try again.",
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
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/profile/create">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to profile type selection
            </Link>
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Create Your Client Profile</CardTitle>
            <CardDescription>
              Fill in the details below to complete your client profile. This information will help
              artists understand your preferences and communicate with you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
                      </FormControl>
                      <FormDescription>
                        This is how artists will address you.
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
                          placeholder="Tell us a bit about yourself and your tattoo journey..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Share a bit about yourself and your tattoo interests.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Your phone number" {...field} />
                        </FormControl>
                        <FormDescription>
                          For booking confirmations and updates.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="City, State" {...field} />
                        </FormControl>
                        <FormDescription>
                          To find artists and studios near you.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="style_preferences"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Style Preferences</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Traditional, Minimalist, Japanese, Blackwork" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        What tattoo styles are you interested in?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Notification Preferences</h3>
                  <FormField
                    control={form.control}
                    name="notification_preferences.email"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Email Notifications</FormLabel>
                          <FormDescription>
                            Receive booking updates and new design alerts via email.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="notification_preferences.sms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>SMS Notifications</FormLabel>
                          <FormDescription>
                            Receive booking reminders and updates via text message.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="notification_preferences.app"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>In-App Notifications</FormLabel>
                          <FormDescription>
                            Receive notifications within the app.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
            </Form>
          </CardContent>
          <CardFooter className="flex justify-between border-t px-6 py-4">
            <p className="text-sm text-gray-500">
              You can edit this information later from your profile settings.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
