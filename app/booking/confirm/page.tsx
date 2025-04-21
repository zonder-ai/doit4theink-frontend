"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { format, parse } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { fetchDesignById } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChevronLeft,
  Clock,
  ArrowRight,
  Calendar,
  CreditCard,
  CheckCircle2,
  User,
  Paintbrush,
  Loader2,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

export default function BookingConfirmPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const designId = searchParams.get('design')
  const dateString = searchParams.get('date')
  const slotId = searchParams.get('slot')
  
  const [design, setDesign] = useState<any>(null)
  const [bookingDate, setBookingDate] = useState<Date | null>(null)
  const [timeSlot, setTimeSlot] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [notes, setNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  
  useEffect(() => {
    // Check if all required params are present
    if (!designId || !dateString || !slotId) {
      toast({
        title: "Missing Information",
        description: "Required booking information is missing. Please try booking again.",
        variant: "destructive",
      })
      
      // Redirect back to designs page
      setTimeout(() => {
        router.push('/designs')
      }, 2000)
      return
    }
    
    // Parse the date
    try {
      const date = parse(dateString, 'yyyy-MM-dd', new Date())
      setBookingDate(date)
    } catch (error) {
      console.error('Error parsing date:', error)
      toast({
        title: "Invalid Date",
        description: "The booking date is invalid. Please try booking again.",
        variant: "destructive",
      })
      
      // Redirect back to designs page
      setTimeout(() => {
        router.push('/designs')
      }, 2000)
      return
    }
    
    // Simulate fetching time slot details
    // In a real implementation, you'd fetch this from your API
    setTimeSlot({
      id: slotId,
      startTime: slotId === '1' ? '10:00' : slotId === '2' ? '12:00' : slotId === '3' ? '14:00' : '16:00',
      endTime: slotId === '1' ? '11:30' : slotId === '2' ? '13:30' : slotId === '3' ? '15:30' : '17:30',
    })
    
    const loadData = async () => {
      setLoading(true)
      
      try {
        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          // Not authenticated, redirect to sign in
          toast({
            title: "Authentication Required",
            description: "Please sign in to continue with your booking.",
          })
          
          router.push(`/auth/signin?redirect=${encodeURIComponent(`/booking/confirm?design=${designId}&date=${dateString}&slot=${slotId}`)}`)
          return
        }
        
        setUser(user)
        
        // Fetch user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*, client_profiles(*)')
          .eq('id', user.id)
          .single()
        
        if (profileData) {
          setUserProfile(profileData)
          
          // Check if user is a client
          if (profileData.user_type !== 'client') {
            toast({
              title: "Client Account Required",
              description: "You need a client account to book appointments.",
              variant: "destructive",
            })
            
            // Redirect to profile creation
            setTimeout(() => {
              router.push('/profile/create?type=client')
            }, 2000)
            return
          }
        } else {
          // No profile found, redirect to profile creation
          toast({
            title: "Profile Required",
            description: "Please create a profile to continue with your booking.",
          })
          
          router.push('/profile/create?type=client')
          return
        }
        
        // Fetch design details
        const designData = await fetchDesignById(designId)
        if (designData) {
          setDesign(designData)
        } else {
          toast({
            title: "Design Not Found",
            description: "The selected design could not be found.",
            variant: "destructive",
          })
          
          // Redirect back to designs page
          setTimeout(() => {
            router.push('/designs')
          }, 2000)
        }
      } catch (error) {
        console.error('Error loading data:', error)
        toast({
          title: "Error",
          description: "There was a problem loading your booking information.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [designId, dateString, slotId, router, toast])
  
  const handlePayment = async () => {
    if (!design || !bookingDate || !timeSlot || !user) return
    
    setIsProcessing(true)
    
    try {
      // In a real implementation, you would:
      // 1. Create a booking record in your database
      // 2. Generate a Stripe payment intent for the deposit amount
      // 3. Redirect to Stripe Checkout or show a Stripe Elements form
      
      // Example of what the server-side endpoint might return
      // const response = await fetch('/api/create-booking', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     designId,
      //     clientId: user.id,
      //     artistId: design.artist_profiles.id,
      //     studioId: design.studios?.id,
      //     bookingDate: format(bookingDate, 'yyyy-MM-dd'),
      //     startTime: timeSlot.startTime,
      //     endTime: timeSlot.endTime,
      //     notes,
      //     totalPrice: design.base_price,
      //     depositAmount: design.deposit_amount || design.base_price * 0.2, // 20% default deposit if not specified
      //   }),
      // })
      
      // const { bookingId, clientSecret } = await response.json()
      
      // For demonstration, we'll simulate a successful booking after a delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: "Booking Created!",
        description: "Your booking has been confirmed. You will be redirected to complete payment.",
      })
      
      // Mock redirection to payment page
      // In a real app, you'd use Stripe.js to handle the payment flow
      setTimeout(() => {
        router.push(`/booking/payment-success?bookingId=mock-booking-id`)
      }, 1500)
    } catch (error) {
      console.error('Error processing booking:', error)
      toast({
        title: "Booking Failed",
        description: "There was a problem processing your booking. Please try again.",
        variant: "destructive",
      })
      setIsProcessing(false)
    }
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  
  if (!design || !bookingDate || !timeSlot) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Booking Information Missing</h1>
        <p className="mb-6">Required information for your booking is missing or invalid.</p>
        <Button asChild>
          <Link href="/designs">Browse Designs</Link>
        </Button>
      </div>
    )
  }
  
  const artist = design.artist_profiles || {}
  const studio = design.studios || {}
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href={`/designs/${designId}`}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Design
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Confirm Your Booking</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking Summary */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
              <CardDescription>
                Review the details of your booking below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Design Details */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden relative flex-shrink-0">
                  {design.design_images && design.design_images[0] ? (
                    <Image
                      src={design.design_images[0].image_url}
                      alt={design.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Paintbrush className="h-10 w-10 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{design.title}</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                    {design.size ? `Size: ${design.size}` : ''}
                    {design.is_color !== undefined ? ` • ${design.is_color ? 'Color' : 'Black & Grey'}` : ''}
                  </p>
                  <div className="flex items-center mb-2">
                    <User className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{artist.artist_name || 'Unknown Artist'}</span>
                  </div>
                  {studio.name && (
                    <div className="flex items-start">
                      <span className="text-gray-500">at</span>
                      <div className="ml-1">
                        <p>{studio.name}</p>
                        <p className="text-sm text-gray-500">
                          {studio.address}, {studio.city}, {studio.state}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-primary" />
                      <CardTitle className="text-base">Date</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg">{format(bookingDate, 'EEEE, MMMM d, yyyy')}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-primary" />
                      <CardTitle className="text-base">Time</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg">{timeSlot.startTime} - {timeSlot.endTime}</p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Additional Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium mb-2">
                  Additional Notes for the Artist
                </label>
                <Textarea
                  id="notes"
                  placeholder="Any specific instructions or details for your tattoo..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              
              {/* Cancellation Policy */}
              <div className="text-sm border rounded-md p-4 bg-yellow-50 dark:bg-yellow-900/20">
                <h3 className="font-semibold mb-1">Cancellation Policy</h3>
                <p className="mb-2">
                  Your deposit is non-refundable if you cancel less than 48 hours before your appointment.
                </p>
                <p>
                  Rescheduling is available with at least 24 hours notice before your appointment.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Payment Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Design Price</span>
                <span>${design.base_price || 0}</span>
              </div>
              
              <div className="border-t pt-2">
                <div className="flex justify-between font-medium">
                  <span>Deposit Amount</span>
                  <span>${design.deposit_amount || (design.base_price * 0.2).toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  You will pay the remaining balance at the studio after your appointment.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex-col space-y-4">
              <Button 
                className="w-full" 
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay Deposit & Confirm
                  </>
                )}
              </Button>
              
              <p className="text-sm text-gray-500 text-center">
                Your deposit secures your appointment slot.
              </p>
            </CardFooter>
          </Card>
          
          {/* Contact Information */}
          {userProfile && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-base">Your Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><span className="font-medium">Name:</span> {userProfile.full_name}</p>
                <p><span className="font-medium">Email:</span> {userProfile.email}</p>
                {userProfile.phone && (
                  <p><span className="font-medium">Phone:</span> {userProfile.phone}</p>
                )}
                <Link
                  href="/profile"
                  className="text-primary hover:underline text-xs inline-block mt-1"
                >
                  Edit Profile
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
