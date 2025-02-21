'use client'

import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <SignIn path="/signin" routing="path" signUpUrl="/signup" />
    </div>
  )
}
