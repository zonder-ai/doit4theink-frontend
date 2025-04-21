"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, Trash, Loader2, MapPin, Star, Instagram, ExternalLink, Store, Building2 } from 'lucide-react'

export default function StudiosPage() {
  // State for studios and pagination
  const [studios, setStudios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalStudios, setTotalStudios] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState('')
  const [location, setLocation] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  
  const ITEMS_PER_PAGE = 12
  
  useEffect(() => {
    // Fetch studios whenever filters change
    const loadStudios = async () => {
      setLoading(true)
      
      try {
        // Create the query
        let query = supabase
          .from('studios')
          .select('*, studio_artists(count)', { count: 'exact' })
          .order('name')
        
        // Apply filters
        if (location) {
          query = query.ilike('city', `%${location}%`)
        }
        
        if (searchTerm) {
          query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        }
        
        // Apply pagination
        const start = (currentPage - 1) * ITEMS_PER_PAGE
        const end = start + ITEMS_PER_PAGE - 1
        query = query.range(start, end)
        
        // Execute query
        const { data, error, count } = await query
        
        if (error) throw error
        
        setStudios(data || [])
        setTotalStudios(count || 0)
      } catch (error) {
        console.error('Error loading studios:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadStudios()
  }, [currentPage, searchTerm, location])
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const searchInput = document.getElementById('search-studios') as HTMLInputElement
    setSearchTerm(searchInput.value)
    setCurrentPage(1)
  }
  
  const clearAllFilters = () => {
    setLocation('')
    setSearchTerm('')
    setCurrentPage(1)
    
    const searchInput = document.getElementById('search-studios') as HTMLInputElement
    if (searchInput) {
      searchInput.value = ''
    }
  }
  
  const totalPages = Math.ceil(totalStudios / ITEMS_PER_PAGE)
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Browse Tattoo Studios</h1>
        <Button
          variant="outline"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="md:hidden"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>
      
      <div className="mb-8">
        <form onSubmit={handleSearchSubmit} className="flex w-full max-w-lg space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              id="search-studios"
              type="text"
              placeholder="Search studios by name or location..."
              className="pl-8"
              defaultValue={searchTerm}
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className={`md:block ${isFilterOpen ? 'block' : 'hidden'}`}>
          <div className="bg-white dark:bg-gray-950 rounded-lg border p-4 sticky top-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-lg">Filters</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-gray-500 hover:text-red-500"
              >
                <Trash className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>
            
            {/* Location Filter */}
            <Accordion type="single" collapsible defaultValue="location">
              <AccordionItem value="location">
                <AccordionTrigger>Location</AccordionTrigger>
                <AccordionContent>
                  <Input
                    placeholder="City or postal code"
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value)
                      setCurrentPage(1)
                    }}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
        
        {/* Studios Grid */}
        <div className="md:col-span-3">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : studios.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {studios.map((studio) => (
                  <Card key={studio.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-40 relative">
                      {studio.banner_url ? (
                        <Image
                          src={studio.banner_url}
                          alt={studio.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <div className="flex flex-col items-center">
                            <Building2 className="h-12 w-12 text-gray-400" />
                            <span className="text-sm text-gray-500 mt-2">No banner image</span>
                          </div>
                        </div>
                      )}
                      
                      {studio.logo_url && (
                        <div className="absolute bottom-0 left-4 transform translate-y-1/2">
                          <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white dark:border-gray-950 bg-white dark:bg-gray-950">
                            <div className="relative w-full h-full">
                              <Image
                                src={studio.logo_url}
                                alt={`${studio.name} logo`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <CardHeader className={studio.logo_url ? "pt-8 pb-2" : "pb-2"}>
                      <CardTitle className="text-lg">{studio.name}</CardTitle>
                      {studio.city && (
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{studio.city}, {studio.state || ''}</span>
                        </div>
                      )}
                    </CardHeader>
                    
                    <CardContent className="pb-2">
                      {studio.description && (
                        <p className="text-sm line-clamp-2 mb-3">
                          {studio.description}
                        </p>
                      )}
                      
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-2">
                          {studio.studio_artists?.length || 0} Artists
                        </Badge>
                        
                        {studio.is_verified && (
                          <Badge variant="secondary">
                            Verified
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                    
                    <CardFooter className="flex justify-between items-center pt-2">
                      <div className="flex space-x-2">
                        {studio.instagram_handle && (
                          <a 
                            href={`https://instagram.com/${studio.instagram_handle}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            <Instagram className="h-4 w-4" />
                          </a>
                        )}
                        
                        {studio.website && (
                          <a 
                            href={studio.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                      
                      <Button asChild size="sm">
                        <Link href={`/studios/${studio.id}`}>View Studio</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center justify-center px-4 border rounded-md">
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 border border-dashed rounded-lg">
              <Store className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No studios found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                We couldn't find any studios matching your search criteria. Try adjusting your filters.
              </p>
              <Button onClick={clearAllFilters}>Clear All Filters</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
