"use client"

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import StudioCard from '@/components/studio-card'
import { fetchStudios } from '@/lib/supabase'

export default function StudiosPage() {
  const searchParams = useSearchParams()
  const [studios, setStudios] = useState<any[]>([])
  const [totalStudios, setTotalStudios] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  
  // Filter states
  const [location, setLocation] = useState('')
  const [page, setPage] = useState(1)
  
  useEffect(() => {
    // Check for search parameters
    const locationParam = searchParams.get('location')
    
    if (locationParam) setLocation(locationParam)
    
    // Load studios
    const loadData = async () => {
      setIsLoading(true)
      
      try {
        // Fetch studios with applied filters
        const { studios, total } = await fetchStudios({
          page: 1,
          limit: 12,
          location: locationParam || undefined,
        })
        
        setStudios(studios)
        setTotalStudios(total)
        setPage(1)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [searchParams])
  
  const loadMoreStudios = async () => {
    setIsLoading(true)
    
    try {
      const nextPage = page + 1
      
      const { studios: moreStudios } = await fetchStudios({
        page: nextPage,
        limit: 12,
        location: location || undefined,
      })
      
      setStudios(prevStudios => [...prevStudios, ...moreStudios])
      setPage(nextPage)
    } catch (error) {
      console.error('Error loading more studios:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const applyFilters = async () => {
    setIsLoading(true)
    
    try {
      const { studios: filteredStudios, total } = await fetchStudios({
        page: 1,
        limit: 12,
        location: location || undefined,
      })
      
      setStudios(filteredStudios)
      setTotalStudios(total)
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
    setLocation('')
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tattoo Studios</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Discover the best tattoo studios for your next tattoo
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
            
            <Button onClick={applyFilters} className="w-full">
              Apply Filters
            </Button>
          </div>
        </div>
        
        {/* Studios Grid */}
        <div className="flex-1">
          {isLoading && studios.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-80 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : studios.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {studios.map((studio) => (
                  <StudioCard
                    key={studio.id}
                    id={studio.id}
                    name={studio.name}
                    logoUrl={studio.logo_url}
                    description={studio.description}
                    location={studio.city ? `${studio.city}, ${studio.state}` : undefined}
                    address={studio.address}
                    artistCount={studio.studio_artists?.length}
                    isVerified={studio.is_verified}
                    website={studio.website}
                    instagram={studio.instagram_handle}
                  />
                ))}
              </div>
              
              {studios.length < totalStudios && (
                <div className="mt-8 text-center">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={loadMoreStudios}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Loading...' : 'Load More Studios'}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No studios found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Try adjusting your location search
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