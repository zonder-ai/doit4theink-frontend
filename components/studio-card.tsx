"use client"

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, User, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getInitials } from '@/lib/utils'

interface StudioCardProps {
  id: string
  name: string
  logoUrl?: string
  description?: string
  location?: string
  address?: string
  artistCount?: number
  isVerified?: boolean
  website?: string
  instagram?: string
}

export default function StudioCard({
  id,
  name,
  logoUrl,
  description,
  location,
  address,
  artistCount,
  isVerified = false,
  website,
  instagram
}: StudioCardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [imageError, setImageError] = useState(!logoUrl)
  
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow dark:bg-gray-950 dark:border-gray-800">
      <div className="relative h-40 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700">
        {logoUrl && !imageError ? (
          <>
            <div className={`absolute inset-0 bg-gray-200 dark:bg-gray-800 ${isLoading ? 'block' : 'hidden'}`} />
            <Image
              src={logoUrl}
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
        
        {/* Verification Badge */}
        {isVerified && (
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-100">
              Verified
            </span>
          </div>
        )}
      </div>
      
      <div className="flex flex-col p-4">
        <Link href={`/studios/${id}`}>
          <h3 className="text-xl font-semibold hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>
        
        <div className="mt-1 flex flex-wrap gap-y-1">
          {location && (
            <div className="mr-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
              <MapPin className="mr-1 h-3.5 w-3.5" />
              <span>{location}</span>
            </div>
          )}
          
          {artistCount !== undefined && (
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <User className="mr-1 h-3.5 w-3.5" />
              <span>{artistCount} {artistCount === 1 ? 'Artist' : 'Artists'}</span>
            </div>
          )}
        </div>
        
        {description && (
          <p className="mt-3 line-clamp-3 text-sm text-gray-600 dark:text-gray-300">
            {description}
          </p>
        )}
        
        {/* External Links */}
        <div className="mt-3 flex gap-2">
          {website && (
            <a 
              href={website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-gray-500 hover:text-primary dark:text-gray-400"
            >
              <ExternalLink className="mr-1 h-3.5 w-3.5" />
              Website
            </a>
          )}
          
          {instagram && (
            <a 
              href={`https://instagram.com/${instagram}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-gray-500 hover:text-primary dark:text-gray-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1 h-3.5 w-3.5"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
              Instagram
            </a>
          )}
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <Button variant="outline" asChild>
            <Link href={`/studios/${id}`}>
              View Studio
            </Link>
          </Button>
          
          <Button asChild>
            <Link href={`/studios/${id}/artists`}>
              See Artists
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}