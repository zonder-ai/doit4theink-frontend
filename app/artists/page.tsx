"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { fetchArtists, fetchStyles } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Search, 
  Filter, 
  Trash, 
  Loader2, 
  MapPin, 
  Star, 
  Instagram, 
  ExternalLink,
  User,
  PaintBrush
} from 'lucide-react'

export default function ArtistsPage() {
  // State for artists and pagination
  const [artists, setArtists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalArtists, setTotalArtists] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [styles, setStyles] = useState<any[]>([])
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [minRating, setMinRating] = useState<number | null>(null)
  const [location, setLocation] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  
  const ITEMS_PER_PAGE = 12
  
  useEffect(() => {
    // Fetch styles on mount
    const loadStyles = async () => {
      const stylesData = await fetchStyles()
      setStyles(stylesData)
    }
    
    loadStyles()
  }, [])
  
  useEffect(() => {
    // Fetch artists whenever filters change
    const loadArtists = async () => {
      setLoading(true)
      
      const styleIds = selectedStyles.length > 0 ? styles
        .filter(style => selectedStyles.includes(style.name))
        .map(style => style.id) : []
      
      const { artists, total } = await fetchArtists({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        styleIds,
        minRating,
        location,
      })
      
      setArtists(artists)
      setTotalArtists(total)
      setLoading(false)
    }
    
    loadArtists()
  }, [currentPage, selectedStyles, minRating, location, styles])
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const searchInput = document.getElementById('search-artists') as HTMLInputElement
    setSearchTerm(searchInput.value)
    // In a real implementation, you might want to include searchTerm in your fetchArtists call
    setCurrentPage(1)
  }
  
  const handleStyleSelect = (styleName: string) => {
    setSelectedStyles(prev => {
      if (prev.includes(styleName)) {
        return prev.filter(style => style !== styleName)
      } else {
        return [...prev, styleName]
      }
    })
    setCurrentPage(1)
  }
  
  const handleRatingChange = (value: string) => {
    const rating = value === 'any' ? null : parseInt(value, 10)
    setMinRating(rating)
    setCurrentPage(1)
  }
  
  const clearAllFilters = () => {
    setSelectedStyles([])
    setMinRating(null)
    setLocation('')
    setSearchTerm('')
    setCurrentPage(1)
    
    const searchInput = document.getElementById('search-artists') as HTMLInputElement
    if (searchInput) {
      searchInput.value = ''
    }
  }
  
  const totalPages = Math.ceil(totalArtists / ITEMS_PER_PAGE)
  
  function getInitials(name: string) {
    if (!name) return 'NA'
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Find Tattoo Artists</h1>
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
              id="search-artists"
              type="text"
              placeholder="Search artists by name, style, or location..."
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
            
            {/* Styles Filter */}
            <Accordion type="single" collapsible defaultValue="styles">
              <AccordionItem value="styles">
                <AccordionTrigger>Tattoo Styles</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {styles.map(style => (
                      <div key={style.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`style-${style.id}`}
                          checked={selectedStyles.includes(style.name)}
                          onCheckedChange={() => handleStyleSelect(style.name)}
                        />
                        <label
                          htmlFor={`style-${style.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {style.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            {/* Rating Filter */}
            <Accordion type="single" collapsible>
              <AccordionItem value="rating">
                <AccordionTrigger>Minimum Rating</AccordionTrigger>
                <AccordionContent>
                  <Select
                    onValueChange={handleRatingChange}
                    value={minRating?.toString() || 'any'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Rating</SelectItem>
                      <SelectItem value="3">3+ Stars</SelectItem>
                      <SelectItem value="4">4+ Stars</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            {/* Location Filter */}
            <Accordion type="single" collapsible>
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
        
        {/* Artists Grid */}
        <div className="md:col-span-3">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : artists.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {artists.map((artist) => (
                  <Card key={artist.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={artist.avatar_url} alt={artist.artist_name} />
                          <AvatarFallback>{getInitials(artist.artist_name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{artist.artist_name}</CardTitle>
                          {artist.average_rating && (
                            <div className="flex items-center">
                              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500 mr-1" />
                              <span className="text-sm">{artist.average_rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pb-2">
                      {artist.city && (
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{artist.city}, {artist.state || ''}</span>
                        </div>
                      )}
                      
                      {artist.bio && (
                        <p className="text-sm line-clamp-2 mb-2">
                          {artist.bio}
                        </p>
                      )}
                      
                      {artist.years_experience && (
                        <Badge variant="outline" className="mb-2">
                          {artist.years_experience} years experience
                        </Badge>
                      )}
                    </CardContent>
                    
                    <CardFooter className="flex justify-between items-center pt-2">
                      <div className="flex space-x-2">
                        {artist.instagram_handle && (
                          <a 
                            href={`https://instagram.com/${artist.instagram_handle}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            <Instagram className="h-4 w-4" />
                          </a>
                        )}
                        
                        {artist.portfolio_url && (
                          <a 
                            href={artist.portfolio_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                      
                      <Button asChild size="sm">
                        <Link href={`/artists/${artist.id}`}>View Profile</Link>
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
              <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No artists found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                We couldn't find any artists matching your filters. Try adjusting your search criteria.
              </p>
              <Button onClick={clearAllFilters}>Clear All Filters</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
