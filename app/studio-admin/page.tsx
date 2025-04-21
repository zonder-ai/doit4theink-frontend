"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
  ClipboardList, 
  Users, 
  PaintBucket, 
  Calendar, 
  BarChart3, 
  Settings, 
  Plus,
  ChevronRight,
  Edit,
  MapPin,
  Phone,
  Mail
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { supabase } from '@/lib/supabase'
import { getInitials } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

export default function StudioAdminPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [studio, setStudio] = useState<any>(null)
  const [studioArtists, setStudioArtists] = useState<any[]>([])
  const [studioDesigns, setStudioDesigns] = useState<any[]>([])
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('dashboard')
  
  useEffect(() => {
    const getStudioData = async () => {
      setIsLoading(true)
      
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          // Not authenticated, redirect to sign in
          router.push('/auth/signin?redirect=/studio-admin')
          return
        }
        
        setUser(user)
        
        // Fetch user's profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (!profileData || profileData.user_type !== 'studio') {
          // Not a studio owner, redirect to dashboard
          toast({
            title: 'Access Denied',
            description: 'You need a studio account to access this page.',
            variant: 'destructive',
          })
          router.push('/dashboard')
          return
        }
        
        // Fetch studio data
        const { data: studioData } = await supabase
          .from('studios')
          .select('*')
          .eq('created_by', user.id)
          .single()
        
        if (!studioData) {
          // No studio found, redirect to create studio page
          router.push('/studio-admin/create')
          return
        }
        
        setStudio(studioData)
        
        // Fetch studio artists
        const { data: artistsData } = await supabase
          .from('studio_artists')
          .select(`
            *,
            artist_profiles(*)
          `)
          .eq('studio_id', studioData.id)
          .order('start_date', { ascending: false })
        
        setStudioArtists(artistsData || [])
        
        // Fetch studio designs
        const { data: designsData } = await supabase
          .from('designs')
          .select(`
            *,
            artist_profiles!designs_artist_id_fkey(*),
            design_images(*)
          `)
          .eq('studio_id', studioData.id)
          .order('created_at', { ascending: false })
          .limit(5)
        
        setStudioDesigns(designsData || [])
        
        // Fetch upcoming bookings
        const today = new Date().toISOString().split('T')[0]
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select(`
            *,
            client_profiles:client_id(
              *,
              profiles(*)
            ),
            artist_profiles!bookings_artist_id_fkey(*),
            designs(*)
          `)
          .eq('studio_id', studioData.id)
          .gte('booking_date', today)
          .in('status', ['pending', 'confirmed'])
          .order('booking_date', { ascending: true })
          .order('start_time', { ascending: true })
          .limit(5)
        
        setUpcomingBookings(bookingsData || [])
        
      } catch (error) {
        console.error('Error loading studio data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load studio data. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    getStudioData()
  }, [router, toast])
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }
  
  if (!user || !studio) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Studio not found</h1>
        <p className="mb-6">You need to create a studio to access this page.</p>
        <Button asChild>
          <Link href="/studio-admin/create">Create Studio</Link>
        </Button>
      </div>
    )
  }
  
  const SideNavItem = ({ icon: Icon, label, active, href }: { icon: any, label: string, active: boolean, href: string }) => (
    <Link
      href={href}
      className={`flex items-center px-4 py-3 rounded-md ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-gray-100 dark:hover:bg-gray-900'
      }`}
    >
      <Icon className="mr-3 h-5 w-5" />
      <span>{label}</span>
    </Link>
  )
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-64">
          <div className="bg-white dark:bg-gray-950 rounded-lg border shadow-sm p-6 mb-6">
            {/* Studio Info */}
            <div className="text-center mb-6">
              {studio.logo_url ? (
                <div className="relative w-20 h-20 rounded-md overflow-hidden mx-auto mb-3 border dark:border-gray-800">
                  <Image
                    src={studio.logo_url}
                    alt={studio.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3 border dark:border-gray-700">
                  <span className="text-2xl font-semibold text-gray-500 dark:text-gray-400">
                    {getInitials(studio.name)}
                  </span>
                </div>
              )}
              <h2 className="text-xl font-semibold">{studio.name}</h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Studio Admin
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="space-y-1">
              <button
                className={`w-full flex items-center px-4 py-3 rounded-md ${
                  activeTab === 'dashboard'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-900'
                }`}
                onClick={() => setActiveTab('dashboard')}
              >
                <BarChart3 className="mr-3 h-5 w-5" />
                <span>Dashboard</span>
              </button>
              
              <button
                className={`w-full flex items-center px-4 py-3 rounded-md ${
                  activeTab === 'bookings'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-900'
                }`}
                onClick={() => setActiveTab('bookings')}
              >
                <Calendar className="mr-3 h-5 w-5" />
                <span>Bookings</span>
              </button>
              
              <button
                className={`w-full flex items-center px-4 py-3 rounded-md ${
                  activeTab === 'artists'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-900'
                }`}
                onClick={() => setActiveTab('artists')}
              >
                <Users className="mr-3 h-5 w-5" />
                <span>Artists</span>
              </button>
              
              <button
                className={`w-full flex items-center px-4 py-3 rounded-md ${
                  activeTab === 'designs'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-900'
                }`}
                onClick={() => setActiveTab('designs')}
              >
                <PaintBucket className="mr-3 h-5 w-5" />
                <span>Designs</span>
              </button>
              
              <button
                className={`w-full flex items-center px-4 py-3 rounded-md ${
                  activeTab === 'settings'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-900'
                }`}
                onClick={() => setActiveTab('settings')}
              >
                <Settings className="mr-3 h-5 w-5" />
                <span>Settings</span>
              </button>
            </nav>
          </div>
          
          <Button asChild className="w-full" variant="outline">
            <Link href="/dashboard">
              Go to Personal Dashboard
            </Link>
          </Button>
        </div>
        
        {/* Main Content */}
        <div className="flex-1">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-950 rounded-lg border shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold">Studio Dashboard</h2>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/studio-admin/studio/edit">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Studio
                    </Link>
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Studio Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                        <div>
                          {studio.address && <div>{studio.address}</div>}
                          {studio.city && (
                            <div>
                              {studio.city}
                              {studio.state && `, ${studio.state}`}
                              {studio.postal_code && ` ${studio.postal_code}`}
                            </div>
                          )}
                          {studio.country && <div>{studio.country}</div>}
                        </div>
                      </div>
                      
                      {studio.contact_phone && (
                        <div className="flex items-center">
                          <Phone className="h-5 w-5 text-gray-500 mr-2" />
                          <span>{studio.contact_phone}</span>
                        </div>
                      )}
                      
                      {studio.contact_email && (
                        <div className="flex items-center">
                          <Mail className="h-5 w-5 text-gray-500 mr-2" />
                          <span>{studio.contact_email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Stats</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">Artists</div>
                        <div className="text-2xl font-semibold">{studioArtists.length}</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">Designs</div>
                        <div className="text-2xl font-semibold">{studioDesigns.length}</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">Upcoming</div>
                        <div className="text-2xl font-semibold">{upcomingBookings.length}</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">Completed</div>
                        <div className="text-2xl font-semibold">0</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Upcoming Bookings */}
              <div className="bg-white dark:bg-gray-950 rounded-lg border shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Upcoming Appointments</h3>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/studio-admin/bookings">
                      View All
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                
                {upcomingBookings.length > 0 ? (
                  <div className="divide-y dark:divide-gray-800">
                    {upcomingBookings.map((booking) => (
                      <div key={booking.id} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium">
                              {booking.client_profiles?.profiles?.full_name || 'Client'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(booking.booking_date).toLocaleDateString()}, {' '}
                              {booking.start_time.slice(0, 5)} - {booking.end_time.slice(0, 5)}
                            </div>
                          </div>
                          <div className={`
                            px-2 py-1 rounded-full text-xs font-medium
                            ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : ''}
                            ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' : ''}
                          `}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-sm">
                            <span className="text-gray-600 dark:text-gray-300">
                              Artist: {booking.artist_profiles?.artist_name || 'Artist'}
                            </span>
                            {booking.designs && (
                              <span className="text-gray-600 dark:text-gray-300 ml-2">
                                • Design: {booking.designs.title}
                              </span>
                            )}
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/studio-admin/bookings/${booking.id}`}>
                              Details
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    No upcoming appointments
                  </div>
                )}
              </div>
              
              {/* Artist List */}
              <div className="bg-white dark:bg-gray-950 rounded-lg border shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Artists</h3>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/studio-admin/artists">
                      View All
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                
                {studioArtists.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {studioArtists.slice(0, 3).map((studioArtist) => {
                      const artist = studioArtist.artist_profiles;
                      return (
                        <div key={studioArtist.id} className="flex items-center p-3 border rounded-lg">
                          {artist.profile_image_url ? (
                            <div className="relative w-12 h-12 rounded-full overflow-hidden mr-3">
                              <Image
                                src={artist.profile_image_url}
                                alt={artist.artist_name || 'Artist'}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center mr-3">
                              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                                {getInitials(artist.artist_name || 'Artist')}
                              </span>
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{artist.artist_name || 'Artist'}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {artist.years_experience ? `${artist.years_experience} years` : 'Artist'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    <Link href="/studio-admin/artists/add" className="flex items-center justify-center p-3 border rounded-lg border-dashed hover:bg-gray-50 dark:hover:bg-gray-900">
                      <Plus className="h-5 w-5 mr-2 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">Add Artist</span>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      No artists added to your studio yet.
                    </p>
                    <Button asChild>
                      <Link href="/studio-admin/artists/add">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Artist
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Recent Designs */}
              <div className="bg-white dark:bg-gray-950 rounded-lg border shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Recent Designs</h3>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/studio-admin/designs">
                      View All
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                
                {studioDesigns.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {studioDesigns.slice(0, 3).map((design) => (
                      <div key={design.id} className="flex border rounded-lg overflow-hidden">
                        <div className="w-1/3 bg-gray-200 dark:bg-gray-800 relative">
                          {design.design_images?.[0]?.image_url ? (
                            <Image
                              src={design.design_images[0].image_url}
                              alt={design.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <PaintBucket className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="w-2/3 p-3">
                          <div className="font-medium line-clamp-1">{design.title}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                            By {design.artist_profiles?.artist_name || 'Artist'}
                          </div>
                          <div className="mt-2">
                            <Button size="sm" variant="outline" asChild className="w-full">
                              <Link href={`/studio-admin/designs/${design.id}`}>
                                View
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      No designs uploaded yet.
                    </p>
                    <Button asChild>
                      <Link href="/studio-admin/designs/add">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Design
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'bookings' && (
            <div className="bg-white dark:bg-gray-950 rounded-lg border shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-6">Manage Bookings</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                This section is under development. Check back soon to manage your bookings!
              </p>
              <div className="border-t pt-6 dark:border-gray-800">
                <Button asChild>
                  <Link href="/studio-admin">
                    Back to Dashboard
                  </Link>
                </Button>
              </div>
            </div>
          )}
          
          {activeTab === 'artists' && (
            <div className="bg-white dark:bg-gray-950 rounded-lg border shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Studio Artists</h2>
                <Button asChild>
                  <Link href="/studio-admin/artists/add">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Artist
                  </Link>
                </Button>
              </div>
              
              {studioArtists.length > 0 ? (
                <div className="space-y-4">
                  {studioArtists.map((studioArtist) => {
                    const artist = studioArtist.artist_profiles;
                    return (
                      <div key={studioArtist.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center">
                          {artist.profile_image_url ? (
                            <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                              <Image
                                src={artist.profile_image_url}
                                alt={artist.artist_name || 'Artist'}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center mr-4">
                              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                                {getInitials(artist.artist_name || 'Artist')}
                              </span>
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{artist.artist_name || 'Artist'}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {artist.years_experience ? `${artist.years_experience} years experience` : ''}
                              {artist.years_experience && artist.average_rating ? ' • ' : ''}
                              {artist.average_rating ? `${artist.average_rating.toFixed(1)} stars` : ''}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/artists/${artist.id}`}>
                              View Profile
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/studio-admin/artists/${artist.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed rounded-lg">
                  <h3 className="text-lg font-medium mb-2">No artists yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Start adding artists to your studio.
                  </p>
                  <Button asChild>
                    <Link href="/studio-admin/artists/add">
                      <Plus className="mr-2 h-4 w-4" />
                      Add First Artist
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'designs' && (
            <div className="bg-white dark:bg-gray-950 rounded-lg border shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Studio Designs</h2>
                <Button asChild>
                  <Link href="/studio-admin/designs/add">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Design
                  </Link>
                </Button>
              </div>
              
              {studioDesigns.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {studioDesigns.map((design) => (
                    <div key={design.id} className="border rounded-lg overflow-hidden">
                      <div className="relative h-48 bg-gray-200 dark:bg-gray-800">
                        {design.design_images?.[0]?.image_url ? (
                          <Image
                            src={design.design_images[0].image_url}
                            alt={design.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <PaintBucket className="h-10 w-10 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium mb-1">{design.title}</h3>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                          By {design.artist_profiles?.artist_name || 'Artist'}
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" asChild className="flex-1">
                            <Link href={`/designs/${design.id}`}>
                              View
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/studio-admin/designs/${design.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed rounded-lg">
                  <h3 className="text-lg font-medium mb-2">No designs yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Start adding designs to showcase your studio work.
                  </p>
                  <Button asChild>
                    <Link href="/studio-admin/designs/add">
                      <Plus className="mr-2 h-4 w-4" />
                      Add First Design
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div className="bg-white dark:bg-gray-950 rounded-lg border shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-6">Studio Settings</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                This section is under development. Check back soon to update your studio settings!
              </p>
              <div className="border-t pt-6 dark:border-gray-800">
                <Button variant="outline" asChild>
                  <Link href="/studio-admin">
                    Back to Dashboard
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}