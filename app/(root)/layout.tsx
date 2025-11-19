import Link from 'next/link'
import Image from 'next/image'
import React, { ReactNode } from 'react'
import { isAuthenticated } from '@/lib/actions/auth.action'
import { redirect } from 'next/navigation'

import Header from '@/components/Header'
import Footer from '@/components/Footer'

const RootLayout = async ({ children }: { children: ReactNode}) => {
  
  const isUserAuthenticated = await isAuthenticated();
  if(!isUserAuthenticated) redirect('/sign-in');

  return (
    <div className="min-h-screen flex flex-col bg-dark-100">
      {/* Professional Header */}
      <Header />
      
      {/* Main Content */}
      <main className="flex-1">
        <div className="root-layout">
          {children}
        </div>
      </main>
      
      {/* Professional Footer */}
      <Footer />
    </div>
  )
}

export default RootLayout