"use client"

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from './auth-provider'

export function AuthRedirect() {
  const { user, loading, refresh } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const redirectAttempted = useRef(false)
  
  useEffect(() => {
    // Debug logging
    console.log("[AuthRedirect] Current state:", { 
      user: user ? `${user.name} (${user.role})` : 'not logged in',
      loading, 
      pathname,
      redirectAttempted: redirectAttempted.current
    });
    
    // Clear redirectAttempted flag when pathname changes
    if (redirectAttempted.current && pathname) {
      redirectAttempted.current = false;
    }
    
    // Don't do anything during loading
    if (loading) {
      console.log("[AuthRedirect] Still loading auth state, waiting...");
      return;
    }

    // List of public paths that don't require authentication
    const publicPaths = ['/', '/login', '/register', '/catalog', '/redeem-coupon']
    const isPublicPath = publicPaths.includes(pathname) || pathname?.startsWith('/catalog')

    // Handle not logged in users
    if (!user) {
      // Only redirect if they're trying to access a protected page
      if (!isPublicPath && !redirectAttempted.current) {
        console.log('[AuthRedirect] Not authenticated, redirecting to login')
        redirectAttempted.current = true;
        
        // Use window.location for a hard redirect
        window.location.href = '/login';
      }
      return
    }

    // Handle user role redirects
    const role = user.role
    const rolePath = `/${role.replace('_', '-')}`
    
    // Check if user is on the correct role-specific path
    const isOnCorrectRolePath = pathname === rolePath || pathname.startsWith(`${rolePath}/`)
    const isOnAuthPage = pathname === '/login' || pathname === '/register'

    // If user is logged in and on an auth page, redirect to their dashboard
    if (isOnAuthPage && !redirectAttempted.current) {
      console.log(`[AuthRedirect] Logged in user on auth page, redirecting to ${rolePath}`)
      redirectAttempted.current = true;
      
      // Use window.location for a hard redirect to avoid Next.js router issues
      window.location.href = rolePath;
      return
    }

    // If user is not on their role-specific page (except homepage which is allowed)
    if (!isOnCorrectRolePath && pathname !== '/' && !redirectAttempted.current) {
      console.log(`[AuthRedirect] User role ${role} on incorrect path ${pathname}, redirecting to ${rolePath}`)
      redirectAttempted.current = true;
      
      // Use window.location for a hard redirect
      window.location.href = rolePath;
    }
  }, [user, loading, pathname, router])

  // Periodically refresh the auth state when active
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        refresh();
      }
    }, 60000); // Refresh every minute
    
    return () => clearInterval(interval);
  }, [refresh, loading]);

  return null
}

function redirectToRolePage(role: string, router: any) {
  switch (role) {
    case 'superadmin':
      router.push('/superadmin')
      break
    case 'company_admin':
      router.push('/company-admin')
      break
    case 'employee':
      router.push('/employee')
      break
    default:
      router.push('/')
  }
}
