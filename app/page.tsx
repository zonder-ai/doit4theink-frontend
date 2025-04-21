import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-900 to-black text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">DoIt4TheInk</h1>
            <p className="text-xl mb-8">Connect with talented tattoo artists, discover unique designs, and book your next tattoo with ease.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/designs">Browse Designs</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/artists">Find Artists</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-primary text-4xl mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2">Discover Designs</h3>
              <p className="text-gray-600">Browse through thousands of unique tattoo designs from artists around the world.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-primary text-4xl mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2">Book an Appointment</h3>
              <p className="text-gray-600">Secure your slot by paying a deposit through our secure payment system.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-primary text-4xl mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2">Get Inked</h3>
              <p className="text-gray-600">Visit the studio on your scheduled date and get your dream tattoo.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get inked?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Join thousands of tattoo enthusiasts who have found their perfect design through DoIt4TheInk.</p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/auth/signup">Create an Account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-gray-300">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">DoIt4TheInk</h3>
              <p>Connecting tattoo artists and clients worldwide.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Explore</h4>
              <ul className="space-y-2">
                <li><Link href="/designs" className="hover:text-white">Designs</Link></li>
                <li><Link href="/artists" className="hover:text-white">Artists</Link></li>
                <li><Link href="/studios" className="hover:text-white">Studios</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <p>&copy; {new Date().getFullYear()} DoIt4TheInk. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}