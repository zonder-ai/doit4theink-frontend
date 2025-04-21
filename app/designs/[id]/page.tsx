"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { fetchDesignById } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  ChevronLeft,
  Clock,
  DollarSign,
  CalendarIcon,
  Bookmark,
  Star,
  Paintbrush,
  MapPin,
  ArrowRight,
  Instagram,
  ExternalLink,
  Loader2,
  User,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function DesignDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [design, setDesign] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [availableSlots, setAvailableSlots] = useState<any[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  
  useEffect(() => {
    const loadDesign = async () => {
      setLoading(true)
      
      try {
        const designData = await fetchDesignById(params.id)
        
        if (designData) {
          setDesign(designData)
          
          // Set the first image as the selected image if available
          if (designData.design_images && designData.design_images.length > 0) {
            setSelectedImage(designData.design_images[0].image_url)
          }
        } else {
          // Design not found
          toast({
            title: "Design not found",
            description: "The design you're looking for doesn't exist or has been removed.",
            variant: "destructive",
          })
          
          // Redirect to designs page after a delay
          setTimeout(() => {
            router.push('/designs')
          }, 2000)
        }
      } catch (error) {
        console.error('Error loading design:', error)
        toast({
          title: "Error",
          description: "There was a problem loading the design. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    loadDesign()
  }, [params.id, router, toast])
  
  // Mock function to fetch available slots for a date
  const fetchAvailableSlotsForDate = async (date: Date) => {
    setIsLoadingSlots(true)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock data - in real implementation, you'd fetch from your API
    const slots = [
      { id: '1', startTime: '10:00', endTime: '11:30' },
      { id: '2', startTime: '12:00', endTime: '13:30' },
      { id: '3', startTime: '14:00', endTime: '15:30' },
      { id: '4', startTime: '16:00', endTime: '17:30' },
    ]
    
    setAvailableSlots(slots)
    setIsLoadingSlots(false)
  }
  
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    setSelectedSlot(null)
    
    if (date) {
      fetchAvailableSlotsForDate(date)
    } else {
      setAvailableSlots([])
    }
  }
  
  const handleSlotSelect = (slotId: string) => {
    setSelectedSlot(slotId)
  }
  
  const handleBooking = () => {
    if (!selectedDate || !selectedSlot) {
      toast({
        title: "Selection Required",
        description: "Please select a date and time slot for your appointment.",
        variant: "destructive",
      })
      return
    }
    
    // In a real app, you'd navigate to a booking confirmation/payment page
    router.push(`/booking/confirm?design=${params.id}&date=${format(selectedDate, 'yyyy-MM-dd')}&slot=${selectedSlot}`)
  }
  
  const handleAddToFavorites = async () => {
    // In a real implementation, this would add to the user's favorites
    toast({
      title: "Added to Favorites",
      description: "This design has been added to your favorites.",
    })
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  
  if (!design) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Design Not Found</h1>
        <p className="mb-6">The design you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link href="/designs">Browse Designs</Link>
        </Button>
      </div>
    )
  }
  
  const primaryImage = selectedImage || (design.design_images?.[0]?.image_url || null)
  const artist = design.artist_profiles || {}
  const studio = design.studios || {}
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/designs">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Designs
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">{design.title}</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Design Images */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-950 rounded-lg border overflow-hidden">
            <div className="aspect-square relative">
              {primaryImage ? (
                <Image
                  src={primaryImage}
                  alt={design.title}
                  fill
                  className="object-contain"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                  <Paintbrush className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>
            
            {/* Thumbnails */}
            {design.design_images && design.design_images.length > 1 && (
              <div className="p-4 border-t">
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {design.design_images.map((image: any) => (
                    <button
                      key={image.id}
                      className={`w-16 h-16 flex-shrink-0 rounded overflow-hidden border-2 ${
                        selectedImage === image.image_url ? 'border-primary' : 'border-transparent'
                      }`}
                      onClick={() => setSelectedImage(image.image_url)}
                    >
                      <div className="relative w-full h-full">
                        <Image
                          src={image.image_url}
                          alt={design.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-8">
            <Tabs defaultValue="details">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="artist">Artist</TabsTrigger>
                <TabsTrigger value="studio">Studio</TabsTrigger>
              </TabsList>
              
              {/* Design Details Tab */}
              <TabsContent value="details" className="bg-white dark:bg-gray-950 rounded-lg border p-6 mt-4">
                <h2 className="text-xl font-semibold mb-4">Design Details</h2>
                
                <div className="prose dark:prose-invert max-w-none mb-6">
                  <p>{design.description || 'No description provided.'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-gray-500">Size</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg font-medium">{design.size || 'Custom'}</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-gray-500">Style</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1">
                        {design.design_styles?.map((styleObj: any) => (
                          <Badge key={styleObj.id} variant="outline">
                            {styleObj.styles?.name || 'Unknown Style'}
                          </Badge>
                        )) || <p className="text-lg font-medium">Custom</p>}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-gray-500">Color</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg font-medium">
                        {design.is_color ? 'Color' : 'Black & Grey'}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-gray-500">Estimated Time</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-gray-500" />
                      <p className="text-lg font-medium">
                        {design.estimated_hours ? `${design.estimated_hours} hours` : 'Varies'}
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                <h3 className="font-semibold mb-2">Recommended Placement</h3>
                <p className="mb-4">{design.placement || 'Flexible - discuss with artist'}</p>
                
                <h3 className="font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-1">
                  {design.design_tags?.map((tagObj: any) => (
                    <Badge key={tagObj.id} variant="secondary">
                      {tagObj.tags?.name || 'Unknown Tag'}
                    </Badge>
                  )) || <p>No tags specified</p>}
                </div>
              </TabsContent>
              
              {/* Artist Tab */}
              <TabsContent value="artist" className="bg-white dark:bg-gray-950 rounded-lg border p-6 mt-4">
                <div className="flex items-center mb-6">
                  <div className="mr-4">
                    {artist.avatar_url ? (
                      <div className="w-16 h-16 rounded-full overflow-hidden relative">
                        <Image
                          src={artist.avatar_url}
                          alt={artist.artist_name || 'Artist'}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                        <User className="h-8 w-8 text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{artist.artist_name || 'Unknown Artist'}</h2>
                    <p className="text-gray-500">
                      {artist.years_experience ? `${artist.years_experience} years of experience` : 'Tattoo Artist'}
                    </p>
                  </div>
                </div>
                
                {artist.bio && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">About the Artist</h3>
                    <p>{artist.bio}</p>
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Location</h3>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-gray-500" />
                    <p>
                      {artist.city ? (
                        `${artist.city}, ${artist.state || ''} ${artist.country || ''}`
                      ) : (
                        studio.city ? (
                          `${studio.city}, ${studio.state || ''} ${studio.country || ''}`
                        ) : (
                          'Location not specified'
                        )
                      )}
                    </p>
                  </div>
                </div>
                
                {artist.availability_notice && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">Availability Notice</h3>
                    <p>{artist.availability_notice}</p>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-3">
                  {artist.portfolio_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={artist.portfolio_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Portfolio
                      </a>
                    </Button>
                  )}
                  
                  {artist.instagram_handle && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`https://instagram.com/${artist.instagram_handle}`} target="_blank" rel="noopener noreferrer">
                        <Instagram className="h-4 w-4 mr-2" />
                        @{artist.instagram_handle}
                      </a>
                    </Button>
                  )}
                  
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/artists/${artist.id}`}>
                      View Profile
                    </Link>
                  </Button>
                </div>
              </TabsContent>
              
              {/* Studio Tab */}
              <TabsContent value="studio" className="bg-white dark:bg-gray-950 rounded-lg border p-6 mt-4">
                {studio.id ? (
                  <>
                    <div className="flex items-center mb-6">
                      <div className="mr-4">
                        {studio.logo_url ? (
                          <div className="w-16 h-16 rounded-md overflow-hidden relative">
                            <Image
                              src={studio.logo_url}
                              alt={studio.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-md bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                            <Building2 className="h-8 w-8 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">{studio.name}</h2>
                        <p className="text-gray-500">Tattoo Studio</p>
                      </div>
                    </div>
                    
                    {studio.description && (
                      <div className="mb-6">
                        <h3 className="font-semibold mb-2">About the Studio</h3>
                        <p>{studio.description}</p>
                      </div>
                    )}
                    
                    <div className="mb-6">
                      <h3 className="font-semibold mb-2">Location</h3>
                      <div className="flex items-start mb-2">
                        <MapPin className="h-5 w-5 mr-2 mt-0.5 text-gray-500 flex-shrink-0" />
                        <p>
                          {studio.address ? (
                            <>
                              {studio.address}<br />
                              {studio.city}, {studio.state} {studio.postal_code}<br />
                              {studio.country}
                            </>
                          ) : (
                            `${studio.city}, ${studio.state || ''} ${studio.country || ''}`
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="font-semibold mb-2">Contact</h3>
                      <p className="mb-1">{studio.contact_email}</p>
                      {studio.contact_phone && <p>{studio.contact_phone}</p>}
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      {studio.website && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={studio.website} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Website
                          </a>
                        </Button>
                      )}
                      
                      {studio.instagram_handle && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={`https://instagram.com/${studio.instagram_handle}`} target="_blank" rel="noopener noreferrer">
                            <Instagram className="h-4 w-4 mr-2" />
                            @{studio.instagram_handle}
                          </a>
                        </Button>
                      )}
                      
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/studios/${studio.id}`}>
                          View Studio
                        </Link>
                      </Button>
                    </div>
                  </>
                ) : artist.is_independent ? (
                  <div className="text-center py-8">
                    <p className="text-lg font-medium mb-2">Independent Artist</p>
                    <p className="text-gray-500 mb-4">
                      This artist works independently and is not affiliated with a studio.
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/artists/${artist.id}`}>
                        View Artist Profile
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-lg font-medium mb-2">No Studio Information</p>
                    <p className="text-gray-500">
                      Studio information is not available for this design.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Booking Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>${design.base_price || 0}</span>
                <Button variant="ghost" size="sm" onClick={handleAddToFavorites}>
                  <Bookmark className="h-5 w-5" />
                </Button>
              </CardTitle>
              <CardDescription>
                {design.deposit_amount ? `$${design.deposit_amount} deposit required` : 'Deposit required to book'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Select a Date</h3>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      initialFocus
                      disabled={(date) => date < new Date() || date > new Date(new Date().setMonth(new Date().getMonth() + 3))}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {selectedDate && (
                <div>
                  <h3 className="font-semibold mb-2">Select a Time Slot</h3>
                  {isLoadingSlots ? (
                    <div className="h-40 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {availableSlots.map(slot => (
                        <Button
                          key={slot.id}
                          variant={selectedSlot === slot.id ? "default" : "outline"}
                          size="sm"
                          className="justify-center"
                          onClick={() => handleSlotSelect(slot.id)}
                        >
                          {slot.startTime} - {slot.endTime}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="h-40 flex items-center justify-center">
                      <p className="text-gray-500 text-center">
                        No available slots for this date.
                        <br />
                        Please select another date.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleBooking} disabled={!selectedDate || !selectedSlot}>
                Book Appointment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
          
          {/* Artist Quick Info */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Artist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="mr-3">
                  {artist.avatar_url ? (
                    <div className="w-10 h-10 rounded-full overflow-hidden relative">
                      <Image
                        src={artist.avatar_url}
                        alt={artist.artist_name || 'Artist'}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-500" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium">{artist.artist_name || 'Unknown Artist'}</p>
                  {artist.average_rating && (
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-sm">{artist.average_rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
