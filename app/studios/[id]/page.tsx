"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, MapPin, Phone, Mail, Instagram, Globe, CheckCircle2, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ArtistCard from '@/components/artist-card'
import DesignCard from '@/components/design-card'
import { fetchStudioById, fetchDesigns } from '@/lib/supabase'
import { getInitials } from '@/lib/utils'

export default function StudioDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [studio, setStudio] = useState<any>(null)
  const [studioDesigns, setStudioDesigns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('artists')
  
  useEffect(() => {
    const loadStudio = async () => {
      setIsLoading(true)
      
      try {
        const studioData = await fetchStudioById(params.id)
        
        if (!studioData) {
          // Studio not found, redirect to studios page
          router.push('/studios')
          return
        }
        
        setStudio(studioData)
        
        // Fetch designs from this studio
        const { designs } = await fetchDesigns({
          limit: 6,
          studioId: params.id,
        })
        
        setStudioDesigns(designs || [])
      } catch (error) {
        console.error('Error loading studio:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadStudio()
  }, [params.id, router])
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 mb-8 rounded"></div>
          <div className="h-64 w-full bg-gray-200 dark:bg-gray-800 rounded-lg mb-8"></div>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3">
              <div className="h-40 w-40 rounded-lg bg-gray-200 dark:bg-gray-800 mx-auto mb-4"></div>
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
  
  if (!studio) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Studio not found</h1>
        <p className="mb-6">The studio you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link href="/studios">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Studios
          </Link>
        </Button>
      </div>
    )
  }
  
  // Extract artists from studio
  const studioArtists = studio.studio_artists?.map((sa: any) => sa.artist_profiles) || []
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/studios">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Studios
          </Link>
        </Button>
      </div>
      
      {/* Studio Banner */}
      <div className="relative h-64 md:h-80 rounded-lg overflow-hidden mb-8 bg-gradient-to-r from-gray-800 to-gray-900">
        {studio.banner_url ? (
          <Image
            src={studio.banner_url}
            alt={studio.name}
            fill
            className="object-cover opacity-70"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-800 to-indigo-800"></div>
        )}
        
        {/* Banner Content */}
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 py-8 text-white">
            <div className="flex items-center mb-2">
              <h1 className="text-3xl md:text-4xl font-bold mr-2">
                {studio.name}
              </h1>
              {studio.is_verified && (
                <CheckCircle2 className="h-6 w-6 text-blue-400" />
              )}
            </div>
            <div className="flex flex-wrap items-center text-sm text-gray-200">
              {studio.city && (
                <div className="flex items-center mr-3">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  <span>
                    {studio.city}
                    {studio.state && `, ${studio.state}`}
                  </span>
                </div>
              )}
              <span className="mr-3">
                {studioArtists.length} {studioArtists.length === 1 ? 'Artist' : 'Artists'}
              </span>
              {studio.average_rating && (
                <div className="flex items-center">
                  <Star className="h-3.5 w-3.5 mr-1 text-yellow-400 fill-yellow-400" />
                  <span>
                    {studio.average_rating.toFixed(1)} ({studio.review_count || 0} reviews)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Studio Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-950 rounded-lg border shadow-sm p-6 mb-6">
            <div className="flex flex-col items-center text-center mb-6">
              {studio.logo_url ? (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden mb-4 border-4 border-white dark:border-gray-800 shadow-lg">
                  <Image
                    src={studio.logo_url}
                    alt={studio.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-blue-200 to-indigo-200 dark:from-blue-900 dark:to-indigo-900 flex items-center justify-center mb-4 border-4 border-white dark:border-gray-800 shadow-lg">
                  <span className="text-3xl font-semibold text-blue-800 dark:text-blue-300">
                    {getInitials(studio.name)}
                  </span>
                </div>
              )}
              
              {studio.is_verified && (
                <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm mb-2">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Verified Studio
                </div>
              )}
            </div>
            
            {/* Studio Contact Info */}
            <div className="space-y-3">
              {studio.contact_phone && (
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <Phone className="mr-2 h-5 w-5 text-gray-500" />
                  <a href={`tel:${studio.contact_phone}`} className="hover:text-primary transition-colors">
                    {studio.contact_phone}
                  </a>
                </div>
              )}
              
              {studio.contact_email && (
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <Mail className="mr-2 h-5 w-5 text-gray-500" />
                  <a href={`mailto:${studio.contact_email}`} className="hover:text-primary transition-colors">
                    {studio.contact_email}
                  </a>
                </div>
              )}
              
              {studio.instagram_handle && (
                <a 
                  href={`https://instagram.com/${studio.instagram_handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
                >
                  <Instagram className="mr-2 h-5 w-5" />
                  @{studio.instagram_handle}
                </a>
              )}
              
              {studio.website && (
                <a 
                  href={studio.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
                >
                  <Globe className="mr-2 h-5 w-5" />
                  Website
                </a>
              )}
            </div>
            
            {/* Studio Address */}
            {studio.address && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                <h3 className="font-medium mb-2">Location</h3>
                <div className="text-gray-700 dark:text-gray-300 mb-4">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 mr-2 mt-0.5 text-gray-500 flex-shrink-0" />
                    <div>
                      <div>{studio.address}</div>
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
                </div>
                
                {/* Link to Maps */}
                {studio.address && studio.city && (
                  <a 
                    href={`https://maps.google.com/?q=${encodeURIComponent(
                      `${studio.address}, ${studio.city}, ${studio.state || ''} ${studio.postal_code || ''}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 text-sm"
                  >
                    View on Google Maps
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Main Content */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-gray-950 rounded-lg border shadow-sm overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b">
              <button
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === 'artists'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
                onClick={() => setActiveTab('artists')}
              >
                Artists
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === 'designs'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
                onClick={() => setActiveTab('designs')}
              >
                Designs
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
              {/* Artists Tab */}
              {activeTab === 'artists' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Our Artists</h2>
                  
                  {studioArtists.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {studioArtists.map((artist: any) => (
                        <ArtistCard
                          key={artist.id}
                          id={artist.id}
                          name={artist.artist_name || 'Artist'}
                          imageUrl={artist.profile_image_url}
                          bio={artist.bio}
                          yearsExperience={artist.years_experience}
                          avgRating={artist.average_rating}
                          location={artist.city ? `${artist.city}, ${artist.state}` : undefined}
                          studioName={studio.name}
                          isIndependent={false}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 border border-dashed rounded-lg">
                      <h3 className="text-lg font-medium mb-2">No artists listed</h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        This studio hasn&apos;t added any artists to their profile yet.
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Designs Tab */}
              {activeTab === 'designs' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Available Designs</h2>
                  
                  {studioDesigns.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {studioDesigns.map((design) => (
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
                        This studio hasn&apos;t uploaded any designs yet.
                      </p>
                      {studioArtists.length > 0 && (
                        <Button asChild>
                          <Link href={`/booking/${studioArtists[0].id}`}>
                            Book Custom Design
                          </Link>
                        </Button>
                      )}
                    </div>
                  )}
                  
                  {studioDesigns.length > 0 && (
                    <div className="mt-6 text-center">
                      <Button variant="outline" asChild>
                        <Link href={`/designs?studio=${studio.id}`}>
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
                  <h2 className="text-xl font-semibold mb-4">About {studio.name}</h2>
                  
                  {studio.description ? (
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="whitespace-pre-line">{studio.description}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">
                      No description available.
                    </p>
                  )}
                  
                  {/* Services or additional info can be added here */}
                </div>
              )}
              
              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Reviews</h2>
                    
                    {studio.average_rating && (
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < Math.floor(studio.average_rating)
                                ? 'text-yellow-400 fill-yellow-400'
                                : i < studio.average_rating
                                ? 'text-yellow-400 fill-yellow-400 opacity-50'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-2 font-medium">
                          {studio.average_rating.toFixed(1)}
                        </span>
                        <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                          ({studio.review_count || 0} {studio.review_count === 1 ? 'review' : 'reviews'})
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-6">
                    {studio.reviews && studio.reviews.length > 0 ? (
                      studio.reviews.map((review: any) => (
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
                          
                          {/* Studio Response */}
                          {review.response_text && (
                            <div className="mt-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                              <div className="text-sm font-medium mb-1">
                                Response from {studio.name}:
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
                          This studio hasn&apos;t received any reviews yet.
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