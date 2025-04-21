"use client"

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { Tag, MapPin, User, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DesignCardProps {
  id: string
  title: string
  imageUrl: string
  price: number
  depositAmount: number
  artistName: string
  studioName?: string
  location?: string
  styles?: string[]
  isFlash?: boolean
  isCustom?: boolean
  isColor?: boolean
}

export default function DesignCard({
  id,
  title,
  imageUrl,
  price,
  depositAmount,
  artistName,
  studioName,
  location,
  styles = [],
  isFlash = false,
  isCustom = false,
  isColor = false
}: DesignCardProps) {
  const [isLoading, setIsLoading] = useState(true)
  
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow dark:bg-gray-950 dark:border-gray-800">
      <Link href={`/designs/${id}`} className="relative aspect-square overflow-hidden">
        <div className={`absolute inset-0 bg-gray-200 dark:bg-gray-800 ${isLoading ? 'block' : 'hidden'}`} />
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform group-hover:scale-105"
          onLoadingComplete={() => setIsLoading(false)}
        />
        
        {/* Design Type Badges */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          {isFlash && (
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-100">
              Flash
            </span>
          )}
          {isCustom && (
            <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-100">
              Custom
            </span>
          )}
          {isColor && (
            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
              Color
            </span>
          )}
        </div>
      </Link>
      
      <div className="flex flex-col p-4">
        <Link href={`/designs/${id}`}>
          <h3 className="line-clamp-1 text-base font-medium hover:text-primary transition-colors">
            {title}
          </h3>
        </Link>
        
        <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
          <User className="mr-1 h-3.5 w-3.5" />
          <Link href={`/artists/${id}`} className="hover:text-primary transition-colors">
            {artistName}
          </Link>
          {studioName && (
            <>
              <span className="mx-1">•</span>
              <Link href={`/studios/${id}`} className="hover:text-primary transition-colors">
                {studioName}
              </Link>
            </>
          )}
        </div>
        
        {location && (
          <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
            <MapPin className="mr-1 h-3.5 w-3.5" />
            <span>{location}</span>
          </div>
        )}
        
        {styles.length > 0 && (
          <div className="mt-2 flex items-start">
            <Tag className="mr-1 h-3.5 w-3.5 text-gray-500 dark:text-gray-400 mt-0.5" />
            <div className="flex flex-wrap gap-1">
              {styles.map((style, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                >
                  {style}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatCurrency(price)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {depositAmount > 0 && `${formatCurrency(depositAmount)} deposit`}
            </p>
          </div>
          
          <Button variant="outline" size="sm" asChild>
            <Link href={`/designs/${id}`}>
              <Info className="mr-2 h-4 w-4" />
              Details
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}