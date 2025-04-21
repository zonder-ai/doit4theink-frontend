"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Search as SearchIcon, Filter, ChevronUp, ChevronDown, X, SortAsc } from 'lucide-react'
import DesignCard from '@/components/design-card'
import ArtistCard from '@/components/artist-card'
import StudioCard from '@/components/studio-card'
import { fetchDesigns, fetchArtists, fetchStudios, fetchStyles, fetchTags } from '@/lib/supabase'

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get search query and tab from URL
  const query = searchParams.get('q') || ''
  const initialTab = searchParams.get('tab') || 'designs'
  const initialSort = searchParams.get('sort') || 'newest'
  
  const [activeTab, setActiveTab] = useState(initialTab)
  const [searchTerm, setSearchTerm] = useState(query)
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState(initialSort)
  
  // Results
  const [designs, setDesigns] = useState<any[]>([])
  const [artists, setArtists] = useState<any[]>([])
  const [studios, setStudios] = useState<any[]>([])
  const [totalDesigns, setTotalDesigns] = useState(0)
  const [totalArtists, setTotalArtists] = useState(0)
  const [totalStudios, setTotalStudios] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  
  // Filter options
  const [styles, setStyles] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])
  
  // Filter state
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined)
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined)
  const [isColor, setIsColor] = useState<boolean | undefined>(undefined)
  const [location, setLocation] = useState('')
  const [minRating, setMinRating] = useState<number | undefined>(undefined)
  
  // Pagination
  const [designsPage, setDesignsPage] = useState(1)
  const [artistsPage, setArtistsPage] = useState(1)
  const [studiosPage, setStudiosPage] = useState(1)
  
  // Sort options
  const designSortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' }
  ]
  
  const artistSortOptions = [
    { value: 'rating', label: 'Highest Rated' },
    { value: 'experience', label: 'Most Experienced' },
    { value: 'name_asc', label: 'Name: A to Z' },
    { value: 'name_desc', label: 'Name: Z to A' }
  ]
  
  const studioSortOptions = [
    { value: 'name_asc', label: 'Name: A to Z' },
    { value: 'name_desc', label: 'Name: Z to A' },
    { value: 'artists', label: 'Most Artists' }
  ]
  
  // Get current sort options based on active tab
  const getCurrentSortOptions = () => {
    switch (activeTab) {
      case 'designs':
        return designSortOptions
      case 'artists':
        return artistSortOptions
      case 'studios':
        return studioSortOptions
      default:
        return designSortOptions
    }
  }
  
  // Load filter options on initial load
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const stylesData = await fetchStyles()
        const tagsData = await fetchTags()
        
        setStyles(stylesData || [])
        setTags(tagsData || [])
      } catch (error) {
        console.error('Error loading filter options:', error)
      }
    }
    
    loadFilterOptions()
  }, [])
  
  // Update URL when tab changes
  useEffect(() => {
    if (activeTab !== initialTab) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('tab', activeTab)
      router.push(`/search?${params.toString()}`)
      
      // Reset sort to default for the new tab
      if (activeTab === 'designs') setSortBy('newest')
      if (activeTab === 'artists') setSortBy('rating')
      if (activeTab === 'studios') setSortBy('name_asc')
    }
  }, [activeTab, initialTab, router, searchParams])
  
  // Update URL when sort changes
  useEffect(() => {
    if (sortBy !== initialSort) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('sort', sortBy)
      router.push(`/search?${params.toString()}`)
    }
  }, [sortBy, initialSort, router, searchParams])
  
  // Load search results when query changes
  useEffect(() => {
    if (!query) return
    
    const loadSearchResults = async () => {
      setIsLoading(true)
      
      try {
        // Search designs
        const { designs: designsResults, total: designsTotal } = await fetchDesigns({
          page: 1,
          limit: 12,
          searchTerm: query,
          sortBy: activeTab === 'designs' ? sortBy : 'newest'
        })
        
        setDesigns(designsResults || [])
        setTotalDesigns(designsTotal || 0)
        setDesignsPage(1)
        
        // Search artists
        const { artists: artistsResults, total: artistsTotal } = await fetchArtists({
          page: 1,
          limit: 12,
          // Add artist specific search params if needed
        })
        
        // Filter artists by name matching query
        const filteredArtists = artistsResults.filter((artist: any) => 
          artist.artist_name?.toLowerCase().includes(query.toLowerCase())
        )
        
        // Apply sorting to artists
        let sortedArtists = [...filteredArtists]
        if (activeTab === 'artists') {
          switch (sortBy) {
            case 'rating':
              sortedArtists.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0))
              break
            case 'experience':
              sortedArtists.sort((a, b) => (b.years_experience || 0) - (a.years_experience || 0))
              break
            case 'name_asc':
              sortedArtists.sort((a, b) => (a.artist_name || '').localeCompare(b.artist_name || ''))
              break
            case 'name_desc':
              sortedArtists.sort((a, b) => (b.artist_name || '').localeCompare(a.artist_name || ''))
              break
            default:
              break
          }
        }
        
        setArtists(sortedArtists || [])
        setTotalArtists(sortedArtists.length || 0)
        setArtistsPage(1)
        
        // Search studios
        const { studios: studiosResults, total: studiosTotal } = await fetchStudios({
          page: 1,
          limit: 12,
          // Add studio specific search params if needed
        })
        
        // Filter studios by name matching query
        const filteredStudios = studiosResults.filter((studio: any) => 
          studio.name?.toLowerCase().includes(query.toLowerCase())
        )
        
        // Apply sorting to studios
        let sortedStudios = [...filteredStudios]
        if (activeTab === 'studios') {
          switch (sortBy) {
            case 'name_asc':
              sortedStudios.sort((a, b) => a.name.localeCompare(b.name))
              break
            case 'name_desc':
              sortedStudios.sort((a, b) => b.name.localeCompare(a.name))
              break
            case 'artists':
              sortedStudios.sort((a, b) => (b.studio_artists?.length || 0) - (a.studio_artists?.length || 0))
              break
            default:
              break
          }
        }
        
        setStudios(sortedStudios || [])
        setTotalStudios(sortedStudios.length || 0)
        setStudiosPage(1)
      } catch (error) {
        console.error('Error loading search results:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadSearchResults()
  }, [query, activeTab, sortBy])
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!searchTerm.trim()) return
    
    const params = new URLSearchParams(searchParams.toString())
    params.set('q', searchTerm)
    params.set('tab', activeTab)
    router.push(`/search?${params.toString()}`)
  }
  
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value)
  }
  
  const applyDesignFilters = async () => {
    setIsLoading(true)
    
    try {
      const { designs: filteredDesigns, total } = await fetchDesigns({
        page: 1,
        limit: 12,
        styleIds: selectedStyles,
        tagIds: selectedTags,
        minPrice,
        maxPrice,
        isColor,
        searchTerm: query || undefined,
        sortBy
      })
      
      setDesigns(filteredDesigns || [])
      setTotalDesigns(total || 0)
      setDesignsPage(1)
      
      // On mobile, close filters after applying
      if (window.innerWidth < 768) {
        setShowFilters(false)
      }
    } catch (error) {
      console.error('Error applying design filters:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const applyArtistFilters = async () => {
    setIsLoading(true)
    
    try {
      const { artists: filteredArtists, total } = await fetchArtists({
        page: 1,
        limit: 12,
        styleIds: selectedStyles,
        location: location || undefined,
        minRating,
      })
      
      // Further filter by name if query is present
      let nameFilteredArtists = query
        ? filteredArtists.filter((artist: any) => 
            artist.artist_name?.toLowerCase().includes(query.toLowerCase())
          )
        : filteredArtists
      
      // Apply sorting
      switch (sortBy) {
        case 'rating':
          nameFilteredArtists.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0))
          break
        case 'experience':
          nameFilteredArtists.sort((a, b) => (b.years_experience || 0) - (a.years_experience || 0))
          break
        case 'name_asc':
          nameFilteredArtists.sort((a, b) => (a.artist_name || '').localeCompare(b.artist_name || ''))
          break
        case 'name_desc':
          nameFilteredArtists.sort((a, b) => (b.artist_name || '').localeCompare(a.artist_name || ''))
          break
        default:
          break
      }
      
      setArtists(nameFilteredArtists || [])
      setTotalArtists(nameFilteredArtists.length || 0)
      setArtistsPage(1)
      
      // On mobile, close filters after applying
      if (window.innerWidth < 768) {
        setShowFilters(false)
      }
    } catch (error) {
      console.error('Error applying artist filters:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const applyStudioFilters = async () => {
    setIsLoading(true)
    
    try {
      const { studios: filteredStudios, total } = await fetchStudios({
        page: 1,
        limit: 12,
        location: location || undefined,
      })
      
      // Further filter by name if query is present
      let nameFilteredStudios = query
        ? filteredStudios.filter((studio: any) => 
            studio.name?.toLowerCase().includes(query.toLowerCase())
          )
        : filteredStudios
      
      // Apply sorting
      switch (sortBy) {
        case 'name_asc':
          nameFilteredStudios.sort((a, b) => a.name.localeCompare(b.name))
          break
        case 'name_desc':
          nameFilteredStudios.sort((a, b) => b.name.localeCompare(a.name))
          break
        case 'artists':
          nameFilteredStudios.sort((a, b) => (b.studio_artists?.length || 0) - (a.studio_artists?.length || 0))
          break
        default:
          break
      }
      
      setStudios(nameFilteredStudios || [])
      setTotalStudios(nameFilteredStudios.length || 0)
      setStudiosPage(1)
      
      // On mobile, close filters after applying
      if (window.innerWidth < 768) {
        setShowFilters(false)
      }
    } catch (error) {
      console.error('Error applying studio filters:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const resetFilters = () => {
    setSelectedStyles([])
    setSelectedTags([])
    setMinPrice(undefined)
    setMaxPrice(undefined)
    setIsColor(undefined)
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
  
  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId) 
        : [...prev, tagId]
    )
  }
  
  const loadMoreDesigns = async () => {
    setIsLoading(true)
    
    try {
      const nextPage = designsPage + 1
      
      const { designs: moreDesigns } = await fetchDesigns({
        page: nextPage,
        limit: 12,
        styleIds: selectedStyles,
        tagIds: selectedTags,
        minPrice,
        maxPrice,
        isColor,
        searchTerm: query || undefined,
        sortBy
      })
      
      setDesigns(prevDesigns => [...prevDesigns, ...moreDesigns])
      setDesignsPage(nextPage)
    } catch (error) {
      console.error('Error loading more designs:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const loadMoreArtists = async () => {
    setIsLoading(true)
    
    try {
      const nextPage = artistsPage + 1
      
      const { artists: moreArtists } = await fetchArtists({
        page: nextPage,
        limit: 12,
        styleIds: selectedStyles,
        location: location || undefined,
        minRating,
      })
      
      // Filter by name if query is present
      let filteredMoreArtists = query
        ? moreArtists.filter((artist: any) => 
            artist.artist_name?.toLowerCase().includes(query.toLowerCase())
          )
        : moreArtists
      
      // Apply sorting
      switch (sortBy) {
        case 'rating':
          filteredMoreArtists.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0))
          break
        case 'experience':
          filteredMoreArtists.sort((a, b) => (b.years_experience || 0) - (a.years_experience || 0))
          break
        case 'name_asc':
          filteredMoreArtists.sort((a, b) => (a.artist_name || '').localeCompare(b.artist_name || ''))
          break
        case 'name_desc':
          filteredMoreArtists.sort((a, b) => (b.artist_name || '').localeCompare(a.artist_name || ''))
          break
        default:
          break
      }
      
      setArtists(prevArtists => [...prevArtists, ...filteredMoreArtists])
      setArtistsPage(nextPage)
    } catch (error) {
      console.error('Error loading more artists:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const loadMoreStudios = async () => {
    setIsLoading(true)
    
    try {
      const nextPage = studiosPage + 1
      
      const { studios: moreStudios } = await fetchStudios({
        page: nextPage,
        limit: 12,
        location: location || undefined,
      })
      
      // Filter by name if query is present
      let filteredMoreStudios = query
        ? moreStudios.filter((studio: any) => 
            studio.name?.toLowerCase().includes(query.toLowerCase())
          )
        : moreStudios
      
      // Apply sorting
      switch (sortBy) {
        case 'name_asc':
          filteredMoreStudios.sort((a, b) => a.name.localeCompare(b.name))
          break
        case 'name_desc':
          filteredMoreStudios.sort((a, b) => b.name.localeCompare(a.name))
          break
        case 'artists':
          filteredMoreStudios.sort((a, b) => (b.studio_artists?.length || 0) - (a.studio_artists?.length || 0))
          break
        default:
          break
      }
      
      setStudios(prevStudios => [...prevStudios, ...filteredMoreStudios])
      setStudiosPage(nextPage)
    } catch (error) {
      console.error('Error loading more studios:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Store search in recent searches (localStorage)
  useEffect(() => {
    if (!query) return
    
    try {
      // Get existing recent searches
      const recentSearchesJson = localStorage.getItem('recentSearches')
      const recentSearches = recentSearchesJson ? JSON.parse(recentSearchesJson) : []
      
      // Add the current search term if it doesn't exist
      if (!recentSearches.includes(query)) {
        const updatedSearches = [query, ...recentSearches.slice(0, 4)] // Keep last 5 searches
        localStorage.setItem('recentSearches', JSON.stringify(updatedSearches))
      }
    } catch (error) {
      console.error('Error storing recent searches:', error)
    }
  }, [query])
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Search</h1>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex mb-6">
          <div className="relative flex-grow">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search designs, artists, or studios..."
              className="w-full pl-10 pr-4 py-3 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button type="submit" className="rounded-l-none">
            Search
          </Button>
        </form>
        
        {/* Recent Searches */}
        {query && (
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Recent Searches</h2>
            <div className="flex flex-wrap gap-2">
              {(() => {
                try {
                  const recentSearchesJson = localStorage.getItem('recentSearches')
                  const recentSearches = recentSearchesJson ? JSON.parse(recentSearchesJson) : []
                  
                  return recentSearches.map((term: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchTerm(term)
                        const params = new URLSearchParams(searchParams.toString())
                        params.set('q', term)
                        router.push(`/search?${params.toString()}`)
                      }}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full"
                    >
                      {term}
                    </button>
                  ))
                } catch (error) {
                  return null
                }
              })()}
            </div>
          </div>
        )}
        
        {/* Search Results */}
        <Tabs
          defaultValue="designs"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="designs">
                Designs{totalDesigns > 0 && ` (${totalDesigns})`}
              </TabsTrigger>
              <TabsTrigger value="artists">
                Artists{totalArtists > 0 && ` (${totalArtists})`}
              </TabsTrigger>
              <TabsTrigger value="studios">
                Studios{totalStudios > 0 && ` (${totalStudios})`}
              </TabsTrigger>
            </TabsList>
            
            {/* Mobile Filter Toggle Button */}
            <div className="md:hidden">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="mr-2 h-4 w-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
                {showFilters ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {/* Sort Controls */}
          {(designs.length > 0 || artists.length > 0 || studios.length > 0) && (
            <div className="flex justify-end mb-4">
              <div className="flex items-center">
                <SortAsc className="mr-2 h-4 w-4 text-gray-500" />
                <span className="text-sm mr-2">Sort:</span>
                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="px-2 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {getCurrentSortOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          
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
                
                {/* Tab-specific filters */}
                <TabsContent value="designs" forceMount className={activeTab === 'designs' ? 'block' : 'hidden'}>
                  {/* Price Range */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium mb-2">Price Range</h3>
                    <div className="flex space-x-2">
                      <div>
                        <label htmlFor="min-price" className="sr-only">Minimum Price</label>
                        <input
                          type="number"
                          id="min-price"
                          className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Min"
                          min="0"
                          value={minPrice || ''}
                          onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-500">-</span>
                      </div>
                      <div>
                        <label htmlFor="max-price" className="sr-only">Maximum Price</label>
                        <input
                          type="number"
                          id="max-price"
                          className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Max"
                          min="0"
                          value={maxPrice || ''}
                          onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Color Option */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium mb-2">Color Options</h3>
                    <div className="flex items-center space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio"
                          name="color"
                          checked={isColor === true}
                          onChange={() => setIsColor(true)}
                        />
                        <span className="ml-2 text-sm">Color</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio"
                          name="color"
                          checked={isColor === false}
                          onChange={() => setIsColor(false)}
                        />
                        <span className="ml-2 text-sm">Black & Grey</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio"
                          name="color"
                          checked={isColor === undefined}
                          onChange={() => setIsColor(undefined)}
                        />
                        <span className="ml-2 text-sm">Any</span>
                      </label>
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
                  
                  {/* Tags */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium mb-2">Tags</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {tags.map((tag) => (
                        <label key={tag.id} className="flex items-center">
                          <input
                            type="checkbox"
                            className="form-checkbox"
                            checked={selectedTags.includes(tag.id)}
                            onChange={() => toggleTag(tag.id)}
                          />
                          <span className="ml-2 text-sm">{tag.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <Button onClick={applyDesignFilters} className="w-full">
                    Apply Filters
                  </Button>
                </TabsContent>
                
                <TabsContent value="artists" forceMount className={activeTab === 'artists' ? 'block' : 'hidden'}>
                  {/* Minimum Rating */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium mb-2">Minimum Rating</h3>
                    <select
                      className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      value={minRating || ''}
                      onChange={(e) => setMinRating(e.target.value ? Number(e.target.value) : undefined)}
                    >
                      <option value="">Any Rating</option>
                      <option value="5">5 Stars</option>
                      <option value="4">4+ Stars</option>
                      <option value="3">3+ Stars</option>
                      <option value="2">2+ Stars</option>
                      <option value="1">1+ Stars</option>
                    </select>
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
                  
                  <Button onClick={applyArtistFilters} className="w-full">
                    Apply Filters
                  </Button>
                </TabsContent>
                
                <TabsContent value="studios" forceMount className={activeTab === 'studios' ? 'block' : 'hidden'}>
                  <Button onClick={applyStudioFilters} className="w-full mt-4">
                    Apply Filters
                  </Button>
                </TabsContent>
              </div>
            </div>
            
            {/* Results */}
            <div className="flex-1">
              <TabsContent value="designs">
                {isLoading && designs.length === 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className="h-80 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
                    ))}
                  </div>
                ) : designs.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {designs.map((design) => (
                        <DesignCard
                          key={design.id}
                          id={design.id}
                          title={design.title}
                          imageUrl={design.primary_image_url}
                          price={design.base_price}
                          depositAmount={design.deposit_amount}
                          artistName={design.artist_name}
                          studioName={design.studio_name}
                          location={design.city ? `${design.city}, ${design.state}` : undefined}
                          styles={design.styles}
                          isFlash={design.is_flash}
                          isCustom={design.is_custom}
                          isColor={design.is_color}
                        />
                      ))}
                    </div>
                    
                    {designs.length < totalDesigns && (
                      <div className="mt-8 text-center">
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={loadMoreDesigns}
                          disabled={isLoading}
                        >
                          {isLoading ? 'Loading...' : 'Load More Designs'}
                        </Button>
                      </div>
                    )}
                  </>
                ) : query ? (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium mb-2">No designs found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      No designs match your search criteria. Try adjusting your filters or search term.
                    </p>
                    <Button variant="outline" onClick={resetFilters}>
                      Reset Filters
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium mb-2">Search for designs</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Enter a search term to find designs.
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="artists">
                {isLoading && artists.length === 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className="h-80 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
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
                ) : query ? (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium mb-2">No artists found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      No artists match your search criteria. Try adjusting your filters or search term.
                    </p>
                    <Button variant="outline" onClick={resetFilters}>
                      Reset Filters
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium mb-2">Search for artists</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Enter a search term to find artists.
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="studios">
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
                ) : query ? (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium mb-2">No studios found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      No studios match your search criteria. Try adjusting your filters or search term.
                    </p>
                    <Button variant="outline" onClick={resetFilters}>
                      Reset Filters
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium mb-2">Search for studios</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Enter a search term to find studios.
                    </p>
                  </div>
                )}
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  )
}