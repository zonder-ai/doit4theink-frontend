"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, MapPin, Instagram, Globe, Star, User, Calendar, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DesignCard from '@/components/design-card'
import { fetchArtistById, fetchDesigns } from '@/lib/supabase'
import { getInitials } from '@/lib/utils'

export default function ArtistDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [artist, setArtist] = useState<any>(null)
  const [artistDesigns, setArtistDesigns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('portfolio')
  
  useEffect(() => {
    const loadArtist = async () => {
      setIsLoading(true)
      
      try {
        const artistData = await fetchArtistById(params.id)
        
        if (!artistData) {
          // Artist not found, redirect to artists page
          router.push('/artists')
          return
        }
        
        setArtist(artistData)
        
        // Fetch artist's designs
        const { designs } = await fetchDesigns({
          limit: 6,
          artistId: params.id,
        })
        
        setArtistDesigns(designs || [])
      } catch (error) {
        console.error('Error loading artist:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadArtist()
  }, [params.id, router])
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 mb-8 rounded"></div>
          <div className="h-64 w-full bg-gray-200 dark:bg-gray-800 rounded-lg mb-8"></div>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3">
              <div className="h-40 w-40 rounded-full bg-gray-200 dark:bg-gray-800 mx-auto mb-4"></div>
              <div className="h-6 w-32 mx-auto bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
              <div className="h-4 w-24 mx-auto bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
              <div className="h-10 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
            </div>
            <div className="md:w-2/3">
              <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
              <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
              <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
              <div className="h-24 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (!artist) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Artist not found</h1>
        <p className="mb-6">The artist you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link href="/artists">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Artists
          </Link>
        </Button>
      </div>
    )
  }
  
  // Extract data
  const artistProfile = artist.profiles || {}
  const studio = artist.studios || {}
  const designs = artist.designs || []
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/artists">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Artists
          </Link>
        </Button>
      </div>
      
      {/* Artist Banner */}
      <div className="relative h-64 md:h-80 rounded-lg overflow-hidden mb-8 bg-gradient-to-r from-gray-800 to-gray-900">
        {artist.banner_url ? (
          <Image
            src={artist.banner_url}
            alt={artist.artist_name || 'Artist'}
            fill
            className="object-cover opacity-70"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-800 to-indigo-800"></div>
        )}
        
        {/* Banner Content */}
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 py-8 text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {artist.artist_name || artistProfile.full_name || 'Artist'}
            </h1>
            {artist.average_rating && (
              <div className="flex items-center mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(artist.average_rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : i < artist.average_rating
                        ? 'text-yellow-400 fill-yellow-400 opacity-50'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm">
                  {artist.average_rating.toFixed(1)} ({artist.review_count || 0} reviews)
                </span>
              </div>
            )}
            <div className="flex flex-wrap items-center text-sm text-gray-200">
              {artist.years_experience > 0 && (
                <span className="mr-3">
                  {artist.years_experience} {artist.years_experience === 1 ? 'year' : 'years'} experience
                </span>
              )}
              {(artist.city || studio.city) && (
                <div className="flex items-center mr-3">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  <span>
                    {artist.city || studio.city}
                    {(artist.state || studio.state) && `, ${artist.state || studio.state}`}
                  </span>
                </div>
              )}
              {artist.is_independent ? (
                <span className="bg-purple-500 px-2 py-0.5 rounded-full text-xs font-medium">
                  Independent Artist
                </span>
              ) : (
                <div className="flex items-center">
                  <User className="h-3.5 w-3.5 mr-1" />
                  <span>
                    Artist at{' '}
                    <Link 
                      href={`/studios/${studio.id}`}
                      className="underline hover:text-white"
                    >
                      {studio.name}
                    </Link>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Artist Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-950 rounded-lg border shadow-sm p-6 mb-6">
            <div className="flex flex-col items-center text-center mb-6">
              {artist.profile_image_url || artistProfile.avatar_url ? (
                <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-white dark:border-gray-800 shadow-lg">
                  <Image
                    src={artist.profile_image_url || artistProfile.avatar_url}
                    alt={artist.artist_name || artistProfile.full_name || 'Artist'}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-200 to-indigo-200 dark:from-purple-900 dark:to-indigo-900 flex items-center justify-center mb-4 border-4 border-white dark:border-gray-800 shadow-lg">
                  <span className="text-3xl font-semibold text-purple-800 dark:text-purple-300">
                    {getInitials(artist.artist_name || artistProfile.full_name || 'Artist')}
                  </span>
                </div>
              )}
              
              <Button className="w-full mt-4" asChild>
                <Link href={`/booking/${artist.id}`}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Book Appointment
                </Link>
              </Button>
            </div>
            
            {/* Artist Links */}
            <div className="space-y-3">
              {artist.instagram_handle && (
                <a 
                  href={`https://instagram.com/${artist.instagram_handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
                >
                  <Instagram className="mr-2 h-5 w-5" />
                  @{artist.instagram_handle}
                </a>
              )}
              
              {artist.portfolio_url && (
                <a 
                  href={artist.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
                >
                  <Globe className="mr-2 h-5 w-5" />
                  Portfolio Website
                </a>
              )}
            </div>
            
            {/* Availability Notice */}
            {artist.availability_notice && (
              <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-900 dark:text-yellow-100">
                <div className="font-medium mb-1">Availability Notice:</div>
                <p>{artist.availability_notice}</p>
              </div>
            )}
          </div>
          
          {/* Studio Information */}
          {studio.id && !artist.is_independent && (
            <div className="bg-white dark:bg-gray-950 rounded-lg border shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-3">Studio</h3>
              <div className="flex items-start mb-4">
                {studio.logo_url ? (
                  <div className="relative w-12 h-12 rounded-md overflow-hidden mr-3 border dark:border-gray-800">
                    <Image
                      src={studio.logo_url}
                      alt={studio.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-3 border dark:border-gray-700">
                    <span className="text-lg font-semibold text-gray-500 dark:text-gray-400">
                      {getInitials(studio.name)}
                    </span>
                  </div>
                )}
                <div>
                  <Link 
                    href={`/studios/${studio.id}`}
                    className="font-medium hover:text-primary transition-colors"
                  >
                    {studio.name}
                  </Link>
                  {studio.is_verified && (
                    <div className="flex items-center text-blue-600 dark:text-blue-400 text-xs mt-0.5">
                      <CheckCircle2 className="h-3 w-3 mr-0.5 text-blue-500" />
                      Verified Studio
                    </div>
                  )}
                </div>
              </div>
              
              {(studio.city || studio.address) && (
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                    <div>
                      {studio.address && <div>{studio.address}</div>}
                      {studio.city && (
                        <div>
                          {studio.city}
                          {studio.state && `, ${studio.state}`}
                          {studio.postal_code && ` ${studio.postal_code}`}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href={`/studios/${studio.id}`}>
                  View Studio
                </Link>
              </Button>
            </div>
          )}
        </div>
        
        {/* Main Content */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-gray-950 rounded-lg border shadow-sm overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b">
              <button
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === 'portfolio'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
                onClick={() => setActiveTab('portfolio')}
              >
                Portfolio
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === 'about'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
                onClick={() => setActiveTab('about')}
              >
                About
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === 'reviews'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews
              </button>
            </div>
            
            {/* Tab Content */}
            <div className="p-6">
              {/* Portfolio Tab */}
              {activeTab === 'portfolio' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Available Designs</h2>
                  
                  {artistDesigns.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {artistDesigns.map((design) => (
                        <DesignCard
                          key={design.id}
                          id={design.id}
                          title={design.title}
                          imageUrl={design.primary_image_url}
                          price={design.base_price}
                          depositAmount={design.deposit_amount}
                          artistName={design.artist_name}
                          studioName={design.studio_name}
                          isFlash={design.is_flash}
                          isCustom={design.is_custom}
                          isColor={design.is_color}
                          styles={design.styles}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 border border-dashed rounded-lg">
                      <h3 className="text-lg font-medium mb-2">No designs available</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        This artist hasn&apos;t uploaded any designs yet.
                      </p>
                      <Button asChild>
                        <Link href={`/booking/${artist.id}`}>
                          <Calendar className="mr-2 h-4 w-4" />
                          Book Custom Design
                        </Link>
                      </Button>
                    </div>
                  )}
                  
                  {artistDesigns.length > 0 && (
                    <div className="mt-6 text-center">
                      <Button variant="outline" asChild>
                        <Link href={`/designs?artist=${artist.id}`}>
                          View All Designs
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              )}
              
              {/* About Tab */}
              {activeTab === 'about' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">About {artist.artist_name || artistProfile.full_name}</h2>
                  
                  {artist.bio ? (
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="whitespace-pre-line">{artist.bio}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">
                      No biography available.
                    </p>
                  )}
                  
                  {/* Experience and Specialties */}
                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-3">Experience</h3>
                    <p>
                      {artist.years_experience ? (
                        <>
                          {artist.artist_name || artistProfile.full_name} has been tattooing for {artist.years_experience} {artist.years_experience === 1 ? 'year' : 'years'}.
                        </>
                      ) : (
                        <>Experience information not available.</>
                      )}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Reviews</h2>
                    
                    {artist.average_rating && (
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < Math.floor(artist.average_rating)
                                ? 'text-yellow-400 fill-yellow-400'
                                : i < artist.average_rating
                                ? 'text-yellow-400 fill-yellow-400 opacity-50'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-2 font-medium">
                          {artist.average_rating.toFixed(1)}
                        </span>
                        <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                          ({artist.review_count || 0} {artist.review_count === 1 ? 'review' : 'reviews'})
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-6">
                    {artist.reviews && artist.reviews.length > 0 ? (
                      artist.reviews.map((review: any) => (
                        <div key={review.id} className="border-b pb-6 last:border-0">
                          <div className="flex justify-between mb-2">
                            <div className="flex items-center">
                              <div className="font-medium">{review.client_name || 'Client'}</div>
                              <div className="mx-2 text-gray-300 dark:text-gray-600">•</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(review.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300">
                            {review.review_text}
                          </p>
                          
                          {/* Artist Response */}
                          {review.response_text && (
                            <div className="mt-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                              <div className="text-sm font-medium mb-1">
                                Response from {artist.artist_name || artistProfile.full_name}:
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {review.response_text}
                              </p>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 border border-dashed rounded-lg">
                        <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          This artist hasn&apos;t received any reviews yet.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}