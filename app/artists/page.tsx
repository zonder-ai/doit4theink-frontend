"use client"

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { ChevronDown, ChevronUp, Filter, X, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ArtistCard from '@/components/artist-card'
import { fetchArtists, fetchStyles } from '@/lib/supabase'

export default function ArtistsPage() {
  const searchParams = useSearchParams()
  const [artists, setArtists] = useState<any[]>([])
  const [totalArtists, setTotalArtists] = useState(0)
  const [styles, setStyles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  
  // Filter states
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [location, setLocation] = useState('')
  const [minRating, setMinRating] = useState<number | undefined>(undefined)
  const [page, setPage] = useState(1)
  
  useEffect(() => {
    // Check for search parameters
    const styleParam = searchParams.get('style')
    const locationParam = searchParams.get('location')
    const ratingParam = searchParams.get('rating')
    
    if (styleParam) setSelectedStyles(styleParam.split(','))
    if (locationParam) setLocation(locationParam)
    if (ratingParam) setMinRating(Number(ratingParam))
    
    // Load artists and styles
    const loadData = async () => {
      setIsLoading(true)
      
      try {
        // Fetch styles for filter options
        const stylesData = await fetchStyles()
        setStyles(stylesData)
        
        // Fetch artists with applied filters
        const { artists, total } = await fetchArtists({
          page: 1,
          limit: 12,
          styleIds: styleParam ? styleParam.split(',') : [],
          location: locationParam || undefined,
          minRating: ratingParam ? Number(ratingParam) : undefined,
        })
        
        setArtists(artists)
        setTotalArtists(total)
        setPage(1)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [searchParams])
  
  const loadMoreArtists = async () => {
    setIsLoading(true)
    
    try {
      const nextPage = page + 1
      
      const { artists: moreArtists } = await fetchArtists({
        page: nextPage,
        limit: 12,
        styleIds: selectedStyles,
        location: location || undefined,
        minRating,
      })
      
      setArtists(prevArtists => [...prevArtists, ...moreArtists])
      setPage(nextPage)
    } catch (error) {
      console.error('Error loading more artists:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const applyFilters = async () => {
    setIsLoading(true)
    
    try {
      const { artists: filteredArtists, total } = await fetchArtists({
        page: 1,
        limit: 12,
        styleIds: selectedStyles,
        location: location || undefined,
        minRating,
      })
      
      setArtists(filteredArtists)
      setTotalArtists(total)
      setPage(1)
      
      // On mobile, close filters after applying
      if (window.innerWidth < 768) {
        setShowFilters(false)
      }
    } catch (error) {
      console.error('Error applying filters:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const resetFilters = () => {
    setSelectedStyles([])
    setLocation('')
    setMinRating(undefined)
  }
  
  const toggleStyle = (styleId: string) => {
    setSelectedStyles(prev => 
      prev.includes(styleId) 
        ? prev.filter(id => id !== styleId) 
        : [...prev, styleId]
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tattoo Artists</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Find talented tattoo artists to create your next masterpiece
        </p>
      </div>
      
      {/* Mobile Filter Toggle Button */}
      <div className="md:hidden mb-4">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="mr-2 h-4 w-4" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
          {showFilters ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters Sidebar */}
        <div 
          className={`w-full md:w-64 ${showFilters ? 'block' : 'hidden'} md:block transition-all duration-300 ease-in-out`}
        >
          <div className="bg-white dark:bg-gray-950 p-4 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <X className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
            
            {/* Location */}
            <div className="mb-6">
              <label htmlFor="location" className="block text-sm font-medium mb-2">
                Location
              </label>
              <input
                type="text"
                id="location"
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="City, State or Country"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            
            {/* Minimum Rating */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Minimum Rating</h3>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    className={`p-1 ${minRating && rating <= minRating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                    onClick={() => setMinRating(rating)}
                  >
                    <Star className="h-6 w-6 fill-current" />
                  </button>
                ))}
                {minRating && (
                  <button
                    className="ml-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    onClick={() => setMinRating(undefined)}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            
            {/* Styles */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Styles</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {styles.map((style) => (
                  <label key={style.id} className="flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      checked={selectedStyles.includes(style.id)}
                      onChange={() => toggleStyle(style.id)}
                    />
                    <span className="ml-2 text-sm">{style.name}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <Button onClick={applyFilters} className="w-full">
              Apply Filters
            </Button>
          </div>
        </div>
        
        {/* Artists Grid */}
        <div className="flex-1">
          {isLoading && artists.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-96 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : artists.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {artists.map((artist) => (
                  <ArtistCard
                    key={artist.id}
                    id={artist.id}
                    name={artist.artist_name || 'Unknown Artist'}
                    imageUrl={artist.profile_image_url}
                    bio={artist.bio}
                    yearsExperience={artist.years_experience}
                    avgRating={artist.average_rating}
                    location={artist.city ? `${artist.city}, ${artist.state}` : undefined}
                    studioName={artist.primary_studio_name}
                    isIndependent={artist.is_independent}
                  />
                ))}
              </div>
              
              {artists.length < totalArtists && (
                <div className="mt-8 text-center">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={loadMoreArtists}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Loading...' : 'Load More Artists'}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No artists found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Try adjusting your filters or location search
              </p>
              <Button variant="outline" onClick={resetFilters}>
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}