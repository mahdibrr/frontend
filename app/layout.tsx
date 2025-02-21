"use client"

import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  RedirectToSignIn,
  useUser
} from '@clerk/nextjs'
import './globals.css'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Film, Heart, Home, Search, Users, Menu, X, Sun, Moon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, Switch } from "./page"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter() // Initialize router
  const [darkMode, setDarkMode] = useState(true) // Initialize dark mode state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) 

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <ClerkProvider
      afterSignInUrl="/"
      afterSignUpUrl="/"
      afterSignOutUrl="/signin"
    >
      <AuthWrapper>
        <html lang="en">
          <body>
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
            <SignedIn>
            <div className="min-h-screen bg-background text-foreground">
      <header className="bg-primary text-primary-foreground sticky top-0 z-10 shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Film className="h-8 w-8" />
            <h1 className="text-2xl font-bold">MoodMatch Films</h1>
          </div>
          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex space-x-4">
              <Button variant="ghost" onClick={() =>router.push('/')}><Home className="h-4 w-4 mr-2" />Home</Button>
              <Button variant="ghost" onClick={() => router.push('/liked-movies')}><Heart className="h-4 w-4 mr-2" />Liked Movies</Button>
              <Button variant="ghost" onClick={() => router.push('/search-similar')}><Search className="h-4 w-4 mr-2" />Search Similar</Button>
              <Button variant="ghost" onClick={() => router.push('/describe')}><Search className="h-4 w-4 mr-2" />Describe</Button>
              <Button variant="ghost"><Users className="h-4 w-4 mr-2" />Community</Button>
              <SignedOut>
                <SignInButton />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </nav>
          
            <div className="flex items-center space-x-2">
              <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
              {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </div>
            <button className="md:hidden" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
        </div>
          </div>
        
      </header>

      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3 }}
            className="fixed inset-y-0 left-0 z-20 w-64 bg-primary text-primary-foreground shadow-lg md:hidden"
          >
            <div className="p-4 space-y-4">
              <Button variant="ghost" onClick={() => { router.push('/'); setIsSidebarOpen(false); }}><Home className="h-4 w-4 mr-2" />Home</Button>
              <Button variant="ghost" onClick={() => { router.push('/liked-movies'); setIsSidebarOpen(false); }}><Heart className="h-4 w-4 mr-2" />Liked Movies</Button>
              <Button variant="ghost" onClick={() => { router.push('/search-similar'); setIsSidebarOpen(false); }}><Search className="h-4 w-4 mr-2" />Search Similar</Button>
              <Button variant="ghost" onClick={() => { router.push('/describe'); setIsSidebarOpen(false); }}><Search className="h-4 w-4 mr-2" />Describe</Button>
              <Button variant="ghost"><Users className="h-4 w-4 mr-2" />Community</Button>
              <SignedOut>
                <SignInButton />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {children}
      <footer className="bg-muted py-6 ">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 MoodMatch Films. All rights reserved.</p>
        </div>
      </footer>
    </div>
              
            </SignedIn>
          </body>
        </html>
      </AuthWrapper>
    </ClerkProvider>
  )
}

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isSignedIn, isLoaded } = useUser()

  useEffect(() => {
    if(!isLoaded) return
    if (!isSignedIn) {
      router.push('/signin')
    }
  }, [isSignedIn, router, isLoaded])

  return <>{children}</>
}