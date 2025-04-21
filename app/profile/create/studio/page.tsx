"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ArrowLeft, Save, Link as LinkIcon, Building2, Upload } from 'lucide-react'
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
const studioProfileSchema = z.object({
  name: z.string().min(2, {
    message: "Studio name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  address: z.string().min(5, {
    message: "Please enter a valid address.",
  }),
  city: z.string().min(2, {
    message: "City is required.",
  }),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().min(2, {
    message: "Country is required.",
  }),
  contactEmail: z.string().email({
    message: "Please enter a valid email address.",
  }),
  contactPhone: z.string().optional(),
  website: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal('')),
  instagramHandle: z.string().optional(),
})

type StudioProfileFormValues = z.infer<typeof studioProfileSchema>

export default function StudioProfileCreatePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  
  // Initialize the form
  const form = useForm<StudioProfileFormValues>({
    resolver: zodResolver(studioProfileSchema),
    defaultValues: {
      name: '',
      description: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      contactEmail: '',
      contactPhone: '',
      website: '',
      instagramHandle: '',
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
          .select('user_type')
          .eq('id', user.id)
          .single()
        
        if (existingProfile) {
          // Verify this is a studio profile
          if (existingProfile.user_type !== 'studio') {
            // Wrong profile type, redirect to profile creation
            router.push('/profile/create')
            return
          }
          
          // Check if studio profile already exists
          const { data: studios } = await supabase
            .from('studios')
            .select('*')
            .eq('created_by', user.id)
          
          if (studios && studios.length > 0) {
            const studio = studios[0]
            
            // Pre-fill form with studio data
            form.setValue('name', studio.name || '')
            form.setValue('description', studio.description || '')
            form.setValue('address', studio.address || '')
            form.setValue('city', studio.city || '')
            form.setValue('state', studio.state || '')
            form.setValue('postalCode', studio.postal_code || '')
            form.setValue('country', studio.country || '')
            form.setValue('contactEmail', studio.contact_email || '')
            form.setValue('contactPhone', studio.contact_phone || '')
            form.setValue('website', studio.website || '')
            form.setValue('instagramHandle', studio.instagram_handle || '')
            
            // Set logo and banner previews if available
            if (studio.logo_url) {
              setLogoPreview(studio.logo_url)
            }
            
            if (studio.banner_url) {
              setBannerPreview(studio.banner_url)
            }
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
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return
    }
    
    const file = e.target.files[0]
    setLogoFile(file)
    
    // Create a preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }
  
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return
    }
    
    const file = e.target.files[0]
    setBannerFile(file)
    
    // Create a preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setBannerPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }
  
  const uploadImage = async (file: File, path: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const filePath = `${path}/${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('studios')
        .upload(filePath, file)
      
      if (uploadError) {
        throw uploadError
      }
      
      // Get public URL
      const { data } = supabase.storage.from('studios').getPublicUrl(filePath)
      
      return data.publicUrl
    } catch (error) {
      console.error(`Error uploading ${path}:`, error)
      toast({
        title: "Upload Failed",
        description: `Failed to upload ${path}. Please try again.`,
        variant: "destructive",
      })
      return null
    }
  }
  
  const onSubmit = async (values: StudioProfileFormValues) => {
    if (!user) return
    
    setIsSaving(true)
    
    try {
      let logoUrl = null
      let bannerUrl = null
      
      // Upload logo if changed
      if (logoFile) {
        logoUrl = await uploadImage(logoFile, 'logos')
      }
      
      // Upload banner if changed
      if (bannerFile) {
        bannerUrl = await uploadImage(bannerFile, 'banners')
      }
      
      // Create or update the studio
      const { data: existingStudios } = await supabase
        .from('studios')
        .select('id')
        .eq('created_by', user.id)
      
      const studioData = {
        name: values.name,
        description: values.description,
        address: values.address,
        city: values.city,
        state: values.state,
        postal_code: values.postalCode,
        country: values.country,
        contact_email: values.contactEmail,
        contact_phone: values.contactPhone,
        website: values.website,
        instagram_handle: values.instagramHandle,
        updated_at: new Date().toISOString(),
        created_by: user.id,
      }
      
      // Add logo and banner URLs only if they were uploaded or already existed
      if (logoUrl || logoPreview) {
        Object.assign(studioData, { logo_url: logoUrl || logoPreview })
      }
      
      if (bannerUrl || bannerPreview) {
        Object.assign(studioData, { banner_url: bannerUrl || bannerPreview })
      }
      
      let studioId
      
      if (existingStudios && existingStudios.length > 0) {
        // Update existing studio
        const { error, data } = await supabase
          .from('studios')
          .update(studioData)
          .eq('id', existingStudios[0].id)
          .select()
        
        if (error) throw error
        
        studioId = existingStudios[0].id
      } else {
        // Create new studio
        const { error, data } = await supabase
          .from('studios')
          .insert({
            ...studioData,
            created_at: new Date().toISOString(),
          })
          .select()
        
        if (error) throw error
        
        if (data && data.length > 0) {
          studioId = data[0].id
        }
      }
      
      toast({
        title: "Studio Profile Created!",
        description: "Your studio profile has been successfully created.",
      })
      
      // Redirect to the dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving studio profile:', error)
      toast({
        title: "Error",
        description: "There was a problem creating your studio profile. Please try again.",
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
        <h1 className="text-3xl font-bold">Create Studio Profile</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Set up your tattoo studio profile to showcase your business and artists.
        </p>
      </div>
      
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-950 rounded-lg border shadow-sm p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Studio Information</h2>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Studio Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your studio name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell clients about your studio (optional)"
                        {...field}
                        className="min-h-[120px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logo Upload */}
                <div>
                  <h3 className="block text-sm font-medium mb-2">Studio Logo</h3>
                  <div className="border rounded-md p-4">
                    <div className="flex items-center justify-center mb-4">
                      {logoPreview ? (
                        <div className="relative w-32 h-32 bg-gray-100 rounded-md overflow-hidden">
                          <img
                            src={logoPreview}
                            alt="Studio Logo Preview"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-md flex flex-col items-center justify-center text-gray-500">
                          <Building2 className="w-10 h-10 mb-2" />
                          <span className="text-xs">No logo</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="logo-upload"
                        className="flex items-center justify-center w-full px-4 py-2 text-sm border border-gray-300 rounded-md cursor-pointer bg-white hover:bg-gray-50 focus:outline-none dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {logoPreview ? "Change Logo" : "Upload Logo"}
                      </label>
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoChange}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Recommended size: 500x500px
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Banner Upload */}
                <div>
                  <h3 className="block text-sm font-medium mb-2">Studio Banner</h3>
                  <div className="border rounded-md p-4">
                    <div className="flex items-center justify-center mb-4">
                      {bannerPreview ? (
                        <div className="relative w-full h-32 bg-gray-100 rounded-md overflow-hidden">
                          <img
                            src={bannerPreview}
                            alt="Studio Banner Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-md flex flex-col items-center justify-center text-gray-500">
                          <Building2 className="w-10 h-10 mb-2" />
                          <span className="text-xs">No banner</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="banner-upload"
                        className="flex items-center justify-center w-full px-4 py-2 text-sm border border-gray-300 rounded-md cursor-pointer bg-white hover:bg-gray-50 focus:outline-none dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {bannerPreview ? "Change Banner" : "Upload Banner"}
                      </label>
                      <input
                        id="banner-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleBannerChange}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Recommended size: 1200x400px
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <h2 className="text-xl font-semibold pt-4 mb-4">Contact Information</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input placeholder="studio@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone number (optional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 border border-r-0 rounded-l-md bg-gray-50 dark:bg-gray-800 text-gray-500">
                            <LinkIcon className="h-4 w-4" />
                          </span>
                          <Input
                            placeholder="https://yourstudio.com"
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
                            placeholder="yourstudio"
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
              
              <h2 className="text-xl font-semibold pt-4 mb-4">Studio Location</h2>
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your studio address" {...field} />
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
                        <Input placeholder="City" {...field} />
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
                        <Input placeholder="Country" {...field} />
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
                      Create Studio
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
