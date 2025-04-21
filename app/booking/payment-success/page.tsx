"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CheckCircle, ArrowRight, Calendar, Home } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/ui/use-toast'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const bookingId = searchParams.get('bookingId')
  const [loading, setLoading] = useState(true)
  const [bookingDetails, setBookingDetails] = useState<any>(null)
  
  useEffect(() => {
    // If no booking ID is provided, redirect to dashboard
    if (!bookingId) {
      toast({
        title: "Missing Information",
        description: "Booking information is missing. You'll be redirected to your dashboard.",
        variant: "destructive",
      })
      
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
      return
    }
    
    const fetchBookingDetails = async () => {
      setLoading(true)
      
      try {
        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          // Not authenticated, redirect to sign in
          router.push('/auth/signin')
          return
        }
        
        // In a real implementation, you would fetch booking details from your API
        // For demonstration, we'll use mock data
        setBookingDetails({
          id: bookingId,
          design: {
            title: "Sample Tattoo Design",
            depositAmount: 50,
            basePrice: 250,
          },
          artist: {
            name: "Jane Artist"
          },
          studio: {
            name: "Ink Masters Studio",
            address: "123 Tattoo Lane, Ink City",
            contactPhone: "555-123-4567",
            contactEmail: "info@inkmasters.com",
          },
          date: "2025-05-15",
          startTime: "14:00",
          endTime: "15:30",
          status: "confirmed",
        })
        
        // Send a confirmation email in a real implementation
        // await sendConfirmationEmail(user.email, bookingDetails)
      } catch (error) {
        console.error('Error fetching booking details:', error)
        toast({
          title: "Error",
          description: "Could not retrieve your booking details. Please check your dashboard.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchBookingDetails()
  }, [bookingId, router, toast])
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }
  
  if (!bookingDetails) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Booking Not Found</h1>
        <p className="mb-6">We couldn't find details for your booking.</p>
        <Button asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-500" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Your booking has been confirmed.
          </p>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Booking Confirmation</CardTitle>
            <CardDescription>
              Your deposit payment has been received and your appointment is now scheduled.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-1">Design</h3>
              <p>{bookingDetails.design.title}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-1">Artist</h3>
                <p>{bookingDetails.artist.name}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-1">Studio</h3>
                <p>{bookingDetails.studio.name}</p>
                <p className="text-sm text-gray-500">{bookingDetails.studio.address}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-1">Date & Time</h3>
                <p>
                  {new Date(bookingDetails.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p>{bookingDetails.startTime} - {bookingDetails.endTime}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-1">Payment</h3>
                <p>Deposit Paid: ${bookingDetails.design.depositAmount}</p>
                <p className="text-sm text-gray-500">
                  Remaining Balance: ${bookingDetails.design.basePrice - bookingDetails.design.depositAmount}
                  <br />(to be paid at the studio)
                </p>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-1">Next Steps</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                <li>You'll receive a confirmation email with these details.</li>
                <li>
                  Arrive 15 minutes before your appointment time to complete paperwork.
                </li>
                <li>
                  Bring a valid photo ID with you to your appointment.
                </li>
                <li>
                  If you need to reschedule or have questions, please contact the studio 
                  at {bookingDetails.studio.contactPhone} or {bookingDetails.studio.contactEmail}.
                </li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            
            <Button variant="outline" asChild>
              <Link href="/dashboard?tab=bookings">
                <Calendar className="mr-2 h-4 w-4" />
                My Bookings
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Excited for your new tattoo?</h2>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            Browse more designs from our collection to plan your next tattoo.
          </p>
          <Button asChild>
            <Link href="/designs">
              Explore More Designs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
