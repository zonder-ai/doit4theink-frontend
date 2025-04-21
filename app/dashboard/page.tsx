"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Bookmark, Settings, LogOut, User, Edit } from 'lucide-react'
import { formatDate, getInitials } from '@/lib/utils'

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('bookings')
  const [bookings, setBookings] = useState<any[]>([])
  const [favorites, setFavorites] = useState<any[]>([])
  
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
          
          // Fetch client profile
          if (profileData.user_type === 'client') {
            const { data: clientData } = await supabase
              .from('client_profiles')
              .select('*')
              .eq('id', user.id)
              .single()
            
            if (clientData) {
              setProfile({ ...profileData, ...clientData })
            }
            
            // Fetch bookings
            const { data: bookingsData } = await supabase
              .from('bookings')
              .select(`
                *,
                designs(*),
                artist_profiles!bookings_artist_id_fkey(*),
                studios!bookings_studio_id_fkey(*)
              `)
              .eq('client_id', user.id)
              .order('booking_date', { ascending: false })
            
            if (bookingsData) {
              setBookings(bookingsData)
            }
            
            // Fetch favorites
            const { data: favoritesData } = await supabase
              .from('favorites')
              .select(`
                *,
                designs(
                  *,
                  design_images(*),
                  artist_profiles!designs_artist_id_fkey(*)
                )
              `)
              .eq('client_id', user.id)
              .order('created_at', { ascending: false })
            
            if (favoritesData) {
              setFavorites(favoritesData)
            }
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    getUser()
  }, [router])
  
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
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
        <p className="mb-6">Please sign in to access your dashboard.</p>
        <Button asChild>
          <Link href="/auth/signin">Sign In</Link>
        </Button>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-950 rounded-lg border shadow-sm p-6 mb-6">
            <div className="flex flex-col items-center text-center mb-6">
              {profile.avatar_url ? (
                <div className="relative w-24 h-24 rounded-full overflow-hidden mb-4">
                  <Image
                    src={profile.avatar_url}
                    alt={profile.full_name || 'User'}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <span className="text-2xl font-semibold text-gray-500 dark:text-gray-400">
                    {getInitials(profile.full_name || user.email)}
                  </span>
                </div>
              )}
              <h2 className="text-xl font-semibold">{profile.full_name || 'User'}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
              
              <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                <Link href="/profile">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Link>
              </Button>
            </div>
            
            <nav>
              <ul className="space-y-2">
                <li>
                  <button
                    className={`w-full flex items-center px-4 py-2 rounded-md ${
                      activeTab === 'bookings'
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-900'
                    }`}
                    onClick={() => setActiveTab('bookings')}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    My Bookings
                  </button>
                </li>
                <li>
                  <button
                    className={`w-full flex items-center px-4 py-2 rounded-md ${
                      activeTab === 'favorites'
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-900'
                    }`}
                    onClick={() => setActiveTab('favorites')}
                  >
                    <Bookmark className="mr-2 h-4 w-4" />
                    Saved Designs
                  </button>
                </li>
                <li>
                  <button
                    className={`w-full flex items-center px-4 py-2 rounded-md ${
                      activeTab === 'settings'
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-900'
                    }`}
                    onClick={() => setActiveTab('settings')}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Account Settings
                  </button>
                </li>
                <li>
                  <button
                    className="w-full flex items-center px-4 py-2 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="md:col-span-3">
          <div className="bg-white dark:bg-gray-950 rounded-lg border shadow-sm p-6">
            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">My Bookings</h2>
                
                {bookings.length > 0 ? (
                  <div className="space-y-6">
                    {bookings.map((booking) => (
                      <div 
                        key={booking.id} 
                        className="flex flex-col md:flex-row border rounded-lg overflow-hidden"
                      >
                        <div className="bg-gray-100 dark:bg-gray-900 md:w-1/4 p-6 flex flex-col justify-center items-center">
                          <div className="text-2xl font-bold">{new Date(booking.booking_date).getDate()}</div>
                          <div className="text-lg">
                            {new Date(booking.booking_date).toLocaleString('default', { month: 'short' })}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(booking.booking_date).getFullYear()}
                          </div>
                          <div className="mt-2 text-sm flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {booking.start_time?.slice(0, 5)} - {booking.end_time?.slice(0, 5)}
                          </div>
                        </div>
                        
                        <div className="p-6 md:w-3/4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="text-lg font-semibold">
                                {booking.designs?.title || 'Custom Tattoo'}
                              </h3>
                              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <User className="h-3 w-3 mr-1" />
                                <span>
                                  {booking.artist_profiles?.artist_name || 'Artist'}
                                  {booking.studios && (
                                    <>
                                      {' at '}
                                      <span>{booking.studios.name}</span>
                                    </>
                                  )}
                                </span>
                              </div>
                            </div>
                            
                            <div className={`
                              px-2 py-1 rounded-full text-xs font-medium
                              ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : ''}
                              ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' : ''}
                              ${booking.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' : ''}
                              ${booking.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' : ''}
                            `}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </div>
                          </div>
                          
                          <p className="text-gray-700 dark:text-gray-300 mb-4">
                            {booking.notes || 'No additional notes.'}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-lg font-semibold">
                                ${booking.deposit_amount || 0}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {' '}deposit of ${booking.total_price || 0}
                              </span>
                            </div>
                            
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/bookings/${booking.id}`}>
                                  View Details
                                </Link>
                              </Button>
                              
                              {booking.status === 'pending' && (
                                <Button variant="destructive" size="sm">
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border border-dashed rounded-lg">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No bookings yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                      You don&apos;t have any bookings scheduled.
                    </p>
                    <Button asChild>
                      <Link href="/designs">Browse Designs</Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
            
            {/* Favorites Tab */}
            {activeTab === 'favorites' && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">Saved Designs</h2>
                
                {favorites.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((favorite) => {
                      const design = favorite.designs
                      if (!design) return null
                      
                      return (
                        <div key={favorite.id} className="border rounded-lg overflow-hidden">
                          <div className="relative h-48 bg-gray-200 dark:bg-gray-800">
                            {design.design_images?.[0]?.image_url ? (
                              <Image
                                src={design.design_images[0].image_url}
                                alt={design.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-gray-400 dark:text-gray-500">No image</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="p-4">
                            <h3 className="font-semibold mb-1">{design.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                              by {design.artist_profiles?.artist_name || 'Unknown Artist'}
                            </p>
                            <div className="flex justify-between items-center">
                              <span className="font-medium">${design.base_price || 0}</span>
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/designs/${design.id}`}>
                                  View
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 border border-dashed rounded-lg">
                    <Bookmark className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No saved designs</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                      You haven&apos;t saved any designs yet.
                    </p>
                    <Button asChild>
                      <Link href="/designs">Browse Designs</Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
            
            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">Account Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Full Name</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border rounded-md"
                          value={profile.full_name || ''}
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                          type="email"
                          className="w-full px-3 py-2 border rounded-md"
                          value={user.email}
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Phone</label>
                        <input
                          type="tel"
                          className="w-full px-3 py-2 border rounded-md"
                          value={profile.phone || ''}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Street Address</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border rounded-md"
                          value={profile.address || ''}
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">City</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border rounded-md"
                          value={profile.city || ''}
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">State/Province</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border rounded-md"
                          value={profile.state || ''}
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Postal Code</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border rounded-md"
                          value={profile.postal_code || ''}
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Country</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border rounded-md"
                          value={profile.country || ''}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button asChild>
                      <Link href="/profile">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}