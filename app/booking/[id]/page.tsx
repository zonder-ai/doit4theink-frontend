"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, Calendar, Clock, User, MapPin, ArrowRight, CreditCard, CheckCircle, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { fetchArtistById, fetchDesignById } from '@/lib/supabase'
import { formatCurrency, formatDate, getInitials } from '@/lib/utils'

export default function BookingPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const designId = searchParams.get('design')
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [artist, setArtist] = useState<any>(null)
  const [design, setDesign] = useState<any>(null)
  const [isCustomDesign, setIsCustomDesign] = useState(designId ? false : true)
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [availableSlots, setAvailableSlots] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  
  // Form state
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<any | null>(null)
  const [designNotes, setDesignNotes] = useState('')
  const [depositAmount, setDepositAmount] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)
  
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true)
      
      try {
        // Check authentication
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          // Not authenticated, redirect to sign in with a return URL
          router.push(`/auth/signin?redirect=${encodeURIComponent(`/booking/${params.id}${designId ? `?design=${designId}` : ''}`)}`);
          return
        }
        
        setUser(user)
        
        // Fetch user's profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (profileData) {
          setProfile(profileData)
          
          // Fetch client profile if user is a client
          if (profileData.user_type === 'client') {
            const { data: clientData } = await supabase
              .from('client_profiles')
              .select('*')
              .eq('id', user.id)
              .single()
            
            if (clientData) {
              setProfile({ ...profileData, ...clientData })
            }
          } else {
            // Not a client, redirect to profile creation
            router.push('/profile/create?type=client')
            return
          }
        }
        
        // Fetch artist data
        const artistData = await fetchArtistById(params.id)
        
        if (!artistData) {
          // Artist not found, redirect to artists page
          router.push('/artists')
          return
        }
        
        setArtist(artistData)
        
        // Fetch design if specified
        if (designId) {
          const designData = await fetchDesignById(designId)
          
          if (designData && designData.artist_id === params.id) {
            setDesign(designData)
            setDepositAmount(designData.deposit_amount || 0)
            setTotalAmount(designData.base_price || 0)
          }
        }
        
        // Fetch available dates (next 30 days)
        const today = new Date()
        const nextMonth = new Date(today)
        nextMonth.setDate(today.getDate() + 30)
        
        const { data: availabilities } = await supabase
          .rpc('get_artist_availability', {
            p_artist_id: params.id,
            p_start_date: today.toISOString().split('T')[0],
            p_end_date: nextMonth.toISOString().split('T')[0],
            p_include_bookings: true
          })
        
        if (availabilities) {
          // Extract unique dates that have available slots
          const dates = Array.from(new Set(availabilities.map((a: any) => a.date)))
          setAvailableDates(dates)
        }
      } catch (error) {
        console.error('Error loading booking data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadInitialData()
  }, [params.id, designId, router])
  
  // Load available time slots when a date is selected
  useEffect(() => {
    const loadTimeSlots = async () => {
      if (!selectedDate || !artist) return
      
      try {
        const { data: slots } = await supabase
          .rpc('get_available_slots', {
            p_artist_id: artist.id,
            p_date: selectedDate,
            p_slot_duration_minutes: design ? (design.estimated_hours || 1) * 60 : 60
          })
        
        if (slots) {
          setAvailableSlots(slots)
        }
      } catch (error) {
        console.error('Error loading time slots:', error)
      }
    }
    
    loadTimeSlots()
  }, [selectedDate, artist, design])
  
  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setSelectedTimeSlot(null) // Reset time slot when date changes
  }
  
  const handleTimeSlotSelect = (slot: any) => {
    setSelectedTimeSlot(slot)
  }
  
  const handleNextStep = () => {
    // Validate current step
    if (currentStep === 1) {
      if (!selectedDate || !selectedTimeSlot) {
        alert('Please select a date and time slot')
        return
      }
    } else if (currentStep === 2) {
      if (isCustomDesign && !designNotes) {
        alert('Please provide details about your design')
        return
      }
      
      if (!depositAmount || depositAmount <= 0) {
        alert('Invalid deposit amount')
        return
      }
    }
    
    setCurrentStep(currentStep + 1)
  }
  
  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1)
  }
  
  const handleSubmitBooking = async () => {
    try {
      // In a real app, this would connect to Stripe to process payment
      // Then create the booking record in Supabase
      
      // For demo purposes, we'll just simulate success
      
      // Create booking through Supabase RPC function
      const { data, error } = await supabase
        .rpc('create_booking_with_payment', {
          p_client_id: user.id,
          p_artist_id: artist.id,
          p_studio_id: artist.primary_studio_id,
          p_design_id: design?.id || null,
          p_booking_date: selectedDate,
          p_start_time: selectedTimeSlot.start_time,
          p_end_time: selectedTimeSlot.end_time,
          p_total_price: totalAmount,
          p_deposit_amount: depositAmount,
          p_notes: designNotes || null,
          p_stripe_payment_intent_id: 'pi_simulated_' + Math.random().toString(36).substring(2)
        })
      
      if (error) {
        throw error
      }
      
      // Redirect to success page or dashboard
      router.push('/booking/success')
    } catch (error) {
      console.error('Error booking appointment:', error)
      alert('Failed to book appointment. Please try again.')
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }
  
  if (!artist) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Artist not found</h1>
        <p className="mb-6">The artist you're trying to book is not available.</p>
        <Button asChild>
          <Link href="/artists">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Browse Artists
          </Link>
        </Button>
      </div>
    )
  }
  
  if (!user || !profile) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Authentication required</h1>
        <p className="mb-6">Please sign in to book an appointment.</p>
        <Button asChild>
          <Link href={`/auth/signin?redirect=${encodeURIComponent(`/booking/${params.id}${designId ? `?design=${designId}` : ''}`)}`}>
            Sign In
          </Link>
        </Button>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href={design ? `/designs/${design.id}` : `/artists/${artist.id}`}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Book an Appointment</h1>
      </div>
      
      {/* Booking Steps */}
      <div className="mb-8">
        <div className="flex items-center">
          <div className={`relative flex items-center justify-center w-8 h-8 rounded-full ${
            currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-gray-200 text-gray-600'
          }`}>
            <Calendar className="h-4 w-4" />
            {currentStep > 1 && (
              <CheckCircle className="absolute -top-1 -right-1 h-4 w-4 bg-white rounded-full text-green-500" />
            )}
          </div>
          <div className={`flex-1 h-1 mx-2 ${
            currentStep >= 2 ? 'bg-primary' : 'bg-gray-200'
          }`}></div>
          <div className={`relative flex items-center justify-center w-8 h-8 rounded-full ${
            currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-gray-200 text-gray-600'
          }`}>
            <Pencil className="h-4 w-4" />
            {currentStep > 2 && (
              <CheckCircle className="absolute -top-1 -right-1 h-4 w-4 bg-white rounded-full text-green-500" />
            )}
          </div>
          <div className={`flex-1 h-1 mx-2 ${
            currentStep >= 3 ? 'bg-primary' : 'bg-gray-200'
          }`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            currentStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-gray-200 text-gray-600'
          }`}>
            <CreditCard className="h-4 w-4" />
          </div>
        </div>
        <div className="flex text-sm mt-2">
          <div className="flex-1 text-center">Schedule</div>
          <div className="flex-1 text-center">Details</div>
          <div className="flex-1 text-center">Payment</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Booking Form */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-gray-950 rounded-lg border shadow-sm overflow-hidden">
            {/* Step 1: Date & Time Selection */}
            {currentStep === 1 && (
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Select Date & Time</h2>
                
                {/* Date Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Available Dates</label>
                  {availableDates.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {availableDates.map((date) => {
                        const dateObj = new Date(date)
                        const isSelected = selectedDate === date
                        
                        return (
                          <button
                            key={date}
                            className={`flex flex-col items-center p-2 rounded-md border ${
                              isSelected 
                                ? 'bg-primary text-primary-foreground border-primary' 
                                : 'hover:bg-gray-50 dark:hover:bg-gray-900'
                            }`}
                            onClick={() => handleDateSelect(date)}
                          >
                            <span className="text-xs font-medium">
                              {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                            </span>
                            <span className="text-lg font-bold">
                              {dateObj.getDate()}
                            </span>
                            <span className="text-xs">
                              {dateObj.toLocaleDateString('en-US', { month: 'short' })}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 border border-dashed rounded-lg">
                      <p className="text-gray-500 dark:text-gray-400">
                        No available dates found for the next 30 days.
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Time Slot Selection */}
                {selectedDate && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Available Time Slots for {formatDate(selectedDate)}
                    </label>
                    {availableSlots.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {availableSlots.map((slot, index) => {
                          const isSelected = selectedTimeSlot && 
                            selectedTimeSlot.start_time === slot.start_time && 
                            selectedTimeSlot.end_time === slot.end_time
                          
                          return (
                            <button
                              key={index}
                              className={`p-2 rounded-md border text-center ${
                                isSelected 
                                  ? 'bg-primary text-primary-foreground border-primary' 
                                  : 'hover:bg-gray-50 dark:hover:bg-gray-900'
                              }`}
                              onClick={() => handleTimeSlotSelect(slot)}
                            >
                              <div className="flex items-center justify-center">
                                <Clock className="h-3.5 w-3.5 mr-1" />
                                <span>
                                  {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                                </span>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 border border-dashed rounded-lg">
                        <p className="text-gray-500 dark:text-gray-400">
                          No available time slots for this date.
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="mt-8 flex justify-end">
                  <Button 
                    onClick={handleNextStep}
                    disabled={!selectedDate || !selectedTimeSlot}
                  >
                    Next Step
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            
            {/* Step 2: Design Details */}
            {currentStep === 2 && (
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Design Details</h2>
                
                {/* Design Type Selection */}
                {!designId && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Type of Tattoo</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        className={`p-3 rounded-md border text-center ${
                          isCustomDesign 
                            ? 'bg-primary text-primary-foreground border-primary' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-900'
                        }`}
                        onClick={() => setIsCustomDesign(true)}
                      >
                        Custom Design
                      </button>
                      <button
                        className={`p-3 rounded-md border text-center ${
                          !isCustomDesign 
                            ? 'bg-primary text-primary-foreground border-primary' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-900'
                        }`}
                        onClick={() => setIsCustomDesign(false)}
                      >
                        Browse Portfolio
                      </button>
                    </div>
                    {!isCustomDesign && (
                      <div className="mt-2 text-center">
                        <Link 
                          href={`/designs?artist=${artist.id}`} 
                          className="text-sm text-primary hover:text-primary/80"
                        >
                          View available designs
                        </Link>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Selected Design Info */}
                {design && (
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex">
                      {design.design_images?.[0]?.image_url ? (
                        <div className="relative w-20 h-20 rounded-md overflow-hidden mr-4">
                          <Image
                            src={design.design_images[0].image_url}
                            alt={design.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-md mr-4 flex items-center justify-center">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium">{design.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {design.is_flash ? 'Flash Design' : 'Custom Design'}
                          {design.is_color && ' • Color'}
                        </p>
                        <div className="mt-1 flex">
                          <span className="font-medium">
                            {formatCurrency(design.base_price || 0)}
                          </span>
                          <span className="mx-1">•</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {design.estimated_hours || 1} {(design.estimated_hours || 1) === 1 ? 'hour' : 'hours'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Custom Design Details */}
                {(isCustomDesign || !design) && (
                  <div className="mb-6">
                    <label htmlFor="design-notes" className="block text-sm font-medium mb-2">
                      Describe Your Design
                    </label>
                    <textarea
                      id="design-notes"
                      rows={5}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Describe your tattoo idea, including size, style, placement, and any reference images. The more details you provide, the better!"
                      value={designNotes}
                      onChange={(e) => setDesignNotes(e.target.value)}
                    ></textarea>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      You can discuss your design in more detail with the artist after booking.
                    </p>
                  </div>
                )}
                
                {/* Deposit Amount */}
                <div className="mb-6">
                  <label htmlFor="deposit-amount" className="block text-sm font-medium mb-2">
                    Deposit Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3">$</span>
                    <input
                      id="deposit-amount"
                      type="number"
                      className="w-full pl-7 pr-3 py-2 border rounded-md"
                      min="0"
                      step="10"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(Number(e.target.value))}
                      readOnly={!!design}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    The deposit secures your appointment and will be applied to your final cost.
                  </p>
                </div>
                
                {/* Estimated Total */}
                <div className="mb-6">
                  <label htmlFor="total-amount" className="block text-sm font-medium mb-2">
                    Estimated Total
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3">$</span>
                    <input
                      id="total-amount"
                      type="number"
                      className="w-full pl-7 pr-3 py-2 border rounded-md"
                      min={depositAmount}
                      step="10"
                      value={totalAmount}
                      onChange={(e) => setTotalAmount(Number(e.target.value))}
                      readOnly={!!design}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    This is an estimate. The final price may vary based on the complexity and time required.
                  </p>
                </div>
                
                <div className="mt-8 flex justify-between">
                  <Button variant="outline" onClick={handlePreviousStep}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button 
                    onClick={handleNextStep}
                    disabled={isCustomDesign && !designNotes}
                  >
                    Next Step
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            
            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Review & Payment</h2>
                
                {/* Summary */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <h3 className="font-medium mb-2">Booking Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Date</span>
                      <span className="font-medium">{formatDate(selectedDate || '')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Time</span>
                      <span className="font-medium">
                        {selectedTimeSlot?.start_time.slice(0, 5)} - {selectedTimeSlot?.end_time.slice(0, 5)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Artist</span>
                      <span className="font-medium">{artist.artist_name || 'Artist'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Design</span>
                      <span className="font-medium">
                        {design ? design.title : (isCustomDesign ? 'Custom Design' : 'Selected from portfolio')}
                      </span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Deposit (due now)</span>
                        <span className="font-medium">{formatCurrency(depositAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Remaining (due at appointment)</span>
                        <span className="font-medium">{formatCurrency(totalAmount - depositAmount)}</span>
                      </div>
                      <div className="flex justify-between font-semibold mt-2 pt-2 border-t">
                        <span>Total</span>
                        <span>{formatCurrency(totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Payment Form */}
                <div className="mb-6">
                  <h3 className="font-medium mb-4">Payment Information</h3>
                  
                  {/* In a real app, this would be a Stripe Elements form */}
                  {/* For demo purposes, we're using a simplified form */}
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="card-name" className="block text-sm font-medium mb-1">
                        Name on Card
                      </label>
                      <input
                        id="card-name"
                        type="text"
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="John Doe"
                        value={profile.full_name || ''}
                      />
                    </div>
                    <div>
                      <label htmlFor="card-number" className="block text-sm font-medium mb-1">
                        Card Number
                      </label>
                      <input
                        id="card-number"
                        type="text"
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="1234 5678 9012 3456"
                        defaultValue="4242 4242 4242 4242"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="card-expiry" className="block text-sm font-medium mb-1">
                          Expiration Date
                        </label>
                        <input
                          id="card-expiry"
                          type="text"
                          className="w-full px-3 py-2 border rounded-md"
                          placeholder="MM/YY"
                          defaultValue="12/25"
                        />
                      </div>
                      <div>
                        <label htmlFor="card-cvc" className="block text-sm font-medium mb-1">
                          CVC
                        </label>
                        <input
                          id="card-cvc"
                          type="text"
                          className="w-full px-3 py-2 border rounded-md"
                          placeholder="123"
                          defaultValue="123"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                    Your payment information is processed securely. We do not store your credit card details.
                  </p>
                </div>
                
                {/* Terms */}
                <div className="mb-6">
                  <div className="flex items-start">
                    <input
                      id="terms"
                      type="checkbox"
                      className="mt-1"
                      defaultChecked
                    />
                    <label htmlFor="terms" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      I agree to the booking terms and conditions, including the cancellation policy.
                      I understand that my deposit is non-refundable if I cancel less than 48 hours before my appointment.
                    </label>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-between">
                  <Button variant="outline" onClick={handlePreviousStep}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={handleSubmitBooking}>
                    Pay Deposit & Book Appointment
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Booking Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-950 rounded-lg border shadow-sm p-6 mb-6">
            <div className="flex items-start mb-4">
              {artist.profile_image_url ? (
                <div className="relative w-12 h-12 rounded-full overflow-hidden mr-3">
                  <Image
                    src={artist.profile_image_url}
                    alt={artist.artist_name || 'Artist'}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center mr-3">
                  <span className="text-lg font-semibold text-gray-500 dark:text-gray-400">
                    {getInitials(artist.artist_name || 'Artist')}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-medium">
                  {artist.artist_name || 'Artist'}
                </h3>
                {artist.years_experience && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {artist.years_experience} years experience
                  </p>
                )}
              </div>
            </div>
            
            {artist.studios && (
              <div className="flex items-start mb-4 text-sm text-gray-600 dark:text-gray-400">
                <User className="h-4 w-4 mr-2 mt-0.5" />
                <div>
                  Artist at{' '}
                  <Link 
                    href={`/studios/${artist.studios.id}`}
                    className="text-primary hover:text-primary/80"
                  >
                    {artist.studios.name}
                  </Link>
                </div>
              </div>
            )}
            
            {(artist.city || (artist.studios && artist.studios.city)) && (
              <div className="flex items-start mb-4 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                <div>
                  {artist.city || artist.studios.city}
                  {(artist.state || artist.studios.state) && `, ${artist.state || artist.studios.state}`}
                </div>
              </div>
            )}
            
            {/* Selected Date & Time */}
            {selectedDate && selectedTimeSlot && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                <h3 className="font-medium mb-2">Selected Appointment</h3>
                <div className="flex items-center mb-2 text-gray-700 dark:text-gray-300">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{formatDate(selectedDate)}</span>
                </div>
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>
                    {selectedTimeSlot.start_time.slice(0, 5)} - {selectedTimeSlot.end_time.slice(0, 5)}
                  </span>
                </div>
              </div>
            )}
            
            {/* Deposit Information */}
            {depositAmount > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                <h3 className="font-medium mb-2">Booking Cost</h3>
                <div className="mb-1 flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Deposit (due now):</span>
                  <span className="font-medium">{formatCurrency(depositAmount)}</span>
                </div>
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Remaining (due at appointment):</span>
                  <span className="font-medium">{formatCurrency(totalAmount - depositAmount)}</span>
                </div>
              </div>
            )}
            
            {/* Cancellation Policy */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
              <h3 className="font-medium mb-2">Cancellation Policy</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your deposit is fully refundable if you cancel more than 48 hours before your appointment.
                Cancellations with less than 48 hours notice are non-refundable.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}