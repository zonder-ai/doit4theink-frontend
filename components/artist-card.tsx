"use client"

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Star, CalendarClock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getInitials } from '@/lib/utils'

interface ArtistCardProps {
  id: string
  name: string
  imageUrl?: string
  bio?: string
  yearsExperience?: number
  avgRating?: number
  location?: string
  studioName?: string
  isIndependent?: boolean
}

export default function ArtistCard({
  id,
  name,
  imageUrl,
  bio,
  yearsExperience,
  avgRating,
  location,
  studioName,
  isIndependent = false
}: ArtistCardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [imageError, setImageError] = useState(!imageUrl)
  
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow dark:bg-gray-950 dark:border-gray-800">
      <div className="relative h-64 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700">
        {imageUrl && !imageError ? (
          <>
            <div className={`absolute inset-0 bg-gray-200 dark:bg-gray-800 ${isLoading ? 'block' : 'hidden'}`} />
            <Image
              src={imageUrl}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              onLoadingComplete={() => setIsLoading(false)}
              onError={() => setImageError(true)}
            />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
            <span className="text-6xl font-semibold text-gray-400 dark:text-gray-500">
              {getInitials(name)}
            </span>
          </div>
        )}
        
        {/* Artist Status Badge */}
        <div className="absolute top-2 left-2">
          {isIndependent ? (
            <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-100">
              Independent
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-100">
              Studio Artist
            </span>
          )}
        </div>
      </div>
      
      <div className="flex flex-col p-4">
        <Link href={`/artists/${id}`}>
          <h3 className="text-xl font-semibold hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>
        
        {studioName && !isIndependent && (
          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            <span>at </span>
            <Link href={`/studios/${id}`} className="hover:text-primary transition-colors">
              {studioName}
            </Link>
          </div>
        )}
        
        <div className="mt-1 flex flex-wrap gap-y-1">
          {location && (
            <div className="mr-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
              <MapPin className="mr-1 h-3.5 w-3.5" />
              <span>{location}</span>
            </div>
          )}
          
          {yearsExperience && (
            <div className="mr-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
              <CalendarClock className="mr-1 h-3.5 w-3.5" />
              <span>{yearsExperience} {yearsExperience === 1 ? 'year' : 'years'}</span>
            </div>
          )}
          
          {avgRating && (
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Star className="mr-1 h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span>{avgRating.toFixed(1)}</span>
            </div>
          )}
        </div>
        
        {bio && (
          <p className="mt-3 line-clamp-3 text-sm text-gray-600 dark:text-gray-300">
            {bio}
          </p>
        )}
        
        <div className="mt-4 flex items-center justify-between">
          <Button variant="outline" asChild>
            <Link href={`/artists/${id}`}>
              View Profile
            </Link>
          </Button>
          
          <Button asChild>
            <Link href={`/booking/${id}`}>
              Book Now
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}