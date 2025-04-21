"use client"

import Link from 'next/link'
import { CheckCircle, Calendar, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function BookingSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full text-green-600 dark:bg-green-900/50 dark:text-green-400 mb-6">
          <CheckCircle size={48} />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Booking Confirmed!</h1>
        
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
          Your appointment has been successfully booked. We've sent a confirmation
          email with all the details.
        </p>
        
        <div className="bg-white dark:bg-gray-950 rounded-lg border shadow-sm p-6 mb-8 text-left">
          <h2 className="text-xl font-semibold mb-4">What's Next?</h2>
          
          <div className="space-y-4">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold mr-3">
                1
              </div>
              <div>
                <h3 className="font-medium">Check your email</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  You should receive a confirmation email with all the details of your appointment.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold mr-3">
                2
              </div>
              <div>
                <h3 className="font-medium">Prepare for your appointment</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Make sure to eat before your appointment, stay hydrated, and get a good night's sleep.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold mr-3">
                3
              </div>
              <div>
                <h3 className="font-medium">Arrive on time</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Please arrive 15 minutes before your scheduled appointment.
                  Don't forget to bring a valid ID.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-950 rounded-lg border shadow-sm p-6 mb-8 text-left">
          <h2 className="text-xl font-semibold mb-4">Cancellation Policy</h2>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            If you need to cancel or reschedule your appointment:
          </p>
          <ul className="list-disc pl-5 mb-4 text-gray-700 dark:text-gray-300 space-y-2">
            <li>
              <strong>48+ hours notice:</strong> Your deposit will be fully refunded or can be applied to a rescheduled appointment.
            </li>
            <li>
              <strong>Less than 48 hours notice:</strong> Your deposit is non-refundable.
            </li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300">
            To cancel or reschedule, please contact the artist or studio directly, or use the dashboard options.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild>
            <Link href="/dashboard">
              <Calendar className="mr-2 h-4 w-4" />
              View My Bookings
            </Link>
          </Button>
          
          <Button variant="outline" asChild>
            <Link href="/">
              Return to Home
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}