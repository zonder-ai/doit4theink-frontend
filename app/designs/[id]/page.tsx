"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ArrowLeft, ArrowRight, User, MapPin, Calendar, DollarSign, Clock, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { fetchDesignById, fetchDesigns } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import DesignCard from '@/components/design-card'

export default function DesignDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [design, setDesign] = useState<any>(null)
  const [relatedDesigns, setRelatedDesigns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  
  useEffect(() => {
    const loadDesign = async () => {
      setIsLoading(true)
      
      try {
        const designData = await fetchDesignById(params.id)
        
        if (!designData) {
          // Design not found, redirect to designs page
          router.push('/designs')
          return
        }
        
        setDesign(designData)
        
        // Fetch related designs by the same artist or style
        if (designData) {
          const styleIds = designData.design_styles?.map((ds: any) => ds.styles.id) || []
          
          const { designs } = await fetchDesigns({
            limit: 4,
            artistId: designData.artist_id,
            styleIds,
          })
          
          // Filter out the current design
          const filtered = designs.filter((d: any) => d.id !== params.id)
          setRelatedDesigns(filtered.slice(0, 3)) // Limit to 3 related designs
        }
      } catch (error) {
        console.error('Error loading design:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadDesign()
  }, [params.id, router])
  
  const handlePrevImage = () => {
    if (!design?.design_images?.length) return
    
    setActiveImageIndex((prev) => 
      prev === 0 ? design.design_images.length - 1 : prev - 1
    )
  }
  
  const handleNextImage = () => {
    if (!design?.design_images?.length) return
    
    setActiveImageIndex((prev) => 
      prev === design.design_images.length - 1 ? 0 : prev + 1
    )
  }
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 mb-8 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-800 rounded"></div>
              <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-800 rounded"></div>
              <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-800 rounded"></div>
              <div className="h-24 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
              <div className="h-10 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (!design) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Design not found</h1>
        <p className="mb-6">The design you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link href="/designs">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Designs
          </Link>
        </Button>
      </div>
    )
  }
  
  const images = design.design_images || []
  const activeImage = images.length > 0 ? images[activeImageIndex]?.image_url : null
  
  const styles = design.design_styles?.map((ds: any) => ds.styles) || []
  const tags = design.design_tags?.map((dt: any) => dt.tags) || []
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/designs">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Designs
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Design Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg border bg-white dark:bg-gray-950">
            {activeImage ? (
              <Image
                src={activeImage}
                alt={design.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                <span className="text-gray-400 dark:text-gray-500">No image available</span>
              </div>
            )}
            
            {images.length > 1 && (
              <>
                <button
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                  onClick={handlePrevImage}
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                  onClick={handleNextImage}
                >
                  <ArrowRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
          
          {/* Thumbnail Gallery */}
          {images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto py-2">
              {images.map((image: any, index: number) => (
                <button
                  key={image.id}
                  className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border ${
                    index === activeImageIndex ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setActiveImageIndex(index)}
                >
                  <Image
                    src={image.image_url}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Design Info */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{design.title}</h1>
          
          {/* Artist Info */}
          <div className="flex items-center mb-4">
            <User className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm text-gray-500 dark:text-gray-400">By </span>
            <Link 
              href={`/artists/${design.artist_id}`}
              className="ml-1 text-sm font-medium hover:text-primary transition-colors"
            >
              {design.artist_profiles?.artist_name || 'Unknown Artist'}
            </Link>
            
            {design.studio_id && design.studios && (
              <>
                <span className="mx-1 text-sm text-gray-500 dark:text-gray-400">at</span>
                <Link 
                  href={`/studios/${design.studio_id}`}
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  {design.studios.name}
                </Link>
              </>
            )}
          </div>
          
          {/* Location */}
          {(design.artist_profiles?.city || design.studios?.city) && (
            <div className="flex items-center mb-4">
              <MapPin className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {design.artist_profiles?.city || design.studios?.city}
                {(design.artist_profiles?.state || design.studios?.state) && 
                  `, ${design.artist_profiles?.state || design.studios?.state}`
                }
              </span>
            </div>
          )}
          
          {/* Design Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {design.is_flash && (
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                Flash
              </span>
            )}
            {design.is_custom && (
              <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-100">
                Custom
              </span>
            )}
            {design.is_color && (
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
                Color
              </span>
            )}
            {!design.is_color && (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                Black & Grey
              </span>
            )}
            {design.size && (
              <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-100">
                {design.size}
              </span>
            )}
          </div>
          
          {/* Description */}
          {design.description && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {design.description}
              </p>
            </div>
          )}
          
          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Price */}
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                <DollarSign className="mr-1 h-4 w-4" />
                Price
              </span>
              <span className="font-semibold text-lg">
                {design.base_price ? formatCurrency(design.base_price) : 'Contact for price'}
              </span>
            </div>
            
            {/* Deposit */}
            {design.deposit_amount > 0 && (
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                  <DollarSign className="mr-1 h-4 w-4" />
                  Deposit
                </span>
                <span className="font-semibold text-lg">
                  {formatCurrency(design.deposit_amount)}
                </span>
              </div>
            )}
            
            {/* Estimated Time */}
            {design.estimated_hours > 0 && (
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  Est. Time
                </span>
                <span className="font-semibold">
                  {design.estimated_hours} {design.estimated_hours === 1 ? 'hour' : 'hours'}
                </span>
              </div>
            )}
            
            {/* Placement */}
            {design.placement && (
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">Placement</span>
                <span className="font-semibold">{design.placement}</span>
              </div>
            )}
          </div>
          
          {/* Styles and Tags */}
          {(styles.length > 0 || tags.length > 0) && (
            <div className="mb-6">
              {styles.length > 0 && (
                <div className="mb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center mb-1">
                    <Tag className="mr-1 h-4 w-4" />
                    Styles
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {styles.map((style: any) => (
                      <Link 
                        key={style.id}
                        href={`/designs?style=${style.id}`}
                        className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                      >
                        {style.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              
              {tags.length > 0 && (
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center mb-1">
                    <Tag className="mr-1 h-4 w-4" />
                    Tags
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {tags.map((tag: any) => (
                      <Link 
                        key={tag.id}
                        href={`/designs?tag=${tag.id}`}
                        className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                      >
                        {tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Booking Button */}
          <Button className="w-full" size="lg" asChild>
            <Link href={`/booking/${design.artist_id}?design=${design.id}`}>
              <Calendar className="mr-2 h-4 w-4" />
              Book This Design
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Related Designs */}
      {relatedDesigns.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">More Designs You Might Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedDesigns.map((relatedDesign: any) => (
              <DesignCard
                key={relatedDesign.id}
                id={relatedDesign.id}
                title={relatedDesign.title}
                imageUrl={relatedDesign.primary_image_url}
                price={relatedDesign.base_price}
                depositAmount={relatedDesign.deposit_amount}
                artistName={relatedDesign.artist_name}
                studioName={relatedDesign.studio_name}
                location={relatedDesign.city ? `${relatedDesign.city}, ${relatedDesign.state}` : undefined}
                styles={relatedDesign.styles}
                isFlash={relatedDesign.is_flash}
                isCustom={relatedDesign.is_custom}
                isColor={relatedDesign.is_color}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}