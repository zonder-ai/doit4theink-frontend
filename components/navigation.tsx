"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, User, Search, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { type User as SupabaseUser } from '@supabase/supabase-js'

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    async function getUser() {
      setIsLoading(true)
      
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getUser()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/designs', label: 'Designs' },
    { href: '/artists', label: 'Artists' },
    { href: '/studios', label: 'Studios' },
  ]

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <header className="border-b bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2" onClick={closeMenu}>
              <span className="text-xl font-bold">DoIt4TheInk</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <ul className="flex space-x-6">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className={`hover:text-primary ${
                      pathname === link.href ? 'font-medium text-primary' : 'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/search">
                <Search className="h-5 w-5" />
              </Link>
            </Button>
            
            {isLoading ? (
              <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse"></div>
            ) : user ? (
              <Button variant="outline" asChild>
                <Link href="/dashboard">
                  <User className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/auth/signin">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <nav>
              <ul className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href}
                      className={`block py-2 hover:text-primary ${
                        pathname === link.href ? 'font-medium text-primary' : 'text-gray-600 dark:text-gray-300'
                      }`}
                      onClick={closeMenu}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link 
                    href="/search"
                    className="flex items-center py-2 text-gray-600 dark:text-gray-300 hover:text-primary"
                    onClick={closeMenu}
                  >
                    <Search className="h-5 w-5 mr-2" />
                    Search
                  </Link>
                </li>
                {user ? (
                  <li>
                    <Link 
                      href="/dashboard"
                      className="flex items-center py-2 text-gray-600 dark:text-gray-300 hover:text-primary"
                      onClick={closeMenu}
                    >
                      <User className="h-5 w-5 mr-2" />
                      Dashboard
                    </Link>
                  </li>
                ) : (
                  <li>
                    <Link 
                      href="/auth/signin"
                      className="flex items-center py-2 text-gray-600 dark:text-gray-300 hover:text-primary"
                      onClick={closeMenu}
                    >
                      <LogIn className="h-5 w-5 mr-2" />
                      Sign In
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}