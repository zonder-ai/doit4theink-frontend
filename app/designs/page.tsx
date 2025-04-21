"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { fetchDesigns, fetchStyles, fetchTags } from '@/lib/supabase'
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
import { Search, Filter, Paintbrush, Trash, Loader2 } from 'lucide-react'

export default function DesignsPage() {
  // State for designs and pagination
  const [designs, setDesigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalDesigns, setTotalDesigns] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [styles, setStyles] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [isColor, setIsColor] = useState<boolean | null>(null)
  const [location, setLocation] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  
  const ITEMS_PER_PAGE = 12
  
  useEffect(() => {
    // Fetch styles and tags on mount
    const loadFilters = async () => {
      const stylesData = await fetchStyles()
      const tagsData = await fetchTags()
      
      setStyles(stylesData)
      setTags(tagsData)
    }
    
    loadFilters()
  }, [])
  
  useEffect(() => {
    // Fetch designs whenever filters change
    const loadDesigns = async () => {
      setLoading(true)
      
      const styleIds = selectedStyles.length > 0 ? styles
        .filter(style => selectedStyles.includes(style.name))
        .map(style => style.id) : []
        
      const tagIds = selectedTags.length > 0 ? tags
        .filter(tag => selectedTags.includes(tag.name))
        .map(tag => tag.id) : []
      
      const { designs, total } = await fetchDesigns({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        styleIds,
        tagIds,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        isColor,
        location,
        searchTerm,
      })
      
      setDesigns(designs)
      setTotalDesigns(total)
      setLoading(false)
    }
    
    loadDesigns()
  }, [currentPage, selectedStyles, selectedTags, priceRange, isColor, location, searchTerm, styles, tags])
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const searchInput = document.getElementById('search-designs') as HTMLInputElement
    setSearchTerm(searchInput.value)
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
  
  const handleTagSelect = (tagName: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tagName)) {
        return prev.filter(tag => tag !== tagName)
      } else {
        return [...prev, tagName]
      }
    })
    setCurrentPage(1)
  }
  
  const handlePriceChange = (values: number[]) => {
    setPriceRange([values[0], values[1]])
  }
  
  const handleColorFilterChange = (value: string) => {
    if (value === 'all') {
      setIsColor(null)
    } else if (value === 'color') {
      setIsColor(true)
    } else {
      setIsColor(false)
    }
    setCurrentPage(1)
  }
  
  const clearAllFilters = () => {
    setSelectedStyles([])
    setSelectedTags([])
    setPriceRange([0, 1000])
    setIsColor(null)
    setLocation('')
    setSearchTerm('')
    setCurrentPage(1)
    
    const searchInput = document.getElementById('search-designs') as HTMLInputElement
    if (searchInput) {
      searchInput.value = ''
    }
  }
  
  const totalPages = Math.ceil(totalDesigns / ITEMS_PER_PAGE)
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Browse Tattoo Designs</h1>
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
              id="search-designs"
              type="text"
              placeholder="Search designs, styles, artists..."
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
                <AccordionTrigger>Styles</AccordionTrigger>
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
            
            {/* Tags Filter */}
            <Accordion type="single" collapsible>
              <AccordionItem value="tags">
                <AccordionTrigger>Tags</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {tags.map(tag => (
                      <div key={tag.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tag-${tag.id}`}
                          checked={selectedTags.includes(tag.name)}
                          onCheckedChange={() => handleTagSelect(tag.name)}
                        />
                        <label
                          htmlFor={`tag-${tag.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {tag.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            {/* Price Range Filter */}
            <Accordion type="single" collapsible>
              <AccordionItem value="price">
                <AccordionTrigger>Price Range</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                    <Slider
                      defaultValue={[0, 1000]}
                      min={0}
                      max={1000}
                      step={50}
                      value={[priceRange[0], priceRange[1]]}
                      onValueChange={handlePriceChange}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            {/* Color Filter */}
            <Accordion type="single" collapsible>
              <AccordionItem value="color">
                <AccordionTrigger>Color</AccordionTrigger>
                <AccordionContent>
                  <Select
                    onValueChange={handleColorFilterChange}
                    value={isColor === null ? 'all' : isColor ? 'color' : 'blackAndGrey'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select color option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="color">Color</SelectItem>
                      <SelectItem value="blackAndGrey">Black & Grey</SelectItem>
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
        
        {/* Designs Grid */}
        <div className="md:col-span-3">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : designs.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {designs.map((design) => (
                  <Card key={design.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-square relative">
                      {design.design_images && design.design_images[0] ? (
                        <Image
                          src={design.design_images[0].image_url}
                          alt={design.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                          <Paintbrush className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <CardHeader className="py-3">
                      <CardTitle className="text-lg">{design.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        {design.artist_name || 'Unknown Artist'}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {design.styles?.slice(0, 2).map((style: any) => (
                          <span
                            key={style.id}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary"
                          >
                            {style.name}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center">
                      <div className="font-semibold">${design.base_price}</div>
                      <Button asChild size="sm">
                        <Link href={`/designs/${design.id}`}>View Details</Link>
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
              <Paintbrush className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No designs found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                We couldn't find any designs matching your filters. Try adjusting your search criteria.
              </p>
              <Button onClick={clearAllFilters}>Clear All Filters</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
