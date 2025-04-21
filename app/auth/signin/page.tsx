"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function SignInPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true)
      
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          setIsAuthenticated(true)
          // Redirect to dashboard if already signed in
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuth()
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          router.push('/dashboard')
        }
      }
    )
    
    return () => {
      subscription.unsubscribe()
    }
  }, [router])
  
  if (isLoading || isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
      
      <div className="max-w-md mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Sign In</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Welcome back to DoIt4TheInk!
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 border">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'rgb(var(--primary))',
                    brandAccent: 'rgb(var(--primary))',
                  },
                },
              },
              style: {
                button: {
                  borderRadius: '0.375rem',
                  height: '2.5rem',
                },
                input: {
                  borderRadius: '0.375rem',
                },
                container: {
                  padding: '0',
                }
              },
            }}
            providers={['google', 'facebook']}
            redirectTo={`${window.location.origin}/auth/callback`}
            magicLink={true}
            showLinks={true}
            view="sign_in"
          />
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don&apos;t have an account?{' '}
              <Link 
                href="/auth/signup" 
                className="font-medium text-primary hover:text-primary/80"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}