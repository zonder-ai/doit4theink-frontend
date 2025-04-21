"use client"

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DesignCard from '@/components/design-card'
import { fetchDesigns, fetchStyles, fetchTags } from '@/lib/supabase'

export default function DesignsPage() {
  const searchParams = useSearchParams()
  const [designs, setDesigns] = useState<any[]>([])
  const [totalDesigns, setTotalDesigns] = useState(0)
  const [styles, setStyles] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  
  // Filter states
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined)
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined)
  const [isColor, setIsColor] = useState<boolean | undefined>(undefined)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  
  useEffect(() => {
    // Check for search parameters
    const styleParam = searchParams.get('style')
    const tagParam = searchParams.get('tag')
    const minParam = searchParams.get('min')
    const maxParam = searchParams.get('max')
    const colorParam = searchParams.get('color')
    const searchParam = searchParams.get('q')
    
    if (styleParam) setSelectedStyles(styleParam.split(','))
    if (tagParam) setSelectedTags(tagParam.split(','))
    if (minParam) setMinPrice(Number(minParam))
    if (maxParam) setMaxPrice(Number(maxParam))
    if (colorParam) setIsColor(colorParam === 'true')
    if (searchParam) setSearchTerm(searchParam)
    
    // Load designs, styles and tags
    const loadData = async () => {
      setIsLoading(true)
      
      try {
        // Fetch styles and tags for filter options
        const stylesData = await fetchStyles()
        const tagsData = await fetchTags()
        
        setStyles(stylesData)
        setTags(tagsData)
        
        // Fetch designs with applied filters
        const { designs, total } = await fetchDesigns({
          page: 1,
          limit: 12,
          styleIds: styleParam ? styleParam.split(',') : [],
          tagIds: tagParam ? tagParam.split(',') : [],
          minPrice: minParam ? Number(minParam) : undefined,
          maxPrice: maxParam ? Number(maxParam) : undefined,
          isColor: colorParam ? colorParam === 'true' : undefined,
          searchTerm: searchParam || undefined,
        })
        
        setDesigns(designs)
        setTotalDesigns(total)
        setPage(1)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [searchParams])
  
  const loadMoreDesigns = async () => {
    setIsLoading(true)
    
    try {
      const nextPage = page + 1
      
      const { designs: moreDesigns } = await fetchDesigns({
        page: nextPage,
        limit: 12,
        styleIds: selectedStyles,
        tagIds: selectedTags,
        minPrice,
        maxPrice,
        isColor,
        searchTerm: searchTerm || undefined,
      })
      
      setDesigns(prevDesigns => [...prevDesigns, ...moreDesigns])
      setPage(nextPage)
    } catch (error) {
      console.error('Error loading more designs:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const applyFilters = async () => {
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
        searchTerm: searchTerm || undefined,
      })
      
      setDesigns(filteredDesigns)
      setTotalDesigns(total)
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
    setSelectedTags([])
    setMinPrice(undefined)
    setMaxPrice(undefined)
    setIsColor(undefined)
    setSearchTerm('')
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
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tattoo Designs</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Browse our collection of tattoo designs from talented artists
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
            
            {/* Search */}
            <div className="mb-6">
              <label htmlFor="search" className="block text-sm font-medium mb-2">
                Search
              </label>
              <input
                type="text"
                id="search"
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Search designs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
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
            
            <Button onClick={applyFilters} className="w-full">
              Apply Filters
            </Button>
          </div>
        </div>
        
        {/* Designs Grid */}
        <div className="flex-1">
          {isLoading && designs.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="h-80 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : designs.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No designs found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Try adjusting your filters or search term
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